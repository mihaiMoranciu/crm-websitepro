import React from 'react'
import { Avatar, Badge, Heading, Text } from '@radix-ui/themes'
import {
  Cable,
  FileSpreadsheet,
  LayoutList,
  ListChecks,
  type LucideIcon,
  UsersRound,
} from 'lucide-react'

import { gridLinesClass, Section, TintCard } from '@/components/site/Frame'
import { APPS_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import {
  Body,
  ClosingCta,
  FaqSection,
  Grain,
  InlineLink,
  PageHero,
  Statement,
  TintedWindow,
  Window,
} from '@/components/site/PageParts'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The custom web applications page. Its search target is "aplicații web la
 * comandă" (docs/seo/keyword-map.md). The variants (cost, owning the code,
 * connecting existing software, upkeep) are the questions at the bottom.
 *
 * Most custom apps start as a spreadsheet passed around by email, so that is
 * the opening picture: the file everyone knows, and the app that replaces it.
 * The examples describe kinds of work, not named clients.
 */

const PATH = '/servicii/aplicatii-web'
const TITLE = 'Aplicații web la comandă pentru firme'
const DESCRIPTION =
  'CRM-uri, portaluri pentru clienți și instrumente interne construite pe procesele firmei tale, nu invers. Codul e al tău, iar aplicația crește în etape.'

const KINDS: { icon: LucideIcon; title: string; text: string; example: string }[] = [
  {
    icon: LayoutList,
    title: 'Evidențe interne și CRM',
    text: 'Clienți, comenzi, intervenții sau stocuri într-un singur loc, cu drepturi diferite pentru fiecare om din echipă.',
    example:
      'o firmă de service care vede fiecare intervenție cu tehnicianul, piesele folosite și factura.',
  },
  {
    icon: UsersRound,
    title: 'Portaluri pentru clienți',
    text: 'Locul în care clienții tăi văd comenzile, descarcă documente și trimit cereri, fără telefoane de verificare.',
    example:
      'un distribuitor ai cărui clienți văd stocul și prețurile lor și plasează singuri comanda.',
  },
  {
    icon: Cable,
    title: 'Automatizări și legături',
    text: 'Programele pe care le folosiți deja, legate între ele, ca datele să nu mai fie copiate dintr-un loc în altul.',
    example: 'comenzile din magazinul online trimise direct în programul de contabilitate.',
  },
]

const STAGES: { name: string; state: string; tone: 'grass' | 'iris' | 'gray' }[] = [
  { name: 'Comenzi și stări, pentru echipă', state: 'în folosință', tone: 'grass' },
  { name: 'Portal pentru clienți', state: 'în lucru', tone: 'iris' },
  { name: 'Legătura cu contabilitatea', state: 'urmează', tone: 'gray' },
]

const ORDERS: {
  client: string
  what: string
  who: string
  state: string
  tone: 'amber' | 'iris' | 'grass'
}[] = [
  { client: 'Hotel Sigma', what: '40 de scaune', who: 'AM', state: 'De aprobat', tone: 'amber' },
  { client: 'Școala nr. 7', what: 'Bănci, 2 săli', who: 'RI', state: 'În lucru', tone: 'iris' },
  { client: 'Cafe Doi', what: 'Mese terasă', who: 'AM', state: 'În lucru', tone: 'iris' },
  { client: 'Biroul Nova', what: 'Recepție', who: 'DC', state: 'Livrată', tone: 'grass' },
]

/* The spreadsheet behind the app: the cells people highlight to keep track. */
const SHEET: string[][] = [
  ['Client', 'Ce', 'Cine', 'Stare'],
  ['Hotel Sigma', '40 scaune', 'Andrei?', 'DE VERIFICAT'],
  ['Scoala 7', 'banci', 'Radu', 'lucru'],
  ['Cafe Doi', 'mese', '', 'vezi mail'],
  ['Nova', 'receptie', 'Dana', 'gata??'],
]
const FLAGGED = new Set(['1-3', '3-3', '4-3', '1-2'])

/**
 * The hero: the spreadsheet a process usually lives in, and in front of it
 * the app that takes its place, with a person and a state on every row.
 */
function SheetToApp() {
  return (
    <TintCard hue="cyan" className="w-full p-5 sm:p-10">
      <Grain />
      <div className="relative">
        {/* Behind: the file everyone has a different version of. */}
        <div
          aria-hidden
          className="w-[82%] overflow-hidden rounded-(--radius-3) bg-(--color-panel-solid) opacity-80 shadow-[inset_0_0_0_1px_var(--gray-a5)]"
        >
          <div className="flex items-center gap-2 border-b border-frame px-3 py-2">
            <FileSpreadsheet size={14} strokeWidth={1.5} className="text-(--grass-11)" />
            <span className="truncate text-xs text-subtle">comenzi_final_v3 (2).xlsx</span>
          </div>
          <div className="grid grid-cols-[1.3fr_1fr_0.8fr_1fr] text-[11px]">
            {SHEET.map((row, r) =>
              row.map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className={cn(
                    'truncate border-r border-b border-(--gray-a4) px-2 py-1 text-subtle',
                    r === 0 && 'bg-(--gray-a2) font-medium',
                    FLAGGED.has(`${r}-${c}`) && 'bg-(--amber-a4) text-(--amber-12)',
                  )}
                >
                  {cell || ' '}
                </span>
              )),
            )}
          </div>
        </div>

        {/* In front: the same work, as an app. */}
        <Window
          icon={ListChecks}
          title="Comenzi"
          note="24 deschise"
          className="relative -mt-10 ml-auto w-[92%]"
        >
          <div className="flex gap-2 border-b border-frame px-4 py-2.5">
            <Badge color="gray" variant="soft">
              Toate
            </Badge>
            <Badge color="amber" variant="soft">
              De aprobat 3
            </Badge>
            <Badge color="iris" variant="soft" className="hidden sm:inline-flex">
              În lucru 8
            </Badge>
          </div>
          <ul className="m-0 list-none divide-y divide-frame p-0">
            {ORDERS.map((order) => (
              <li key={order.client} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-strong">{order.client}</span>
                  <span className="block truncate text-xs text-subtle">{order.what}</span>
                </span>
                <Avatar size="1" radius="full" fallback={order.who} color="gray" />
                <Badge color={order.tone} className="w-[84px] justify-center">
                  {order.state}
                </Badge>
              </li>
            ))}
          </ul>
        </Window>
      </div>
    </TintCard>
  )
}

/** The plan of a growing app: what is in use, what is being built, what comes next. */
function StagedPlan() {
  return (
    <TintedWindow hue="lime" icon={ListChecks} title="Plan pe etape" note="aplicație comenzi">
      <ol className="m-0 list-none divide-y divide-frame p-0">
        {STAGES.map((stage, i) => (
          <li key={stage.name} className="flex items-center gap-4 px-4 py-3.5">
            <span className="w-14 shrink-0 text-sm text-subtle">Etapa {i + 1}</span>
            <span className="min-w-0 flex-1 text-sm text-strong">{stage.name}</span>
            <Badge color={stage.tone} variant={stage.tone === 'gray' ? 'outline' : 'soft'}>
              {stage.state}
            </Badge>
          </li>
        ))}
      </ol>
      <p className="m-0 border-t border-frame px-4 py-3 text-xs text-subtle">
        Fiecare etapă are prețul și termenul ei, scrise înainte să înceapă.
      </p>
    </TintedWindow>
  )
}

export default function WebAppsPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({ name: 'Aplicații web la comandă', description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([{ name: 'Aplicații web', path: PATH }]),
          faqSchema(APPS_FAQ),
        ]}
      />

      <PageHero
        title={
          <>
            Aplicații web la comandă, construite pe <Highlight>procesele</Highlight> firmei tale
          </>
        }
        text="Construim CRM-uri, portaluri pentru clienți și instrumente interne care înlocuiesc tabelele trimise pe email și pașii pe care cineva îi face de mână în fiecare zi."
        visual={<SheetToApp />}
      />

      {/* The three kinds of app, each with an example of the problem it removes. */}
      <Section className="bg-sunken">
        <Statement
          lead="Trei feluri de aplicații pe care le construim des."
          rest="Toate pornesc de la un tabel, un email sau un pas pe care cineva îl repetă zilnic."
          className="max-w-[44ch]"
        />
      </Section>
      <Section padded={false}>
        <ul className={cn(gridLinesClass, 'm-0 list-none p-0 *:py-(--space-8) md:grid-cols-3')}>
          {KINDS.map(({ icon: Icon, title, text, example }) => (
            <li key={title} className="flex flex-col gap-2">
              <Icon size={24} strokeWidth={1.25} aria-hidden className="mb-4 text-(--accent-11)" />
              <Heading as="h3" size={TYPE.body} weight="medium">
                {title}
              </Heading>
              <Text as="p" size={TYPE.body} color="gray">
                {text}
              </Text>
              <Text
                as="p"
                size={TYPE.meta}
                color="gray"
                mt="4"
                className="border-l-2 border-(--accent-a6) pl-3"
              >
                De exemplu, {example}
              </Text>
            </li>
          ))}
        </ul>
      </Section>

      {/* How the work is cut up: small stages, each one used before the next. */}
      <Section className="bg-sunken">
        <div className="grid items-center gap-12 lg:grid-cols-[6fr_5fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Începem cu cea mai mică versiune care vă ajută."
              rest="O aplicație mare, livrată după un an, rezolvă problemele de acum un an."
            />
            <Body>
              Alegem împreună partea care vă consumă cel mai mult timp și o construim prima. O
              folosiți, vedem ce lipsește, apoi trecem la următoarea. Așa, fiecare etapă pornește de
              la cum se lucrează de fapt, nu de la cum ne-am imaginat la început.
            </Body>
          </div>
          <StagedPlan />
        </div>
      </Section>

      {/* Three plain facts that decide whether a custom app is a safe bet. */}
      <Section padded={false}>
        <div className={cn(gridLinesClass, 'grid-cols-1 *:py-(--section-gap) md:grid-cols-3')}>
          <div className="flex flex-col gap-4">
            <Statement as="h2" lead="Un exemplu pe care îl poți vedea." />
            <Body>
              <InlineLink href="/produse/crm">CRM-ul și programul de facturare</InlineLink> pe care
              le oferim sunt o aplicație construită de noi: clienți, proiecte, pontaj, facturi și
              e-Factura, legate între ele.
            </Body>
          </div>
          <div className="flex flex-col gap-4">
            <Statement as="h2" lead="Codul e al vostru." />
            <Body>
              Primiți codul întreg, documentația și accesul la server. Folosim tehnologii stabile și
              răspândite, ca orice alt programator să poată continua.
            </Body>
          </div>
          <div className="flex flex-col gap-4">
            <Statement as="h2" lead="Rămânem după lansare." />
            <Body>
              Actualizări, copii de siguranță și cineva care răspunde când ceva nu merge, prin{' '}
              <InlineLink href="/servicii/mentenanta">mentenanța lunară</InlineLink>.
            </Body>
          </div>
        </div>
      </Section>

      <FaqSection topic="aplicațiile web" items={APPS_FAQ} className="bg-sunken" />

      <ClosingCta
        lead="Ai un proces care îți ia prea mult timp?"
        rest="Descrie-ni-l pe scurt și îți spunem cum ar arăta prima etapă."
      />
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
