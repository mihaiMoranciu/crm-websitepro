import type { PayloadHandler } from 'payload'

import { loadInvoiceContext, recordDelivery, sendBlocker } from '../utilities/deliveries'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

/**
 * Declares by hand that the invoice has left.
 *
 * The escape hatch for everything the panel does not do itself: handed over on
 * paper, sent from the accountant's own client, uploaded straight into SPV.
 * The freeze is the same as for the automated channels, because what matters
 * legally is that the document reached the other party, not how.
 */
export const markInvoiceSent: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  const { invoice } = await loadInvoiceContext(payload, id, req)

  const problem = sendBlocker(invoice)
  if (problem) return respond({ error: problem }, 400)

  if (invoice.trimisa) {
    return respond({ error: 'Factura este deja marcată ca trimisă.' }, 400)
  }

  let note: string | null = null
  try {
    const body = (await req.json?.()) as { note?: string } | undefined
    note = body?.note ?? null
  } catch {
    // A body is optional here.
  }

  const updated = await recordDelivery({
    payload,
    req,
    id,
    channel: 'manual',
    state: 'ok',
    details: note ?? 'Marcată manual ca trimisă.',
  })

  return respond({
    trimisa: true,
    dataTrimitere: updated.dataTrimitere,
    livrari: updated.livrari,
  })
}
