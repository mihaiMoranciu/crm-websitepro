import React from 'react'
import Image, { type StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'

import { NOISE } from './HeroGlow'

/**
 * A rounded card with a landscape photo for a background, toned to sit with
 * the rest of the site: a soft wash of the brand green, film grain over it,
 * and a little more shade in dark mode. Whatever goes inside floats on the
 * picture. Used on the service and product pages, one photo per page.
 *
 * The photo is decorative, so it carries no alt text; the card's contents
 * say what matters.
 */
export function LandscapeCard({
  image,
  position = 'center',
  priority,
  className,
  children,
}: {
  image: StaticImageData
  /** object-position of the photo, to keep its best part in view when cropped. */
  position?: string
  priority?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-(--radius-5) shadow-[inset_0_0_0_1px_var(--gray-a5)]',
        className,
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        placeholder="blur"
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="-z-30 object-cover"
        style={{ objectPosition: position }}
      />
      {/* Pull the colours a little towards the brand green, and calm them down. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-(--grass-9) opacity-20 mix-blend-soft-light"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-black/0 dark:bg-black/30"
      />
      {/* Film grain, stronger than on the gradient cards: a photo carries it well. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50 mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />
      {children}
    </div>
  )
}
