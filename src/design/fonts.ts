import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'

/**
 * IBM Plex Sans: a sober grotesque with a slightly technical, engineered
 * character, which suits an IT company better than the Inter/Geist look every
 * generated site shares. It is also one of the few free families with proper
 * Romanian diacritics (ș and ț with a comma below, not a cedilla), which is why
 * `latin-ext` is loaded.
 *
 * Plex Mono is its sibling, for code and figures that must line up.
 */
export const fontSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-plex-sans',
})

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
})
