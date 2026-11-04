import type { PayloadHandler } from 'payload'

import { buildEfacturaXml, efacturaFileName, validateEfacturaData } from '../utilities/efactura'
import { uploadToSpv, spvStatus } from '../utilities/anafSpv'
import {
  loadInvoiceContext,
  recordDelivery,
  mapEfacturaDocument,
  sendBlocker,
} from '../utilities/deliveries'

const respond = (body: unknown, status = 200) =>
  Response.json(body as Record<string, unknown>, { status })

/** A proforma is a payment request, not a fiscal document; SPV would reject it. */
const fiscalOnly = (invoice: Record<string, any>) =>
  invoice.tip === 'proforma'
    ? 'Proforma nu se trimite la ANAF. Convertește-o întâi în factură.'
    : null

/**
 * Hands back the UBL file.
 *
 * Useful on its own: it is what gets uploaded manually in the SPV web
 * interface when the token is not configured, and what an accountant asks for
 * when a submission is disputed.
 */
export const downloadEfactura: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return new Response('Neautentificat.', { status: 401 })

  const id = routeParams?.id as string | undefined
  if (!id) return new Response('Lipsește id-ul.', { status: 400 })

  const ctx = await loadInvoiceContext(payload, id, req)

  const problem = fiscalOnly(ctx.invoice) ?? sendBlocker(ctx.invoice)
  if (problem) return new Response(problem, { status: 400 })

  const doc = mapEfacturaDocument(ctx)
  const missing = validateEfacturaData(doc)

  // Still returned when incomplete: seeing the XML is how you work out what
  // ANAF is complaining about. The warnings ride along in a header.
  return new Response(buildEfacturaXml(doc), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${efacturaFileName(doc)}"`,
      ...(missing.length ? { 'X-Efactura-Avertismente': String(missing.length) } : {}),
    },
  })
}

/** Reports what the document is missing, without sending anything. */
export const checkEfactura: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  const ctx = await loadInvoiceContext(payload, id, req)
  const doc = mapEfacturaDocument(ctx)

  return respond({ missing: validateEfacturaData(doc) })
}

/**
 * Uploads the invoice to the SPV.
 *
 * Validated locally first: the ANAF validator answers with rule codes, and
 * mapping those back to a field takes longer than checking the handful of
 * things that are actually ever missing.
 */
export const sendToAnaf: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  const ctx = await loadInvoiceContext(payload, id, req)
  const { invoice } = ctx

  const problem = fiscalOnly(invoice) ?? sendBlocker(invoice)
  if (problem) return respond({ error: problem }, 400)

  if (invoice.efacturaIndex && invoice.efacturaStare !== 'respinsa') {
    return respond(
      { error: `Factura e deja la ANAF, index ${invoice.efacturaIndex}. Verifică starea.` },
      400,
    )
  }

  const doc = mapEfacturaDocument(ctx)
  const missing = validateEfacturaData(doc)

  if (missing.length) {
    return respond({ error: 'Documentul nu e complet pentru e-Factura.', missing }, 400)
  }

  const result = await uploadToSpv({
    xml: buildEfacturaXml(doc),
    supplierCif: String(doc.supplier.cui),
    foreignClient: (doc.client.country ?? 'RO') !== 'RO',
  })

  if (!result.ok) {
    await recordDelivery({
      payload,
      req,
      id,
      channel: 'efactura',
      state: 'eroare',
      recipient: 'ANAF SPV',
      details: result.error,
      extraFields: { efacturaStare: 'eroare', efacturaMesaj: result.error },
    })
    return respond({ error: result.error }, 502)
  }

  const updated = await recordDelivery({
    payload,
    req,
    id,
    channel: 'efactura',
    state: 'ok',
    recipient: result.testMode ? 'ANAF SPV (mediu de test)' : 'ANAF SPV',
    details: `Index încărcare ${result.index}.`,
    extraFields: {
      efacturaIndex: result.index,
      efacturaStare: 'in_prelucrare',
      efacturaMesaj: result.testMode
        ? 'Trimisă în mediul de test ANAF. Pentru producție setează ANAF_EFACTURA_MEDIU=productie.'
        : null,
    },
  })

  return respond({
    index: result.index,
    testMode: result.testMode,
    trimisa: Boolean(updated.trimisa),
    dataTrimitere: updated.dataTrimitere,
    efacturaStare: 'in_prelucrare',
    livrari: updated.livrari,
  })
}

/**
 * Polls the SPV for the fate of an upload.
 *
 * ANAF keeps a document "in prelucrare" for anywhere between seconds and
 * hours, so the answer is pulled on demand rather than waited for.
 */
export const checkEfacturaStatus: PayloadHandler = async (req) => {
  const { payload, user, routeParams } = req

  if (!user) return respond({ error: 'Neautentificat.' }, 401)

  const id = routeParams?.id as string | undefined
  if (!id) return respond({ error: 'Lipsește id-ul.' }, 400)

  const invoice = (await payload.findByID({
    collection: 'facturi',
    id,
    depth: 0,
    req,
  })) as unknown as Record<string, any>

  if (!invoice.efacturaIndex) {
    return respond({ error: 'Factura nu a fost încă trimisă la ANAF.' }, 400)
  }

  const state = await spvStatus(String(invoice.efacturaIndex))

  if (!state.ok) return respond({ error: state.error }, 502)

  const messages: Record<string, string | null> = {
    in_prelucrare: 'În prelucrare la ANAF.',
    acceptata: 'Acceptată de ANAF.',
    respinsa: 'Respinsă de ANAF.',
  }

  await payload.update({
    collection: 'facturi',
    id,
    data: {
      efacturaStare: state.state,
      efacturaMesaj: 'message' in state ? state.message : messages[state.state],
    },
    req,
  })

  return respond({
    efacturaStare: state.state,
    efacturaMesaj: 'message' in state ? state.message : messages[state.state],
    downloadId: 'downloadId' in state ? state.downloadId : null,
  })
}
