"use client";

import { type ComponentProps, useEffect, useRef } from "react"
import { cn } from "../../lib/cn"
import { type ArtVariant, type Rgba, artSupported, cssColorToRgba, onArtInvalidate, onThemeChange, paintArt } from "./renderer"

/** The decorative tones art can be painted from — the palette's `--tone-*` family. */
export type ArtTone = "info" | "standard" | "collectible" | "edition" | "warning"

/**
 * The theme's art palette (ART_TOKENS): each preset paints its own — Ember's
 * fire, Prism's airbrushed pastels, Meridian's grainy monochrome. Unset slots
 * are transparent and skipped.
 */
const ART_SLOTS = ["var(--art-1)", "var(--art-2)", "var(--art-3)", "var(--art-4)", "var(--art-5)", "var(--art-6)"]
const ART_GROUND = "var(--art-ground)"

/**
 * A tone as art paints it when `tones` overrides the theme's palette: lifted
 * and a touch more saturated than the token, the same recipe the default
 * --art-* tokens use. Every colour string feeds both the CSS fallback and the
 * shader, so the fade from one to the other never shifts colour.
 */
// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
const lifted = (tone: ArtTone) => `oklch(from var(--tone-${tone}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h)`
/**
 * The ground: the brand, steeped in the first tone's hue. A near-black primary
 * (Sable's own) painted as-is put a black streak through the mesh and turned
 * every warm tone it touched to olive; steeped, it is a deep shade of the
 * palette, and a chromatic brand still reads as itself.
 */
// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own tokens, so it follows every look
const ground = (tone: ArtTone) => `color-mix(in oklab, var(--primary) 55%, oklch(from var(--tone-${tone}) 0.3 c h))`

/** A seed as 0–1: a number is taken mod 1 after scaling; a string is hashed (FNV-1a). */
function seedValue(seed: string | number | undefined): number {
	if (seed == null) return 0.37
	if (typeof seed === "number") return Math.abs(seed * 0.618034) % 1
	let hash = 2166136261
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i)
		hash = Math.imul(hash, 16777619)
	}
	return (hash >>> 0) / 4294967296
}

/**
 * The CSS stand-in: radial spots of the palette over the ground, placed around
 * the box by the seed. It is what prerendered HTML, a browser without WebGL2
 * and the first frame all show, and it stays underneath the shader.
 */
function fallback(palette: readonly string[], groundColor: string, seed: number): string {
	const spots = palette.map((color, i) => {
		const angle = (seed + i / palette.length) * Math.PI * 2
		const x = Math.round(50 + Math.cos(angle) * 38)
		const y = Math.round(50 + Math.sin(angle) * 38)
		return `radial-gradient(in oklab at ${x}% ${y}%, ${color}, transparent 60%)`
	})
	return [...spots, groundColor].join(", ")
}

/**
 * Which colour leads, from the seed. The mesh pins each colour to a spot by its
 * index, so with a fixed order every seed got the same colour in the same
 * place and a row of avatars came out as one family of near-twins. Rotating
 * the palette by the seed hands each item its own leading colour.
 */
function rotate<T>(items: readonly T[], seed: number): T[] {
	if (items.length < 2) return [...items]
	const shift = Math.floor(seed * 7919) % items.length
	return [...items.slice(shift), ...items.slice(0, shift)]
}

/** A 0–1 art parameter from the element's cascade, or its default when unset. */
function param(style: CSSStyleDeclaration, name: string, fallbackValue: number): number {
	const n = Number.parseFloat(style.getPropertyValue(name))
	return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallbackValue
}

/** Keep a shader frame under ~1.5M pixels, whatever the box and screen. */
const MAX_PIXELS = 1_500_000

export interface GradientArtProps extends ComponentProps<"div"> {
	/**
	 * `mesh` (default) — soft spots of colour pulled together by gentle waves
	 * (Paper's static mesh gradient). `grain` — glowing light over deep corners
	 * with a printed, grainy texture (Paper's grain gradient).
	 */
	variant?: ArtVariant
	/**
	 * Paint these `--tone-*` colours instead of the theme's art palette. Leave it
	 * unset to follow the preset's own art direction (the --art-* tokens).
	 */
	tones?: readonly ArtTone[]
	/**
	 * Fixes the composition: the same seed paints the same art in every theme.
	 * Pass a stable id — a name for an avatar, a title for a cover — so each
	 * item keeps its own look across renders and reloads.
	 */
	seed?: string | number
}

/**
 * GradientArt — placeholder artwork painted from the theme's art direction:
 * the --art-* tokens (colours, ground, warp, softness, grain), which each
 * preset sets for itself and which default to the decorative tones over the
 * brand. It follows every preset, mode and live edit, the way a CSS gradient
 * would, with a shader's depth.
 *
 * It renders a CSS gradient first (prerendered HTML, no WebGL2, the first
 * frame) and fades the shader in over it once painted. The shader is static:
 * it paints on mount, on resize and when the theme changes, through one WebGL
 * context shared by every instance, so a page of avatars costs one context.
 * Off-screen instances wait until they are near the viewport.
 *
 * Children render above the art: initials, a play glyph, a caption.
 */
export function GradientArt({ variant = "mesh", tones, seed, className, style, children, ...props }: GradientArtProps) {
	const root = useRef<HTMLDivElement>(null)
	const canvas = useRef<HTMLCanvasElement>(null)
	const probes = useRef<HTMLSpanElement>(null)
	const value = seedValue(seed)
	const palette = tones?.length ? tones.map(lifted) : ART_SLOTS
	const groundColor = tones?.length ? ground(tones[0]) : ART_GROUND
	const paletteKey = palette.join(" ")
	const background = fallback(rotate(palette, value), groundColor, value)

	useEffect(() => {
		const element = root.current
		const target = canvas.current
		const swatches = probes.current
		if (!element || !target || !swatches || !artSupported()) return
		if (typeof IntersectionObserver === "undefined" || typeof ResizeObserver === "undefined") return
		let visible = false
		let frame = 0
		let last = ""

		const paint = () => {
			frame = 0
			if (!visible) return
			const rect = element.getBoundingClientRect()
			if (!rect.width || !rect.height) return
			let ratio = Math.min(window.devicePixelRatio || 1, 2)
			const pixels = rect.width * rect.height * ratio * ratio
			if (pixels > MAX_PIXELS) ratio *= Math.sqrt(MAX_PIXELS / pixels)
			const width = Math.max(1, Math.round(rect.width * ratio))
			const height = Math.max(1, Math.round(rect.height * ratio))
			// Resolved here, in this element's cascade, so a scoped preset paints its own art.
			const resolve = (probe: Element) => cssColorToRgba(getComputedStyle(probe).color)
			const [groundProbe, ...colorProbes] = Array.from(swatches.children)
			// An unset art slot is transparent: skip it rather than paint a hole.
			const colors = rotate(
				colorProbes.map(resolve).filter((c): c is Rgba => c != null && c[3] > 0.01),
				value,
			)
			const groundRgba = groundProbe ? resolve(groundProbe) : null
			if (!colors.length) return
			const own = getComputedStyle(element)
			const character = { warp: param(own, "--art-warp", 0.8), softness: param(own, "--art-softness", 0.88), grain: param(own, "--art-grain", 0) }
			const key = JSON.stringify([variant, value, width, height, colors, groundRgba, character])
			if (key === last) return
			// Grain lays its bands over the ground. Mesh paints only the palette:
			// every colour there is a spot of equal weight, and a dark ground as one
			// of them cut a streak through the field. A theme that wants dark in its
			// mesh (Ember's falloff into black) puts it in the palette on purpose.
			const ordered = variant === "grain" && groundRgba ? [groundRgba, ...colors] : colors
			if (paintArt(target, { variant, colors: ordered, seed: value, width, height, pixelRatio: ratio, ...character })) {
				last = key
				target.dataset.painted = ""
			}
		}
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(paint)
		}
		const repaint = () => {
			last = ""
			schedule()
		}

		const intersection = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting
				if (visible) schedule()
			},
			{ rootMargin: "200px" },
		)
		intersection.observe(element)
		const resize = new ResizeObserver(schedule)
		resize.observe(element)
		const offTheme = onThemeChange(schedule)
		const offInvalidate = onArtInvalidate(repaint)
		return () => {
			cancelAnimationFrame(frame)
			intersection.disconnect()
			resize.disconnect()
			offTheme()
			offInvalidate()
		}
	}, [variant, value, paletteKey])

	return (
		<div
			ref={root}
			data-slot="gradient-art"
			data-variant={variant}
			className={cn("relative isolate overflow-hidden", className)}
			style={{ background, ...style }}
			{...props}
		>
			{/* Behind the children (isolate makes the negative z stay inside), over the fallback. */}
			<canvas
				ref={canvas}
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 size-full opacity-0 motion-interactive data-[painted]:opacity-100"
				style={{ transitionProperty: "opacity" }}
			/>
			{/* The colours the shader paints, resolved by the browser in this element's cascade. */}
			<span ref={probes} hidden>
				<span style={{ color: groundColor }} />
				{palette.map((color) => (
					<span key={color} style={{ color }} />
				))}
			</span>
			{children}
		</div>
	)
}
GradientArt.displayName = "GradientArt"
