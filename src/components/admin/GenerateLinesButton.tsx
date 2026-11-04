'use client'

import React, { useEffect, useState } from 'react'
import { Button, useAllFormFields, useDocumentInfo, useForm } from '@payloadcms/ui'

import { errorMessage } from './documentSync'

import './GenerateLinesButton.scss'

type Entry = { id: number; date: string; description: string; hours: number }

type Available = {
  hourly: boolean
  linked?: number
  /** Fixed-price projects only: what other invoices have already charged. */
  invoiced?: number
  remaining?: number
  project: { name: string; hourlyRate?: number; value?: number; currency?: string }
  entries: Entry[]
}

type Line = {
  description: string
  quantity: number
  unit: 'ore' | 'buc'
  unitPrice: number
  timeEntryIds: number[]
}

const bc = 'generate-lines'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })

/** Wraps plain values in the shape Payload's form state expects for a row. */
const rowState = (line: Line) => ({
  descriere: { initialValue: line.description, valid: true, value: line.description },
  cantitate: { initialValue: line.quantity, valid: true, value: line.quantity },
  unitate: { initialValue: line.unit, valid: true, value: line.unit },
  pretUnitar: { initialValue: line.unitPrice, valid: true, value: line.unitPrice },
  pontajIds: { initialValue: line.timeEntryIds, valid: true, value: line.timeEntryIds },
})

export function GenerateLinesButton() {
  const { addFieldRow, setModified } = useForm()
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()

  const [available, setAvailable] = useState<Available | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [detailed, setDetailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  // Everything is read from the form, so choosing a project or changing the
  // status updates the panel immediately, with no save and no reload.
  // Editable until the document leaves, not until it gets a number.
  const isDraft = !fields.trimisa?.value
  const projectRaw = fields.proiect?.value
  const projectId =
    projectRaw && typeof projectRaw === 'object'
      ? (projectRaw as { id?: number }).id
      : (projectRaw as number | string | undefined)

  useEffect(() => {
    // Whatever was on screen belonged to the previous project.
    setAvailable(null)
    setSelected(new Set())
    setMessage(null)
    setLoading(false)

    if (!projectId || !isDraft) return

    // Switching projects quickly leaves two requests in flight, and the slower
    // one would otherwise win and list the wrong project's hours.
    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const res = await fetch(
          `/api/facturi/pontaj-disponibil?project=${projectId}${id ? `&invoice=${id}` : ''}`,
          { credentials: 'include' },
        )
        const body = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setMessage({ text: errorMessage(body, 'Nu am putut încărca pontajul.'), error: true })
          return
        }
        setAvailable(body)
        setSelected(new Set((body.entries as Entry[]).map((i) => i.id)))
      } catch {
        if (!cancelled) setMessage({ text: 'Nu am putut contacta serverul.', error: true })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [projectId, isDraft, id])

  if (!projectId) {
    return <div className={`${bc} ${bc}--empty`}>Alege proiectul ca să vezi orele nefacturate.</div>
  }

  if (!isDraft) {
    return (
      <div className={`${bc} ${bc}--empty`}>
        Factura a fost trimisă și nu își mai schimbă liniile. Pentru corecție, stornează.
      </div>
    )
  }

  const toggle = (entryId: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(entryId)) next.delete(entryId)
      else next.add(entryId)
      return next
    })

  // Hours already claimed by a line currently in the form. Derived from form
  // state, so deleting a line puts its hours straight back in the list.
  const inForm = new Set<number>()
  for (const key of Object.keys(fields)) {
    if (!/^linii\.\d+\.pontajIds$/.test(key)) continue
    const value = fields[key]?.value
    if (Array.isArray(value)) for (const id of value) inForm.add(Number(id))
  }

  const freeEntries = (available?.entries ?? []).filter((i) => !inForm.has(i.id))

  const allChecked = freeEntries.length > 0 && freeEntries.every((i) => selected.has(i.id))

  /** Current number of rows, read from live form state rather than the database. */
  const countRows = (prefix: string) => {
    const indexes = new Set<string>()
    for (const key of Object.keys(fields)) {
      const m = new RegExp(`^${prefix}\\.(\\d+)\\.`).exec(key)
      if (m) indexes.add(m[1])
    }
    return indexes.size
  }

  // What a fixed-price project still has to be invoiced for. A recurring fee
  // carries no `ramas` and is simply offered at its agreed value every time.
  const fixedValue = Number(available?.remaining ?? available?.project.value) || 0
  const fullyInvoiced = available?.remaining !== undefined && available.remaining <= 0
  // A fixed price goes on the invoice once. Read from the form, like the hours
  // above, so deleting the line makes it available again.
  const fixedAdded =
    Boolean(available) &&
    !available?.hourly &&
    Object.keys(fields).some(
      (key) =>
        /^linii\.\d+\.descriere$/.test(key) && fields[key]?.value === available?.project.name,
    )

  const add = () => {
    if (!available) return

    const lines: Line[] = []
    const chosen = freeEntries.filter((i) => selected.has(i.id))

    if (available.hourly) {
      const rate = Number(available.project.hourlyRate) || 0
      if (!rate) return setMessage({ text: 'Proiectul nu are tarif orar.', error: true })
      if (chosen.length === 0) return setMessage({ text: 'Nu ai selectat nimic.', error: true })

      if (detailed) {
        for (const i of chosen) {
          lines.push({
            description: i.description,
            quantity: i.hours,
            unit: 'ore',
            unitPrice: rate,
            timeEntryIds: [i.id],
          })
        }
      } else {
        lines.push({
          description: `Servicii dezvoltare - ${available.project.name}`,
          quantity: round2(chosen.reduce((s, i) => s + i.hours, 0)),
          unit: 'ore',
          unitPrice: rate,
          timeEntryIds: chosen.map((i) => i.id),
        })
      }
    } else {
      if (fullyInvoiced) {
        return setMessage({
          text: 'Valoarea proiectului este deja facturată integral.',
          error: true,
        })
      }
      lines.push({
        description: available.project.name,
        quantity: 1,
        unit: 'buc',
        unitPrice: fixedValue,
        timeEntryIds: [],
      })
    }

    // Append to whatever the form currently holds, so rows the user deleted
    // stay deleted and nothing is written until they save.
    let index = countRows('linii')
    for (const line of lines) {
      addFieldRow({
        path: 'linii',
        schemaPath: 'linii',
        rowIndex: index,
        subFieldState: rowState(line) as never,
      })
      index++
    }

    setModified(true)
    setSelected(new Set())

    setMessage({
      text: `${lines.length} linii adăugate. Orele se leagă la salvare; șterge linia ca să le eliberezi.`,
      error: false,
    })
  }

  const selectedHours = round2(
    freeEntries.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.hours, 0),
  )
  const rate = available?.project.hourlyRate ?? 0
  const currency = available?.project.currency ?? ''

  return (
    <div className={bc}>
      {loading ? <p className={`${bc}__hint`}>Se încarcă pontajul...</p> : null}

      {available && !available.hourly ? (
        <p className={`${bc}__hint`}>
          {available.remaining === undefined
            ? `Se adaugă valoarea contractată (${available.project.value} ${currency}).`
            : fullyInvoiced
              ? `Proiect cu preț fix, facturat integral (${available.invoiced} ${currency}).`
              : available.invoiced
                ? `Proiect cu preț fix. Deja facturat ${available.invoiced} din ${available.project.value} ${currency}; se adaugă restul de ${available.remaining} ${currency}.`
                : `Proiect cu preț fix. Se adaugă valoarea contractată (${available.project.value} ${currency}).`}
        </p>
      ) : null}

      {available?.hourly && freeEntries.length === 0 ? (
        <p className={`${bc}__hint`}>Nu există ore nefacturate pe acest proiect.</p>
      ) : null}

      {available?.hourly && freeEntries.length > 0 ? (
        <>
          <div className={`${bc}__head`}>
            <label className={`${bc}__toggle`}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() =>
                  setSelected(allChecked ? new Set() : new Set(freeEntries.map((i) => i.id)))
                }
              />
              Toate ({freeEntries.length})
            </label>
            <span className={`${bc}__total`}>
              {selectedHours} ore x {rate} {currency} = {round2(selectedHours * rate)} {currency}
            </span>
          </div>

          <ul className={`${bc}__list`}>
            {freeEntries.map((i) => (
              <li key={i.id}>
                <label className={`${bc}__row`}>
                  <input
                    type="checkbox"
                    checked={selected.has(i.id)}
                    onChange={() => toggle(i.id)}
                  />
                  <span className={`${bc}__date`}>{formatDay(i.date)}</span>
                  <span className={`${bc}__desc`}>{i.description}</span>
                  <span className={`${bc}__hours`}>{i.hours}h</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className={`${bc}__actions`}>
        <Button
          buttonStyle="secondary"
          onClick={add}
          disabled={
            loading ||
            !available ||
            (available.hourly ? selected.size === 0 : fixedAdded || fullyInvoiced)
          }
        >
          Adaugă pe factură
        </Button>

        {available?.hourly ? (
          <label className={`${bc}__toggle`}>
            <input
              type="checkbox"
              checked={detailed}
              onChange={(e) => setDetailed(e.target.checked)}
            />
            Câte o linie per intrare
          </label>
        ) : null}
      </div>

      {available?.hourly ? (
        <p className={`${bc}__hint`}>
          Ce lași debifat rămâne nefacturat și apare la următoarea factură.
        </p>
      ) : null}

      {message ? (
        <p className={`${bc}__message${message.error ? ` ${bc}__message--error` : ''}`}>
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
