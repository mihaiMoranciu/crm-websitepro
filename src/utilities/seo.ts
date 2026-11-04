import type { Metadata } from 'next'

import { mergeOpenGraph } from './mergeOpenGraph'
import { siteConfig } from './siteConfig'

type BuildMetaArgs = {
  /** Page title WITHOUT the brand. The root layout's template appends it. */
  title?: string
  description?: string
  /** Root-relative path, used for the canonical URL. */
  path?: string
  /**
   * Set on pages whose title already reads as a full phrase (the home page),
   * so the "| Brand" template is not appended twice.
   */
  absoluteTitle?: boolean
  /** Keeps a page out of the index, e.g. thank-you or preview routes. */
  noIndex?: boolean
  /** Absolute URL of the image shown when the page is shared. */
  image?: string
  /** Open Graph type; articles also carry their publish date. */
  article?: { publishedTime?: string; modifiedTime?: string }
}

/**
 * Builds Next.js metadata for hand-built (non-CMS) pages. CMS-driven routes
 * keep using generateMeta(), which reads the same siteConfig underneath.
 */
export const buildMeta = ({
  title,
  description = siteConfig.description,
  path = '/',
  absoluteTitle = false,
  noIndex = false,
  image,
  article,
}: BuildMetaArgs = {}): Metadata => {
  const resolvedTitle = title ?? siteConfig.defaultTitle
  const socialTitle = absoluteTitle ? resolvedTitle : `${resolvedTitle} | ${siteConfig.name}`

  return {
    title: absoluteTitle ? { absolute: resolvedTitle } : resolvedTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: mergeOpenGraph({
      title: socialTitle,
      description,
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
      ...(article ? { type: 'article', ...article } : {}),
    }),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
