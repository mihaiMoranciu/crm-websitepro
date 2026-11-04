import type { SetariFirma } from '@/payload-types'

import { getSiteURL, siteConfig } from './siteConfig'

/*
 * Schema.org data for search engines, as JSON-LD. Each builder returns a
 * plain object; render it with <JsonLd>. The company's details come from
 * "Setări firmă", the same record the invoices print, so they are typed once.
 *
 * Only state what is true and visible on the page: Google ignores, and can
 * penalise, structured data that the page itself doesn't show.
 */

type Schema = Record<string, unknown>

const absolute = (path: string) => new URL(path, getSiteURL()).toString()

const ORG_ID = () => absolute('/#organizatie')

/** The company: name, legal details and contact, from "Setări firmă". */
export function organizationSchema(company?: Partial<SetariFirma> | null): Schema {
  const address =
    company?.strada || company?.oras
      ? {
          '@type': 'PostalAddress',
          streetAddress: company.strada || undefined,
          addressLocality: company.oras || undefined,
          addressRegion: company.judet || undefined,
          postalCode: company.codPostal || undefined,
          addressCountry: 'RO',
        }
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ORG_ID(),
    name: siteConfig.name,
    legalName: company?.denumire || undefined,
    url: absolute('/'),
    logo: absolute('/favicon.svg'),
    image: absolute(siteConfig.ogImage),
    description: siteConfig.description,
    email: company?.email || undefined,
    telephone: company?.telefon || undefined,
    taxID: company?.cui || undefined,
    address,
    areaServed: { '@type': 'Country', name: 'România' },
  }
}

/** The site itself, tied to the company that publishes it. */
export function websiteSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: absolute('/'),
    name: siteConfig.name,
    inLanguage: siteConfig.lang,
    publisher: { '@id': ORG_ID() },
  }
}

/** The trail from the home page to the current page, shown under the result in Google. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Acasă', path: '/' }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  }
}

/** Questions and answers that are written out on the page. */
export function faqSchema(items: { question: string; answer: string }[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

/** One service the company offers, for that service's own page. */
export function serviceSchema({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: absolute(path),
    provider: { '@id': ORG_ID() },
    areaServed: { '@type': 'Country', name: 'România' },
  }
}

/** A blog article: headline, dates, image, and the company as author and publisher. */
export function articleSchema({
  title,
  description,
  path,
  image,
  publishedAt,
  updatedAt,
  authors,
}: {
  title: string
  description?: string | null
  path: string
  image?: string
  publishedAt?: string | null
  updatedAt?: string | null
  authors?: string[]
}): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description || undefined,
    url: absolute(path),
    mainEntityOfPage: absolute(path),
    image: image ? [image] : undefined,
    datePublished: publishedAt || undefined,
    dateModified: updatedAt || publishedAt || undefined,
    inLanguage: siteConfig.lang,
    author: authors?.length
      ? authors.map((name) => ({ '@type': 'Person', name }))
      : { '@id': ORG_ID() },
    publisher: { '@id': ORG_ID() },
  }
}
