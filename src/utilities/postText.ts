/*
 * Small helpers for blog posts written in the admin's rich text editor.
 */

type LexicalNode = { text?: string; children?: LexicalNode[] }

/** All the words in a rich text document, as one string. */
export function plainText(content: unknown): string {
  const walk = (node: LexicalNode | undefined): string =>
    node ? (node.text ?? '') + ' ' + (node.children ?? []).map(walk).join(' ') : ''
  return walk((content as { root?: LexicalNode } | null)?.root)
    .replace(/\s+/g, ' ')
    .trim()
}

/** Minutes to read, at an unhurried 200 words a minute, never less than one. */
export function readingMinutes(content: unknown): number {
  const words = plainText(content).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const DATE = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })

/** "2 noiembrie 2026", or nothing when the post has no date yet. */
export const formatDate = (iso?: string | null) => (iso ? DATE.format(new Date(iso)) : '')
