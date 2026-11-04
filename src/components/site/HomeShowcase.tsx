'use client'

import React from 'react'
import { Globe, Inbox, ReceiptText } from 'lucide-react'

import { cn } from '@/utilities/ui'

import { marked, MockFrame, ShowcaseLayout, type Step, useSteps } from './Showcase'

/*
 * What the home page shows in place of a portfolio: the whole path one
 * request takes when the same team builds the site, the company's app and
 * its invoicing. The request is sent from the site, lands in the app with
 * someone responsible for it, and ends as an invoice sent to the SPV.
 *
 * Generic on purpose: "Firma ta" and plain examples, no invented brands or
 * people. The three screens share one spot and cross-fade with the step.
 */

const STEPS: Step[] = [
  {
    icon: Globe,
    title: 'Clientul cere o ofertă pe site.',
    text: 'Formularul îi cere doar ce trebuie, iar cererea nu se pierde într-un email.',
  },
  {
    icon: Inbox,
    title: 'Cererea apare în aplicația firmei.',
    text: 'Cu tot ce a scris clientul, cu cine se ocupă de ea și până când.',
  },
  {
    icon: ReceiptText,
    title: 'Devine proiect, apoi factură.',
    text: 'Trimisă în SPV ca e-Factura, fără să copiezi nimic dintr-un program în altul.',
  },
]

const FIELDS: [string, string][] = [
  ['Ce ai nevoie?', 'Un magazin online, cam 200 de produse'],
  ['Termen', 'până în martie'],
  ['Email', 'contact@exemplu.ro'],
]

type Tone = 'iris' | 'gray' | 'grass'

const TONES: Record<Tone, string> = {
  iris: 'bg-(--iris-a3) text-(--iris-11)',
  gray: 'bg-(--gray-a3) text-(--gray-11)',
  grass: 'bg-(--grass-a3) text-(--grass-11)',
}

const REQUESTS: { what: string; when: string; state: string; tone: Tone }[] = [
  { what: 'Site de prezentare, 6 pagini', when: 'ieri', state: 'Ofertă trimisă', tone: 'gray' },
  { what: 'Mentenanță pentru un site existent', when: 'luni', state: 'Acceptată', tone: 'grass' },
]

const LINES: [string, string][] = [
  ['Magazin online, etapa 1', '8.000,00'],
  ['TVA 21%', '1.680,00'],
]

/** One screen of the three, shown when its step is current. */
function Screen({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'col-start-1 row-start-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        on ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      {children}
    </div>
  )
}

/** The top bar every screen shares: where we are. */
function Bar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-(--radius-3) bg-(--gray-a2) px-4 py-2.5 text-sm shadow-[inset_0_0_0_1px_var(--gray-a3)]">
      {children}
    </div>
  )
}

export function HomeShowcase() {
  const { ref, active, select } = useSteps(STEPS.length)

  return (
    <ShowcaseLayout
      steps={STEPS}
      label="Drumul unei cereri"
      stepsRef={ref}
      active={active}
      onSelect={select}
    >
      <MockFrame className="grid">
        {/* 1. The contact form on the site. */}
        <Screen on={active === 0}>
          <Bar>
            <span className="font-semibold tracking-tight text-strong">Firma ta</span>
            <span className="mx-auto rounded-full bg-(--gray-a3) px-3 py-0.5 text-xs text-subtle">
              firma-ta.ro/contact
            </span>
            <span className="hidden text-xs text-subtle sm:inline">Contact</span>
          </Bar>
          <div className="grid gap-6 px-2 pt-6 pb-4 sm:grid-cols-[1fr_1.4fr] sm:px-4">
            <div>
              <p className="m-0 text-lg font-semibold tracking-tight text-strong">Cere o ofertă</p>
              <p className="m-0 mt-1 text-sm text-subtle">
                Spune-ne ce ai nevoie. Răspundem în aceeași zi.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              {FIELDS.map(([label, value]) => (
                <label key={label} className="flex flex-col gap-1">
                  <span className="text-subtle">{label}</span>
                  <span className="rounded-(--radius-2) px-3 py-2 text-strong shadow-[inset_0_0_0_1px_var(--gray-a6)]">
                    {value}
                  </span>
                </label>
              ))}
              <span
                className={cn(
                  'mt-1 self-start rounded-(--radius-2) bg-(--accent-9) px-4 py-2 font-medium text-(--accent-contrast)',
                  marked(active === 0),
                )}
              >
                Trimite cererea
              </span>
            </div>
          </div>
        </Screen>

        {/* 2. The same request, in the company's app. */}
        <Screen on={active === 1}>
          <Bar>
            <span className="size-2.5 rounded-[3px] bg-(--accent-9)" />
            <span className="font-medium text-strong">Cereri</span>
            <span className="ml-auto text-xs text-subtle">Firma ta</span>
          </Bar>
          <ul className="m-0 mt-3 list-none rounded-(--radius-3) p-0 text-xs shadow-[inset_0_0_0_1px_var(--gray-a4)]">
            <li className={cn('bg-(--accent-a2) px-4 py-3', marked(active === 1))}>
              <span className="flex items-center gap-3">
                <span className="text-sm font-medium text-strong">
                  Magazin online, cam 200 de produse
                </span>
                <span className="ml-auto grid size-6 place-items-center rounded-full bg-(--gray-a3) text-[10px] font-medium text-strong">
                  DC
                </span>
                <span className={cn('rounded-(--radius-1) px-1.5 py-0.5 font-medium', TONES.iris)}>
                  Nouă
                </span>
              </span>
              <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-subtle">
                <span>contact@exemplu.ro</span>
                <span>termen: până în martie</span>
                <span className="text-strong">răspuns până azi, 17:00</span>
              </span>
            </li>
            {REQUESTS.map((r) => (
              <li key={r.what} className="flex items-center gap-3 border-t border-frame px-4 py-3">
                <span className="text-strong">{r.what}</span>
                <span className="ml-auto hidden text-subtle sm:inline">{r.when}</span>
                <span
                  className={cn('rounded-(--radius-1) px-1.5 py-0.5 font-medium', TONES[r.tone])}
                >
                  {r.state}
                </span>
              </li>
            ))}
          </ul>
        </Screen>

        {/* 3. Where it ends: the invoice, accepted in the SPV. */}
        <Screen on={active === 2}>
          <Bar>
            <span className="size-2.5 rounded-[3px] bg-(--accent-9)" />
            <span className="font-medium text-strong">Factura FT-0143</span>
            <span
              className={cn(
                'ml-auto rounded-(--radius-1) px-1.5 py-0.5 text-xs font-medium',
                TONES.grass,
              )}
            >
              Acceptată în SPV
            </span>
          </Bar>
          <div className={cn('mt-3 px-4 py-3 text-xs', marked(active === 2))}>
            <dl className="m-0 flex flex-col gap-2">
              {LINES.map(([what, sum]) => (
                <div key={what} className="flex justify-between gap-4">
                  <dt className="text-subtle">{what}</dt>
                  <dd className="m-0 text-strong tabular-nums">{sum}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-frame pt-2 text-sm font-medium text-strong">
                <dt>Total</dt>
                <dd className="m-0 tabular-nums">9.680,00 lei</dd>
              </div>
            </dl>
            <p className="m-0 mt-4 text-subtle">
              Legată de proiect și de cererea venită de pe site, ca drumul ei să se vadă de la un
              capăt la altul.
            </p>
          </div>
        </Screen>
      </MockFrame>
    </ShowcaseLayout>
  )
}
