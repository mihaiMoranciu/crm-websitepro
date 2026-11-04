import React from 'react'
import Link from 'next/link'

import { Logo } from '@/components/Logo/Logo'
import { siteConfig } from '@/utilities/siteConfig'

import { Section } from './Frame'
import { CONTACT_HREF, type SiteLink } from './links'
import { DesktopNav, MobileNav } from './SiteNav'
import { ThemeToggle } from './ThemeToggle'
import { QuoteButton } from './QuoteButton'

/**
 * The navbar: brand, the main navigation (see navigation.ts), the theme
 * switch and the one call to action. Menus with groups open as a large
 * panel under the bar; on small screens everything moves into one
 * full-screen panel, and the brand and the toggle stay.
 */
const CTA: SiteLink = { href: CONTACT_HREF, label: 'Cere o ofertă', newTab: false }

export function SiteHeader() {
  return (
    <Section as="header" padded={false} className="sticky top-0 z-20 bg-page">
      <div className="flex h-(--header-height) items-center gap-5 px-(--gutter)">
        <Link href="/" className="no-underline" aria-label={`${siteConfig.name}, acasă`}>
          <Logo name={siteConfig.name} />
        </Link>

        <DesktopNav />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <QuoteButton size="2" className="hidden md:inline-flex" />

          <div className="md:hidden">
            <MobileNav cta={CTA} />
          </div>
        </div>
      </div>
    </Section>
  )
}
