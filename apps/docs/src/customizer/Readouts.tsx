import { Button, Icon, ScrubField } from "@sableui/react"
import { type ReactNode, useLayoutEffect, useState } from "react"
import { useCustomizer } from "./CustomizerProvider"
import { ChromeTip } from "./controls"

/**
 * Advanced view: the numbers the look resolves to, measured live.
 *
 * Custom properties read back as their authored text (`min(19.2px, 18px)`,
 * `calc(200ms * var(--motion-scale))`), not as values, so each token is
 * resolved through a probe element: assign it to a real property and read the
 * computed px or seconds. The probe lives on <body>, outside the inspector's
 * `data-canvas-chrome` reset, so it sees the look exactly as the page does —
 * preset, scaling, ceilings and all.
 */

type Kind = "length" | "time"
interface Row {
	label: string
	/** A custom property to resolve… */
	token?: string
	/** …or a utility class to apply and read the font size of (type tiers, so
	 * the class's own fallbacks count, as they do on the page). */
	type?: string
	kind?: Kind
}

const PROPERTY: Record<Kind, string> = { length: "width", time: "transitionDuration" }

/** Each row resolved to a number: rendered px for lengths, ms for times. */
function measure(rows: readonly Row[]): (number | null)[] {
	const probe = document.createElement("div")
	probe.setAttribute("aria-hidden", "true")
	probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0;height:0"
	document.body.appendChild(probe)
	const out = rows.map(({ token, type, kind = "length" }) => {
		probe.className = type ?? ""
		probe.style.removeProperty("width")
		probe.style.removeProperty("transition-duration")
		const property = PROPERTY[kind]
		if (token) probe.style.setProperty(property === "width" ? "width" : "transition-duration", `var(${token})`)
		const computed = getComputedStyle(probe)
		const n = Number.parseFloat(type ? computed.fontSize : computed[property as "width" | "transitionDuration"])
		if (!Number.isFinite(n)) return null
		return kind === "time" ? Math.round(n * 1000) : Math.round(n * 10) / 10
	})
	probe.remove()
	return out
}

function format(value: number | null | undefined, kind: Kind = "length"): string {
	if (value == null) return "—"
	if (kind === "time") return `${value}ms`
	return value >= 999 ? "Pill" : `${value}px`
}

/** Live measurements of `rows`, re-read whenever the look's stylesheet changes. */
export function useMeasured(rows: readonly Row[], enabled = true): (number | null)[] {
	const { css } = useCustomizer()
	const [values, setValues] = useState<(number | null)[]>([])
	// One frame later, so the rewritten <style> has applied before the probe
	// reads. Measuring forces a full style + layout, so it only runs when the
	// numbers are on screen (Advanced).
	useLayoutEffect(() => {
		if (!enabled) return
		const frame = requestAnimationFrame(() => setValues(measure(rows)))
		return () => cancelAnimationFrame(frame)
	}, [css, rows, enabled])
	return values
}

export function Readout({ title, rows, children }: { title?: string; rows: Row[]; children?: ReactNode }) {
	const values = useMeasured(rows)
	return (
		<div className="grid gap-2.5 rounded-sm sable-well p-3">
			{title ? <span className="text-label-md">{title}</span> : null}
			{children ? <div className="grid gap-1.5">{children}</div> : null}
			<dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
				{rows.map((row, i) => (
					<div key={row.label} className="contents">
						<dt className="text-body-xs text-muted-foreground">{row.label}</dt>
						<dd className="text-end text-mono-caption tabular-nums">{format(values[i], row.kind)}</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

/**
 * A readout whose values are already known rather than measured: a shadow has
 * no single length a probe could read back, so the look's own ladder supplies
 * the numbers. Same markup as Readout.
 */
export function ValueReadout({ title, rows, children }: { title?: string; rows: { label: string; value: string }[]; children?: ReactNode }) {
	return (
		<div className="grid gap-2.5 rounded-sm sable-well p-3">
			{title ? <span className="text-label-md">{title}</span> : null}
			{children ? <div className="grid gap-1.5">{children}</div> : null}
			<dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
				{rows.map((row) => (
					<div key={row.label} className="contents">
						<dt className="text-body-xs text-muted-foreground">{row.label}</dt>
						<dd className="text-end text-mono-caption tabular-nums">{row.value}</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

/**
 * One editable anchor. Shows the live value until you set it, then yours; the
 * reset hands the domain back to the preset.
 */
export function AnchorField({
	label,
	value,
	measured,
	onChange,
	min,
	max,
	step = 1,
	suffix = "px",
	prefix,
}: {
	label: string
	value: number | null
	measured: number | null | undefined
	onChange: (next: number | null) => void
	min: number
	max: number
	step?: number
	suffix?: string
	prefix: string
}) {
	const shown = value ?? measured ?? min
	return (
		// The field's right edge lines up with the value column below it; the
		// reset rides beside the label and takes no room until there is something
		// to reset, so the field never shifts and no gap is reserved for it.
		<div className="flex items-center gap-3">
			<span className="flex min-w-0 flex-1 items-center gap-1 text-body-sm">
				<span className="truncate">{label}</span>
				{value != null ? (
					<ChromeTip label="Back to the preset">
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label={`Reset ${label.toLowerCase()}`}
							onClick={() => onChange(null)}
							className="shrink-0 text-muted-foreground"
						>
							<Icon name="refresh" />
						</Button>
					</ChromeTip>
				) : null}
			</span>
			<ScrubField
				label={label}
				prefix={prefix}
				suffix={suffix}
				value={Math.round(shown / step) * step}
				min={min}
				max={max}
				step={step}
				onValueChange={(next) => onChange(next)}
				className="w-24 shrink-0"
			/>
		</div>
	)
}

export const TYPE_ROWS: Row[] = [
	{ label: "Display", type: "text-display-lg" },
	{ label: "Heading 1", type: "text-heading-1" },
	{ label: "Heading 2", type: "text-heading-2" },
	{ label: "Heading 3", type: "text-heading-3" },
	{ label: "Heading 4", type: "text-heading-4" },
	{ label: "Title", type: "text-title-lg" },
	{ label: "Body", type: "text-body-md" },
	{ label: "Body small", type: "text-body-sm" },
	{ label: "Label", type: "text-label-md" },
	{ label: "Caption", type: "text-caption" },
	{ label: "Mono", type: "text-mono-md" },
]

export const CONTROL_ROWS: Row[] = [
	{ label: "Extra small", token: "--control-xs" },
	{ label: "Small", token: "--control-sm" },
	{ label: "Medium", token: "--control-md" },
	{ label: "Call to action", token: "--control-cta" },
	{ label: "Large", token: "--control-lg" },
]

export const SPACING_ROWS: Row[] = [
	{ label: "Gap between controls", token: "--control-gap" },
	{ label: "Row padding", token: "--item-px" },
	{ label: "Gap inside a row", token: "--item-gap" },
]

export const RADIUS_ROWS: Row[] = [
	{ label: "Extra small", token: "--radius-xs" },
	{ label: "Small", token: "--radius-sm" },
	{ label: "Medium", token: "--radius-md" },
	{ label: "Large", token: "--radius-lg" },
	{ label: "Extra large", token: "--radius-xl" },
	{ label: "Buttons", token: "--button-radius" },
]

export const MOTION_ROWS: Row[] = [
	{ label: "Instant", token: "--motion-duration-instant", kind: "time" },
	{ label: "Fast", token: "--motion-duration-fast", kind: "time" },
	{ label: "Base", token: "--motion-duration-base", kind: "time" },
	{ label: "Slow", token: "--motion-duration-slow", kind: "time" },
	{ label: "Enter", token: "--motion-duration-enter", kind: "time" },
	{ label: "Exit", token: "--motion-duration-exit", kind: "time" },
]

/** The current value of each advanced anchor, in Inspector order. */
export const ANCHOR_ROWS: Row[] = [
	{ label: "Body", type: "text-body-md" },
	{ label: "Medium control", token: "--control-md" },
	{ label: "Row padding", token: "--item-px" },
	{ label: "Medium radius", token: "--radius-md" },
	{ label: "Base duration", token: "--motion-duration-base", kind: "time" },
]
