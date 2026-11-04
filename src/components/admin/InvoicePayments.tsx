'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'

import { errorMessage, useReloadDocument } from './documentSync'

import './InvoicePayments.scss'

/** The two values the server derives from the payments. */
const PAYMENT_FIELDS = ['sumaIncasata', 'status']

type Payment = {
  id: number
  suma: number
  date: string
  metoda: string
  referinta?: string | null
}

const bc = 'invoice-payments'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const formatDay = (iso: string) => new Date(iso).toLocaleDateString('ro-RO')

const METHODS = [
  { v: 'transfer', l: 'Transfer bancar' },
  { v: 'numerar', l: 'Numerar' },
  { v: 'card', l: 'Card' },
  { v: 'paypal', l: 'PayPal' },
  { v: 'stripe', l: 'Stripe' },
  { v: 'alta', l: 'Altă metodă' },
]

/**
 * Payments recorded from the invoice they belong to.
 *
 * Replaces the join field, whose list and add button do not refresh after the
 * first save, which made a second payment look impossible. Here the list, the
 * remaining balance and the invoice status are all driven from state we own,
 * so each entry lands without a reload.
 */
export function InvoicePayments() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const reload = useReloadDocument()

  const [list, setList] = useState<Payment[]>([])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('transfer')
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const number = fields.numar?.value
  const docType = String(fields.tip?.value ?? 'fiscala')
  const status = String(fields.status?.value ?? '')
  const currency = String(fields.moneda?.value ?? '')
  const total = Number(fields.total?.value) || 0

  const collected = round2(list.reduce((s, i) => s + Number(i.suma), 0))
  const remaining = round2(total - collected)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(
        `/api/incasari?where[factura][equals]=${id}&limit=200&depth=0&sort=data`,
        { credentials: 'include' },
      )
      if (!res.ok) return
      const body = await res.json()
      setList(body.docs ?? [])
    } catch {
      // An empty list is better than a broken panel.
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (!id || !number || docType === 'storno' || status === 'anulata') return null

  const add = async () => {
    const value = Number(String(amount).replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      setError('Introdu o sumă mai mare decât zero.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/incasari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          factura: id,
          suma: value,
          data: new Date(date).toISOString(),
          metoda: method,
          referinta: reference || undefined,
        }),
      })
      const body = await res.json()

      if (!res.ok) {
        setError(errorMessage(body, 'Încasarea nu a putut fi salvată.'))
        return
      }

      setAmount('')
      setReference('')
      await load()
      await reload(PAYMENT_FIELDS)
    } catch {
      setError('Nu am putut contacta serverul.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (paymentId: number) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/incasari/${paymentId}?trash=false`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        // Most often a role that may record payments but not remove them.
        const body = await res.json().catch(() => null)
        setError(
          res.status === 403
            ? 'Nu ai drept să ștergi încasări.'
            : errorMessage(body, 'Nu am putut șterge încasarea.'),
        )
        return
      }
      await load()
      await reload(PAYMENT_FIELDS)
    } catch {
      setError('Nu am putut șterge încasarea.')
    } finally {
      setBusy(false)
    }
  }

  const money = (n: number) => `${n.toFixed(2)} ${currency}`

  return (
    <div className={bc}>
      <div className={`${bc}__summary`}>
        <span>
          Încasat <strong>{money(collected)}</strong> din {money(total)}
        </span>
        <span className={remaining > 0.01 ? `${bc}__remaining` : `${bc}__settled`}>
          {remaining > 0.01 ? `Rest ${money(remaining)}` : 'Achitată integral'}
        </span>
      </div>

      {list.length > 0 ? (
        <ul className={`${bc}__list`}>
          {list.map((i) => (
            <li key={i.id} className={`${bc}__row`}>
              <span className={`${bc}__date`}>{formatDay(i.date)}</span>
              <span className={`${bc}__method`}>
                {METHODS.find((m) => m.v === i.metoda)?.l ?? i.metoda}
                {i.referinta ? ` · ${i.referinta}` : ''}
              </span>
              <span className={`${bc}__amount`}>{money(Number(i.suma))}</span>
              <button
                type="button"
                className={`${bc}__remove`}
                onClick={() => remove(i.id)}
                disabled={busy}
                aria-label="Șterge încasarea"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${bc}__empty`}>Nicio încasare înregistrată.</p>
      )}

      {remaining > 0.01 ? (
        <div className={`${bc}__form`}>
          <input
            type="text"
            inputMode="decimal"
            placeholder={`Sumă (max ${remaining})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            {METHODS.map((m) => (
              <option key={m.v} value={m.v}>
                {m.l}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Referință"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Button buttonStyle="secondary" onClick={add} disabled={busy}>
            {busy ? 'Se salvează...' : 'Adaugă încasare'}
          </Button>
        </div>
      ) : null}

      {error ? <p className={`${bc}__error`}>{error}</p> : null}
    </div>
  )
}
