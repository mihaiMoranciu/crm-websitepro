import { getServerSideURL } from './getURL'

/**
 * Single source of truth for site-wide SEO values. Everything that renders a
 * title, description or Open Graph tag reads from here, so the brand only ever
 * needs changing in one place.
 */
export const siteConfig = {
  name: 'WebsitePro',
  /** Used for the home page and as the fallback when a page sets no title. */
  defaultTitle: 'Web Design și Creare Site-uri Profesionale',
  description:
    'Agenție de web design din România. Creăm site-uri de prezentare, magazine online, aplicații web și identitate vizuală care te scot în relief.',
  /** Shorter variant for social cards, where long text gets truncated. */
  socialDescription:
    'Site-uri, aplicații web și branding pentru companii care vor să fie găsite, nu doar văzute.',
  lang: 'ro',
  locale: 'ro_RO',
  /** TODO: replace with a branded 1200x630 image. */
  ogImage: '/website-template-OG.webp',
} as const

export const getSiteURL = getServerSideURL
