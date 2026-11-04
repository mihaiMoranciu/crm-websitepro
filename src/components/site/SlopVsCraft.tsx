'use client'

import React from 'react'
import { Card, Flex, Text } from '@radix-ui/themes'
import { Clock, FileText, TriangleAlert } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { TYPE } from '@/design/type'

import { TintCard } from './Frame'

/*
 * What goes wrong with sites put together by prompting a generator, stated
 * plainly. The list is about the people who build that way, not about AI as
 * a tool: we use it too.
 */
const PROBLEMS = [
  'Cod pe care nu îl poate întreține nimeni',
  'Breșe de securitate nedetectate',
  'Lipsă de vizibilitate în Google',
  'Încărcare lentă pe telefon',
  'Niciun sprijin după lansare',
]

/* The bottom of the picture dissolves into the page instead of ending on an edge. */
const FADE_DOWN = 'linear-gradient(to bottom, #000 72%, transparent 100%)'

/** Each piece settles into place in turn, once, as the picture comes into view. */
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
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: order * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/**
 * The comparison section's body. On the left, a short story in two windows:
 * behind, the one-line prompt a generated site starts from; in front, that
 * same site six months after launch, stopped by the browser's certificate
 * warning, the most familiar way a neglected site breaks. On the right, the
 * same point in plain words.
 */
export function SlopComparison() {
  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[7fr_4fr] lg:gap-16">
      {/* The picture. Below lg only the window stays, at full width. */}
      <div
        className="relative order-2 lg:order-1 lg:h-[540px] lg:[mask-image:var(--fade)]"
        style={{ '--fade': FADE_DOWN } as React.CSSProperties}
      >
        <TintCard
          hue="violet"
          className="absolute top-16 left-0 hidden h-[460px] w-[56%] p-8 lg:block"
        >
          <span className="grid size-14 place-items-center rounded-(--radius-4) bg-(--color-panel-solid) text-strong shadow-[0_4px_16px_-6px_var(--gray-a8),inset_0_0_0_1px_var(--gray-a5)]">
            <FileText size={26} strokeWidth={1.5} />
          </span>
          <Text as="p" size="6" weight="bold" mt="6" className="max-w-[16ch] text-(--gray-a9)">
            „Fă-mi un site modern pentru firma mea.”
          </Text>
        </TintCard>

        <Reveal order={0} className="relative z-10 lg:absolute lg:top-0 lg:right-0 lg:w-[68%]">
          <ExpiredSite />
        </Reveal>

        <Reveal
          order={1}
          className="absolute top-[372px] left-[20%] z-20 hidden w-[230px] lg:block"
        >
          <Card size="2" variant="classic">
            <Flex align="center" gap="3">
              <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-2) bg-(--gray-a3) text-subtle">
                <Clock size={16} strokeWidth={1.75} />
              </span>
              <Text size="2" weight="medium">
                6 luni după lansare
              </Text>
            </Flex>
          </Card>
        </Reveal>
      </div>

      {/* The words. */}
      <div className="order-1 flex flex-col gap-10 lg:order-2 lg:pt-24">
        <Text as="p" size={TYPE.lead} weight="medium" className="text-balance">
          Un site generat arată gata în câteva minute.{' '}
          <span className="text-subtle">
            Problemele apar după lansare, când nu mai e nimeni care să le înțeleagă.
          </span>
        </Text>

        <div>
          <Text as="p" size={TYPE.meta} color="gray" mb="3">
            Problemele obișnuite
          </Text>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {PROBLEMS.map((problem) => (
              <li key={problem}>
                <Text size={TYPE.body} weight="medium">
                  {problem}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * The generated site, half a year on: nobody renewed the certificate, so
 * the browser stops every visitor at its warning page before they see a
 * thing. Drawn like the real page, in the page's own greys, with the one red
 * the warning carries. Sized in container units so it scales as one picture.
 */
function ExpiredSite() {
  return (
    <div className="overflow-hidden rounded-(--radius-4) border border-(--gray-a7) bg-(--color-panel-solid) shadow-[0_24px_60px_-28px_var(--gray-a9)]">
      <div className="flex h-9 items-center justify-center border-b border-frame bg-(--gray-2)">
        <span className="flex items-center gap-2 rounded-full bg-(--gray-a3) px-3 py-0.5 text-xs">
          <span className="flex items-center gap-1 font-medium text-(--red-11)">
            <TriangleAlert size={12} strokeWidth={2} />
            Nesigur
          </span>
          <span className="text-(--gray-a6)">|</span>
          <span className="text-subtle line-through decoration-(--red-9)">https://</span>
          <span className="-ml-1.5 text-subtle">firma-ta.ro</span>
        </span>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden [container-type:inline-size]">
        <div className="absolute inset-0 flex flex-col justify-center px-[12cqw]">
          <TriangleAlert className="size-[8cqw] text-(--red-9)" strokeWidth={1.5} aria-hidden />
          <span className="mt-[4cqw] text-[4.6cqw] leading-tight font-semibold tracking-tight text-strong">
            Conexiunea nu este privată
          </span>
          <span className="mt-[2.4cqw] text-[2.2cqw] leading-[1.55] text-subtle">
            Este posibil ca atacatorii să încerce să îți fure informațiile de pe firma-ta.ro, de
            exemplu parole, mesaje sau datele cardului.
          </span>
          <span className="mt-[2.4cqw] font-mono text-[1.8cqw] text-(--gray-10)">
            NET::ERR_CERT_DATE_INVALID
          </span>
          <span className="mt-[5cqw] flex items-center justify-between">
            <span className="rounded-[0.8cqw] border border-(--gray-a6) px-[2.4cqw] py-[1.2cqw] text-[2cqw] text-subtle">
              Avansat
            </span>
            <span className="rounded-[0.8cqw] bg-(--blue-9) px-[2.4cqw] py-[1.2cqw] text-[2cqw] font-medium text-white">
              Înapoi la siguranță
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
