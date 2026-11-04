import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'
import type { Payload, PayloadRequest } from 'payload'
import { APIError } from 'payload'

import { isAdminOrManager, isStaff } from '../access/roles'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Recomputes how much an invoice has been paid and moves its status along.
 *
 * The sum is derived from the payment records rather than typed by hand, so a
 * deleted or corrected payment can never leave an invoice marked paid when the
 * money is not there. Drafts and cancelled documents are left alone: neither
 * is collectable.
 */
const refreshInvoicePayment = async (
  invoiceId: number | string | null | undefined,
  payload: Payload,
  req: PayloadRequest,
) => {
  if (!invoiceId) return

  const invoice = await payload.findByID({
    collection: 'facturi',
    id: invoiceId,
    depth: 0,
    req,
  })

  // A draft is not collectable, a cancelled one is void, and a storno hands
  // money back rather than taking it: none of the three has a payment cycle.
  if (invoice.status === 'ciorna' || invoice.status === 'anulata' || invoice.tip === 'storno') {
    return
  }

  const { docs } = await payload.find({
    collection: 'incasari',
    where: { factura: { equals: invoiceId } },
    limit: 1000,
    depth: 0,
    req,
  })

  const collected = round2(docs.reduce((s, p: any) => s + (Number(p.suma) || 0), 0))
  const total = Number(invoice.total) || 0

  // A hundredth of tolerance: rounding on a partial payment must not leave an
  // invoice one bani short of settled forever.
  const settled = collected >= total - 0.01

  await payload.update({
    collection: 'facturi',
    id: invoiceId,
    data: {
      sumaIncasata: collected,
      status: settled ? 'platita' : collected > 0 ? 'partial' : 'emisa',
    },
    req,
    // The only writer allowed to move an invoice between payment statuses.
    context: { internalStatus: true },
  })
}

/**
 * Refuses money that cannot honestly land on this invoice.
 *
 * Collecting more than an invoice asks for is not a payment, it is a credit
 * the client is owed, and there is nowhere to hold it yet. Silently accepting
 * it would show the invoice as settled while the books are short an
 * explanation for the difference.
 */
const validateAmount: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const invoiceId =
    typeof data.factura === 'object' ? data.factura?.id : (data.factura ?? originalDoc?.factura)
  const amount = Number(data.suma ?? originalDoc?.suma) || 0

  if (!invoiceId || amount <= 0) return data

  const invoice = await req.payload.findByID({
    collection: 'facturi',
    id: invoiceId,
    depth: 0,
    req,
  })

  if (invoice.tip === 'storno') {
    throw new APIError(
      'Un storno restituie bani, nu încasează. Înregistrează plata pe factură.',
      400,
    )
  }

  const { docs } = await req.payload.find({
    collection: 'incasari',
    where: { factura: { equals: invoiceId } },
    limit: 1000,
    depth: 0,
    req,
  })

  // Exclude this record when editing, otherwise its own amount counts twice.
  const others = docs
    .filter((p: any) => String(p.id) !== String(originalDoc?.id))
    .reduce((s, p: any) => s + (Number(p.suma) || 0), 0)

  const total = Number(invoice.total) || 0
  const remaining = round2(total - others)

  if (round2(others + amount) > total + 0.01) {
    throw new APIError(
      `Pe ${invoice.serie}-${invoice.numar} au mai rămas ${remaining} de încasat, nu ${amount}.`,
      400,
    )
  }

  return data
}

const afterPaymentChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const current = typeof doc.factura === 'object' ? doc.factura?.id : doc.factura
  const previous =
    typeof previousDoc?.factura === 'object' ? previousDoc?.factura?.id : previousDoc?.factura

  await refreshInvoicePayment(current, req.payload, req)
  // Moving a payment to another invoice must also settle the one it left.
  if (previous && previous !== current) await refreshInvoicePayment(previous, req.payload, req)

  return doc
}

const afterPaymentDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const id = typeof doc.factura === 'object' ? doc.factura?.id : doc.factura
  await refreshInvoicePayment(id, req.payload, req)
  return doc
}

export const Payments: CollectionConfig = {
  slug: 'incasari',
  labels: {
    singular: 'Încasare',
    plural: 'Încasări',
  },
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  admin: {
    useAsTitle: 'referinta',
    defaultColumns: ['data', 'factura', 'suma', 'metoda', 'referinta'],
    group: 'CRM',
    description: 'Banii intrați efectiv. Statusul facturii se calculează din ei.',
  },
  hooks: {
    beforeChange: [validateAmount],
    afterChange: [afterPaymentChange],
    afterDelete: [afterPaymentDelete],
  },
  fields: [
    {
      name: 'factura',
      type: 'relationship',
      relationTo: 'facturi',
      label: 'Factură',
      required: true,
      index: true,
      // A draft has no number, a cancelled invoice is void, and a storno
      // hands money back: none of the three can receive a payment.
      filterOptions: () => ({
        numar: { exists: true },
        status: { not_equals: 'anulata' },
        tip: { not_equals: 'storno' },
      }),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'suma',
          type: 'number',
          label: 'Sumă încasată',
          required: true,
          min: 0.01,
        },
        {
          name: 'data',
          type: 'date',
          label: 'Data încasării',
          required: true,
          index: true,
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'metoda',
          type: 'select',
          label: 'Metodă',
          required: true,
          defaultValue: 'transfer',
          options: [
            { label: 'Transfer bancar', value: 'transfer' },
            { label: 'Numerar', value: 'numerar' },
            { label: 'Card', value: 'card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Stripe', value: 'stripe' },
            { label: 'Altă metodă', value: 'alta' },
          ],
        },
        {
          name: 'referinta',
          type: 'text',
          label: 'Referință',
          admin: { description: 'Numărul tranzacției din extrasul bancar.' },
        },
      ],
    },
    {
      name: 'nota',
      type: 'textarea',
      label: 'Note interne',
    },
  ],
  timestamps: true,
}
