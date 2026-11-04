'use client'

import React from 'react'
import {
  Backpack,
  Check,
  Coffee,
  CreditCard,
  LayoutGrid,
  type LucideIcon,
  ReceiptText,
  Shirt,
  ShoppingCart,
  User,
  Watch,
} from 'lucide-react'

import { cn } from '@/utilities/ui'

import { marked, MockFrame, ShowcaseLayout, type Step, useSteps } from './Showcase'

/*
 * The online shop showcase: a generic shop, "Firma ta", in three moments
 * of one order. No made-up brand: the products are plain categories drawn
 * as outline icons, so the shop could be anyone's. The catalogue the owner manages, the cart
 * and payment the customer sees, and what happens on its own after the
 * payment. Sample data throughout.
 */

const STEPS: Step[] = [
  {
    icon: LayoutGrid,
    title: 'Catalogul îl administrezi tu.',
    text: 'Produse, prețuri și stocuri, schimbate din panou, fără să ne scrii.',
  },
  {
    icon: CreditCard,
    title: 'Plata se face pe site.',
    text: 'Card, ramburs sau transfer, cu confirmarea primită pe loc.',
  },
  {
    icon: ReceiptText,
    title: 'Restul se face singur.',
    text: 'Factura pleacă în SPV, AWB-ul se generează, iar clientul primește emailul.',
  },
]

const PRODUCTS: { icon: LucideIcon; name: string; price: string }[] = [
  { icon: Shirt, name: 'Tricou', price: '89 lei' },
  { icon: Coffee, name: 'Cană', price: '45 lei' },
  { icon: Backpack, name: 'Rucsac', price: '189 lei' },
  { icon: Watch, name: 'Ceas', price: '349 lei' },
]

const CART: [string, string][] = [
  ['2 × Tricou', '178,00'],
  ['1 × Cană', '45,00'],
  ['Livrare', '15,00'],
]

const AFTER: [string, string][] = [
  ['Plată acceptată', 'card, 238,00 lei'],
  ['Factură emisă', 'seria FT, nr. 0318'],
  ['Trimisă în SPV', 'ca e-Factura'],
  ['AWB generat', 'ridicare mâine dimineață'],
  ['Email către client', 'factura și numărul AWB'],
]

export function ShopShowcase() {
  const { ref, active, select } = useSteps(STEPS.length)

  return (
    <ShowcaseLayout
      steps={STEPS}
      label="Pașii unei comenzi"
      stepsRef={ref}
      active={active}
      onSelect={select}
    >
      <MockFrame>
        {/* The shop's header. */}
        <div className="flex items-center gap-4 rounded-(--radius-3) bg-(--gray-a2) px-4 py-2.5 shadow-[inset_0_0_0_1px_var(--gray-a3)]">
          <span className="text-sm font-semibold tracking-tight text-strong">Firma ta</span>
          <span className="mx-auto hidden gap-5 text-xs text-subtle md:flex">
            <span>Toate</span>
            <span>Noutăți</span>
            <span>Reduceri</span>
            <span>Contact</span>
          </span>
          <span className={cn('ml-auto flex items-center gap-3 p-1 md:ml-0', marked(active === 1))}>
            <span className="relative text-strong">
              <ShoppingCart size={16} strokeWidth={1.5} />
              <span
                className={cn(
                  'absolute -top-1.5 -right-2 grid size-3.5 place-items-center rounded-full bg-(--accent-9) text-[9px] font-medium text-(--accent-contrast) transition-transform',
                  active >= 1 ? 'scale-100' : 'scale-0',
                )}
              >
                3
              </span>
            </span>
            <span className="grid size-6 place-items-center rounded-full bg-(--gray-a4) text-strong">
              <User size={12} strokeWidth={1.75} />
            </span>
          </span>
        </div>

        <div className="mt-2.5 rounded-(--radius-3) bg-(--accent-a2) px-4 py-3 text-center text-sm">
          <span className="font-medium text-strong">Bine ai revenit!</span>{' '}
          <span className="text-subtle">Livrarea e gratuită peste 300 lei.</span>
        </div>

        <div className="flex items-center justify-between gap-4 px-1 py-3">
          <span className="truncate text-xs text-subtle">Produse noi în fiecare săptămână.</span>
          <span className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-strong shadow-[inset_0_0_0_1px_var(--gray-a6)]">
            Vezi tot
          </span>
        </div>

        <div className={cn('grid grid-cols-2 gap-2.5 md:grid-cols-4', marked(active === 0))}>
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="overflow-hidden rounded-(--radius-3) shadow-[inset_0_0_0_1px_var(--gray-a4)]"
            >
              <div className="grid aspect-[4/3.4] place-items-center bg-(--gray-a2) text-(--gray-11)">
                <p.icon size={56} strokeWidth={0.9} />
              </div>
              <div className="flex items-baseline justify-between gap-2 px-3 py-2.5 text-xs">
                <span className="truncate text-strong">{p.name}</span>
                <span className="shrink-0 font-mono text-subtle">{p.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dims the shop while the cart or the order is in front. */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-(--gray-12)/10 backdrop-blur-[1px] transition-opacity duration-500 dark:bg-black/40',
            active >= 1 ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Step 2: the cart, sliding in from the right. */}
        <div
          className={cn(
            'absolute inset-y-2.5 right-2.5 flex w-[min(300px,86%)] flex-col rounded-(--radius-4) bg-(--color-panel-solid) shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45),inset_0_0_0_1px_var(--gray-a5)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-y-3 sm:right-3',
            active === 1 ? 'translate-x-0' : 'translate-x-[115%]',
          )}
        >
          <div className="border-b border-frame px-4 py-3 text-sm font-medium text-strong">
            Coșul tău
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 px-4 py-3 text-xs">
            {CART.map(([what, sum]) => (
              <li key={what} className="flex justify-between gap-3">
                <span className="text-subtle">{what}</span>
                <span className="text-strong tabular-nums">{sum}</span>
              </li>
            ))}
            <li className="mt-1 flex justify-between gap-3 border-t border-frame pt-2 text-sm font-medium text-strong">
              <span>Total</span>
              <span className="tabular-nums">238,00 lei</span>
            </li>
          </ul>
          <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
            <span className="flex items-center gap-2 rounded-(--radius-2) px-3 py-2 text-xs text-strong shadow-[inset_0_0_0_1.5px_var(--accent-8)]">
              <CreditCard size={14} strokeWidth={1.5} />
              Card
              <span className="ml-auto font-mono text-subtle">•••• 4242</span>
            </span>
            <span className="rounded-(--radius-2) px-3 py-2 text-xs text-subtle shadow-[inset_0_0_0_1px_var(--gray-a5)]">
              Ramburs la curier
            </span>
            <span className="mt-1 rounded-(--radius-2) bg-(--accent-9) py-2 text-center text-xs font-medium text-(--accent-contrast)">
              Plătește 238,00 lei
            </span>
          </div>
        </div>

        {/* Step 3: what happens after the payment, with nobody typing anything. */}
        <div
          className={cn(
            'absolute right-2.5 bottom-2.5 w-[min(320px,90%)] rounded-(--radius-4) bg-(--color-panel-solid) shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45),inset_0_0_0_1px_var(--gray-a5)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:right-3 sm:bottom-3',
            active === 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-frame px-4 py-3 text-sm">
            <span className="font-medium text-strong">Comanda #1048</span>
            <span className="text-xs text-subtle">10:42</span>
          </div>
          <ol className="m-0 flex list-none flex-col gap-2.5 px-4 py-3">
            {AFTER.map(([what, detail], i) => (
              <li
                key={what}
                className={cn(
                  'flex items-start gap-2.5 text-xs transition-opacity duration-300',
                  active === 2 ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDelay: active === 2 ? `${250 + i * 180}ms` : '0ms' }}
              >
                <span className="mt-px grid size-4 shrink-0 place-items-center rounded-full bg-(--accent-a3) text-(--accent-11)">
                  <Check size={10} strokeWidth={2.5} />
                </span>
                <span className="leading-tight">
                  <span className="block text-strong">{what}</span>
                  <span className="block text-subtle">{detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </MockFrame>
    </ShowcaseLayout>
  )
}
