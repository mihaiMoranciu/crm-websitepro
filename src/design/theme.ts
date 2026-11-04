import type { CSSProperties } from 'react'

/**
 * The site's visual identity in one place.
 *
 * Colours come from Radix's own 12-step scales rather than hand-picked hex
 * values: every scale ships tuned for contrast in both light and dark mode, so
 * a button, its hover, its border and its text always stay readable together.
 * Changing a name below recolours the whole site.
 *
 * Steps, as Radix uses them: 1-2 backgrounds, 3-5 component fills, 6-8
 * borders, 9-10 solid colour, 11 low-contrast text, 12 high-contrast text.
 */

/**
 * Brand green. `grass` leans towards yellow, which is what keeps it warm; the
 * plain `green` and `jade` lean towards blue and read cold. At step 9 it is a
 * mid green, saturated enough to be clearly green and not a neon signal.
 */
export const BRAND = 'grass' as const

/**
 * The colour that goes with it: a vivid one, there to catch the eye on
 * highlights, a badge, one detail per screen. Violet sits opposite the warm
 * green on the colour wheel, so the two contrast instead of blending.
 * `purple` would push harder towards magenta, `blue` would read electric.
 */
export const HIGHLIGHT = 'violet' as const

/**
 * Greys tinted towards the brand. Radix pairs `olive` with green scales, so
 * the neutral surfaces carry a trace of the same hue instead of a cold blue.
 */
export const GRAY = 'olive' as const

/** Props for Radix's `<Theme>`, so the layout does not hard-code any of them. */
export const themeConfig = {
  accentColor: BRAND,
  grayColor: GRAY,
  // Small radii and solid panels are what make the Payload admin look calm.
  radius: 'small',
  panelBackground: 'solid',
  scaling: '100%',
  // Follows the `dark` class the theme provider keeps on <html>.
  appearance: 'inherit',
} as const

/**
 * Exposes the highlight colour as `--highlight-*`, mirroring how Radix exposes
 * the brand as `--accent-*`. CSS then refers to roles, never to colour names,
 * and swapping `HIGHLIGHT` above is the only change needed.
 */
export const highlightVariables = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => i + 1).flatMap((step) => [
    [`--highlight-${step}`, `var(--${HIGHLIGHT}-${step})`],
    [`--highlight-a${step}`, `var(--${HIGHLIGHT}-a${step})`],
  ]),
) as CSSProperties
