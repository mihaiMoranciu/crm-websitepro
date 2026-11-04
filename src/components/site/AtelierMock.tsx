import React from 'react'
import Image from 'next/image'
import { IBM_Plex_Serif } from 'next/font/google'
import { ArrowRight, Menu } from 'lucide-react'

import carving from '@/assets/mock/carving.webp'
import woodenHouse from '@/assets/mock/wooden-house.webp'
import { cn } from '@/utilities/ui'

/*
 * "Atelier Lemn", the made-up carpentry workshop whose site the service pages
 * show. It has its own identity, the way a client's site would: a serif for a
 * trade that is centuries old, near-black with a hint of forest, the colour of
 * oiled oak, and real photos of the work. It does not follow the light/dark
 * theme of our site, because it is someone else's site.
 *
 * Photos from Unsplash, free to use under the Unsplash licence:
 * photo-1611021061285 (carving) and photo-1600585154340 (wooden house).
 */

const serif = IBM_Plex_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const ATELIER = {
  domain: 'atelier-lemn.ro',
  brand: 'Atelier Lemn',
  nav: ['Lucrări', 'Atelierul', 'Contact'],
  text: 'Măsurăm, producem și montăm în tot județul Brașov.',
  carving,
  woodenHouse,
}

/* The workshop's palette. */
const INK = '#121412'
const OAK = '#c79b6b'
const BONE = '#efede8'

/** The headline, with the material set in the oak colour. */
function Title({ className }: { className?: string }) {
  return (
    <p className={cn(serif.className, 'm-0 leading-[1.1] font-medium text-balance', className)}>
      Uși și ferestre din <em style={{ color: OAK }}>lemn masiv</em>, făcute pe măsură
    </p>
  )
}

/** The workshop's mark: its initials in a thin oak frame. */
export function AtelierMark({ size = 22 }: { size?: number }) {
  return (
    <span
      className={cn(serif.className, 'grid shrink-0 place-items-center font-semibold italic')}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        color: OAK,
        boxShadow: `inset 0 0 0 1px ${OAK}`,
        borderRadius: 3,
      }}
    >
      AL
    </span>
  )
}

function Wordmark({ size = 'text-[13px]' }: { size?: string }) {
  return (
    <span className="flex items-center gap-2">
      <AtelierMark />
      <span className={cn(serif.className, size, 'font-semibold')} style={{ color: BONE }}>
        {ATELIER.brand}
      </span>
    </span>
  )
}

/** The workshop's site on a desktop screen: the opening section and a strip of facts. */
export function AtelierDesktop() {
  return (
    <div style={{ background: INK, color: BONE }}>
      <div className="relative isolate overflow-hidden">
        <Image
          src={carving}
          alt=""
          fill
          sizes="460px"
          className="-z-20 object-cover"
          style={{ objectPosition: '50% 35%' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(100deg, ${INK} 18%, rgb(18 20 18 / 0.75) 48%, rgb(18 20 18 / 0.1) 100%)`,
          }}
        />
        <div className="flex items-center gap-4 px-5 pt-4 text-[11px]">
          <Wordmark />
          <span className="ml-auto flex gap-3.5" style={{ color: 'rgb(239 237 232 / 0.7)' }}>
            {ATELIER.nav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </span>
        </div>
        <div className="flex max-w-[66%] flex-col gap-3 px-5 pt-10 pb-8">
          <Title className="text-[22px]" />
          <p
            className="m-0 text-[11px] leading-relaxed"
            style={{ color: 'rgb(239 237 232 / 0.72)' }}
          >
            {ATELIER.text}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-medium">
            <span className="rounded-[3px] px-3 py-1.5" style={{ background: OAK, color: INK }}>
              Cere o ofertă
            </span>
            <span
              className="flex items-center gap-1 rounded-[3px] px-3 py-1.5"
              style={{ boxShadow: 'inset 0 0 0 1px rgb(239 237 232 / 0.3)' }}
            >
              Vezi lucrările
              <ArrowRight size={11} strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </div>
      </div>
      <div
        className="grid grid-cols-3 text-[10.5px]"
        style={{ borderTop: '1px solid rgb(239 237 232 / 0.12)' }}
      >
        {[
          ['Stejar, fag, cireș', 'din depozite din zonă'],
          ['Montaj inclus', 'făcut de noi, nu de terți'],
          ['Din 1998', 'în același atelier'],
        ].map(([title, note], i) => (
          <div
            key={title}
            className="px-4 py-3"
            style={{ borderLeft: i ? '1px solid rgb(239 237 232 / 0.12)' : undefined }}
          >
            <p className={cn(serif.className, 'm-0 text-[12px] font-medium')}>{title}</p>
            <p className="m-0 mt-0.5" style={{ color: 'rgb(239 237 232 / 0.55)' }}>
              {note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** The same site on a phone: the opening section, then the latest work. */
export function AtelierPhone() {
  return (
    <div style={{ background: INK, color: BONE }}>
      <div className="relative isolate overflow-hidden">
        <Image
          src={carving}
          alt=""
          fill
          sizes="248px"
          className="-z-20 object-cover"
          style={{ objectPosition: '50% 30%' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(to bottom, rgb(18 20 18 / 0.35), rgb(18 20 18 / 0.55) 45%, ${INK} 100%)`,
          }}
        />
        <div className="flex items-center justify-between px-4 pt-4">
          <Wordmark size="text-[12px]" />
          <Menu size={16} strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex flex-col gap-2.5 px-4 pt-24 pb-5">
          <Title className="text-[19px]" />
          <p
            className="m-0 text-[10.5px] leading-relaxed"
            style={{ color: 'rgb(239 237 232 / 0.72)' }}
          >
            {ATELIER.text}
          </p>
          <span
            className="mt-1 rounded-[3px] py-2 text-center text-[11px] font-medium"
            style={{ background: OAK, color: INK }}
          >
            Cere o ofertă
          </span>
        </div>
      </div>
      <div className="px-4 pt-4 pb-5">
        <p className={cn(serif.className, 'm-0 mb-2.5 text-[13px] font-medium')}>Lucrări recente</p>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[3px]">
          <Image src={woodenHouse} alt="" fill sizes="248px" className="object-cover" />
        </div>
        <p className="m-0 mt-2 text-[10.5px]">Fațadă și tâmplărie din larice</p>
        <p className="m-0 text-[10px]" style={{ color: 'rgb(239 237 232 / 0.55)' }}>
          Casă nouă, Râșnov
        </p>
      </div>
    </div>
  )
}
