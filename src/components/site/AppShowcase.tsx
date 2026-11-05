'use client'

import React from 'react'
import {
  BarChartIcon,
  CheckIcon,
  ClockIcon,
  EnvelopeClosedIcon,
  EyeOpenIcon,
  LayersIcon,
  LightningBoltIcon,
  ListBulletIcon,
  LockClosedIcon,
  PersonIcon,
  PlusIcon,
  ReaderIcon,
} from '@radix-ui/react-icons'

import { cn } from '@/utilities/ui'

import {
  AppBar,
  AppBody,
  Fade,
  floating,
  Avatar,
  IconTile,
  type Icon,
  RUN_ON,
  ShowcaseLayout,
  Shot,
  SideNav,
  type Step,
  Timeline,
  useSteps,
} from './Showcase'

/*
 * The web app showcase: a generic company, "Firma ta", that makes things to
 * order. Clients are named only by kind and town, so no made-up brand shows
 * up anywhere. Three things a custom app changes: every order on one board,
 * each person seeing only their part, and the repeated steps done by the app.
 * Sample data throughout.
 */

const STEPS: Step[] = [
  {
    icon: ListBulletIcon,
    title: 'Toate comenzile într-un singur loc.',
    text: 'Cine lucrează la ce, până când și în ce stadiu e, fără să întrebi pe nimeni.',
  },
  {
    icon: EyeOpenIcon,
    title: 'Fiecare vede ce îl privește.',
    text: 'Producția vede ce are de lucrat, contabilitatea vede facturile, iar prețurile rămân la cine trebuie.',
  },
  {
    icon: LightningBoltIcon,
    title: 'Pașii repetați se fac singuri.',
    text: 'O comandă livrată emite factura și anunță clientul, fără ca cineva să își amintească.',
  },
]

const NAV: { icon: Icon; label: string }[] = [
  { icon: ListBulletIcon, label: 'Comenzi' },
  { icon: LayersIcon, label: 'Producție' },
  { icon: PersonIcon, label: 'Clienți' },
  { icon: ReaderIcon, label: 'Facturi' },
  { icon: BarChartIcon, label: 'Rapoarte' },
]

const PAGE_OF_STEP = ['Comenzi', 'Producție', 'Comenzi']

/* What someone from production can open; the rest shows a padlock. */
const HIDDEN_FROM_PRODUCTION = ['Clienți', 'Facturi', 'Rapoarte']

/* ---------- 1. The board ---------- */

type Card = { client: string; no: string; due: string; who: string }

const COLUMNS: { title: string; dot: string; cards: Card[] }[] = [
  {
    title: 'De aprobat',
    dot: 'bg-(--amber-9)',
    cards: [
      { client: 'Hotel, Sibiu', no: '#2040', due: '18 nov', who: 'AM' },
      { client: 'Pensiune, Brașov', no: '#2037', due: '2 dec', who: 'RI' },
    ],
  },
  {
    title: 'În producție',
    dot: 'bg-(--blue-9)',
    cards: [
      { client: 'Școală, Cluj', no: '#2039', due: '22 nov', who: 'DC' },
      { client: 'Cafenea, Iași', no: '#2038', due: '15 nov', who: 'AM' },
    ],
  },
  {
    title: 'Livrare',
    dot: 'bg-(--grass-9)',
    cards: [
      { client: 'Birou, București', no: '#2041', due: '10 nov', who: 'DC' },
      { client: 'Magazin, Arad', no: '#2036', due: '8 nov', who: 'RI' },
    ],
  },
]

function OrderCard({ card, className }: { card: Card; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-(--radius-3) bg-(--color-panel-solid) p-3 shadow-[inset_0_0_0_1px_var(--gray-a4)]',
        className,
      )}
    >
      <span className="block truncate text-[13px] text-strong">{card.client}</span>
      <span className="mt-2.5 flex items-center gap-2 text-[11px] text-subtle">
        <span className="hidden tabular-nums sm:inline">{card.no}</span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <ClockIcon className="size-3" />
          {card.due}
        </span>
        <Avatar initials={card.who} className="ml-auto size-5 text-[8px]" />
      </span>
    </div>
  )
}

function BoardPage() {
  return (
    <div className="p-5 sm:p-7">
      <div className="flex items-center">
        <span className="text-[15px] font-medium text-strong">Comenzi</span>
        <span className="ml-2 text-xs text-subtle">24 active</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-(--radius-2) bg-(--gray-12) px-2.5 py-1 text-xs font-medium text-(--gray-1)">
          <PlusIcon className="size-3" />
          Comandă
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COLUMNS.map((column, c) => (
          <div
            key={column.title}
            className={cn(
              'rounded-(--radius-4) bg-(--gray-a2) p-2 shadow-[inset_0_0_0_1px_var(--gray-a3)]',
              c === 2 && 'hidden sm:block',
            )}
          >
            <span className="flex items-center gap-2 px-1.5 pt-1 pb-2.5 text-xs text-subtle">
              <span className={cn('size-1.5 rounded-full', column.dot)} />
              {column.title}
            </span>
            <div className="flex flex-col gap-2">
              {column.cards.map((card, i) =>
                // One card is picked up mid-move: the thing on this screen that pops.
                c === 1 && i === 0 ? (
                  <OrderCard
                    key={card.no}
                    card={card}
                    className="relative z-10 -translate-y-1 rotate-[2.5deg] shadow-[0_18px_36px_-14px_var(--gray-a10),0_0_0_1px_var(--accent-a7)]"
                  />
                ) : (
                  <OrderCard key={card.no} card={card} className={RUN_ON[i + 1]} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 2. Seen by production ---------- */

const TASKS: [string, string][] = [
  ['Școală, Cluj', '22 nov'],
  ['Cafenea, Iași', '15 nov'],
  ['Hotel, Sibiu', '18 nov'],
  ['Pensiune, Brașov', '2 dec'],
]

function ProductionPage() {
  return (
    <div className="p-5 sm:p-7">
      <span className="text-[15px] font-medium text-strong">De lucrat</span>
      <div className="mt-5 grid grid-cols-[1fr_auto_auto] text-[11px] text-subtle">
        <span className="pb-2">Comandă</span>
        <span className="pb-2 pl-6">Termen</span>
        <span className="pb-2 pl-6">Preț</span>
        {TASKS.map(([client, due], i) => (
          <React.Fragment key={client}>
            <span
              className={cn(
                'flex items-center gap-3 border-t border-frame py-3 text-[13px] text-strong',
                RUN_ON[i],
              )}
            >
              <span className="size-3.5 shrink-0 rounded-full shadow-[inset_0_0_0_1.5px_var(--gray-a7)]" />
              {client}
            </span>
            <span
              className={cn('flex items-center border-t border-frame py-3 pl-6 text-xs', RUN_ON[i])}
            >
              {due}
            </span>
            <span className={cn('flex items-center border-t border-frame py-3 pl-6', RUN_ON[i])}>
              <LockClosedIcon className="size-3" />
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/** Whose eyes the screen is seen through. */
function ViewingAs() {
  return (
    <div
      className={cn(
        'absolute top-14 right-3 flex items-center gap-3 py-2.5 pr-4 pl-2.5 sm:-right-6',
        floating,
      )}
    >
      <IconTile className="size-8">
        <EyeOpenIcon />
      </IconTile>
      <span className="leading-tight">
        <span className="block text-[13px] font-medium text-strong">Cont: Producție</span>
        <span className="block text-[11px] text-subtle">vede 2 din 5 secțiuni</span>
      </span>
    </div>
  )
}

/* ---------- 3. Done on its own ---------- */

const HISTORY = [
  { icon: CheckIcon, text: 'Comanda a fost livrată', when: '14:02' },
  { icon: ReaderIcon, text: 'Factura FT-0412 a fost emisă', when: '14:02' },
  { icon: EnvelopeClosedIcon, text: 'Clientul a primit factura pe email', when: '14:03' },
  { icon: ClockIcon, text: 'Plata e urmărită până pe 24 nov', when: '' },
]

function OrderPage() {
  return (
    <div className="p-5 sm:p-7">
      <span className="block text-[15px] font-medium text-strong">Comanda #2041</span>
      <span className="mt-0.5 flex items-center gap-2 text-xs text-subtle">
        Birou, București
        <span className="size-1.5 rounded-full bg-(--grass-9)" />
        Livrată
      </span>
      <div className="mt-7">
        <Timeline items={HISTORY} />
      </div>
    </div>
  )
}

function AutomaticNote() {
  return (
    <div
      className={cn(
        'absolute top-14 right-3 flex items-center gap-3 py-2.5 pr-4 pl-2.5 sm:-right-6',
        floating,
      )}
    >
      <IconTile className="size-8">
        <LightningBoltIcon />
      </IconTile>
      <span className="leading-tight">
        <span className="block text-[13px] font-medium text-strong">Făcut automat</span>
        <span className="block text-[11px] text-subtle">la livrarea comenzii</span>
      </span>
    </div>
  )
}

export function AppShowcase() {
  const { ref, active, select } = useSteps(STEPS.length)
  const page = PAGE_OF_STEP[active]
  const restricted = active === 1

  return (
    <ShowcaseLayout
      steps={STEPS}
      label="Ce schimbă aplicația"
      stepsRef={ref}
      active={active}
      onSelect={select}
    >
      <Shot
        overlays={
          <>
            <Fade on={active === 1} className="pointer-events-none">
              <ViewingAs />
            </Fade>
            <Fade on={active === 2} className="pointer-events-none">
              <AutomaticNote />
            </Fade>
          </>
        }
      >
        <AppBar page={page} me={restricted ? 'PR' : 'AD'} />
        <AppBody
          nav={
            <SideNav items={NAV} page={page} locked={restricted ? HIDDEN_FROM_PRODUCTION : []} />
          }
        >
          <Fade on={active === 0}>
            <BoardPage />
          </Fade>
          <Fade on={active === 1}>
            <ProductionPage />
          </Fade>
          <Fade on={active === 2}>
            <OrderPage />
          </Fade>
        </AppBody>
      </Shot>
    </ShowcaseLayout>
  )
}
