import { cn } from "@sableui/react"
import { cloneElement, type Ref, useEffect, useId, useImperativeHandle, useMemo, useRef } from "react"
import { hrefFor } from "../lib/router"
import { LOGO, LOGO_TIMING } from "./sable-logo-geometry"

/**
 * The Sable logo: the paired-form S, which turns into the sable profile on
 * hover or keyboard focus. Brand, not library — it lives in the docs app.
 *
 * Geometry from the brand handoff ("Sable / refined profile"). The motion is
 * re-choreographed from the handoff's single simultaneous morph, which went
 * lumpy mid-way: the ear sprouted from frame one, and the second S form
 * dissolved into the neck as a separate blob. Here the end states are
 * identical, only the path between them changes:
 * - Staged: the head forms (0–0.8), the second form is absorbed into the neck
 *   early (0–0.55, shrinking so it stays tucked inside), the ear grows as its
 *   own shape (0.58–0.92) with a small overshoot, and the eye opens last.
 * - The ear is lifted out of the head outline, so the skull morphs as one
 *   smooth curve and the ear is added on top.
 * - Easing is on TIME, not shape: an ease-out from wherever it is, in both
 *   directions, so it starts quickly and lands softly entering and leaving.
 *
 * Production behaviour, as the handoff asks:
 * - It is the home LINK. Hover and focus reveal; a click just navigates; a
 *   touch tap navigates without animating. Accessible name: "Sable home".
 * - Timing scales by --motion-scale, read from the logo's element each time
 *   it moves, so prefers-reduced-motion, the in-app motion toggle and the
 *   Customize motion slider all apply. Scale 0 snaps to the end state.
 * - Frames write SVG attributes through refs, not React state.
 * - The first render draws the S at rest: the static mark without JavaScript.
 *
 * `SableMark` is the same drawing without the link, driven from outside
 * through its handle — the homepage intro plays it at full size.
 */

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const smooth = (x: number) => {
	const t = clamp(x)
	return t * t * (3 - 2 * t)
}
const easeOut = (x: number) => 1 - (1 - clamp(x)) ** 3
/** A gentle overshoot (≈6%) that settles at 1 — for the ear's pop only. */
const backOut = (x: number) => {
	const t = clamp(x)
	const c = 1.2
	return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
}
const win = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const toPath = (v: readonly number[]) =>
	`M${v[0]} ${v[1]} ${Array.from({ length: (v.length - 2) / 6 }, (_, i) => `C${v.slice(2 + i * 6, 8 + i * 6).join(" ")}`).join(" ")} Z`
const lerp = (a: readonly number[], b: readonly number[], t: number) => a.map((n, i) => n + (b[i] - n) * t)
const scaleAbout = (x: number, y: number, s: number) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`

/** The head WITHOUT its ear: the ear loop (segments 3–4, 10.7,5.1 → 7.2,6)
 *  becomes a smooth skull line between the same two points. */
const HEAD_END = (() => {
	const head: number[] = [...LOGO.ends[0]]
	const seg = (k: number) => 2 + 6 * (k - 1)
	head.splice(seg(3), 6, 10.0, 5.1, 9.45, 5.2, 8.95, 5.38)
	head.splice(seg(4), 6, 8.45, 5.56, 7.8, 5.75, 7.2, 6.0)
	return head
})()
/** The second form's end circle, shrunk to 60% about its centre so it stays
 *  inside the neck while the neck is still forming. */
const TAIL_END = LOGO.ends[1].map((v, i) => (i % 2 === 0 ? 8.65 + (v - 8.65) * 0.6 : 17.7 + (v - 17.7) * 0.6))
/** The ear on its own, closed through the skull so it overlaps the head. */
const EAR = "M10.7 5.1 C11.1 3.2 9.8 1.5 7.8 1.8 C5.8 2.1 5.4 4.8 7.2 6 C8.2 6.7 10.4 6.3 10.7 5.1 Z"
const EAR_BASE = [8.95, 5.55] as const

function motionScale(el: Element): number {
	const raw = Number.parseFloat(getComputedStyle(el).getPropertyValue("--motion-scale"))
	return Number.isFinite(raw) ? Math.max(0, raw) : 1
}

/** The morph engine: drawing refs plus an interruptible animation toward S (0)
 *  or the profile (1). One per rendered mark. */
function useMorph() {
	const svgRef = useRef<SVGSVGElement>(null)
	const headRef = useRef<SVGPathElement>(null)
	const tailRef = useRef<SVGPathElement>(null)
	const earRef = useRef<SVGPathElement>(null)
	const eyeRef = useRef<SVGCircleElement>(null)
	const state = useRef({ progress: 0, raf: 0, done: () => {} })

	const engine = useRef({
		draw() {
			const p = state.current.progress
			headRef.current?.setAttribute("d", toPath(lerp(LOGO.starts[0], HEAD_END, smooth(win(p, 0, 0.8)))))
			tailRef.current?.setAttribute("d", toPath(lerp(LOGO.starts[1], TAIL_END, smooth(win(p, 0, 0.55)))))
			earRef.current?.setAttribute("transform", scaleAbout(EAR_BASE[0], EAR_BASE[1], backOut(win(p, 0.58, 0.92))))
			eyeRef.current?.setAttribute("r", String(LOGO.eye[2] * smooth(win(p, 0.74, 1))))
		},
		/** Resolves when the mark arrives, or when a later call interrupts it. */
		animate(target: 0 | 1): Promise<void> {
			const s = state.current
			cancelAnimationFrame(s.raf)
			s.done()
			const from = s.progress
			const base = target === 1 ? LOGO_TIMING.entrance : LOGO_TIMING.entrance * LOGO_TIMING.exitRatio
			const ms = base * (svgRef.current ? motionScale(svgRef.current) : 1) * Math.abs(target - from)
			return new Promise((resolve) => {
				s.done = resolve
				if (ms < 1) {
					s.progress = target
					engine.current.draw()
					resolve()
					return
				}
				const start = performance.now()
				const frame = (now: number) => {
					const t = clamp((now - start) / ms)
					s.progress = from + (target - from) * easeOut(t)
					engine.current.draw()
					if (t < 1) s.raf = requestAnimationFrame(frame)
					else resolve()
				}
				s.raf = requestAnimationFrame(frame)
			})
		},
		stop() {
			cancelAnimationFrame(state.current.raf)
		},
	})
	// biome-ignore lint/correctness/useExhaustiveDependencies: refs and the engine are stable
	return useMemo(() => ({ svgRef, headRef, tailRef, earRef, eyeRef, engine: engine.current }), [])
}

function Mark({ morph, className }: { morph: ReturnType<typeof useMorph>; className?: string }) {
	const maskId = `sable-logo-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`
	return (
		<svg ref={morph.svgRef} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={cn("shrink-0", className)}>
			<defs>
				{/* The eye is real transparency (white keeps, black cuts), so the
				    profile sits right on any surface. */}
				<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
					<rect width="24" height="24" fill="white" />
					<circle ref={morph.eyeRef} cx={LOGO.eye[0]} cy={LOGO.eye[1]} r={0} fill="black" />
				</mask>
			</defs>
			<g fill="currentColor" mask={`url(#${maskId})`}>
				<path ref={morph.headRef} d={toPath(LOGO.starts[0])} />
				<path ref={morph.tailRef} d={toPath(LOGO.starts[1])} />
				<path ref={morph.earRef} d={EAR} transform={scaleAbout(EAR_BASE[0], EAR_BASE[1], 0)} />
			</g>
		</svg>
	)
}

export interface SableMarkHandle {
	/** Trace the S as a technical drawing — construction guides, then the
	 *  outline — and fill it in. Only meaningful on an `outlined` mark. */
	drawIn: () => Promise<void>
	/** Morph toward the S (0) or the profile (1). */
	play: (target: 0 | 1) => Promise<void>
	element: () => SVGSVGElement | null
}

/** Construction geometry for the drawing, measured from the S rather than laid
 *  over it: circles fitted to each arc of LOGO.starts[0] (all within 0.03
 *  units), and turned 180° about the centre for the second form, which is the
 *  first one turned. Arcs run a little past where the outline leaves them. */
const ARCS = {
	/** The long top sweep (segments 0–2). */
	top: { c: [13.15, 14.37], r: 11.55, from: -127, to: -50 },
	/** The concave sweep into the end cap (segments 9–10). */
	inner: { c: [18.62, 16.05], r: 8.44, from: -140, to: -75 },
	/** The round lobe (segment 5) and the tight end cap (segment 11). */
	lobe: { c: [6.8, 9.35], r: 3.45 },
	cap: { c: [18.99, 6.39], r: 1.31 },
} as const
/** The extents: top and bottom of the mark, and its two lobes' outer edges. */
const EXTENT = { top: 2.83, side: 3.375 }
const fix = (n: number) => Math.round(n * 100) / 100
const turned = ([x, y]: readonly number[], half: 0 | 1) => (half ? [24 - x, 24 - y] : [x, y])
const arcPath = ({ c, r, from, to }: { c: readonly number[]; r: number; from: number; to: number }, half: 0 | 1) => {
	const [cx, cy] = turned(c, half)
	const at = (deg: number) => {
		const a = ((deg + half * 180) * Math.PI) / 180
		return `${fix(cx + r * Math.cos(a))} ${fix(cy + r * Math.sin(a))}`
	}
	return `M${at(from)} A${r} ${r} 0 0 1 ${at(to)}`
}
/** A line through the centre of symmetry and `[x, y]`, run past the mark. */
const axis = ([x, y]: readonly number[]) => {
	const len = Math.hypot(x - 12, y - 12)
	const [dx, dy] = [((x - 12) / len) * 14, ((y - 12) / len) * 14]
	return { x1: fix(12 - dx), y1: fix(12 - dy), x2: fix(12 + dx), y2: fix(12 + dy) }
}
const HALVES = [0, 1] as const
const GUIDES = [
	<line key="top" x1="-3" y1={EXTENT.top} x2="27" y2={EXTENT.top} />,
	<line key="bottom" x1="-3" y1={24 - EXTENT.top} x2="27" y2={24 - EXTENT.top} />,
	<line key="left" x1={EXTENT.side} y1="-3" x2={EXTENT.side} y2="27" />,
	<line key="right" x1={24 - EXTENT.side} y1="-3" x2={24 - EXTENT.side} y2="27" />,
	// Both forms' lobes, and both caps, sit on lines through the centre.
	<line key="lobe-axis" {...axis(ARCS.lobe.c)} />,
	<line key="cap-axis" {...axis(ARCS.cap.c)} />,
	...HALVES.flatMap((half) =>
		(["lobe", "cap"] as const).map((name) => {
			const [cx, cy] = turned(ARCS[name].c, half)
			return <circle key={`${name}-${half}`} cx={cx} cy={cy} r={ARCS[name].r} />
		}),
	),
	...HALVES.flatMap((half) => (["top", "inner"] as const).map((name) => <path key={`${name}-${half}`} d={arcPath(ARCS[name], half)} />)),
]

/**
 * The mark alone, decorative, driven through `ref`.
 *
 * `outlined` starts it undrawn: nothing on the page until `drawIn()` traces
 * the guides and the S outline (`pathLength="1"` dashes, so each line draws
 * from its start whatever its real length) and floods the fill in. Stroke
 * widths are in the 24-unit drawing space — about a hairline at the intro's
 * size. Not `vector-effect: non-scaling-stroke`: with it, Chrome measures the
 * dash pattern in screen pixels rather than by pathLength, so the "undrawn"
 * lines showed fragments before the drawing began.
 * Every duration is scaled by --motion-scale.
 */
export function SableMark({ className, outlined = false, ref }: { className?: string; outlined?: boolean; ref?: Ref<SableMarkHandle> }) {
	const morph = useMorph()
	const guidesRef = useRef<SVGGElement>(null)
	const outlineRef = useRef<SVGGElement>(null)

	useImperativeHandle(ref, () => ({
		play: morph.engine.animate,
		element: () => morph.svgRef.current,
		async drawIn() {
			const fill = morph.svgRef.current
			const guides = guidesRef.current
			const outline = outlineRef.current
			if (!fill || !guides || !outline) return
			const k = motionScale(fill)
			const run = (el: Element, frames: Keyframe[], delay: number, duration: number, easing = "cubic-bezier(0.4, 0, 0.2, 1)") =>
				el.animate(frames, { delay: delay * k, duration: Math.max(1, duration * k), easing, fill: "forwards" }).finished
			const draw = [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }]
			const steps: Promise<unknown>[] = []
			Array.from(guides.children).forEach((line, i) => steps.push(run(line, draw, i * 35, 420)))
			Array.from(outline.children).forEach((line, i) => steps.push(run(line, draw, 160 + i * 140, 760, "cubic-bezier(0.65, 0, 0.35, 1)")))
			// The fill floods in as the outline closes; the drawing then recedes.
			steps.push(run(fill, [{ opacity: 0 }, { opacity: 1 }], 920, 260))
			steps.push(run(outline, [{ opacity: 1 }, { opacity: 0 }], 1040, 260))
			steps.push(run(guides, [{ opacity: 1 }, { opacity: 0 }], 980, 360))
			await Promise.all(steps).catch(() => {})
		},
	}), [morph])
	useEffect(() => () => morph.engine.stop(), [morph])

	if (!outlined) return <Mark morph={morph} className={className} />
	return (
		<span className={cn("relative block", className)}>
			<Mark morph={morph} className="size-full opacity-0" />
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="absolute inset-0 size-full overflow-visible">
				<g ref={guidesRef} fill="none" stroke="currentColor" strokeWidth="0.14" className="text-border">
					{GUIDES.map((guide) => cloneElement(guide, { pathLength: 1, strokeDasharray: "1 2", strokeDashoffset: 1 }))}
				</g>
				<g ref={outlineRef} fill="none" stroke="currentColor" strokeWidth="0.22" strokeLinejoin="round">
					{LOGO.starts.map((form, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: the two fixed S forms
						<path key={i} d={toPath(form)} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />
					))}
				</g>
			</svg>
		</span>
	)
}

export function SableLogo({ className }: { className?: string }) {
	const linkRef = useRef<HTMLAnchorElement>(null)
	const morph = useMorph()

	useEffect(() => {
		const link = linkRef.current
		if (!link) return
		const { animate, stop } = morph.engine
		let hoverTimer = 0
		let hovering = false
		let focusing = false
		const settle = () => {
			if (!hovering && !focusing) animate(0)
		}
		const onEnter = (e: PointerEvent) => {
			if (e.pointerType === "touch") return // a tap navigates; no reveal on touch
			hovering = true
			window.clearTimeout(hoverTimer)
			// The delay keeps a pointer just passing through from setting it off.
			hoverTimer = window.setTimeout(() => animate(1), LOGO_TIMING.hoverDelay)
		}
		const onLeave = () => {
			hovering = false
			window.clearTimeout(hoverTimer)
			settle()
		}
		const onFocus = () => {
			if (!link.matches(":focus-visible")) return
			focusing = true
			animate(1)
		}
		const onBlur = () => {
			focusing = false
			settle()
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && focusing) {
				focusing = false
				animate(0)
			}
		}
		link.addEventListener("pointerenter", onEnter)
		link.addEventListener("pointerleave", onLeave)
		link.addEventListener("focus", onFocus)
		link.addEventListener("blur", onBlur)
		link.addEventListener("keydown", onKey)
		return () => {
			stop()
			window.clearTimeout(hoverTimer)
			link.removeEventListener("pointerenter", onEnter)
			link.removeEventListener("pointerleave", onLeave)
			link.removeEventListener("focus", onFocus)
			link.removeEventListener("blur", onBlur)
			link.removeEventListener("keydown", onKey)
		}
	}, [morph])

	return (
		<a
			ref={linkRef}
			href={hrefFor("introduction")}
			aria-label="Sable home"
			data-sable-logo=""
			className={cn("flex items-center gap-2 rounded-full motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
		>
			<Mark morph={morph} className="size-6" />
			<span className="text-title-lg" aria-hidden="true">
				Sable
			</span>
		</a>
	)
}
