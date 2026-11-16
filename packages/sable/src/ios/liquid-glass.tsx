"use client"

import { useEffect, useId, useRef } from 'react'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * A displacement map for a capsule: neutral (128) in the middle, bending only in
 * a band at the rim. Red and green say how far each pixel samples horizontally
 * and vertically. `ridge` bends most mid-band and eases off at the rim (a soft
 * swell, for a bar over arbitrary content); `convex` bends more the nearer the
 * rim, so what lies just outside is drawn in and compressed without ever
 * folding back on itself, as at the edge of a lens. `vertical` scales the bend
 * across the long edges, so a wide capsule can keep the text along them legible.
 * `pad` adds a neutral margin, so the map can fill a filter region larger than
 * the capsule without any coordinates (engines disagree on feImage's units). A capsule is symmetric, so only the top-left quadrant is
 * computed and each value is mirrored into the other three, with X negated
 * across the vertical axis and Y across the horizontal one.
 */
export function refractionMap(width: number, height: number, { edge: edgeMax = 12, reach = .45, bend: strength = .44, profile = 'ridge' as 'ridge' | 'convex', vertical = 1, pad = 0 } = {}) {
  const canvas = document.createElement('canvas')
  const sw = Math.max(1, Math.ceil(width)), sh = Math.max(1, Math.ceil(height))
  const w = canvas.width = sw + pad * 2
  const h = canvas.height = sh + pad * 2
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(w, h)
  const radius = Math.min(sw, sh) / 2
  const edge = Math.min(edgeMax, radius * reach)
  const write = (x: number, y: number, r: number, g: number) => {
    const index = (y * w + x) * 4
    pixels.data[index] = r
    pixels.data[index + 1] = g
    pixels.data[index + 2] = 128
    pixels.data[index + 3] = 255
  }
  for (let y = 0; y < Math.ceil(h / 2); y++) for (let x = 0; x < Math.ceil(w / 2); x++) {
    // Distances from the centre, positive, for a pixel in the top-left quadrant.
    const ax = w / 2 - x - .5, ay = h / 2 - y - .5
    const qx = ax - sw / 2 + radius, qy = ay - sh / 2 + radius
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0)
    const length = Math.hypot(ox, oy)
    const depth = radius - length - Math.min(Math.max(qx, qy), 0)
    const band = depth > 0 && depth < edge ? depth / edge : 1
    const bend = band >= 1 ? 0 : (profile === 'convex' ? (1 - band) ** 2 : Math.sin(band * Math.PI)) * strength
    const nx = length ? ox / length * bend : 0, ny = length ? oy / length * bend * vertical : 0
    // Top-left points up and left (negative); its mirrors flip the sign of the axis they cross.
    const left = Math.round((.5 - nx) * 255), right = Math.round((.5 + nx) * 255)
    const up = Math.round((.5 - ny) * 255), down = Math.round((.5 + ny) * 255)
    write(x, y, left, up)
    write(w - 1 - x, y, right, up)
    write(x, h - 1 - y, left, down)
    write(w - 1 - x, h - 1 - y, right, down)
  }
  context.putImageData(pixels, 0, 0)
  return canvas.toDataURL()
}

/** App-owned optical treatment on Konsta controls, with a CSS blur fallback. */
export function LiquidGlassMaterial() {
  const svg = useRef<SVGSVGElement>(null)
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  useEffect(() => {
    const root = svg.current?.closest('.ios-prototype')
    const defs = svg.current?.querySelector('defs')
    if (!root || !defs) return
    const filters = new Map<HTMLElement, SVGFilterElement>()
    let sequence = 0, frame = 0
    const pending = new Set<HTMLElement>()
    const primitive = (name: string, attributes: Record<string, string>) => {
      const element = document.createElementNS(SVG_NS, name)
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
      return element
    }
    const update = (element: HTMLElement) => {
      const { width, height } = element.getBoundingClientRect()
      if (!width || !height) return
      let filter = filters.get(element)
      if (!filter) {
        filter = primitive('filter', { id: `${prefix}-glass-${sequence++}`, x: '0', y: '0', width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' }) as SVGFilterElement
        defs.append(filter)
        filters.set(element, filter)
      }
      filter.replaceChildren(
        primitive('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '3', result: 'softened' }),
        primitive('feImage', { href: refractionMap(width, height), x: '0', y: '0', width: String(width), height: String(height), preserveAspectRatio: 'none', result: 'rim' }),
        primitive('feDisplacementMap', { in: 'softened', in2: 'rim', scale: '14', xChannelSelector: 'R', yChannelSelector: 'G' }),
      )
      element.style.setProperty('--ios-glass-optics', `url("#${filter.id}")`)
    }
    const resize = new ResizeObserver(entries => {
      for (const entry of entries) pending.add(entry.target as HTMLElement)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => { for (const element of pending) update(element); pending.clear() })
    })
    const scan = () => {
      // Hidden routes stay observed and receive their map when they become visible.
      for (const element of root.querySelectorAll<HTMLElement>('.k-glass')) {
        if (!filters.has(element)) { resize.observe(element); update(element) }
      }
      for (const [element, filter] of filters) if (!root.contains(element)) {
        resize.unobserve(element); filter.remove(); filters.delete(element)
      }
    }
    scan()
    const mutations = new MutationObserver(records => {
      if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element && (node.matches('.k-glass') || node.querySelector('.k-glass'))))) scan()
    })
    mutations.observe(root, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect()
      for (const [element, filter] of filters) { element.style.removeProperty('--ios-glass-optics'); filter.remove() }
    }
  }, [prefix])
  return <svg ref={svg} className="ios-glass-filters" width="0" height="0" aria-hidden="true" focusable="false"><defs /></svg>
}
