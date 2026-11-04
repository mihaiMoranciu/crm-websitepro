'use client'

import React, { useState } from 'react'
import { Button, useAllFormFields, useDocumentInfo, useFormModified } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

import { errorMessage } from './documentSync'

/** Inline so the icon needs no stylesheet of its own. */
const contentStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45em',
}

export function StornoButton() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const modified = useFormModified()
  const router = useRouter()

  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read from form state, so the button appears and disappears as you change
  // the status, without waiting for a save.
  const number = fields.numar?.value
  const docType = String(fields.tip?.value ?? 'fiscala')
  const status = String(fields.status?.value ?? '')

  // A proforma has nothing fiscal to reverse; it is cancelled from its status.
  if (!id || !number || docType !== 'fiscala' || status === 'anulata') return null

  const reverse = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/facturi/${id}/storneaza`, {
        method: 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      if (!res.ok) {
        setError(errorMessage(body, 'A eșuat stornarea.'))
        return
      }
      router.push(`/admin/collections/facturi/${body.id}`)
    } catch {
      setError('Nu am putut contacta serverul.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 'calc(var(--base) * 0.6)' }}>
      {confirming ? (
        <>
          <p style={{ margin: '0 0 8px', color: 'var(--theme-elevation-700)' }}>
            Se emite un document nou cu valori negative, iar aceasta devine anulată. Orele facturate
            redevin disponibile. Operațiunea nu poate fi anulată.
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button buttonStyle="error" onClick={reverse} disabled={busy}>
              {busy ? 'Se emite...' : 'Confirmă stornarea'}
            </Button>
            <Button buttonStyle="subtle" onClick={() => setConfirming(false)} disabled={busy}>
              Renunță
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button buttonStyle="error" onClick={() => setConfirming(true)} disabled={modified}>
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
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Stornează factura
            </span>
          </Button>
          {modified ? (
            <p style={{ margin: '6px 0 0', color: 'var(--theme-elevation-500)' }}>
              Salvează întâi modificările.
            </p>
          ) : null}
        </>
      )}

      {error ? <p style={{ margin: '6px 0 0', color: 'var(--theme-error-600)' }}>{error}</p> : null}
    </div>
  )
}
