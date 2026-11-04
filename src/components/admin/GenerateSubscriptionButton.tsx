'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button, useAllFormFields, useDocumentInfo, useFormModified } from '@payloadcms/ui'

import { errorMessage, useReloadDocument } from './documentSync'

const contentStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45em',
}

const formatDay = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString('ro-RO') : '-')

/**
 * Draws up the next invoice without waiting for the scheduler.
 *
 * What it produces is a draft, same as the nightly sweep, so pressing it early
 * costs nothing: the period is still billed once, and the number is still
 * taken by a person.
 */
export function GenerateSubscriptionButton() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const modified = useFormModified()
  const reload = useReloadDocument()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ text: string; invoiceId?: number | string } | null>(null)

  const active = Boolean(fields.activ?.value)
  const nextDate = fields.urmatoareaEmitere?.value

  if (!id) {
    return (
      <p style={{ margin: 0, color: 'var(--theme-elevation-500)' }}>
        Salvează abonamentul ca să poți genera facturi din el.
      </p>
    )
  }

  const generate = async () => {
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/abonamente/${id}/genereaza`, {
        method: 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      // The generator moves the schedule even when it drafts nothing (a period
      // that already has its invoice is stepped over), so the form is rebuilt
      // either way. Otherwise the next save would write the old schedule back.
      await reload()
      if (!res.ok) {
        setError(errorMessage(body, 'Nu am putut genera factura.'))
        return
      }
      setSuccess({
        text: `Ciornă creată pentru ${body.period}.`,
        invoiceId: body.invoiceId,
      })
    } catch {
      setError('Nu am putut contacta serverul.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 'calc(var(--base) * 0.6)' }}>
      <Button buttonStyle="secondary" onClick={generate} disabled={busy || modified || !active}>
        <span style={contentStyle}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
          Generează factura acum
        </span>
      </Button>

      <p style={{ margin: '6px 0 0', color: 'var(--theme-elevation-500)' }}>
        {modified
          ? 'Salvează întâi modificările.'
          : !active
            ? 'Abonamentul este oprit.'
            : `Următoarea la ${formatDay(nextDate)}. Se creează ciornă, numărul îl dai tu la emitere.`}
      </p>

      {error ? <p style={{ margin: '6px 0 0', color: 'var(--theme-error-600)' }}>{error}</p> : null}

      {success ? (
        <p style={{ margin: '6px 0 0', color: 'var(--brand, #1f7a4d)' }}>
          {success.text}{' '}
          {success.invoiceId ? (
            <Link href={`/admin/collections/facturi/${success.invoiceId}`}>Deschide factura</Link>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
