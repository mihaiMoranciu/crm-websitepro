'use client'

import React from 'react'
import { Flex, Text } from '@radix-ui/themes'
import { ArrowRight, Quote } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { TYPE } from '@/design/type'
import { cn } from '@/utilities/ui'

import { TintCard } from './Frame'

/*
 * TODO before launch: these are placeholder testimonials that only show the
 * layout. Publishing invented quotes from invented people is a fake review,
 * and it would undo everything the page argues. Replace them with real ones,
 * with the client's permission, or remove the section.
 */
const FEATURED = {
  quote:
    'Înainte primeam cereri de ofertă doar la telefon. Acum vin din site, cu dimensiunile deja completate, și le răspundem în aceeași zi.',
  name: 'Andrei Mureșan',
  role: 'Administrator',
  company: 'Profil Nord',
  place: 'Cluj-Napoca',
}

const OTHERS = [
  {
    quote:
      'Comenzile, plățile și facturile se leagă singure. Nu mai copiem nimic de mână dintr-un loc în altul.',
    name: 'Ioana Rusu',
    role: 'Fondatoare',
    company: 'Cămara de Sus',
  },
  {
    quote:
      'Când a căzut serverul vechiului furnizor, ne-au mutat site-ul în aceeași seară. De atunci nu ne mai gândim la el.',
    name: 'Elena Vasilescu',
    role: 'Medic coordonator',
    company: 'Clinica Lumina',
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

/** Who said it: initials in place of a photo, name, role. */
function Author({ name, role, aside }: { name: string; role: string; aside?: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
  return (
    <Flex asChild align="center" gap="3" className="mt-auto border-t border-frame pt-5">
      <figcaption>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-(--accent-a3) text-sm font-medium text-(--accent-11)">
          {initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <Text size="3" weight="medium">
            {name}
          </Text>
          <Text size="2" color="gray">
            {role}
          </Text>
        </span>
        {aside ? (
          <Text size="2" weight="medium" className="text-subtle">
            {aside}
          </Text>
        ) : null}
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
          <Flex align="center" justify="end" gap="4">
            <a
              href="#proiecte"
              className="group flex items-center gap-2 font-mono text-xs tracking-wider text-(--accent-11) uppercase no-underline"
            >
              Vezi proiectul
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </Flex>
          <div>
            <QuoteMark />
            <blockquote className="m-0 mt-4">
              <Text as="p" size={TYPE.lead} weight="medium" className="text-pretty">
                {FEATURED.quote}
              </Text>
            </blockquote>
          </div>
          <Author name={FEATURED.name} role={`${FEATURED.role}, ${FEATURED.company}`} />
        </div>

        {/* The client's name on the brand's tint, where a photo of them will go. */}
        <TintCard
          hue="grass"
          className="flex min-h-[280px] flex-col justify-end gap-2 rounded-(--radius-4) p-6 shadow-none lg:p-8"
        >
          <span className="font-mono text-xs tracking-wider text-subtle uppercase">
            {FEATURED.place}
          </span>
          <span className="text-5xl font-bold tracking-tight text-strong lg:text-6xl">
            {FEATURED.company}
          </span>
        </TintCard>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {OTHERS.map((item, i) => (
          <Reveal
            key={item.name}
            order={i + 1}
            className={cn(CARD, 'flex flex-col gap-6 p-6 lg:p-8')}
          >
            <QuoteMark />
            <blockquote className="m-0 -mt-2">
              <Text as="p" size={TYPE.body} className="text-pretty">
                {item.quote}
              </Text>
            </blockquote>
            <Author name={item.name} role={item.role} aside={item.company} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
