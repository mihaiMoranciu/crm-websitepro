import React from 'react'
import { Badge, Heading, Text } from '@radix-ui/themes'
import {
  Building2,
  CalendarSync,
  FileCheck2,
  FolderKanban,
  type LucideIcon,
  ReceiptText,
  RefreshCw,
  Timer,
  Wallet,
} from 'lucide-react'

import { gridLinesClass, Section } from '@/components/site/Frame'
import { CRM_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import {
  Body,
  ClosingCta,
  FaqSection,
  Labelled,
  PageHero,
  PlainList,
  Statement,
  TintedWindow,
} from '@/components/site/PageParts'
import { UnbilledHours } from '@/components/site/UnbilledHours'
import { TYPE } from '@/design/type'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The CRM and invoicing product page. Its search target is "program
 * facturare e-Factura", written towards "CRM cu facturare", where the
 * product differs from the big invoicing apps (docs/seo/keyword-map.md).
 *
 * Everything the page claims is something the app in this repository does:
 * CUI validation and autofill from the client record, fixed, hourly and
 * subscription projects, billable hours turned into invoice lines, proformas,
 * storno, RON/EUR/USD with the BNR rate, payments that set the invoice state,
 * subscription drafts, and e-Factura sent to and read back from the SPV.
 * Keep it that way when the app changes. The figures are sample data, and
 * clients go by their kind of business, never by a made-up name.
 */

const PATH = '/produse/crm'
const TITLE = 'Program de facturare cu e-Factura și CRM'
const DESCRIPTION =
  'Facturi, încasări, abonamente și trimitere în SPV, legate de clienți, proiecte și orele lucrate. O singură aplicație pentru firma ta.'

type Tone = 'gray' | 'amber' | 'iris' | 'grass' | 'red'

const INVOICES: [string, string, string, string, Tone][] = [
  ['WP-0145', 'Atelier de tâmplărie', '3.388,00', 'Ciornă', 'gray'],
  ['WP-0144', 'Agenție de turism', '1.450,00', 'Parțial', 'amber'],
  ['WP-0143', 'Brutărie', '4.200,00', 'În SPV', 'iris'],
  ['WP-0142', 'Clinică stomatologică', '6.830,00', 'Plătită', 'grass'],
  ['WP-0141', 'Firmă de construcții', '2.100,00', 'Restantă', 'red'],
]

const MODULES: { icon: LucideIcon; name: string; text: string }[] = [
  {
    icon: Building2,
    name: 'Clienți',
    text: 'CUI verificat la introducere, regim fiscal, monedă și termen de plată, completate apoi singure pe fiecare factură.',
  },
  {
    icon: FolderKanban,
    name: 'Proiecte',
    text: 'Cu preț fix, plătite pe oră sau pe abonament. La cele cu preț fix vezi cât s-a facturat și cât a rămas.',
  },
  {
    icon: Timer,
    name: 'Pontaj',
    text: 'Orele lucrate, pe proiect și pe task. Cele facturabile ajung pe factură fără să fie copiate.',
  },
  {
    icon: ReceiptText,
    name: 'Facturi',
    text: 'Fiscale, proforme și storno, în lei, euro sau dolari, cu cursul BNR. Taxarea inversă vine din fișa clientului.',
  },
  {
    icon: Wallet,
    name: 'Încasări',
    text: 'Plăți întregi sau parțiale. Starea facturii se calculează din ce s-a încasat, nu se bifează de mână.',
  },
  {
    icon: CalendarSync,
    name: 'Abonamente',
    text: 'La ziua stabilită, factura fiecărei perioade e pregătită ca ciornă. Tu doar o verifici și o emiți.',
  },
]

const SPV_LOG: [string, string, React.ReactNode][] = [
  [
    '10:02',
    'Fișier XML generat',
    <span key="f" className="font-mono text-xs">
      UBL 2.1, CIUS-RO
    </span>,
  ],
  [
    '10:02',
    'Încărcat în SPV',
    <span key="i" className="font-mono text-xs">
      index 5004183271
    </span>,
  ],
  ['10:04', 'În prelucrare la ANAF', null],
  [
    '10:31',
    'Răspuns primit',
    <Badge key="a" color="grass">
      Acceptată
    </Badge>,
  ],
]

const SPV_STEPS = [
  'Creează fișierul XML în formatul cerut de ANAF',
  'Îl trimite în SPV cu certificatul firmei',
  'Citește răspunsul și îl trece pe factură',
  'La o respingere, arată motivul primit',
]

/** The hero: this month's invoices, and what is still to be collected. */
function InvoiceList() {
  return (
    <TintedWindow hue="iris" icon={ReceiptText} title="Facturi" note="noiembrie">
      <div className="grid grid-cols-2 border-b border-frame">
        <div className="border-r border-frame px-4 py-3">
          <span className="block text-xs text-subtle">De încasat</span>
          <span className="block text-lg font-medium text-strong tabular-nums">7.025,00 lei</span>
        </div>
        <div className="px-4 py-3">
          <span className="block text-xs text-subtle">Din care restante</span>
          <span className="block text-lg font-medium text-(--red-11) tabular-nums">
            2.100,00 lei
          </span>
        </div>
      </div>
      <ul className="m-0 list-none divide-y divide-frame p-0">
        {INVOICES.map(([number, client, amount, state, tone]) => (
          <li key={number} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="hidden text-xs text-subtle tabular-nums sm:inline">{number}</span>
            <span className="min-w-0 flex-1 truncate text-strong">{client}</span>
            <span className="text-strong tabular-nums">{amount}</span>
            <Badge color={tone} className="w-[72px] justify-center">
              {state}
            </Badge>
          </li>
        ))}
      </ul>
    </TintedWindow>
  )
}

/** One invoice's trip through the SPV, as it is recorded on the invoice. */
function SpvLog() {
  return (
    <TintedWindow hue="grass" icon={FileCheck2} title="Factura WP-0143" note="e-Factura">
      <ol className="m-0 list-none divide-y divide-frame p-0">
        {SPV_LOG.map(([time, what, detail]) => (
          <li key={what} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
            <span className="w-11 shrink-0 text-xs text-subtle tabular-nums">{time}</span>
            <span className="text-strong">{what}</span>
            {detail ? <span className="ml-auto text-subtle">{detail}</span> : null}
          </li>
        ))}
      </ol>
      <p className="m-0 flex items-center gap-2 border-t border-frame px-4 py-3 text-xs text-subtle">
        <RefreshCw size={12} strokeWidth={1.75} aria-hidden />
        Starea o verifici dintr-un buton, direct pe factură.
      </p>
    </TintedWindow>
  )
}

export default function CrmPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: 'Program de facturare cu e-Factura și CRM',
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbSchema([{ name: 'CRM și facturare', path: PATH }]),
          faqSchema(CRM_FAQ),
        ]}
      />

      <PageHero
        columns="lg:grid-cols-[3fr_2fr]"
        title={
          <>
            Program de facturare cu e-Factura, legat de clienți, proiecte și{' '}
            <Highlight>ore</Highlight>
          </>
        }
        text="Emiți facturi, urmărești încasările și trimiți totul în SPV dintr-o aplicație care știe pentru ce client, proiect și oră lucrată e fiecare factură."
        visual={<InvoiceList />}
      />

      {/* The six parts of the app, each one feeding the next. */}
      <Section className="bg-sunken">
        <Statement
          lead="Tot ce se întâmplă între ofertă și banii încasați."
          rest="Șase părți care se completează una pe alta, nu șase programe."
          className="max-w-[44ch]"
        />
      </Section>
      <Section padded={false}>
        <ul
          className={cn(
            gridLinesClass,
            'm-0 list-none p-0 *:py-(--space-8) sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {MODULES.map(({ icon: Icon, name, text }) => (
            <li key={name} className="flex flex-col gap-2">
              <Icon size={24} strokeWidth={1.25} aria-hidden className="mb-4 text-(--accent-11)" />
              <Heading as="h3" size={TYPE.body} weight="medium">
                {name}
              </Heading>
              <Text as="p" size={TYPE.body} color="gray" className="max-w-[44ch]">
                {text}
              </Text>
            </li>
          ))}
        </ul>
      </Section>

      {/* Where it differs from an invoicing app: the invoice starts from the work. */}
      <Section className="bg-sunken">
        <div className="grid items-center gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Un program de facturare vede doar facturile."
              rest="Aici factura pornește de la orele lucrate, așa că vezi și ce nu ai facturat încă."
            />
            <Body>
              Când faci o factură pentru un proiect, aplicația îți arată orele nefacturate. Le alegi
              pe cele care intră, iar linia de factură se scrie singură, cu tariful proiectului. O
              oră facturată nu mai apare a doua oară.
            </Body>
          </div>
          <TintedWindow hue="violet" icon={Timer} title="Ore nefacturate" note="aplicație comenzi">
            <UnbilledHours />
          </TintedWindow>
        </div>
      </Section>

      {/* e-Factura, mirrored: the log on the left, the words on the right. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[7fr_4fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            <SpvLog />
          </div>
          <div className="order-1 flex flex-col gap-10 lg:order-2">
            <Statement
              lead="e-Factura fără să intri zilnic în SPV."
              rest="Factura pleacă din aplicație, iar răspunsul ANAF se întoarce pe factură."
            />
            <Labelled label="Ce face aplicația">
              <PlainList items={SPV_STEPS} />
            </Labelled>
            <Text as="p" size={TYPE.meta} color="gray" className="max-w-[48ch]">
              Pentru SPV e nevoie de un certificat digital calificat, pe care firma îl are de obicei
              deja pentru declarații. Legătura o facem împreună, o singură dată.
            </Text>
          </div>
        </div>
      </Section>

      <FaqSection topic="CRM și facturare" items={CRM_FAQ} className="bg-sunken" />

      <ClosingCta
        lead="Vrei să vezi aplicația?"
        rest="Scrie-ne cum facturezi acum și îți arătăm cum ar arăta același lucru în ea."
      />
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
