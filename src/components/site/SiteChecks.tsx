'use client'

import React from 'react'
import { Card, Flex, Text } from '@radix-ui/themes'
import { Gauge, type LucideIcon, RefreshCw, Search, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { TintCard } from './Frame'

/* The bottom of the picture dissolves into the page instead of ending on an edge. */
const FADE_DOWN = 'linear-gradient(to bottom, #000 74%, transparent 100%)'

/** The small green square every card opens with: the icon says what the card is about. */
function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-2) bg-(--accent-a3) text-(--accent-11)">
      <Icon size={16} strokeWidth={1.75} />
    </span>
  )
}

/** Each piece settles into place in turn, once, as the picture comes into view. */
function Reveal({
  order,
  className,
  children,
}: {
  order: number
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: order * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* The client's own palette: warm paper, near-black ink, one deep petrol. */
const PAPER = '#fbfaf7'
const INK = '#17191c'
const PETROL = '#1f4d4a'
const MUTED = 'rgb(23 25 28 / 0.6)'
const HAIRLINE = 'rgb(23 25 28 / 0.1)'

const NAV = ['Servicii', 'Lucrări', 'Despre', 'Contact']

const STATS = [
  ['12 ani', 'de experiență'],
  ['300+', 'clienți'],
  ['4,9', 'în recenziile Google'],
]

/**
 * A generic client's page, "Firma ta", written and set the way a person would:
 * actual words in the menu, the headline and the buttons. Grey placeholder
 * bars where copy should be are what generated mockups look like, and this
 * section is the one place on the page that must not.
 *
 * Sized in container units, so the page scales as one picture with the window.
 */
export function ClientSite() {
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ background: PAPER, color: INK, fontFamily: 'var(--default-font-family)' }}
    >
      <nav
        className="flex h-[9cqw] shrink-0 items-center gap-[3.2cqw] border-b px-[4cqw]"
        style={{ borderColor: HAIRLINE }}
      >
        <span className="flex items-center gap-[1cqw] text-[2.3cqw] font-semibold tracking-tight">
          <span className="size-[2cqw] rounded-[0.4cqw]" style={{ background: PETROL }} />
          Firma ta
        </span>
        <span className="flex gap-[2.4cqw] text-[1.6cqw]" style={{ color: MUTED }}>
          {NAV.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
        <span
          className="ml-auto rounded-[0.8cqw] px-[1.8cqw] py-[0.9cqw] text-[1.6cqw] font-medium"
          style={{ background: INK, color: PAPER }}
        >
          Cere ofertă
        </span>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center px-[8cqw] text-center">
        <span
          className="text-[1.4cqw] font-medium tracking-[0.14em] uppercase"
          style={{ color: MUTED }}
        >
          Firma ta, în orașul tău
        </span>
        <span className="mt-[2.2cqw] text-[5.4cqw] leading-[1.04] font-semibold tracking-[-0.03em]">
          Spune clar ce faci.
        </span>
        <span
          className="mt-[2.4cqw] max-w-[48cqw] text-[1.9cqw] leading-[1.5]"
          style={{ color: MUTED }}
        >
          Vizitatorul înțelege în câteva secunde ce oferi, pentru cine și cum te poate contacta.
        </span>
        <span className="mt-[3.4cqw] flex gap-[1.6cqw]">
          <span
            className="rounded-[0.8cqw] px-[2.6cqw] py-[1.3cqw] text-[1.8cqw] font-medium"
            style={{ background: PETROL, color: '#ffffff' }}
          >
            Cere o ofertă
          </span>
          <span
            className="rounded-[0.8cqw] border px-[2.6cqw] py-[1.3cqw] text-[1.8cqw] font-medium"
            style={{ borderColor: 'rgb(23 25 28 / 0.22)' }}
          >
            Vezi lucrările
          </span>
        </span>
        <span className="mt-[6cqw] grid w-full max-w-[52cqw] grid-cols-3">
          {STATS.map(([value, label]) => (
            <span key={label}>
              <span className="block text-[3.6cqw] font-light tracking-tight tabular-nums">
                {value}
              </span>
              <span className="mt-[0.6cqw] block text-[1.4cqw]" style={{ color: MUTED }}>
                {label}
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

/**
 * One site, and what has to be right behind it, gathered into a single
 * picture: the window shows what a visitor sees, the cards resting on it show
 * what decides whether that matters. Google finds it, it loads fast on a
 * phone, it is secure and kept up to date. Nothing to click: it is read at a
 * glance, like the pictures above it.
 *
 * Below lg only the window stays; the list beside it carries the rest.
 */
export function SiteChecks() {
  return (
    <div
      className="relative lg:h-[500px] lg:[mask-image:var(--fade)]"
      style={{ '--fade': FADE_DOWN } as React.CSSProperties}
    >
      <TintCard hue="grass" className="absolute inset-x-0 top-14 bottom-0 hidden lg:block" />

      {/* What the visitor sees. */}
      <Reveal order={0} className="relative z-10 lg:absolute lg:top-0 lg:left-[10%] lg:w-[62%]">
        <div className="overflow-hidden rounded-(--radius-4) border border-(--gray-a7) bg-(--color-panel-solid) shadow-[0_24px_60px_-28px_var(--gray-a9)]">
          <div className="flex h-9 items-center justify-center border-b border-frame bg-(--gray-2)">
            <span className="rounded-full bg-(--gray-a3) px-4 py-0.5 text-xs text-subtle">
              firma-ta.ro
            </span>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden [container-type:inline-size]">
            <ClientSite />
          </div>
        </div>
      </Reveal>

      {/* Found: the first result for the search that matters. */}
      <Reveal order={1} className="absolute top-[90px] right-[2%] z-20 hidden w-[230px] lg:block">
        <Card size="2" variant="classic">
          <Flex align="center" gap="3" mb="3">
            <IconTile icon={Search} />
            <Text size="2" weight="medium">
              Căutare Google
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <span className="size-4 rounded-[4px]" style={{ background: PETROL }} />
            <Text size="1" color="gray">
              firma-ta.ro
            </Text>
          </Flex>
          <Text as="p" size="2" weight="medium" mt="1" className="text-(--blue-11)">
            Serviciul tău, în orașul tău | Firma ta
          </Text>
          <Text as="p" size="1" color="gray" mt="1">
            Ce oferi și pentru cine, spus pe scurt. Cere o ofertă online.
          </Text>
        </Card>
      </Reveal>

      {/* Fast: what a phone on mobile data actually waits. */}
      <Reveal order={2} className="absolute top-[200px] left-0 z-20 hidden w-[180px] lg:block">
        <Card size="2" variant="classic">
          <Flex align="center" gap="3">
            <IconTile icon={Gauge} />
            <Text size="2" weight="medium">
              Pe telefon
            </Text>
          </Flex>
          <Text as="p" size="7" weight="bold" mt="3" className="tabular-nums">
            0,8 s
          </Text>
        </Card>
      </Reveal>

      {/* Safe and looked after: the two things nobody sees until they fail. */}
      <Reveal order={3} className="absolute top-[330px] right-[6%] z-20 hidden w-[240px] lg:block">
        <Card size="2" variant="classic">
          <Flex direction="column" gap="3">
            <Flex align="center" gap="3">
              <IconTile icon={ShieldCheck} />
              <Text size="2">Conexiune securizată</Text>
            </Flex>
            <Flex align="center" gap="3">
              <IconTile icon={RefreshCw} />
              <Text size="2">Actualizat azi</Text>
            </Flex>
          </Flex>
        </Card>
      </Reveal>
    </div>
  )
}
