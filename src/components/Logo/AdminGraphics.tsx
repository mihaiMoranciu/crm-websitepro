import React from 'react'

import { LogoMark } from './Logo'

/*
 * The brand in the admin panel: the full logo on the login screen, the mark
 * in the navigation. The panel has no Radix theme, so the mark falls back to
 * the brand hex and the name takes the panel's own text colour.
 */

export function AdminLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45em',
        fontSize: 32,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: 'var(--theme-text)',
      }}
    >
      <LogoMark style={{ height: '0.8em', width: '1.14em', flexShrink: 0 }} />
      WebsitePro
    </span>
  )
}

export function AdminIcon() {
  return <LogoMark square title="WebsitePro" style={{ width: '100%', height: '100%' }} />
}
