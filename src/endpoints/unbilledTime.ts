import type { PayloadHandler, Where } from 'payload'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Lists billable, not-yet-invoiced time for a project.
 *
 * Keyed on the project rather than on an invoice id, because the picker has to
 * work while the invoice is still an unsaved form: the moment a project is
 * chosen the hours are known, and nothing about them depends on a document
 * that does not exist yet.
 */
export const unbilledTime: PayloadHandler = async (req) => {
  const { payload, user } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const projectId = req.searchParams?.get('project')
  if (!projectId) return respond({ error: 'Alege întâi proiectul.' }, 400)

  const project = await payload.findByID({
    collection: 'proiecte',
    id: projectId,
    depth: 0,
  })

  if (project.tipFacturare !== 'ora') {
    const value = Number(project.valoare) || 0

    // What the project has already been invoiced for, so a fixed price is
    // offered once and not again in full on every new invoice. The document
    // being edited is left out: its own lines are in the form, not here.
    // Cancelled invoices and their stornos cancel each other out, and a
    // proforma is not a charge, so only live fiscal invoices count.
    const currentInvoice = req.searchParams?.get('invoice')
    const { docs: issuedInvoices } = await payload.find({
      collection: 'facturi',
      where: {
        and: [
          { proiect: { equals: projectId } },
          { tip: { equals: 'fiscala' } },
          { status: { not_equals: 'anulata' } },
          ...(currentInvoice ? [{ id: { not_equals: currentInvoice } }] : []),
        ],
      },
      limit: 1000,
      depth: 0,
      select: { subtotal: true },
      overrideAccess: false,
      user,
    })

    const invoiced = round2(issuedInvoices.reduce((s, f) => s + (Number(f.subtotal) || 0), 0))

    return respond({
      hourly: false,
      // A recurring fee has no ceiling to run into; only a fixed price does.
      ...(project.tipFacturare === 'fix'
        ? { invoiced, remaining: Math.max(round2(value - invoiced), 0) }
        : {}),
      project: { name: project.nume, value, currency: project.moneda },
      entries: [],
    })
  }

  const where: Where = {
    proiect: { equals: projectId },
    facturabil: { equals: true },
    factura: { exists: false },
  }

  const { docs } = await payload.find({
    collection: 'pontaj',
    where,
    limit: 1000,
    depth: 0,
    sort: 'data',
    overrideAccess: false,
    user,
  })

  return respond({
    hourly: true,
    project: {
      name: project.nume,
      hourlyRate: project.tarifOrar ?? 0,
      currency: project.moneda,
    },
    entries: (docs as unknown as { id: number; data: string; descriere: string; ore: number }[])
      .filter((p) => Number(p.ore) > 0)
      .map((p) => ({ id: p.id, date: p.data, description: p.descriere, hours: Number(p.ore) })),
  })
}
