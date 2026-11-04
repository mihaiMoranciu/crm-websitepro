import React from 'react'
import Link from 'next/link'
import { Heading, Text } from '@radix-ui/themes'
import Image from 'next/image'
import { ChevronDown, FileText, Search } from 'lucide-react'

import highlands from '@/assets/landscapes/highlands.webp'
import layeredHills from '@/assets/landscapes/layered-hills.webp'
import mistyForest from '@/assets/landscapes/misty-forest.webp'
import { gridLinesClass, Section, TintCard } from '@/components/site/Frame'
import { Faq } from '@/components/site/Faq'
import { PRESENTATION_SITES_FAQ } from '@/components/site/faqs'
import { FlowingGradient } from '@/components/site/FlowingGradient'
import { NOISE } from '@/components/site/HeroGlow'
import { Highlight } from '@/components/site/Highlight'
import { QuoteButton } from '@/components/site/QuoteButton'
import { JsonLd } from '@/components/site/JsonLd'
import { LandscapeCard } from '@/components/site/LandscapeCard'
import { ATELIER, AtelierDesktop, AtelierMark, AtelierPhone } from '@/components/site/AtelierMock'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The web design service page: presentation sites for companies. Its search
 * target is "creare site de prezentare" (docs/seo/keyword-map.md), placed in
 * the title, the H1, the first paragraph and one subheading; the variants
 * (price, how long, editing it yourself) are the questions at the bottom.
 *
 * Each section has its own layout, and each of them shows the thing it talks
 * about: the site on a phone, the site in Google, the proposal on paper.
 *
 * Photos from Unsplash, free to use under the Unsplash licence: Quiraing,
 * Isle of Skye (photo-1470071459604), a misty pine forest
 * (photo-1418065460487) and layered hills (photo-1500534314209).
 */

const PATH = '/servicii/site-uri-de-prezentare'
const TITLE = 'Creare site de prezentare pentru firme'
const DESCRIPTION =
  'Site de prezentare rapid, ușor de administrat și gândit să fie găsit pe Google. Vezi ce include, cum lucrăm și cum se stabilește prețul.'

const FAQ = PRESENTATION_SITES_FAQ

/* A panel floating on a photo or a gradient: solid, softly lifted. */
const floatingPanel =
  'bg-(--color-panel-solid) shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55),inset_0_0_0_1px_var(--gray-a5)]'

/** A short statement in two tones: the point, then its explanation in grey. */
function Statement({
  as = 'h2',
  lead,
  rest,
  className,
}: {
  as?: 'h2' | 'h3'
  lead: React.ReactNode
  rest: React.ReactNode
  className?: string
}) {
  return (
    <Heading
      as={as}
      size={TYPE.lead}
      weight="medium"
      className={cn('max-w-[34ch] text-balance', className)}
    >
      {lead} <span className="text-subtle">{rest}</span>
    </Heading>
  )
}

/** A paragraph of body copy at reading width. */
function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      as="p"
      size={TYPE.body}
      color="gray"
      className={cn('max-w-[60ch] text-pretty', className)}
    >
      {children}
    </Text>
  )
}

/** The hero: the client's site in a browser window, over the highlands. */
function BrowserPreview() {
  return (
    <LandscapeCard
      image={highlands}
      position="40% 50%"
      priority
      className="flex min-h-[400px] w-full items-center justify-center p-6 sm:p-10 lg:min-h-[460px]"
    >
      <div
        className={cn('w-full max-w-[460px] overflow-hidden rounded-(--radius-4)', floatingPanel)}
      >
        <div className="flex border-b border-frame px-3 py-2.5">
          <span className="mx-auto rounded-full bg-(--gray-a3) px-3 py-0.5 text-xs text-subtle">
            {ATELIER.domain}
          </span>
        </div>
        <AtelierDesktop />
      </div>
    </LandscapeCard>
  )
}

/** The same site on a phone, in the forest. */
function PhonePreview() {
  return (
    <LandscapeCard
      image={mistyForest}
      position="50% 40%"
      className="flex min-h-[560px] items-center justify-center p-8"
    >
      <div
        className={cn(
          'w-[248px] overflow-hidden rounded-[2.25rem] border-[6px] border-(--gray-12) dark:border-(--gray-6)',
          floatingPanel,
        )}
      >
        <AtelierPhone />
      </div>
    </LandscapeCard>
  )
}

/**
 * The site as a Google result, with the extras structured data earns it:
 * links to its main pages and its questions, right in the results.
 */
function SearchPreview() {
  return (
    <TintCard hue="grass" className="px-5 py-10 sm:px-10 sm:py-16">
      <FlowingGradient
        colors={['var(--grass-5)', 'var(--grass-8)', 'var(--lime-7)', 'var(--violet-7)']}
        className="pointer-events-none absolute inset-0 -z-20 size-full"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE }}
      />
      <div className={cn('mx-auto max-w-2xl rounded-(--radius-4) p-5 sm:p-7', floatingPanel)}>
        <div className="mb-6 flex items-center gap-3 rounded-full px-4 py-2.5 shadow-[inset_0_0_0_1px_var(--gray-a6)]">
          <Search size={16} strokeWidth={1.5} aria-hidden className="text-subtle" />
          <span className="text-sm text-strong">uși din lemn masiv brașov</span>
        </div>

        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-full bg-[#121412]">
                <AtelierMark size={16} />
              </span>
              <span className="leading-tight">
                <span className="block text-sm text-strong">{ATELIER.brand}</span>
                <span className="block text-xs text-subtle">https://{ATELIER.domain}</span>
              </span>
            </div>
            <p className="m-0 mt-2 text-lg leading-snug text-(--iris-11)">
              Uși din lemn masiv la comandă, în Brașov | {ATELIER.brand}
            </p>
            <p className="m-0 mt-1 text-sm text-subtle">
              Uși de interior și exterior din stejar și fag, măsurate și montate de noi. Vezi
              lucrările și cere o ofertă.
            </p>
          </div>
          <div className="relative hidden aspect-square w-24 shrink-0 self-center overflow-hidden rounded-(--radius-3) sm:block">
            <Image src={ATELIER.woodenHouse} alt="" fill sizes="96px" className="object-cover" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3">
          {['Lucrări', 'Despre atelier', 'Contact'].map((link) => (
            <span key={link} className="text-sm text-(--iris-11)">
              {link}
            </span>
          ))}
        </div>

        <div className="mt-5 border-t border-frame">
          {['Cât durează o ușă la comandă?', 'Faceți și montajul?'].map((q) => (
            <div
              key={q}
              className="flex items-center justify-between border-b border-frame py-2.5 text-sm text-strong"
            >
              {q}
              <ChevronDown size={16} strokeWidth={1.5} aria-hidden className="text-subtle" />
            </div>
          ))}
        </div>
      </div>
    </TintCard>
  )
}

/** The written proposal, on the hills. */
function ProposalPreview() {
  const rows: [string, string][] = [
    ['Pagini', 'Acasă, Lucrări, Despre, Contact'],
    ['Termen', 'scris aici, în săptămâni'],
    ['Preț', 'fix, scris aici'],
    ['După lansare', 'site-ul și codul sunt ale tale'],
  ]
  return (
    <LandscapeCard
      image={layeredHills}
      position="50% 70%"
      className="flex min-h-[380px] items-center p-6 sm:p-10"
    >
      <div className={cn('w-full overflow-hidden rounded-(--radius-4)', floatingPanel)}>
        <div className="flex items-center gap-3 border-b border-frame px-4 py-3">
          <FileText size={16} strokeWidth={1.5} aria-hidden className="text-subtle" />
          <span className="text-sm font-medium text-strong">Propunere pentru site</span>
          <span className="ml-auto text-sm text-subtle">{ATELIER.domain}</span>
        </div>
        <dl className="m-0 px-4 py-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2 text-sm">
              <dt className="w-24 shrink-0 text-subtle">{label}</dt>
              <dd className="m-0 text-strong">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </LandscapeCard>
  )
}

export default function PresentationSitesPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Creare site de prezentare',
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbSchema([{ name: 'Site-uri de prezentare', path: PATH }]),
          faqSchema(FAQ),
        ]}
      />

      {/* The title, and the site it's about. */}
      <Section padded={false}>
        <div className={cn(gridLinesClass, 'grid-cols-1 lg:grid-cols-2')}>
          <div className="flex flex-col justify-end gap-6 py-(--section-gap)!">
            <Heading as="h1" size={TYPE.display} className="text-balance">
              Creare site de prezentare pentru firme care vor să fie <Highlight>găsite</Highlight>
            </Heading>
            <Text
              as="p"
              size={TYPE.lead}
              color="gray"
              className="max-w-(--reading-width) text-pretty"
            >
              Proiectăm și programăm site-ul de la zero: rapid pe telefon, ușor de modificat și
              pregătit pentru Google din prima zi.
            </Text>
            <QuoteButton size="3" className="self-start" />
          </div>
          <div className="flex items-center py-(--section-gap)!">
            <BrowserPreview />
          </div>
        </div>
      </Section>

      {/* Design: made for this company, and for the phone first. */}
      <Section className="bg-sunken">
        <div className="grid items-center gap-12 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <PhonePreview />
          <div className="flex flex-col gap-6">
            <Statement
              lead="Un site făcut pentru firma ta,"
              rest="nu o temă cumpărată și recolorată."
            />
            <Body>
              Pornim de la ce face firma, de la cine îi sunt clienții și de la ce vrei să facă ei pe
              site: să sune, să ceară o ofertă, să vadă lucrările. Structura și textele le stabilim
              împreună, ca vizitatorul să găsească repede ce caută.
            </Body>
            <Body>
              Cei mai mulți vizitatori vin de pe telefon, așa că acolo începe designul. Pe
              calculator site-ul se lărgește, nu invers.
            </Body>
          </div>
        </div>
      </Section>

      {/* Google: what gets set up, shown as the result it earns. */}
      <Section>
        <div className="flex flex-col gap-6">
          <Statement
            lead="Pregătit pentru Google înainte de lansare."
            rest="Nu un pas adăugat la final."
          />
          <Body>
            Fiecare pagină primește titlul și descrierea care apar în rezultate, adresa clară și
            datele pe care Google le folosește ca să arate linkuri și întrebări direct sub numele
            tău. Site-ul se încarcă repede, iar viteza contează și ea la poziție.
          </Body>
        </div>
        <div className="mt-12">
          <SearchPreview />
        </div>
      </Section>

      {/* Ownership: who changes what after launch. */}
      <Section className="bg-sunken">
        <Statement
          lead="După lansare, site-ul e al tău."
          rest="Îl modifici singur, iar noi rămânem pentru ce ține de partea tehnică."
          className="max-w-[44ch]"
        />
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-20">
          <div className="flex flex-col gap-3">
            <Heading as="h3" size={TYPE.body} weight="medium">
              Ce schimbi tu
            </Heading>
            <Body>
              Texte, poze, prețuri, programul și articolele de blog, dintr-un panou de administrare
              în română. Fără să ne scrii pentru fiecare virgulă și fără să atingi codul.
            </Body>
          </div>
          <div className="flex flex-col gap-3">
            <Heading as="h3" size={TYPE.body} weight="medium">
              De ce ne ocupăm noi
            </Heading>
            <Body>
              Domeniul, găzduirea și certificatul de securitate la lansare. Apoi, dacă vrei,
              actualizările și copiile de siguranță, prin{' '}
              <Link
                href="/servicii/mentenanta"
                className="text-(--accent-11) underline decoration-1 underline-offset-4"
              >
                mentenanța lunară
              </Link>
              .
            </Body>
          </div>
        </div>
      </Section>

      {/* How the work goes, and the proposal it starts from. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[6fr_5fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Totul în scris, înainte să începem."
              rest="Știi ce primești, când și cât costă."
            />
            <Body>
              Discutăm întâi despre firmă și despre ce vrei să rezolve site-ul. Primești apoi o
              propunere cu paginile, termenul și prețul, și începem doar după ce ești de acord.
            </Body>
            <Body>
              Pe parcurs vezi site-ul pe o adresă de test și ne spui ce schimbăm. La final îl punem
              online, îl trimitem la Google și îți arătăm cum îl modifici.
            </Body>
          </div>
          <ProposalPreview />
        </div>
      </Section>

      {/* The questions people search for. */}
      <Section className="bg-sunken">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <Statement
            lead="Întrebări despre site-urile de prezentare"
            rest="pe care le primim des."
            className="max-w-[24ch]"
          />
          <Faq items={FAQ} />
        </div>
      </Section>

      {/* The one next step. */}
      <Section>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Statement
            lead="Îți trebuie un site pentru firmă?"
            rest="Spune-ne ce face firma ta și îți trimitem o propunere în scris."
            className="max-w-[44ch] text-pretty"
          />
          <QuoteButton size="3" className="self-start md:self-auto" />
        </div>
      </Section>
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
