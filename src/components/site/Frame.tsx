import React from 'react'

import { cn } from '@/utilities/ui'

import { NOISE } from './HeroGlow'

/**
 * Wraps the whole site and draws the two rails, from the top of the navbar to
 * the bottom of the footer.
 *
 * The rails are one overlay on the frame rather than borders on each section,
 * so they stay unbroken across every band, including pages that do not use
 * <Section>, and the sticky navbar cannot cover them.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col',
        "after:pointer-events-none after:absolute after:inset-0 after:z-30 after:mx-auto after:w-(--frame-width) after:border-x after:border-frame after:content-['']",
      )}
    >
      {children}
    </div>
  )
}

/** The column between the rails. */
export const columnClass = 'mx-auto w-(--frame-width)'

/**
 * One band of the page: a rule underneath that runs edge to edge across the
 * screen, content kept between the rails. `padded={false}` hands the column to
 * the children as is, for grids whose cells have to touch the rules.
 */
export function Section({
  as: Tag = 'section',
  children,
  className,
  padded = true,
  ...rest
}: {
  as?: 'section' | 'header' | 'footer' | 'div'
  children: React.ReactNode
  className?: string
  padded?: boolean
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children'>) {
  return (
    <Tag className={cn('border-b border-frame', className)} {...rest}>
      <div className={cn(columnClass, padded && 'px-(--gutter) py-(--section-gap)')}>
        {children}
      </div>
    </Tag>
  )
}

/**
 * Cells separated by hairlines that line up with the frame: the 1px gap lets
 * the line colour show from behind, each cell paints the page colour over the
 * rest. The outer edge needs no border, the rails are already there.
 */
export const gridLinesClass = 'grid gap-px bg-frame *:bg-page *:px-(--gutter) *:py-(--space-6)'

/*
 * One hue, laid down as soft patches that alternate light and deep and melt
 * into each other: a pale glow in the top-right corner, a band of fuller
 * colour below it, a light pool in the middle, colour again towards the
 * bottom-left. Listed top layer first, so each light patch sits over the
 * deeper ones and the transitions stay smooth. Steps of a single Radix scale,
 * which invert on their own in dark mode, so the alternation holds there too.
 */
const tintLayers = (hue: string) =>
  [
    `radial-gradient(38% 42% at 94% 4%, var(--${hue}-1) 0%, transparent 100%)`,
    `radial-gradient(40% 45% at 34% 46%, var(--${hue}-2) 0%, transparent 100%)`,
    `radial-gradient(34% 38% at 62% 96%, var(--${hue}-2) 0%, transparent 100%)`,
    `radial-gradient(55% 50% at 78% 34%, var(--${hue}-6) 0%, transparent 100%)`,
    `radial-gradient(50% 55% at 6% 92%, var(--${hue}-6) 0%, transparent 100%)`,
    `radial-gradient(45% 45% at 98% 98%, var(--${hue}-5) 0%, transparent 100%)`,
    `radial-gradient(45% 50% at 8% 6%, var(--${hue}-4) 0%, transparent 100%)`,
    `var(--${hue}-3)`,
  ].join(', ')

/**
 * A rounded card for the two halves of a section: one plain, holding the
 * words, one washed with a single soft hue, holding the picture. Pass another
 * `hue` on the next section and the cards alternate in colour.
 */
export function TintCard({
  hue,
  className,
  children,
}: {
  hue?: 'grass' | 'violet' | 'iris' | 'cyan' | 'lime'
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-(--radius-5) shadow-[inset_0_0_0_1px_var(--gray-a5)]',
        hue ? '' : 'bg-(--color-panel-solid)',
        className,
      )}
      style={hue ? { background: tintLayers(hue) } : undefined}
    >
      {hue ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-15 mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
        />
      ) : null}
      {children}
    </div>
  )
}
