'use client'

import React, { useRef, useState } from 'react'
import { Badge, Heading, IconButton, Text } from '@radix-ui/themes'
import {
  AppWindow,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Palette,
  ShieldCheck,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'

import { TYPE } from '@/design/type'

import { NOISE } from './HeroGlow'

type Service = {
  icon: LucideIcon
  title: string
  text: string
  /** Two neighbouring hues from the hero band, one per corner of the stage. */
  hues: [string, string]
  preview: React.ReactNode
}

/** A line of text that is not there: the shape of copy, without the copy. */
function Line({ w, strong }: { w: string; strong?: boolean }) {
  return (
    <span
      className="block h-2 rounded-full"
      style={{ width: w, background: strong ? 'var(--gray-a7)' : 'var(--gray-a4)' }}
    />
  )
}

/** The small window at the foot of each card, cropped by the card's edge. */
function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="translate-y-4 rounded-t-(--radius-4) bg-(--color-panel-solid) p-4 shadow-[0_-6px_24px_-12px_var(--gray-a8),inset_0_0_0_1px_var(--gray-a4)]">
      {children}
    </div>
  )
}

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
    <div className="relative -mx-6 mt-auto flex h-[210px] items-end justify-center overflow-hidden">
      <div
        aria-hidden
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
        aria-hidden
        className="absolute inset-0 opacity-35 mix-blend-overlay"
        style={{ backgroundImage: NOISE, maskImage: FADE_UP, WebkitMaskImage: FADE_UP }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[46%]"
        style={{
          clipPath: 'polygon(19% 0, 81% 0, 100% 100%, 0 100%)',
          background:
            'linear-gradient(to bottom, color-mix(in oklab, var(--color-panel-solid) 55%, transparent), var(--color-panel-solid) 85%)',
        }}
      />
      <div className="relative w-[64%]">{children}</div>
    </div>
  )
}

const SERVICES: Service[] = [
  {
    icon: LayoutTemplate,
    hues: ['violet', 'iris'],
    title: 'Site-uri de prezentare',
    text: 'Rapide, ușor de administrat și gândite să fie găsite pe Google.',
    preview: (
      <Preview>
        <div className="flex items-center justify-between">
          <span className="size-3 rounded-[3px] bg-(--accent-9)" />
          <span className="flex gap-2">
            <Line w="28px" />
            <Line w="28px" />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-[1.2fr_1fr] gap-4">
          <div className="flex flex-col gap-2 pt-2">
            <Line w="100%" strong />
            <Line w="70%" strong />
            <span className="mt-2 block h-5 w-16 rounded-full bg-(--accent-9)" />
          </div>
          <div className="aspect-square rounded-(--radius-2) bg-(--accent-a3)" />
        </div>
      </Preview>
    ),
  },
  {
    icon: ShoppingBag,
    hues: ['iris', 'cyan'],
    title: 'Magazine online',
    text: 'Catalog, plăți și livrare, legate direct de facturare și de stoc.',
    preview: (
      <Preview>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square rounded-(--radius-2) bg-(--gray-a3)" />
              <Line w="80%" />
              <Line w="45%" strong />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-(--radius-2) bg-(--color-panel-solid) px-3 py-2 shadow-[inset_0_0_0_1px_var(--gray-a4)]">
          <Line w="40%" />
          <Badge color="grass" size="1">
            Plătită
          </Badge>
        </div>
      </Preview>
    ),
  },
  {
    icon: AppWindow,
    hues: ['cyan', 'lime'],
    title: 'Aplicații web',
    text: 'CRM-uri, portaluri pentru clienți și instrumente interne, la comandă.',
    preview: (
      <Preview>
        <div className="flex flex-col gap-3">
          <div className="ml-auto w-3/5 rounded-(--radius-3) bg-(--color-panel-solid) p-3 shadow-sm">
            <Line w="90%" />
          </div>
          <div className="w-4/5 rounded-(--radius-3) bg-(--accent-a3) p-3">
            <div className="flex flex-col gap-2">
              <Line w="100%" strong />
              <Line w="60%" />
            </div>
          </div>
          <div className="flex h-9 items-center justify-between rounded-(--radius-3) bg-(--color-panel-solid) pr-1.5 pl-3 shadow-[inset_0_0_0_1px_var(--gray-a4)]">
            <Line w="35%" />
            <span className="size-6 rounded-full bg-(--accent-9)" />
          </div>
        </div>
      </Preview>
    ),
  },
  {
    icon: Palette,
    hues: ['lime', 'grass'],
    title: 'Identitate vizuală',
    text: 'Logo, materiale tipărite și un ghid de brand care se ține peste tot.',
    preview: (
      <Preview>
        <div className="flex items-end justify-between">
          <span className="text-4xl leading-none font-semibold tracking-tight">Aa</span>
          <span className="flex gap-1.5">
            {['--accent-9', '--violet-9', '--gray-12'].map((c) => (
              <span
                key={c}
                className="size-6 rounded-(--radius-2) shadow-[inset_0_0_0_1px_var(--gray-a4)]"
                style={{ background: `var(${c})` }}
              />
            ))}
          </span>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Line w="100%" />
          <Line w="85%" />
          <Line w="55%" />
        </div>
      </Preview>
    ),
  },
  {
    icon: ShieldCheck,
    hues: ['grass', 'violet'],
    title: 'Mentenanță și găzduire',
    text: 'Actualizări, copii de siguranță și cineva care răspunde când e nevoie.',
    preview: (
      <Preview>
        <div className="flex flex-col gap-2.5">
          {['100%', '80%', '90%'].map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-(--radius-2) bg-(--color-panel-solid) px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--gray-a4)]"
            >
              <ShieldCheck size={14} strokeWidth={2} className="shrink-0 text-(--accent-11)" />
              <span className="flex-1">
                <Line w={w} />
              </span>
            </div>
          ))}
        </div>
      </Preview>
    ),
  },
]

/**
 * The services, one card each, in a row that scrolls sideways and snaps.
 * Native scrolling does the moving, so touch, trackpad and keyboard all work
 * as they normally do; the arrows only nudge it, and the dots read the scroll
 * position through Motion instead of a scroll listener of our own.
 *
 * The row runs out to the right-hand rail so the next card shows, cut by the
 * frame: a plain hint that there is more to the side.
 */
export function ServicesCarousel() {
  const track = useRef<HTMLDivElement>(null)
  const dots = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollXProgress } = useScroll({ container: track })
  // Only flips at the two ends, so this re-renders twice per trip, not per frame.
  const [edge, setEdge] = useState<'start' | 'middle' | 'end'>('start')

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
        {SERVICES.map(({ icon: Icon, title, text, hues, preview }, i) => (
          <motion.article
            key={title}
            data-card
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-[420px] w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-(--radius-4) bg-(--color-panel-solid) p-6 pb-0 shadow-[inset_0_0_0_1px_var(--gray-a5)] sm:w-[340px]"
          >
            <span className="grid size-12 place-items-center rounded-(--radius-3) bg-(--accent-a3) text-(--accent-11)">
              <Icon size={24} strokeWidth={1.6} />
            </span>
            <Heading as="h3" size={TYPE.title} mt="5" className="text-balance">
              {title}
            </Heading>
            <Text as="p" size={TYPE.body} color="gray" mt="2" mb="6">
              {text}
            </Text>
            <Stage hues={hues}>{preview}</Stage>
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
