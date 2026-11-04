import React from 'react'
import Link from 'next/link'
import { Badge, Button, Flex, Heading, Text } from '@radix-ui/themes'
import {
  FileText,
  Globe,
  Layers,
  LayoutGrid,
  MessageSquareQuote,
  MessagesSquare,
} from 'lucide-react'

import { gridLinesClass, Section } from '@/components/site/Frame'
import { HeroGlow } from '@/components/site/HeroGlow'
import { HeroMockups } from '@/components/site/HeroMockups'
import { Highlight } from '@/components/site/Highlight'
import { QuoteButton } from '@/components/site/QuoteButton'
import { Projects } from '@/components/site/Projects'
import { ServicesCarousel } from '@/components/site/ServicesCarousel'
import { SiteChecks } from '@/components/site/SiteChecks'
import { StepIllustration } from '@/components/site/StepIllustration'
import { Testimonials } from '@/components/site/Testimonials'
import { SlopComparison } from '@/components/site/SlopVsCraft'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { buildMeta } from '@/utilities/seo'
import { siteConfig } from '@/utilities/siteConfig'
import { cn } from '@/utilities/ui'
import { TYPE } from '@/design/type'

/**
 * The home page, written in code rather than built from blocks in the admin:
 * its structure is part of the design, and the copy changes rarely enough to
 * live here.
 */

const STEPS = [
  {
    title: 'Discuție',
    drawing: 'discutie',
    icon: MessagesSquare,
    text: 'Aflăm ce trebuie să rezolve proiectul, nu doar cum trebuie să arate.',
  },
  {
    title: 'Propunere',
    drawing: 'propunere',
    icon: FileText,
    text: 'Primești structura, termenele și prețul, în scris, înainte să începem.',
  },
  {
    title: 'Construcție',
    drawing: 'constructie',
    icon: Layers,
    text: 'Lucrăm în etape scurte și vezi fiecare etapă pe un link de test.',
  },
  {
    title: 'Lansare',
    drawing: 'lansare',
    icon: Globe,
    text: 'Publicăm, măsurăm și rămânem alături pentru mentenanță.',
  },
] as const

/** A centred opening for a section: optional badge, the title, one line under it. */
function CenteredHeader({
  badge,
  title,
  text,
}: {
  badge?: React.ReactNode
  title: React.ReactNode
  text?: string
}) {
  return (
    <Flex direction="column" align="center" gap="4" className="mb-12 text-center">
      {badge ? (
        <Badge size="2" variant="surface" color="gray" radius="full">
          {badge}
        </Badge>
      ) : null}
      <Heading as="h2" size={TYPE.display} className="max-w-4xl text-balance">
        {title}
      </Heading>
      {text ? (
        <Text as="p" size={TYPE.lead} color="gray" className="max-w-(--reading-width) text-balance">
          {text}
        </Text>
      ) : null}
    </Flex>
  )
}

/* The disciplines a site needs at once, each with what it means to the owner. */
const DISCIPLINES = [
  ['Design', 'ce vede clientul'],
  ['SEO', 'dacă te găsește în Google'],
  ['Viteză', 'dacă rămâne pe pagină'],
  ['Securitate', 'dacă datele sunt protejate'],
  ['Mentenanță', 'dacă merge și peste un an'],
] as const

function SectionIntro({ title, text }: { title: React.ReactNode; text?: string }) {
  return (
    <Flex direction="column" gap="5" className="max-w-(--reading-width)">
      <Heading as="h2" size={TYPE.display} className="text-balance">
        {title}
      </Heading>
      {text ? (
        <Text as="p" size={TYPE.lead} color="gray">
          {text}
        </Text>
      ) : null}
    </Flex>
  )
}

export default async function HomePage() {
  const company = await getCachedGlobal('setari-firma', 0)()
  const email = company?.email

  return (
    <>
      {/* Hero: copy on a clean page, colour rising from the bottom edge. */}
      <Section padded={false}>
        <div className="relative flex flex-col items-center overflow-hidden px-(--gutter) pt-20 pb-16 md:pb-20 text-center md:pt-24">
          <HeroGlow />
          <Flex direction="column" align="center" gap="5" className="relative max-w-4xl">
            <Heading as="h1" size={TYPE.display} className="text-balance">
              Site-uri și aplicații care <Highlight>lucrează</Highlight> pentru firma ta
            </Heading>
            <Text
              as="p"
              size={TYPE.lead}
              color="gray"
              className="max-w-(--reading-width) text-balance"
            >
              Proiectăm, programăm și întreținem site-uri și aplicații web pentru firme care vor
              rezultate, nu doar o prezență online.
            </Text>
            <Flex gap="3" wrap="wrap" justify="center" mt="2">
              {/* The one action the page exists for: larger, with a shadow tinted
                  in the brand green so it lifts off the page without glowing. */}
              <QuoteButton size="4" attention />
              <Button asChild size="4" variant="soft" color="gray" className="px-6">
                <Link href="#servicii">Servicii</Link>
              </Button>
            </Flex>
          </Flex>
          <HeroMockups />
        </div>
      </Section>

      {/* Services: one card per kind of work, in a row that scrolls sideways. */}
      <Section id="servicii" className="scroll-mt-(--header-height) bg-sunken">
        <CenteredHeader
          badge={
            <>
              <LayoutGrid size={14} strokeWidth={1.75} className="text-(--accent-11)" />
              Servicii
            </>
          }
          title={
            <>
              Tot ce ține de firma ta online, făcut de <Highlight>aceeași echipă</Highlight>
            </>
          }
          text="Designer și programator la aceeași masă, așa că nimic nu se pierde între schiță și site-ul care merge."
        />
        <ServicesCarousel />
      </Section>

      {/* Recent work, right after what we do: the proof before the argument. */}
      <Section id="proiecte" className="scroll-mt-(--header-height)">
        <Heading as="h2" size={TYPE.display} className="mb-12 max-w-4xl text-balance">
          Ce am <Highlight>livrat</Highlight> recent
        </Heading>
        <Projects />
      </Section>

      {/* The argument of the whole site, made by showing instead of telling. */}
      <Section id="diferenta" className="scroll-mt-(--header-height)">
        <Heading as="h2" size={TYPE.display} className="max-w-4xl text-balance">
          Același site. Unul{' '}
          <span className="whitespace-nowrap">
            <Highlight>gândit</Highlight>,
          </span>{' '}
          unul generat.
        </Heading>
        <SlopComparison />
      </Section>

      {/* Everything a site has to get right at once, gathered into one picture.
          The mirror of the section above: words on the left, picture on the right. */}
      <Section id="calitate" className="scroll-mt-(--header-height)">
        <Heading as="h2" size={TYPE.display} className="max-w-4xl text-balance">
          Un site bun nu e doar{' '}
          <span className="whitespace-nowrap">
            <Highlight>ce se vede</Highlight>.
          </span>
        </Heading>
        <div className="mt-12 grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-10 lg:pt-24">
            <Text as="p" size={TYPE.lead} weight="medium" className="text-balance">
              Un site e la fel de bun ca cea mai slabă parte a lui.{' '}
              <span className="text-subtle">
                Designul nu ajută dacă site-ul nu apare în Google, se încarcă greu sau poate fi
                spart.
              </span>
            </Text>
            <div>
              <Text as="p" size={TYPE.meta} color="gray" mb="3">
                Ce trebuie să meargă împreună
              </Text>
              <dl className="m-0 grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2">
                {DISCIPLINES.map(([name, what]) => (
                  <React.Fragment key={name}>
                    <dt>
                      <Text size={TYPE.body} weight="medium">
                        {name}
                      </Text>
                    </dt>
                    <dd className="m-0">
                      <Text size={TYPE.body} color="gray">
                        {what}
                      </Text>
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          </div>
          <SiteChecks />
        </div>
      </Section>

      {/* Process: heading held on the left, the steps read down the right. */}
      <Section id="proces" padded={false} className="scroll-mt-(--header-height)">
        <div
          className={cn(gridLinesClass, 'grid-cols-1 *:py-(--section-gap) md:grid-cols-[2fr_3fr]')}
        >
          <div>
            <div className="md:sticky md:top-[calc(var(--header-height)+var(--space-6))]">
              <SectionIntro
                title={
                  <>
                    Patru pași, <Highlight>fără surprize</Highlight>
                  </>
                }
                text="Știi tot timpul la ce lucrăm, cât mai durează și cât costă."
              />
            </div>
          </div>
          <ol className="m-0 list-none divide-y divide-frame p-0">
            {STEPS.map((step) => (
              <li key={step.title} className="py-10 first:pt-0 last:pb-0">
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="3" mb="1">
                    <span className="grid size-10 shrink-0 place-items-center rounded-(--radius-3) bg-(--accent-a3) text-(--accent-11)">
                      <step.icon size={20} strokeWidth={1.6} aria-hidden />
                    </span>
                    <Heading as="h3" size={TYPE.title}>
                      {step.title}
                    </Heading>
                  </Flex>
                  <Text as="p" size={TYPE.body} color="gray" className="max-w-[48ch]">
                    {step.text}
                  </Text>
                  <div className="mt-6">
                    <StepIllustration kind={step.drawing} />
                  </div>
                </Flex>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* What clients say, in their own words. */}
      <Section id="clienti" className="scroll-mt-(--header-height) bg-sunken">
        <CenteredHeader
          badge={
            <>
              <MessageSquareQuote size={14} strokeWidth={1.75} className="text-(--accent-11)" />
              Clienți
            </>
          }
          title={
            <>
              Ce spun cei cu care am <Highlight>lucrat</Highlight>
            </>
          }
          text="Câteva dintre firmele pentru care am construit site-uri și aplicații, în cuvintele lor."
        />
        <Testimonials />
      </Section>

      {/* Contact */}
      <Section id="contact" className="scroll-mt-(--header-height)">
        <Flex
          direction={{ initial: 'column', md: 'row' }}
          gap="6"
          justify="between"
          align={{ md: 'end' }}
        >
          <SectionIntro
            title="Spune-ne ce ai în minte"
            text="Răspundem în aceeași zi lucrătoare, cu întrebări concrete sau direct cu o propunere."
          />
          {email ? (
            <Button asChild size="3" className="self-start md:self-auto">
              <a href={`mailto:${email}`}>{email}</a>
            </Button>
          ) : null}
        </Flex>
      </Section>
    </>
  )
}

export const metadata = buildMeta({
  // The home page keeps its own full phrase, so the "| WebsitePro" template is
  // not appended on top of a title that already reads as a complete line.
  title: `${siteConfig.defaultTitle} | ${siteConfig.name}`,
  absoluteTitle: true,
  path: '/',
})
