/**
 * Renders a printable invoice.
 *
 * Deliberately HTML rather than a PDF engine: the browser's own print dialog
 * produces a correct A4 PDF, and the same file can be attached to an email and
 * opened anywhere. A real renderer only becomes worth its weight when the PDF
 * has to be produced with nobody in the loop.
 *
 * Shared between the print view and the email, so what the client receives is
 * byte for byte what the panel shows.
 */

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const money = (n: unknown, currency: string) =>
  `${Number(n ?? 0).toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`

const formatDate = (v: unknown) =>
  v
    ? new Date(String(v)).toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-'

export const invoiceNumber = (f: Record<string, any>) =>
  f.numar ? `${f.serie}-${f.numar}` : 'CIORNĂ'

export const invoiceTitle = (f: Record<string, any>) => {
  const titles: Record<string, string> = {
    proforma: 'FACTURĂ PROFORMA',
    storno: 'FACTURĂ STORNO',
    fiscala: 'FACTURĂ',
  }
  return titles[String(f.tip)] ?? 'FACTURĂ'
}

/**
 * `absolutizeazaLinkuri` turns the logo's relative URL into an absolute one,
 * needed when the document travels outside the app as an email attachment.
 */
export const renderInvoiceHtml = (args: {
  invoice: Record<string, any>
  company: Record<string, any>
  /** The print bar is for the panel only; it must never reach the client. */
  withPrintBar?: boolean
  baseUrl?: string
}): string => {
  const { invoice: f, company, withPrintBar = false, baseUrl } = args

  const client = (typeof f.client === 'object' ? f.client : null) as Record<string, any> | null
  const currency = String(f.moneda ?? 'RON')
  const lines = Array.isArray(f.linii) ? f.linii : []

  const logo = company?.logo
  const rawLogo = typeof logo === 'object' && logo?.url ? String(logo.url) : null
  const logoUrl = rawLogo && baseUrl && rawLogo.startsWith('/') ? `${baseUrl}${rawLogo}` : rawLogo

  const accounts = Array.isArray(company?.conturi) ? company.conturi : []
  const account = accounts.find((c: any) => c.moneda === currency) ?? accounts[0]

  const number = invoiceNumber(f)
  const title = invoiceTitle(f)

  const rows = lines
    .map(
      (l: any, i: number) => `
      <tr>
        <td class="c">${i + 1}</td>
        <td>${esc(l.descriere)}</td>
        <td class="c">${esc(l.unitate)}</td>
        <td class="r">${Number(l.cantitate ?? 0)}</td>
        <td class="r">${money(l.pretUnitar, currency)}</td>
        <td class="r">${money(l.total, currency)}</td>
      </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<title>${title} ${esc(number)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font: 12px/1.45 -apple-system, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; margin: 0; }
  .print-bar { margin-bottom: 18px; }
  .print-bar button { font: inherit; padding: 8px 16px; cursor: pointer; }
  @media print { .print-bar { display: none; } }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  .logo { max-height: 56px; max-width: 200px; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  .meta { text-align: right; font-size: 12px; }
  .parties { display: flex; gap: 24px; margin: 22px 0 18px; }
  .party { flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 10px 12px; }
  .party h2 { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: #666; margin: 0 0 6px; }
  .party strong { display: block; margin-bottom: 2px; }
  .party div { color: #444; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { background: #f4f4f4; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
  th, td { border: 1px solid #ddd; padding: 7px 9px; vertical-align: top; }
  td.r, th.r { text-align: right; }
  td.c, th.c { text-align: center; }
  .totals { width: 46%; margin-left: auto; }
  .totals td { border: 0; padding: 3px 0; }
  .totals .grand-total td { border-top: 2px solid #1a1a1a; font-weight: 700; font-size: 14px; padding-top: 7px; }
  .footer { margin-top: 22px; font-size: 11px; color: #444; }
  .footer p { margin: 0 0 4px; }
  .signatures { display: flex; gap: 40px; margin-top: 40px; font-size: 11px; color: #666; }
  .signatures div { flex: 1; border-top: 1px solid #bbb; padding-top: 6px; }
</style>
</head>
<body>
  ${withPrintBar ? '<div class="print-bar"><button onclick="window.print()">Printează / Salvează PDF</button></div>' : ''}

  <header>
    <div>
      ${logoUrl ? `<img class="logo" src="${esc(logoUrl)}" alt="">` : `<h1>${esc(company?.denumire)}</h1>`}
    </div>
    <div class="meta">
      <h1>${title} ${esc(number)}</h1>
      <div>Data emiterii: <strong>${formatDate(f.dataEmitere)}</strong></div>
      <div>Scadență: <strong>${formatDate(f.dataScadenta)}</strong></div>
      ${f.cursBnr ? `<div>Curs BNR: <strong>${f.cursBnr}</strong></div>` : ''}
    </div>
  </header>

  <div class="parties">
    <div class="party">
      <h2>Furnizor</h2>
      <strong>${esc(company?.denumire)}</strong>
      <div>CUI ${esc(company?.cui)}${company?.regCom ? ` &middot; ${esc(company.regCom)}` : ''}</div>
      <div>${esc(company?.adresa)}</div>
      ${account ? `<div>${esc(account.banca)} &middot; ${esc(account.iban)}</div>` : ''}
      ${company?.email ? `<div>${esc(company.email)}</div>` : ''}
    </div>
    <div class="party">
      <h2>Client</h2>
      <strong>${esc(client?.nume)}</strong>
      <div>${client?.cui ? `CUI ${esc(client.cui)}` : ''}${client?.codTvaIntracomunitar ? `TVA ${esc(client.codTvaIntracomunitar)}` : ''}${client?.regCom ? ` &middot; ${esc(client.regCom)}` : ''}</div>
      <div>${esc(client?.adresaFacturare || client?.adresa)}</div>
      <div>${esc([client?.oras, client?.judet, client?.tara].filter(Boolean).join(', '))}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="c" style="width:34px">Nr.</th>
        <th>Denumire</th>
        <th class="c" style="width:52px">U.M.</th>
        <th class="r" style="width:70px">Cant.</th>
        <th class="r" style="width:100px">Preț unitar</th>
        <th class="r" style="width:110px">Valoare</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="6" class="c">Fără linii</td></tr>'}</tbody>
  </table>

  <table class="totals">
    <tr><td>Subtotal</td><td class="r">${money(f.subtotal, currency)}</td></tr>
    <tr><td>TVA ${f.taxareInversa ? '(taxare inversă)' : `${f.cotaTva}%`}</td><td class="r">${money(f.valoareTva, currency)}</td></tr>
    <tr class="grand-total"><td>TOTAL DE PLATĂ</td><td class="r">${money(f.total, currency)}</td></tr>
  </table>

  <div class="footer">
    ${f.tip === 'proforma' ? '<p><strong>Document care nu este factură fiscală.</strong> Nu dă drept de deducere a TVA.</p>' : ''}
    ${f.taxareInversa ? '<p><strong>Taxare inversă.</strong> Reverse charge - Art. 44 EU VAT Directive.</p>' : ''}
    ${f.mentiuni ? `<p>${esc(f.mentiuni)}</p>` : ''}
    ${company?.mentiuniImplicite ? `<p>${esc(company.mentiuniImplicite)}</p>` : ''}
  </div>

  <div class="signatures">
    <div>Semnătură furnizor</div>
    <div>Semnătură primire</div>
  </div>
</body>
</html>`
}

/**
 * The body of the email itself: a short covering note, not the invoice.
 *
 * Kept plain and table-based because email clients are still stuck in 2005,
 * and the document proper travels as an attachment anyway.
 */
export const renderInvoiceEmail = (args: {
  invoice: Record<string, any>
  company: Record<string, any>
  message?: string | null
}): string => {
  const { invoice: f, company, message } = args
  const currency = String(f.moneda ?? 'RON')
  const accounts = Array.isArray(company?.conturi) ? company.conturi : []
  const account = accounts.find((c: any) => c.moneda === currency) ?? accounts[0]

  return `<div style="font:14px/1.6 -apple-system,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:560px">
  <p>Bună ziua,</p>
  <p>${message ? esc(message).replace(/\n/g, '<br>') : `Atașat găsiți ${invoiceTitle(f).toLowerCase()} <strong>${esc(invoiceNumber(f))}</strong>.`}</p>
  <table style="border-collapse:collapse;margin:18px 0">
    <tr><td style="padding:4px 16px 4px 0;color:#666">Document</td><td style="padding:4px 0"><strong>${esc(invoiceNumber(f))}</strong></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#666">Data emiterii</td><td style="padding:4px 0">${formatDate(f.dataEmitere)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#666">Scadență</td><td style="padding:4px 0">${formatDate(f.dataScadenta)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#666">Total de plată</td><td style="padding:4px 0"><strong>${money(f.total, currency)}</strong></td></tr>
  </table>
  ${account ? `<p style="color:#444">Plata se poate face în contul <strong>${esc(account.iban)}</strong> (${esc(account.banca)}).</p>` : ''}
  <p style="margin-top:24px;color:#666;font-size:13px">
    ${esc(company?.denumire)}${company?.cui ? ` &middot; CUI ${esc(company.cui)}` : ''}<br>
    ${company?.email ? `${esc(company.email)}` : ''}${company?.telefon ? ` &middot; ${esc(company.telefon)}` : ''}
  </p>
</div>`
}
