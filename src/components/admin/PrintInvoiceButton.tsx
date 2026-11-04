'use client'

import React from 'react'
import { Button, useDocumentInfo, useFormModified } from '@payloadcms/ui'

/** Inline so the icon needs no stylesheet of its own. */
const contentStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45em',
}

export function PrintInvoiceButton() {
  const { id } = useDocumentInfo()
  const modified = useFormModified()

  if (!id) return null

  return (
    <div style={{ marginBottom: 'calc(var(--base) * 0.6)' }}>
      <Button
        buttonStyle="primary"
        disabled={modified}
        onClick={() => window.open(`/api/facturi/${id}/print`, '_blank', 'noopener')}
      >
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
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>
          Printează / PDF
        </span>
      </Button>
      {modified ? (
        <p style={{ margin: '6px 0 0', color: 'var(--theme-elevation-500)' }}>
          Salvează întâi. Documentul se generează din datele stocate.
        </p>
      ) : null}
    </div>
  )
}
