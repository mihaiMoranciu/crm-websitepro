'use client'

import React, { useEffect, useRef } from 'react'

/*
 * A slow, flowing colour field in the manner of Stripe's hero: a few colours
 * folded into each other by layered noise, drifting a little every second.
 * Drawn by a small WebGL shader at half resolution (a soft gradient loses
 * nothing to upscaling). It paints over whatever background the parent
 * already has, and fades in only once it runs, so without WebGL, or before
 * the script loads, the static background simply stays.
 *
 * Colours are CSS colours (usually Radix variables), read from the page, so
 * they follow the light and dark theme. Under reduced motion it draws one
 * still frame. Off screen, or in a hidden tab, it stops drawing.
 */

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

/* Ashima Arts' 3D simplex noise (MIT), then a domain-warped blend of four colours. */
const FRAGMENT = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0);
  float t = u_time;

  // Bend the space with one noise, then read the colours through the bend:
  // the patches stretch into the long, folded ribbons of a Stripe gradient.
  vec2 warp = vec2(snoise(vec3(p * 0.8, t)), snoise(vec3(p * 0.8 + 5.2, t)));
  vec2 q = p + warp * 0.45 + vec2(t * 0.6, -t * 0.3);

  float n1 = snoise(vec3(q * 0.75, t * 1.2));
  float n2 = snoise(vec3(q * 1.1 + 3.1, t * 0.9));
  float n3 = snoise(vec3(q * 0.55 + 7.7, t * 0.7));

  vec3 col = u_c0;
  col = mix(col, u_c1, smoothstep(-0.45, 0.55, n1));
  col = mix(col, u_c2, smoothstep(0.0, 0.85, n2) * 0.9);
  col = mix(col, u_c3, smoothstep(0.3, 0.95, n3) * 0.75);
  gl_FragColor = vec4(col, 1.0);
}
`

/* Any CSS colour (including display-p3 and var()) to sRGB 0..1, via a 1px canvas. */
function readColors(host: HTMLElement, colors: string[]): number[][] {
  const probe = document.createElement('span')
  host.appendChild(probe)
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const out = colors.map((color) => {
    probe.style.color = color
    const resolved = getComputedStyle(probe).color
    if (!ctx) return [0.5, 0.5, 0.5]
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = resolved
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r / 255, g / 255, b / 255]
  })
  probe.remove()
  return out
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

export function FlowingGradient({
  colors,
  speed = 0.045,
  className,
}: {
  /** Four colours: the base, then three that flow over it, most to least present. */
  colors: [string, string, string, string]
  /** How fast it drifts; the default is calm enough to notice only by looking. */
  speed?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorKey = colors.join('|')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_res')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uColors = [0, 1, 2, 3].map((i) => gl.getUniformLocation(program, `u_c${i}`))

    const applyColors = () => {
      readColors(canvas.parentElement ?? document.body, colorKey.split('|')).forEach(
        ([r, g, b], i) => gl.uniform3f(uColors[i], r, g, b),
      )
    }
    applyColors()

    const resize = () => {
      const scale = 0.5
      const w = Math.max(1, Math.round(canvas.clientWidth * scale))
      const h = Math.max(1, Math.round(canvas.clientHeight * scale))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // A fixed starting point, so the still frame is always the same one.
    const start = performance.now()
    const draw = (now: number) => {
      gl.uniform1f(uTime, 2 + ((now - start) / 1000) * speed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    let frame = 0
    let visible = false
    const loop = (now: number) => {
      draw(now)
      frame = visible && !reduceMotion ? requestAnimationFrame(loop) : 0
    }
    const play = () => {
      if (!frame) frame = requestAnimationFrame(loop)
    }

    resize()
    draw(start)
    canvas.style.opacity = '1'

    const sizeObserver = new ResizeObserver(() => {
      resize()
      if (!frame) draw(performance.now())
    })
    sizeObserver.observe(canvas)

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden
      if (visible) play()
    })
    viewObserver.observe(canvas)

    const onVisibility = () => {
      visible = !document.hidden
      if (visible) play()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // The theme toggle swaps data-theme on <html>; the colours follow.
    const themeObserver = new MutationObserver(() => {
      applyColors()
      if (!frame) draw(performance.now())
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    return () => {
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [colorKey, speed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ opacity: 0, transition: 'opacity 600ms ease-out' }}
    />
  )
}
