import React from 'react'

import { cn } from '@/utilities/ui'

/*
 * The WebsitePro mark: a W made of two V's with the hero's stage between
 * them. The stage is the same trapezoid the home page's hero stands on
 * (its top is 36% of its base, its sides run at the angle of the strokes),
 * so the letter and the site's main picture share one shape.
 *
 * Geometry, in a 40 by 28 box: four strokes 6 units wide with flat ends,
 * slanting 0.195 units sideways per unit down. The stage fills the gap
 * between the two inner strokes, reaching half a unit under each so no
 * seam shows where they meet. Everything is in the brand green; the stage
 * is the same green at 60%, so it reads as a lighter floor on light
 * backgrounds and a deeper one on dark, like the hero's.
 *
 * Variants: LogoMark (solid or outline), LogoIcon (15px, Radix style),
 * LogoTile (on a green square) and Logo (mark and name). Static files of the
 * same drawings live in public/brand (mark, outline, icon, tile, lockups for
 * light and dark backgrounds, a 512px PNG) and public/favicon.*.
 */

const W =
  'M0 0L6 0L8.46 12.63L10.93 0L16.93 0L11.46 28L5.46 28ZM34.54 28L28.54 28L23.07 0L29.07 0L31.54 12.63L34 0L40 0Z'
const STAGE = 'M16.43 0L23.57 0L29.04 28L10.96 28Z'
/* The stage exactly, without the overlap, for the outline where its sides are drawn. */
const STAGE_EXACT = 'M16.93 0L23.07 0L28.54 28L11.46 28Z'

/*
 * The 15px icon, drawn like the Radix icons: one line, 1px wide, on a 15 by
 * 15 grid. The W is a single stroke with a flat middle top, and a base line
 * joins its two bottom points, closing the stage between them (top 36% of
 * the base, as everywhere else).
 */
const ICON_W =
  'M0.833 3L3.467 12L4.216 12L6.558 4L8.442 4L10.784 12L11.533 12L14.167 3L13.125 3L11.159 9.72L9.192 3L5.808 3L3.841 9.72L1.875 3Z'
const ICON_BASE = 'M3.841 11H11.159V12H3.841Z'

export const BRAND_GREEN = '#46a758'

/** Draws in the current text colour, so its colour can be set with CSS. */
function MarkPaths({ stageOpacity = 0.6 }: { stageOpacity?: number }) {
  return (
    <>
      <path d={STAGE} fill="currentColor" fillOpacity={stageOpacity} />
      <path d={W} fill="currentColor" />
    </>
  )
}

/**
 * The mark alone. Brand green by default (the theme's accent, with the hex
 * as a fallback outside the site); pass `tone="current"` to draw it in the
 * surrounding text colour, for one-colour uses. Size it with height.
 */
export function LogoMark({
  className,
  tone = 'brand',
  variant = 'solid',
  square = false,
  title,
  style,
}: {
  className?: string
  tone?: 'brand' | 'current'
  /** `outline` draws the same shapes as hairlines, 1.5px at any size, with a faint stage. */
  variant?: 'solid' | 'outline'
  /** Centres the mark in a square box, for slots that only take square icons. */
  square?: boolean
  title?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox={square ? '-1 -7 42 42' : variant === 'outline' ? '-1 -1 42 30' : '0 0 40 28'}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn('h-7 w-auto shrink-0', className)}
      style={{
        ...(tone === 'brand' ? { color: `var(--accent-9, ${BRAND_GREEN})` } : {}),
        ...style,
      }}
    >
      {variant === 'outline' ? <OutlinePaths /> : <MarkPaths />}
    </svg>
  )
}

/** The outline: every edge of the mark as a line that keeps its width when scaled. */
function OutlinePaths() {
  const line = {
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  }
  return (
    <>
      <path d={STAGE_EXACT} fill="currentColor" fillOpacity={0.12} {...line} />
      <path d={W} fill="none" {...line} />
    </>
  )
}

/**
 * The 15px icon, with the same API as a Radix icon: 15 by 15 by default,
 * drawn in the current colour, any SVG attribute passed through.
 */
export function LogoIcon({ width = 15, height = 15, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15 15"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      <path d={ICON_W} />
      <path d={ICON_BASE} />
    </svg>
  )
}

/** The mark on a green rounded square: app icons, favicons, avatars. */
export function LogoTile({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn('size-8 shrink-0', className)}
    >
      <rect width="48" height="48" rx="11" fill={`var(--accent-9, ${BRAND_GREEN})`} />
      <g transform="translate(9 14.25) scale(0.75)" color="#ffffff">
        <MarkPaths stageOpacity={0.62} />
      </g>
    </svg>
  )
}

/**
 * The mark and the name together. The name is live text in the site's own
 * font, so it follows the theme; for a file with the name as outlines use
 * public/brand/logo.svg.
 */
export function Logo({ className, name = 'WebsitePro' }: { className?: string; name?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[0.45em] font-semibold tracking-tight text-strong',
        className,
      )}
    >
      <LogoMark className="h-[0.8em]" />
      {name}
    </span>
  )
}
