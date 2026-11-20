"use client";

import { Slider as Base } from "@base-ui/react/slider"
import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useDensity, useTypeTier } from "../../lib/density"
import { FIELD_SHELL, FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"

export interface SliderFieldProps {
	/** Controlled value. */
	value?: number
	/** Uncontrolled initial value. @default min */
	defaultValue?: number
	/** Fires on every change: each frame of a drag, each key step, a typed commit. */
	onValueChange?: (next: number) => void
	/**
	 * Fires once when a change settles: the drag is released, a key step lands,
	 * a typed value is committed or reverted. Record an undo entry here.
	 */
	onValueCommitted?: (next: number) => void
	/** @default 0 */
	min?: number
	/** @default 100 */
	max?: number
	/** Drag and arrow-key increment, and the source of the displayed precision. @default 1 */
	step?: number
	/** Accessible name for the slider and for the input that replaces it while typing. */
	label: string
	/** Semantic icon name shown at the start of the field. Decorative. */
	icon?: string
	/** Short text shown at the start of the field in place of an icon. */
	prefix?: ReactNode
	/** Unit shown after the value (e.g. "%", "px"). A string is also spoken with the value. */
	suffix?: ReactNode
	/**
	 * The field ladder, shared with Input, SelectTrigger and DatePicker: `md` is
	 * the form field, `sm` the toolbar field, `xs` the property-grid rung beside
	 * ScrubField and an xs SelectTrigger.
	 * @default "md"
	 */
	size?: "md" | "sm" | "xs"
	disabled?: boolean
	/** Submits the value with a form under this name. */
	name?: string
	/** The id of a form elsewhere on the page that the value belongs to. */
	form?: string
	/** Sizes the field (width, flex). It never draws narrower than a 7rem floor unless given a min-width. @default "w-full" */
	className?: string
}

/** A key that starts a number: typing one on the focused slider opens the edit with it. */
const NUMBER_START = /^[0-9.-]$/

/** A second press inside this window is the same double-click, not a new gesture. */
const DOUBLE_PRESS_MS = 500

/**
 * SliderField — a slider drawn as a field: the whole box is the track, the fill
 * is the value's share of the range, and the number sits inside it.
 *
 *   <SliderField label="Strength" suffix="px" value={3} max={20} onValueChange={setStrength} />
 *
 * It replaces a Slider with a ScrubField beside it. That pair spends two
 * controls and a gap on one number, and its drag target is a 6px rail; here the
 * target is the full height and width of the field.
 *
 * The slider itself is Base UI's, so `role=slider`, the arrow / Page / Home /
 * End keys and the press-anywhere drag are theirs. What this adds is the exact
 * value: double-click the field, press Enter on it, or just start typing a
 * number, and the readout becomes a text input in the same place.
 *
 * Why not a Slider variant: this takes a unit, a size rung and a typed value,
 * none of which mean anything on a rail, and it has no range form. Why not a
 * ScrubField prop: a fill is a share of a range, so it needs both bounds, and
 * ScrubField is the control for numbers that have none.
 */
export function SliderField({
	value: valueProp,
	defaultValue,
	onValueChange,
	onValueCommitted,
	min = 0,
	max = 100,
	step = 1,
	label,
	icon,
	prefix,
	suffix,
	size = "md",
	disabled,
	name,
	form,
	className,
}: SliderFieldProps) {
	const [inner, setInner] = useState(defaultValue ?? min)
	const value = valueProp ?? inner

	// null = showing the readout; a string = the text being typed.
	const [draft, setDraftState] = useState<string | null>(null)
	// Mirrored in a ref because Enter and Escape blur the input in the same tick
	// they settle the draft, and blur commits: read from the render's closure it
	// would commit the text Escape had just thrown away. Same reason as ScrubField.
	const draftRef = useRef<string | null>(null)
	function setDraft(next: string | null) {
		draftRef.current = next
		setDraftState(next)
	}

	const thumbInputRef = useRef<HTMLInputElement>(null)
	// A double-click's first press has already moved the value to where it
	// landed. This is the value from before that press, so Escape can put it back.
	const beforePress = useRef({ value, at: 0 })
	const revertTo = useRef<number | null>(null)
	// Opened on the current value, the text is selected to be replaced; opened
	// by a typed digit, the caret follows it.
	const selectOnOpen = useRef(false)
	// A jump (a press on the track, a key step, a typed value) glides to its new
	// place; a drag follows the pointer with no transition at all.
	const [gliding, setGliding] = useState(false)
	// In a drag the grip may trail the fill's edge, but only while the fill
	// grows: trailing a shrinking fill would leave the grip outside it.
	const [growing, setGrowing] = useState(false)

	const tier = useTypeTier()
	const density = useDensity()
	const xs = size === "xs"

	// Precision follows the step, as in ScrubField: 0.01 shows "0.25", 1 shows "1234".
	const decimals = step < 1 ? (String(step).split(".")[1]?.length ?? 0) : 0
	const display = value.toFixed(decimals)
	const percent = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0

	function clamp(n: number) {
		return Number(Math.min(max, Math.max(min, n)).toFixed(decimals))
	}

	function change(next: number) {
		setInner(next)
		onValueChange?.(next)
	}

	function settle(next: number) {
		setGliding(true)
		if (next !== value) change(next)
		onValueCommitted?.(next)
	}

	function openEdit(text: string, revert: number | null, select: boolean) {
		if (disabled) return
		revertTo.current = revert
		selectOnOpen.current = select
		setDraft(text)
	}

	function commitDraft() {
		const current = draftRef.current
		if (current === null) return
		setDraft(null)
		const parsed = Number.parseFloat(current)
		if (Number.isFinite(parsed)) settle(clamp(parsed))
	}

	function cancelDraft() {
		if (draftRef.current === null) return
		setDraft(null)
		const revert = revertTo.current
		if (revert !== null && revert !== value) settle(revert)
	}

	function onSliderKeyDown(e: KeyboardEvent<HTMLDivElement>) {
		// Only keys pressed on the slider itself; the edit input handles its own.
		if (e.target !== thumbInputRef.current) return
		if (e.ctrlKey || e.metaKey || e.altKey) return
		if (e.key === "Enter") {
			// Also keeps Enter from submitting a surrounding form.
			e.preventDefault()
			openEdit(display, null, true)
		} else if (NUMBER_START.test(e.key)) {
			e.preventDefault()
			openEdit(e.key, null, false)
		}
	}

	function onEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key !== "Enter" && e.key !== "Escape") return
		e.preventDefault()
		if (e.key === "Enter") commitDraft()
		else cancelDraft()
		// Back to the slider, so the arrow keys work again without a Tab.
		thumbInputRef.current?.focus()
	}

	const editing = draft !== null
	const spokenSuffix = typeof suffix === "string" ? suffix : null

	return (
		<Base.Root
			value={value}
			onValueChange={(next, details) => {
				setGliding(details.reason !== "drag")
				setGrowing(next > value)
				change(next)
			}}
			onValueCommitted={(next) => onValueCommitted?.(next)}
			min={min}
			max={max}
			step={step}
			disabled={disabled}
			name={name}
			form={form}
			onKeyDown={onSliderKeyDown}
			onPointerDownCapture={(e) => {
				if (e.timeStamp - beforePress.current.at > DOUBLE_PRESS_MS) {
					beforePress.current = { value, at: e.timeStamp }
				}
			}}
			onDoubleClick={() => {
				if (!editing) openEdit(display, beforePress.current.value, true)
			}}
			className={cn(
				// The readout and fill are positioned, so the box has no content width of
				// its own: the floor keeps a drag run in a slot sized by its content
				// (a PropertyRow's control side).
				"group/slider-field relative flex min-w-28 overflow-hidden text-foreground",
				FIELD_SHELL,
				xs && cn("h-(--control-xs)", FIELD_SHELL_XS),
				size === "sm" && "h-(--control-sm)",
				size === "md" && "h-(--control-md)",
				"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				xs ? "text-ui-num" : cn(tier.body, "tabular-nums", density === "comfortable" && MOBILE_FIELD_TIER),
				className ?? "w-full",
			)}
		>
			{/* A size container, so the handle's travel can be written in cqw. */}
			<Base.Control className="@container absolute inset-0 cursor-ew-resize rounded-[inherit]">
				<Base.Track
					style={{ "--slider-field-value": percent } as CSSProperties}
					className="h-full w-full rounded-[inherit]"
				>
					{/* The fill is a full-width sheet slid in from the start, with the
					    grip riding just inside its leading edge. Both are one linear
					    function of the value on `translate` alone, so they move as one
					    piece and a glide lays nothing out. The sheet never retreats past
					    a stub three spacing steps wide: at min that stub is what holds
					    the grip, so the grip is never left outside the fill. */}
					<span
						aria-hidden
						className={cn(
							"pointer-events-none absolute inset-0 rounded-[inherit]",
							// The xs well is already a grey step, where md and sm sit on the
							// field's own surface: the same tint over it reads a step too
							// dark, so xs takes a lighter one.
							xs ? "bg-foreground/9" : "bg-foreground/12",
							"[--slider-field-run:calc((100cqw_-_var(--spacing)*3)*var(--slider-field-value)/100)]",
							"translate-x-[calc(var(--slider-field-run)_+_var(--spacing)*3_-_100cqw)] rtl:translate-x-[calc(100cqw_-_var(--spacing)*3_-_var(--slider-field-run))]",
							gliding && "motion-glide",
						)}
					/>
					{/* The grip: a small raised pill, a step lighter than the fill in
					    both modes (`--slider-grip`) over the contact shadow every knob
					    wears, held back until the field is hovered or dragged. It marks where to take hold; the fill's edge
					    already says where the value is, so it does not need to shout. */}
					<span
						aria-hidden
						className={cn(
							"pointer-events-none absolute inset-y-1/4 start-0 w-1 rounded-full bg-(--slider-grip)/75 shadow-(--knob-shadow)",
							"[--slider-field-run:calc((100cqw_-_var(--spacing)*3)*var(--slider-field-value)/100)]",
							"translate-x-[calc(var(--slider-field-run)_+_var(--spacing))] rtl:translate-x-[calc((var(--slider-field-run)_+_var(--spacing))*-1)]",
							// A glide carries fill and grip together on one timing. In a drag
							// the fill is instant: the grip eases after it while it grows,
							// and is pushed along with no lag while it shrinks.
							gliding ? "motion-glide" : "motion-interactive",
							!gliding && !growing && "[transition-property:background-color]",
							"group-hover/slider-field:bg-(--slider-grip) group-data-[dragging]/slider-field:bg-(--slider-grip)",
						)}
					/>
					{/* The thumb carries the focusable input and no paint. The whole
					    control takes the press, so its box is never the drag target. */}
					<Base.Thumb
						inputRef={thumbInputRef}
						aria-label={label}
						getAriaValueText={spokenSuffix ? (_, v) => `${v.toFixed(decimals)}${spokenSuffix}` : undefined}
						className="h-full w-px"
					/>
				</Base.Track>
			</Base.Control>

			{/* The readout row lies over the control and lets every press through
			    to it; only the edit input, when it is open, takes the pointer. */}
			<div
				className={cn(
					"pointer-events-none absolute inset-0 flex items-center gap-1",
					// Wider than an Input's on the same rung: the handle's two stops sit
					// inside this padding, and the text has to clear them.
					"px-4",
				)}
			>
				{icon || prefix ? (
					<span aria-hidden className="flex shrink-0 items-center text-muted-foreground">
						{icon ? <Icon name={icon} className={xs ? "text-xs" : "text-sm"} /> : prefix}
					</span>
				) : null}
				{editing ? (
					<input
						ref={(el) => {
							if (!el || document.activeElement === el) return
							el.focus()
							if (selectOnOpen.current) el.select()
						}}
						type="text"
						inputMode="decimal"
						aria-label={label}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={onEditKeyDown}
						onBlur={commitDraft}
						className="pointer-events-auto min-w-0 flex-1 cursor-text bg-transparent text-end outline-none"
					/>
				) : (
					<span aria-hidden className="min-w-0 flex-1 truncate text-end">
						{display}
					</span>
				)}
				{suffix ? (
					<span aria-hidden className="shrink-0 text-muted-foreground">
						{suffix}
					</span>
				) : null}
			</div>
		</Base.Root>
	)
}
SliderField.displayName = "SliderField"
