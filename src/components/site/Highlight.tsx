'use client'

import React from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { BAND, NOISE } from './HeroGlow'

/**
 * Marks the word a title turns on. Not by colouring the letters, the usual
 * gradient-text move, but the way a pen would: a band of the hero's colours
 * laid under the lower half of the word, cut with the same slanted sides as
 * the hero's trapezoid, with the same grain. The text keeps its own colour on
 * top, so it reads exactly as before.
 *
 * The band draws itself left to right once the title is in view, like a
 * marker stroke; under reduced motion it is simply there.
 */
export function Highlight({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  return (
    <span className="relative isolate inline-block whitespace-nowrap">
      <motion.span
        aria-hidden
        className="absolute -inset-x-[0.06em] bottom-[0.04em] -z-10 h-[0.46em] origin-left overflow-hidden opacity-70 dark:opacity-85"
        style={{
          background: BAND,
          clipPath: 'polygon(0.28em 0, calc(100% - 0.28em) 0, 100% 100%, 0 100%)',
        }}
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.65, 0, 0.35, 1] }}
      >
        <span
          className="absolute inset-0 opacity-35 mix-blend-overlay"
          style={{ backgroundImage: NOISE }}
        />
      </motion.span>
      {children}
    </span>
  )
}
