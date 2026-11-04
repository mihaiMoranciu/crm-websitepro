'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ToggleGroup } from 'radix-ui'
import type { LucideIcon } from 'lucide-react'
import { useInView, useReducedMotion } from 'motion/react'

import { cn } from '@/utilities/ui'

/*
 * The pieces of a product showcase: a list of steps on the left, a mockup of
 * the product on the right that changes with the step. The steps advance on
 * their own while the showcase is in view, until someone picks one; under
 * reduced motion they wait to be picked.
 */

export type Step = { icon: LucideIcon; title: string; text: string }

const STEP_MS = 5500

/** The active step, moving on by itself until a visitor chooses one. */
export function useSteps(count: number) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (held || reduceMotion || !inView) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), STEP_MS)
    return () => window.clearInterval(id)
  }, [held, reduceMotion, inView, count])

  const select = (i: number) => {
    setActive(i)
    setHeld(true)
  }

  return { ref, active, select }
}

/**
 * The steps as a vertical list joined by a line. The line fills in as the
 * steps go by, and the current step's icon turns solid. A Radix toggle group,
 * so arrow keys move between steps.
 */
export function StepList({
  steps,
  active,
  onSelect,
  label,
}: {
  steps: Step[]
  active: number
  onSelect: (i: number) => void
  label: string
}) {
  return (
    <ToggleGroup.Root
      type="single"
      orientation="vertical"
      aria-label={label}
      value={String(active)}
      onValueChange={(v) => v && onSelect(Number(v))}
      className="flex flex-col gap-10"
    >
      {steps.map(({ icon: Icon, title, text }, i) => {
        const on = i === active
        return (
          <ToggleGroup.Item
            key={title}
            value={String(i)}
            className="group relative flex cursor-pointer gap-4 rounded-(--radius-3) text-left outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
          >
            {/* The segment down to the next step, solid once that step is reached. */}
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  'absolute top-8 left-[15.5px] h-[calc(100%+0.5rem)] w-px transition-colors duration-500',
                  i < active ? 'bg-(--gray-12)' : 'bg-(--gray-a5)',
                )}
              />
            ) : null}
            <span
              className={cn(
                'relative grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300',
                on
                  ? 'bg-(--gray-12) text-(--gray-1)'
                  : 'bg-(--color-background) text-subtle shadow-[inset_0_0_0_1px_var(--gray-a6)]',
              )}
            >
              <Icon size={15} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="max-w-[34ch] pt-1 text-[length:--font-size-3] leading-snug">
              <span
                className={cn(
                  'font-medium transition-colors',
                  on ? 'text-strong' : 'text-subtle group-hover:text-strong',
                )}
              >
                {title}
              </span>{' '}
              <span className="text-subtle">{text}</span>
            </span>
          </ToggleGroup.Item>
        )
      })}
    </ToggleGroup.Root>
  )
}

/** The outer frame of a product mockup: a panel with the app laid out inside. */
export function MockFrame({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative isolate overflow-hidden rounded-(--radius-5) bg-(--color-panel-solid) p-2.5 shadow-[inset_0_0_0_1px_var(--gray-a5),0_40px_80px_-48px_var(--gray-a10)] select-none sm:p-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** A dashed outline that appears around the part of the mockup a step is about. */
export const marked = (on: boolean) =>
  cn(
    'rounded-(--radius-3) outline-1 outline-offset-4 outline-dashed transition-[outline-color] duration-500',
    on ? 'outline-(--accent-9)' : 'outline-transparent',
  )

/** The two-column layout: steps on the left, mockup on the right. */
export function ShowcaseLayout({
  steps,
  label,
  stepsRef,
  active,
  onSelect,
  children,
}: {
  steps: Step[]
  label: string
  stepsRef: React.RefObject<HTMLDivElement | null>
  active: number
  onSelect: (i: number) => void
  children: React.ReactNode
}) {
  return (
    <div ref={stepsRef} className="grid items-center gap-12 lg:grid-cols-[1fr_2.4fr] lg:gap-16">
      <StepList steps={steps} active={active} onSelect={onSelect} label={label} />
      {children}
    </div>
  )
}
