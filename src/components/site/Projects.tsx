'use client'

import React from 'react'
import { Badge, Heading, Text } from '@radix-ui/themes'
import { motion, useReducedMotion } from 'motion/react'

import { TYPE } from '@/design/type'
import { cn } from '@/utilities/ui'

import { TintCard } from './Frame'
import { ClientSite } from './SiteChecks'

/*
 * TODO before launch: "Profil Nord" and the shop are made-up examples that
 * show the layout. Replace them with real work and real screenshots; a
 * portfolio of invented projects would undo everything the page argues.
 * The CRM is the one real piece: it is this very application.
 */

/**
 * One project in the grid: the picture fills the card from the top or the
 * side, cut off by its edge, and the name with one line sits bottom-left.
 * Cards settle in one after another as the grid comes into view.
 */
function ProjectCard({
  order,
  hue,
  title,
  text,
  className,
  children,
}: {
  order: number
  hue?: 'grass' | 'violet'
  title: string
  text: string
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: order * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative isolate flex flex-col justify-end overflow-hidden rounded-(--radius-5) bg-(--color-panel-solid) p-8 shadow-[inset_0_0_0_1px_var(--gray-a5)]',
        className,
      )}
    >
      {hue ? (
        <TintCard hue={hue} className="absolute inset-0 -z-20 rounded-none shadow-none" />
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10">
        {children}
      </div>
      <Heading as="h3" size={TYPE.title}>
        {title}
      </Heading>
      <Text as="p" size={TYPE.body} color="gray" mt="2" className="max-w-[36ch]">
        {text}
      </Text>
    </motion.article>
  )
}

/** A browser window around a page, the way a screenshot of a site is shown. */
function BrowserWindow({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-(--radius-4) border border-(--gray-a7) bg-(--color-panel-solid) shadow-[0_24px_60px_-28px_var(--gray-a9)]">
      <div className="flex h-9 items-center justify-center border-b border-frame bg-(--gray-2)">
        <span className="rounded-full bg-(--gray-a3) px-4 py-0.5 text-xs text-subtle">{url}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden [container-type:inline-size]">
        {children}
      </div>
    </div>
  )
}

const INVOICES = [
  {
    number: 'WP-0142',
    client: 'Clinica Dentară Lumina',
    amount: '6.830 lei',
    status: 'Plătită',
    color: 'grass',
  },
  {
    number: 'WP-0143',
    client: 'Brutăria Ardealul',
    amount: '4.200 lei',
    status: 'e-Factura',
    color: 'blue',
  },
  {
    number: 'WP-0144',
    client: 'Velo Tur Cluj',
    amount: '1.450 lei',
    status: 'Parțial',
    color: 'amber',
  },
] as const

const PRODUCTS = [
  { name: 'Miere', price: '32 lei', tone: 'var(--amber-a4)' },
  { name: 'Dulceață', price: '24 lei', tone: 'var(--violet-a4)' },
  { name: 'Zacuscă', price: '18 lei', tone: 'var(--red-a4)' },
  { name: 'Sirop de soc', price: '21 lei', tone: 'var(--lime-a4)' },
]

/* The shop's products dissolve towards the text, so the two never compete. */
const FADE_LEFT = 'linear-gradient(to right, transparent 0%, #000 40%)'

/**
 * Recent work, as a bento grid: one large piece on the left, two stacked on
 * the right. Each shows the thing itself, a page, an app screen, a shop,
 * with only its name and one line of what it is.
 */
export function Projects() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:grid-rows-[300px_300px] lg:gap-6">
      <ProjectCard
        order={0}
        hue="grass"
        title="Profil Nord"
        text="Site de prezentare pentru o firmă de tâmplărie PVC din Cluj."
        className="min-h-[420px] lg:row-span-2"
      >
        <div className="absolute top-10 -right-[8%] w-[86%]">
          <BrowserWindow url="profilnord.ro">
            <ClientSite />
          </BrowserWindow>
        </div>
      </ProjectCard>

      <ProjectCard
        order={1}
        title="CRM și facturare"
        text="Facturi, încasări și e-Factura ANAF, într-o singură aplicație."
        className="min-h-[300px]"
      >
        <div className="absolute inset-x-6 top-6 flex flex-col gap-2 lg:inset-x-auto lg:top-8 lg:right-8 lg:w-[64%]">
          {INVOICES.map((invoice) => (
            <div
              key={invoice.number}
              className="flex items-center gap-3 rounded-(--radius-3) bg-(--color-panel-solid) px-3 py-2.5 shadow-[0_6px_16px_-10px_var(--gray-a9),inset_0_0_0_1px_var(--gray-a5)]"
            >
              <Text size="1" color="gray" className="tabular-nums">
                {invoice.number}
              </Text>
              <Text size="2" weight="medium" truncate className="min-w-0 flex-1">
                {invoice.client}
              </Text>
              <Text size="2" className="tabular-nums">
                {invoice.amount}
              </Text>
              <Badge color={invoice.color}>{invoice.status}</Badge>
            </div>
          ))}
        </div>
      </ProjectCard>

      <ProjectCard
        order={2}
        hue="violet"
        title="Magazin online"
        text="Catalog, plăți și livrare pentru un producător local."
        className="min-h-[300px]"
      >
        <div
          className="absolute top-8 -right-6 left-6 grid grid-cols-3 gap-3 lg:left-auto lg:w-[72%] lg:grid-cols-4"
          style={{ maskImage: FADE_LEFT, WebkitMaskImage: FADE_LEFT }}
        >
          {PRODUCTS.map((product) => (
            <div
              key={product.name}
              className="rounded-(--radius-3) bg-(--color-panel-solid) p-2 shadow-[0_6px_16px_-10px_var(--gray-a9),inset_0_0_0_1px_var(--gray-a5)]"
            >
              <div
                className="aspect-[4/3] rounded-(--radius-2)"
                style={{ background: product.tone }}
              />
              <Text as="p" size="1" weight="medium" mt="2" truncate>
                {product.name}
              </Text>
              <Text as="p" size="1" color="gray" className="tabular-nums">
                {product.price}
              </Text>
            </div>
          ))}
        </div>
      </ProjectCard>
    </div>
  )
}
