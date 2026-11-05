'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ToggleGroup } from 'radix-ui'
import { BellIcon, LockClosedIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useInView, useReducedMotion } from 'motion/react'

import { cn } from '@/utilities/ui'

import { FlowingGradient } from './FlowingGradient'
import { NOISE } from './HeroGlow'

/*
 * The pieces of a product showcase: a list of steps on the left, a picture of
 * the product on the right that changes with the step. The steps advance on
 * their own while the showcase is in view, until someone picks one; under
 * reduced motion they wait to be picked.
 *
 * The pictures are drawn the way real product shots are: quiet greys, Radix
 * icons, little text, the bottom fading into the page, and one coloured thing
 * per screen for the eye to land on.
 */

/** Any icon component, so Radix icons fit where an icon is expected. */
export type Icon = React.ComponentType<{ className?: string }>

export type Step = { icon: Icon; title: string; text: string }

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
              aria-hidden
              className={cn(
                'relative grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300',
                on
                  ? 'bg-(--gray-12) text-(--gray-1)'
                  : 'bg-(--color-background) text-subtle shadow-[inset_0_0_0_1px_var(--gray-a6)]',
              )}
            >
              <Icon />
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

/** The two-column layout: steps on the left, picture on the right. */
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

/* ---------- The picture ---------- */

/** The bottom of the window dissolves into the page instead of ending on an edge. */
const FADE_DOWN = 'linear-gradient(to bottom, #000 72%, transparent 100%)'

/** A panel that floats over the window: a menu, a note, a card. */
export const floating =
  'rounded-(--radius-4) bg-(--color-panel-solid) shadow-[0_18px_40px_-14px_var(--gray-a10),0_0_0_1px_var(--gray-a5)]'

/**
 * The product window, with room around it for panels that sit over its edge.
 * `overlays` is drawn outside the window's clip and fade.
 */
export function Shot({
  children,
  overlays,
}: {
  children: React.ReactNode
  overlays?: React.ReactNode
}) {
  return (
    <div aria-hidden className="relative isolate select-none">
      <div
        className="relative h-[400px] overflow-hidden rounded-(--radius-5) bg-(--color-panel-solid) shadow-[inset_0_0_0_1px_var(--gray-a5)] sm:h-[440px]"
        style={{ maskImage: FADE_DOWN, WebkitMaskImage: FADE_DOWN }}
      >
        {children}
      </div>
      {overlays}
    </div>
  )
}

/** Something shown only on its step, fading in place. Fills its positioned parent. */
export function Fade({
  on,
  className,
  children,
}: {
  on: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        on ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** A quiet square holding an icon or initials: grey, outlined, nothing more. */
export function IconTile({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-(--radius-3) bg-(--gray-a3) text-strong shadow-[inset_0_0_0_1px_var(--gray-a4)]',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** A person, by their initials on grey. */
export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-full bg-(--gray-a4) text-[9px] font-medium text-strong',
        className,
      )}
    >
      {initials}
    </span>
  )
}

/** The site's own colours, the same flowing field as the service pages use. */
const GRAIN_COLORS: [string, string, string, string] = [
  'var(--grass-5)',
  'var(--grass-8)',
  'var(--lime-7)',
  'var(--violet-7)',
]

/**
 * The slowly flowing, grainy colour field (see FlowingGradient), for the
 * one surface on a screen that gets colour. A static gradient of the same
 * colours stays underneath until the shader runs, or if it cannot.
 */
export function GrainGradient({
  colors = GRAIN_COLORS,
  className,
  style,
  children,
}: {
  colors?: [string, string, string, string]
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      style={{ background: `linear-gradient(135deg, ${colors.join(', ')})`, ...style }}
    >
      <FlowingGradient
        colors={colors}
        className="pointer-events-none absolute inset-0 -z-20 size-full"
      />
      <span
        className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-overlay dark:opacity-30"
        style={{ backgroundImage: NOISE }}
      />
      {children}
    </div>
  )
}

/** The app's top bar: the company, where we are, search and the person signed in. */
export function AppBar({ page, me = 'AD' }: { page: string; me?: string }) {
  return (
    <div className="flex h-11 items-center gap-2.5 border-b border-frame px-4">
      <span className="grid size-5 place-items-center rounded-[5px] bg-(--accent-9) text-[10px] font-bold text-(--accent-contrast)">
        F
      </span>
      <span className="text-[13px] font-medium text-strong">Firma ta</span>
      <span className="text-[13px] text-(--gray-a8)">/</span>
      <span className="text-[13px] text-subtle">{page}</span>
      <span className="ml-auto flex items-center gap-3 text-subtle">
        <MagnifyingGlassIcon />
        <BellIcon />
        <Avatar initials={me} />
      </span>
    </div>
  )
}

/**
 * The app's side menu. `locked` items show a padlock and step back, for the
 * screens about who can see what.
 */
export function SideNav({
  items,
  page,
  locked = [],
}: {
  items: { icon: Icon; label: string }[]
  page: string
  locked?: string[]
}) {
  return (
    <nav className="hidden flex-col gap-0.5 border-r border-frame p-2.5 sm:flex">
      {items.map(({ icon: Icon, label }) => {
        const closed = locked.includes(label)
        return (
          <span
            key={label}
            className={cn(
              'flex items-center gap-2.5 rounded-(--radius-2) px-2.5 py-1.5 text-[13px] transition-[color,background-color,opacity] duration-300',
              label === page ? 'bg-(--gray-a3) text-strong' : 'text-subtle',
              closed && 'opacity-45',
            )}
          >
            <Icon />
            {label}
            {closed ? <LockClosedIcon className="ml-auto size-3" /> : null}
          </span>
        )
      })}
    </nav>
  )
}

/** The window body of an app: the side menu and the page beside it. */
export function AppBody({ nav, children }: { nav: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid h-full sm:grid-cols-[168px_1fr]">
      {nav}
      <div className="relative">{children}</div>
    </div>
  )
}

/* Rows further down a list step back, the way a long list runs on. */
export const RUN_ON = ['', '', 'opacity-60', 'opacity-30', 'opacity-15']

/** What happened, in order, joined by a line: an order's history, say. */
export function Timeline({
  items,
}: {
  items: { icon: Icon; text: string; detail?: string; when?: string }[]
}) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map(({ icon: ItemIcon, text, detail, when }, i) => (
        <li key={text} className={cn('relative flex gap-3 pb-5', RUN_ON[i])}>
          {i < items.length - 1 ? (
            <span className="absolute top-8 bottom-1 left-[13.5px] w-px bg-(--gray-a5)" />
          ) : null}
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-(--gray-a3) text-strong">
            <ItemIcon />
          </span>
          <span className="min-w-0 pt-1 leading-tight">
            <span className="block text-[13px] text-strong">{text}</span>
            {detail ? <span className="mt-0.5 block text-xs text-subtle">{detail}</span> : null}
          </span>
          {when ? <span className="ml-auto shrink-0 pt-1 text-xs text-subtle">{when}</span> : null}
        </li>
      ))}
    </ol>
  )
}
