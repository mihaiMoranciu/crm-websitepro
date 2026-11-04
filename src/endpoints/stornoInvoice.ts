import type { PayloadHandler } from 'payload'
import { commitTransaction, initTransaction, killTransaction } from 'payload'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

/**
 * Cancels an issued invoice the way accounting requires: the original is left
 * untouched, and a second numbered document with negative amounts reverses it.
 *
 * Editing or deleting an issued invoice would break the numbering chain, which
 * is exactly what a fiscal audit checks. The hours the original charged for are
 * released by the reconcile hook once the original is marked cancelled, so they
 * can be billed again on a corrected document.
 */
export const stornoInvoice: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  const original = await payload.findByID({ collection: 'facturi', id, depth: 0 })

  if (!original.numar) {
    return respond({ error: 'O ciornă nu se stornează, se șterge.' }, 400)
  }
  if (original.tip === 'storno') {
    return respond({ error: 'Un storno nu se mai stornează.' }, 400)
  }
  if (original.status === 'anulata') {
    return respond({ error: 'Factura este deja anulată.' }, 400)
  }
  // A proforma is not a fiscal document, so there is nothing to reverse: a
  // storno for it would be a credit note for an invoice that never existed.
  if (original.tip === 'proforma') {
    return respond({ error: 'O proformă nu se stornează. Treci-o pe statusul „Anulată”.' }, 400)
  }

  // Cancelling would leave the payments attached to a void document, with
  // nothing saying where the money went. A person has to settle that first.
  const payments = await payload.count({
    collection: 'incasari',
    where: { factura: { equals: Number(id) } },
  })
  if (payments.totalDocs > 0) {
    return respond(
      {
        error:
          'Factura are încasări înregistrate. Șterge-le sau mută-le pe alt document înainte de stornare.',
      },
      400,
    )
  }

  const lines = Array.isArray(original.linii) ? original.linii : []

  // Two writes that only make sense together: a storno whose original is still
  // live reverses nothing, it just halves what the client appears to owe.
  const ownsTransaction = await initTransaction(req)

  try {
    const storno = await payload.create({
      collection: 'facturi',
      data: {
        tip: 'storno',
        facturaStornata: Number(id),
        serie: original.serie,
        // Issued straight away: a storno exists to void a live document, so a
        // draft would leave the original cancelled with nothing reversing it.
        status: 'emisa',
        client: original.client,
        proiect: original.proiect,
        moneda: original.moneda,
        cursBnr: original.cursBnr,
        cotaTva: original.cotaTva,
        taxareInversa: original.taxareInversa,
        dataEmitere: new Date().toISOString(),
        dataScadenta: new Date().toISOString(),
        mentiuni: `Stornare factura ${original.serie}-${original.numar}.`,
        linii: lines.map((l: any) => ({
          descriere: l.descriere,
          // Negated, not forced negative: a discount line is already below
          // zero and has to come back as a positive one.
          cantitate: -(Number(l.cantitate) || 0),
          unitate: l.unitate,
          pretUnitar: l.pretUnitar,
          // Deliberately empty: the hours belong to the original, and the
          // reconcile hook frees them when that one is cancelled below.
          pontajIds: [],
        })),
      } as never,
      req,
    })

    await payload.update({
      collection: 'facturi',
      id,
      data: { status: 'anulata' },
      req,
      // Cancelling by hand is refused; this is the one legitimate route.
      context: { internalStatus: true },
    })

    if (ownsTransaction) await commitTransaction(req)

    return respond({
      id: storno.id,
      numar: `${storno.serie}-${storno.numar}`,
      total: storno.total,
    })
  } catch (e) {
    if (ownsTransaction) await killTransaction(req)
    throw e
  }
}
