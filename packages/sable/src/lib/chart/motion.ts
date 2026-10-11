/**
 * Chart motion, on the motion tokens only (each already carries
 * --motion-scale, so reduced motion completes every transition instantly).
 *
 * Two movements per mark:
 *   - arrival: the "out" pose (set by `[data-reveal=out]` on the ChartFrame)
 *     eases to rest once the chart is on screen — lines draw on, bars and
 *     areas rise from the baseline, slices and polygons grow from the centre;
 *   - morph: when the data changes, geometry eases from the old shape to the
 *     new one through a CSS `d` transition (Chromium, Firefox) — elsewhere it
 *     simply updates.
 * No recipe in styles.css animates `d` or flex-grow geometry, so these are
 * declared as `"custom"` in each chart's meta.motion.
 */

/** The draw-on length: two "slower" steps, so a long line does not whip across. */
export const DRAW_DURATION = "calc(var(--motion-duration-slower) * 1.8)"
const RISE = "var(--motion-duration-slower) var(--motion-ease-emphasized)"
const MORPH = "var(--motion-duration-slow) var(--motion-ease-standard)"

/** Stagger arrivals by position, scaled so reduced motion has no dead delay. */
export function stagger(index: number, stepMs = 35): string {
	return `calc(${Math.min(index, 24) * stepMs}ms * var(--motion-scale, 1))`
}

/** A stroked line that draws on and morphs (needs pathLength="1"). */
export function drawTransition(delay = "0ms"): string {
	return `stroke-dashoffset ${DRAW_DURATION} var(--motion-ease-decelerate) ${delay}, d ${MORPH}`
}

/** A filled shape that rises, fades and grows into place, and morphs. */
export function riseTransition(delay = "0ms"): string {
	return `scale ${RISE} ${delay}, opacity ${RISE} ${delay}, d ${MORPH}`
}

/** A geometry-only morph, for marks with no arrival of their own. */
export function morphTransition(): string {
	return `d ${MORPH}, opacity ${MORPH}, cx ${MORPH}, cy ${MORPH}`
}

/** `style.d` — React's CSSProperties does not list it, but it is a CSS property. */
export function pathStyle(d: string): Record<string, string> {
	return { d: `path("${d}")` }
}
