import type { Payload, PayloadRequest } from 'payload'

import type { EfacturaDocument, EfacturaParty } from './efactura'

/**
 * Everything the two delivery channels share: loading the invoice with the
 * parties attached, translating it into the shape the e-Factura builder wants,
 * and writing the delivery down afterwards.
 *
 * The log is the point. A sent invoice is a fact about the outside world, and
 * the only trustworthy record of it is one written at the moment the send
 * succeeded, with the channel and the address it went to.
 */

export type InvoiceContext = {
  invoice: Record<string, any>
  company: Record<string, any>
  client: Record<string, any> | null
}

export const loadInvoiceContext = async (
  payload: Payload,
  id: string | number,
  req?: PayloadRequest,
): Promise<InvoiceContext> => {
  const invoice = (await payload.findByID({
    collection: 'facturi',
    id,
    depth: 2,
    req,
  })) as unknown as Record<string, any>

  const company = (await payload.findGlobal({
    slug: 'setari-firma',
    depth: 1,
    req,
  })) as unknown as Record<string, any>

  const client = typeof invoice.client === 'object' ? invoice.client : null

  return { invoice, company, client }
}

/** First line of a free-text address, which is what UBL calls the street. */
const firstLine = (address?: string | null) =>
  address ? String(address).split('\n')[0].trim() : null

/**
 * Translates the stored documents into the flat view the XML builder consumes.
 *
 * Deliberately a separate step: the builder then knows nothing about Payload,
 * and the mapping — which is where the fiscal judgement lives — is readable in
 * one screen.
 */
export const mapEfacturaDocument = (ctx: InvoiceContext): EfacturaDocument => {
  const { invoice: f, company, client } = ctx

  const currency = String(f.moneda ?? 'RON')
  const accounts = Array.isArray(company?.conturi) ? company.conturi : []
  const account = accounts.find((c: any) => c.moneda === currency) ?? accounts[0]

  const supplier: EfacturaParty = {
    legalName: String(company?.denumire ?? ''),
    cui: company?.cui ?? null,
    tradeRegNo: company?.regCom ?? null,
    vatPayer: company?.platitorTva ?? true,
    street: company?.strada ?? firstLine(company?.adresa),
    city: company?.oras ?? null,
    county: company?.judet ?? null,
    postalCode: company?.codPostal ?? null,
    country: 'RO',
    email: company?.email ?? null,
    phone: company?.telefon ?? null,
  }

  const buyer: EfacturaParty = {
    legalName: String(client?.nume ?? ''),
    cui: client?.cui ?? null,
    vatCode: client?.codTvaIntracomunitar ?? null,
    tradeRegNo: client?.regCom ?? null,
    vatPayer: client?.platitorTva ?? true,
    street: firstLine(client?.adresaFacturare || client?.adresa),
    city: client?.oras ?? null,
    county: client?.judet ?? null,
    country: (client?.tara ?? 'RO').toUpperCase(),
    email: client?.email ?? null,
    phone: client?.telefon ?? null,
    contactPerson: client?.persoanaContact ?? null,
    isIndividual: client?.tip === 'pf',
  }

  const reversed =
    f.tip === 'storno' && typeof f.facturaStornata === 'object' && f.facturaStornata
      ? {
          number: `${f.facturaStornata.serie}-${f.facturaStornata.numar}`,
          issueDate: String(f.facturaStornata.dataEmitere),
        }
      : null

  return {
    number: f.numar ? `${f.serie}-${f.numar}` : String(f.serie ?? ''),
    docType: (f.tip ?? 'fiscala') as EfacturaDocument['docType'],
    issueDate: String(f.dataEmitere),
    dueDate: f.dataScadenta ?? null,
    currency,
    bnrRate: f.cursBnr ?? null,
    vatRate: Number(f.cotaTva) || 0,
    reverseCharge: Boolean(f.taxareInversa),
    taxRegime: client?.regimFiscal ?? null,
    subtotal: Number(f.subtotal) || 0,
    vatAmount: Number(f.valoareTva) || 0,
    total: Number(f.total) || 0,
    remarks: f.mentiuni ?? company?.mentiuniImplicite ?? null,
    reversedInvoice: reversed,
    lines: (Array.isArray(f.linii) ? f.linii : []).map((l: any) => ({
      description: String(l.descriere ?? ''),
      quantity: Number(l.cantitate) || 0,
      unit: String(l.unitate ?? 'buc'),
      unitPrice: Number(l.pretUnitar) || 0,
      total: Number(l.total) || 0,
    })),
    supplier,
    client: buyer,
    iban: account?.iban ?? null,
    bank: account?.banca ?? null,
  }
}

export type Channel = 'email' | 'efactura' | 'manual'

/**
 * Records a delivery attempt and, when it succeeded, freezes the document.
 *
 * The freeze belongs here rather than in each channel so that no future
 * channel can be added that sends the invoice out without locking it.
 */
export const recordDelivery = async (args: {
  payload: Payload
  req: PayloadRequest
  id: string | number
  channel: Channel
  state: 'ok' | 'eroare'
  recipient?: string | null
  details?: string | null
  /** Extra fields the channel wants stored, such as the SPV index. */
  extraFields?: Record<string, unknown>
}) => {
  const { payload, req, id, channel, state, recipient, details, extraFields } = args

  const current = (await payload.findByID({
    collection: 'facturi',
    id,
    depth: 0,
    req,
  })) as unknown as Record<string, any>

  const deliveries = Array.isArray(current.livrari) ? current.livrari : []

  const data: Record<string, unknown> = {
    ...extraFields,
    livrari: [
      ...deliveries,
      {
        data: new Date().toISOString(),
        canal: channel,
        stare: state,
        destinatar: recipient ?? null,
        detalii: details ?? null,
      },
    ],
  }

  if (state === 'ok' && !current.trimisa) {
    data.trimisa = true
    data.dataTrimitere = new Date().toISOString()
  }

  return payload.update({ collection: 'facturi', id, data, req })
}

/**
 * The checks every channel shares: a document without a number has not been
 * issued, and a cancelled one must never leave.
 */
export const sendBlocker = (f: Record<string, any>): string | null => {
  if (!f.numar) return 'Emite întâi factura, ca să primească număr.'
  if (f.status === 'anulata') return 'Factura este anulată.'
  if (!Array.isArray(f.linii) || f.linii.length === 0) return 'Factura nu are nicio linie.'
  return null
}
