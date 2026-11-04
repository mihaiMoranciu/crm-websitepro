'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react'

/*
 * One small figure per step of the process, in the Hairline style
 * (github.com/lucasmarkes/hairline, MIT): an isometric drawing of rounded
 * solids in a single hairline stroke. Each solid is a silhouette and one dim
 * crease, never twelve edges; plates are opaque and painted back to front;
 * dashed guides sit behind the plates they belong to; one bright stroke per
 * figure says where to look, and nothing else has a colour. No words, arrows
 * or icons inside: the objects say it.
 *
 * At rest each figure is a composition. Hovering its step opens it a little
 * (the sheets fan, the layers part, the block lifts), on one spring.
 */

type Ring = { u: number; v: number; nu: number; nv: number }[]
type Pt = [number, number]
type Cls = 'sil' | 'hi' | 'lo' | 'mid' | 'dash' | 'fill'
type Mark = { d: string; cls: Cls; plate?: boolean } | { dot: Pt; cls: 'dot' | 'dot-m' | 'dot-off' }

/* The 2:1 camera: azimuth 45°, sin(elevation) 0.5. +x runs down-right, +y down-left. */
const K = 0.5
const A = Math.SQRT1_2
const ZK = Math.sqrt(1 - K * K)
const P = (x: number, y: number, z: number): Pt => [(x - y) * A, (x + y) * A * K - z * ZK]
/** Whether a point of a ring faces the viewer, who stands at the corner of largest x and y. */
const front = (q: Ring[number]) => q.nu + q.nv > 1e-6

/** A rounded rectangle as a ring of samples with their outward normals. */
function rrect(u0: number, v0: number, u1: number, v1: number, r: number, n = 6): Ring {
  r = Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2)
  const corners: [number, number, number][] = [
    [u1 - r, v0 + r, -90],
    [u1 - r, v1 - r, 0],
    [u0 + r, v1 - r, 90],
    [u0 + r, v0 + r, 180],
  ]
  const ring: Ring = []
  for (const [cu, cv, a0] of corners)
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + (90 * i) / n) * Math.PI) / 180
      ring.push({
        u: cu + r * Math.cos(a),
        v: cv + r * Math.sin(a),
        nu: Math.cos(a),
        nv: Math.sin(a),
      })
    }
  return ring
}

const at = (ring: Ring, z: number) => ring.map((q) => P(q.u, q.v, z))

/** The one cyclic run of samples that face the viewer, in order. */
function frontRun(ring: Ring): Ring {
  const n = ring.length
  const start = ring.findIndex((q, i) => front(q) && !front(ring[(i - 1 + n) % n]))
  const out: Ring = []
  for (let i = 0; i < n && front(ring[(start + i) % n]); i++) out.push(ring[(start + i) % n])
  return out
}

function hull(points: Pt[]): Pt[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Pt[] = []
  const upper: Pt[] = []
  for (const q of p) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0)
      lower.pop()
    lower.push(q)
  }
  for (const q of [...p].reverse()) {
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0)
      upper.pop()
    upper.push(q)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

const path = (pts: Pt[], closed: boolean) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('') +
  (closed ? 'Z' : '')

/**
 * A rounded solid standing from z0 to z1: an opaque silhouette, the hull of
 * its base and top rings, and one dim crease inset on its top.
 */
function solid(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z0: number,
  z1: number,
  { r = 4, b = 1.6, hi = false } = {},
): Mark[] {
  const ring = rrect(x0, y0, x1, y1, r)
  const inner = rrect(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.5, r - b))
  return [
    {
      d: path(hull([...at(ring, z0), ...at(ring, z1)]), true),
      cls: hi ? 'hi' : 'sil',
      plate: true,
    },
    { d: path(at(frontRun(inner), z1), false), cls: 'lo' },
  ]
}

/** Dashed drops from a lifted footprint's outermost corners down to the surface below. */
function drops(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  zTop: number,
  zBottom: number,
): Mark[] {
  const feet: [number, number][] = [
    [x0, y1], // leftmost on screen
    [x1, y0], // rightmost
    [x1, y1], // nearest
  ]
  return feet.map(([x, y]) => ({
    d: path([P(x, y, zBottom), P(x, y, zTop)], false),
    cls: 'dash' as const,
  }))
}

/** Lines written across a plate's top, as text would sit on a sheet. */
function rules(
  x: number,
  y: number,
  z: number,
  lengths: number[],
  gap: number,
  hiIndex = -1,
): Mark[] {
  return lengths.map((len, i) => ({
    d: path([P(x, y + i * gap, z), P(x + len, y + i * gap, z)], false),
    cls: i === hiIndex ? 'hi' : 'lo',
  }))
}

const dot = (x: number, y: number, z: number, cls: 'dot' | 'dot-m' | 'dot-off'): Mark => ({
  dot: P(x, y, z),
  cls,
})

/* The figures. Each is a function of t, 0 at rest and 1 opened, painted back to front. */
const FIGURES = {
  // Two sets of notes on one table: what the client says, what we ask back.
  discutie: (t: number): Mark[] => {
    const lift = 10 + 10 * t
    return [
      ...solid(0, 0, 124, 86, -6, 0, { r: 9, b: 2.2 }),
      ...solid(12, 32, 64, 76, 0, 1.6, { r: 2.5, b: 1 }),
      ...rules(19, 42, 1.6, [36, 30, 38, 22], 8),
      ...drops(62, 8, 112, 46, lift, 0),
      ...solid(62, 8, 112, 46, lift, lift + 1.6, { r: 2.5, b: 1 }),
      ...rules(69, 17, lift + 1.6, [34, 28, 20], 8, 0),
    ]
  },
  // The offer in writing: a short stack of sheets, fanned out a little.
  propunere: (t: number): Mark[] => {
    const fan = 6 + 6 * t
    const sheets = [0, 1, 2].flatMap((k) => {
      const dx = (k - 1) * fan
      const dy = (1 - k) * fan * 0.4
      return solid(30 + dx, 10 + dy, 82 + dx, 78 + dy, k * 1.6, k * 1.6 + 1.6, { r: 2.5, b: 1 })
    })
    const top = 3 * 1.6
    const ox = 30 + fan
    const oy = 10 - fan * 0.4
    return [
      ...solid(0, 0, 124, 86, -6, 0, { r: 9, b: 2.2 }),
      ...sheets,
      ...rules(ox + 8, oy + 10, top, [26], 0, 0),
      ...rules(ox + 8, oy + 22, top, [36, 32, 36, 20], 7),
      dot(ox + 10, oy + 58, top, 'dot-off'),
      dot(ox + 18, oy + 58, top, 'dot-off'),
      dot(ox + 26, oy + 58, top, 'dot-m'),
    ]
  },
  // Built in layers: each one laid down, checked, then the next.
  constructie: (t: number): Mark[] => {
    const gap = 16 + 8 * t
    const z1 = gap
    const z2 = gap * 2 + 2
    return [
      ...solid(0, 0, 124, 86, -6, 0, { r: 9, b: 2.2 }),
      ...drops(14, 10, 110, 76, z1, 0),
      ...solid(14, 10, 110, 76, z1, z1 + 2, { r: 5, b: 1.4 }),
      ...rules(24, 22, z1 + 2, [30, 22, 26], 7),
      ...drops(30, 20, 94, 64, z2, z1 + 2),
      ...solid(30, 20, 94, 64, z2, z2 + 2, { r: 4, b: 1.2, hi: true }),
    ]
  },
  // Live: the finished piece lifted off the bench, its place left behind.
  lansare: (t: number): Mark[] => {
    const z = 24 + 14 * t
    const fp = rrect(42, 24, 82, 60, 4)
    return [
      ...solid(0, 0, 124, 86, -6, 0, { r: 9, b: 2.2 }),
      { d: path(at(fp, 0), true), cls: 'dash' },
      dot(14, 72, 0, 'dot-off'),
      dot(22, 72, 0, 'dot-off'),
      dot(30, 72, 0, 'dot-m'),
      ...drops(42, 24, 82, 60, z, 0),
      ...solid(42, 24, 82, 60, z, z + 30, { r: 5, b: 1.6, hi: true }),
    ]
  },
}

export type StepDrawing = keyof typeof FIGURES

/* One scale for all four figures, so the steps read as one set. */
const bounds = (marks: Mark[]) => {
  const pts: Pt[] = []
  for (const m of marks) {
    if ('dot' in m) pts.push(m.dot)
    else for (const [, x, y] of m.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) pts.push([+x, +y])
  }
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
const FIT = Object.fromEntries(
  (Object.keys(FIGURES) as StepDrawing[]).map((k) => {
    const a = bounds(FIGURES[k](0))
    const b = bounds(FIGURES[k](1))
    return [
      k,
      {
        x0: Math.min(a.x0, b.x0),
        x1: Math.max(a.x1, b.x1),
        y0: Math.min(a.y0, b.y0),
        y1: Math.max(a.y1, b.y1),
      },
    ]
  }),
) as Record<StepDrawing, ReturnType<typeof bounds>>
/** Pixels per drawing unit: the widest figure comes out 320px wide. */
const PX = 320 / Math.max(...Object.values(FIT).map((f) => f.x1 - f.x0))
const PAD = 3

const STROKE: Record<Exclude<Cls, 'fill'>, string> = {
  sil: 'var(--gray-8)',
  hi: 'var(--gray-12)',
  mid: 'var(--gray-7)',
  lo: 'var(--gray-6)',
  dash: 'var(--gray-8)',
}
const DOT = { dot: 'var(--gray-12)', 'dot-m': 'var(--gray-9)', 'dot-off': 'var(--gray-6)' }

/**
 * Draws one step's figure. It opens on its own spring while the pointer is
 * over the step it belongs to, and lands at once under reduced motion.
 */
export function StepIllustration({ kind }: { kind: StepDrawing }) {
  const ref = useRef<SVGSVGElement>(null)
  const reduceMotion = useReducedMotion()
  const spring = useSpring(0, { stiffness: 100, damping: 18, mass: 1 })
  const [t, setT] = useState(0)
  useMotionValueEvent(spring, 'change', setT)

  useEffect(() => {
    const step = ref.current?.closest('li')
    if (!step) return
    const open = () => (reduceMotion ? spring.jump(1) : spring.set(1))
    const close = () => (reduceMotion ? spring.jump(0) : spring.set(0))
    step.addEventListener('pointerenter', open)
    step.addEventListener('pointerleave', close)
    return () => {
      step.removeEventListener('pointerenter', open)
      step.removeEventListener('pointerleave', close)
    }
  }, [spring, reduceMotion])

  const f = FIT[kind]
  const w = f.x1 - f.x0 + PAD * 2
  const h = f.y1 - f.y0 + PAD * 2

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={`${f.x0 - PAD} ${f.y0 - PAD} ${w} ${h}`}
      width={Math.round(w * PX)}
      height={Math.round(h * PX)}
      className="block h-auto max-w-full"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g>
        {FIGURES[kind](t).map((m, i) =>
          'dot' in m ? (
            <ellipse
              key={i}
              cx={m.dot[0]}
              cy={m.dot[1]}
              rx={0.9}
              ry={0.9 * K}
              style={{ fill: DOT[m.cls] }}
            />
          ) : (
            <path
              key={i}
              d={m.d}
              vectorEffect="non-scaling-stroke"
              strokeWidth={0.9}
              strokeDasharray={m.cls === 'dash' ? '1 3' : undefined}
              style={{
                stroke: STROKE[m.cls as Exclude<Cls, 'fill'>],
                fill: m.plate ? 'var(--color-background)' : 'none',
              }}
            />
          ),
        )}
      </g>
    </svg>
  )
}
