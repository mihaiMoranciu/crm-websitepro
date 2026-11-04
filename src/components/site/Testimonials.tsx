'use client'

import React from 'react'
import { Flex, Text } from '@radix-ui/themes'
import { Building2, Quote } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { TYPE } from '@/design/type'
import { cn } from '@/utilities/ui'

import { TintCard } from './Frame'

/*
 * TODO before launch: these are placeholder testimonials that only show the
 * layout. Publishing invented quotes from invented people is a fake review,
 * and it would undo everything the page argues. Replace them with real ones,
 * with the client's permission, or remove the section. Until then they name
 * no one: only the role and the kind of business.
 */
const FEATURED = {
  quote:
    'Înainte primeam cereri de ofertă doar la telefon. Acum vin din site, cu dimensiunile deja completate, și le răspundem în aceeași zi.',
  role: 'Administrator',
  business: 'Firmă de tâmplărie',
  place: 'Cluj-Napoca',
}

const OTHERS = [
  {
    quote:
      'Comenzile, plățile și facturile se leagă singure. Nu mai copiem nimic de mână dintr-un loc în altul.',
    role: 'Fondatoare',
    business: 'Magazin online de produse locale',
  },
  {
    quote:
      'Când a căzut serverul vechiului furnizor, ne-au mutat site-ul în aceeași seară. De atunci nu ne mai gândim la el.',
    role: 'Medic coordonator',
    business: 'Clinică medicală',
  },
]

const CARD = 'rounded-(--radius-5) bg-(--color-panel-solid) shadow-[inset_0_0_0_1px_var(--gray-a5)]'

/** Each card settles into place in turn, once, as the grid comes into view. */
function Reveal({
  order,
  className,
  children,
}: {
  order: number
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.figure
      className={cn('m-0', className)}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: order * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.figure>
  )
}

const QuoteMark = () => (
  <Quote aria-hidden size={28} strokeWidth={0} fill="currentColor" className="text-(--accent-9)" />
)

/** Who said it: their role and the kind of business, no names. */
function Author({ role, business }: { role: string; business: string }) {
  return (
    <Flex asChild align="center" gap="3" className="mt-auto border-t border-frame pt-5">
      <figcaption>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-(--accent-a3) text-(--accent-11)">
          <Building2 size={18} strokeWidth={1.5} aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <Text size="3" weight="medium">
            {role}
          </Text>
          <Text size="2" color="gray">
            {business}
          </Text>
        </span>
      </figcaption>
    </Flex>
  )
}

/**
 * What clients say, as one large card with a picture beside the quote and two
 * smaller ones under it.
 */
export function Testimonials() {
  return (
    <div className="grid gap-4 lg:gap-6">
      <Reveal order={0} className={cn(CARD, 'grid gap-2 p-2 lg:grid-cols-2')}>
        <div className="flex flex-col gap-8 p-6 lg:p-8">
          <div>
            <QuoteMark />
            <blockquote className="m-0 mt-4">
              <Text as="p" size={TYPE.lead} weight="medium" className="text-pretty">
                {FEATURED.quote}
              </Text>
            </blockquote>
          </div>
          <Author role={FEATURED.role} business={FEATURED.business} />
        </div>

        {/* The kind of business on the brand's tint, where a photo of them will go. */}
        <TintCard
          hue="grass"
          className="flex min-h-[280px] flex-col justify-end gap-2 rounded-(--radius-4) p-6 shadow-none lg:p-8"
        >
          <span className="font-mono text-xs tracking-wider text-subtle uppercase">
            {FEATURED.place}
          </span>
          <span className="text-5xl font-bold tracking-tight text-strong lg:text-6xl">
            {FEATURED.business}
          </span>
        </TintCard>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {OTHERS.map((item, i) => (
          <Reveal
            key={item.business}
            order={i + 1}
            className={cn(CARD, 'flex flex-col gap-6 p-6 lg:p-8')}
          >
            <QuoteMark />
            <blockquote className="m-0 -mt-2">
              <Text as="p" size={TYPE.body} className="text-pretty">
                {item.quote}
              </Text>
            </blockquote>
            <Author role={item.role} business={item.business} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
