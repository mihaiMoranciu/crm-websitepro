import React from 'react'
import { Heading, Text } from '@radix-ui/themes'
import { X } from 'lucide-react'

import { ATELIER, AtelierPhone, atelierSerif, BONE, INK, OAK } from '@/components/site/AtelierMock'
import { gridLinesClass, Section, TintCard } from '@/components/site/Frame'
import { IDENTITY_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import {
  Body,
  ClosingCta,
  FaqSection,
  floatingPanel,
  Grain,
  InlineLink,
  Labelled,
  PageHero,
  Pairs,
  Statement,
} from '@/components/site/PageParts'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The visual identity page. Its search target is "identitate vizuală firmă"
 * (docs/seo/keyword-map.md), with logo design and brand guidelines as the
 * variants.
 *
 * The example brand is Atelier Lemn, the made-up carpentry workshop whose
 * site the presentation sites page shows. Here it is shown the other way
 * round: the brand sheet first, then the same brand tested small, in black
 * and white, and on the things it ends up on.
 */

const PATH = '/servicii/identitate-vizuala'
const TITLE = 'Identitate vizuală și logo pentru firme'
const DESCRIPTION =
  'Logo, culori, fonturi și un ghid de brand care se aplică la fel pe site, pe facturi și pe materialele tipărite.'

const PALETTE: [string, string][] = [
  ['Negru pădure', INK],
  ['Stejar', OAK],
  ['Var', BONE],
]

const DELIVERABLES: [string, string][] = [
  ['Logo', 'complet, doar semnul, alb-negru'],
  ['Culori', 'cu codurile pentru ecran și pentru tipar'],
  ['Fonturi', 'pentru titluri și pentru text'],
  ['Ghid de brand', 'câteva pagini, nu o carte'],
  ['Fișiere', 'vectoriale, gata de tipar'],
  ['Aplicări', 'carte de vizită, antet, factură, site'],
]

const PAPER = '#fbfaf7'

/**
 * The workshop's mark at any size and in any colour. Below 24px the initials
 * stop being readable, so the small version keeps only the first letter:
 * the simplified mark a favicon needs.
 */
function Mark({ size, color }: { size: number; color: string }) {
  const short = size < 24
  return (
    <span
      className={cn(
        atelierSerif.className,
        'grid shrink-0 place-items-center font-semibold italic',
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * (short ? 0.68 : 0.45),
        lineHeight: 1,
        color,
        boxShadow: `inset 0 0 0 ${size >= 48 ? 1.5 : 1}px ${color}`,
        borderRadius: Math.max(2, size / 8),
      }}
    >
      {short ? 'A' : 'AL'}
    </span>
  )
}

/** The hero: the first page of the workshop's brand guide. */
function BrandSheet() {
  return (
    <TintCard hue="grass" className="w-full p-5 sm:p-10">
      <Grain />
      <div className={cn('overflow-hidden rounded-(--radius-4)', floatingPanel)}>
        <div className="flex items-center gap-3 border-b border-frame px-4 py-3 text-sm">
          <span className="font-medium text-strong">Ghid de brand</span>
          <span className="ml-auto text-subtle">{ATELIER.brand}</span>
        </div>

        <div className="flex items-center gap-4 px-6 py-10 sm:px-8" style={{ background: INK }}>
          <Mark size={56} color={OAK} />
          <span className="leading-tight">
            <span
              className={cn(atelierSerif.className, 'block text-[28px] font-semibold')}
              style={{ color: BONE }}
            >
              {ATELIER.brand}
            </span>
            <span className="block text-xs" style={{ color: 'rgb(239 237 232 / 0.6)' }}>
              Uși și ferestre din lemn masiv, Brașov
            </span>
          </span>
        </div>

        <ul className="m-0 grid list-none grid-cols-3 border-t border-frame p-0">
          {PALETTE.map(([name, hex]) => (
            <li key={name} className="border-r border-frame last:border-r-0">
              <span
                className="block h-14 shadow-[inset_0_-1px_0_var(--gray-a5)]"
                style={{ background: hex }}
              />
              <span className="block px-3 pt-2 text-xs text-strong">{name}</span>
              <span className="block px-3 pb-3 font-mono text-[11px] text-subtle uppercase">
                {hex}
              </span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 border-t border-frame">
          <div className="border-r border-frame px-4 py-4">
            <span
              className={cn(
                atelierSerif.className,
                'block text-4xl leading-none font-medium text-strong',
              )}
            >
              Aa
            </span>
            <span className="mt-2 block text-xs text-subtle">Titluri: IBM Plex Serif</span>
          </div>
          <div className="px-4 py-4">
            <span className="block text-4xl leading-none text-strong">Aa</span>
            <span className="mt-2 block text-xs text-subtle">Text: IBM Plex Sans</span>
          </div>
        </div>
      </div>
    </TintCard>
  )
}

/** The mark tested where marks usually fail: small, on light, in one colour. */
function SizeTest() {
  const tile = 'flex flex-col items-center justify-end gap-4 px-4 pt-8 pb-4'
  const caption = 'font-mono text-[11px] text-subtle'
  return (
    <div className={cn('overflow-hidden rounded-(--radius-4)', floatingPanel)}>
      <div className="grid grid-cols-2 gap-px bg-(--gray-a5) sm:grid-cols-4">
        <div className={tile} style={{ background: INK }}>
          <Mark size={64} color={OAK} />
          <span className="font-mono text-[11px]" style={{ color: 'rgb(239 237 232 / 0.6)' }}>
            64 px
          </span>
        </div>
        <div className={tile} style={{ background: BONE }}>
          <Mark size={32} color={INK} />
          <span className="font-mono text-[11px]" style={{ color: 'rgb(18 20 18 / 0.6)' }}>
            32 px, pe deschis
          </span>
        </div>
        <div className={cn(tile, 'bg-(--color-panel-solid)')}>
          {/* A browser tab, the place a 16px mark actually lives. */}
          <span className="flex items-center gap-2 rounded-t-(--radius-2) bg-(--gray-a3) px-2.5 py-1.5">
            <Mark size={16} color={INK} />
            <span className="text-[11px] text-strong">{ATELIER.brand}</span>
            <X size={10} strokeWidth={2} aria-hidden className="text-subtle" />
          </span>
          <span className={caption}>16 px, în tab</span>
        </div>
        <div className={tile} style={{ background: '#ffffff' }}>
          <Mark size={40} color="#000000" />
          <span className="font-mono text-[11px]" style={{ color: 'rgb(0 0 0 / 0.55)' }}>
            alb-negru
          </span>
        </div>
      </div>
    </div>
  )
}

/** A business card, front over back, at the real 85 by 55 proportion. */
function BusinessCard() {
  return (
    <div className="relative mx-auto aspect-[85/55] w-[78%]">
      <div
        className="absolute inset-0 translate-x-[9%] -translate-y-[12%] rounded-[6px] shadow-[0_10px_30px_-14px_rgb(0_0_0/0.5)]"
        style={{ background: OAK }}
      >
        <span className="grid size-full place-items-center">
          <Mark size={40} color={INK} />
        </span>
      </div>
      <div
        className="absolute inset-0 flex flex-col justify-between rounded-[6px] p-4 shadow-[0_16px_36px_-14px_rgb(0_0_0/0.6)]"
        style={{ background: INK, color: BONE }}
      >
        <Mark size={24} color={OAK} />
        <span className="leading-tight">
          <span className={cn(atelierSerif.className, 'block text-[15px] font-medium')}>
            Andrei Munteanu
          </span>
          <span className="block text-[10px]" style={{ color: 'rgb(239 237 232 / 0.6)' }}>
            tâmplar, {ATELIER.domain}
          </span>
        </span>
      </div>
    </div>
  )
}

/** The head of an invoice, where the brand meets the paperwork. */
function InvoiceHead() {
  return (
    <div
      className="mx-auto w-[86%] rounded-[4px] px-5 pt-5 pb-6 shadow-[0_16px_36px_-18px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(0_0_0/0.06)]"
      style={{ background: PAPER, color: INK }}
    >
      <div
        className="flex items-center gap-2.5 pb-3"
        style={{ borderBottom: `1.5px solid ${OAK}` }}
      >
        <Mark size={22} color={INK} />
        <span className={cn(atelierSerif.className, 'text-[13px] font-semibold')}>
          {ATELIER.brand}
        </span>
        <span className="ml-auto text-right text-[10px] leading-tight">
          <span className="block font-medium">Factura AL-0021</span>
          <span className="block" style={{ color: 'rgb(18 20 18 / 0.55)' }}>
            12 noiembrie 2026
          </span>
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-[10px]">
        {[
          ['Ușă de exterior, stejar', '3.400,00'],
          ['Montaj', '850,00'],
        ].map(([what, sum]) => (
          <span key={what} className="flex justify-between">
            <span>{what}</span>
            <span className="tabular-nums">{sum}</span>
          </span>
        ))}
        <span
          className="mt-1 flex justify-between pt-1.5 font-semibold"
          style={{ borderTop: '1px solid rgb(18 20 18 / 0.12)' }}
        >
          <span>Total</span>
          <span className="tabular-nums">4.250,00 lei</span>
        </span>
      </div>
    </div>
  )
}

/** The site on a phone, cut off by the bottom of its box like a screenshot. */
function SitePhone() {
  return (
    <div className="mx-auto w-[248px] translate-y-10 overflow-hidden rounded-t-[2rem] border-[6px] border-b-0 border-(--gray-12) shadow-[0_16px_36px_-18px_rgb(0_0_0/0.5)] dark:border-(--gray-6)">
      <AtelierPhone />
    </div>
  )
}

const APPLIED: { title: string; text: string; object: React.ReactNode }[] = [
  {
    title: 'Pe cartea de vizită',
    text: 'Unde semnul trebuie să se vadă și la trei centimetri.',
    object: <BusinessCard />,
  },
  {
    title: 'Pe factură',
    text: 'Unde logo-ul stă lângă cifre și nu trebuie să le acopere.',
    object: <InvoiceHead />,
  },
  {
    title: 'Pe site',
    text: 'Unde culorile și fonturile se văd cel mai des.',
    object: <SitePhone />,
  },
]

export default function VisualIdentityPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Identitate vizuală pentru firme',
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbSchema([{ name: 'Identitate vizuală', path: PATH }]),
          faqSchema(IDENTITY_FAQ),
        ]}
      />

      <PageHero
        columns="lg:grid-cols-[3fr_2fr]"
        title={
          <>
            Identitate vizuală pentru firme, la fel pe ecran și pe <Highlight>hârtie</Highlight>
          </>
        }
        text="Logo, culori și fonturi alese pentru ce face firma ta, plus un ghid scurt după care le folosește corect oricine: tipografia, cel care face firma luminoasă sau următorul programator."
        visual={<BrandSheet />}
      />

      {/* What is delivered, and the test every logo goes through first. */}
      <Section className="bg-sunken">
        <div className="grid items-center gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-10">
            <Statement
              lead="Un logo trebuie să meargă și la 16 pixeli."
              rest="Îl încercăm mic, pe fundal deschis și alb-negru înainte să ți-l arătăm, nu după."
            />
            <Labelled label="Ce primești">
              <Pairs rows={DELIVERABLES} />
            </Labelled>
          </div>
          <SizeTest />
        </div>
      </Section>

      {/* The brand on the three things a small company prints and publishes most. */}
      <Section>
        <Statement
          lead="Nu îți arătăm logo-ul pe un fundal alb gol."
          rest="Îl vezi pe lucrurile pe care le vor vedea și clienții tăi."
          className="max-w-[44ch]"
        />
      </Section>
      <Section padded={false}>
        <ul className={cn(gridLinesClass, 'm-0 list-none p-0 *:py-(--space-8) md:grid-cols-3')}>
          {APPLIED.map(({ title, text, object }) => (
            <li key={title} className="flex flex-col">
              <div
                aria-hidden
                className={cn(
                  'flex h-[300px] overflow-hidden rounded-(--radius-4) bg-(--gray-2) px-4 shadow-[inset_0_0_0_1px_var(--gray-a4)]',
                  title === 'Pe site' ? 'items-start' : 'items-center',
                )}
              >
                <div className="w-full">{object}</div>
              </div>
              <Heading as="h3" size={TYPE.body} weight="medium" mt="5">
                {title}
              </Heading>
              <Text as="p" size={TYPE.body} color="gray" mt="1">
                {text}
              </Text>
            </li>
          ))}
        </ul>
      </Section>

      {/* How the work goes. */}
      <Section className="bg-sunken">
        <div className="grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <Statement
            lead="Două sau trei direcții, apoi una singură."
            rest="Nu zeci de variante din care să alegi la întâmplare."
          />
          <div className="flex flex-col gap-5">
            <Body>
              Pornim de la o discuție despre firmă: ce face, pentru cine și cum vrei să fie
              percepută. Îți prezentăm apoi câteva direcții, fiecare aplicată pe aceleași lucruri,
              ca să le poți compara pe ce contează.
            </Body>
            <Body>
              Pe cea aleasă o lucrăm până devine identitatea finală, apoi scriem ghidul și pregătim
              fișierele. Dacă îți facem și{' '}
              <InlineLink href="/servicii/site-uri-de-prezentare">site-ul</InlineLink>, identitatea
              ajunge direct pe el, fără să fie tradusă de altcineva.
            </Body>
          </div>
        </div>
      </Section>

      <FaqSection topic="identitatea vizuală" items={IDENTITY_FAQ} />

      <ClosingCta
        className="bg-sunken"
        lead="Ai nevoie de un logo sau de o identitate întreagă?"
        rest="Spune-ne ce face firma ta și îți trimitem o propunere în scris."
      />
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
