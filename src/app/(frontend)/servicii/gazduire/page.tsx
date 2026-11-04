import React from 'react'
import { Badge, DataList, Heading, Text } from '@radix-ui/themes'
import { ArrowRightLeft, Check, Circle, LoaderCircle, Server } from 'lucide-react'

import highlands from '@/assets/landscapes/highlands.webp'
import { gridLinesClass, Section } from '@/components/site/Frame'
import { HOSTING_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import { LandscapeCard } from '@/components/site/LandscapeCard'
import {
  Body,
  ClosingCta,
  FaqSection,
  InlineLink,
  Labelled,
  PageHero,
  PlainList,
  Statement,
  TintedWindow,
  Window,
} from '@/components/site/PageParts'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The hosting page. Its search target is "găzduire site firmă"
 * (docs/seo/keyword-map.md). Hosting and maintenance are close enough to
 * compete in search, so this page keeps to where the site lives and who owns
 * it, and sends everything about upkeep to the maintenance page.
 *
 * The middle of the page explains what happens when someone opens the site,
 * in four steps, because that is what hosting actually is and few owners
 * have seen it laid out.
 */

const PATH = '/servicii/gazduire'
const TITLE = 'Găzduire site pentru firme, administrată de noi'
const DESCRIPTION =
  'Găzduire pentru site-ul firmei, cu domeniul pe numele tău, certificat reînnoit automat și copii de siguranță în alt loc. Fără panou de control de învățat.'

/* The path of one visit, from the address bar to the page. */
const PATH_STEPS: { tag: string; name: string; text: string }[] = [
  {
    tag: 'firma-ta.ro',
    name: 'Domeniul',
    text: 'Adresa site-ului, înregistrată pe firma ta. O reînnoim înainte să expire, ca să nu o poată cumpăra altcineva.',
  },
  {
    tag: 'DNS',
    name: 'Legătura',
    text: 'Spune internetului unde e serverul. Tot aici se leagă și emailul firmei, așa că fiecare schimbare se face cu grijă.',
  },
  {
    tag: 'HTTPS',
    name: 'Certificatul',
    text: 'Lacătul din bara browserului. Se reînnoiește automat, ca nimeni să nu vadă avertismentul de site nesigur.',
  },
  {
    tag: 'server',
    name: 'Serverul',
    text: 'Calculatorul pe care rulează site-ul, configurat pentru el, ca pagina să se încarce repede și pe telefon.',
  },
]

type StepState = 'done' | 'now' | 'next'

const MOVE: [string, StepState][] = [
  ['Copiem site-ul și baza de date pe serverul nou', 'done'],
  ['Îl verificăm pe o adresă de test, pagină cu pagină', 'done'],
  ['Notăm înregistrările de care depinde emailul', 'done'],
  ['Mutăm domeniul spre serverul nou, într-o oră liniștită', 'now'],
  ['Păstrăm vechea găzduire până e sigur că totul merge', 'next'],
]

const IN_HOSTING = [
  'Serverul și configurarea lui',
  'Domeniul și certificatul',
  'Copii de siguranță ale serverului',
]
const IN_MAINTENANCE = [
  'Actualizările site-ului',
  'Supraveghere și intervenții',
  'Modificări mici de conținut',
  'Raport lunar',
]

/** The hero: the hosting record of one site, on the highlands. */
function HostingCard() {
  return (
    <LandscapeCard
      image={highlands}
      position="40% 50%"
      priority
      className="flex min-h-[400px] w-full items-center justify-center p-5 sm:p-10"
    >
      <Window icon={Server} title="Găzduire" note="firma-ta.ro" className="w-full max-w-[420px]">
        <DataList.Root size="2" className="gap-y-3! px-4 py-4">
          <DataList.Item>
            <DataList.Label minWidth="120px">Domeniu</DataList.Label>
            <DataList.Value>firma-ta.ro</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="120px">Titular</DataList.Label>
            <DataList.Value>Firma Ta SRL</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="120px">Certificat</DataList.Label>
            <DataList.Value>
              <Badge color="grass">valabil, se reînnoiește singur</Badge>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="120px">Copii</DataList.Label>
            <DataList.Value>zilnic, păstrate în alt loc</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="120px">Acces pentru tine</DataList.Label>
            <DataList.Value>server, domeniu, cod</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Window>
    </LandscapeCard>
  )
}

const STATE_ICON: Record<StepState, React.ReactNode> = {
  done: <Check size={12} strokeWidth={2.25} aria-hidden />,
  now: <LoaderCircle size={12} strokeWidth={2} aria-hidden />,
  next: <Circle size={8} strokeWidth={2} aria-hidden />,
}

const STATE_LABEL: Record<StepState, string> = { done: 'gata', now: 'acum', next: 'urmează' }

/** A move from another host, as a checklist half way through. */
function MoveChecklist() {
  return (
    <TintedWindow
      hue="violet"
      icon={ArrowRightLeft}
      title="Mutare firma-ta.ro"
      note="pasul 4 din 5"
    >
      <ol className="m-0 list-none divide-y divide-frame p-0">
        {MOVE.map(([step, state]) => (
          <li
            key={step}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm',
              state === 'now' && 'bg-(--accent-a2)',
            )}
          >
            <span
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-full',
                state === 'next'
                  ? 'text-(--gray-8) shadow-[inset_0_0_0_1px_var(--gray-a6)]'
                  : 'bg-(--accent-a3) text-(--accent-11)',
              )}
            >
              {STATE_ICON[state]}
            </span>
            <span
              className={cn('min-w-0 flex-1', state === 'next' ? 'text-subtle' : 'text-strong')}
            >
              {step}
            </span>
            <span className="hidden text-xs text-subtle sm:inline">{STATE_LABEL[state]}</span>
          </li>
        ))}
      </ol>
    </TintedWindow>
  )
}

export default function HostingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Găzduire site pentru firme',
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbSchema([{ name: 'Găzduire', path: PATH }]),
          faqSchema(HOSTING_FAQ),
        ]}
      />

      <PageHero
        title={
          <>
            Găzduire site pentru firme, cu domeniul pe numele <Highlight>firmei tale</Highlight>
          </>
        }
        text="Punem site-ul pe un server configurat pentru el și ne ocupăm de domeniu, de certificat și de copiile de siguranță. Accesul îl ai și tu, ca să nu depinzi de nimeni."
        visual={<HostingCard />}
      />

      {/* What hosting is, as the path of one visit. */}
      <Section className="bg-sunken">
        <Statement
          lead={
            <>
              Ce se întâmplă când cineva îți deschide{' '}
              <span className="whitespace-nowrap">site-ul</span>.
            </>
          }
          rest="Patru lucruri trebuie să meargă în mai puțin de o secundă, iar de toate răspundem noi."
          className="max-w-[44ch]"
        />
      </Section>
      <Section padded={false}>
        <ol
          className={cn(
            gridLinesClass,
            'm-0 list-none p-0 *:py-(--space-8) sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {PATH_STEPS.map(({ tag, name, text }) => (
            <li key={tag} className="flex flex-col gap-2">
              <span aria-hidden className="mb-4 flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-(--accent-9)" />
                <span className="font-mono text-xs text-subtle">{tag}</span>
                <span className="h-px flex-1 bg-(--gray-a6)" />
              </span>
              <Heading as="h3" size={TYPE.body} weight="medium">
                {name}
              </Heading>
              <Text as="p" size={TYPE.body} color="gray">
                {text}
              </Text>
            </li>
          ))}
        </ol>
      </Section>

      {/* Moving from another host, without downtime and without losing email. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Mutăm site-ul de la vechiul furnizor fără să se oprească."
              rest="Și fără să se piardă vreun email."
            />
            <Body>
              Cele mai multe probleme la o mutare nu vin de la site, ci de la domeniu: o setare
              schimbată în grabă și emailurile firmei nu mai ajung. De aceea notăm tot ce depinde de
              domeniu înainte să atingem ceva și facem schimbarea când site-ul are cei mai puțini
              vizitatori.
            </Body>
          </div>
          <MoveChecklist />
        </div>
      </Section>

      {/* Where hosting ends and maintenance begins. */}
      <Section className="bg-sunken">
        <div className="grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Găzduirea ține site-ul online. Mentenanța îl ține la zi."
              rest="Le poți lua separat, dar merg cel mai bine împreună."
            />
            <Body>
              Ce intră în mentenanță găsești pe{' '}
              <InlineLink href="/servicii/mentenanta">pagina de mentenanță</InlineLink>.
            </Body>
          </div>
          <div className="grid gap-10 sm:grid-cols-2">
            <Labelled label="În găzduire">
              <PlainList items={IN_HOSTING} />
            </Labelled>
            <Labelled label="În mentenanță">
              <PlainList items={IN_MAINTENANCE} muted />
            </Labelled>
          </div>
        </div>
      </Section>

      <FaqSection topic="găzduire" items={HOSTING_FAQ} />

      <ClosingCta
        className="bg-sunken"
        lead="Vrei să muți site-ul la noi?"
        rest="Trimite-ne adresa lui și îți spunem în scris ce presupune mutarea și cât costă găzduirea."
      />
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
