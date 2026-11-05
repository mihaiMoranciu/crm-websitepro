'use client'

import React from 'react'
import {
  ArchiveIcon,
  CardStackIcon,
  CheckIcon,
  CubeIcon,
  EnvelopeClosedIcon,
  GearIcon,
  ListBulletIcon,
  LockClosedIcon,
  PaperPlaneIcon,
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
  GrainGradient,
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
 * The online shop showcase: a generic shop, "Firma ta", in three moments of
 * one order. The catalogue the owner manages, the checkout the customer sees,
 * and what happens on its own after the payment. Products are plain things in
 * a colour, their thumbnail the colour itself, so the shop could be anyone's.
 * Sample data throughout.
 */

const STEPS: Step[] = [
  {
    icon: CubeIcon,
    title: 'Catalogul îl administrezi tu.',
    text: 'Produse, prețuri și stocuri, schimbate din panou, fără să ne scrii.',
  },
  {
    icon: CardStackIcon,
    title: 'Plata se face pe site.',
    text: 'Card, ramburs sau transfer, cu confirmarea primită pe loc.',
  },
  {
    icon: ReaderIcon,
    title: 'Restul se face singur.',
    text: 'Factura pleacă în SPV, AWB-ul se generează, iar clientul primește emailul.',
  },
]

const NAV: { icon: Icon; label: string }[] = [
  { icon: ListBulletIcon, label: 'Comenzi' },
  { icon: CubeIcon, label: 'Produse' },
  { icon: PersonIcon, label: 'Clienți' },
  { icon: ReaderIcon, label: 'Facturi' },
  { icon: GearIcon, label: 'Setări' },
]

/** A product's thumbnail: its colour, flat and soft. */
function Swatch({ hue, className }: { hue: string; className?: string }) {
  return (
    <span
      className={cn(
        'size-8 shrink-0 rounded-(--radius-2) shadow-[inset_0_0_0_1px_var(--gray-a3)]',
        className,
      )}
      style={{ background: `var(--${hue}-a5)` }}
    />
  )
}

/* ---------- 1. The catalogue ---------- */

const PRODUCTS: { name: string; hue: string; stock: string; price: string }[] = [
  { name: 'Tricou, verde', hue: 'grass', stock: '120', price: '79 lei' },
  { name: 'Cană, albastră', hue: 'blue', stock: '64', price: '45 lei' },
  { name: 'Rucsac, nisip', hue: 'amber', stock: '18', price: '189 lei' },
  { name: 'Șapcă, neagră', hue: 'gray', stock: '35', price: '59 lei' },
]

function CataloguePage() {
  return (
    <div className="relative p-5 sm:p-7">
      <div className="flex items-center">
        <span className="text-[15px] font-medium text-strong">Produse</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-(--radius-2) bg-(--gray-12) px-2.5 py-1 text-xs font-medium text-(--gray-1)">
          <PlusIcon className="size-3" />
          Produs
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_auto] text-[11px] text-subtle">
        <span className="pb-2">Produs</span>
        <span className="pb-2 pl-6">Stoc</span>
        <span className="pb-2 pl-6 text-right">Preț</span>
        {PRODUCTS.map(({ name, hue, stock, price }, i) => (
          <React.Fragment key={name}>
            <span
              className={cn(
                'flex items-center gap-3 border-t border-frame py-2.5 text-[13px] text-strong',
                RUN_ON[i],
              )}
            >
              <Swatch hue={hue} />
              {name}
            </span>
            <span
              className={cn(
                'flex items-center border-t border-frame py-2.5 pl-6 text-xs tabular-nums',
                RUN_ON[i],
              )}
            >
              {stock}
            </span>
            <span
              className={cn(
                'flex items-center justify-end border-t border-frame py-2.5 pl-6 text-xs text-strong tabular-nums',
                RUN_ON[i],
              )}
            >
              {price}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/** The first product, open for editing: the one thing on this screen that pops. */
function PriceEditor() {
  return (
    <div className={cn('absolute top-[13.5rem] right-3 w-60 p-4 sm:-right-6', floating)}>
      <span className="flex items-center gap-3">
        <Swatch hue="grass" className="size-9" />
        <span className="text-[13px] font-medium text-strong">Tricou, verde</span>
      </span>
      <span className="mt-4 block text-[11px] text-subtle">Preț</span>
      <span className="mt-1 flex items-center rounded-(--radius-2) px-2.5 py-1.5 text-[13px] text-strong shadow-[inset_0_0_0_1px_var(--accent-8),0_0_0_3px_var(--accent-a4)]">
        <span className="tabular-nums">79</span>
        <span className="ml-px h-3.5 w-px bg-(--gray-12)" />
        <span className="ml-auto text-xs text-subtle">lei</span>
      </span>
      <span className="mt-3 block rounded-(--radius-2) bg-(--accent-9) py-1.5 text-center text-xs font-medium text-(--accent-contrast)">
        Salvează
      </span>
    </div>
  )
}

/* ---------- 2. The checkout, on the shop's own site ---------- */

const CART: { what: string; hue: string; sum: string }[] = [
  { what: '2 × Tricou, verde', hue: 'grass', sum: '158,00' },
  { what: '1 × Cană, albastră', hue: 'blue', sum: '45,00' },
]

function Checkout() {
  return (
    <>
      <div className="flex h-11 items-center gap-4 border-b border-frame px-4 text-[13px]">
        <span className="font-semibold tracking-tight text-strong">Firma ta</span>
        <span className="mx-auto hidden gap-5 text-xs text-subtle sm:flex">
          <span>Produse</span>
          <span>Noutăți</span>
          <span>Contact</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-subtle sm:ml-0">
          <LockClosedIcon className="size-3" />
          Plată securizată
        </span>
      </div>

      <div className="grid gap-8 p-5 sm:grid-cols-[1fr_15rem] sm:p-7">
        <div>
          <span className="text-[15px] font-medium text-strong">Coșul tău</span>
          <ul className="m-0 mt-5 list-none p-0">
            {CART.map(({ what, hue, sum }) => (
              <li
                key={what}
                className="flex items-center gap-3 border-t border-frame py-2.5 text-[13px]"
              >
                <Swatch hue={hue} />
                <span className="text-strong">{what}</span>
                <span className="ml-auto text-xs text-subtle tabular-nums">{sum}</span>
              </li>
            ))}
            <li className="flex items-center border-t border-frame py-2.5 text-xs text-subtle">
              Livrare
              <span className="ml-auto tabular-nums">15,00</span>
            </li>
            <li className="flex items-center border-t border-frame pt-3 text-[13px] font-medium text-strong">
              Total
              <span className="ml-auto tabular-nums">218,00 lei</span>
            </li>
          </ul>
        </div>

        {/* The card being paid with: the one thing on this screen that pops. */}
        <div className="hidden sm:block">
          <GrainGradient className="flex aspect-[1.6] w-full flex-col justify-between rounded-(--radius-4) p-4 text-strong shadow-[0_18px_36px_-16px_var(--gray-a9),inset_0_0_0_1px_var(--gray-a4)]">
            <span className="h-5 w-7 rounded-[4px] bg-white/40 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.45)]" />
            <span className="flex items-end justify-between text-xs">
              <span className="font-mono tracking-wider">•••• 4242</span>
              <span>10/28</span>
            </span>
          </GrainGradient>
          <span className="mt-4 block rounded-(--radius-2) bg-(--accent-9) py-2 text-center text-xs font-medium text-(--accent-contrast)">
            Plătește 218,00 lei
          </span>
          <span className="mt-2 block text-center text-[11px] text-subtle">
            sau ramburs la curier
          </span>
        </div>
      </div>
    </>
  )
}

/* ---------- 3. After the payment ---------- */

const AFTER = [
  { icon: CheckIcon, text: 'Plată acceptată', detail: 'card, 218,00 lei', when: '10:42' },
  { icon: ReaderIcon, text: 'Factură emisă', detail: 'seria FT, nr. 0318', when: '10:42' },
  { icon: PaperPlaneIcon, text: 'Trimisă în SPV', detail: 'ca e-Factura', when: '10:43' },
  { icon: ArchiveIcon, text: 'AWB generat', detail: 'ridicare mâine dimineață', when: '10:43' },
  { icon: EnvelopeClosedIcon, text: 'Email către client', when: '10:43' },
]

function OrderPage() {
  return (
    <div className="p-5 sm:p-7">
      <span className="block text-[15px] font-medium text-strong">Comanda #1048</span>
      <span className="mt-0.5 flex items-center gap-2 text-xs text-subtle">
        3 produse
        <span className="size-1.5 rounded-full bg-(--grass-9)" />
        Plătită
      </span>
      <div className="mt-7">
        <Timeline items={AFTER} />
      </div>
    </div>
  )
}

/** The email the customer gets, without anyone writing it. */
function CustomerEmail() {
  return (
    <div className={cn('absolute top-[15.5rem] right-3 w-64 p-4 sm:-right-6', floating)}>
      <span className="flex items-center gap-3">
        <IconTile className="size-8">
          <EnvelopeClosedIcon />
        </IconTile>
        <span className="leading-tight">
          <span className="block text-[13px] font-medium text-strong">Comanda ta a plecat</span>
          <span className="block text-[11px] text-subtle">de la Firma ta, acum</span>
        </span>
      </span>
      <span className="mt-3 block text-xs leading-relaxed text-subtle">
        Factura e atașată, iar coletul ajunge mâine.
      </span>
    </div>
  )
}

export function ShopShowcase() {
  const { ref, active, select } = useSteps(STEPS.length)
  const page = active === 0 ? 'Produse' : 'Comenzi'

  return (
    <ShowcaseLayout
      steps={STEPS}
      label="Pașii unei comenzi"
      stepsRef={ref}
      active={active}
      onSelect={select}
    >
      <Shot
        overlays={
          <>
            <Fade on={active === 0} className="pointer-events-none">
              <PriceEditor />
            </Fade>
            <Fade on={active === 2} className="pointer-events-none">
              <CustomerEmail />
            </Fade>
          </>
        }
      >
        {/* The shop's panel, for the owner. */}
        <Fade on={active !== 1}>
          <AppBar page={page} />
          <AppBody nav={<SideNav items={NAV} page={page} />}>
            <Fade on={active === 0}>
              <CataloguePage />
            </Fade>
            <Fade on={active === 2}>
              <OrderPage />
            </Fade>
          </AppBody>
        </Fade>

        {/* The shop's site, for the customer. */}
        <Fade on={active === 1}>
          <Checkout />
        </Fade>
      </Shot>
    </ShowcaseLayout>
  )
}
