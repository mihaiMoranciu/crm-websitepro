'use client'

import React from 'react'
import { useAllFormFields } from '@payloadcms/ui'

/** Days after issue by which the invoice must reach the SPV. */
const EFACTURA_DEADLINE_DAYS = 5

const dot: React.CSSProperties = {
  display: 'inline-block',
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  marginRight: '0.5em',
  verticalAlign: 'middle',
}

/**
 * Tells you, without leaving the lines, whether the invoice has gone out.
 *
 * Only the state: the act of sending has three channels, a recipient and a
 * log, and lives on its own tab. Duplicating the action here would mean two
 * places that can send the same document.
 */
export function DeliveryStatus() {
  const [fields] = useAllFormFields()

  const number = fields.numar?.value
  const sent = Boolean(fields.trimisa?.value)
  const status = String(fields.status?.value ?? '')
  const docType = String(fields.tip?.value ?? 'fiscala')
  const issueDate = fields.dataEmitere?.value
  const sentAt = fields.dataTrimitere?.value

  if (!number || status === 'anulata') return null

  const formatDay = (v: unknown) => (v ? new Date(String(v)).toLocaleDateString('ro-RO') : '')

  if (sent) {
    return (
      <p style={{ margin: '0 0 8px', color: 'var(--theme-elevation-500)' }}>
        <span style={{ ...dot, background: 'var(--brand, #1f7a4d)' }} />
        Trimisă {sentAt ? `pe ${formatDay(sentAt)}` : ''}. Documentul e blocat.
      </p>
    )
  }

  const daysSinceIssue = issueDate
    ? Math.floor((Date.now() - Date.parse(String(issueDate))) / 86400000)
    : 0
  // A proforma has no SPV deadline; it is not a fiscal document.
  const overdue = docType !== 'proforma' && daysSinceIssue > EFACTURA_DEADLINE_DAYS

  return (
    <p
      style={{
        margin: '0 0 8px',
        color: overdue ? 'var(--theme-error-600)' : 'var(--theme-elevation-500)',
      }}
    >
      <span
        style={{
          ...dot,
          background: overdue ? 'var(--theme-error-600)' : 'var(--theme-elevation-300)',
        }}
      />
      {overdue
        ? `Netrimisă de ${daysSinceIssue} zile. e-Factura cere ${EFACTURA_DEADLINE_DAYS}.`
        : 'Netrimisă. Se poate încă modifica.'}
    </p>
  )
}
