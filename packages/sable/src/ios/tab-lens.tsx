import { createContext, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { useMotionLevel } from '../motion/MotionProvider'
import { refractionMap } from './liquid-glass'

/**
 * The tab bar's selection lens. iOS 26 draws the selected tab as a pill that
 * becomes a liquid lens while you press or drag it across the bar.
 *
 * A backdrop-filter can't refract in Safari or Firefox, so the lens refracts a
 * copy of the tabs it owns, drawn in their selected colour, instead of whatever
 * is behind the bar. An SVG `filter` on its own content works in every engine.
 * The real tabs stay where they are, keep focus and clicks, and are masked out
 * under the lens so the highlighted copy reads through it.
 *
 * At rest the lens is a flat pill, as on iOS: the refracted copy fades in only
 * while the lens is lifted (pressed, dragged, or travelling), and the filter
 * isn't drawn at all otherwise. Its long edges bend about a third as much as its
 * rounded ends, so the labels along them stay legible. The displacement map only changes with the
 * lens's size; moving and squishing it are transforms, so dragging never
 * rebuilds the filter.
 */

/** True inside the lens: an IosTab renders a non-interactive copy of itself. */
export const TabLensCopy = createContext(false)

/** Extra room around the lens so rim pixels can sample content just outside it. */
const BLEED = 16
/** Displacement scale, in px; the map bends at most about a third of it, at the rim of a 12px band. */
const REFRACTION = 16
/** How far apart the red, green and blue passes bend, as a fraction of REFRACTION. */
const CHROMA = .12
/** Lens inset inside its tab: the pill's former `inset: 5px 6px`. */
const INSET_X = 6, INSET_Y = 5
/** Scale while pressed or dragged. The box grows by this; what it shows only by a third as much. */
const PRESSED = 1.18
const MAGNIFY = .3
/** Spring integration step: fixed, so a long frame can't throw the lens off the bar. */
const STEP = 1 / 240

type Tab = { el: HTMLElement; center: number }

export function TabLens({ children }: { children: ReactNode }) {
  const lens = useRef<HTMLSpanElement>(null)
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [map, setMap] = useState<{ id: string; href: string; width: number; height: number } | null>(null)
  // Motion policy (provider, scope, and the OS setting through them), read by the
  // effect's frame loop without restarting it.
  const motion = useMotionLevel()
  const motionEnabled = useRef(motion.enabled)
  useEffect(() => { motionEnabled.current = motion.enabled }, [motion.enabled])

  useEffect(() => {
    const element = lens.current
    const row = element?.parentElement
    const copies = element ? [...element.querySelectorAll<HTMLElement>('.native-tab-lens-row')] : []
    if (!element || !row || !copies.length) return
    const app = row.closest<HTMLElement>('.ios-prototype')

    let tabs: Tab[] = []
    let width = 0, height = 0, y = 0
    let version = 0
    // Spring state: x is the lens centre, s its scale; v* are velocities.
    let x = 0, vx = 0, s = 1, vs = 0
    let targetX = 0, pressed = false, placed = false
    let frame = 0, last = 0, lifted = false

    const still = () => !motionEnabled.current || app?.hasAttribute('data-reduced-motion')
    const realTabs = () => [...row.children].filter((child): child is HTMLElement => child !== element && child.matches('button, a'))
    const activeTab = () => tabs.find(tab => tab.el.getAttribute('aria-current') === 'page')

    const apply = () => {
      // A fast lens stretches along its travel and thins a little, like a drop.
      const stretch = Math.min(Math.abs(vx) / 5000, .08)
      const sx = s * (1 + stretch), sy = s * (1 - stretch * .5)
      const glow = Math.min(1, Math.max(0, (s - 1) / (PRESSED - 1)))
      // The copy inside is scaled back down, so a lifted lens is a bigger window
      // over gently magnified tabs, and their labels clear the rim band.
      const magnify = 1 + (s - 1) * MAGNIFY
      row.style.setProperty('--lens-x', `${x}px`)
      row.style.setProperty('--lens-sx', String(sx))
      row.style.setProperty('--lens-sy', String(sy))
      row.style.setProperty('--lens-kx', String(magnify / sx))
      row.style.setProperty('--lens-ky', String(magnify / sy))
      row.style.setProperty('--lens-glow', String(glow))
      // Lifted (pressed, or travelling) is when the lens refracts. It switches with a short
      // fade, with some hysteresis, rather than tracking speed: two copies half-faded
      // into each other read as a double image.
      const lift = lifted ? glow > .05 || Math.abs(vx) > 20 : glow > .15 || Math.abs(vx) > 80
      if (lift !== lifted) { lifted = lift; row.toggleAttribute('data-lens-lifted', lifted) }
    }

    const measure = () => {
      tabs = realTabs().map(el => ({ el, center: el.offsetLeft + el.offsetWidth / 2 }))
      const reference = activeTab() ?? tabs[0]
      if (!reference) return
      const nextWidth = Math.max(0, reference.el.offsetWidth - INSET_X * 2)
      const nextHeight = Math.max(0, reference.el.offsetHeight - INSET_Y * 2)
      y = reference.el.offsetTop + reference.el.offsetHeight / 2
      // Each tab's content is masked where the lens covers it; it needs its own offset in the row.
      for (const tab of tabs) {
        const content = tab.el.firstElementChild as HTMLElement | null
        if (!content) continue
        content.style.setProperty('--tab-x', `${tab.el.offsetLeft + content.offsetLeft}px`)
        content.style.setProperty('--tab-y', `${tab.el.offsetTop + content.offsetTop}px`)
      }
      const style = getComputedStyle(row)
      for (const copy of copies) {
        copy.style.width = `${row.clientWidth}px`
        copy.style.height = `${row.clientHeight}px`
        copy.style.padding = style.padding
      }
      row.style.setProperty('--lens-y', `${y}px`)
      row.style.setProperty('--lens-w', `${nextWidth}px`)
      row.style.setProperty('--lens-h', `${nextHeight}px`)
      row.style.setProperty('--lens-shape', `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${nextWidth} ${nextHeight}'><rect width='${nextWidth}' height='${nextHeight}' rx='${Math.min(nextWidth, nextHeight) / 2}'/></svg>`,
      )}")`)
      if (nextWidth && nextHeight && (nextWidth !== width || nextHeight !== height)) {
        width = nextWidth; height = nextHeight
        // Safari caches a filter's output by its id, so a new map gets a new id.
        setMap({ id: `${prefix}-lens-${version++}`, href: refractionMap(width, height, { edge: 12, bend: .45, profile: 'convex', vertical: .35, pad: BLEED }), width, height })
      }
      targetX = activeTab()?.center ?? targetX
      if (!placed) { x = targetX; placed = true; row.setAttribute('data-lens', '') }
      apply()
    }

    const step = (time: number) => {
      const elapsed = Math.min((time - (last || time)) / 1000, 1 / 20)
      last = time
      if (still()) {
        x = targetX; vx = 0; s = 1; vs = 0
      } else {
        // Slightly underdamped: the lens overshoots a touch and settles, like liquid.
        const k = pressed ? 900 : 420, damping = pressed ? 52 : 30
        for (let t = 0; t < elapsed; t += STEP) {
          vx += ((targetX - x) * k - vx * damping) * STEP
          x += vx * STEP
          vs += (((pressed ? PRESSED : 1) - s) * 600 - vs * 34) * STEP
          s += vs * STEP
        }
      }
      apply()
      const resting = Math.abs(targetX - x) < .1 && Math.abs(vx) < 1 && Math.abs((pressed ? PRESSED : 1) - s) < .001 && Math.abs(vs) < .01
      if (resting) { frame = 0; last = 0 } else frame = requestAnimationFrame(step)
    }
    const kick = () => { if (!frame) frame = requestAnimationFrame(step) }
    const settle = () => { targetX = activeTab()?.center ?? targetX; kick() }

    // A drag across the bar moves the lens; releasing picks the tab under it.
    let pointer: { id: number; start: number; dragging: boolean } | null = null
    let swallowClick = false
    const rowX = (clientX: number) => {
      const rect = row.getBoundingClientRect()
      const scale = rect.width / row.offsetWidth || 1
      return (clientX - rect.left) / scale - row.clientLeft
    }
    const clampX = (value: number) => tabs.length ? Math.min(Math.max(value, tabs[0].center), tabs[tabs.length - 1].center) : value
    const nearest = () => tabs.reduce<Tab | undefined>((best, tab) => !best || Math.abs(tab.center - x) < Math.abs(best.center - x) ? tab : best, undefined)

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return
      const tab = tabs.find(item => item.el.contains(event.target as Node))
      if (!tab) return
      pointer = { id: event.pointerId, start: rowX(event.clientX), dragging: false }
      pressed = true
      targetX = tab.center
      kick()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return
      const at = rowX(event.clientX)
      if (!pointer.dragging && Math.abs(at - pointer.start) > 8) {
        pointer.dragging = true
        row.setPointerCapture(event.pointerId)
      }
      if (pointer.dragging) { targetX = clampX(at); kick() }
    }
    const onPointerUp = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return
      const dragged = pointer.dragging
      pointer = null
      pressed = false
      if (dragged) {
        // Select by clicking the tab, so the app's own handler runs, then swallow
        // the browser's click on the row that follows the pointerup.
        nearest()?.el.click()
        swallowClick = true
        setTimeout(() => { swallowClick = false })
      }
      settle()
    }
    const onPointerCancel = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return
      pointer = null; pressed = false; settle()
    }
    const onClickCapture = (event: MouseEvent) => {
      if (swallowClick && event.isTrusted) { event.preventDefault(); event.stopPropagation(); swallowClick = false }
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(row)
    // The app owns the selection: follow aria-current however it changes (tap, keyboard, code).
    const selection = new MutationObserver(settle)
    selection.observe(row, { attributes: true, attributeFilter: ['aria-current'], subtree: true })
    const membership = new MutationObserver(() => { measure(); for (const tab of tabs) resize.observe(tab.el) })
    membership.observe(row, { childList: true })
    for (const tab of tabs) resize.observe(tab.el)
    row.addEventListener('pointerdown', onPointerDown)
    row.addEventListener('pointermove', onPointerMove)
    row.addEventListener('pointerup', onPointerUp)
    row.addEventListener('pointercancel', onPointerCancel)
    row.addEventListener('click', onClickCapture, true)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect(); selection.disconnect(); membership.disconnect()
      row.removeEventListener('pointerdown', onPointerDown)
      row.removeEventListener('pointermove', onPointerMove)
      row.removeEventListener('pointerup', onPointerUp)
      row.removeEventListener('pointercancel', onPointerCancel)
      row.removeEventListener('click', onClickCapture, true)
      row.removeAttribute('data-lens'); row.removeAttribute('data-lens-lifted')
      for (const name of ['--lens-x', '--lens-y', '--lens-w', '--lens-h', '--lens-sx', '--lens-sy', '--lens-kx', '--lens-ky', '--lens-glow', '--lens-shape']) row.style.removeProperty(name)
    }
  }, [prefix])

  const chroma = (amount: number) => REFRACTION * (1 + amount * CHROMA)
  return (
    <span ref={lens} className="native-tab-lens" aria-hidden="true" inert>
      {map ? (
        <svg className="ios-glass-filters" width="0" height="0" focusable="false">
          <defs>
            {/* The map carries its own neutral margin and fills the whole region, so it lines up in every engine. */}
            <filter id={map.id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feImage href={map.href} preserveAspectRatio="none" result="map" />
              {/* One bend per channel, each a little stronger: a faint colour fringe at the rim. */}
              <feDisplacementMap in="SourceGraphic" in2="map" scale={chroma(0)} xChannelSelector="R" yChannelSelector="G" result="bentRed" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={chroma(1)} xChannelSelector="R" yChannelSelector="G" result="bentGreen" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={chroma(2)} xChannelSelector="R" yChannelSelector="G" result="bentBlue" />
              <feColorMatrix in="bentRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              <feColorMatrix in="bentGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              <feColorMatrix in="bentBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              <feBlend in="red" in2="green" mode="screen" result="redGreen" />
              <feBlend in="redGreen" in2="blue" mode="screen" />
            </filter>
          </defs>
        </svg>
      ) : null}
      <TabLensCopy.Provider value>
        {/* At rest: the copy, flat. Lifted: the same copy through the filter, faded in over it. */}
        <span className="native-tab-lens-row">{children}</span>
        <span className="native-tab-lens-optics" style={map ? { filter: `url("#${map.id}")` } : undefined}>
          <span className="native-tab-lens-row">{children}</span>
        </span>
      </TabLensCopy.Provider>
    </span>
  )
}
