"use client";

import { type ReactNode, useRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { FIELD_SHELL_XS } from "../../lib/field-shell"
import { beginScrub } from "../../lib/scrub-gesture"

export interface ScrubFieldProps {
	value: number
	onValueChange?: (next: number) => void
	min?: number
	max?: number
	/** Step for arrow keys, scrubbing, and the displayed precision. @default 1 */
	step?: number
	/** Accessible name for the input. Required — the visible glyph is decorative. */
	label: string
	/** Semantic icon name shown inside the field; doubles as the scrub handle. */
	icon?: string
	/** Short text shown in place of an icon (e.g. "X" / "Y"), same scrub role. */
	prefix?: ReactNode
	/** Unit shown inside the field after the value (e.g. "%", "px"). */
	suffix?: ReactNode
	/** Fires when a scrub gesture starts — bracket an undo entry with it. */
	onGestureStart?: () => void
	/** Fires when a scrub gesture ends. */
	onGestureEnd?: () => void
	disabled?: boolean
	id?: string
	className?: string
}

/**
 * ScrubField — the compact numeric field a property grid is built from.
 *
 * Shape follows the reference tools exactly: one field, a leading glyph or letter
 * *inside* it, the value next to that, an optional unit. The glyph is also the
 * drag-to-scrub handle — that convention is why those tools need no slider for a
 * value like opacity.
 *
 *   <ScrubField label="Opacity" icon="grid" suffix="%" value={60} onValueChange={setOpacity} />
 *   <ScrubField label="X" prefix="X" value={x} onValueChange={setX} />
 *
 * Why this exists alongside NumberField: NumberField is a page-register control
 * with steppers and locale formatting. This one is chrome — it renders at the
 * density ladder's floor, formats from `step` (so a seed reads `1234`, never
 * `1,234`), and carries the scrub gesture.
 *
 * Give it a slider OR a scrub glyph, never both: the slider already is the drag
 * affordance, so a second one on the same row is the same gesture twice. Omit
 * `icon`/`prefix` when pairing with a Slider and no handle renders.
 */
export function ScrubField({
	value,
	onValueChange,
	min,
	max,
	step = 1,
	label,
	icon,
	prefix,
	suffix,
	onGestureStart,
	onGestureEnd,
	disabled,
	id,
	className,
}: ScrubFieldProps) {
	const [draft, setDraft] = useState<string | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	// Precision follows the step, so a 0.01-step threshold shows "0.25" while an
	// integer seed shows "1234" — never a thousands separator, never 0.2500000001.
	const decimals = step < 1 ? (String(step).split(".")[1]?.length ?? 0) : 0

	function clamp(n: number) {
		let out = n
		if (min !== undefined) out = Math.max(min, out)
		if (max !== undefined) out = Math.min(max, out)
		return Number(out.toFixed(decimals))
	}

	const display = draft ?? value.toFixed(decimals)

	function commitDraft() {
		if (draft === null) return
		const parsed = Number.parseFloat(draft)
		if (Number.isFinite(parsed)) onValueChange?.(clamp(parsed))
		setDraft(null)
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			e.preventDefault()
			commitDraft()
			inputRef.current?.blur()
			return
		}
		if (e.key === "Escape") {
			e.preventDefault()
			setDraft(null)
			inputRef.current?.blur()
			return
		}
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			e.preventDefault()
			const magnitude = step * (e.shiftKey ? 10 : 1)
			const base = draft !== null ? Number.parseFloat(draft) : value
			if (!Number.isFinite(base)) return
			onValueChange?.(clamp(base + (e.key === "ArrowUp" ? magnitude : -magnitude)))
			setDraft(null)
		}
	}

	function onScrubDown(e: React.PointerEvent<HTMLSpanElement>) {
		// Shared with PropertyRow's scrubbable label, which wants the same drag
		// with one difference it cannot compromise on — see lib/scrub-gesture.
		beginScrub(e, {
			value,
			step,
			clamp,
			onValueChange,
			onGestureStart,
			onGestureEnd,
			disabled,
		})
	}

	const hasHandle = Boolean(icon || prefix)

	return (
		<div
			className={cn(
				"group flex h-(--control-xs) items-center gap-1 px-1.5 motion-interactive",
				FIELD_SHELL_XS,
				"focus-within:ring-2 focus-within:ring-ring",
				disabled && "pointer-events-none opacity-50",
				className ?? "w-full",
			)}
		>
			{hasHandle ? (
				<span
					// Decorative: the input owns the accessible name, and the gesture is
					// duplicated by the arrow keys, so this stays out of the a11y tree.
					aria-hidden
					title={`Drag to change ${label}`}
					onPointerDown={onScrubDown}
					className="flex shrink-0 cursor-ew-resize select-none items-center text-muted-foreground motion-interactive group-hover:text-foreground"
				>
					{icon ? <Icon name={icon} className="text-xs" /> : <span className="text-ui-num">{prefix}</span>}
				</span>
			) : null}

			{/* Width follows the content in `ch` so the unit sits against the number
			    ("100%", not "100      %"). The UI num tier is tabular, so one ch is
			    exactly one digit and the measurement is honest. */}
			<input
				ref={inputRef}
				id={id}
				type="text"
				inputMode="decimal"
				aria-label={label}
				disabled={disabled}
				value={display}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={commitDraft}
				onKeyDown={onKeyDown}
				onFocus={(e) => e.currentTarget.select()}
				style={{ width: `${Math.max(display.length, 2) + 0.5}ch` }}
				className="min-w-0 shrink-0 bg-transparent text-ui-num text-foreground outline-none"
			/>

			{suffix ? <span className="shrink-0 text-ui-num text-muted-foreground">{suffix}</span> : null}

			{/* Soaks up the remaining width so the value+unit pair stays left-aligned
			    against the glyph instead of centring in the field. */}
			<span aria-hidden className="min-w-0 flex-1" />
		</div>
	)
}
ScrubField.displayName = "ScrubField"
