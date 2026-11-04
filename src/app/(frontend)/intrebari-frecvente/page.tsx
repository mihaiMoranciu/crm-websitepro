import React from 'react'
import Link from 'next/link'
import { Heading, Text } from '@radix-ui/themes'
import { ArrowUpRight } from 'lucide-react'

import { Faq } from '@/components/site/Faq'
import { gridLinesClass, Section } from '@/components/site/Frame'
import { FAQ_GROUPS, GENERAL_FAQ } from '@/components/site/faqs'
import { JsonLd } from '@/components/site/JsonLd'
import { ClosingCta } from '@/components/site/PageParts'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { siteConfig } from '@/utilities/siteConfig'
import { breadcrumbSchema, faqSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * Every question the site answers, grouped by service, with an index that
 * stays in view on wide screens. The answers live in components/site/faqs.ts,
 * shared with the service pages. Only the general questions go into this
 * page's structured data: the others are already marked up on their own
 * service page, and the same answer claimed by two pages helps neither.
 */

const PATH = '/intrebari-frecvente'

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: 'Întrebări frecvente', path: PATH }]),
          faqSchema(GENERAL_FAQ),
        ]}
      />

      <Section>
        <div className="flex flex-col gap-6">
          <Heading as="h1" size={TYPE.display} className="text-balance">
            Întrebări frecvente
          </Heading>
          <Text
            as="p"
            size={TYPE.lead}
            color="gray"
            className="max-w-(--reading-width) text-pretty"
          >
            Ce ne întreabă firmele înainte să lucrăm împreună, despre preț, termene și ce se
            întâmplă după lansare.
          </Text>
        </div>
      </Section>

      <Section padded={false}>
        <div className={cn(gridLinesClass, 'grid-cols-1 lg:grid-cols-[1fr_3fr]')}>
          {/* The index: a plain list of anchors, held in view while the answers scroll. */}
          <nav aria-label="Subiecte" className="py-(--space-8)!">
            <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 lg:sticky lg:top-[calc(var(--header-height)+var(--space-6))] lg:flex-col">
              {FAQ_GROUPS.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="flex items-baseline justify-between gap-3 text-sm text-subtle no-underline hover:text-strong"
                  >
                    {group.title}
                    <span className="hidden font-mono text-xs text-(--gray-9) lg:inline">
                      {group.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col py-(--space-8)!">
            {FAQ_GROUPS.map((group) => (
              <section
                key={group.id}
                id={group.id}
                aria-labelledby={`${group.id}-titlu`}
                className="scroll-mt-[calc(var(--header-height)+var(--space-6))] pb-16 last:pb-0"
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <Heading as="h2" id={`${group.id}-titlu`} size={TYPE.title} weight="medium">
                    {group.title}
                  </Heading>
                  {group.href ? (
                    <Link
                      href={group.href}
                      className="inline-flex items-center gap-1 text-sm text-(--accent-11) no-underline hover:underline"
                    >
                      Vezi pagina
                      <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                    </Link>
                  ) : null}
                </div>
                <Faq items={group.items} />
              </section>
            ))}
          </div>
        </div>
      </Section>

      <ClosingCta
        className="bg-sunken"
        lead="Nu ai găsit răspunsul?"
        rest="Scrie-ne întrebarea și îți răspundem în aceeași zi lucrătoare."
      />
    </>
  )
}

export const metadata = buildMeta({
  title: 'Întrebări frecvente',
  description: `Răspunsuri despre preț, termene, proprietatea asupra site-ului și ce se întâmplă după lansare, pentru fiecare serviciu ${siteConfig.name}.`,
  path: PATH,
})
