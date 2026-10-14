import {
	ColorField,
	DisclosurePicker,
	DisclosurePickerList,
	DisclosurePickerOption,
	DisclosurePickerPanel,
	DisclosurePickerTrigger,
	Input,
	PropertyRow,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SliderControl,
	SliderIndicator,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	ThemePreview,
	type ThemeManifest,
	Toggle,
	ToggleGroup,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	cn,
} from "@sableui/react"
import { type KeyboardEvent, type PointerEvent, type ReactElement, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "../theme"
import { formatOklch } from "./color"
import { useCustomizer } from "./CustomizerProvider"
import { HUE_STOPS, brandColor } from "./look"

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
			className="relative aspect-[2/1] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-md sable-well motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
		<>
			{pad}
			{/* The section's reset says the same thing visibly; this is for the keyboard. */}
			<p id="character-help" className="sr-only">
				Drag to explore. Double-click or Delete returns to the preset.
			</p>
		</>
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
	size = "md",
}: {
	hue: number | null
	onChange: (hue: number | null) => void
	/** md for the simple view; sm is the property-grid rung. */
	size?: "md" | "sm"
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
			className={cn("relative flex cursor-pointer touch-none select-none overflow-hidden rounded-sm motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover", size === "sm" ? "h-6 rounded-xs" : "h-8")}
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

/* ── Shape: corners and depth ─────────────────────────────────────────────── */

/**
 * One preview for corners and depth together, because together is how you see
 * them: a resting card (lg radius, sm shadow) holding a chip (xs), a menu (md,
 * md) and a toast (sm, xl). The radii come from the same curve look.ts writes,
 * ceilings included; the shadows are the ladder the look paints in this mode.
 * The panel keeps the house look, so all of it is carried inline. Clipped: a
 * lifted or Offset ladder reaches well past three small samples.
 */
export function ShapePreview({
	radius,
	shadow,
}: {
	/** Radius per step in px. */
	radius: Record<"xs" | "sm" | "md" | "lg", number>
	/** box-shadow per preview step, for the current mode. */
	shadow: { sm: string; md: string; xl: string } | null
}) {
	const r = (step: keyof typeof radius) => `${Math.round(radius[step])}px`
	return (
		<div className="flex h-24 items-center justify-center gap-4 overflow-hidden rounded-md sable-well px-4" aria-hidden>
			<span className="flex h-14 w-20 flex-col justify-end gap-1.5 bg-popover p-2" style={{ borderRadius: r("lg"), boxShadow: shadow?.sm }}>
				<span className="h-1 w-10 rounded-full bg-hairline-strong" />
				<span className="h-3 w-8 bg-foreground" style={{ borderRadius: r("xs") }} />
			</span>
			<span className="grid h-16 w-14 content-start gap-1.5 bg-popover p-2" style={{ borderRadius: r("md"), boxShadow: shadow?.md }}>
				<span className="h-1 w-8 rounded-full bg-hairline-strong" />
				<span className="h-1 w-6 rounded-full bg-hairline-strong" />
				<span className="h-1 w-7 rounded-full bg-hairline-strong" />
			</span>
			<span className="flex h-8 w-20 items-center gap-1.5 bg-popover px-2" style={{ borderRadius: r("sm"), boxShadow: shadow?.xl }}>
				<span className="size-2 rounded-full bg-foreground" />
				<span className="h-1 w-10 rounded-full bg-hairline-strong" />
			</span>
		</div>
	)
}

/**
 * A 0–100 look slider whose untouched value is null ("the preset"): composed
 * from Sable's Slider parts so the thumb carries the label and value text.
 * The value text sits on the label's line, the way a tool names a setting and
 * its state together. Double-click or Delete returns to the preset.
 */
export function LookSlider({
	label,
	value,
	onChange,
	valueText,
}: {
	label: string
	value: number | null
	onChange: (value: number | null) => void
	valueText: (value: number | null) => string
}) {
	const text = valueText(value)
	return (
		<div className="grid gap-1">
			<PropertyRow label={label}>
				<span className={cn("text-ui-md", value == null ? "text-muted-foreground" : "text-foreground")}>{text}</span>
			</PropertyRow>
			<SliderRoot
				value={value ?? 50}
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
				className="w-full px-2"
			>
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb aria-label={label} getAriaValueText={() => text} />
					</SliderTrack>
				</SliderControl>
			</SliderRoot>
		</div>
	)
}

export const cornersText = (corners: number | null) =>
	corners == null ? "Preset" : corners < 15 ? "Square" : corners < 45 ? "Tight" : corners < 60 ? "Preset scale" : corners < 85 ? "Soft" : "Round"

export const depthText = (depth: number | null) =>
	depth == null ? "Preset" : depth < 10 ? "Flat" : depth < 40 ? "Subtle" : depth < 60 ? "Preset depth" : depth < 85 ? "Raised" : "Lifted"

/* ── Palette ──────────────────────────────────────────────────────────────── */

/**
 * The roles a palette preview shows, grouped the way look.ts treats them:
 * ground, brand, the decorative tones a palette scheme rebuilds from the brand,
 * and status. Status leans toward the brand only within the hue range where it
 * still reads as error, caution or done (see `leanStatus`), so its swatches move
 * less than the tones beside them. Labelled, so that reads as intended.
 */
const PALETTE_GROUPS = [
	{ name: "Ground", tokens: ["background", "muted", "foreground"] },
	{ name: "Brand", tokens: ["primary", "highlight"] },
	{ name: "Tones", tokens: ["tone-info", "tone-standard", "tone-collectible", "tone-edition"] },
	{ name: "Status", tokens: ["success", "tone-warning", "destructive"] },
] as const

const PALETTE_TOKENS = PALETTE_GROUPS.flatMap((group) => group.tokens)

/**
 * The palette the look paints right now, read back from the page — not
 * recomputed — so Harmonize or Triadic shows exactly what the canvas got.
 * Custom properties compute with var() substituted, so one read per token is
 * enough; it runs a frame after the look's stylesheet is rewritten.
 */
export function PalettePreview() {
	const { css } = useCustomizer()
	const { mode } = useTheme()
	const [colors, setColors] = useState<Record<string, string>>({})
	useLayoutEffect(() => {
		const frame = requestAnimationFrame(() => {
			const computed = getComputedStyle(document.documentElement)
			setColors(Object.fromEntries(PALETTE_TOKENS.map((token) => [token, computed.getPropertyValue(`--${token}`).trim()])))
		})
		return () => cancelAnimationFrame(frame)
	}, [css, mode])
	return (
		<div className="grid gap-1" role="img" aria-label="Current palette. Status colours lean toward the brand only as far as they keep their meaning.">
			<div className="flex h-5 items-center gap-1">
				{PALETTE_GROUPS.map((group) => (
					// An outline, not an inset ring: it paints over the swatches, so a white ground still has an edge.
					<span
						key={group.name}
						title={group.name === "Status" ? "Status leans toward the brand only as far as it keeps its meaning" : group.name}
						className="flex h-full overflow-hidden rounded-xs outline-1 -outline-offset-1 outline-hairline-strong"
						style={{ flex: `${group.tokens.length} 1 0` }}
					>
						{group.tokens.map((token) => (
							<span key={token} className="flex-1" style={{ background: colors[token] || "transparent" }} />
						))}
					</span>
				))}
			</div>
			<div className="flex gap-1 text-ui-micro text-muted-foreground" aria-hidden>
				{PALETTE_GROUPS.map((group) => (
					<span key={group.name} className="min-w-0 truncate" style={{ flex: `${group.tokens.length} 1 0` }}>
						{group.name}
					</span>
				))}
			</div>
		</div>
	)
}

/* ── Section reset ────────────────────────────────────────────────────────── */

/* ── Select ───────────────────────────────────────────────────────────────── */

/**
 * Sable's Select at the property-grid rung. The popup portals to <body>,
 * outside the panel, so it carries `data-canvas-chrome` itself and keeps the
 * house look (see ChromeTip).
 */
export function ChromeSelect<T extends string>({
	label,
	value,
	options,
	onChange,
	className,
	id,
}: {
	label: string
	value: T
	options: readonly { value: T; label: string }[]
	onChange: (value: T) => void
	className?: string
	id?: string
}) {
	return (
		<Select value={value} onValueChange={(next) => next != null && next !== value && onChange(next as T)}>
			<SelectTrigger id={id} size="xs" aria-label={label} className={className} />
			<SelectContent data-canvas-chrome="">
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
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

/*
 * The selected segment wears --knob-shadow, not shadow-sm: it sits on its
 * track the way a switch thumb sits on its rail. shadow-sm is a surface's lift,
 * and a preset may make that a hard offset drop (Poppy's), which spilled out of
 * the track and smeared the pill into the page around it.
 */
const TRACK = {
	// The inspector: a sable-well track (a fixed step off the panel, in every
	// theme and mode — no outline needed), the pick lifted back to the panel.
	card: { group: "sable-well p-1", item: "rounded-concentric-md/1 px-2", pressed: "data-[pressed]:bg-popover data-[pressed]:shadow-(--knob-shadow)" },
	// A page surface (the playground): a muted track, the pick on the page.
	muted: { group: "gap-0.5 bg-muted p-0.5", item: "rounded-concentric-md/0.5 px-2.5", pressed: "data-[pressed]:bg-background" },
	// The property grid: the card track at half the inset, around 24px segments.
	compact: { group: "sable-well p-0.5", item: "rounded-concentric-md/0.5 px-1.5", pressed: "data-[pressed]:bg-popover data-[pressed]:shadow-(--knob-shadow)" },
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
	size = "md",
	id,
}: {
	label: string
	value: T
	/** `ariaLabel` names a segment whose label is an icon. */
	options: readonly { value: T; label: ReactNode; style?: React.CSSProperties; title?: string; ariaLabel?: string }[]
	onChange: (value: T) => void
	className?: string
	/** The surface it sits on: the inspector's card, or a page (muted track). */
	track?: keyof typeof TRACK
	/** Stretch to the container with segments sharing the width; off hugs the labels. */
	fill?: boolean
	/** md for the simple view; sm is the property-grid rung (24px segments). */
	size?: "md" | "sm"
	id?: string
}) {
	const t = TRACK[size === "sm" && track === "card" ? "compact" : track]
	return (
		<ToggleGroup
			id={id}
			aria-label={label}
			value={[value]}
			onValueChange={(next) => {
				const picked = (next as T[])[0]
				if (picked != null && picked !== value) onChange(picked)
			}}
			className={cn("rounded-md", fill ? "flex" : "inline-flex", t.group, className)}
		>
			{options.map((option) => (
				<Toggle
					key={option.value}
					value={option.value}
					title={option.title ?? option.ariaLabel}
					aria-label={option.ariaLabel}
					style={option.style}
					className={cn(
						size === "sm" ? "h-6 text-ui-md" : "h-7",
						"min-w-0",
						fill && "flex-1",
						t.item,
						"hover:bg-transparent hover:text-foreground data-[pressed]:text-foreground data-[pressed]:shadow-(--knob-shadow)",
						t.pressed,
					)}
				>
					{/* No truncate: overflow:hidden on a cap-trimmed box clips descenders. */}
					<span className="sable-label-trim whitespace-nowrap">{option.label}</span>
				</Toggle>
			))}
		</ToggleGroup>
	)
}

/* ── Preset ───────────────────────────────────────────────────────────────── */

/**
 * The preset, as one row that opens in place: Sable's DisclosurePicker with
 * the current preset's tile and name, then its own list with a ThemePreview
 * tile per option. The same disclosure and list the font rows use (FontPicker
 * is built on it), so the panel has one way to pick from a list. No search:
 * six presets read faster than a field to skip past. Six cards cost the panel
 * its tallest section for a choice made once per session.
 *
 * Not ThemeSelector's radio list: there, each arrow key checks the next theme,
 * and here a pick has a cost — it starts the look over, behind a confirm when
 * the look is customized. Arrows move; Enter (or a click) picks.
 */
export function PresetPicker({
	themes,
	value,
	mode,
	onChange,
	onRemove,
	footer,
}: {
	themes: readonly ThemeManifest[]
	value: string
	mode: "light" | "dark"
	onChange: (id: string) => void
	/** Removes a preset from the list; given only for the ones the person imported. */
	onRemove?: (theme: ThemeManifest) => (() => void) | undefined
	/** A row after the presets, inside the open list — where Import lives. */
	footer?: ReactNode
}) {
	const [open, setOpen] = useState(false)
	const current = themes.find((theme) => theme.id === value)
	return (
		<DisclosurePicker open={open} onOpenChange={setOpen}>
			<DisclosurePickerTrigger
				aria-label={`Preset: ${current?.label ?? value}`}
				// The Inspector's confirm hands focus back here when it closes.
				data-preset-trigger=""
				media={current ? <ThemePreview theme={current} mode={mode} size="sm" /> : null}
			>
				{current?.label ?? value}
			</DisclosurePickerTrigger>
			<DisclosurePickerPanel>
				<DisclosurePickerList aria-label="Preset" value={value} onValueChange={onChange}>
					{themes.map((theme) => (
						<DisclosurePickerOption
							key={theme.id}
							value={theme.id}
							media={<ThemePreview theme={theme} mode={mode} size="sm" />}
							onRemove={onRemove?.(theme)}
							removeLabel={`Remove ${theme.label}`}
						>
							{theme.label}
						</DisclosurePickerOption>
					))}
				</DisclosurePickerList>
				{footer}
			</DisclosurePickerPanel>
		</DisclosurePicker>
	)
}

/* ── Brand colour: picker + hex ──────────────────────────────────────────── */

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
const HEX6 = /^#[0-9a-f]{6}$/i

/**
 * An exact brand colour. The swatch is Sable's ColorField: a themed picker
 * with its own hex field and eyedropper. The field beside it takes 3- or
 * 6-digit hex without opening anything. Its draft is local so typing a partial
 * value never clobbers the look — it commits only when it parses. Empty is not
 * an error: it means "no brand colour — the preset's own", so the swatch and
 * the placeholder show the preset's primary, and the picker opens on it.
 */
export function BrandColorInput({
	value,
	fallback,
	onChange,
	size = "md",
}: {
	value: string
	/** The preset's own primary as hex, shown while `value` is empty. */
	fallback?: string
	onChange: (hex: string) => void
	/** md for the simple view; xs is the property-grid rung. */
	size?: "md" | "xs"
}) {
	const [draft, setDraft] = useState(value)
	useEffect(() => setDraft(value), [value])
	const valid = draft.trim() === "" || HEX.test(draft.trim())
	const commit = (next: string) => {
		const v = next.trim()
		if (HEX.test(v)) onChange(v.startsWith("#") ? v.toLowerCase() : `#${v.toLowerCase()}`)
	}
	const swatch = HEX6.test(value) ? value : fallback && HEX6.test(fallback) ? fallback : "transparent"
	return (
		<div className={cn("flex items-center", size === "xs" ? "gap-1" : "gap-2")}>
			<ColorField
				label="Brand colour"
				value={swatch}
				onValueChange={(hex) => HEX.test(hex) && onChange(hex.toLowerCase())}
				className={size === "xs" ? "size-6 rounded-xs" : "size-8 rounded-sm"}
			/>
			<Input
				size={size}
				value={draft}
				onChange={(event) => {
					setDraft(event.target.value)
					commit(event.target.value)
				}}
				onBlur={() => setDraft(value)}
				spellCheck={false}
				aria-label="Brand colour hex"
				aria-invalid={!valid}
				placeholder={fallback ? `${fallback} · preset` : "Preset"}
				className={cn("min-w-0 flex-1 text-mono-caption", size === "md" && "h-8 px-2.5")}
			/>
		</div>
	)
}
