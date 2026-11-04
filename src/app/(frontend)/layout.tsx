import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Theme } from '@radix-ui/themes'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { SiteFrame } from '@/components/site/Frame'
import { JsonLd } from '@/components/site/JsonLd'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { fontMono, fontSans } from '@/design/fonts'
import { highlightVariables, themeConfig } from '@/design/theme'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { siteConfig } from '@/utilities/siteConfig'
import { organizationSchema, websiteSchema } from '@/utilities/structuredData'
import { draftMode } from 'next/headers'

import '@/design/tokens.css'
import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const company = await getCachedGlobal('setari-firma', 0)()

  return (
    <html
      className={cn(fontSans.variable, fontMono.variable)}
      lang={siteConfig.lang}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {/* Who publishes the site, on every page, for search engines. */}
        <JsonLd data={[organizationSchema(company), websiteSchema()]} />
      </head>
      <body>
        {/* Colours, radii and fonts are configured in src/design. */}
        <Theme {...themeConfig} style={highlightVariables}>
          <Providers>
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />
            <SiteFrame>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </SiteFrame>
          </Providers>
        </Theme>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  // Every child page that sets a plain string title gets "| WebsitePro"
  // appended automatically, so no page has to repeat the brand.
  title: {
    default: `${siteConfig.defaultTitle} | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
