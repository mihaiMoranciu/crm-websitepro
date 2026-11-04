import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  FieldAccess,
  PayloadRequest,
} from 'payload'
import { APIError } from 'payload'

import { hasRole, isStaff } from '../access/roles'
import { unbilledTime } from '../endpoints/unbilledTime'
import { printInvoice } from '../endpoints/printInvoice'
import { stornoInvoice } from '../endpoints/stornoInvoice'
import { convertProforma } from '../endpoints/convertProforma'
import { markInvoiceSent } from '../endpoints/markInvoiceSent'
import { emailInvoice } from '../endpoints/emailInvoice'
import {
  downloadEfactura,
  checkEfacturaStatus,
  sendToAnaf,
  checkEfactura,
} from '../endpoints/efacturaAnaf'
import { issueDateInMonth, periodKey, type Frequency } from '../utilities/recurrence'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * An invoice freezes when it leaves the building, not when it gets a number.
 *
 * The number is only a reservation. What matters legally is the moment the
 * document reaches the client or the tax authority: until then it is still
 * ours to correct, which is what lets an extra hour be added to an invoice
 * already drawn up rather than forcing a second document on the client.
 *
 * Applied as field-level access rather than an admin flag, so it holds for the
 * REST API too, not only the panel. What stays open afterwards is the status,
 * so a sent invoice can still be marked paid or cancelled, and the note.
 */
const onlyBeforeSent: FieldAccess = ({ doc }) => !doc?.trimisa

/**
 * Fields only the server may write: the number, the sent flag, the collected
 * amount, the delivery log.
 *
 * `admin.readOnly` only greys a field out; the form still submits its value and
 * the REST API still accepts it. Without this, a form opened before a payment
 * or a send would write its stale copy back on the next save, and a plain PATCH
 * could unfreeze a sent invoice. Hooks and endpoints are unaffected: the Local
 * API skips field access unless asked not to.
 */
const deny: FieldAccess = () => false
const serverOnly = { create: deny, update: deny }

const idOf = (v: unknown): number | string | null | undefined =>
  v && typeof v === 'object' ? (v as { id?: number | string }).id : (v as number | string | null)

/**
 * Blocks the one status move that would undo the numbering.
 *
 * Letting a numbered invoice return to draft would either free its number for
 * reuse or leave a gap, both of which a fiscal audit reads as a missing
 * document. A mistake on an issued invoice is corrected by storno, never by
 * reopening it.
 */
const preventReturnToDraft: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  // A real transition, not merely a saved document that already sits in that
  // state. `data` holds only what this request sent, so everything else is
  // read from the stored document.
  const goingBack = originalDoc?.status !== 'ciorna' && data.status === 'ciorna'

  if (originalDoc?.numar && goingBack) {
    throw new APIError(
      `Factura ${originalDoc.serie}-${originalDoc.numar} este emisă și nu mai poate reveni la ciornă. Pentru corecție, stornează.`,
      400,
    )
  }
  return data
}

/**
 * Keeps the status a statement of fact rather than a dropdown.
 *
 * "Paid" and "partially paid" are derived from the payment records, and a
 * fiscal invoice is cancelled only by the storno that reverses it. Internal
 * writers announce themselves through `context.internalStatus`; everyone else
 * may only issue a draft, or cancel a proforma, which has no storno.
 */
const validateStatusTransition: CollectionBeforeChangeHook = ({ context, data, originalDoc }) => {
  const previous = originalDoc?.status ?? 'ciorna'
  const next = data.status

  if (!next || next === previous) return data

  if (previous === 'anulata') {
    throw new APIError('Factura este anulată și nu mai poate fi redeschisă.', 400)
  }

  if (context?.internalStatus) return data

  if (next === 'partial' || next === 'platita') {
    throw new APIError(
      'Statusul de plată se calculează din încasări. Înregistrează încasarea pe factură.',
      400,
    )
  }

  if (previous === 'partial' || previous === 'platita') {
    throw new APIError(
      'Statusul facturii s-a schimbat între timp. Reîncarcă pagina înainte să salvezi.',
      400,
    )
  }

  if (next === 'anulata' && (data.tip ?? originalDoc?.tip) !== 'proforma') {
    throw new APIError(
      originalDoc?.numar
        ? 'O factură emisă se anulează prin storno, nu din status.'
        : 'O ciornă nu se anulează, se șterge.',
      400,
    )
  }

  return data
}

/**
 * Refuses lines that charge for hours they have no right to.
 *
 * The ids on a line arrive from the browser, so they are checked rather than
 * trusted: every entry must exist, be billable, belong to this invoice's
 * project and not already sit on another invoice. Without this, two documents
 * can charge the same hours, and whichever is saved last quietly takes them
 * from the other.
 *
 * A proforma reserves nothing, so it may list hours that are still free to be
 * billed elsewhere; the check then bites when it is converted.
 */
const validateTimeEntries: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  if (data.deletedAt) return data

  // Coming back from the trash carries no lines, but claims them again.
  const restoring = Boolean(originalDoc?.deletedAt) && data.deletedAt === null
  const source = data.linii ?? (restoring ? originalDoc?.linii : undefined)
  if (!Array.isArray(source)) return data

  const status = data.status ?? originalDoc?.status
  const docType = data.tip ?? originalDoc?.tip
  if (status === 'anulata' || docType === 'storno') return data

  const ids: number[] = []
  for (const line of source) {
    for (const id of Array.isArray(line?.pontajIds) ? line.pontajIds : []) {
      const n = Number(id)
      if (n) ids.push(n)
    }
  }
  if (ids.length === 0) return data

  if (new Set(ids).size !== ids.length) {
    throw new APIError('Aceleași ore apar pe două linii ale facturii.', 400)
  }

  const projectId = idOf(data.proiect !== undefined ? data.proiect : originalDoc?.proiect)

  const { docs } = await req.payload.find({
    collection: 'pontaj',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
    req,
  })

  if (docs.length !== ids.length) {
    throw new APIError(
      'Unele ore de pe linii nu mai există în pontaj. Șterge liniile respective și adaugă-le din nou.',
      400,
    )
  }

  for (const p of docs as unknown as Record<string, any>[]) {
    const label = `„${p.descriere}”`

    if (String(idOf(p.proiect)) !== String(projectId)) {
      throw new APIError(`Orele ${label} sunt pontate pe alt proiect decât cel al facturii.`, 400)
    }
    if (!p.facturabil) {
      throw new APIError(`Orele ${label} nu sunt marcate ca facturabile.`, 400)
    }

    const billedOn = idOf(p.factura)
    if (docType !== 'proforma' && billedOn && String(billedOn) !== String(originalDoc?.id)) {
      throw new APIError(
        `Orele ${label} sunt deja facturate pe alt document. Șterge linia sau stornează documentul acela.`,
        400,
      )
    }
  }

  return data
}

/**
 * Totals are always recomputed on the server. Whatever the client sends for
 * line totals, VAT or the grand total is ignored, so a tampered request or a
 * stale form can never produce an invoice whose figures do not add up.
 *
 * Every input falls back to the stored document, because a partial update
 * (marking an invoice paid, say) carries only the changed fields. Reading
 * `data` alone would treat the missing lines as none and the missing rate as
 * zero, quietly wiping the amounts on an already issued invoice.
 */
const computeTotals: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const linesSource = data.linii ?? originalDoc?.linii
  const lines = Array.isArray(linesSource) ? linesSource : []

  const vatRate = Number(data.cotaTva ?? originalDoc?.cotaTva) || 0
  const reverseCharge = data.taxareInversa ?? originalDoc?.taxareInversa

  let subtotal = 0
  for (const line of lines) {
    const quantity = Number(line?.cantitate) || 0
    const price = Number(line?.pretUnitar) || 0
    line.total = round2(quantity * price)
    subtotal += line.total
  }

  // Write the lines back only when they were part of this request, so a
  // partial update does not resurrect rows the caller never mentioned.
  if (data.linii) data.linii = lines

  data.subtotal = round2(subtotal)
  // Reverse charge and non-VAT-payer clients get a zero VAT line, but the rate
  // still travels with the document for the audit trail.
  data.valoareTva = reverseCharge ? 0 : round2(subtotal * (vatRate / 100))
  data.total = round2(data.subtotal + data.valoareTva)

  return data
}

/**
 * Fiscal numbering must be gapless per series, so the number is assigned only
 * when the invoice actually leaves draft, never on create.
 *
 * MVP limitation: two invoices issued in the exact same instant could read the
 * same maximum. Fine for a single-user CRM; before multi-user issuing this
 * needs to move into a transaction or a counter on the settings global.
 */
const assignNumber: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const leavesDraft = data.status && data.status !== 'ciorna'
  const hasNumber = Boolean(originalDoc?.numar ?? data.numar)

  if (!leavesDraft || hasNumber) return data

  // A partial update (bulk edit, REST) carries the status alone, so the series
  // has to come from the stored document or the count runs on no series at all.
  const series = data.serie ?? originalDoc?.serie

  const last = await req.payload.find({
    collection: 'facturi',
    where: { serie: { equals: series } },
    sort: '-numar',
    limit: 1,
    depth: 0,
    trash: true, // cancelled invoices still consume their number
    req,
  })

  data.numar = (Number(last.docs[0]?.numar) || 0) + 1

  return data
}

/**
 * Builds the label every dropdown and relationship cell shows.
 *
 * `useAsTitle` takes a single stored field, so a document has to carry its own
 * description. Series alone made every invoice read as "WP"; number, client,
 * amount and date are what actually tell two of them apart when picking one
 * for a payment.
 */
const buildLabel: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const number = data.numar ?? originalDoc?.numar
  const series = data.serie ?? originalDoc?.serie
  const docType = data.tip ?? originalDoc?.tip

  const parts: string[] = [number ? `${series}-${number}` : `${series} (ciornă)`]

  if (docType === 'proforma') parts.push('proformă')
  if (docType === 'storno') parts.push('storno')

  const clientId =
    typeof data.client === 'object' ? data.client?.id : (data.client ?? originalDoc?.client)

  if (clientId) {
    try {
      const client = await req.payload.findByID({
        collection: 'clienti',
        id: typeof clientId === 'object' ? (clientId as any).id : clientId,
        depth: 0,
        req,
      })
      if (client?.nume) parts.push(String(client.nume))
    } catch {
      // A missing client must not stop the invoice from saving.
    }
  }

  const total = Number(data.total ?? originalDoc?.total)
  const currency = data.moneda ?? originalDoc?.moneda
  if (Number.isFinite(total)) parts.push(`${total.toFixed(2)} ${currency ?? ''}`.trim())

  const issueDate = data.dataEmitere ?? originalDoc?.dataEmitere
  if (issueDate) {
    const d = new Date(String(issueDate))
    if (!Number.isNaN(d.getTime())) parts.push(d.toLocaleDateString('ro-RO'))
  }

  data.eticheta = parts.join(' · ')

  return data
}

/**
 * Reconciles which hours belong to this invoice, using the lines as the single
 * source of truth.
 *
 * Each generated line carries the ids of the entries behind it, so deleting a
 * line releases exactly those hours and nothing else. Reconciling in both
 * directions on every save means the link can never drift from what the
 * document actually charges.
 */
const reconcileTimeEntries: CollectionAfterChangeHook = async ({ doc, req }) => {
  const lines = Array.isArray(doc.linii) ? doc.linii : []

  const wanted = new Set<number>()

  // A cancelled invoice charges for nothing, so its hours go back into the
  // pool, and so does a draft sitting in the trash. A proforma never charges
  // either: it is a payment request, and the hours are claimed by the fiscal
  // invoice it converts into.
  if (doc.status !== 'anulata' && doc.tip !== 'proforma' && !doc.deletedAt) {
    for (const line of lines) {
      const ids = Array.isArray(line?.pontajIds) ? line.pontajIds : []
      for (const id of ids) {
        const n = Number(id)
        if (n) wanted.add(n)
      }
    }
  }

  const { docs: linkedNow } = await req.payload.find({
    collection: 'pontaj',
    where: { factura: { equals: doc.id } },
    limit: 1000,
    depth: 0,
    req,
  })

  const linked = new Set(linkedNow.map((p) => Number(p.id)))

  for (const id of wanted) {
    if (!linked.has(id)) {
      await req.payload.update({
        collection: 'pontaj',
        id,
        data: { factura: doc.id },
        req,
        context: { reconciling: true },
      })
    }
  }

  // Hours whose line is gone go back into the pool.
  for (const id of linked) {
    if (!wanted.has(id)) {
      await req.payload.update({
        collection: 'pontaj',
        id,
        data: { factura: null },
        req,
        context: { reconciling: true },
      })
    }
  }

  return doc
}

/**
 * Carries the money over when a proforma's invoice is finally issued.
 *
 * A client pays against the proforma, but what settles is the fiscal invoice.
 * Leaving the payments behind shows the invoice as unpaid and the proforma as
 * a receivable for ever, so at the moment the invoice takes its number the
 * payments move to it and the proforma is closed.
 */
const takeOverProformaPayments: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const proformaId = idOf(doc.proformaSursa)
  const justIssued = Boolean(doc.numar) && !previousDoc?.numar

  if (!proformaId || !justIssued || doc.tip !== 'fiscala') return doc

  const { docs } = await req.payload.find({
    collection: 'incasari',
    where: { factura: { equals: proformaId } },
    limit: 1000,
    depth: 0,
    req,
  })

  // Checked up front rather than caught afterwards: a refused write rolls the
  // whole transaction back, this invoice's number included. More money than
  // the invoice asks for stays on the proforma, which then stays open so the
  // difference remains visible to a person.
  const collected = docs.reduce((s, i: any) => s + (Number(i.suma) || 0), 0)
  if (round2(collected) > (Number(doc.total) || 0) + 0.01) {
    req.payload.logger.warn(
      `Proforma ${proformaId} are încasat ${round2(collected)}, peste totalul facturii ${doc.serie}-${doc.numar}. Încasările nu au fost mutate.`,
    )
    return doc
  }

  let moved = 0
  for (const payment of docs) {
    await req.payload.update({
      collection: 'incasari',
      id: payment.id,
      data: { factura: doc.id },
      req,
    })
    moved++
  }

  const proforma = await req.payload.findByID({
    collection: 'facturi',
    id: proformaId,
    depth: 0,
    req,
  })

  if (proforma.status !== 'anulata') {
    await req.payload.update({
      collection: 'facturi',
      id: proformaId,
      data: {
        status: 'anulata',
        nota: [proforma.nota, `Închisă prin factura ${doc.serie}-${doc.numar}.`]
          .filter(Boolean)
          .join('\n'),
      },
      req,
      context: { internalStatus: true },
    })
  }

  // The payments just moved changed this very invoice underneath us; hand the
  // caller the figures as they now stand rather than the ones we started with.
  if (moved > 0) {
    const fresh = await req.payload.findByID({
      collection: 'facturi',
      id: doc.id,
      depth: 0,
      req,
    })
    doc.status = fresh.status
    doc.sumaIncasata = fresh.sumaIncasata
  }

  return doc
}

/**
 * Puts a subscription's period back on the schedule when its draft is thrown
 * away, so the month is drafted again instead of silently never billed.
 */
const reopenPeriod = async (doc: Record<string, any>, req: PayloadRequest) => {
  const subscriptionId = idOf(doc.abonament)
  if (!subscriptionId || !doc.perioada || doc.numar) return

  // `find`, not `findByID`: a subscription that is gone must read as "nothing
  // to repair", not as an error that takes the whole transaction down.
  const found = await req.payload.find({
    collection: 'abonamente',
    where: { id: { equals: subscriptionId } },
    limit: 1,
    depth: 0,
    req,
  })
  const subscription = found.docs[0] as unknown as Record<string, any> | undefined
  if (!subscription) return

  const issueDate = new Date(String(doc.dataEmitere))
  const frequency = (subscription.frecventa ?? 'lunar') as Frequency

  // The issue date may have been edited by hand; only trust it while it
  // still falls in the period the draft was generated for.
  if (Number.isNaN(issueDate.getTime()) || periodKey(issueDate, frequency) !== doc.perioada) {
    return
  }

  const backTo = issueDateInMonth(
    issueDate.getUTCFullYear(),
    issueDate.getUTCMonth(),
    Number(subscription.ziuaEmiterii) || 1,
  )
  const scheduled = new Date(String(subscription.urmatoareaEmitere))

  if (!Number.isNaN(scheduled.getTime()) && scheduled <= backTo) return

  await req.payload.update({
    collection: 'abonamente',
    id: subscriptionId,
    data: { urmatoareaEmitere: backTo.toISOString() },
    req,
  })
}

const reopenOnTrash: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (doc.deletedAt && !previousDoc?.deletedAt) await reopenPeriod(doc, req)
  return doc
}

const reopenOnDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  // Already reopened when it went into the trash.
  if (!doc.deletedAt) await reopenPeriod(doc, req)
  return doc
}

export const Invoices: CollectionConfig = {
  slug: 'facturi',
  labels: {
    singular: 'Factură',
    plural: 'Facturi',
  },
  trash: true,
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    // Only drafts can be removed. Once a number is spent, the document has
    // to stay: a gap in the series reads as a missing invoice.
    delete: ({ req }) => {
      if (!hasRole(req.user as never, 'admin', 'manager')) return false
      return { numar: { exists: false } }
    },
  },
  admin: {
    useAsTitle: 'eticheta',
    defaultColumns: ['eticheta', 'tip', 'dataEmitere', 'total', 'status'],
    group: 'CRM',
    description: 'Facturi emise. Numerotarea se face automat la ieșirea din ciornă.',
  },
  hooks: {
    beforeChange: [
      preventReturnToDraft,
      validateStatusTransition,
      validateTimeEntries,
      assignNumber,
      computeTotals,
      buildLabel,
    ],
    afterChange: [reconcileTimeEntries, takeOverProformaPayments, reopenOnTrash],
    afterDelete: [reopenOnDelete],
  },
  endpoints: [
    {
      // Not scoped to an invoice id: the picker must work before the document
      // has been saved for the first time.
      path: '/pontaj-disponibil',
      method: 'get',
      handler: unbilledTime,
    },
    {
      path: '/:id/storneaza',
      method: 'post',
      handler: stornoInvoice,
    },
    {
      path: '/:id/converteste',
      method: 'post',
      handler: convertProforma,
    },
    {
      path: '/:id/trimite',
      method: 'post',
      handler: markInvoiceSent,
    },
    {
      path: '/:id/trimite-email',
      method: 'post',
      handler: emailInvoice,
    },
    {
      path: '/:id/efactura',
      method: 'get',
      handler: downloadEfactura,
    },
    {
      path: '/:id/efactura/verifica',
      method: 'get',
      handler: checkEfactura,
    },
    {
      path: '/:id/efactura/trimite',
      method: 'post',
      handler: sendToAnaf,
    },
    {
      path: '/:id/efactura/stare',
      method: 'get',
      handler: checkEfacturaStatus,
    },
    {
      path: '/:id/print',
      method: 'get',
      handler: printInvoice,
    },
  ],
  fields: [
    {
      // Stored rather than virtual: useAsTitle cannot read a virtual field,
      // and this is what every relationship dropdown displays.
      name: 'eticheta',
      type: 'text',
      label: 'Document',
      index: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Linii',
          fields: [
            {
              // Renders nothing; carries the client's terms and the document
              // type into the form the moment they are selected.
              name: 'autocompletare',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/InvoiceAutofill#InvoiceAutofill',
                },
              },
            },
            {
              // Payload's own row primitive puts the two actions side by side,
              // so no global CSS is involved and the panel layout is untouched.
              type: 'row',
              fields: [
                {
                  name: 'printFactura',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/components/admin/PrintInvoiceButton#PrintInvoiceButton',
                    },
                  },
                },
                {
                  // Only the state, not the action: sending has three channels
                  // and a log, which live on their own tab.
                  name: 'stareTrimitere',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/components/admin/DeliveryStatus#DeliveryStatus',
                    },
                  },
                },
                {
                  name: 'stornoFactura',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/components/admin/StornoButton#StornoButton',
                    },
                  },
                },
              ],
            },
            {
              name: 'conversieProforma',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/ConvertProformaButton#ConvertProformaButton',
                },
              },
            },
            {
              name: 'genereazaLinii',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/GenerateLinesButton#GenerateLinesButton',
                },
              },
            },
            {
              name: 'linii',
              access: { update: onlyBeforeSent },
              type: 'array',
              label: 'Linii factură',
              // Drafts start empty and get filled from the time entries above.
              minRows: 0,
              labels: { singular: 'Linie', plural: 'Linii' },
              fields: [
                {
                  name: 'descriere',
                  type: 'text',
                  label: 'Descriere',
                  required: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'cantitate',
                      type: 'number',
                      label: 'Cantitate',
                      required: true,
                      defaultValue: 1,
                      // Storno documents carry negative quantities, so the
                      // stored figures stay literally true and every report
                      // downstream sums them without a special case.
                    },
                    {
                      // The U.M. column every Romanian invoice carries. Without
                      // it "cantitate: 13.25" is meaningless on its own.
                      name: 'unitate',
                      type: 'select',
                      label: 'U.M.',
                      required: true,
                      defaultValue: 'buc',
                      options: [
                        { label: 'ore', value: 'ore' },
                        { label: 'buc', value: 'buc' },
                        { label: 'zile', value: 'zile' },
                        { label: 'luni', value: 'luni' },
                      ],
                    },
                    {
                      name: 'pretUnitar',
                      type: 'number',
                      label: 'Preț unitar',
                      required: true,
                      min: 0,
                    },
                    {
                      // Stored for reporting; the live panel below is what the
                      // user actually reads while editing.
                      name: 'total',
                      type: 'number',
                      label: 'Total linie',
                      admin: { readOnly: true, hidden: true },
                    },
                  ],
                },
                {
                  // Which time entries this line charges for. Kept on the line
                  // so deleting the line releases exactly those hours.
                  name: 'pontajIds',
                  type: 'json',
                  admin: { hidden: true },
                },
              ],
            },
            {
              name: 'totaluriLive',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/InvoiceTotals#InvoiceTotals',
                },
              },
            },
            {
              // Replaces the join field, whose list and add button do not
              // refresh after the first save.
              name: 'incasariPanou',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/InvoicePayments#InvoicePayments',
                },
              },
            },
            {
              // Maintained by the payments collection, never typed by hand.
              name: 'sumaIncasata',
              access: serverOnly,
              type: 'number',
              label: 'Încasat',
              defaultValue: 0,
              admin: { readOnly: true, hidden: true },
            },
            {
              name: 'subtotal',
              type: 'number',
              label: 'Subtotal',
              admin: { readOnly: true, hidden: true },
            },
            {
              name: 'valoareTva',
              type: 'number',
              label: 'TVA',
              admin: { readOnly: true, hidden: true },
            },
            {
              name: 'total',
              type: 'number',
              label: 'Total',
              admin: { readOnly: true, hidden: true },
            },
          ],
        },
        {
          label: 'Date fiscale',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'cotaTva',
                  access: { update: onlyBeforeSent },
                  type: 'number',
                  label: 'Cotă TVA (%)',
                  required: true,
                  defaultValue: 21,
                  min: 0,
                  max: 100,
                  admin: {
                    description:
                      'Se salvează pe factură, nu se citește dintr-o setare globală. Facturile vechi păstrează cota de la data emiterii.',
                  },
                },
                {
                  name: 'taxareInversa',
                  access: { update: onlyBeforeSent },
                  type: 'checkbox',
                  label: 'Taxare inversă',
                  admin: {
                    description: 'Client UE cu cod TVA valid sau export extra-UE.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'moneda',
                  access: { update: onlyBeforeSent },
                  type: 'select',
                  label: 'Monedă',
                  required: true,
                  defaultValue: 'RON',
                  options: [
                    { label: 'RON', value: 'RON' },
                    { label: 'EUR', value: 'EUR' },
                    { label: 'USD', value: 'USD' },
                  ],
                },
                {
                  name: 'cursBnr',
                  access: { update: onlyBeforeSent },
                  type: 'number',
                  label: 'Curs BNR',
                  min: 0,
                  admin: {
                    condition: (data) => data.moneda && data.moneda !== 'RON',
                    description: 'Cursul de la data emiterii. Se îngheață pe document.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Trimitere',
          fields: [
            {
              name: 'trimiterePanou',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/SendInvoicePanel#SendInvoicePanel',
                },
              },
            },
            {
              // Written only by the delivery endpoints. Not locked behind
              // `onlyBeforeSent`, because the second channel is used
              // precisely after the first one has already frozen the document.
              name: 'livrari',
              access: serverOnly,
              type: 'array',
              label: 'Istoric trimiteri',
              labels: { singular: 'Trimitere', plural: 'Trimiteri' },
              admin: {
                readOnly: true,
                initCollapsed: true,
                description: 'Se completează automat. Dovada că documentul a plecat.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'data', type: 'date', label: 'Când' },
                    {
                      name: 'canal',
                      type: 'select',
                      label: 'Canal',
                      options: [
                        { label: 'Email', value: 'email' },
                        { label: 'e-Factura ANAF', value: 'efactura' },
                        { label: 'Manual', value: 'manual' },
                      ],
                    },
                    {
                      name: 'stare',
                      type: 'select',
                      label: 'Rezultat',
                      options: [
                        { label: 'Trimisă', value: 'ok' },
                        { label: 'Eșuată', value: 'eroare' },
                      ],
                    },
                  ],
                },
                { name: 'destinatar', type: 'text', label: 'Către' },
                { name: 'detalii', type: 'textarea', label: 'Detalii' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'efacturaIndex',
                  access: serverOnly,
                  type: 'text',
                  label: 'Index încărcare ANAF',
                  index: true,
                  admin: { readOnly: true },
                },
                {
                  name: 'efacturaStare',
                  access: serverOnly,
                  type: 'select',
                  label: 'Stare e-Factura',
                  options: [
                    { label: 'Netrimisă', value: 'netrimisa' },
                    { label: 'În prelucrare', value: 'in_prelucrare' },
                    { label: 'Acceptată', value: 'acceptata' },
                    { label: 'Respinsă', value: 'respinsa' },
                    { label: 'Eroare la trimitere', value: 'eroare' },
                  ],
                  defaultValue: 'netrimisa',
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'efacturaMesaj',
              access: serverOnly,
              type: 'textarea',
              label: 'Răspuns ANAF',
              admin: { readOnly: true, condition: (data) => Boolean(data.efacturaMesaj) },
            },
          ],
        },
        {
          label: 'Note',
          fields: [
            {
              name: 'mentiuni',
              access: { update: onlyBeforeSent },
              type: 'textarea',
              label: 'Mențiuni pe factură',
              admin: { description: 'Text vizibil clientului.' },
            },
            {
              name: 'nota',
              type: 'textarea',
              label: 'Note interne',
            },
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'tip',
      type: 'select',
      label: 'Tip document',
      required: true,
      defaultValue: 'fiscala',
      index: true,
      options: [
        { label: 'Factură fiscală', value: 'fiscala' },
        { label: 'Proformă', value: 'proforma' },
        // Kept as a valid value because the reversal action writes it, but
        // labelled so nobody reaches for it by hand; the validation below
        // refuses it without a reference to the invoice being reversed.
        { label: 'Storno (generat automat)', value: 'storno' },
      ],
      access: { update: onlyBeforeSent },
      admin: {
        position: 'sidebar',
        description: 'Proforma nu e document fiscal. Se convertește în factură la plată.',
      },
      validate: (value: string | null | undefined, { data }: { data: any }) => {
        // Storno is only ever produced by the reversal action, which fills in
        // the reference. Picking it by hand would create an orphan document.
        if (value === 'storno' && !data?.facturaStornata) {
          return 'Stornoul se emite doar din butonul de pe factura originală.'
        }
        return true
      },
    },
    {
      name: 'proformaSursa',
      type: 'relationship',
      relationTo: 'facturi',
      label: 'Emisă din proforma',
      index: true,
      access: serverOnly,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data.proformaSursa),
      },
    },
    {
      name: 'facturaStornata',
      type: 'relationship',
      relationTo: 'facturi',
      label: 'Stornează factura',
      index: true,
      access: serverOnly,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data.tip === 'storno',
      },
    },
    {
      // Set once, by the generator. Kept readable so an invoice that turns up
      // in the list can be traced back to the schedule that produced it.
      name: 'abonament',
      access: serverOnly,
      type: 'relationship',
      relationTo: 'abonamente',
      label: 'Din abonamentul',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data.abonament),
      },
    },
    {
      // Which period this invoice covers, as a stable key: "2026-09",
      // "2026-T3", "2026". This is what stops a month being billed twice when
      // the sweep runs more than once.
      name: 'perioada',
      access: serverOnly,
      type: 'text',
      label: 'Perioada facturată',
      index: true,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'serie',
      access: { update: onlyBeforeSent },
      type: 'text',
      label: 'Serie',
      required: true,
      defaultValue: 'WP',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'numar',
      access: serverOnly,
      type: 'number',
      label: 'Număr',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Se atribuie automat la emitere.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'ciorna',
      index: true,
      options: [
        { label: 'Ciornă', value: 'ciorna' },
        { label: 'Emisă', value: 'emisa' },
        { label: 'Încasată parțial', value: 'partial' },
        { label: 'Plătită', value: 'platita' },
        { label: 'Anulată', value: 'anulata' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'De mână doar „Emisă”. Plata vine din încasări, iar anularea unei facturi din storno.',
      },
    },
    {
      // The moment the document leaves: everything fiscal freezes from here.
      name: 'trimisa',
      access: serverOnly,
      type: 'checkbox',
      label: 'Trimisă',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Se bifează prin acțiunea de trimitere. După, doar storno.',
      },
    },
    {
      name: 'dataTrimitere',
      access: serverOnly,
      type: 'date',
      label: 'Trimisă la',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data.trimisa),
      },
    },
    {
      name: 'client',
      access: { update: onlyBeforeSent },
      type: 'relationship',
      relationTo: 'clienti',
      label: 'Client',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'proiect',
      access: { update: onlyBeforeSent },
      type: 'relationship',
      relationTo: 'proiecte',
      label: 'Proiect',
      index: true,
      // Only offer projects belonging to the client already chosen, so an
      // invoice can never be attached to another client's work.
      filterOptions: ({ data }) => (data?.client ? { client: { equals: data.client } } : false),
      admin: {
        position: 'sidebar',
        description: 'Se alege întâi clientul.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'dataEmitere',
          access: { update: onlyBeforeSent },
          type: 'date',
          label: 'Data emiterii',
          required: true,
          defaultValue: () => new Date().toISOString(),
          index: true,
        },
        {
          name: 'dataScadenta',
          access: { update: onlyBeforeSent },
          type: 'date',
          label: 'Scadență',
        },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
