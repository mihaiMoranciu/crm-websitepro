/**
 * Talks to the ANAF e-Factura service in the Virtual Private Space.
 *
 * Two calls make up the whole protocol: hand over the XML and get back an
 * upload index, then ask what happened to that index. The service answers in
 * a flat, attribute-only XML, so the replies are read with a regex rather
 * than a parser; pulling in an XML library for four attributes would cost
 * more than it explains.
 *
 * Authentication is a bearer token obtained through the OAuth flow ANAF runs
 * against a qualified digital certificate. That token is issued outside this
 * app and lives in the environment, because it belongs to the accountant's
 * certificate, not to the CRM.
 */

const BASE_PROD = 'https://api.anaf.ro/prod/FCTEL/rest'
const BASE_TEST = 'https://api.anaf.ro/test/FCTEL/rest'

export type SpvConfig = {
  base: string
  token: string
  testMode: boolean
}

/**
 * Reads the SPV configuration, or explains what is missing.
 *
 * Returning the reason instead of throwing lets the panel show a sentence the
 * user can act on rather than a stack trace.
 */
export const spvConfig = (): { config: SpvConfig } | { error: string } => {
  const token = process.env.ANAF_EFACTURA_TOKEN

  if (!token) {
    return {
      error:
        'Nu e configurat tokenul ANAF. Adaugă ANAF_EFACTURA_TOKEN în .env (se obține prin OAuth cu certificatul digital) și repornește serverul.',
    }
  }

  // Everything defaults to the test environment: an accidental production
  // upload cannot be taken back, since the invoice is registered on the spot.
  const testMode = process.env.ANAF_EFACTURA_MEDIU !== 'productie'

  return {
    config: {
      token,
      testMode,
      base: process.env.ANAF_EFACTURA_BASE ?? (testMode ? BASE_TEST : BASE_PROD),
    },
  }
}

/** Pulls an attribute out of the flat XML the service replies with. */
const attribute = (xml: string, name: string): string | null => {
  const m = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i').exec(xml)
  return m ? m[1] : null
}

/** Collects every error message the reply carries. */
const errors = (xml: string): string[] => {
  const found: string[] = []
  const re = /errorMessage\s*=\s*"([^"]*)"/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) found.push(m[1])
  return found
}

export type UploadResult =
  | { ok: true; index: string; testMode: boolean }
  | { ok: false; error: string }

/**
 * Uploads the UBL document and returns the index that identifies it from now on.
 *
 * `extern` marks a buyer without a Romanian fiscal code, which the service
 * validates differently: without the flag a foreign client is rejected for a
 * missing CUI.
 */
export const uploadToSpv = async (args: {
  xml: string
  supplierCif: string
  foreignClient?: boolean
}): Promise<UploadResult> => {
  const cfg = spvConfig()
  if ('error' in cfg) return { ok: false, error: cfg.error }

  const cif = String(args.supplierCif).replace(/^RO/i, '').replace(/\D/g, '')

  const url =
    `${cfg.config.base}/upload?standard=UBL&cif=${encodeURIComponent(cif)}` +
    `&extern=${args.foreignClient ? 'DA' : 'NU'}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.config.token}`,
        'Content-Type': 'text/plain; charset=utf-8',
      },
      body: args.xml,
    })
  } catch (e) {
    return { ok: false, error: `Nu am putut contacta ANAF: ${(e as Error).message}` }
  }

  const text = await response.text()

  if (response.status === 401 || response.status === 403) {
    return { ok: false, error: 'Token ANAF invalid sau expirat. Reînnoiește-l prin OAuth.' }
  }

  const errorMessages = errors(text)
  if (errorMessages.length) return { ok: false, error: errorMessages.join(' | ') }

  const state = attribute(text, 'ExecutionStatus')
  const index = attribute(text, 'index_incarcare')

  if (state === '1' || !index) {
    return { ok: false, error: `ANAF a refuzat încărcarea: ${text.slice(0, 500)}` }
  }

  return { ok: true, index, testMode: cfg.config.testMode }
}

export type UploadStatus =
  | { ok: true; state: 'in_prelucrare' }
  | { ok: true; state: 'acceptata'; downloadId: string | null }
  | { ok: true; state: 'respinsa'; downloadId: string | null; message: string }
  | { ok: false; error: string }

/**
 * Asks what became of an upload.
 *
 * The service keeps a document "in prelucrare" for anywhere between seconds
 * and hours, so this is polled rather than awaited.
 */
export const spvStatus = async (index: string): Promise<UploadStatus> => {
  const cfg = spvConfig()
  if ('error' in cfg) return { ok: false, error: cfg.error }

  let response: Response
  try {
    response = await fetch(
      `${cfg.config.base}/stareMesaj?id_incarcare=${encodeURIComponent(index)}`,
      { headers: { Authorization: `Bearer ${cfg.config.token}` } },
    )
  } catch (e) {
    return { ok: false, error: `Nu am putut contacta ANAF: ${(e as Error).message}` }
  }

  const text = await response.text()

  if (response.status === 401 || response.status === 403) {
    return { ok: false, error: 'Token ANAF invalid sau expirat.' }
  }

  const errorMessages = errors(text)
  if (errorMessages.length) return { ok: false, error: errorMessages.join(' | ') }

  const state = (attribute(text, 'stare') ?? '').toLowerCase()
  const downloadId = attribute(text, 'id_descarcare')

  if (state === 'ok') return { ok: true, state: 'acceptata', downloadId }
  if (state === 'nok') {
    return {
      ok: true,
      state: 'respinsa',
      downloadId,
      message: 'Documentul a fost respins. Descarcă rezultatul din SPV pentru motivul exact.',
    }
  }
  if (state.includes('prelucrare')) return { ok: true, state: 'in_prelucrare' }

  return { ok: false, error: `Răspuns neașteptat de la ANAF: ${text.slice(0, 300)}` }
}
