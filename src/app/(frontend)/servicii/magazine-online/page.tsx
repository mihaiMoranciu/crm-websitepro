import React from 'react'
import { Badge, Heading, Table, Text } from '@radix-ui/themes'
import { Check, ShoppingBag } from 'lucide-react'

import mistyForest from '@/assets/landscapes/misty-forest.webp'
import { gridLinesClass, Section } from '@/components/site/Frame'
import { SHOPS_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import { LandscapeCard } from '@/components/site/LandscapeCard'
import {
  Body,
  ClosingCta,
  FaqSection,
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
 * The online shop service page. Its search target is "creare magazin online"
 * (docs/seo/keyword-map.md): in the title, the H1, the first paragraph and one
 * subheading. The variants (price, payments, e-Factura, courier) are the
 * questions at the bottom.
 *
 * The page argues one thing: a shop is the work that happens after the
 * customer pays. So the pictures are that work, one order followed from the
 * payment to the courier, and the orders table the owner reads every day.
 * "Cămara de la deal" is a made-up shop, the local producer the home page shows.
 */

const PATH = '/servicii/magazine-online'
const TITLE = 'Creare magazin online, cu plăți și facturare'
const DESCRIPTION =
  'Magazin online cu plăți, livrare și facturare legate între ele, ca să nu mai copiezi comenzi de mână. Vezi ce include, cum lucrăm și cum se stabilește prețul.'

/* One order, from the moment it is paid, as the shop records it. */
const ORDER_EVENTS: [string, string, string][] = [
  ['10:42', 'Plată acceptată', 'card, 97,00 lei'],
  ['10:42', 'Factură emisă', 'seria CDD, nr. 0318'],
  ['10:43', 'Trimisă în SPV', 'ca e-Factura'],
  ['10:43', 'AWB generat', 'ridicare mâine dimineață'],
  ['10:43', 'Email către client', 'factura și numărul AWB'],
]

/* Where each part of the shop connects, and what happens there without anyone typing. */
const LINKS: { system: string; name: string; text: string }[] = [
  {
    system: 'procesator de plăți',
    name: 'Plăți',
    text: 'Card, ramburs sau transfer bancar. Când banii sunt confirmați, comanda își schimbă singură starea.',
  },
  {
    system: 'ANAF',
    name: 'Facturare',
    text: 'Factura se emite la plată, cu seria firmei tale, și pleacă în SPV ca e-Factura.',
  },
  {
    system: 'curier',
    name: 'Livrare',
    text: 'AWB-ul se generează din comandă, cu adresa și greutatea deja completate.',
  },
  {
    system: 'catalog',
    name: 'Stoc',
    text: 'Ce se vinde scade din stoc, iar un produs epuizat nu mai poate fi comandat.',
  },
]

type Tone = 'grass' | 'amber' | 'gray' | 'red'

const ORDERS: {
  id: string
  client: string
  total: string
  payment: [string, Tone]
  invoice: [string, Tone]
  delivery: [string, Tone]
}[] = [
  {
    id: '#1048',
    client: 'Ana Pop',
    total: '97,00',
    payment: ['Plătită', 'grass'],
    invoice: ['În SPV', 'grass'],
    delivery: ['AWB generat', 'grass'],
  },
  {
    id: '#1047',
    client: 'Radu Ionescu',
    total: '154,00',
    payment: ['Ramburs', 'gray'],
    invoice: ['În SPV', 'grass'],
    delivery: ['La curier', 'grass'],
  },
  {
    id: '#1046',
    client: 'Ioana Marin',
    total: '63,00',
    payment: ['Eșuată', 'red'],
    invoice: ['Neemisă', 'gray'],
    delivery: ['În așteptare', 'amber'],
  },
  {
    id: '#1045',
    client: 'Mihai Stan',
    total: '212,00',
    payment: ['Plătită', 'grass'],
    invoice: ['În SPV', 'grass'],
    delivery: ['Livrată', 'gray'],
  },
]

const PLATFORM_ENOUGH = [
  'Vinzi câteva zeci de produse',
  'Nu ai nevoie de legături cu alte programe',
  'Vrei să începi repede și să vezi dacă se vinde',
]
const CUSTOM_WORTH = [
  'Ai mii de produse sau prețuri diferite pe clienți',
  'Comenzile trebuie să ajungă în programul de gestiune',
  'Plătești lunar extensii care nu se înțeleg între ele',
]

/** The hero: one order followed from the payment to the email the customer gets. */
function OrderTimeline() {
  return (
    <LandscapeCard
      image={mistyForest}
      position="50% 45%"
      priority
      className="flex min-h-[420px] w-full items-center justify-center p-5 sm:p-10"
    >
      <Window
        icon={ShoppingBag}
        title="Comanda #1048"
        note="camara-de-la-deal.ro"
        className="w-full max-w-[440px]"
      >
        <div className="flex items-baseline justify-between gap-3 border-b border-frame px-4 py-3 text-sm">
          <span className="text-strong">2 × Miere, 1 × Zacuscă, livrare</span>
          <span className="whitespace-nowrap text-subtle tabular-nums">97,00 lei</span>
        </div>
        <ol className="m-0 list-none px-4 py-4">
          {ORDER_EVENTS.map(([time, what, detail], i) => (
            <li key={what} className="relative flex gap-3 pb-4 last:pb-0">
              {i < ORDER_EVENTS.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-6 bottom-0 left-[9.5px] w-px bg-(--gray-a5)"
                />
              ) : null}
              <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-(--accent-a3) text-(--accent-11)">
                <Check size={12} strokeWidth={2.25} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug">
                <span className="block text-strong">{what}</span>
                <span className="block text-subtle">{detail}</span>
              </span>
              <span className="text-xs text-subtle tabular-nums">{time}</span>
            </li>
          ))}
        </ol>
      </Window>
    </LandscapeCard>
  )
}

/** The orders as the owner reads them: what was paid, invoiced and shipped. */
function OrdersTable() {
  return (
    <TintedWindow hue="violet" title="Comenzi" note="azi">
      <Table.Root size="1" className="[&_td]:align-middle">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Comanda</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="hidden sm:table-cell">Client</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">Lei</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Plată</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="hidden md:table-cell">
              Factură
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Livrare</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ORDERS.map((order) => (
            <Table.Row key={order.id}>
              <Table.RowHeaderCell className="tabular-nums">{order.id}</Table.RowHeaderCell>
              <Table.Cell className="hidden sm:table-cell">{order.client}</Table.Cell>
              <Table.Cell justify="end" className="tabular-nums">
                {order.total}
              </Table.Cell>
              <Table.Cell>
                <Badge color={order.payment[1]}>{order.payment[0]}</Badge>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <Badge color={order.invoice[1]}>{order.invoice[0]}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge color={order.delivery[1]}>{order.delivery[0]}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </TintedWindow>
  )
}

export default function OnlineShopsPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({ name: 'Creare magazin online', description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([{ name: 'Magazine online', path: PATH }]),
          faqSchema(SHOPS_FAQ),
        ]}
      />

      <PageHero
        columns="lg:grid-cols-[3fr_2fr]"
        title={
          <>
            Creare magazin online în care comenzile nu se mai copiază de <Highlight>mână</Highlight>
          </>
        }
        text="Construim magazinul și îl legăm de plăți, de curier și de facturare. O comandă plătită ajunge singură la factură, în SPV și la AWB."
        visual={<OrderTimeline />}
      />

      {/* What the shop is connected to, one cell per connection. */}
      <Section className="bg-sunken">
        <Statement
          lead="Un magazin online bun se vede după ce clientul apasă Plătește."
          rest="Catalogul e jumătate din muncă. Cealaltă jumătate e drumul comenzii până la client."
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
          {LINKS.map(({ system, name, text }) => (
            <li key={name} className="flex flex-col gap-2">
              <span className="mb-4 font-mono text-xs text-subtle">{system}</span>
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

      {/* The owner's side: the orders table, and what is left to do by hand. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Tu te ocupi de produse și de clienți."
              rest="Restul se vede într-un singur tabel: ce s-a plătit, ce s-a facturat și ce a plecat la curier."
            />
            <Body>
              Adaugi produse, schimbi prețuri și pui reduceri dintr-un panou de administrare în
              română. Când ceva nu merge, o plată eșuată sau un produs fără stoc, vezi direct în
              comandă ce s-a întâmplat.
            </Body>
          </div>
          <OrdersTable />
        </div>
      </Section>

      {/* An honest answer to "platform or custom", before anyone asks. */}
      <Section className="bg-sunken">
        <div className="grid gap-12 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <Statement
            lead="Dacă o platformă îți ajunge, îți spunem."
            rest="Nu orice magazin trebuie construit de la zero, iar diferența se vede din câteva întrebări."
          />
          <div className="grid gap-10 sm:grid-cols-2">
            <Labelled label="Îți ajunge o platformă dacă">
              <PlainList items={PLATFORM_ENOUGH} muted />
            </Labelled>
            <Labelled label="Merită un magazin la comandă dacă">
              <PlainList items={CUSTOM_WORTH} />
            </Labelled>
          </div>
        </div>
      </Section>

      <FaqSection topic="magazinele online" items={SHOPS_FAQ} />

      <ClosingCta
        className="bg-sunken"
        lead="Vrei să vinzi online fără să copiezi comenzi?"
        rest="Spune-ne ce vinzi și cum lucrezi acum, și îți trimitem o propunere în scris."
      />
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
