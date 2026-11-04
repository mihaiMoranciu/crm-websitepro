import React from 'react'
import { Badge, Table } from '@radix-ui/themes'
import { CreditCard, FileCheck2, ShoppingBag, TicketPercent, Truck } from 'lucide-react'

import { Section } from '@/components/site/Frame'
import { SHOPS_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import {
  Bento,
  BentoCell,
  bentoPanel,
  CenteredHero,
  ClosingCta,
  FaqSection,
  FeatureCards,
  Labelled,
  PlainList,
  SplitHeader,
  Statement,
} from '@/components/site/PageParts'
import { Jar, ShopShowcase } from '@/components/site/ShopShowcase'
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
 * customer pays. So under the title sits the shop itself, one order played
 * through in three steps, then what it connects to, then the owner's side as
 * a bento of the screens they use. "Cămara de la deal" is a made-up shop.
 */

const PATH = '/servicii/magazine-online'
const TITLE = 'Creare magazin online, cu plăți și facturare'
const DESCRIPTION =
  'Magazin online cu plăți, livrare și facturare legate între ele, ca să nu mai copiezi comenzi de mână. Vezi ce include, cum lucrăm și cum se stabilește prețul.'

const CONNECTIONS = [
  {
    icon: CreditCard,
    title: 'Plăți',
    text: 'Card, ramburs sau transfer bancar. Când banii sunt confirmați de procesatorul de plăți, comanda își schimbă singură starea.',
  },
  {
    icon: FileCheck2,
    title: 'e-Factura',
    text: 'Factura se emite la plată, cu seria firmei tale, și pleacă în SPV. Dacă ai deja un program de facturare, comanda ajunge acolo.',
  },
  {
    icon: Truck,
    title: 'Curier',
    text: 'AWB-ul se generează din comandă, cu adresa și greutatea completate, iar numărul lui ajunge la client pe email.',
  },
]

type Tone = 'grass' | 'amber' | 'gray' | 'red'

const ORDERS: { id: string; client: string; total: string; cells: [string, Tone][] }[] = [
  {
    id: '#1048',
    client: 'Ana Pop',
    total: '97,00',
    cells: [
      ['Plătită', 'grass'],
      ['În SPV', 'grass'],
      ['AWB generat', 'grass'],
    ],
  },
  {
    id: '#1047',
    client: 'Radu Ionescu',
    total: '154,00',
    cells: [
      ['Ramburs', 'gray'],
      ['În SPV', 'grass'],
      ['La curier', 'grass'],
    ],
  },
  {
    id: '#1046',
    client: 'Ioana Marin',
    total: '63,00',
    cells: [
      ['Eșuată', 'red'],
      ['Neemisă', 'gray'],
      ['În așteptare', 'amber'],
    ],
  },
  {
    id: '#1045',
    client: 'Mihai Stan',
    total: '212,00',
    cells: [
      ['Plătită', 'grass'],
      ['În SPV', 'grass'],
      ['Livrată', 'gray'],
    ],
  },
]

const STOCK: { name: string; left: number; of: number; tone: string; note?: [string, Tone] }[] = [
  { name: 'Miere de salcâm', left: 24, of: 30, tone: 'var(--grass-9)' },
  { name: 'Zacuscă', left: 3, of: 30, tone: 'var(--amber-9)', note: ['pe terminate', 'amber'] },
  { name: 'Sirop de soc', left: 0, of: 30, tone: 'var(--red-9)', note: ['epuizat', 'red'] },
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

/** The orders table, cropped by the bottom of its cell. */
function OrdersMock() {
  return (
    <div className={cn(bentoPanel, 'absolute top-0 right-0 left-6 overflow-hidden rounded-r-none')}>
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Comanda</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="hidden sm:table-cell">Client</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">Lei</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Plată</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="hidden md:table-cell">
              Factură
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="hidden sm:table-cell">
              Livrare
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ORDERS.map(({ id, client, total, cells: [pay, invoice, delivery] }) => (
            <Table.Row key={id}>
              <Table.RowHeaderCell className="tabular-nums">{id}</Table.RowHeaderCell>
              <Table.Cell className="hidden sm:table-cell">{client}</Table.Cell>
              <Table.Cell justify="end" className="tabular-nums">
                {total}
              </Table.Cell>
              <Table.Cell>
                <Badge color={pay[1]}>{pay[0]}</Badge>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <Badge color={invoice[1]}>{invoice[0]}</Badge>
              </Table.Cell>
              <Table.Cell className="hidden sm:table-cell">
                <Badge color={delivery[1]}>{delivery[0]}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

function StockMock() {
  return (
    <div className={cn(bentoPanel, 'absolute inset-x-6 top-0 flex flex-col gap-4 p-4')}>
      {STOCK.map(({ name, left, of, tone, note }) => (
        <div key={name} className="text-xs">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-strong">{name}</span>
            {note ? (
              <Badge size="1" color={note[1]} className="ml-auto">
                {note[0]}
              </Badge>
            ) : null}
            <span className={cn('font-mono text-subtle tabular-nums', !note && 'ml-auto')}>
              {left} buc.
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-(--gray-a3)">
            <div
              className="h-full rounded-full"
              style={{ width: `${(left / of) * 100}%`, background: tone }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DiscountMock() {
  const rows: [string, string, boolean?][] = [
    ['Subtotal', '82,00'],
    ['TOAMNA10', '-8,20', true],
    ['Livrare', '15,00'],
  ]
  return (
    <div className={cn(bentoPanel, 'absolute inset-x-6 top-0 p-4 text-xs')}>
      <div className="flex items-center gap-2 rounded-(--radius-2) px-3 py-2 shadow-[inset_0_0_0_1px_var(--gray-a6)]">
        <TicketPercent size={14} strokeWidth={1.5} className="text-subtle" />
        <span className="font-mono text-strong">TOAMNA10</span>
        <Badge size="1" color="grass" className="ml-auto">
          aplicat
        </Badge>
      </div>
      <dl className="m-0 mt-3 flex flex-col gap-1.5">
        {rows.map(([label, sum, off]) => (
          <div key={label} className="flex justify-between">
            <dt className={off ? 'font-mono text-(--grass-11)' : 'text-subtle'}>{label}</dt>
            <dd className={cn('m-0 tabular-nums', off ? 'text-(--grass-11)' : 'text-strong')}>
              {sum}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-frame pt-2 text-sm font-medium text-strong">
          <dt>Total</dt>
          <dd className="m-0 tabular-nums">88,80 lei</dd>
        </div>
      </dl>
    </div>
  )
}

function ProductFormMock() {
  const field = 'rounded-(--radius-2) px-3 py-2 text-strong shadow-[inset_0_0_0_1px_var(--gray-a6)]'
  return (
    <div
      className={cn(
        bentoPanel,
        'absolute top-0 right-0 left-6 grid grid-cols-[7rem_1fr] gap-4 rounded-r-none p-4 text-xs sm:grid-cols-[9rem_1fr]',
      )}
    >
      <div className="grid aspect-square place-items-center rounded-(--radius-3) bg-(--gray-a2) shadow-[inset_0_0_0_1px_var(--gray-a4)]">
        <Jar tone="var(--amber-8)" />
      </div>
      <div className="flex min-w-0 flex-col gap-2.5">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-strong">Produs</span>
          <span className="flex items-center gap-2 text-subtle">
            Publicat
            <span className="flex h-4 w-7 items-center rounded-full bg-(--accent-9) p-0.5">
              <span className="ml-auto size-3 rounded-full bg-white" />
            </span>
          </span>
        </span>
        <span className={field}>Miere de salcâm</span>
        <span className="grid grid-cols-2 gap-2.5">
          <span className={field}>32,00 lei</span>
          <span className={field}>24 buc.</span>
        </span>
        <span className="flex flex-wrap gap-1.5">
          {['250 g', '500 g', '1 kg'].map((v, i) => (
            <span
              key={v}
              className={cn(
                'rounded-full px-2.5 py-0.5',
                i === 1
                  ? 'bg-(--gray-12) text-(--gray-1)'
                  : 'text-subtle shadow-[inset_0_0_0_1px_var(--gray-a6)]',
              )}
            >
              {v}
            </span>
          ))}
        </span>
      </div>
    </div>
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

      <CenteredHero
        badge="Magazine online"
        icon={ShoppingBag}
        title={
          <>
            Creare magazin online în care comenzile nu se mai copiază de <Highlight>mână</Highlight>
          </>
        }
        text="Construim magazinul și îl legăm de plăți, de curier și de facturare. O comandă plătită ajunge singură la factură, în SPV și la AWB."
        secondary={{ label: 'Vezi cum funcționează', href: '#cum-functioneaza' }}
      />

      {/* The shop itself, one order played through. */}
      <Section id="cum-functioneaza" className="scroll-mt-(--header-height)">
        <SplitHeader
          label="Cum funcționează"
          title="O comandă, de la coș până la curier"
          text="Clientul vede un magazin simplu și rapid. În spate, plata, factura și livrarea se leagă între ele, în ordinea în care trebuie."
        />
        <ShopShowcase />
      </Section>

      <FeatureCards title="Legat de ce folosești deja" items={CONNECTIONS} className="bg-sunken" />

      {/* The owner's side, as the screens they use. */}
      <Section>
        <SplitHeader
          label="Administrare"
          title="Tu te ocupi de produse și de clienți"
          text="Totul se face dintr-un panou de administrare în română. Când ceva nu merge, o plată eșuată sau un produs fără stoc, vezi direct în comandă ce s-a întâmplat."
        />
        <Bento>
          <BentoCell
            className="lg:col-span-2"
            title="Comenzi într-un singur tabel"
            text="Ce s-a plătit, ce s-a facturat și ce a plecat la curier, fără să deschizi trei programe."
          >
            <OrdersMock />
          </BentoCell>
          <BentoCell
            title="Stocul se scade singur"
            text="Un produs epuizat nu mai poate fi comandat, iar cel pe terminate îl vezi din timp."
          >
            <StockMock />
          </BentoCell>
          <BentoCell
            title="Coduri de reducere"
            text="Le creezi tu, cu procent sau sumă fixă, și le oprești când vrei."
          >
            <DiscountMock />
          </BentoCell>
          <BentoCell
            className="lg:col-span-2"
            title="Produsele le adaugi tu"
            text="Nume, poze, prețuri și variante. Dacă ai multe produse, le importăm dintr-un fișier Excel."
          >
            <ProductFormMock />
          </BentoCell>
        </Bento>
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
