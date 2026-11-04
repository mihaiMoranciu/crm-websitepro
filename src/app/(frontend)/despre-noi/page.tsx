import React from 'react'
import Link from 'next/link'
import { Heading, Text } from '@radix-ui/themes'
import {
  BookOpen,
  Boxes,
  Braces,
  FileCheck2,
  FileCode2,
  FolderCheck,
  Globe,
  KeyRound,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react'

import { gridLinesClass, Section, TintCard } from '@/components/site/Frame'
import { BAND, NOISE } from '@/components/site/HeroGlow'
import { Highlight } from '@/components/site/Highlight'
import { QuoteButton } from '@/components/site/QuoteButton'
import { JsonLd } from '@/components/site/JsonLd'
import { TYPE } from '@/design/type'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { buildMeta } from '@/utilities/seo'
import { siteConfig } from '@/utilities/siteConfig'
import { breadcrumbSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The about page. Written in code like the home page, and kept to what is
 * true without anyone having to vouch for it: how we work, what we build
 * with, and the company's public registration data. No invented history,
 * team or numbers; add those only when they are real.
 */

/* Used until "Setări firmă" is filled in, so the page never shows a blank name. */
const LEGAL_NAME = 'Viami Smart Solution SRL'

const PRINCIPLES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Braces,
    title: 'Scriem codul, nu îl generăm',
    text: 'Folosim și instrumente cu AI, ca orice echipă la zi. Dar fiecare linie ajunge în proiect pentru că am înțeles-o.',
  },
  {
    icon: Boxes,
    title: 'Totul în aceeași echipă',
    text: 'Design, programare, găzduire și mentenanță. Proiectul nu trece de la un furnizor la altul.',
  },
  {
    icon: FileCheck2,
    title: 'Totul în scris',
    text: 'Structura, termenele și prețul le primești înainte să începem. Fără costuri descoperite pe parcurs.',
  },
  {
    icon: LifeBuoy,
    title: 'Rămânem după lansare',
    text: 'Actualizări, copii de siguranță și cineva care răspunde când ceva nu merge.',
  },
]

/* What the client receives when the project is handed over, in plain words. */
const HANDOVER: { icon: LucideIcon; name: string; note: string }[] = [
  { icon: Globe, name: 'Domeniul', note: 'înregistrat pe firma ta' },
  { icon: FileCode2, name: 'Codul site-ului', note: 'întreg, fără restricții' },
  { icon: KeyRound, name: 'Parolele și conturile', note: 'toate, într-un singur loc' },
  { icon: BookOpen, name: 'Instrucțiuni', note: 'pentru orice alt programator' },
]

/* Full colour along the bottom, gone by the top third of the panel. */
const FADE_UP =
  'linear-gradient(to top, #000 20%, rgb(0 0 0 / 0.55) 50%, rgb(0 0 0 / 0.12) 80%, transparent 100%)'

/**
 * The hero's colour field in miniature: the band rising from the bottom,
 * grain over it, and the pale trapezoid floor. Purely decorative.
 */
function Stage() {
  return (
    <div
      aria-hidden
      className="relative isolate min-h-[240px] overflow-hidden p-0! lg:min-h-[360px]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(40% 60% at 0% 100%, var(--violet-10) 0%, transparent 100%)',
            'radial-gradient(40% 60% at 100% 100%, var(--grass-10) 0%, transparent 100%)',
            BAND,
          ].join(', '),
          maskImage: FADE_UP,
          WebkitMaskImage: FADE_UP,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE, maskImage: FADE_UP, WebkitMaskImage: FADE_UP }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-[62%]"
        style={{
          clipPath: 'polygon(14% 0, 86% 0, 100% 100%, 0 100%)',
          background:
            'linear-gradient(to bottom, color-mix(in oklab, var(--surface-page) 60%, transparent), var(--surface-page) 70%)',
        }}
      />
    </div>
  )
}

/**
 * The project as the client gets it at handover: everything that makes the
 * site theirs, so any developer can pick it up. On the partner colour, so the
 * section has one thing that catches the eye.
 */
function OwnedCode() {
  return (
    <TintCard hue="violet" className="p-6 sm:p-10">
      {/* More grain than the card's own, so the colour reads as a surface. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE }}
      />
      <div className="overflow-hidden rounded-(--radius-4) bg-(--color-panel-solid) shadow-[0_24px_60px_-28px_var(--gray-a9),inset_0_0_0_1px_var(--gray-a5)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-frame px-4 py-3">
          <FolderCheck size={18} strokeWidth={1.5} aria-hidden className="text-subtle" />
          <span className="text-sm font-medium text-strong">firma-ta.ro</span>
          <span className="ml-auto rounded-full bg-(--accent-a3) px-2.5 py-0.5 text-xs font-medium text-(--accent-11)">
            Predat
          </span>
        </div>
        <ul className="m-0 list-none divide-y divide-frame p-0">
          {HANDOVER.map(({ icon: Icon, name, note }) => (
            <li key={name} className="flex items-center gap-3 px-4 py-3">
              <Icon size={16} strokeWidth={1.5} aria-hidden className="text-(--gray-9)" />
              <span className="text-sm text-strong">{name}</span>
              <span className="ml-auto text-sm text-subtle">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </TintCard>
  )
}

/**
 * One block of information: a sentence in two tones, the point and then its
 * explanation in grey, with a small label over a short list under it.
 */
function Block({
  title,
  detail,
  label,
  children,
}: {
  title: React.ReactNode
  detail: string
  label?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-10">
      <Heading as="h2" size={TYPE.lead} weight="medium" className="max-w-[34ch] text-balance">
        {title} <span className="text-subtle">{detail}</span>
      </Heading>
      <div>
        {label ? (
          <Text as="p" size={TYPE.meta} color="gray" mb="3">
            {label}
          </Text>
        ) : null}
        {children}
      </div>
    </div>
  )
}

/** Label and value pairs, in two quiet columns. */
function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-2">
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt>
            <Text size={TYPE.body} color="gray">
              {label}
            </Text>
          </dt>
          <dd className="m-0 min-w-0">
            <Text size={TYPE.body} weight="medium" className="break-words">
              {value}
            </Text>
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

const plainLink = 'text-inherit no-underline hover:underline'

export default async function AboutPage() {
  const company = await getCachedGlobal('setari-firma', 0)()

  const legalName = company?.denumire || LEGAL_NAME
  const address = [company?.strada, company?.oras, company?.judet].filter(Boolean).join(', ')

  const companyRows: [string, React.ReactNode][] = [['Denumire', legalName]]
  if (company?.cui) companyRows.push(['CUI', company.cui])
  if (company?.regCom) companyRows.push(['Reg. Comerțului', company.regCom])
  if (address) companyRows.push(['Sediu', address])
  if (company?.email)
    companyRows.push([
      'Email',
      <a key="email" href={`mailto:${company.email}`} className={plainLink}>
        {company.email}
      </a>,
    ])
  if (company?.telefon)
    companyRows.push([
      'Telefon',
      <a key="tel" href={`tel:${company.telefon.replace(/s+/g, '')}`} className={plainLink}>
        {company.telefon}
      </a>,
    ])

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Despre noi', path: '/despre-noi' }])} />

      {/* The page's one large title, and who we are in a paragraph. */}
      <Section padded={false}>
        <div className={cn(gridLinesClass, 'grid-cols-1 lg:grid-cols-[3fr_2fr]')}>
          <div className="flex flex-col justify-end gap-6 py-(--section-gap)!">
            <Heading as="h1" size={TYPE.display} className="text-balance">
              Programatori, nu <Highlight>generatoare</Highlight> de site-uri
            </Heading>
            <Text
              as="p"
              size={TYPE.lead}
              color="gray"
              className="max-w-(--reading-width) text-pretty"
            >
              {siteConfig.name} e marca sub care {legalName} proiectează, programează și întreține
              site-uri și aplicații web pentru firme, de la prima discuție până mult după lansare.
            </Text>
          </div>
          <Stage />
        </div>
      </Section>

      {/* How we work, as four short commitments side by side. */}
      <Section padded={false}>
        <ul
          className={cn(
            gridLinesClass,
            'm-0 list-none p-0 *:py-(--space-8) sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-2">
              <Icon size={24} strokeWidth={1.25} aria-hidden className="mb-4 text-(--accent-11)" />
              <Heading as="h2" size={TYPE.body} weight="medium">
                {title}
              </Heading>
              <Text as="p" size={TYPE.body} color="gray">
                {text}
              </Text>
            </li>
          ))}
        </ul>
      </Section>

      {/* Who owns the work, and the company behind it, side by side. */}
      <Section padded={false}>
        <div className={cn(gridLinesClass, 'grid-cols-1 *:py-(--section-gap) md:grid-cols-2')}>
          <Block
            title="Unelte alese, nu la modă."
            detail="Tehnologii stabile și documentate. Codul e al tău și orice programator îl poate prelua."
          >
            <OwnedCode />
          </Block>

          <Block
            title="O firmă românească,"
            detail="cu date publice pe care le poți verifica oricând."
            label="Datele firmei"
          >
            <Facts rows={companyRows} />
          </Block>
        </div>
      </Section>

      {/* The one next step. */}
      <Section>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Heading as="h2" size={TYPE.lead} weight="medium" className="max-w-[44ch] text-pretty">
            Ai un proiect în minte?{' '}
            <span className="text-subtle">
              <span className="whitespace-nowrap">Spune-ne</span> ce vrei să rezolvi și îți
              răspundem cu o propunere în scris.
            </span>
          </Heading>
          <QuoteButton size="3" className="self-start md:self-auto" />
        </div>
      </Section>
    </>
  )
}

export const metadata = buildMeta({
  title: 'Despre noi',
  description: `${siteConfig.name} (Viami Smart Solution SRL): proiectăm, programăm și întreținem site-uri și aplicații web pentru firme.`,
  path: '/despre-noi',
})
