/**
 * The site's type scale: one place that decides how big each kind of text is,
 * so sizes step down evenly instead of jumping from a 60px title straight to
 * 14px body copy.
 *
 * Values are Radix size steps (and, where they change with the screen,
 * responsive objects), passed straight to <Heading size> and <Text size>.
 *
 *   display  60px (48 on phones)  page and section titles
 *   lead     20px (18 on phones)  the line under a title
 *   title    20px, bold           a card, a step, a list item
 *   body     16px                 running text inside cards and lists
 *   meta     14px                 hints, captions, footer small print
 *
 * The element is a separate choice: the hero title is the page's only h1, the
 * section titles are h2s at the same `display` size.
 */
export const TYPE = {
  display: { initial: '8', md: '9' },
  lead: { initial: '4', md: '5' },
  title: '5',
  body: '3',
  meta: '2',
} as const
