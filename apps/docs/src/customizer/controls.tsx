import {
	ColorField,
	Input,
	Radio,
	RadioGroup,
	SliderControl,
	SliderIndicator,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	Toggle,
	ToggleGroup,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	cn,
} from "@sableui/react"
import { type KeyboardEvent, type PointerEvent, type ReactElement, type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "../theme"
import { formatOklch, resolveTheme } from "./color"
import { HUE_STOPS, brandColor, cornerRadius } from "./look"

/*
 * The inspector's controls. Wherever Sable ships the control, this is that
 * control (ToggleGroup, Slider, RadioGroup, ColorField): the panel is Sable's
 * own showcase. The two bespoke ones, the character pad and the hue strip,
 * have no Sable equivalent; they are pointer-first (drag anywhere on them) and
 * keyboard-complete (arrows nudge, Shift+arrows jump, Home/End go to the ends,
 * Delete/Backspace return to the preset). Values are null when untouched,
 * which means "whatever the preset ships" — the distinction the export
 * depends on.
 */

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))

function stepFor(event: KeyboardEvent) {
	return event.shiftKey ? 10 : 2
}

/**
 * Pointer dragging that stays smooth while the whole page restyles under it.
 * Every update rewrites the look's stylesheet, so the page's styles are dirty
 * between moves. Three things keep a drag at frame rate:
 *
 * - The control's box is measured ONCE, on press. Reading it per move forced a
 *   synchronous style + layout of the entire page inside every pointermove
 *   (~23ms each on the canvas) — the bulk of the lag.
 * - Moves are coalesced to one update per animation frame; a fast mouse
 *   delivers several per frame and only the last one can be seen.
 * - Transitions are paused for the drag (`data-customize-dragging` on <html>,
 *   see app.css). Otherwise ~180 color and size transitions restart on every
 *   update, each chasing a target that moves again a frame later.
 */
function useFrameDrag(apply: (fx: number, fy: number) => void) {
	const box = useRef<DOMRect | null>(null)
	const pending = useRef<[number, number] | null>(null)
	const frame = useRef(0)
	const latest = useRef(apply)
	latest.current = apply

	const flush = () => {
		frame.current = 0
		const p = pending.current
		pending.current = null
		if (p) latest.current(p[0], p[1])
	}
	const queue = (event: PointerEvent) => {
		const b = box.current
		if (!b) return
		pending.current = [(event.clientX - b.left) / b.width, (event.clientY - b.top) / b.height]
		if (!frame.current) frame.current = requestAnimationFrame(flush)
	}
	const end = () => {
		if (frame.current) {
			cancelAnimationFrame(frame.current)
			flush()
		}
		box.current = null
		document.documentElement.removeAttribute("data-customize-dragging")
	}
	useEffect(() => () => {
		cancelAnimationFrame(frame.current)
		document.documentElement.removeAttribute("data-customize-dragging")
	}, [])

	return {
		onPointerDown: (event: PointerEvent<HTMLElement>) => {
			// Native-drag guard: without it, pressing where a selection sits starts
			// the browser's drag ("not allowed" cursor) and the move never arrives.
			event.preventDefault()
			event.currentTarget.focus()
			event.currentTarget.setPointerCapture(event.pointerId)
			box.current = event.currentTarget.getBoundingClientRect()
			document.documentElement.setAttribute("data-customize-dragging", "")
			queue(event)
		},
		onPointerMove: (event: PointerEvent<HTMLElement>) => {
			if (box.current && event.currentTarget.hasPointerCapture(event.pointerId)) queue(event)
		},
		onPointerUp: end,
		onPointerCancel: end,
		onLostPointerCapture: end,
		onDragStart: (event: PointerEvent<HTMLElement> | React.DragEvent) => event.preventDefault(),
	}
}

/* ── Character pad ────────────────────────────────────────────────────────── */

export function CharacterPad({
	bold,
	airy,
	onChange,
}: {
	bold: number | null
	airy: number | null
	onChange: (next: { bold: number | null; airy: number | null }) => void
}) {
	const ref = useRef<HTMLDivElement>(null)
	const x = bold ?? 50
	const y = airy ?? 50
	const untouched = bold == null && airy == null

	// Airy is UP, the way a designer reads "more room".
	const drag = useFrameDrag((fx, fy) => onChange({ bold: Math.round(clamp(fx * 100)), airy: Math.round(clamp(100 - fy * 100)) }))

	const onKey = (event: KeyboardEvent) => {
		const s = stepFor(event)
		const keys: Record<string, () => void> = {
			ArrowLeft: () => onChange({ bold: clamp(x - s), airy }),
			ArrowRight: () => onChange({ bold: clamp(x + s), airy }),
			ArrowUp: () => onChange({ bold, airy: clamp(y + s) }),
			ArrowDown: () => onChange({ bold, airy: clamp(y - s) }),
			Home: () => onChange({ bold: 0, airy }),
			End: () => onChange({ bold: 100, airy }),
			Delete: () => onChange({ bold: null, airy: null }),
			Backspace: () => onChange({ bold: null, airy: null }),
		}
		const fn = keys[event.key]
		if (fn) {
			event.preventDefault()
			fn()
		}
	}

	const pad = (
		// design-lint-disable-next-line hand-rolled-control -- a 2D pad sets two values in one gesture; Sable Slider is one axis
		<div role="slider"
			ref={ref}
			tabIndex={0}
			aria-label="Character"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={x}
			aria-valuetext={untouched ? "Preset" : `${x < 34 ? "Quiet" : x > 66 ? "Bold" : "Balanced"}, ${y < 34 ? "compact" : y > 66 ? "airy" : "medium density"}`}
			aria-describedby="character-help"
			{...drag}
			onDoubleClick={() => onChange({ bold: null, airy: null })}
			onKeyDown={onKey}
			className="relative aspect-[3/2] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-md sable-well motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			style={{
				backgroundImage:
					// The grid dots are the strong hairline: an alpha of the ink, right on any well.
					"radial-gradient(circle, var(--hairline-strong) 1px, transparent 1.5px)",
				backgroundSize: "16px 16px",
				backgroundPosition: "8px 8px",
			}}
		>
			{/* Axis guides */}
			<span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border" />
			<span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-border" />
			<span aria-hidden className="absolute top-2 left-1/2 -translate-x-1/2 text-caption text-muted-foreground">Airy</span>
			<span aria-hidden className="absolute bottom-2 left-1/2 -translate-x-1/2 text-caption text-muted-foreground">Compact</span>
			<span aria-hidden className="absolute top-1/2 left-2 -translate-y-1/2 text-caption text-muted-foreground">Quiet</span>
			<span aria-hidden className="absolute top-1/2 right-2 -translate-y-1/2 text-caption text-muted-foreground">Bold</span>
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute size-4 -translate-x-1/2 translate-y-1/2 rounded-full motion-interactive",
					untouched ? "ring-[1.5px] ring-muted-foreground ring-inset" : "bg-foreground shadow-md ring-2 ring-background",
				)}
				style={{ left: `${x}%`, bottom: `${y}%`, transitionProperty: "left, bottom, background-color" }}
			/>
		</div>
	)

	return (
		<div className="grid gap-2">
			{pad}
			<p id="character-help" className="text-caption text-muted-foreground">
				Drag to explore. Double-click or Delete returns to the preset.
			</p>
		</div>
	)
}

/* ── Hue strip ────────────────────────────────────────────────────────────── */

/**
 * The brand strip: 24 swatches painted for the mode the page is in, so the
 * swatch you pick is the fill you get. Not a Sable Slider: a slider's thumb
 * sits on a POINT along its track, and these are 24 equal cells the marker
 * frames; mapping one onto the other misplaces the marker toward both ends.
 */
export function HueStrip({
	hue,
	onChange,
}: {
	hue: number | null
	onChange: (hue: number | null) => void
}) {
	const { mode } = useTheme()
	const paint = mode === "dark" ? "dark" : "light"
	const stops = HUE_STOPS
	const swatches = useMemo(() => stops.map((h) => ({ h, fill: formatOklch(brandColor(h, paint)) })), [stops, paint])
	const index = hue == null ? -1 : stops.indexOf(hue) >= 0 ? stops.indexOf(hue) : Math.round(hue / 15) % 24

	// The strip snaps to 24 stops, so most moves land on the stop it is already
	// on: skip those instead of restyling the page to the same color.
	const drag = useFrameDrag((fx) => {
		const i = Math.min(stops.length - 1, Math.max(0, Math.floor(fx * stops.length)))
		if (stops[i] !== hue) onChange(stops[i])
	})

	const onKey = (event: KeyboardEvent) => {
		const from = index < 0 ? 0 : index
		const step = event.shiftKey ? 4 : 1
		const at = (i: number) => stops[(i + stops.length) % stops.length]
		const keys: Record<string, () => number | null> = {
			ArrowRight: () => at(from + step),
			ArrowUp: () => at(from + step),
			ArrowLeft: () => at(from - step),
			ArrowDown: () => at(from - step),
			Home: () => stops[0],
			End: () => stops[stops.length - 1],
			Delete: () => null,
			Backspace: () => null,
		}
		const fn = keys[event.key]
		if (fn) {
			event.preventDefault()
			onChange(fn())
		}
	}

	return (
		// design-lint-disable-next-line hand-rolled-control -- 24 framed swatch cells, not a point on a track; Sable Slider's thumb marks a point
		<div role="slider"
			tabIndex={0}
			aria-label="Brand hue"
			aria-valuemin={0}
			aria-valuemax={345}
			aria-valuenow={hue ?? undefined}
			aria-valuetext={hue == null ? "Preset colors" : `Hue ${hue}°`}
			{...drag}
			onKeyDown={onKey}
			className="relative flex h-8 cursor-pointer touch-none select-none overflow-hidden rounded-sm motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
		>
			{swatches.map(({ h, fill }) => (
				<span key={h} aria-hidden className="h-full flex-1" style={{ background: fill }} />
			))}
			{index >= 0 ? (
				// The marker is a frame drawn ON the chosen swatch, inset so it never
				// pokes past the strip's own corners. Two rings of opposite polarity —
				// the panel's ground outside, its ink inside — so it reads on a pale
				// yellow and a deep blue alike.
				<span
					aria-hidden
					className="pointer-events-none absolute inset-y-1 rounded-xs shadow-sm ring-2 ring-background ring-inset motion-interactive"
					style={{
						left: `${(index / stops.length) * 100}%`,
						width: `${100 / stops.length}%`,
						transitionProperty: "left",
					}}
				>
					<span className="absolute inset-0.5 rounded-[inherit] ring-[1.5px] ring-foreground ring-inset" />
				</span>
			) : null}
		</div>
	)
}

/* ── Corners ──────────────────────────────────────────────────────────────── */

export function CornerControl({
	corners,
	preset,
	onChange,
}: {
	corners: number | null
	/** The active preset's radius ladder in px, which the preview shapes start from. */
	preset: Record<"xs" | "sm" | "md" | "lg", number>
	onChange: (corners: number | null) => void
}) {
	const value = corners ?? 50
	// The same curve look.ts writes, so the preview shows the real outcome —
	// including the ceilings that keep the round end from turning boxes into pills.
	const r = (step: "xs" | "sm" | "md" | "lg") => `${Math.round(cornerRadius(step, preset[step], value))}px`
	const valueText = corners == null ? "Preset" : value < 15 ? "Square" : value < 45 ? "Tight" : value < 60 ? "Preset scale" : value < 85 ? "Soft" : "Round"
	return (
		<div className="grid gap-2">
			<div className="flex items-end justify-between gap-3 rounded-md sable-well px-4 py-3" aria-hidden>
				<span className="h-11 w-16 bg-popover shadow-sm" style={{ borderRadius: r("lg") }} />
				<span className="h-7 w-14 bg-popover shadow-sm" style={{ borderRadius: r("sm") }} />
				<span className="size-8 bg-popover shadow-sm" style={{ borderRadius: r("md") }} />
				<span className="h-4 w-8 bg-popover shadow-sm" style={{ borderRadius: r("xs") }} />
			</div>
			{/* Composed from Sable's Slider parts so the thumb can carry the label
			    and value text. Double-click or Delete returns to the preset. */}
			<SliderRoot
				value={value}
				min={0}
				max={100}
				onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : (next as number))}
				onDoubleClick={() => onChange(null)}
				onKeyDown={(event) => {
					if (event.key === "Delete" || event.key === "Backspace") {
						event.preventDefault()
						onChange(null)
					}
				}}
				// Inset by half a thumb: Sable's slider centres the thumb on the value,
				// so at 0 it hung past the panel's content edge.
				className="w-full px-2.5"
			>
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb aria-label="Corner roundness" getAriaValueText={() => valueText} />
					</SliderTrack>
				</SliderControl>
			</SliderRoot>
		</div>
	)
}

/**
 * Depth: Flat ↔ Lifted, over a preview of three surfaces at the steps that
 * matter most — a resting card (sm), a popover (md) and a toast (xl) — wearing
 * the shadows the look will paint in the current mode. The panel itself keeps
 * the house look, so the preview carries the shadows inline. Simple only:
 * Advanced sets exact numbers instead (see Inspector).
 */
export function DepthControl({
	depth,
	preview,
	onChange,
}: {
	depth: number | null
	/** box-shadow per preview step, for the current mode. */
	preview: { sm: string; md: string; xl: string } | null
	onChange: (depth: number | null) => void
}) {
	const value = depth ?? 50
	const valueText = depth == null ? "Preset" : value < 10 ? "Flat" : value < 40 ? "Subtle" : value < 60 ? "Preset depth" : value < 85 ? "Raised" : "Lifted"
	return (
		<div className="grid gap-2">
			{/* Clipped: the well is a window onto the shadows, and a lifted or
			    Offset ladder reaches well past three small samples. */}
			<div className="flex items-start justify-between gap-3 overflow-hidden rounded-md sable-well px-4 pt-3 pb-6" aria-hidden>
				<span className="h-10 w-16 rounded-sm bg-popover" style={{ boxShadow: preview?.sm }} />
				<span className="h-12 w-14 rounded-sm bg-popover" style={{ boxShadow: preview?.md }} />
				<span className="h-8 w-20 rounded-sm bg-popover" style={{ boxShadow: preview?.xl }} />
			</div>
			<SliderRoot
				value={value}
				min={0}
				max={100}
				onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : (next as number))}
				onDoubleClick={() => onChange(null)}
				onKeyDown={(event) => {
					if (event.key === "Delete" || event.key === "Backspace") {
						event.preventDefault()
						onChange(null)
					}
				}}
				className="w-full px-2.5"
			>
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb aria-label="Depth" getAriaValueText={() => valueText} />
					</SliderTrack>
				</SliderControl>
			</SliderRoot>
			<div className="flex justify-between px-0.5 text-caption text-muted-foreground" aria-hidden>
				<span>Flat</span>
				<span>Lifted</span>
			</div>
		</div>
	)
}

/* ── Tooltip ─────────────────────────────────────────────────────────────── */

/**
 * A tooltip for the inspector's icon buttons. The popup portals to <body>,
 * outside the panel, so it carries `data-canvas-chrome` itself: it keeps the
 * house look instead of wearing the look being tuned.
 */
export function ChromeTip({ label, children }: { label: string; children: ReactElement }) {
	return (
		<Tooltip>
			<TooltipTrigger render={children} />
			<TooltipContent data-canvas-chrome="">{label}</TooltipContent>
		</Tooltip>
	)
}

/* ── Segmented control ────────────────────────────────────────────────────── */

const TRACK = {
	// The inspector: a sable-well track (a fixed step off the panel, in every
	// theme and mode — no outline needed), the pick lifted back to the panel.
	card: { group: "sable-well p-1", item: "rounded-concentric-md/1 px-2", pressed: "data-[pressed]:bg-popover data-[pressed]:shadow-sm" },
	// A page surface (the playground): a muted track, the pick on the page.
	muted: { group: "gap-0.5 bg-muted p-0.5", item: "rounded-concentric-md/0.5 px-2.5", pressed: "data-[pressed]:bg-background" },
} as const

/**
 * A single-select Sable ToggleGroup drawn as one quiet track with an inset
 * selected pill, concentric by construction (the segment radius is the track's
 * minus the inset). ToggleGroup brings arrow-key roving focus and the pressed
 * state. Every one of these always has a value, so pressing the pressed
 * segment keeps it rather than clearing the group. Labels are trimmed to the
 * cap height (`sable-label-trim`) so they centre on what the eye reads, not on
 * the line box; untrimmed text in a short pill sits visibly high.
 */
export function Segmented<T extends string>({
	label,
	value,
	options,
	onChange,
	className,
	track = "card",
	fill = true,
	id,
}: {
	label: string
	value: T
	options: readonly { value: T; label: ReactNode; style?: React.CSSProperties; title?: string }[]
	onChange: (value: T) => void
	className?: string
	/** The surface it sits on: the inspector's card, or a page (muted track). */
	track?: keyof typeof TRACK
	/** Stretch to the container with segments sharing the width; off hugs the labels. */
	fill?: boolean
	id?: string
}) {
	return (
		<ToggleGroup
			id={id}
			aria-label={label}
			value={[value]}
			onValueChange={(next) => {
				const picked = (next as T[])[0]
				if (picked != null && picked !== value) onChange(picked)
			}}
			className={cn("rounded-md", fill ? "flex" : "inline-flex", TRACK[track].group, className)}
		>
			{options.map((option) => (
				<Toggle
					key={option.value}
					value={option.value}
					title={option.title}
					style={option.style}
					className={cn(
						"h-7 min-w-0",
						fill && "flex-1",
						TRACK[track].item,
						"hover:bg-transparent hover:text-foreground data-[pressed]:text-foreground data-[pressed]:shadow-sm",
						TRACK[track].pressed,
					)}
				>
					{/* No truncate: overflow:hidden on a cap-trimmed box clips descenders. */}
					<span className="sable-label-trim whitespace-nowrap">{option.label}</span>
				</Toggle>
			))}
		</ToggleGroup>
	)
}

/* ── Presets ──────────────────────────────────────────────────────────────── */

/**
 * Compact tiles, three to a row: each tile IS the preset's surface, painted
 * from its own resolved tokens in the current mode — so in light mode you see
 * the light presets — with "Aa" in the preset's display face and its two
 * signature colours. The name sits under the tile, in the panel's own type,
 * so six presets read as one scannable row of swatches rather than six cards.
 * Underneath it is a Sable RadioGroup (arrow keys, roving focus, radio
 * semantics); each Radio renders the tile in place of its default dot.
 */
export function PresetCards({
	themes,
	value,
	mode,
	onChange,
}: {
	themes: readonly { id: string; label: string }[]
	value: string
	mode: "light" | "dark"
	onChange: (id: string) => void
}) {
	const resolved = useMemo(() => Object.fromEntries(themes.map((t) => [t.id, resolveTheme(t.id)])), [themes])
	return (
		<RadioGroup
			aria-label="Preset"
			value={value}
			onValueChange={(next) => typeof next === "string" && onChange(next)}
			className="grid grid-cols-3 gap-x-2 gap-y-2.5"
		>
			{themes.map((theme) => {
				const r = resolved[theme.id]
				const c = r?.[mode]
				const paint = (token: string, fallback: string) => (c?.[token] ? formatOklch(c[token]) : fallback)
				return (
					<Radio
						key={theme.id}
						value={theme.id}
						aria-label={theme.label}
						// The tile replaces the default dot: keep Base UI's props (ARIA,
						// handlers, state attributes), drop the dot's class and indicator.
						render={({ className: _dot, children: _indicator, ...props }, state) => (
							<button
								{...props}
								type="button"
								className="group grid gap-2.5 rounded-sm text-start motion-interactive focus-visible:outline-none"
							>
								<span
									className={cn(
										"flex h-10 items-center justify-between rounded-sm px-2 motion-interactive group-focus-visible:ring-2 group-focus-visible:ring-ring",
										state.checked
											? "ring-[1.5px] ring-foreground ring-offset-2 ring-offset-popover"
											: "ring-1 ring-hairline-strong ring-inset group-hover:ring-foreground/40",
									)}
									style={{ background: paint("background", "transparent"), color: paint("foreground", "inherit") }}
								>
									<span className="text-title-sm leading-none" style={{ fontFamily: r?.fontDisplay || r?.fontSans }}>
										Aa
									</span>
									<span className="flex -space-x-1" aria-hidden>
										<span className="size-2.5 rounded-full" style={{ background: paint("primary", "transparent"), boxShadow: `0 0 0 1px ${paint("border", "transparent")}` }} />
										<span className="size-2.5 rounded-full" style={{ background: paint("highlight", paint("ring", "transparent")), boxShadow: `0 0 0 1px ${paint("border", "transparent")}` }} />
									</span>
								</span>
								<span
									className={cn(
										"truncate text-caption leading-none motion-interactive",
										state.checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
									)}
								>
									{theme.label}
								</span>
							</button>
						)}
					/>
				)
			})}
		</RadioGroup>
	)
}

/* ── Brand colour: picker + hex ──────────────────────────────────────────── */

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
// design-lint-disable-next-line inline-color -- placeholder text showing the hex format, never painted
const HEX_EXAMPLE = "#5b5bd6"

/**
 * An exact brand colour. The swatch is Sable's ColorField: a themed picker
 * with its own hex field and eyedropper. The field beside it takes 3- or
 * 6-digit hex without opening anything. Its draft is local so typing a partial
 * value never clobbers the look — it commits only when it parses. Empty is not
 * an error: it means "no brand colour — the preset's own", and the swatch
 * shows the transparency checkerboard rather than an arbitrary black.
 */
export function BrandColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
	const [draft, setDraft] = useState(value)
	useEffect(() => setDraft(value), [value])
	const valid = draft.trim() === "" || HEX.test(draft.trim())
	const commit = (next: string) => {
		const v = next.trim()
		if (HEX.test(v)) onChange(v.startsWith("#") ? v.toLowerCase() : `#${v.toLowerCase()}`)
	}
	return (
		<div className="flex items-center gap-2">
			<ColorField
				label="Brand colour"
				value={/^#[0-9a-f]{6}$/i.test(value) ? value : "transparent"}
				onValueChange={(hex) => HEX.test(hex) && onChange(hex.toLowerCase())}
				className="size-8 rounded-sm"
			/>
			<Input
				value={draft}
				onChange={(event) => {
					setDraft(event.target.value)
					commit(event.target.value)
				}}
				onBlur={() => setDraft(value)}
				spellCheck={false}
				aria-label="Brand colour hex"
				aria-invalid={!valid}
				placeholder={HEX_EXAMPLE}
				className="h-8 min-w-0 flex-1 px-2.5 text-mono-caption"
			/>
		</div>
	)
}
