'use client'

import React from 'react'
import { useAllFormFields } from '@payloadcms/ui'

import './InvoiceTotals.scss'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const num = (v: unknown) => Number(v) || 0

/**
 * Live totals for the invoice being edited.
 *
 * The stored figures are still computed server side on save, which stays the
 * single source of truth. This panel only mirrors that arithmetic against the
 * current form state, so changing a rate or a quantity updates the amounts
 * immediately instead of after a save.
 */
export function InvoiceTotals() {
  const [fields] = useAllFormFields()

  // Array rows arrive flattened as `linii.0.cantitate`, so collect the indexes.
  const indexes = new Set<string>()
  for (const key of Object.keys(fields)) {
    const match = /^linii\.(\d+)\./.exec(key)
    if (match) indexes.add(match[1])
  }

  const lines = Array.from(indexes)
    .sort((a, b) => Number(a) - Number(b))
    .map((i) => ({
      index: Number(i),
      descriere: String(fields[`linii.${i}.descriere`]?.value ?? ''),
      cantitate: num(fields[`linii.${i}.cantitate`]?.value),
      unitate: String(fields[`linii.${i}.unitate`]?.value ?? ''),
      pretUnitar: num(fields[`linii.${i}.pretUnitar`]?.value),
    }))

  const vatRate = num(fields.cotaTva?.value)
  const reverseCharge = Boolean(fields.taxareInversa?.value)
  const currency = String(fields.moneda?.value ?? '')

  const subtotal = round2(lines.reduce((s, l) => s + l.cantitate * l.pretUnitar, 0))
  const vatAmount = reverseCharge ? 0 : round2(subtotal * (vatRate / 100))
  const total = round2(subtotal + vatAmount)

  const number = fields.numar?.value
  const collected = num(fields.sumaIncasata?.value)
  const rest = round2(total - collected)

  const money = (n: number) =>
    `${n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`

  if (lines.length === 0) {
    return <div className="invoice-totals invoice-totals--empty">Nicio linie pe factură.</div>
  }

  return (
    <div className="invoice-totals">
      <ul className="invoice-totals__lines">
        {lines.map((l) => (
          <li key={l.index} className="invoice-totals__line">
            <span className="invoice-totals__desc">{l.descriere || <em>fără descriere</em>}</span>
            <span className="invoice-totals__calcul">
              {l.cantitate} {l.unitate} x {l.pretUnitar}
            </span>
            <span className="invoice-totals__amount">
              {money(round2(l.cantitate * l.pretUnitar))}
            </span>
          </li>
        ))}
      </ul>

      <dl className="invoice-totals__summary">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div>
          <dt>TVA {reverseCharge ? '(taxare inversă)' : `${vatRate}%`}</dt>
          <dd>{money(vatAmount)}</dd>
        </div>
        <div className="invoice-totals__total">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>

      {/* Only meaningful once the document is issued and can be collected. */}
      {number ? (
        <dl className="invoice-totals__summary invoice-totals__payment">
          <div>
            <dt>Încasat</dt>
            <dd>{money(collected)}</dd>
          </div>
          <div>
            <dt>{rest > 0.01 ? 'Rest de plată' : 'Achitat integral'}</dt>
            <dd>{rest > 0.01 ? money(rest) : money(0)}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}
