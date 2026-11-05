'use client'

import React, { useId } from 'react'
import {
  ArchiveIcon,
  BarChartIcon,
  CheckIcon,
  ChevronDownIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  LockClosedIcon,
  MagicWandIcon,
  PersonIcon,
  PlusIcon,
  ReaderIcon,
} from '@radix-ui/react-icons'

import { cn } from '@/utilities/ui'

import {
  AppBar,
  AppBody,
  Avatar,
  Fade,
  floating,
  GrainGradient,
  type Icon,
  IconTile,
  RUN_ON,
  ShowcaseLayout,
  Shot,
  SideNav,
  type Step,
  useSteps,
} from './Showcase'

/*
 * The home page's word on apps. Each step names, in passing, a habit most
 * companies fall into with software that does not fit them (data spread over
 * three programs, one shared password, reports rebuilt in a spreadsheet) and
 * the picture beside it shows the same thing done right: one app that stays
 * put while its page changes with the step.
 *
 * Generic on purpose: "Firma ta" and plain examples, no invented people.
 */

const STEPS: Step[] = [
  {
    icon: PersonIcon,
    title: 'Tot ce știi despre un client, într-un singur loc.',
    text: 'Nu împărțit între emailuri, un tabel și programul de facturare.',
  },
  {
    icon: LockClosedIcon,
    title: 'Fiecare vede doar ce îl privește.',
    text: 'Cont pentru fiecare om, nu o parolă comună pe care o știe toată firma.',
  },
  {
    icon: BarChartIcon,
    title: 'Crește odată cu firma.',
    text: 'Un raport sau un câmp nou se adaugă în aplicație, nu într-un tabel ținut pe lângă ea.',
  },
]

const NAV: { icon: Icon; label: string }[] = [
  { icon: PersonIcon, label: 'Clienți' },
  { icon: ArchiveIcon, label: 'Proiecte' },
  { icon: ReaderIcon, label: 'Facturi' },
  { icon: BarChartIcon, label: 'Rapoarte' },
  { icon: LockClosedIcon, label: 'Echipă' },
]

/** Which menu item each step's page sits under. */
const PAGE_OF_STEP = ['Clienți', 'Echipă', 'Rapoarte']

/* ---------- 1. One client ---------- */

const ACTIVITY: { icon: Icon; text: string; when: string }[] = [
  { icon: ReaderIcon, text: 'Factura FT-0143 trimisă în SPV', when: 'azi' },
  { icon: EnvelopeClosedIcon, text: 'Re: poze pentru catalog', when: 'ieri' },
  { icon: ArchiveIcon, text: 'Magazin online, etapa 2', when: 'luni' },
  { icon: FileTextIcon, text: 'Oferta #214 acceptată', when: '12 feb' },
]

function ClientPage() {
  return (
    <div>
      {/* The client's cover: the one coloured surface on this screen. */}
      <GrainGradient className="h-20 sm:h-24" />
      <div className="px-5 sm:px-7">
        <div className="relative -mt-6 flex items-start gap-3.5">
          <IconTile className="relative size-12 rounded-(--radius-4) bg-(--color-panel-solid) text-sm font-semibold shadow-[0_0_0_4px_var(--color-panel-solid),inset_0_0_0_1px_var(--gray-a5)]">
            ES
          </IconTile>
          <span className="pt-7 leading-tight">
            <span className="block text-[15px] font-medium text-strong">Exemplu SRL</span>
            <span className="block text-xs text-subtle">Client din 2023</span>
          </span>
        </div>

        <p className="m-0 mt-6 text-xs text-subtle">Activitate</p>
        <ul className="m-0 mt-2 list-none p-0">
          {ACTIVITY.map(({ icon: RowIcon, text, when }, i) => (
            <li
              key={text}
              className={cn('flex items-center gap-3 border-t border-frame py-3', RUN_ON[i])}
            >
              <RowIcon className="shrink-0 text-subtle" />
              <span className="min-w-0 truncate text-[13px] text-strong">{text}</span>
              <span className="ml-auto shrink-0 text-xs text-subtle">{when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- 2. The team ---------- */

const MEMBERS: { email: string; role: string; initials: string }[] = [
  { email: 'admin@firma-ta.ro', role: 'Administrator', initials: 'AD' },
  { email: 'contabil@firma-ta.ro', role: 'Contabil', initials: 'CT' },
  { email: 'vanzari@firma-ta.ro', role: 'Vânzări', initials: 'VZ' },
]

const ROLES: [string, string][] = [
  ['Administrator', 'vede și schimbă tot'],
  ['Vânzări', 'clienți și oferte'],
  ['Contabil', 'facturi, doar citire'],
]

function TeamPage() {
  return (
    <div className="relative p-5 sm:p-7">
      <div className="flex items-center">
        <span className="text-[15px] font-medium text-strong">Echipă</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-(--radius-2) bg-(--gray-12) px-2.5 py-1 text-xs font-medium text-(--gray-1)">
          <PlusIcon className="size-3" />
          Invită
        </span>
      </div>

      <ul className="m-0 mt-5 list-none p-0">
        {MEMBERS.map(({ email, role, initials }, i) => (
          <li
            key={email}
            className={cn(
              'flex items-center gap-3 border-t border-frame py-3',
              i === 2 && 'opacity-60',
            )}
          >
            <Avatar initials={initials} className="size-7 text-[10px]" />
            <span className="min-w-0 truncate text-[13px] text-strong">{email}</span>
            <span
              className={cn(
                'ml-auto flex shrink-0 items-center gap-1 rounded-(--radius-2) px-2 py-1 text-xs text-subtle',
                i === 1 && 'text-strong shadow-[inset_0_0_0_1px_var(--gray-a6)]',
              )}
            >
              {role}
              <ChevronDownIcon className="size-3" />
            </span>
          </li>
        ))}
      </ul>

      {/* The role menu, open on the accountant's row. */}
      <div className={cn('absolute top-[9.75rem] right-5 w-56 p-1 sm:right-7', floating)}>
        {ROLES.map(([role, what]) => {
          const on = role === 'Contabil'
          return (
            <span
              key={role}
              className={cn(
                'flex items-center gap-2 rounded-(--radius-2) px-2.5 py-2',
                on && 'bg-(--gray-a3)',
              )}
            >
              <span className="leading-tight">
                <span className="block text-[13px] text-strong">{role}</span>
                <span className="block text-[11px] text-subtle">{what}</span>
              </span>
              {on ? <CheckIcon className="ml-auto text-(--accent-11)" /> : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- 3. A report ---------- */

const MONTHS: [string, number][] = [
  ['oct', 46],
  ['nov', 58],
  ['dec', 52],
  ['ian', 64],
  ['feb', 71],
  ['mar', 86],
]

const CHART_W = 300
const CHART_H = 100
const STEP_X = 58

/** A smooth line through the points (Catmull-Rom, drawn as cubic Béziers). */
function smoothPath(points: [number, number][]) {
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i - 1] ?? points[i]
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const [x3, y3] = points[i + 2] ?? points[i + 1]
    d += ` C ${x1 + (x2 - x0) / 6} ${y1 + (y2 - y0) / 6} ${x2 - (x3 - x1) / 6} ${y2 - (y3 - y1) / 6} ${x2} ${y2}`
  }
  return d
}

/* The area under the line fades out towards the axis. */
const AREA_FADE = 'linear-gradient(to bottom, #000 35%, rgb(0 0 0 / 0.15) 100%)'

function ReportPage() {
  // CSS url() cannot take the colons React puts in its ids.
  const clipId = `area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const points = MONTHS.map(([, v], i) => [i * STEP_X, 110 - v] as [number, number])
  const line = smoothPath(points)
  const [lastX, lastY] = points[points.length - 1]
  // The same area in 0..1 units, so it clips a box of any size.
  const area = `${smoothPath(points.map(([x, y]) => [x / CHART_W, y / CHART_H]))} L ${lastX / CHART_W} 1 L 0 1 Z`

  return (
    <div className="p-5 sm:p-7">
      <p className="m-0 text-xs text-subtle">Încasări pe lună</p>
      <p className="m-0 mt-1 text-2xl font-semibold tracking-tight text-strong tabular-nums">
        86.400 lei
      </p>
      <p className="m-0 mt-0.5 text-xs text-(--grass-11)">+21% față de februarie</p>

      <div className="relative mt-6 h-36">
        <svg className="absolute size-0">
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={area} />
            </clipPath>
          </defs>
        </svg>
        {/* The area under the line, in the flowing grain: the one coloured surface here. */}
        <GrainGradient
          colors={['var(--grass-8)', 'var(--grass-9)', 'var(--lime-8)', 'var(--violet-8)']}
          className="absolute inset-0"
          style={{
            clipPath: `url(#${clipId})`,
            maskImage: AREA_FADE,
            WebkitMaskImage: AREA_FADE,
          }}
        />
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              x2={CHART_W}
              y1={y}
              y2={y}
              stroke="var(--gray-a4)"
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={line}
            fill="none"
            stroke="var(--accent-9)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* The newest month, marked in HTML so it stays round when the chart stretches. */}
        <span
          className="absolute size-2.5 -translate-1/2 rounded-full bg-(--accent-9) shadow-[0_0_0_4px_var(--accent-a4)]"
          style={{ left: `${(lastX / CHART_W) * 100}%`, top: `${(lastY / CHART_H) * 100}%` }}
        />
      </div>
      <div className="relative mt-2 h-4 text-[11px] text-subtle">
        {MONTHS.map(([month], i) => (
          <span
            key={month}
            className="absolute -translate-x-1/2 first:translate-x-0"
            style={{ left: `${((i * STEP_X) / CHART_W) * 100}%` }}
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  )
}

/** The note that the report is new: the one thing on this screen that pops. */
function NewReportNote() {
  return (
    <div
      className={cn(
        'absolute top-14 right-3 flex items-center gap-3 py-2.5 pr-4 pl-2.5 sm:-right-6',
        floating,
      )}
    >
      <IconTile className="size-8">
        <MagicWandIcon />
      </IconTile>
      <span className="leading-tight">
        <span className="block text-[13px] font-medium text-strong">Raport nou</span>
        <span className="block text-[11px] text-subtle">adăugat în aplicație</span>
      </span>
    </div>
  )
}

export function HomeShowcase() {
  const { ref, active, select } = useSteps(STEPS.length)
  const page = PAGE_OF_STEP[active]

  return (
    <ShowcaseLayout
      steps={STEPS}
      label="Cum ar trebui să arate aplicația unei firme"
      stepsRef={ref}
      active={active}
      onSelect={select}
    >
      <Shot
        overlays={
          <Fade on={active === 2} className="pointer-events-none">
            <NewReportNote />
          </Fade>
        }
      >
        <AppBar page={page} />
        <AppBody nav={<SideNav items={NAV} page={page} />}>
          <Fade on={active === 0}>
            <ClientPage />
          </Fade>
          <Fade on={active === 1}>
            <TeamPage />
          </Fade>
          <Fade on={active === 2}>
            <ReportPage />
          </Fade>
        </AppBody>
      </Shot>
    </ShowcaseLayout>
  )
}
