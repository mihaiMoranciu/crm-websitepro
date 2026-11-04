'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useAllFormFields, useForm } from '@payloadcms/ui'

/**
 * Carries the client's commercial terms and the document type into the form.
 *
 * Everything runs on selection, in form state, with no save. Only genuine
 * changes trigger it: each watched value is compared against what it was last
 * time, so a field the user edited by hand is never overwritten on re-render.
 *
 * The fiscal regime matters most. Invoicing an EU company without reverse
 * charge is a real filing error, and remembering to tick it by hand every time
 * is exactly the kind of thing people forget.
 */

type Client = {
  moneda?: string | null
  termenPlata?: number | null
  regimFiscal?: string | null
}

const NO_VAT_REGIMES = new Set(['ue_taxare_inversa', 'extra_ue'])

const idOf = (v: unknown): number | string | undefined => {
  if (v && typeof v === 'object') return (v as { id?: number }).id
  return v as number | string | undefined
}

const toIsoDate = (iso: unknown): string | undefined => {
  if (!iso) return undefined
  const d = new Date(String(iso))
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export function InvoiceAutofill() {
  const { dispatchFields, setModified } = useForm()
  const [fields] = useAllFormFields()

  const [clientTerm, setClientTerm] = useState<number | null>(null)

  const clientId = idOf(fields.client?.value)
  const docType = String(fields.tip?.value ?? 'fiscala')
  const issueDate = fields.dataEmitere?.value
  const number = fields.numar?.value

  // Previous values, so we act on transitions rather than on every render.
  // Client and issue date start from what the document was opened with:
  // loading a saved draft is not the user choosing anything, and treating it
  // as a choice would overwrite the terms they had set by hand.
  const appliedClient = useRef<typeof clientId>(clientId)
  const previousType = useRef<string | null>(null)
  const previousIssueDate = useRef<unknown>(issueDate)

  const setField = (path: string, value: unknown) =>
    dispatchFields({ type: 'UPDATE', path, value, valid: true })

  /* ---------------------------------------------------- terms from client */
  useEffect(() => {
    if (number) return // issued: nothing may change

    if (!clientId) {
      appliedClient.current = clientId
      setClientTerm(null)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/clienti/${clientId}?depth=0`, { credentials: 'include' })
        if (!res.ok) return
        const c = (await res.json()) as Client
        if (cancelled) return

        // Decided here, after the wait, and not before it: in development
        // React runs an effect twice and cancels the first run, so a ref
        // updated up front would make the second run look like "no change".
        const isNewClient = clientId !== appliedClient.current
        appliedClient.current = clientId

        // Always known, so the due date can follow the issue date even on a
        // draft that was merely opened.
        const term = Number(c.termenPlata)
        setClientTerm(Number.isFinite(term) ? term : null)

        if (!isNewClient) return

        if (c.moneda) setField('moneda', c.moneda)
        setField('taxareInversa', NO_VAT_REGIMES.has(String(c.regimFiscal)))
        // The project belonged to the previous client.
        setField('proiect', null)

        if (Number.isFinite(term)) {
          const issued = toIsoDate(issueDate) ?? new Date().toISOString()
          setField('dataScadenta', new Date(Date.parse(issued) + term * 86400000).toISOString())
        }

        setModified(true)
      } catch {
        // Leaving the form untouched is the safe failure here.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clientId, number]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------- due date follows issue */
  useEffect(() => {
    if (number) return
    if (issueDate === previousIssueDate.current) return
    previousIssueDate.current = issueDate

    const issued = toIsoDate(issueDate)
    if (!issued || clientTerm === null) return
    setField('dataScadenta', new Date(Date.parse(issued) + clientTerm * 86400000).toISOString())
    setModified(true)
  }, [issueDate, number]) // eslint-disable-line react-hooks/exhaustive-deps

  /* --------------------------------------------------- series follows type */
  useEffect(() => {
    if (number) return
    if (previousType.current === null) {
      previousType.current = docType
      return // first render is not a change
    }
    if (docType === previousType.current) return
    previousType.current = docType
    ;(async () => {
      try {
        const res = await fetch('/api/globals/setari-firma?depth=0', { credentials: 'include' })
        if (!res.ok) return
        const s = (await res.json()) as { serieImplicita?: string; serieProforma?: string }
        const series = docType === 'proforma' ? s.serieProforma : s.serieImplicita
        if (series) {
          setField('serie', series)
          setModified(true)
        }
      } catch {
        // Keep whatever series is already in the field.
      }
    })()
  }, [docType, number]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
