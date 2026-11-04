import React from 'react'
import { Badge, Box, Button, Card, Flex, IconButton, Text } from '@radix-ui/themes'
import { ArrowUp, ChartColumn, Receipt, ShoppingBag, Users } from 'lucide-react'

import { NOISE } from './HeroGlow'

/**
 * Small pieces of interface standing on the hero, one per kind of work: an
 * assistant driving an ERP (applications) in the middle, a product (online
 * shops) on the left, the takings that result on the right.
 *
 * They say it through shape, not copy: grey lines stand in for text, a single
 * word labels each piece, and the eye reads "an app, a shop, a site" before it
 * reads anything. Built from the same Radix components as the rest of the page.
 * Purely illustrative: `inert` keeps them out of the tab order and away from
 * screen readers.
 */
export function HeroMockups() {
  return (
    <div
      inert
      className="relative mx-auto mt-12 w-full max-w-[1120px] text-left md:mt-16 xl:h-[500px]"
    >
      <FlowArrows />
      <AssistantWindow />
      <ProductCard />
      <RevenueCard />
    </div>
  )
}

/**
 * The three cards read as one story: an order comes in, the assistant deals
 * with it inside the ERP, the result shows up in the numbers. Two curved,
 * dashed arrows carry the eye along that path; the dashes creep forward
 * slowly (globals.css, off under reduced motion) to say which way it flows.
 *
 * Drawn in the mockup area's own coordinates, 1120 by 500, which is the size
 * the area has whenever the side cards are on screen (xl and up), so the ends
 * land on the cards. Below xl the side cards hide and so do the arrows.
 */
function FlowArrows() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1120 500"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden h-full w-full xl:block"
      fill="none"
    >
      <defs>
        <marker
          id="hero-flow-head"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path
            d="M2 1.5 L7.5 5 L2 8.5"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: 'var(--gray-9)' }}
          />
        </marker>
      </defs>
      {/* From the top of the order, over and into the assistant's left side. */}
      <path
        className="flow-line"
        d="M 140 106 C 140 48, 236 40, 304 72"
        markerEnd="url(#hero-flow-head)"
      />
      {/* From the assistant's right side, round and up into the chart. */}
      <path
        className="flow-line"
        d="M 808 300 C 904 300, 981 282, 981 204"
        markerEnd="url(#hero-flow-head)"
      />
    </svg>
  )
}

/** A line of text that is not there: the shape of copy, without the copy. */
function Line({ className }: { className?: string }) {
  return <span className={`block h-2 rounded-full bg-(--gray-a4) ${className ?? ''}`} />
}

/*
 * A soft mesh in the two brand hues: several pale points of violet and green
 * on a quiet grey, an echo of the hero that does not compete with it. Steps 3
 * to 5 of each scale, which Radix darkens on its own in dark mode.
 */
const MESH = [
  'radial-gradient(38% 55% at 10% 15%, var(--violet-5) 0%, transparent 100%)',
  'radial-gradient(34% 50% at 90% 10%, var(--grass-5) 0%, transparent 100%)',
  'radial-gradient(30% 40% at 50% 35%, var(--grass-3) 0%, transparent 100%)',
  'radial-gradient(40% 55% at 72% 70%, var(--violet-4) 0%, transparent 100%)',
  'radial-gradient(36% 50% at 18% 92%, var(--grass-4) 0%, transparent 100%)',
  'radial-gradient(30% 45% at 96% 96%, var(--violet-5) 0%, transparent 100%)',
  'var(--gray-2)',
].join(', ')

function MeshPanel({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-(--radius-3) ${className ?? ''}`}
      style={{ background: MESH }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-15 mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />
      {children}
    </div>
  )
}

const ACTIONS = [
  { icon: Receipt, label: 'Facturi' },
  { icon: Users, label: 'Clienți' },
  { icon: ChartColumn, label: 'Rapoarte' },
]

/** Applications: an assistant that works inside the company's own software. */
function AssistantWindow() {
  return (
    <Card
      size="3"
      variant="classic"
      className="relative z-10 mx-auto w-full max-w-[480px] xl:absolute xl:inset-x-0 xl:top-0"
    >
      {/* A short stack of messages, the newest on top. */}
      <MeshPanel className="flex h-40 items-center justify-center">
        <div className="relative w-[64%]">
          <div className="absolute inset-x-4 -bottom-4 h-full rounded-(--radius-3) bg-(--color-panel-solid) opacity-50 shadow-sm" />
          <div className="absolute inset-x-2 -bottom-2 h-full rounded-(--radius-3) bg-(--color-panel-solid) opacity-80 shadow-sm" />
          <Flex
            align="center"
            gap="3"
            className="relative rounded-(--radius-3) bg-(--color-panel-solid) p-3 shadow-md"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-2) bg-brand">
              <span className="size-2.5 rounded-[2px] bg-(--accent-contrast)" />
            </span>
            <Flex direction="column" gap="2" className="flex-1">
              <Line className="w-2/5" />
              <Line className="w-4/5" />
            </Flex>
          </Flex>
        </div>
      </MeshPanel>

      <Text as="p" size="4" weight="medium" mt="5" mb="3">
        Cu ce te ajut azi?
      </Text>

      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <Flex
            key={label}
            direction="column"
            gap="2"
            className="rounded-(--radius-3) bg-(--gray-a2) p-3 shadow-[inset_0_0_0_1px_var(--gray-a4)]"
          >
            <Icon size={16} strokeWidth={1.75} className="text-subtle" />
            <Text size="2">{label}</Text>
          </Flex>
        ))}
      </div>

      <Flex
        align="center"
        justify="between"
        mt="3"
        className="h-12 rounded-(--radius-3) pr-2 pl-3 shadow-[inset_0_0_0_1px_var(--gray-a5)]"
      >
        <Line className="w-1/3 bg-(--gray-a3)" />
        <IconButton size="2" radius="full" aria-label="Trimite">
          <ArrowUp size={16} strokeWidth={2} />
        </IconButton>
      </Flex>
    </Card>
  )
}

/** Online shops: one product, its price, the button that sells it. */
function ProductCard() {
  return (
    <Card
      size="2"
      variant="classic"
      className="absolute top-[120px] left-6 hidden w-[220px] -rotate-2 xl:block"
    >
      <MeshPanel className="grid h-28 place-items-center">
        <ShoppingBag size={28} strokeWidth={1.5} className="text-subtle" />
      </MeshPanel>
      <Flex align="center" justify="between" mt="3" mb="3">
        <Line className="w-20" />
        <Text size="2" weight="bold">
          487 lei
        </Text>
      </Flex>
      <Button size="2" className="w-full">
        Adaugă în coș
      </Button>
    </Card>
  )
}

/* Weekly takings, oldest first. Mock figures, shaped like a business that is growing. */
const TAKINGS = [22, 30, 26, 38, 35, 46, 52, 48, 61, 70, 66, 84]

const CHART_W = 200
const CHART_H = 80

const LOW = Math.min(...TAKINGS)
const HIGH = Math.max(...TAKINGS)

/**
 * Points of the series in the chart's own coordinates, stretched from the
 * lowest week to the highest so the trend fills the card, with room for the
 * stroke and the end dot.
 */
const points = TAKINGS.map((value, i) => ({
  x: (i / (TAKINGS.length - 1)) * CHART_W,
  y: CHART_H - 6 - ((value - LOW) / (HIGH - LOW)) * (CHART_H - 14),
}))

/**
 * A smooth line through the points (Catmull-Rom turned into cubic Béziers),
 * so the chart reads as a trend rather than a zigzag of single weeks.
 */
const LINE = points.reduce((d, p, i) => {
  if (i === 0) return `M ${p.x} ${p.y}`
  const p0 = points[i - 2] ?? points[i - 1]
  const p1 = points[i - 1]
  const p3 = points[i + 1] ?? p
  const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 }
  const c2 = { x: p.x - (p3.x - p1.x) / 6, y: p.y - (p3.y - p1.y) / 6 }
  return `${d} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p.x} ${p.y}`
}, '')

const AREA = `${LINE} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`
const LAST = points[points.length - 1]

/**
 * The end of the story: the money that came in. The line draws itself when
 * the page loads, the area under it fades in after, and a dot marks the
 * latest week. The movements are in globals.css and stop under reduced motion.
 */
function RevenueCard() {
  return (
    <Card
      size="2"
      variant="classic"
      className="absolute top-[40px] right-6 hidden w-[230px] rotate-2 xl:block"
    >
      <Flex align="center" justify="between" mb="4">
        <Text size="2" weight="medium">
          Încasări
        </Text>
        <Badge color="grass">+18%</Badge>
      </Flex>
      <svg
        aria-hidden
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        className="block h-20 w-full overflow-visible"
      >
        <defs>
          <linearGradient id="hero-revenue-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--accent-9)', stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-9)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path className="chart-area" d={AREA} fill="url(#hero-revenue-fill)" />
        <path
          className="chart-line"
          d={LINE}
          pathLength={1}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ stroke: 'var(--accent-9)' }}
        />
        <circle
          className="chart-dot"
          cx={LAST.x}
          cy={LAST.y}
          r={3.5}
          style={{ fill: 'var(--accent-9)', stroke: 'var(--color-panel-solid)' }}
          strokeWidth={2}
        />
      </svg>
    </Card>
  )
}
