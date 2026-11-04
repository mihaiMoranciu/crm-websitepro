import React from 'react'
import Link from 'next/link'
import { Heading, Text } from '@radix-ui/themes'
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
