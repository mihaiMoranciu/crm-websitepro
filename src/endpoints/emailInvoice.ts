import type { PayloadHandler } from 'payload'

import { buildEfacturaXml, efacturaFileName } from '../utilities/efactura'
import {
  invoiceNumber,
  renderInvoiceEmail,
  renderInvoiceHtml,
  invoiceTitle,
} from '../utilities/invoiceHtml'
import {
  loadInvoiceContext,
  recordDelivery,
  mapEfacturaDocument,
  sendBlocker,
} from '../utilities/deliveries'
import { getServerSideURL } from '../utilities/getURL'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

/**
 * Emails the invoice to the client.
 *
 * Two attachments, because the two audiences need different things: the human
 * opens the HTML and prints it, the client's accounting software imports the
 * UBL. The XML is skipped for a proforma, which is not a fiscal document and
 * has no place in anyone's ledger.
 *
 * A failed send is written to the log just like a successful one. An invoice
 * that silently failed to leave is the expensive case: the deadline keeps
 * running while everyone believes it is gone.
 */
export const emailInvoice: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  let requestBody: { recipient?: string; message?: string; withXml?: boolean } = {}
  try {
    requestBody = ((await req.json?.()) as typeof requestBody) ?? {}
  } catch {
    // Defaults are enough.
  }

  const ctx = await loadInvoiceContext(payload, id, req)
  const { invoice, company, client } = ctx

  const problem = sendBlocker(invoice)
  if (problem) return respond({ error: problem }, 400)

  const recipient = (requestBody.recipient ?? client?.email ?? '').trim()
  if (!recipient) {
    return respond(
      { error: 'Clientul nu are email. Completează-l în fișa clientului sau scrie-l aici.' },
      400,
    )
  }

  const number = invoiceNumber(invoice)
  const baseUrl = getServerSideURL()

  const html = renderInvoiceHtml({ invoice, company, baseUrl })

  const attachments: { filename: string; content: string | Buffer; contentType: string }[] = [
    {
      filename: `${invoiceTitle(invoice).toLowerCase().replace(/\s+/g, '-')}-${number}.html`,
      content: html,
      contentType: 'text/html; charset=utf-8',
    },
  ]

  // The UBL copy is what makes the email useful to the buyer's accountant.
  if (invoice.tip !== 'proforma' && requestBody.withXml !== false) {
    const doc = mapEfacturaDocument(ctx)
    attachments.push({
      filename: efacturaFileName(doc),
      content: buildEfacturaXml(doc),
      contentType: 'application/xml; charset=utf-8',
    })
  }

  const subject = `${invoiceTitle(invoice)} ${number} - ${company?.denumire ?? ''}`.trim()

  try {
    await payload.sendEmail({
      to: recipient,
      ...(company?.email ? { replyTo: String(company.email) } : {}),
      subject: subject,
      html: renderInvoiceEmail({ invoice, company, message: requestBody.message }),
      attachments: attachments,
    })
  } catch (e) {
    const message = (e as Error).message ?? 'Eroare necunoscută.'
    await recordDelivery({
      payload,
      req,
      id,
      channel: 'email',
      state: 'eroare',
      recipient: recipient,
      details: message,
    })
    return respond({ error: `Emailul nu a plecat: ${message}` }, 502)
  }

  const updated = await recordDelivery({
    payload,
    req,
    id,
    channel: 'email',
    state: 'ok',
    recipient: recipient,
    details: `Subiect: ${subject}. Atașamente: ${attachments.map((a) => a.filename).join(', ')}.`,
  })

  return respond({
    trimisa: Boolean(updated.trimisa),
    dataTrimitere: updated.dataTrimitere,
    livrari: updated.livrari,
    recipient,
  })
}
