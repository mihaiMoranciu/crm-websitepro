'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button, useAllFormFields, useDocumentInfo, useFormModified } from '@payloadcms/ui'

import { errorMessage, useReloadDocument } from './documentSync'

import './SendInvoicePanel.scss'

/** What the delivery endpoints write on the invoice besides the log. */
const DELIVERY_FIELDS = [
  'trimisa',
  'dataTrimitere',
  'efacturaIndex',
  'efacturaStare',
  'efacturaMesaj',
]

const bc = 'send-invoice'

type Delivery = {
  data?: string | null
  canal?: string | null
  stare?: string | null
  destinatar?: string | null
  detalii?: string | null
}

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  efactura: 'e-Factura',
  manual: 'Manual',
}

const STATE_LABELS: Record<string, string> = {
  netrimisa: 'Netrimisă',
  in_prelucrare: 'În prelucrare',
  acceptata: 'Acceptată',
  respinsa: 'Respinsă',
  eroare: 'Eroare',
}

const formatWhen = (v: unknown) =>
  v
    ? new Date(String(v)).toLocaleString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

/** Reads the rows of an array field straight out of live form state. */
const readDeliveries = (fields: Record<string, { value?: unknown }>): Delivery[] => {
  const indexes = new Set<number>()
  for (const key of Object.keys(fields)) {
    const m = /^livrari\.(\d+)\./.exec(key)
    if (m) indexes.add(Number(m[1]))
  }
  return [...indexes]
    .sort((a, b) => a - b)
    .map((i) => ({
      data: fields[`livrari.${i}.data`]?.value as string,
      canal: fields[`livrari.${i}.canal`]?.value as string,
      stare: fields[`livrari.${i}.stare`]?.value as string,
      destinatar: fields[`livrari.${i}.destinatar`]?.value as string,
      detalii: fields[`livrari.${i}.detalii`]?.value as string,
    }))
}

/**
 * The one place an invoice leaves the building.
 *
 * Three channels sit side by side because in Romania they answer different
 * obligations: the SPV upload is what the law counts, the email is what the
 * client actually reads, and the manual mark covers everything done outside
 * this panel. Any of them freezes the document, and each writes a line in the
 * log below, which is the only evidence that the deadline was met.
 */
export function SendInvoicePanel() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const modified = useFormModified()
  const reload = useReloadDocument()

  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [withXml, setWithXml] = useState(true)
  const [note, setNote] = useState('')

  // Set only when an endpoint hands back a fresher log than the form holds,
  // which is the case while unsaved edits keep the form from being rebuilt.
  const [responseDeliveries, setResponseDeliveries] = useState<Delivery[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [missing, setMissing] = useState<string[] | null>(null)

  const number = fields.numar?.value
  const series = fields.serie?.value
  const sent = Boolean(fields.trimisa?.value)
  const sentAt = fields.dataTrimitere?.value
  const status = String(fields.status?.value ?? '')
  const docType = String(fields.tip?.value ?? 'fiscala')
  const efacturaIndex = fields.efacturaIndex?.value as string | undefined
  const efacturaState = String(fields.efacturaStare?.value ?? 'netrimisa')
  const efacturaMessage = fields.efacturaMesaj?.value as string | undefined

  const clientRaw = fields.client?.value
  const clientId =
    clientRaw && typeof clientRaw === 'object'
      ? (clientRaw as { id?: number }).id
      : (clientRaw as number | string | undefined)

  // The log is read from the form, which is rebuilt from the server after
  // every send, so the form and the screen cannot disagree about it.
  const deliveries = responseDeliveries ?? readDeliveries(fields as never)

  useEffect(() => {
    setResponseDeliveries(null)
  }, [id])

  useEffect(() => {
    if (!clientId) return
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/clienti/${clientId}?depth=0`, { credentials: 'include' })
        if (!res.ok) return
        const client = await res.json()
        if (!cancelled && client?.email) setRecipient((current) => current || String(client.email))
      } catch {
        // The address can always be typed by hand.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clientId])

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/globals/setari-firma?depth=0', { credentials: 'include' })
        if (!res.ok) return
        const company = await res.json()
        if (company?.mesajEmailImplicit)
          setMessage((current) => current || String(company.mesajEmailImplicit))
      } catch {
        // Falls back to the standard wording built server-side.
      }
    })()
  }, [])

  const call = useCallback(
    async (args: {
      key: string
      url: string
      method?: 'GET' | 'POST'
      requestBody?: unknown
      /** False for calls that only read, so the form is left alone. */
      mutates?: boolean
      onSuccess: (body: Record<string, any>) => string | null
    }) => {
      setBusy(args.key)
      setError(null)
      setSuccess(null)
      setMissing(null)
      try {
        const res = await fetch(args.url, {
          method: args.method ?? 'POST',
          credentials: 'include',
          ...(args.requestBody
            ? {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(args.requestBody),
              }
            : {}),
        })
        const body = await res.json()
        if (!res.ok) {
          setError(errorMessage(body, 'Acțiunea nu a reușit.'))
          if (Array.isArray(body?.missing)) setMissing(body.missing)
          // A failed send is logged on the invoice too, so the form is behind
          // even when the action did not go through.
          if (args.mutates !== false) await reload(DELIVERY_FIELDS)
          return
        }
        if (args.mutates !== false) {
          if (Array.isArray(body.livrari)) setResponseDeliveries(body.livrari)
          await reload(DELIVERY_FIELDS)
        }
        setSuccess(args.onSuccess(body))
        setConfirming(null)
      } catch {
        setError('Nu am putut contacta serverul.')
      } finally {
        setBusy(null)
      }
    },
    [reload],
  )

  if (!id) {
    return <p className={`${bc}__hint`}>Salvează factura ca să o poți trimite.</p>
  }

  if (!number) {
    return (
      <p className={`${bc}__hint`}>
        Documentul e ciornă. Treci-l pe „Emisă" ca să primească număr, apoi îl poți trimite.
      </p>
    )
  }

  if (status === 'anulata') {
    return <p className={`${bc}__hint`}>Factura e anulată și nu se mai trimite.</p>
  }

  const blockedByEdits = modified
  const isProforma = docType === 'proforma'

  const efacturaBadge =
    efacturaState === 'acceptata'
      ? `${bc}__badge ${bc}__badge--ok`
      : efacturaState === 'respinsa' || efacturaState === 'eroare'
        ? `${bc}__badge ${bc}__badge--error`
        : efacturaState === 'in_prelucrare'
          ? `${bc}__badge ${bc}__badge--pending`
          : `${bc}__badge`

  return (
    <div className={bc}>
      <div className={`${bc}__section`}>
        <p className={`${bc}__title`}>
          <span>
            {String(series ?? '')}-{String(number)}
          </span>
          <span className={sent ? `${bc}__badge ${bc}__badge--ok` : `${bc}__badge`}>
            {sent ? `Trimisă ${formatWhen(sentAt)}` : 'Netrimisă'}
          </span>
        </p>
        <p className={`${bc}__hint`}>
          {sent
            ? 'Documentul e blocat. Orice corecție se face prin storno, nu prin editare.'
            : 'La prima trimitere reușită factura se blochează. Verifică liniile înainte.'}
        </p>
        {blockedByEdits ? (
          <p className={`${bc}__error`}>Ai modificări nesalvate. Salvează întâi.</p>
        ) : null}
      </div>

      {/* Email */}
      <div className={`${bc}__section`}>
        <p className={`${bc}__title`}>
          <span>Trimite pe email</span>
        </p>

        <div className={`${bc}__field`}>
          <label htmlFor="send-to">Către</label>
          <input
            id="send-to"
            type="email"
            value={recipient}
            placeholder="client@exemplu.ro"
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className={`${bc}__field`}>
          <label htmlFor="send-message">Mesaj</label>
          <textarea
            id="send-message"
            rows={3}
            value={message}
            placeholder="Lasă gol pentru textul standard."
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className={`${bc}__actions`}>
          {confirming === 'email' ? (
            <>
              <Button
                buttonStyle="primary"
                disabled={busy !== null}
                onClick={() =>
                  void call({
                    key: 'email',
                    url: `/api/facturi/${id}/trimite-email`,
                    requestBody: { recipient, message: message || undefined, withXml },
                    onSuccess: (b) => `Trimisă către ${b.recipient}.`,
                  })
                }
              >
                {busy === 'email' ? 'Se trimite...' : 'Confirmă trimiterea'}
              </Button>
              <Button buttonStyle="subtle" onClick={() => setConfirming(null)}>
                Renunță
              </Button>
            </>
          ) : (
            <Button
              buttonStyle="secondary"
              disabled={blockedByEdits || !recipient}
              onClick={() => setConfirming('email')}
            >
              Trimite pe email
            </Button>
          )}

          {!isProforma ? (
            <label className={`${bc}__option`}>
              <input
                type="checkbox"
                checked={withXml}
                onChange={(e) => setWithXml(e.target.checked)}
              />
              Atașează și XML-ul e-Factura
            </label>
          ) : null}
        </div>

        <p className={`${bc}__hint`}>
          Se atașează documentul în format HTML, printabil ca PDF din browser.
        </p>
      </div>

      {/* e-Factura */}
      {!isProforma ? (
        <div className={`${bc}__section`}>
          <p className={`${bc}__title`}>
            <span>e-Factura ANAF</span>
            <span className={efacturaBadge}>{STATE_LABELS[efacturaState] ?? efacturaState}</span>
          </p>

          {efacturaIndex ? <p className={`${bc}__hint`}>Index încărcare: {efacturaIndex}</p> : null}
          {efacturaMessage ? <p className={`${bc}__hint`}>{efacturaMessage}</p> : null}

          <div className={`${bc}__actions`}>
            <Button buttonStyle="secondary" el="anchor" url={`/api/facturi/${id}/efactura`} newTab>
              Descarcă XML
            </Button>

            <Button
              buttonStyle="subtle"
              disabled={busy !== null}
              onClick={() =>
                void call({
                  key: 'verifica',
                  method: 'GET',
                  mutates: false,
                  url: `/api/facturi/${id}/efactura/verifica`,
                  onSuccess: (b) => {
                    if (Array.isArray(b.missing) && b.missing.length) {
                      setMissing(b.missing)
                      return null
                    }
                    return 'Documentul e complet pentru e-Factura.'
                  },
                })
              }
            >
              {busy === 'verifica' ? 'Se verifică...' : 'Verifică datele'}
            </Button>

            {confirming === 'anaf' ? (
              <>
                <Button
                  buttonStyle="primary"
                  disabled={busy !== null}
                  onClick={() =>
                    void call({
                      key: 'anaf',
                      url: `/api/facturi/${id}/efactura/trimite`,
                      onSuccess: (b) =>
                        `Încărcată la ANAF${b.testMode ? ' (mediu de test)' : ''}, index ${b.index}.`,
                    })
                  }
                >
                  {busy === 'anaf' ? 'Se încarcă...' : 'Confirmă încărcarea'}
                </Button>
                <Button buttonStyle="subtle" onClick={() => setConfirming(null)}>
                  Renunță
                </Button>
              </>
            ) : (
              <Button
                buttonStyle="secondary"
                disabled={blockedByEdits || efacturaState === 'acceptata'}
                onClick={() => setConfirming('anaf')}
              >
                Trimite la ANAF
              </Button>
            )}

            {efacturaIndex ? (
              <Button
                buttonStyle="subtle"
                disabled={busy !== null}
                onClick={() =>
                  void call({
                    key: 'stare',
                    method: 'GET',
                    url: `/api/facturi/${id}/efactura/stare`,
                    onSuccess: (b) => b.efacturaMesaj ?? 'Stare actualizată.',
                  })
                }
              >
                {busy === 'stare' ? 'Se verifică...' : 'Verifică starea la ANAF'}
              </Button>
            ) : null}
          </div>

          <p className={`${bc}__hint`}>
            Termenul legal e de 5 zile de la emitere. Fără token ANAF configurat, descarcă XML-ul și
            încarcă-l manual în SPV.
          </p>
        </div>
      ) : (
        <div className={`${bc}__section`}>
          <p className={`${bc}__hint`}>
            Proforma nu se declară la ANAF. Se trimite clientului, iar la plată o convertești în
            factură fiscală.
          </p>
        </div>
      )}

      {/* Manual */}
      <div className={`${bc}__section`}>
        <p className={`${bc}__title`}>
          <span>Am trimis-o altfel</span>
        </p>

        <div className={`${bc}__field`}>
          <label htmlFor="send-note">Cum a plecat</label>
          <input
            id="send-note"
            type="text"
            value={note}
            placeholder="Predată pe hârtie / trimisă de contabil din SPV"
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className={`${bc}__actions`}>
          <Button
            buttonStyle="subtle"
            disabled={blockedByEdits || sent || busy !== null}
            onClick={() =>
              void call({
                key: 'manual',
                url: `/api/facturi/${id}/trimite`,
                requestBody: { note: note || undefined },
                onSuccess: () => 'Marcată ca trimisă.',
              })
            }
          >
            {busy === 'manual' ? 'Se marchează...' : 'Marchează ca trimisă'}
          </Button>
        </div>
      </div>

      {error ? <p className={`${bc}__error`}>{error}</p> : null}
      {success ? <p className={`${bc}__ok`}>{success}</p> : null}
      {missing?.length ? (
        <ul className={`${bc}__missing`}>
          {missing.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}

      {deliveries.length ? (
        <div className={`${bc}__section`}>
          <p className={`${bc}__title`}>
            <span>Istoric</span>
          </p>
          <ul className={`${bc}__history`}>
            {deliveries.map((l, i) => (
              <li key={`${l.data}-${i}`} className={`${bc}__row`}>
                <span className={`${bc}__date`}>{formatWhen(l.data)}</span>
                <span className={`${bc}__channel`}>
                  {CHANNEL_LABELS[String(l.canal)] ?? l.canal}
                </span>
                <span className={`${bc}__details${l.stare === 'eroare' ? ` ${bc}__failed` : ''}`}>
                  {l.stare === 'eroare' ? 'Eșuat. ' : ''}
                  {l.destinatar ? `${l.destinatar}. ` : ''}
                  {l.detalii}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
