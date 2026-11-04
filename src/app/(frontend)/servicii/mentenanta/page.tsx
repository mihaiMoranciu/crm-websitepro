import React from 'react'
import { Heading, Text } from '@radix-ui/themes'
import {
  DatabaseBackup,
  Globe,
  LockKeyhole,
  type LucideIcon,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'

import { gridLinesClass, Section, TintCard } from '@/components/site/Frame'
import { Faq } from '@/components/site/Faq'
import { MAINTENANCE_FAQ } from '@/components/site/faqs'
import { FlowingGradient } from '@/components/site/FlowingGradient'
import { NOISE } from '@/components/site/HeroGlow'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import { QuoteButton } from '@/components/site/QuoteButton'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { siteConfig } from '@/utilities/siteConfig'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The maintenance service page. Its search target is "mentenanță site" (see
 * docs/seo/keyword-map.md): it sits in the title, the H1, the first paragraph
 * and one subheading, and the variants go into the questions at the bottom.
 * No prices or response times are promised here until they are set in writing.
 *
 * The sections follow the home page: one large title for the page, then
 * each section opens with a sentence in two tones and a short list, beside
 * a picture of the thing itself (the monthly report, the backups, the email
 * after an outage) on a tinted, grainy card. No landscape photos here.
 */

const PATH = '/servicii/mentenanta'
const TITLE = 'Mentenanță site: actualizări, backup și suport'
const DESCRIPTION =
  'Actualizări de securitate, copii de siguranță și cineva care răspunde când site-ul nu merge. Abonament lunar, cu tot ce intră în el scris de la început.'

/* What the monthly subscription covers, and what each part means to the owner. */
const INCLUDED: [string, string][] = [
  ['Actualizări', 'testate întâi pe o copie a site-ului'],
  ['Copii de siguranță', 'automate, păstrate în alt loc'],
  ['Supraveghere', 'site-ul verificat din câteva în câteva minute'],
  ['Certificat și domeniu', 'reînnoite la timp'],
  ['Modificări mici', 'texte, poze, prețuri, program'],
  ['Raport lunar', 'ce am făcut, pe înțeles'],
]

/* What happens when the site goes down, in plain words. */
const INCIDENT = [
  'Supravegherea ne anunță pe noi, nu clienții tăi',
  'Repunem site-ul online',
  'Primești în scris ce s-a întâmplat',
  'Schimbăm ce trebuie ca să nu se repete',
]

const IN_PLAN = [
  'Actualizări și verificări',
  'Copii de siguranță',
  'Intervenții când site-ul pică',
  'Modificări mici de conținut',
]
const SEPARATE = ['Pagini sau funcții noi', 'Redesign', 'Integrări cu alte programe']

const FAQ = MAINTENANCE_FAQ

/* The last 30 days as status bars: one short outage, fixed the same day. */
const DAYS = Array.from({ length: 30 }, (_, i) => (i === 19 ? 'incident' : 'ok'))

/* A panel floating on a photo or a gradient: solid, softly lifted. */
const floatingPanel =
  'bg-(--color-panel-solid) shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55),inset_0_0_0_1px_var(--gray-a5)]'

/** A sentence in two tones: the point in full colour, its explanation in grey. */
function Lead({ point, rest }: { point: string; rest: string }) {
  return (
    <Heading as="h2" size={TYPE.lead} weight="medium" className="max-w-[38ch] text-balance">
      {point} <span className="text-subtle">{rest}</span>
    </Heading>
  )
}

/** A small grey label over a short list, the way the home page lists things. */
function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text as="p" size={TYPE.meta} color="gray" mb="3">
        {label}
      </Text>
      {children}
    </div>
  )
}

function PlainList({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item) => (
        <li key={item}>
          <Text
            size={TYPE.body}
            weight={muted ? 'regular' : 'medium'}
            color={muted ? 'gray' : undefined}
          >
            {item}
          </Text>
        </li>
      ))}
    </ul>
  )
}

/**
 * A month of maintenance on one site, as the client would read it: what was
 * checked, when, and thirty days of uptime. An illustration, not live data.
 */
function MonthlyReport() {
  const rows: { icon: LucideIcon; name: string; value: string }[] = [
    { icon: ShieldCheck, name: 'Actualizări de securitate', value: 'toate aplicate' },
    { icon: DatabaseBackup, name: 'Copie de siguranță', value: 'azi, 03:00' },
    { icon: LockKeyhole, name: 'Certificat', value: 'valabil încă 74 de zile' },
    { icon: Globe, name: 'Domeniu', value: 'reînnoit până în 2027' },
  ]

  return (
    <TintCard hue="grass" className="w-full p-6 sm:p-10">
      {/* The colour slowly flows under the grain; the static tint stays as the fallback. */}
      <FlowingGradient
        colors={['var(--grass-5)', 'var(--grass-8)', 'var(--lime-7)', 'var(--violet-7)']}
        className="pointer-events-none absolute inset-0 -z-20 size-full"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE }}
      />
      <div className={cn('overflow-hidden rounded-(--radius-4)', floatingPanel)}>
        <div className="flex items-center gap-3 border-b border-frame px-4 py-3">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-(--grass-9) opacity-60 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-(--grass-9)" />
          </span>
          <span className="text-sm font-medium text-strong">firma-ta.ro</span>
          <span className="ml-auto text-sm text-subtle">Raportul lunii</span>
        </div>

        <ul className="m-0 list-none divide-y divide-frame p-0">
          {rows.map(({ icon: Icon, name, value }) => (
            <li key={name} className="flex items-center gap-3 px-4 py-3">
              <Icon size={16} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--gray-9)" />
              <span className="text-sm text-strong">{name}</span>
              <span className="ml-auto text-right text-sm text-subtle">{value}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-frame p-4">
          <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-strong">Ultimele 30 de zile</span>
            <span className="text-subtle">o întrerupere, 12 minute</span>
          </div>
          <div className="flex h-8 gap-[3px]">
            {DAYS.map((day, i) => (
              <span
                key={i}
                className={cn(
                  'flex-1 rounded-[2px]',
                  day === 'ok' ? 'bg-(--grass-9)' : 'bg-(--amber-9)',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </TintCard>
  )
}

/** A panel on a tinted, grainy card, the way the about page shows its handover. */
function TintedPanel({
  hue,
  children,
}: {
  hue: 'violet' | 'grass' | 'iris'
  children: React.ReactNode
}) {
  return (
    <TintCard hue={hue} className="p-6 sm:p-10">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE }}
      />
      <div className={cn('overflow-hidden rounded-(--radius-4)', floatingPanel)}>{children}</div>
    </TintCard>
  )
}

/** The backups of one site, any of them one click from being the live site again. */
function Backups() {
  const backups = ['Azi, 03:00', 'Ieri, 03:00', '1 noiembrie, 03:00', '31 octombrie, 03:00']
  return (
    <TintedPanel hue="violet">
      <div className="flex items-center gap-3 border-b border-frame px-4 py-3">
        <DatabaseBackup size={16} strokeWidth={1.5} aria-hidden className="text-subtle" />
        <span className="text-sm font-medium text-strong">Copii de siguranță</span>
        <span className="ml-auto text-sm text-subtle">firma-ta.ro</span>
      </div>
      <ul className="m-0 list-none p-0">
        {backups.map((when, i) => (
          <li
            key={when}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm',
              i === 0 && 'bg-(--accent-a2)',
            )}
          >
            <span className="whitespace-nowrap text-strong">{when}</span>
            <span className="hidden text-subtle sm:inline">site, baza de date, poze</span>
            {i === 0 ? (
              <span className="ml-auto flex items-center gap-1.5 rounded-(--radius-2) px-2.5 py-1 text-xs font-medium text-(--accent-11) shadow-[inset_0_0_0_1px_var(--accent-a7)]">
                <RotateCcw size={12} strokeWidth={1.75} aria-hidden />
                Restaurează
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="m-0 border-t border-frame px-4 py-3 text-xs text-subtle">
        Păstrate în alt loc decât site-ul, ca să supraviețuiască orice s-ar întâmpla cu el.
      </p>
    </TintedPanel>
  )
}

/** The email the client gets after an outage: what happened, and that it is fixed. */
function OutageEmail() {
  return (
    <TintedPanel hue="iris">
      <div className="flex items-center gap-3 border-b border-frame px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--accent-9) text-sm font-semibold text-(--accent-contrast)">
          {siteConfig.name.slice(0, 1)}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-sm font-medium text-strong">Echipa {siteConfig.name}</span>
          <span className="block text-xs text-subtle">către tine, azi la 14:34</span>
        </span>
      </div>
      <div className="flex flex-col gap-3 px-5 py-5 text-sm leading-relaxed">
        <p className="m-0 text-base font-semibold text-strong">
          firma-ta.ro a fost oprit 12 minute azi
        </p>
        <p className="m-0 text-subtle">
          La 14:20 site-ul nu a mai răspuns, din cauza unei actualizări a serverului de găzduire.
          L-am repus online la 14:32, din copia de siguranță de azi-noapte, și am verificat că
          formularul de contact merge.
        </p>
        <p className="m-0 text-subtle">
          Am schimbat setarea care a provocat oprirea, ca să nu se repete. Nu e nevoie să faci
          nimic.
        </p>
      </div>
    </TintedPanel>
  )
}

export default function MaintenancePage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({ name: 'Mentenanță site', description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([{ name: 'Mentenanță', path: PATH }]),
          faqSchema(FAQ),
        ]}
      />

      {/* The page's one large title, and the month of one site under our care. */}
      <Section padded={false}>
        <div className={cn(gridLinesClass, 'grid-cols-1 lg:grid-cols-[3fr_2fr]')}>
          <div className="flex flex-col justify-end gap-6 py-(--section-gap)!">
            <Heading as="h1" size={TYPE.display} className="text-balance">
              Mentenanță site, ca să nu afli de la <Highlight>clienți</Highlight> că nu merge
            </Heading>
            <Text
              as="p"
              size={TYPE.lead}
              color="gray"
              className="max-w-(--reading-width) text-pretty"
            >
              Ne ocupăm de site-ul tău după lansare: actualizări de securitate, copii de siguranță
              și cineva care răspunde când ceva nu merge.
            </Text>
            <QuoteButton size="3" className="self-start" />
          </div>
          <div className="flex items-center py-(--section-gap)!">
            <MonthlyReport />
          </div>
        </div>
      </Section>

      {/* What the subscription covers: the words, then the backups as a picture. */}
      <Section className="bg-sunken">
        <div className="grid items-center gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-10">
            <Lead
              point="Ce intră în mentenanța lunară."
              rest="Un site nu se strică de la sine, dar programele pe care rulează primesc actualizări în fiecare lună, și cineva trebuie să le aplice fără să strice nimic."
            />
            <Labelled label="Inclus în abonament">
              <dl className="m-0 grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-2 sm:grid-cols-[10rem_1fr]">
                {INCLUDED.map(([name, what]) => (
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
            </Labelled>
          </div>
          <Backups />
        </div>
      </Section>

      {/* When the site goes down: the mirror of the section above. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[7fr_4fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            <OutageEmail />
          </div>
          <div className="order-1 flex flex-col gap-10 lg:order-2">
            <Lead
              point="Când site-ul pică, aflăm noi primii."
              rest="Nu suni pe nimeni și nu aștepți: primești un email cu ce s-a întâmplat, de obicei după ce totul merge din nou."
            />
            <Labelled label="Ce se întâmplă">
              <PlainList items={INCIDENT} />
            </Labelled>
          </div>
        </div>
      </Section>

      {/* What the price covers, and what is quoted separately. */}
      <Section className="bg-sunken">
        <div className="grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <Lead
            point="Un preț lunar, fără surprize."
            rest="Îl primești în scris după ce vedem site-ul, și nu se schimbă fără să te anunțăm."
          />
          <div className="grid gap-10 sm:grid-cols-2">
            <Labelled label="În abonament">
              <PlainList items={IN_PLAN} />
            </Labelled>
            <Labelled label="Separat, cu ofertă">
              <PlainList items={SEPARATE} muted />
            </Labelled>
          </div>
        </div>
      </Section>

      {/* The questions people search for. */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <Lead point="Întrebări despre mentenanță" rest="pe care le primim des." />
          <Faq items={FAQ} />
        </div>
      </Section>

      {/* The one next step. */}
      <Section className="bg-sunken">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Lead
            point="Vrei pe cineva care să aibă grijă de site?"
            rest="Trimite-ne adresa lui și îți spunem în scris ce vedem și cât ar costa."
          />
          <QuoteButton size="3" className="self-start md:self-auto" />
        </div>
      </Section>
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
