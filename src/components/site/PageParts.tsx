import React from 'react'
import Link from 'next/link'
import { Badge, Button, Flex, Heading, Text } from '@radix-ui/themes'
import type { LucideIcon } from 'lucide-react'

import { TYPE } from '@/design/type'
import { cn } from '@/utilities/ui'

import { Faq, type FaqItem } from './Faq'
import { gridLinesClass, Section, TintCard } from './Frame'
import { NOISE } from './HeroGlow'
import { QuoteButton } from './QuoteButton'

/*
 * The pieces every service and product page is built from, so the pages share
 * one voice: a large title once, then sections that open with a sentence in
 * two tones and show the thing they talk about beside it.
 */

/* A panel floating on a photo or a gradient: solid, softly lifted. */
export const floatingPanel =
  'bg-(--color-panel-solid) shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55),inset_0_0_0_1px_var(--gray-a5)]'

/** Film grain over a tinted card, a little stronger than the card's own. */
export function Grain() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-overlay dark:opacity-30"
      style={{ backgroundImage: NOISE }}
    />
  )
}

/** A short statement in two tones: the point, then its explanation in grey. */
export function Statement({
  as = 'h2',
  lead,
  rest,
  className,
}: {
  as?: 'h2' | 'h3'
  lead: React.ReactNode
  rest?: React.ReactNode
  className?: string
}) {
  return (
    <Heading
      as={as}
      size={TYPE.lead}
      weight="medium"
      className={cn('max-w-[36ch] text-balance', className)}
    >
      {lead}
      {rest ? <span className="text-subtle"> {rest}</span> : null}
    </Heading>
  )
}

/** A paragraph of body copy at reading width. */
export function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      as="p"
      size={TYPE.body}
      color="gray"
      className={cn('max-w-[60ch] text-pretty', className)}
    >
      {children}
    </Text>
  )
}

/** A link inside running text. */
export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-(--accent-11) underline decoration-1 underline-offset-4">
      {children}
    </Link>
  )
}

/** A small grey label over a short list, the way the home page lists things. */
export function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text as="p" size={TYPE.meta} color="gray" mb="3">
        {label}
      </Text>
      {children}
    </div>
  )
}

export function PlainList({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item) => (
        <li key={item}>
          <Text
            size={TYPE.body}
            weight={muted ? 'regular' : 'medium'}
            color={muted ? 'gray' : undefined}
          >
            {item}
          </Text>
        </li>
      ))}
    </ul>
  )
}

/** Name and meaning, in two quiet columns. */
export function Pairs({ rows, wide }: { rows: [string, string][]; wide?: boolean }) {
  return (
    <dl
      className={cn(
        'm-0 grid gap-x-4 gap-y-2',
        wide ? 'grid-cols-[8.5rem_1fr] sm:grid-cols-[10rem_1fr]' : 'grid-cols-[7.5rem_1fr]',
      )}
    >
      {rows.map(([name, what]) => (
        <React.Fragment key={name}>
          <dt>
            <Text size={TYPE.body} weight="medium">
              {name}
            </Text>
          </dt>
          <dd className="m-0">
            <Text size={TYPE.body} color="gray">
              {what}
            </Text>
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

/**
 * The page's one large title, the line under it and the quote button, with
 * the picture of the service beside it. `columns` sets the split.
 */
export function PageHero({
  title,
  text,
  visual,
  columns = 'lg:grid-cols-2',
}: {
  title: React.ReactNode
  text: string
  visual: React.ReactNode
  columns?: string
}) {
  return (
    <Section padded={false}>
      <div className={cn(gridLinesClass, 'grid-cols-1', columns)}>
        <div className="flex flex-col justify-end gap-6 py-(--section-gap)!">
          <Heading as="h1" size={TYPE.display} className="text-balance">
            {title}
          </Heading>
          <Text
            as="p"
            size={TYPE.lead}
            color="gray"
            className="max-w-(--reading-width) text-pretty"
          >
            {text}
          </Text>
          <QuoteButton size="3" className="self-start" />
        </div>
        <div className="flex items-center py-(--section-gap)!">{visual}</div>
      </div>
    </Section>
  )
}

/**
 * A window on a tinted, grainy card: a header row with an icon, a title and
 * a note on the right, and whatever the window shows under it.
 */
export function TintedWindow({
  hue,
  icon: Icon,
  title,
  note,
  className,
  children,
}: {
  hue: 'violet' | 'grass' | 'iris' | 'cyan' | 'lime'
  icon?: LucideIcon
  title: React.ReactNode
  note?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <TintCard hue={hue} className={cn('w-full p-5 sm:p-10', className)}>
      <Grain />
      <Window icon={Icon} title={title} note={note}>
        {children}
      </Window>
    </TintCard>
  )
}

/** The window itself, for when it sits on something other than a tinted card. */
export function Window({
  icon: Icon,
  title,
  note,
  className,
  children,
}: {
  icon?: LucideIcon
  title: React.ReactNode
  note?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('overflow-hidden rounded-(--radius-4)', floatingPanel, className)}>
      <div className="flex items-center gap-3 border-b border-frame px-4 py-3">
        {Icon ? <Icon size={16} strokeWidth={1.5} aria-hidden className="text-subtle" /> : null}
        <span className="min-w-0 truncate text-sm font-medium text-strong">{title}</span>
        {note ? (
          <span className="ml-auto hidden shrink-0 text-sm text-subtle sm:inline">{note}</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** The questions people search for, beside a short title. */
export function FaqSection({
  topic,
  items,
  className,
}: {
  topic: string
  items: FaqItem[]
  className?: string
}) {
  return (
    <Section className={className}>
      <div className="grid gap-10 lg:grid-cols-[4fr_7fr] lg:gap-16">
        <Statement lead={`Întrebări despre ${topic}`} rest="pe care le primim des." />
        <Faq items={items} />
      </div>
    </Section>
  )
}

/** The one next step, at the foot of every page. */
export function ClosingCta({
  lead,
  rest,
  className,
}: {
  lead: string
  rest: string
  className?: string
}) {
  return (
    <Section className={className}>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Statement lead={lead} rest={rest} className="max-w-[44ch] text-pretty" />
        <QuoteButton size="3" className="self-start md:self-auto" />
      </div>
    </Section>
  )
}

/**
 * A centred opening for a page: a small badge naming the service, the title,
 * one line under it, and the two actions, the quote and a jump to the
 * showcase below.
 */
export function CenteredHero({
  badge,
  icon: Icon,
  title,
  text,
  secondary,
}: {
  badge: string
  icon: LucideIcon
  title: React.ReactNode
  text: string
  secondary?: { label: string; href: string }
}) {
  return (
    <Section>
      <Flex direction="column" align="center" gap="5" className="pt-4 text-center md:pt-8">
        <Badge size="2" variant="surface" color="gray" radius="full">
          <Icon size={14} strokeWidth={1.75} className="text-(--accent-11)" />
          {badge}
        </Badge>
        <Heading as="h1" size={TYPE.display} className="max-w-4xl text-balance">
          {title}
        </Heading>
        <Text as="p" size={TYPE.lead} color="gray" className="max-w-(--reading-width) text-balance">
          {text}
        </Text>
        <Flex gap="3" wrap="wrap" justify="center" mt="2">
          <QuoteButton size="3" />
          {secondary ? (
            <Button asChild size="3" variant="soft" color="gray">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Section>
  )
}

/* A heading one step below the page title, for the opening of a section. */
const SECTION_TITLE = { initial: '7', md: '8' } as const

/**
 * A section's opening, split in two: a small label and the title on the
 * left, the explanation on the right, level with the title's last line.
 */
export function SplitHeader({
  label,
  title,
  text,
}: {
  label: string
  title: React.ReactNode
  text: string
}) {
  return (
    <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
      <div>
        <Text as="p" size={TYPE.meta} color="gray" mb="3">
          {label}
        </Text>
        <Heading as="h2" size={SECTION_TITLE} className="max-w-[18ch] text-balance">
          {title}
        </Heading>
      </div>
      <Text as="p" size={TYPE.body} color="gray" className="max-w-[46ch] text-pretty">
        {text}
      </Text>
    </div>
  )
}

export type FeatureCard = {
  icon: LucideIcon
  title: string
  text: React.ReactNode
  note?: string
}

/**
 * A title held on the left and a row of outlined cards beside it, each with
 * a small icon, a name and a few lines.
 */
export function FeatureCards({
  title,
  items,
  className,
}: {
  title: React.ReactNode
  items: FeatureCard[]
  className?: string
}) {
  return (
    <Section className={className}>
      <div className="grid gap-10 lg:grid-cols-[1fr_3fr] lg:gap-16">
        <Heading as="h2" size={SECTION_TITLE} className="max-w-[14ch] text-balance">
          {title}
        </Heading>
        <ul
          className={cn(
            'm-0 grid list-none gap-4 p-0 sm:grid-cols-2',
            items.length === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2',
          )}
        >
          {items.map(({ icon: Icon, title: name, text, note }) => (
            <li
              key={name}
              className="flex flex-col gap-2 rounded-(--radius-3) bg-(--color-panel-solid) p-6 shadow-[inset_0_0_0_1px_var(--gray-a5)]"
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-strong" />
                <Heading as="h3" size="3" weight="medium">
                  {name}
                </Heading>
              </span>
              <Text as="p" size={TYPE.meta} color="gray" className="text-pretty">
                {text}
              </Text>
              {note ? (
                <Text as="p" size={TYPE.meta} color="gray" className="mt-auto pt-4 text-pretty">
                  <span className="text-strong">De exemplu,</span> {note}
                </Text>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* A faint grid of dots behind a mockup, fading out towards the bottom. */
const DOTS = {
  backgroundImage: 'radial-gradient(var(--gray-a6) 1px, transparent 1px)',
  backgroundSize: '14px 14px',
  maskImage: 'linear-gradient(to bottom, #000 30%, transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, #000 30%, transparent 100%)',
}

/**
 * One cell of a bento grid: the name and a line at the top, a mockup of the
 * thing under them on a field of dots, cropped by the cell's edge.
 */
export function BentoCell({
  title,
  text,
  className,
  children,
}: {
  title: string
  text: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <li
      className={cn(
        'relative isolate flex flex-col overflow-hidden rounded-(--radius-4) bg-(--color-panel-solid) shadow-[inset_0_0_0_1px_var(--gray-a5)]',
        className,
      )}
    >
      <div className="p-6 pb-0">
        <Heading as="h3" size="3" weight="medium">
          {title}
        </Heading>
        <Text as="p" size={TYPE.meta} color="gray" mt="1" className="max-w-[48ch] text-pretty">
          {text}
        </Text>
      </div>
      <div aria-hidden className="relative mt-6 flex min-h-[230px] flex-1 select-none">
        <span className="absolute inset-0 -z-10" style={DOTS} />
        {children}
      </div>
    </li>
  )
}

/** The grid the bento cells sit in: three columns on wide screens. */
export function Bento({ children }: { children: React.ReactNode }) {
  return <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">{children}</ul>
}

/** A small panel inside a bento cell, the piece of the app the cell is about. */
export const bentoPanel =
  'rounded-(--radius-3) bg-(--color-panel-solid) shadow-[0_18px_40px_-24px_rgb(0_0_0/0.4),inset_0_0_0_1px_var(--gray-a5)]'
