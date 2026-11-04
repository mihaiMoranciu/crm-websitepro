'use client'

import React, { useState } from 'react'
import { Button, useAllFormFields, useDocumentInfo, useFormModified } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

import { errorMessage } from './documentSync'

const contentStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45em',
}

export function ConvertProformaButton() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const modified = useFormModified()
  const router = useRouter()

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  // Read from form state so the button follows the type and status live.
  const docType = String(fields.tip?.value ?? 'fiscala')
  const number = fields.numar?.value
  const status = String(fields.status?.value ?? '')

  if (!id || docType !== 'proforma' || !number || status === 'anulata') return null

  const convert = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/facturi/${id}/converteste`, {
        method: 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      if (!res.ok) {
        setMessage({ text: errorMessage(body, 'A eșuat conversia.'), error: true })
        return
      }
      router.push(`/admin/collections/facturi/${body.id}`)
    } catch {
      setMessage({ text: 'Nu am putut contacta serverul.', error: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBottom: 'calc(var(--base) * 0.6)' }}>
      <Button buttonStyle="primary" onClick={convert} disabled={modified || busy}>
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          {busy ? 'Se creează...' : 'Convertește în factură fiscală'}
        </span>
      </Button>
      <p style={{ margin: '6px 0 0', color: 'var(--theme-elevation-500)' }}>
        Se creează o ciornă de factură cu aceleași linii. Când o emiți, încasările de pe proformă
        trec pe ea, iar proforma se închide.
      </p>
      {message ? (
        <p
          style={{
            margin: '6px 0 0',
            color: message.error ? 'var(--theme-error-600)' : 'var(--brand)',
          }}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
