import type { PayloadHandler } from 'payload'

import { renderInvoiceHtml } from '../utilities/invoiceHtml'

/**
 * Serves the printable invoice inside the panel, with the print button on top.
 * The document itself is rendered by the shared template, so the copy the
 * client receives by email is identical to the one printed here.
 */
export const printInvoice: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return new Response('Neautentificat.', { status: 401 })

  const id = routeParams?.id as string | undefined
  if (!id) return new Response('Lipsește id-ul.', { status: 400 })

  const invoice = await payload.findByID({ collection: 'facturi', id, depth: 2 })
  const company = await payload.findGlobal({ slug: 'setari-firma', depth: 1 })

  const html = renderInvoiceHtml({
    invoice: invoice as unknown as Record<string, any>,
    company: company as unknown as Record<string, any>,
    withPrintBar: true,
  })

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
