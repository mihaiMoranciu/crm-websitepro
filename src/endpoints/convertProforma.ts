import type { PayloadHandler } from 'payload'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

/**
 * Turns a proforma into the fiscal invoice it was standing in for.
 *
 * A proforma is a request for payment, not a fiscal document: it carries no
 * VAT obligation and claims no hours. Converting copies its content into a
 * real invoice, which is the document that takes a fiscal number, owes VAT and
 * takes ownership of the time entries behind the lines.
 *
 * The proforma itself is kept as issued, so the trail from quote to invoice
 * stays readable months later.
 */
export const convertProforma: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  const proforma = await payload.findByID({ collection: 'facturi', id, depth: 0 })

  if (proforma.tip !== 'proforma') {
    return respond({ error: 'Documentul nu este o proformă.' }, 400)
  }
  if (!proforma.numar) {
    return respond({ error: 'Emite întâi proforma.' }, 400)
  }
  if (proforma.status === 'anulata') {
    return respond({ error: 'Proforma este anulată.' }, 400)
  }

  // Converting twice would bill the client for the same work under two numbers.
  const existing = await payload.find({
    collection: 'facturi',
    where: { proformaSursa: { equals: Number(id) } },
    limit: 1,
    depth: 0,
    req,
  })

  if (existing.totalDocs > 0) {
    const d = existing.docs[0] as any
    return respond({ error: `Proforma a fost deja convertită în ${d.serie}-${d.numar}.` }, 400)
  }

  const settings = (await payload.findGlobal({ slug: 'setari-firma', depth: 0 })) as any
  const lines = Array.isArray(proforma.linii) ? proforma.linii : []

  const invoice = await payload.create({
    collection: 'facturi',
    data: {
      tip: 'fiscala',
      proformaSursa: Number(id),
      // Its own series, so the fiscal numbering stays a clean sequence of
      // real invoices rather than sharing numbers with payment requests.
      serie: settings?.serieImplicita || 'WP',
      status: 'ciorna',
      client: proforma.client,
      proiect: proforma.proiect,
      moneda: proforma.moneda,
      cursBnr: proforma.cursBnr,
      cotaTva: proforma.cotaTva,
      taxareInversa: proforma.taxareInversa,
      dataEmitere: new Date().toISOString(),
      dataScadenta: proforma.dataScadenta,
      mentiuni: proforma.mentiuni,
      linii: lines.map((l: any) => ({
        descriere: l.descriere,
        cantitate: l.cantitate,
        unitate: l.unitate,
        pretUnitar: l.pretUnitar,
        // Carried over: the hours follow the document that actually bills them.
        pontajIds: Array.isArray(l.pontajIds) ? l.pontajIds : [],
      })),
    } as never,
    req,
  })

  return respond({ id: invoice.id, serie: invoice.serie })
}
