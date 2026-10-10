import { useEffect, useId, useRef } from 'react'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** A neutral center with a curved displacement profile only near the capsule rim. */
function refractionMap(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width)
  canvas.height = Math.ceil(height)
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(canvas.width, canvas.height)
  const radius = Math.min(width, height) / 2
  const edge = Math.min(12, radius * .45)
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const dx = x + .5 - width / 2, dy = y + .5 - height / 2
    const qx = Math.abs(dx) - width / 2 + radius
    const qy = Math.abs(dy) - height / 2 + radius
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0)
    const length = Math.hypot(ox, oy)
    const depth = radius - length - Math.min(Math.max(qx, qy), 0)
    const bend = depth > 0 && depth < edge ? Math.sin(depth / edge * Math.PI) * .44 : 0
    const nx = length ? Math.sign(dx) * ox / length : 0
    const ny = length ? Math.sign(dy) * oy / length : 0
    const index = (y * canvas.width + x) * 4
    pixels.data[index] = Math.round((.5 + nx * bend) * 255)
    pixels.data[index + 1] = Math.round((.5 + ny * bend) * 255)
    pixels.data[index + 2] = 128
    pixels.data[index + 3] = 255
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
