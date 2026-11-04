'use client'

import React from 'react'
import {
  BarChart3,
  Check,
  Factory,
  ListChecks,
  Lock,
  ReceiptText,
  Search,
  UserCog,
  UsersRound,
  Zap,
} from 'lucide-react'

import { cn } from '@/utilities/ui'

import { marked, MockFrame, ShowcaseLayout, type Step, useSteps } from './Showcase'

/*
 * The web app showcase: "Mobila Nord", a made-up furniture maker that kept
 * its orders in a spreadsheet. Three things a custom app changes: everything
 * in one place, each person seeing only their part, and the repeated steps
 * done by the app. Sample data throughout.
 */

const STEPS: Step[] = [
  {
    icon: ListChecks,
    title: 'Toate comenzile într-un singur loc.',
    text: 'Cine lucrează la ce, până când și în ce stadiu e, fără să întrebi pe nimeni.',
  },
  {
    icon: UserCog,
    title: 'Fiecare vede ce îl privește.',
    text: 'Atelierul vede producția, contabilitatea vede facturile, iar prețurile rămân la cine trebuie.',
  },
  {
    icon: Zap,
    title: 'Pașii repetați se fac singuri.',
    text: 'O comandă livrată emite factura și anunță clientul, fără ca cineva să își amintească.',
  },
]

const NAV = [
  { icon: ListChecks, label: 'Comenzi', open: true },
  { icon: Factory, label: 'Producție', open: true },
  { icon: UsersRound, label: 'Clienți', open: false },
  { icon: ReceiptText, label: 'Facturi', open: false },
  { icon: BarChart3, label: 'Rapoarte', open: false },
]

type Tone = 'amber' | 'iris' | 'gray' | 'grass'

const TONES: Record<Tone, string> = {
  amber: 'bg-(--amber-a3) text-(--amber-11)',
  iris: 'bg-(--iris-a3) text-(--iris-11)',
  gray: 'bg-(--gray-a3) text-(--gray-11)',
  grass: 'bg-(--grass-a3) text-(--grass-11)',
}

const ROWS: {
  client: string
  what: string
  due: string
  value: string
  who: string
  state: string
  tone: Tone
}[] = [
  {
    client: 'Biroul Nova',
    what: 'Recepție',
    due: '10 nov.',
    value: '7.300',
    who: 'DC',
    state: 'Livrare',
    tone: 'gray',
  },
  {
    client: 'Hotel Sigma',
    what: '40 de scaune',
    due: '18 nov.',
    value: '12.400',
    who: 'AM',
    state: 'De aprobat',
    tone: 'amber',
  },
  {
    client: 'Școala nr. 7',
    what: 'Bănci, 2 săli',
    due: '22 nov.',
    value: '8.900',
    who: 'RI',
    state: 'În producție',
    tone: 'iris',
  },
  {
    client: 'Cafe Doi',
    what: 'Mese terasă',
    due: '15 nov.',
    value: '5.600',
    who: 'AM',
    state: 'În producție',
    tone: 'iris',
  },
  {
    client: 'Pensiunea Ana',
    what: 'Paturi, 6 camere',
    due: '2 dec.',
    value: '14.200',
    who: 'RI',
    state: 'Ofertă trimisă',
    tone: 'gray',
  },
]

/* Who the restricted view belongs to: Andrei, from the workshop. */
const WORKSHOP = 'AM'

/* Columns of the order table, the same template for the header and the rows. */
const COLS =
  'grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[1.4fr_4rem_5rem_1.75rem_6.5rem] lg:grid-cols-[1.3fr_1.2fr_4rem_5rem_1.75rem_6.5rem]'

export function AppShowcase() {
  const { ref, active, select } = useSteps(STEPS.length)
  const restricted = active === 1
  const automated = active === 2

  return (
    <ShowcaseLayout
      steps={STEPS}
      label="Ce schimbă aplicația"
      stepsRef={ref}
      active={active}
      onSelect={select}
    >
      <MockFrame className="grid gap-2.5 md:grid-cols-[150px_1fr] sm:gap-3">
        {/* The sidebar: what this person can open. */}
        <div
          className={cn(
            'hidden flex-col gap-0.5 rounded-(--radius-3) bg-(--gray-a2) p-2.5 shadow-[inset_0_0_0_1px_var(--gray-a3)] md:flex',
            marked(restricted),
          )}
        >
          <span className="mb-3 flex items-center gap-2 px-2 pt-1 text-sm font-semibold tracking-tight text-strong">
            <span className="size-3 rounded-[3px] bg-(--accent-9)" />
            Mobila Nord
          </span>
          {NAV.map(({ icon: Icon, label, open }, i) => (
            <span
              key={label}
              className={cn(
                'flex items-center gap-2 rounded-(--radius-2) px-2 py-1.5 text-xs transition-opacity duration-500',
                i === 0 ? 'bg-(--color-panel-solid) text-strong shadow-sm' : 'text-subtle',
                restricted && !open && 'opacity-40',
              )}
            >
              <Icon size={13} strokeWidth={1.75} />
              {label}
              {restricted && !open ? (
                <Lock size={11} strokeWidth={1.75} className="ml-auto" />
              ) : null}
            </span>
          ))}
        </div>

        {/* The main view. */}
        <div className="min-w-0">
          <div className="flex items-center gap-3 px-1 pt-1 pb-3">
            <span className="text-sm font-medium text-strong">Comenzi</span>
            <span className="hidden items-center gap-2 rounded-(--radius-2) px-2.5 py-1 text-xs text-subtle shadow-[inset_0_0_0_1px_var(--gray-a5)] sm:flex">
              <Search size={12} strokeWidth={1.75} />
              Caută client sau comandă
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full bg-(--accent-a3) px-2.5 py-0.5 text-[11px] font-medium text-(--accent-11) transition-opacity duration-300',
                  restricted ? 'opacity-100' : 'opacity-0',
                )}
              >
                Vezi ca: Andrei, atelier
              </span>
              <span className="grid size-6 place-items-center rounded-full bg-(--gray-a4) text-[10px] font-medium text-strong">
                {restricted ? 'AM' : 'DC'}
              </span>
            </span>
          </div>

          <div className="mb-3 flex gap-1.5 px-1 text-[11px]">
            <span className="rounded-full bg-(--gray-a3) px-2.5 py-0.5 text-strong">Toate 24</span>
            <span className="rounded-full px-2.5 py-0.5 text-subtle shadow-[inset_0_0_0_1px_var(--gray-a5)]">
              De aprobat 3
            </span>
            <span className="rounded-full px-2.5 py-0.5 text-subtle shadow-[inset_0_0_0_1px_var(--gray-a5)]">
              În producție 8
            </span>
          </div>

          <div
            className={cn(
              'overflow-hidden rounded-(--radius-3) shadow-[inset_0_0_0_1px_var(--gray-a4)]',
              marked(active === 0),
            )}
          >
            <div
              className={cn(
                COLS,
                'border-b border-frame bg-(--gray-a2) px-3 py-2 text-[11px] text-subtle',
              )}
            >
              <span>Client</span>
              <span className="hidden lg:block">Produs</span>
              <span className="hidden sm:block">Termen</span>
              <span className="hidden text-right sm:block">Lei</span>
              <span className="hidden sm:block" />
              <span>Stare</span>
            </div>
            {ROWS.map((row) => {
              const mine = row.who === WORKSHOP
              const done = automated && row.client === 'Biroul Nova'
              return (
                <div
                  key={row.client}
                  className={cn(
                    COLS,
                    'border-b border-frame px-3 py-2.5 text-xs transition-[opacity,background-color] duration-500 last:border-b-0',
                    restricted && !mine && 'opacity-25',
                    done && 'bg-(--grass-a2)',
                  )}
                >
                  <span className="truncate text-strong">{row.client}</span>
                  <span className="hidden truncate text-subtle lg:block">{row.what}</span>
                  <span className="hidden text-subtle sm:block">{row.due}</span>
                  <span className="hidden justify-end text-strong tabular-nums sm:flex">
                    {restricted ? (
                      <Lock size={11} strokeWidth={1.75} className="text-subtle" />
                    ) : (
                      row.value
                    )}
                  </span>
                  <span className="hidden size-6 place-items-center rounded-full bg-(--gray-a3) text-[9px] font-medium text-strong sm:grid">
                    {row.who}
                  </span>
                  <span
                    className={cn(
                      'rounded-(--radius-1) px-1.5 py-0.5 text-center text-[11px] font-medium transition-colors duration-500',
                      TONES[done ? 'grass' : row.tone],
                    )}
                  >
                    {done ? 'Livrată' : row.state}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 3: the app reporting what it did on its own. */}
        <div
          className={cn(
            'absolute right-3 bottom-3 w-[min(310px,88%)] rounded-(--radius-4) bg-(--color-panel-solid) p-4 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45),inset_0_0_0_1px_var(--gray-a5)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            automated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
        >
          <span className="flex items-center gap-2 text-xs font-medium text-strong">
            <span className="grid size-5 place-items-center rounded-full bg-(--accent-a3) text-(--accent-11)">
              <Zap size={11} strokeWidth={2} />
            </span>
            Biroul Nova a primit comanda
          </span>
          <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0 text-xs text-subtle">
            {[
              'Factura MN-0412 a fost emisă',
              'Clientul a primit emailul cu factura',
              'Dana a fost anunțată să urmărească plata',
            ].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Check size={12} strokeWidth={2} className="shrink-0 text-(--accent-11)" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </MockFrame>
    </ShowcaseLayout>
  )
}
