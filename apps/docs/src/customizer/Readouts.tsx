import { Button, Icon, ScrubField, cn } from "@sableui/react"
import { useTheme } from "../theme"
import { useLookProbe } from "./apply"
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
	/** The ladder cell's name: a few characters, since a cell is ~52px. */
	short: string
	/** A custom property to resolve… */
	token?: string
	/** …or a utility class to apply and read the font size of (type tiers, so
	 * the class's own fallbacks count, as they do on the page). */
	type?: string
	kind?: Kind
}

/**
 * Each row resolved to a number on the shared probe: rendered px for lengths,
 * ms for times. Lengths resolve through `min-width`, whose computed value is
 * the absolute length without a layout (a resolved `width` is the used value,
 * which forced a layout of the whole page per read).
 */
function measure(probe: HTMLElement, rows: readonly Row[]): (number | null)[] {
	return rows.map(({ token, type, kind = "length" }) => {
		probe.className = type ?? ""
		probe.style.removeProperty("min-width")
		probe.style.removeProperty("transition-duration")
		if (token) probe.style.setProperty(kind === "time" ? "transition-duration" : "min-width", `var(${token})`)
		const computed = getComputedStyle(probe)
		const n = Number.parseFloat(type ? computed.fontSize : kind === "time" ? computed.transitionDuration : computed.minWidth)
		if (!Number.isFinite(n)) return null
		return kind === "time" ? Math.round(n * 1000) : Math.round(n * 10) / 10
	})
}

function format(value: number | null | undefined, kind: Kind = "length"): string {
	if (value == null) return "—"
	if (kind === "time") return `${value}ms`
	return value >= 999 ? "Pill" : `${value}px`
}

/**
 * Live measurements of `rows`, re-read after the look is applied — in the
 * panel's shared probe pass, and once a drag settles (see apply.ts). Only
 * while the numbers are on screen (`enabled`).
 */
export function useMeasured(rows: readonly Row[], enabled = true): (number | null)[] {
	const { mode } = useTheme()
	return useLookProbe((probe) => measure(probe, rows), [rows, mode], enabled) ?? []
}

/**
 * A ladder: every step a domain resolves to, as one compact grid of name and
 * value — what a design tool shows as a token scale. Read-only, so it carries
 * no field surface; the anchor above it is the thing you edit.
 */
export function Ladder({ rows, caption }: { rows: { label: string; short: string; value: string }[]; caption?: string }) {
	return (
		<div className="grid gap-1 pt-0.5">
			{caption ? <span className="text-ui-micro text-muted-foreground">{caption}</span> : null}
			<dl className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-x-2 gap-y-1.5">
				{rows.map((row) => (
					<div key={row.label} title={`${row.label}: ${row.value}`} className="grid min-w-0">
						<dt className="truncate text-ui-micro text-muted-foreground">{row.short}</dt>
						<dd className="truncate text-ui-num">{row.value}</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

/** A ladder whose values are measured live from the page. */
export function MeasuredLadder({ rows, caption }: { rows: Row[]; caption?: string }) {
	const values = useMeasured(rows)
	return <Ladder caption={caption} rows={rows.map((row, i) => ({ label: row.label, short: row.short, value: format(values[i], row.kind) }))} />
}

/**
 * One editable anchor: a ScrubField whose glyph is the drag handle. Shows the
 * live value until you set it, then yours.
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
		<ScrubField
			label={label}
			prefix={prefix}
			suffix={suffix}
			value={Math.round(shown / step) * step}
			min={min}
			max={max}
			step={step}
			onValueChange={(next) => onChange(next)}
			className="min-w-0"
		/>
	)
}

/**
 * An anchor's caption, with its way back to the preset beside the name once
 * it is set — where a tool puts "reset to default", out of the field's row so
 * the field never moves under a scrub. Pulled into the caption's line height,
 * so appearing never pushes the row down.
 */
export function AnchorCaption({ label, set, onReset }: { label: string; set: boolean; onReset: () => void }) {
	return (
		<span className="flex min-w-0 items-center justify-between gap-1">
			<span className="truncate">{label}</span>
			{set ? (
				<ChromeTip label="Back to the preset">
					<Button variant="ghost" size="icon-xs" aria-label={`Reset ${label.toLowerCase()}`} onClick={onReset} className="-my-1 shrink-0 text-muted-foreground">
						<Icon name="refresh" />
					</Button>
				</ChromeTip>
			) : null}
		</span>
	)
}

/**
 * A section's own reset, for a PanelSection header. Always mounted, so the
 * header keeps one size whether or not there is something to reset: hidden and
 * out of the tab order until the section changes. It is as tall as the header;
 * PanelSection's own gap under the header keeps its hover pill off the first
 * control.
 */
export function SectionReset({ label, changed, onReset }: { label: string; changed: boolean; onReset: () => void }) {
	return (
		<Button
			variant="ghost"
			size="xs"
			aria-label={`Reset ${label.toLowerCase()}`}
			aria-hidden={!changed || undefined}
			tabIndex={changed ? undefined : -1}
			disabled={!changed}
			onClick={onReset}
			className={cn("shrink-0 text-muted-foreground", !changed && "invisible")}
		>
			Reset
		</Button>
	)
}

export const TYPE_ROWS: Row[] = [
	{ label: "Display", short: "Disp", type: "text-display-lg" },
	{ label: "Heading 1", short: "H1", type: "text-heading-1" },
	{ label: "Heading 2", short: "H2", type: "text-heading-2" },
	{ label: "Heading 3", short: "H3", type: "text-heading-3" },
	{ label: "Heading 4", short: "H4", type: "text-heading-4" },
	{ label: "Title", short: "Title", type: "text-title-lg" },
	{ label: "Body", short: "Body", type: "text-body-md" },
	{ label: "Body small", short: "Small", type: "text-body-sm" },
	{ label: "Label", short: "Label", type: "text-label-md" },
	{ label: "Caption", short: "Cap", type: "text-caption" },
	{ label: "Mono", short: "Mono", type: "text-mono-md" },
]

export const CONTROL_ROWS: Row[] = [
	{ label: "Extra small", short: "XS", token: "--control-xs" },
	{ label: "Small", short: "S", token: "--control-sm" },
	{ label: "Medium", short: "M", token: "--control-md" },
	{ label: "Call to action", short: "CTA", token: "--control-cta" },
	{ label: "Large", short: "L", token: "--control-lg" },
]

export const SPACING_ROWS: Row[] = [
	{ label: "Baseline — one line of body text", short: "Line", token: "--baseline" },
	{ label: "Baseline step — what line heights and gaps land on", short: "Step", token: "--baseline-step" },
	{ label: "Gap between controls", short: "Gap", token: "--control-gap" },
	{ label: "Row padding", short: "Pad", token: "--item-px" },
	{ label: "Gap inside a row", short: "Inner", token: "--item-gap" },
]

export const RADIUS_ROWS: Row[] = [
	{ label: "Extra small", short: "XS", token: "--radius-xs" },
	{ label: "Small", short: "S", token: "--radius-sm" },
	{ label: "Medium", short: "M", token: "--radius-md" },
	{ label: "Large", short: "L", token: "--radius-lg" },
	{ label: "Extra large", short: "XL", token: "--radius-xl" },
	{ label: "Buttons", short: "Button", token: "--button-radius" },
]

export const MOTION_ROWS: Row[] = [
	{ label: "Instant", short: "Instant", token: "--motion-duration-instant", kind: "time" },
	{ label: "Fast", short: "Fast", token: "--motion-duration-fast", kind: "time" },
	{ label: "Base", short: "Base", token: "--motion-duration-base", kind: "time" },
	{ label: "Slow", short: "Slow", token: "--motion-duration-slow", kind: "time" },
	{ label: "Enter", short: "Enter", token: "--motion-duration-enter", kind: "time" },
	{ label: "Exit", short: "Exit", token: "--motion-duration-exit", kind: "time" },
]

/** The current value of each advanced anchor, in Inspector order. */
export const ANCHOR_ROWS: Row[] = [
	{ label: "Body", short: "Body", type: "text-body-md" },
	{ label: "Medium control", short: "M", token: "--control-md" },
	{ label: "Baseline step", short: "Step", token: "--baseline-step" },
	{ label: "Medium radius", short: "M", token: "--radius-md" },
	{ label: "Base duration", short: "Base", token: "--motion-duration-base", kind: "time" },
]

/**
 * The shadow ladder as what it is — five surfaces wearing each step — since a
 * shadow has no single number worth a cell. Each step's longest drop is its
 * hover text. On a well, so the shadows have a ground to fall on.
 */
export function ShadowSteps({ steps }: { steps: { label: string; short: string; shadow: string; value: string }[] }) {
	return (
		<div className="grid grid-cols-5 gap-2 overflow-hidden rounded-sm sable-well px-2.5 pt-3 pb-2" role="img" aria-label="Shadow ladder">
			{steps.map((step) => (
				<div key={step.label} title={`${step.label}: ${step.value}`} className="grid justify-items-center gap-2">
					<span className="h-6 w-full max-w-10 rounded-xs bg-popover" style={{ boxShadow: step.shadow }} />
					<span className="text-ui-micro text-muted-foreground">{step.short}</span>
				</div>
			))}
		</div>
	)
}
