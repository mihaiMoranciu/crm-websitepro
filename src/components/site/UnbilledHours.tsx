'use client'

import React, { useState } from 'react'
import { Checkbox } from '@radix-ui/themes'

/*
 * The hours of one project that have not been invoiced yet, the way the CRM
 * offers them when an invoice is drafted. Tick or untick a row and the
 * invoice line under the list follows, as it does in the app. Sample data.
 */

const RATE = 150

const ENTRIES = [
  { id: 'a', date: '3 nov.', what: 'Formular de comandă', hours: 4.5, billable: true },
  { id: 'b', date: '4 nov.', what: 'Legătura cu curierul', hours: 3, billable: true },
  { id: 'c', date: '5 nov.', what: 'Corecturi după test', hours: 2, billable: true },
  { id: 'd', date: '6 nov.', what: 'Ședință internă', hours: 1, billable: false },
]

const number = new Intl.NumberFormat('ro-RO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const money = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function UnbilledHours() {
  const [picked, setPicked] = useState(
    () => new Set(ENTRIES.filter((e) => e.billable).map((e) => e.id)),
  )

  const toggle = (id: string, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const hours = ENTRIES.filter((e) => picked.has(e.id)).reduce((sum, e) => sum + e.hours, 0)

  return (
    <div>
      <ul className="m-0 list-none divide-y divide-frame p-0">
        {ENTRIES.map((entry) => (
          <li key={entry.id}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
              <Checkbox
                checked={picked.has(entry.id)}
                onCheckedChange={(v) => toggle(entry.id, v === true)}
              />
              <span className="w-12 shrink-0 text-subtle tabular-nums">{entry.date}</span>
              <span className="min-w-0 flex-1 truncate text-strong">
                {entry.what}
                {entry.billable ? null : (
                  <span className="ml-2 text-xs text-subtle">nefacturabil</span>
                )}
              </span>
              <span className="text-subtle tabular-nums">{number.format(entry.hours)} h</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="border-t border-frame bg-(--accent-a2) px-4 py-3.5 text-sm">
        <span className="block text-xs text-subtle">Linie nouă pe factură</span>
        <span className="mt-1 flex items-baseline justify-between gap-4">
          <span className="text-strong">
            Dezvoltare aplicație, {number.format(hours)} ore × {money.format(RATE)} lei
          </span>
          <span className="font-medium text-strong tabular-nums">
            {money.format(hours * RATE)} lei
          </span>
        </span>
      </div>
    </div>
  )
}
