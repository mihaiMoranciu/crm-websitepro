import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { siteConfig } from './siteConfig'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: siteConfig.socialDescription,
  images: [
    {
      url: `${getServerSideURL()}${siteConfig.ogImage}`,
    },
  ],
  locale: siteConfig.locale,
  siteName: siteConfig.name,
  title: `${siteConfig.defaultTitle} | ${siteConfig.name}`,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
