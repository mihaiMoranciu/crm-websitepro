'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Heading, IconButton, Text } from '@radix-ui/themes'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, MousePointer2, Shirt } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react'

import { TYPE } from '@/design/type'
import { cn } from '@/utilities/ui'

import { NOISE } from './HeroGlow'

/*
 * The services, one card each: the name, a line, and at the foot, on the
 * hero's grainy stage, a small piece of the real thing, quietly at work. An order comes in, a state moves
 * on, the uptime bars move with the clock. One shared tick drives them all,
 * only while the row is on screen, and never under reduced motion, where each
 * card simply shows its first frame.
 *
 * Generic on purpose: "Firma ta" and plain products, no invented brands.
 */

const TICK_MS = 2400

/** The panel at the foot of a card, cropped by the card's bottom edge. */
const panel =
  'w-full translate-y-3 rounded-t-(--radius-3) bg-(--color-panel-solid) text-xs shadow-[0_-10px_30px_-18px_var(--gray-a9),inset_0_0_0_1px_var(--gray-a5)]'

/* Full strength at the card's foot, gone by halfway up the stage. */
const FADE_UP = 'linear-gradient(to top, #000 40%, rgb(0 0 0 / 0.5) 75%, transparent 100%)'

/**
 * The hero, in miniature, at the foot of each card: two colours rising from
 * the bottom corners, a little grain, and the pale trapezoid floor that the
 * preview stands on. Each card takes the next pair of hues along the hero's
 * band, so scrolling the row walks through the same spectrum.
 */
function Stage({
  hues: [from, to],
  children,
}: {
  hues: [string, string]
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden
      className="relative mt-6 flex min-h-[210px] flex-1 items-end justify-center overflow-hidden select-none"
    >
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(75% 120% at 0% 100%, var(--${from}-9) 0%, transparent 85%)`,
            `radial-gradient(75% 120% at 100% 100%, var(--${to}-9) 0%, transparent 85%)`,
            // A soft light behind the preview, half of each colour.
            `radial-gradient(45% 55% at 50% 45%, color-mix(in oklab, var(--${from}-7), var(--${to}-7)) 0%, transparent 100%)`,
          ].join(', '),
          maskImage: FADE_UP,
          WebkitMaskImage: FADE_UP,
        }}
      />
      <div
        className="absolute inset-0 opacity-35 mix-blend-overlay"
        style={{ backgroundImage: NOISE, maskImage: FADE_UP, WebkitMaskImage: FADE_UP }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[46%]"
        style={{
          clipPath: 'polygon(19% 0, 81% 0, 100% 100%, 0 100%)',
          background:
            'linear-gradient(to bottom, color-mix(in oklab, var(--color-panel-solid) 55%, transparent), var(--color-panel-solid) 85%)',
        }}
      />
      <div className="relative w-[82%]">{children}</div>
    </div>
  )
}

/** A site: the visitor's pointer goes to the button, the request is sent. */
function SitePreview({ tick }: { tick: number }) {
  const sent = tick % 2 === 1
  return (
    <div className={cn(panel, 'relative')}>
      <div className="flex justify-center border-b border-frame py-1.5">
        <span className="rounded-full bg-(--gray-a3) px-3 py-0.5 text-[10px] text-subtle">
          firma-ta.ro
        </span>
      </div>
      <div className="px-4 pt-4 pb-7">
        <p className="m-0 text-[15px] leading-tight font-semibold tracking-tight text-strong">
          Spune clar ce faci.
        </p>
        <p className="m-0 mt-1 text-subtle">Un site rapid, găsit pe Google.</p>
        <span
          className={cn(
            'mt-3 inline-block rounded-(--radius-2) px-3 py-1.5 font-medium text-(--accent-contrast) transition-all duration-300',
            sent ? 'scale-95 bg-(--accent-10)' : 'bg-(--accent-9)',
          )}
        >
          Cere o ofertă
        </span>
      </div>
      <MousePointer2
        size={16}
        strokeWidth={1.75}
        className="absolute fill-(--gray-12) text-(--gray-1) transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={sent ? { left: 92, top: 100 } : { left: '78%', top: 52 }}
      />
      <span
        className={cn(
          'absolute top-12 right-3 flex items-center gap-1.5 rounded-full bg-(--color-panel-solid) px-2.5 py-1 text-[11px] text-strong shadow-[0_6px_16px_-8px_var(--gray-a9),inset_0_0_0_1px_var(--gray-a5)] transition-all duration-300',
          sent ? 'translate-y-0 opacity-100 delay-500' : '-translate-y-1 opacity-0',
        )}
      >
        <Check size={11} strokeWidth={2.5} className="text-(--accent-11)" />
        Cerere trimisă
      </span>
    </div>
  )
}

/** A shop: paid orders keep arriving, the newest on top. */
function ShopPreview({ tick }: { tick: number }) {
  const orders = [0, 1, 2].map((i) => 1048 + tick - i)
  return (
    <div className={panel}>
      <div className="flex items-center gap-3 border-b border-frame px-4 py-3">
        <span className="grid size-9 place-items-center rounded-(--radius-2) bg-(--gray-a3) text-(--gray-11)">
          <Shirt size={18} strokeWidth={1.25} />
        </span>
        <span className="leading-tight">
          <span className="block text-strong">Tricou</span>
          <span className="block text-subtle">89 lei</span>
        </span>
        <span className="ml-auto rounded-(--radius-2) bg-(--gray-12) px-2.5 py-1 text-[11px] font-medium text-(--gray-1)">
          Adaugă în coș
        </span>
      </div>
      <ul className="m-0 list-none px-4 pt-2 pb-6">
        <AnimatePresence initial={false}>
          {orders.map((id, i) => (
            <motion.li
              key={id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 py-1.5"
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  i === 0 ? 'bg-(--accent-9)' : 'bg-(--gray-a6)',
                )}
              />
              <span className="text-strong tabular-nums">Comanda #{id}</span>
              <span className="ml-auto text-subtle">plătită, factură în SPV</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

const STATES = [
  { label: 'De aprobat', tone: 'bg-(--amber-a3) text-(--amber-11)' },
  { label: 'În lucru', tone: 'bg-(--iris-a3) text-(--iris-11)' },
  { label: 'Gata', tone: 'bg-(--grass-a3) text-(--grass-11)' },
]

/** An app: the same orders, each moving on to its next state. */
function AppPreview({ tick }: { tick: number }) {
  const rows = [
    { id: '#2041', who: 'DC' },
    { id: '#2040', who: 'AM' },
    { id: '#2039', who: 'RI' },
  ]
  return (
    <div className={panel}>
      <div className="flex items-center gap-2 border-b border-frame px-4 py-2.5">
        <span className="size-2.5 rounded-[3px] bg-(--accent-9)" />
        <span className="font-medium text-strong">Comenzi</span>
        <span className="ml-auto text-subtle">Firma ta</span>
      </div>
      <ul className="m-0 list-none px-2 pt-1 pb-6">
        {rows.map((row, i) => {
          const state = STATES[(tick + i) % STATES.length]
          return (
            <li key={row.id} className="flex items-center gap-2 px-2 py-2">
              <span className="text-strong tabular-nums">Comanda {row.id}</span>
              <span className="ml-auto grid size-5 place-items-center rounded-full bg-(--gray-a3) text-[9px] font-medium text-strong">
                {row.who}
              </span>
              <span
                className={cn(
                  'w-[72px] rounded-(--radius-1) py-0.5 text-center text-[11px] font-medium transition-colors duration-500',
                  state.tone,
                )}
              >
                {state.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const PALETTES = [
  { ink: '#121412', accent: '#c79b6b', paper: '#efede8' },
  { ink: '#1b2a4a', accent: '#e5a34b', paper: '#f3f1ec' },
  { ink: '#1f3d33', accent: '#d9c9a3', paper: '#f2f0ea' },
]

/** An identity: the same mark tried in one palette after another. */
function IdentityPreview({ tick }: { tick: number }) {
  const current = tick % PALETTES.length
  const p = PALETTES[current]
  return (
    <div className={cn(panel, 'flex items-center gap-4 px-4 pt-4 pb-7')}>
      <span
        className="grid size-20 shrink-0 place-items-center rounded-(--radius-3) transition-colors duration-700"
        style={{ background: p.ink }}
      >
        <span
          className="grid size-11 place-items-center rounded-[5px] font-serif text-lg font-semibold italic transition-colors duration-700"
          style={{ color: p.accent, boxShadow: `inset 0 0 0 1.5px ${p.accent}` }}
        >
          FT
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="text-strong">Ghid de brand</span>
        <span className="flex gap-1.5">
          {PALETTES.map((pal, i) => (
            <span
              key={pal.ink}
              className={cn(
                'size-5 rounded-full transition-shadow duration-300',
                i === current
                  ? 'shadow-[0_0_0_2px_var(--color-panel-solid),0_0_0_3.5px_var(--gray-12)]'
                  : 'shadow-[inset_0_0_0_1px_var(--gray-a5)]',
              )}
              style={{ background: `linear-gradient(135deg, ${pal.ink} 50%, ${pal.accent} 50%)` }}
            />
          ))}
        </span>
        <span className="text-subtle">Culori, fonturi, variante</span>
      </span>
    </div>
  )
}

/** Upkeep: the site online, the last thirty days of uptime moving with the clock. */
function MaintenancePreview({ tick }: { tick: number }) {
  const bars = Array.from({ length: 30 }, (_, i) => (i + tick) % 30 === 24)
  return (
    <div className={panel}>
      <div className="flex items-center gap-2 border-b border-frame px-4 py-2.5">
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-(--grass-9) opacity-60 motion-safe:animate-ping" />
          <span className="relative size-2 rounded-full bg-(--grass-9)" />
        </span>
        <span className="font-medium text-strong">firma-ta.ro</span>
        <span className="ml-auto text-subtle">online</span>
      </div>
      <div className="px-4 pt-3 pb-6">
        <div className="flex h-6 gap-[2px]">
          {bars.map((incident, i) => (
            <span
              key={i}
              className={cn(
                'flex-1 rounded-[2px] transition-colors duration-500',
                incident ? 'bg-(--amber-9)' : 'bg-(--grass-9)',
              )}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {[
            ['Copie de siguranță', 'azi, 03:00'],
            ['Actualizări', 'la zi'],
          ].map(([what, when]) => (
            <span key={what} className="flex items-center gap-2">
              <Check size={12} strokeWidth={2.25} className="text-(--accent-11)" />
              <span className="text-strong">{what}</span>
              <span className="ml-auto text-subtle">{when}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

type Service = {
  title: string
  text: string
  href: string
  /** Two neighbouring hues from the hero band, one per corner of the stage. */
  hues: [string, string]
  Preview: (props: { tick: number }) => React.ReactNode
}

const SERVICES: Service[] = [
  {
    title: 'Site-uri de prezentare',
    text: 'Rapide, ușor de administrat și gândite să fie găsite pe Google.',
    href: '/servicii/site-uri-de-prezentare',
    hues: ['violet', 'iris'],
    Preview: SitePreview,
  },
  {
    title: 'Magazine online',
    text: 'Catalog, plăți și livrare, legate direct de facturare și de stoc.',
    href: '/servicii/magazine-online',
    hues: ['iris', 'cyan'],
    Preview: ShopPreview,
  },
  {
    title: 'Aplicații web',
    text: 'CRM-uri, portaluri pentru clienți și instrumente interne, la comandă.',
    href: '/servicii/aplicatii-web',
    hues: ['cyan', 'lime'],
    Preview: AppPreview,
  },
  {
    title: 'Identitate vizuală',
    text: 'Logo, materiale tipărite și un ghid de brand care se ține peste tot.',
    href: '/servicii/identitate-vizuala',
    hues: ['lime', 'grass'],
    Preview: IdentityPreview,
  },
  {
    title: 'Mentenanță și găzduire',
    text: 'Actualizări, copii de siguranță și cineva care răspunde când e nevoie.',
    href: '/servicii/mentenanta',
    hues: ['grass', 'violet'],
    Preview: MaintenancePreview,
  },
]

/**
 * The services in a row that scrolls sideways and snaps. Native scrolling
 * does the moving, so touch, trackpad and keyboard all work as they normally
 * do; the arrows only nudge it, and the dots read the scroll position through
 * Motion instead of a scroll listener of our own.
 *
 * The row runs out to the right-hand rail so the next card shows, cut by the
 * frame: a plain hint that there is more to the side.
 */
export function ServicesCarousel() {
  const track = useRef<HTMLDivElement>(null)
  const dots = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const inView = useInView(track, { amount: 0.3 })
  const { scrollXProgress } = useScroll({ container: track })
  // Only flips at the two ends, so this re-renders twice per trip, not per frame.
  const [edge, setEdge] = useState<'start' | 'middle' | 'end'>('start')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!inView || reduceMotion) return
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_MS)
    return () => window.clearInterval(id)
  }, [inView, reduceMotion])

  // Light up the dot for the card nearest the scroll position, by hand, so
  // scrolling never re-renders the cards.
  useMotionValueEvent(scrollXProgress, 'change', (p) => {
    const active = Math.round(p * (SERVICES.length - 1))
    dots.current?.querySelectorAll('span').forEach((dot, i) => {
      dot.dataset.active = String(i === active)
    })
    setEdge(p <= 0.01 ? 'start' : p >= 0.99 ? 'end' : 'middle')
  })

  /**
   * One card along, except near either end: when less than half a card would
   * be left to go, the arrow goes all the way. Otherwise the last press only
   * shuffles the row a few pixels to uncover the final card's edge, which
   * reads as the button not working.
   */
  const nudge = (direction: 1 | -1) => {
    const el = track.current
    const card = el?.querySelector<HTMLElement>('[data-card]')
    if (!el || !card) return
    const step = card.offsetWidth + 16
    const max = el.scrollWidth - el.clientWidth
    let target = el.scrollLeft + direction * step
    if (max - target < step / 2) target = max
    if (target < step / 2) target = 0
    el.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <div>
      <div
        ref={track}
        className="-mr-(--gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pr-(--gutter) pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SERVICES.map(({ title, text, href, hues, Preview }, i) => (
          <motion.article
            key={title}
            data-card
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="h-[420px] w-[300px] shrink-0 snap-start overflow-hidden rounded-(--radius-4) bg-(--color-panel-solid) shadow-[inset_0_0_0_1px_var(--gray-a5)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--gray-a7)] sm:w-[340px]"
          >
            <Link href={href} className="group flex h-full flex-col text-inherit no-underline">
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between gap-4">
                  <Heading as="h3" size={TYPE.title} className="text-balance">
                    {title}
                  </Heading>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden
                    className="mt-1 shrink-0 text-(--gray-9) transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-strong"
                  />
                </div>
                <Text as="p" size={TYPE.body} color="gray" mt="2">
                  {text}
                </Text>
              </div>
              <Stage hues={hues}>
                <Preview tick={tick} />
              </Stage>
            </Link>
          </motion.article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div ref={dots} className="flex items-center gap-1.5" aria-hidden>
          {SERVICES.map((s, i) => (
            <span
              key={s.title}
              data-active={i === 0}
              className="h-1.5 w-1.5 rounded-full bg-(--gray-a6) transition-all duration-300 data-[active=true]:w-6 data-[active=true]:bg-(--accent-9)"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <IconButton
            variant="surface"
            color="gray"
            radius="full"
            size="3"
            onClick={() => nudge(-1)}
            disabled={edge === 'start'}
            aria-label="Serviciul anterior"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </IconButton>
          <IconButton
            variant="surface"
            color="gray"
            radius="full"
            size="3"
            onClick={() => nudge(1)}
            disabled={edge === 'end'}
            aria-label="Serviciul următor"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
