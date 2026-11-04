import type { Footer, Header } from '@/payload-types'

export type SiteLink = { href: string; label: string; newTab: boolean }

type NavItems = NonNullable<Header['navItems'] | Footer['navItems']>

/**
 * Turns the navigation edited in the admin (Header and Footer globals) into
 * plain links. A reference to a page or post resolves to its URL; an item
 * whose target is gone is dropped rather than rendered as a dead link.
 */
export const toSiteLinks = (items: NavItems | null | undefined): SiteLink[] =>
  (items ?? []).flatMap(({ link }) => {
    const ref = link.reference
    const href =
      link.type === 'reference' && ref && typeof ref.value === 'object' && ref.value.slug
        ? `${ref.relationTo === 'pages' ? '' : `/${ref.relationTo}`}/${ref.value.slug}`
        : link.url

    if (!href || !link.label) return []
    return [{ href, label: link.label, newTab: Boolean(link.newTab) }]
  })

/**
 * Used until the navigation is filled in from the admin, so a fresh install
 * still has a working menu. They point at the sections of the home page.
 */
export const DEFAULT_NAV: SiteLink[] = [
  { href: '/#servicii', label: 'Servicii', newTab: false },
  { href: '/#proces', label: 'Cum lucrăm', newTab: false },
  { href: '/#contact', label: 'Contact', newTab: false },
]

export const CONTACT_HREF = '/#contact'
