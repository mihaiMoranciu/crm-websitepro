import React from 'react'
import Link from 'next/link'
import { Flex, Heading, Text } from '@radix-ui/themes'

import { Logo } from '@/components/Logo/Logo'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { siteConfig } from '@/utilities/siteConfig'

import { Section } from './Frame'
import { BAND, NOISE } from './HeroGlow'
import { DEFAULT_NAV, toSiteLinks } from './links'

const linkClass = 'text-subtle no-underline hover:text-strong'

/* Strongest at the very bottom of the page, gone well before the top of the footer. */
const FADE_UP = 'linear-gradient(to top, #000 0%, rgb(0 0 0 / 0.45) 40%, transparent 85%)'

/**
 * The hero's colour band again, closing the page the way it opened: same hues,
 * same grain, rising from the bottom edge, but quieter and without the stage,
 * so it reads as an ending rather than a second opening. Kept between the
 * rails like the hero's.
 */
function FooterGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-(--frame-width) -translate-x-1/2"
    >
      <div
        className="absolute inset-0 opacity-35 dark:opacity-30"
        style={{ background: BAND, maskImage: FADE_UP, WebkitMaskImage: FADE_UP }}
      />
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{ backgroundImage: NOISE, maskImage: FADE_UP, WebkitMaskImage: FADE_UP }}
      />
    </div>
  )
}

/**
 * The footer. Navigation comes from the Footer global, the company details
 * from "Setări firmă", the same record the invoices print, so the legal name,
 * CUI and contact data are typed once for both.
 *
 * Only the public fields of that record are rendered: it also holds bank
 * accounts and invoicing defaults that have no place on the site.
 */
export async function SiteFooter() {
  const [footer, company] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('setari-firma', 0)(),
  ])

  const fromAdmin = toSiteLinks(footer?.navItems)
  const links = fromAdmin.length ? fromAdmin : DEFAULT_NAV

  const legalName = company?.denumire || siteConfig.name
  const year = new Date().getFullYear()

  return (
    <footer className="relative isolate overflow-hidden">
      <FooterGlow />
      <Section as="div" padded={false}>
        {/* Hairlines drawn as borders, not as a painted gap: the cells stay
            transparent so the colour underneath shows through. */}
        <div className="grid grid-cols-1 divide-y divide-frame *:px-(--gutter) *:py-(--space-8) md:grid-cols-[2fr_1fr_1fr_1fr] md:divide-x md:divide-y-0">
          <Flex direction="column" gap="2">
            <Logo name={siteConfig.name} className="font-medium" />
            <Text size="2" color="gray" className="max-w-[32ch]">
              {siteConfig.socialDescription}
            </Text>
          </Flex>

          <FooterColumn title="Navigare">
            {links.map((link) => (
              <li key={link.href}>
                <Text size="2">
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </Text>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact">
            {company?.email ? (
              <li>
                <Text size="2">
                  <a className={linkClass} href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </Text>
              </li>
            ) : null}
            {company?.telefon ? (
              <li>
                <Text size="2">
                  <a className={linkClass} href={`tel:${company.telefon.replace(/\s+/g, '')}`}>
                    {company.telefon}
                  </a>
                </Text>
              </li>
            ) : null}
            {company?.oras ? (
              <li>
                <Text size="2" color="gray">
                  {company.oras}
                </Text>
              </li>
            ) : null}
          </FooterColumn>

          <FooterColumn title="Date firmă">
            <li>
              <Text size="2" color="gray">
                {legalName}
              </Text>
            </li>
            {company?.cui ? (
              <li>
                <Text size="2" color="gray">
                  CUI {company.cui}
                </Text>
              </li>
            ) : null}
            {company?.regCom ? (
              <li>
                <Text size="2" color="gray">
                  {company.regCom}
                </Text>
              </li>
            ) : null}
          </FooterColumn>
        </div>
      </Section>

      <Section as="div" padded={false}>
        <div className="flex flex-wrap justify-between gap-3 px-(--gutter) pt-5 pb-8">
          <Text size="1" color="gray">
            © {year} {legalName}. Toate drepturile rezervate.
          </Text>
          <Text size="1" color="gray">
            Construit cu Payload și Next.js
          </Text>
        </div>
      </Section>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="3">
      <Heading as="h2" size="2" weight="medium">
        {title}
      </Heading>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">{children}</ul>
    </Flex>
  )
}
