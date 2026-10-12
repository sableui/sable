/**
 * Depth: the shadow ladder a look writes. Sable has five elevation steps
 * (`--theme-shadow-sm`, `--theme-shadow`, `-md`, `-lg`, `-xl`); components pick
 * a step by role (a resting card, a popover, a dialog, the toast stack), so a
 * look never moves a component between steps. It changes what the steps look
 * like, with two settings:
 *
 *   style — the shape of a shadow. "Preset" keeps the preset's own; the others
 *           are recipes: Soft (Sable's layered drops), Crisp (short, tight,
 *           a little darker) and Offset (Poppy's hard, unblurred slab).
 *   depth — how far every step reaches, 0 (flat) – 100 (lifted). The middle is
 *           the shape as authored; lengths and alpha scale together on each
 *           side, so the ladder keeps its proportions at any depth.
 *
 * A preset's shadows are read from the browser (`box-shadow` computed on a
 * probe that carries the preset's selectors), so whatever a preset authored —
 * rgb, oklch, a 0-alpha flat shadow — arrives as px lengths and a colour.
 */

import { type Oklch, formatOklch, parseColor } from "./color"

export type ShadowStyle = "theme" | "soft" | "crisp" | "offset"

export const SHADOW_STEPS = ["sm", "base", "md", "lg", "xl"] as const
export type ShadowStep = (typeof SHADOW_STEPS)[number]

export interface ShadowLayer {
	inset: boolean
	x: number
	y: number
	blur: number
	spread: number
	color: Oklch
}

export type ShadowLadder = Record<ShadowStep, ShadowLayer[]>

/** The custom property a step is written to. */
export const shadowToken = (step: ShadowStep) => (step === "base" ? "--theme-shadow" : `--theme-shadow-${step}`)

/* ── Reading ──────────────────────────────────────────────────────────────── */

/** Split on commas that are not inside a colour function. */
function splitLayers(value: string): string[] {
	const out: string[] = []
	let depth = 0
	let start = 0
	for (let i = 0; i < value.length; i++) {
		const ch = value[i]
		if (ch === "(") depth++
		else if (ch === ")") depth--
		else if (ch === "," && depth === 0) {
			out.push(value.slice(start, i))
			start = i + 1
		}
	}
	out.push(value.slice(start))
	return out.map((layer) => layer.trim()).filter(Boolean)
}

/** Parse a computed `box-shadow` (colour first, px lengths, `inset` anywhere). */
export function parseShadow(value: string): ShadowLayer[] {
	if (!value || value === "none") return []
	const layers: ShadowLayer[] = []
	for (const raw of splitLayers(value)) {
		const inset = /\binset\b/.test(raw)
		const rest = raw.replace(/\binset\b/, "").trim()
		const colorMatch = rest.match(/[a-z-]+\([^)]*\)|#[\da-f]{3,8}\b|\btransparent\b/i)
		const color = colorMatch ? colorMatch[0] === "transparent" ? { l: 0, c: 0, h: 0, a: 0 } : parseColor(colorMatch[0]) : null
		const lengths = (colorMatch ? rest.replace(colorMatch[0], "") : rest).match(/-?[\d.]+(?=px\b)|(?<![\w.])0(?![\w.])/g)?.map(Number) ?? []
		if (!color || lengths.length < 2) continue
		const [x, y, blur = 0, spread = 0] = lengths
		layers.push({ inset, x, y, blur, spread, color })
	}
	return layers
}

/**
 * True when a preset is flat: Meridian and Prism. Judged by the floating steps
 * (md, lg, xl), since that is where depth shows: both flatten every step they
 * declare but not plain `--theme-shadow`, which falls back to styles.css's
 * soft default, and a check on every step called them shadowed.
 */
export const isFlat = (ladder: ShadowLadder) =>
	(["md", "lg", "xl"] as const).every((step) => ladder[step].every((layer) => layer.color.a < 0.005))

/**
 * A preset's shadow ladder in both modes. The probe declares the preset's own
 * selectors, so it reads the preset's values rather than the page's (or the
 * look's, which target :root and are switched off while the base is read).
 */
export function resolveShadows(themeId: string): { light: ShadowLadder; dark: ShadowLadder } {
	const read = (dark: boolean): ShadowLadder => {
		const probe = document.createElement("div")
		probe.setAttribute("data-sable-theme", themeId)
		probe.setAttribute("aria-hidden", "true")
		probe.className = dark ? "dark" : "light"
		probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none"
		const swatch = document.createElement("span")
		probe.appendChild(swatch)
		document.body.appendChild(probe)
		const ladder = {} as ShadowLadder
		for (const step of SHADOW_STEPS) {
			// A preset that leaves a step out inherits styles.css's fallback; reading
			// the token alone would call that step flat.
			swatch.style.boxShadow = `var(${shadowToken(step)}, ${FALLBACK[step]})`
			ladder[step] = parseShadow(getComputedStyle(swatch).boxShadow)
		}
		probe.remove()
		return ladder
	}
	return { light: read(false), dark: read(true) }
}

/** styles.css's fallbacks, for a preset that does not declare a step. */
const FALLBACK: Record<ShadowStep, string> = {
	sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
	base: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 3px 8px -2px rgb(0 0 0 / 0.08)",
	md: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 8px -2px rgb(0 0 0 / 0.06), 0 12px 24px -6px rgb(0 0 0 / 0.07)",
	lg: "0 2px 4px 0 rgb(0 0 0 / 0.04), 0 8px 16px -4px rgb(0 0 0 / 0.07), 0 24px 48px -12px rgb(0 0 0 / 0.11)",
	xl: "0 2px 4px 0 rgb(0 0 0 / 0.04), 0 12px 24px -6px rgb(0 0 0 / 0.08), 0 32px 64px -16px rgb(0 0 0 / 0.13)",
}

/* ── Recipes ──────────────────────────────────────────────────────────────── */

/** [x, y, blur, spread, alpha] — a drop in the shadow ink. */
type Drop = [number, number, number, number, number]
/** A top-edge highlight in white, for dark mode: light catching a raised edge. */
type Edge = { edge: number }
type RecipeStep = (Drop | Edge)[]

/**
 * Light and dark recipes per style. Dark mode needs far more alpha (black on
 * near-black barely registers) and, for the blurred styles, Sable's faint lit
 * top edge on floating surfaces, since depth there reads as light, not shade.
 */
const RECIPES: Record<Exclude<ShadowStyle, "theme">, Record<"light" | "dark", Record<ShadowStep, RecipeStep>>> = {
	// Sable's own ladder: a tight contact shadow plus one or two soft drops whose
	// offsets roughly double per step.
	soft: {
		light: {
			sm: [[0, 1, 2, 0, 0.05]],
			base: [[0, 1, 2, 0, 0.05], [0, 3, 8, -2, 0.08]],
			md: [[0, 1, 2, 0, 0.04], [0, 4, 8, -2, 0.06], [0, 12, 24, -6, 0.07]],
			lg: [[0, 2, 4, 0, 0.04], [0, 8, 16, -4, 0.07], [0, 24, 48, -12, 0.11]],
			xl: [[0, 2, 4, 0, 0.04], [0, 12, 24, -6, 0.08], [0, 32, 64, -16, 0.13]],
		},
		dark: {
			sm: [[0, 1, 2, 0, 0.3]],
			base: [[0, 1, 2, 0, 0.3], [0, 4, 10, -2, 0.4]],
			md: [{ edge: 0.04 }, [0, 1, 2, 0, 0.3], [0, 8, 20, -6, 0.45]],
			lg: [{ edge: 0.05 }, [0, 2, 4, 0, 0.3], [0, 20, 40, -12, 0.55]],
			xl: [{ edge: 0.05 }, [0, 2, 4, 0, 0.3], [0, 28, 56, -16, 0.6]],
		},
	},
	// Short reach and little blur, a touch darker: an object sitting just above
	// the page rather than floating over it. Reads as precise, UI-tool-like.
	crisp: {
		light: {
			sm: [[0, 1, 1, 0, 0.1]],
			base: [[0, 1, 2, 0, 0.12]],
			md: [[0, 1, 2, 0, 0.08], [0, 3, 6, -1, 0.12]],
			lg: [[0, 1, 2, 0, 0.08], [0, 5, 10, -2, 0.14]],
			xl: [[0, 2, 3, 0, 0.08], [0, 8, 16, -4, 0.16]],
		},
		dark: {
			sm: [[0, 1, 1, 0, 0.45]],
			base: [[0, 1, 2, 0, 0.5]],
			md: [{ edge: 0.05 }, [0, 1, 2, 0, 0.4], [0, 3, 6, -1, 0.5]],
			lg: [{ edge: 0.06 }, [0, 1, 2, 0, 0.4], [0, 5, 10, -2, 0.55]],
			xl: [{ edge: 0.06 }, [0, 2, 3, 0, 0.4], [0, 8, 16, -4, 0.6]],
		},
	},
	// Poppy's: a hard, unblurred slab down and to the right, the offset roughly
	// doubling per step. The ink is the preset's own hue, so it reads as a
	// printed shadow rather than grey.
	offset: {
		light: {
			sm: [[3, 3, 0, 0, 0.12]],
			base: [[4, 4, 0, 0, 0.13]],
			md: [[5, 5, 0, 0, 0.14]],
			lg: [[8, 8, 0, 0, 0.16]],
			xl: [[12, 12, 0, 0, 0.18]],
		},
		dark: {
			sm: [[3, 3, 0, 0, 0.5]],
			base: [[4, 4, 0, 0, 0.52]],
			md: [[5, 5, 0, 0, 0.55]],
			lg: [[8, 8, 0, 0, 0.6]],
			xl: [[12, 12, 0, 0, 0.65]],
		},
	},
}

/**
 * The shadow ink: the preset's own neutral hue, held just short of black in
 * light mode (Poppy's plum shadow, rather than grey on cream) and near-black in
 * dark mode. Chroma stays low, so a shadow tints but never reads as a colour.
 */
export function shadowInk(foreground: Oklch | undefined, mode: "light" | "dark"): Oklch {
	const h = foreground?.h ?? 0
	const c = Math.min(foreground?.c ?? 0, mode === "light" ? 0.05 : 0.03)
	return mode === "light" ? { l: 0.25, c, h, a: 1 } : { l: 0.08, c, h, a: 1 }
}

export function recipeLadder(style: Exclude<ShadowStyle, "theme">, mode: "light" | "dark", ink: Oklch): ShadowLadder {
	const ladder = {} as ShadowLadder
	for (const step of SHADOW_STEPS) {
		ladder[step] = RECIPES[style][mode][step].map((layer) =>
			"edge" in layer
				? { inset: true, x: 0, y: 1, blur: 0, spread: 0, color: { l: 1, c: 0, h: 0, a: layer.edge } }
				: { inset: false, x: layer[0], y: layer[1], blur: layer[2], spread: layer[3], color: { ...ink, a: layer[4] } },
		)
	}
	return ladder
}

/* ── Depth ────────────────────────────────────────────────────────────────── */

/**
 * How depth scales a ladder. 0 is flat; 50 is the shape as authored; 100
 * reaches 1.8× as far at 1.5× the alpha. Lengths and alpha move together, so a
 * shallower shadow is also a fainter one, the way a lower object casts it.
 */
export function depthFactors(depth: number): { length: number; alpha: number } {
	const t = Math.min(1, Math.max(0, depth / 100))
	return t <= 0.5 ? { length: t / 0.5, alpha: t / 0.5 } : { length: 1 + ((t - 0.5) / 0.5) * 0.8, alpha: 1 + ((t - 0.5) / 0.5) * 0.5 }
}

const roundHalf = (n: number) => Math.round(n * 2) / 2

export function scaleLadder(ladder: ShadowLadder, factors: { length: number; alpha: number }): ShadowLadder {
	const out = {} as ShadowLadder
	for (const step of SHADOW_STEPS) {
		out[step] = ladder[step].map((layer) => {
			const alpha = Math.min(0.9, layer.color.a * factors.alpha)
			// A lit edge is a 1px line: it fades with depth but never grows.
			if (layer.inset) return { ...layer, color: { ...layer.color, a: alpha } }
			return {
				...layer,
				x: roundHalf(layer.x * factors.length),
				y: roundHalf(layer.y * factors.length),
				blur: roundHalf(layer.blur * factors.length),
				spread: roundHalf(layer.spread * factors.length),
				color: { ...layer.color, a: alpha },
			}
		})
	}
	return out
}

/* ── Advanced anchors ─────────────────────────────────────────────────────── */

/** The drop that defines a ladder: the longest one on its top step (the toast's). */
export function definingDrop(ladder: ShadowLadder): ShadowLayer | null {
	const drops = ladder.xl.filter((layer) => !layer.inset && layer.color.a >= 0.005)
	if (!drops.length) return null
	return drops.reduce((a, b) => (Math.hypot(b.x, b.y) > Math.hypot(a.x, a.y) ? b : a))
}

/** How much blur each step gets when there is no distance to take a ratio from (a pure glow). */
const GLOW_WEIGHT: Record<ShadowStep, number> = { sm: 0.1, base: 0.2, md: 0.4, lg: 0.7, xl: 1 }

/**
 * The Advanced anchors, applied after the shape and Depth. Each is one number
 * set on the top step; every other step and layer follows in proportion, so
 * the ladder can be retuned but not broken (the same rule as the other
 * anchors). A set anchor wins over Depth for its own dimension.
 *
 *   distance — the top drop's offset length. Offsets, blur and spread scale
 *              together, so the shape keeps its softness.
 *   blur     — the top drop's blur. Every drop takes the same blur-to-distance
 *              ratio: 0 is a hard slab, and an Offset ladder can be softened.
 *   density  — how many layers of each drop to stack: an alpha `a` becomes
 *              1 − (1 − a)^k, the way tints darken when laid over each other.
 *              The caller solves k from the light-mode top drop, so the
 *              Opacity field is exact there; dark mode, whose alphas are
 *              already high, darkens in proportion instead of clipping.
 */
export function anchorLadder(
	ladder: ShadowLadder,
	anchors: { distance: number | null; blur: number | null; density: number | null },
): ShadowLadder {
	let out = ladder
	const top = () => definingDrop(out)
	const map = (fn: (layer: ShadowLayer, step: ShadowStep) => ShadowLayer) => {
		const next = {} as ShadowLadder
		for (const step of SHADOW_STEPS) next[step] = out[step].map((layer) => (layer.inset ? layer : fn(layer, step)))
		out = next
	}
	if (anchors.distance != null) {
		const length = top() ? Math.hypot(top()!.x, top()!.y) : 0
		if (length > 0.01) {
			const k = anchors.distance / length
			map((l) => ({ ...l, x: roundHalf(l.x * k), y: roundHalf(l.y * k), blur: roundHalf(l.blur * k), spread: roundHalf(l.spread * k) }))
		}
	}
	if (anchors.blur != null) {
		const drop = top()
		const length = drop ? Math.hypot(drop.x, drop.y) : 0
		if (length > 0.01) {
			const ratio = anchors.blur / length
			map((l) => ({ ...l, blur: roundHalf(Math.hypot(l.x, l.y) > 0.01 ? Math.hypot(l.x, l.y) * ratio : l.blur * ratio) }))
		} else {
			map((l, step) => ({ ...l, blur: roundHalf(anchors.blur! * GLOW_WEIGHT[step]) }))
		}
	}
	if (anchors.density != null) {
		const k = anchors.density
		map((l) => ({ ...l, color: { ...l.color, a: Math.min(0.95, 1 - (1 - l.color.a) ** k) } }))
	}
	return out
}

/** The density that takes alpha `from` to `to` (see anchorLadder). */
export function densityFor(from: number, to: number): number | null {
	if (from <= 0.001 || from >= 0.999) return null
	return Math.log(1 - Math.min(0.95, to)) / Math.log(1 - from)
}

/* ── Light angle ──────────────────────────────────────────────────────────── */

/*
 * Photoshop's convention: the angle the light comes FROM, counter-clockwise
 * from the right. 90° is overhead, so shadows fall straight down (Soft); 135°
 * is top-left, so they fall down and to the right (Poppy's Offset). The shadow
 * travels opposite the light: dx = -cos θ, dy = sin θ (screen y points down).
 */

const RAD = Math.PI / 180

/** The light angle a ladder already casts at, from its longest drop. null when it casts none. */
export function ladderAngle(ladder: ShadowLadder): number | null {
	let longest: ShadowLayer | null = null
	for (const step of SHADOW_STEPS) {
		for (const layer of ladder[step]) {
			if (layer.inset || layer.color.a < 0.005) continue
			if (!longest || Math.hypot(layer.x, layer.y) > Math.hypot(longest.x, longest.y)) longest = layer
		}
	}
	if (!longest || Math.hypot(longest.x, longest.y) < 0.01) return null
	return Math.round(((Math.atan2(longest.y, -longest.x) / RAD) % 360 + 360) % 360)
}

/**
 * Turn every drop to fall away from a light at `angle`, keeping its length:
 * depth sets how far a shadow reaches, the angle only where it points. A lit
 * edge stays on top (it is where the light catches, whatever its direction),
 * and a drop with no offset, a pure halo, has no direction to turn.
 */
export function rotateLadder(ladder: ShadowLadder, angle: number): ShadowLadder {
	const dx = -Math.cos(angle * RAD)
	const dy = Math.sin(angle * RAD)
	const out = {} as ShadowLadder
	for (const step of SHADOW_STEPS) {
		out[step] = ladder[step].map((layer) => {
			if (layer.inset) return layer
			const length = Math.hypot(layer.x, layer.y)
			return length < 0.01 ? layer : { ...layer, x: roundHalf(dx * length), y: roundHalf(dy * length) }
		})
	}
	return out
}

/** A step's longest drop as "x, y · blur", for the Advanced readout. */
export function describeStep(layers: ShadowLayer[]): string {
	const drops = layers.filter((layer) => !layer.inset && layer.color.a >= 0.005)
	if (!drops.length) return "Flat"
	const longest = drops.reduce((a, b) => (Math.hypot(b.x, b.y) > Math.hypot(a.x, a.y) ? b : a))
	const n = (v: number) => (Object.is(v, -0) ? 0 : v)
	return `${n(longest.x)}, ${n(longest.y)} · ${longest.blur}px`
}

/** A step as CSS. A step with nothing visible is written the way flat presets write it: no offset, transparent. */
export function formatShadow(layers: ShadowLayer[]): string {
	const visible = layers.filter((layer) => layer.color.a >= 0.005)
	// design-lint-disable-next-line inline-color -- the shadow formatter writes the flat value Meridian and Prism ship; it is exported as a theme token
	if (!visible.length) return "0 0 #0000"
	return visible
		.map((layer) => {
			const lengths = [layer.x, layer.y, layer.blur, layer.spread].map((n) => (n === 0 ? "0" : `${n}px`)).join(" ")
			return `${layer.inset ? "inset " : ""}${lengths} ${formatOklch(layer.color)}`
		})
		.join(", ")
}
