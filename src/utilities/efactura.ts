/**
 * Builds the e-Factura document Romania requires for every B2B invoice.
 *
 * The format is UBL 2.1 narrowed by CIUS-RO, the national profile of the
 * European EN 16931 standard. It is written by hand rather than with an XML
 * library because the whole point of the profile is a fixed element order:
 * a generic serializer would happily emit valid XML that the ANAF validator
 * rejects, so the order below is the specification, and templating it keeps
 * that visible.
 *
 * Nothing here talks to the network. Building the document and sending it are
 * separate steps on purpose, so the XML can be produced, inspected and
 * downloaded long before anyone has a certificate for the SPV.
 */

/** Escapes text for an XML text node or attribute value. */
const x = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** Monetary amounts always carry exactly two decimals in UBL. */
const money = (v: unknown) => (Number(v) || 0).toFixed(2)

/** Quantities keep up to four decimals but never trailing zeroes. */
const qty = (v: unknown) => String(Math.round((Number(v) || 0) * 10000) / 10000)

const formatDay = (v: unknown) => {
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

/** Emits an element only when it has content, so empty tags never ship. */
const el = (name: string, content?: string | number | null, attributes = '') => {
  if (content === null || content === undefined || content === '') return ''
  return `<${name}${attributes}>${content}</${name}>`
}

const indent = (parts: string[], level: number) =>
  parts
    .filter(Boolean)
    .map((line) =>
      line
        .split('\n')
        .map((l) => '  '.repeat(level) + l)
        .join('\n'),
    )
    .join('\n')

/**
 * ISO 3166-2 codes for the Romanian counties. CIUS-RO demands the code, not
 * the name, and rejects the document if the two disagree.
 */
const COUNTIES: Record<string, string> = {
  alba: 'RO-AB',
  arad: 'RO-AR',
  arges: 'RO-AG',
  bacau: 'RO-BC',
  bihor: 'RO-BH',
  'bistrita-nasaud': 'RO-BN',
  'bistrita nasaud': 'RO-BN',
  botosani: 'RO-BT',
  brasov: 'RO-BV',
  braila: 'RO-BR',
  bucuresti: 'RO-B',
  'municipiul bucuresti': 'RO-B',
  buzau: 'RO-BZ',
  'caras-severin': 'RO-CS',
  'caras severin': 'RO-CS',
  calarasi: 'RO-CL',
  cluj: 'RO-CJ',
  constanta: 'RO-CT',
  covasna: 'RO-CV',
  dambovita: 'RO-DB',
  dolj: 'RO-DJ',
  galati: 'RO-GL',
  giurgiu: 'RO-GR',
  gorj: 'RO-GJ',
  harghita: 'RO-HR',
  hunedoara: 'RO-HD',
  ialomita: 'RO-IL',
  iasi: 'RO-IS',
  ilfov: 'RO-IF',
  maramures: 'RO-MM',
  mehedinti: 'RO-MH',
  mures: 'RO-MS',
  neamt: 'RO-NT',
  olt: 'RO-OT',
  prahova: 'RO-PH',
  'satu mare': 'RO-SM',
  salaj: 'RO-SJ',
  sibiu: 'RO-SB',
  suceava: 'RO-SV',
  teleorman: 'RO-TR',
  timis: 'RO-TM',
  tulcea: 'RO-TL',
  vaslui: 'RO-VS',
  valcea: 'RO-VL',
  vrancea: 'RO-VN',
}

/**
 * Turns whatever the user typed into the county code, tolerating diacritics
 * and accepting a code that is already correct.
 */
export const countyCode = (county?: string | null): string | null => {
  if (!county) return null
  const raw = county.trim()
  if (/^RO-[A-Z]{1,2}$/i.test(raw)) return raw.toUpperCase()

  const key = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^(judetul|jud\.?)\s+/, '')
    .trim()

  return COUNTIES[key] ?? null
}

/** UN/ECE Recommendation 20 codes for the units this CRM actually invoices. */
const UNITS: Record<string, string> = {
  ore: 'HUR',
  buc: 'H87',
  zile: 'DAY',
  luni: 'MON',
}

export type EfacturaParty = {
  legalName: string
  /** Fiscal code, with or without the RO prefix. */
  cui?: string | null
  /** Intra-community VAT id, when it differs from the fiscal code. */
  vatCode?: string | null
  tradeRegNo?: string | null
  vatPayer?: boolean | null
  street?: string | null
  city?: string | null
  county?: string | null
  postalCode?: string | null
  country?: string | null
  email?: string | null
  phone?: string | null
  contactPerson?: string | null
  /** Individuals carry no company identifiers at all. */
  isIndividual?: boolean | null
}

export type EfacturaLine = {
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export type EfacturaDocument = {
  /** The number as printed: series and number joined. */
  number: string
  docType: 'fiscala' | 'proforma' | 'storno'
  issueDate: string
  dueDate?: string | null
  currency: string
  bnrRate?: number | null
  vatRate: number
  reverseCharge?: boolean | null
  taxRegime?: string | null
  subtotal: number
  vatAmount: number
  total: number
  remarks?: string | null
  /** The invoice this one reverses, for a storno. */
  reversedInvoice?: { number: string; issueDate: string } | null
  lines: EfacturaLine[]
  supplier: EfacturaParty
  client: EfacturaParty
  iban?: string | null
  bank?: string | null
}

type VatCategory = {
  code: string
  percent: number
  reasonCode?: string
  reason?: string
}

/**
 * Picks the EN 16931 tax category for the document.
 *
 * One category per invoice is enough here: every line of a services invoice
 * carries the same treatment, and the regime is a property of the client, not
 * of the individual line.
 */
export const vatCategory = (doc: EfacturaDocument): VatCategory => {
  if (doc.supplier.vatPayer === false) {
    return {
      code: 'E',
      percent: 0,
      reasonCode: 'VATEX-EU-O',
      reason: 'Scutit conform art. 310 Cod fiscal - neplătitor de TVA',
    }
  }

  if (!doc.reverseCharge) {
    return { code: 'S', percent: doc.vatRate }
  }

  if (doc.taxRegime === 'extra_ue') {
    return {
      code: 'G',
      percent: 0,
      reasonCode: 'VATEX-EU-G',
      reason: 'Export de servicii în afara UE',
    }
  }

  return {
    code: 'AE',
    percent: 0,
    reasonCode: 'VATEX-EU-AE',
    reason: 'Taxare inversă - art. 44 Directiva 2006/112/CE',
  }
}

/**
 * Lists what the document is missing before ANAF would reject it.
 *
 * Checking here rather than after the upload turns a cryptic validator code
 * into a sentence naming the field and the screen it lives on.
 */
export const validateEfacturaData = (doc: EfacturaDocument): string[] => {
  const missing: string[] = []

  const party = (p: EfacturaParty, who: string, where: string) => {
    if (!p.legalName) missing.push(`${who}: lipsește denumirea (${where}).`)
    if (!p.country) missing.push(`${who}: lipsește țara (${where}).`)
    if (!p.street) missing.push(`${who}: lipsește adresa (${where}).`)
    if (!p.city) missing.push(`${who}: lipsește orașul (${where}).`)

    if (p.country === 'RO' && !countyCode(p.county)) {
      missing.push(
        `${who}: județul "${p.county ?? ''}" nu are cod ISO. Scrie-l corect sau folosește forma RO-CJ (${where}).`,
      )
    }

    if (!p.isIndividual && !p.cui) {
      missing.push(`${who}: lipsește CUI-ul (${where}).`)
    }
  }

  party(doc.supplier, 'Furnizor', 'Setări firmă')
  party(doc.client, 'Client', 'fișa clientului')

  if (doc.lines.length === 0) missing.push('Factura nu are nicio linie.')
  if (!doc.dueDate) missing.push('Lipsește data scadenței.')
  if (!doc.iban) missing.push('Lipsește contul bancar pentru moneda facturii (Setări firmă).')

  if (doc.currency !== 'RON' && !doc.bnrRate) {
    missing.push('Factura e în altă monedă și nu are curs BNR. TVA-ul trebuie raportat în RON.')
  }

  if (doc.reverseCharge && !doc.client.vatCode && doc.taxRegime !== 'extra_ue') {
    missing.push('Taxare inversă fără cod TVA intracomunitar la client.')
  }

  return missing
}

/** The party block, identical in shape for supplier and customer. */
const buildParty = (p: EfacturaParty): string => {
  const country = (p.country ?? 'RO').toUpperCase()
  const county = countyCode(p.county)
  const cleanCui = p.cui ? String(p.cui).replace(/^RO/i, '').replace(/\D/g, '') : null

  // A VAT payer is identified by the prefixed code under the VAT scheme;
  // anyone else carries the bare fiscal code under the "not EU VAT" scheme,
  // which is how CIUS-RO distinguishes the two.
  const vatScheme = cleanCui
    ? p.vatPayer === false
      ? `<cac:PartyTaxScheme>
  <cbc:CompanyID>${x(cleanCui)}</cbc:CompanyID>
  <cac:TaxScheme><cbc:ID>NOT_EU_VAT</cbc:ID></cac:TaxScheme>
</cac:PartyTaxScheme>`
      : `<cac:PartyTaxScheme>
  <cbc:CompanyID>${x(p.vatCode || `${country}${cleanCui}`)}</cbc:CompanyID>
  <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
</cac:PartyTaxScheme>`
    : ''

  const contact = [
    el('cbc:Name', x(p.contactPerson)),
    el('cbc:Telephone', x(p.phone)),
    el('cbc:ElectronicMail', x(p.email)),
  ].filter(Boolean)

  const parts = [
    `<cac:PartyName>
  <cbc:Name>${x(p.legalName)}</cbc:Name>
</cac:PartyName>`,
    `<cac:PostalAddress>
${indent(
  [
    el('cbc:StreetName', x(p.street)),
    el('cbc:CityName', x(p.city)),
    el('cbc:PostalZone', x(p.postalCode)),
    el('cbc:CountrySubentity', county ? x(county) : x(p.county)),
    `<cac:Country>
  <cbc:IdentificationCode>${x(country)}</cbc:IdentificationCode>
</cac:Country>`,
  ],
  1,
)}
</cac:PostalAddress>`,
    vatScheme,
    `<cac:PartyLegalEntity>
${indent([el('cbc:RegistrationName', x(p.legalName)), el('cbc:CompanyID', x(p.tradeRegNo))], 1)}
</cac:PartyLegalEntity>`,
    contact.length ? `<cac:Contact>\n${indent(contact, 1)}\n</cac:Contact>` : '',
  ]

  return `<cac:Party>
${indent(parts, 1)}
</cac:Party>`
}

/**
 * Renders the invoice as CIUS-RO UBL.
 *
 * The element order follows the UBL 2.1 Invoice sequence exactly; moving any
 * block, even to a place that reads better, breaks schema validation.
 */
export const buildEfacturaXml = (doc: EfacturaDocument): string => {
  const currency = doc.currency || 'RON'
  const currencyAttr = ` currencyID="${x(currency)}"`
  const category = vatCategory(doc)

  const categoryXml = (level: number) =>
    indent(
      [
        `<cbc:ID>${category.code}</cbc:ID>`,
        `<cbc:Percent>${money(category.percent)}</cbc:Percent>`,
        el('cbc:TaxExemptionReasonCode', category.reasonCode),
        el('cbc:TaxExemptionReason', x(category.reason)),
        `<cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>`,
      ],
      level,
    )

  // A storno is a 380 carrying negative amounts, which is what the Romanian
  // system expects; 384 is reserved for a corrective invoice that restates
  // the original in full.
  const typeCode = '380'

  const note: string[] = []
  if (doc.docType === 'storno' && doc.reversedInvoice) {
    note.push(`Stornare factura ${doc.reversedInvoice.number}`)
  }
  if (doc.remarks) note.push(doc.remarks)

  const reference =
    doc.docType === 'storno' && doc.reversedInvoice
      ? `<cac:BillingReference>
  <cac:InvoiceDocumentReference>
    <cbc:ID>${x(doc.reversedInvoice.number)}</cbc:ID>
    <cbc:IssueDate>${formatDay(doc.reversedInvoice.issueDate)}</cbc:IssueDate>
  </cac:InvoiceDocumentReference>
</cac:BillingReference>`
      : ''

  // When the invoice is not in RON the VAT still has to be reported in RON,
  // so the frozen exchange rate travels with the document.
  const exchange =
    currency !== 'RON' && doc.bnrRate
      ? `<cac:TaxExchangeRate>
  <cbc:SourceCurrencyCode>${x(currency)}</cbc:SourceCurrencyCode>
  <cbc:TargetCurrencyCode>RON</cbc:TargetCurrencyCode>
  <cbc:CalculationRate>${Number(doc.bnrRate)}</cbc:CalculationRate>
  <cbc:Date>${formatDay(doc.issueDate)}</cbc:Date>
</cac:TaxExchangeRate>`
      : ''

  const payment = doc.iban
    ? `<cac:PaymentMeans>
  <cbc:PaymentMeansCode>42</cbc:PaymentMeansCode>
  <cac:PayeeFinancialAccount>
    <cbc:ID>${x(doc.iban.replace(/\s+/g, ''))}</cbc:ID>
${indent([el('cbc:Name', x(doc.bank))], 2)}
  </cac:PayeeFinancialAccount>
</cac:PaymentMeans>`
    : ''

  const lines = doc.lines
    .map(
      (l, i) => `<cac:InvoiceLine>
  <cbc:ID>${i + 1}</cbc:ID>
  <cbc:InvoicedQuantity unitCode="${UNITS[l.unit] ?? 'H87'}">${qty(l.quantity)}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount${currencyAttr}>${money(l.total)}</cbc:LineExtensionAmount>
  <cac:Item>
    <cbc:Name>${x(l.description)}</cbc:Name>
    <cac:ClassifiedTaxCategory>
${categoryXml(3)}
    </cac:ClassifiedTaxCategory>
  </cac:Item>
  <cac:Price>
    <cbc:PriceAmount${currencyAttr}>${money(l.unitPrice)}</cbc:PriceAmount>
  </cac:Price>
</cac:InvoiceLine>`,
    )
    .join('\n')

  const requestBody = [
    `<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1</cbc:CustomizationID>`,
    `<cbc:ID>${x(doc.number)}</cbc:ID>`,
    `<cbc:IssueDate>${formatDay(doc.issueDate)}</cbc:IssueDate>`,
    el('cbc:DueDate', formatDay(doc.dueDate)),
    `<cbc:InvoiceTypeCode>${typeCode}</cbc:InvoiceTypeCode>`,
    note.length ? `<cbc:Note>${x(note.join(' | '))}</cbc:Note>` : '',
    `<cbc:DocumentCurrencyCode>${x(currency)}</cbc:DocumentCurrencyCode>`,
    currency !== 'RON' ? `<cbc:TaxCurrencyCode>RON</cbc:TaxCurrencyCode>` : '',
    reference,
    `<cac:AccountingSupplierParty>
${indent([buildParty(doc.supplier)], 1)}
</cac:AccountingSupplierParty>`,
    `<cac:AccountingCustomerParty>
${indent([buildParty(doc.client)], 1)}
</cac:AccountingCustomerParty>`,
    payment,
    exchange,
    `<cac:TaxTotal>
  <cbc:TaxAmount${currencyAttr}>${money(doc.vatAmount)}</cbc:TaxAmount>
  <cac:TaxSubtotal>
    <cbc:TaxableAmount${currencyAttr}>${money(doc.subtotal)}</cbc:TaxableAmount>
    <cbc:TaxAmount${currencyAttr}>${money(doc.vatAmount)}</cbc:TaxAmount>
    <cac:TaxCategory>
${categoryXml(3)}
    </cac:TaxCategory>
  </cac:TaxSubtotal>
</cac:TaxTotal>`,
    `<cac:LegalMonetaryTotal>
  <cbc:LineExtensionAmount${currencyAttr}>${money(doc.subtotal)}</cbc:LineExtensionAmount>
  <cbc:TaxExclusiveAmount${currencyAttr}>${money(doc.subtotal)}</cbc:TaxExclusiveAmount>
  <cbc:TaxInclusiveAmount${currencyAttr}>${money(doc.total)}</cbc:TaxInclusiveAmount>
  <cbc:PayableAmount${currencyAttr}>${money(doc.total)}</cbc:PayableAmount>
</cac:LegalMonetaryTotal>`,
    lines,
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
${indent(requestBody, 1)}
</Invoice>
`
}

export const efacturaFileName = (doc: EfacturaDocument) =>
  `efactura_${doc.number.replace(/[^A-Za-z0-9_-]/g, '_')}.xml`
