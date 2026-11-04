import React from 'react'

/**
 * The grainy colour field at the bottom of the hero.
 *
 * Three pieces, stacked:
 * 1. A band of colour along the bottom edge, rising and fading into the page
 *    so the headline sits on a clean background.
 * 2. Film grain over the colour. It is a tiny SVG noise tile blended with
 *    `overlay`: mid-grey is neutral under overlay, so the grain adds texture
 *    without washing the colours out. A static image, nothing animates.
 * 3. A pale floor in perspective, a trapezoid with hard edges that reads as a
 *    stage and gives the field depth instead of a flat blur.
 *
 * Built only from Radix scale variables, so it recolours with the theme and
 * follows light and dark mode. Decorative: hidden from assistive technology.
 */

export const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/*
 * Violet and green sit almost opposite on the colour wheel: faded over one
 * another they average to grey. So the band walks between them through the
 * hues that lie in between (iris, cyan, a yellow-green), each stop a close
 * neighbour of the last, which keeps every transition clean. Explicit stops
 * rather than OKLCH interpolation: the in-between hues OKLCH invents fall
 * outside what most screens can show, and clipping them draws hard stripes.
 */
export const BAND =
  'linear-gradient(to right, var(--violet-10) 0%, var(--violet-9) 12%, var(--iris-9) 26%, var(--cyan-9) 42%, var(--lime-9) 63%, var(--grass-9) 84%, var(--grass-10) 100%)'

/* Extra weight in the two corners and a brighter glow behind the stage. */
const ACCENTS = [
  'radial-gradient(30% 60% at 0% 100%, var(--violet-10) 0%, transparent 100%)',
  'radial-gradient(26% 55% at 100% 100%, var(--grass-10) 0%, transparent 100%)',
  'radial-gradient(34% 50% at 55% 100%, color-mix(in oklab, var(--lime-9) 80%, white) 0%, transparent 100%)',
]

const FIELD = [...ACCENTS, BAND].join(', ')

/* Full strength along the bottom, gone by the time it reaches the copy. */
const FADE_UP =
  'linear-gradient(to top, #000 22%, rgb(0 0 0 / 0.55) 52%, rgb(0 0 0 / 0.15) 78%, transparent 100%)'

/* The grain follows the colour, so the clean page above it stays clean. */
const GRAIN_FADE = 'linear-gradient(to top, #000 30%, transparent 75%)'

export function HeroGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 isolate h-[62%]">
      <div
        className="absolute inset-0"
        style={{ background: FIELD, maskImage: FADE_UP, WebkitMaskImage: FADE_UP }}
      />
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE, maskImage: GRAIN_FADE, WebkitMaskImage: GRAIN_FADE }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[38%]"
        style={{
          clipPath: 'polygon(32% 0, 68% 0, 100% 100%, 0 100%)',
          background:
            'linear-gradient(to bottom, color-mix(in oklab, var(--surface-page) 55%, transparent), var(--surface-page) 90%)',
        }}
      />
    </div>
  )
}
