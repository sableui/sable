import {
	Button,
	CodeBlock,
	type ComponentMeta,
	Input,
	type PropMeta,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	Switch,
	cn,
} from "@sableui/react"
import { type ReactNode, useMemo, useState } from "react"
import { Segmented } from "../customizer/controls"

/**
 * The prop playground.
 *
 * Every control here is DERIVED from `ComponentMeta` — the same contract the
 * registry publishes and agents read. Nothing is hand-listed, which is the
 * whole point: a playground maintained by hand is a second description of the
 * API that drifts from the first one, and Sable already learned that lesson
 * when the docs nav was hand-listed and four components shipped invisible for
 * four releases.
 *
 * It follows that adding a variant to a component adds a control here for free,
 * and that a control appearing for a prop that does not exist is a meta bug
 * worth seeing rather than a docs bug worth patching.
 */

export type PlaygroundValue = string | boolean

/**
 * A slot prop (a ReactNode like `iconStart`) that meta cannot describe as a
 * finite choice. The preview supplies a sample element and its source text;
 * the control is an on/off switch, and the snippet writes `prop={source}`.
 */
export interface PlaygroundSlot {
	prop: string
	label: string
	element: ReactNode
	source: string
}

export interface PlaygroundControl {
	prop: string
	kind: "enum" | "boolean"
	options: string[]
	initial: PlaygroundValue
	description?: string
}

/** `"primary"` → `primary`. Meta stores defaults as source text. */
function unquote(value: string | undefined): string | undefined {
	if (value === undefined) return undefined
	return value.replace(/^["']|["']$/g, "")
}

function isBooleanAxis(options: string[]): boolean {
	return (
		options.length === 2 &&
		options.every((option) => option === "true" || option === "false")
	)
}

/** A string-union prop type (`"a" | "b"`) parsed into its members. */
function unionMembers(type: string): string[] | null {
	const parts = type.split("|").map((part) => part.trim())
	if (parts.length < 2) return null
	if (!parts.every((part) => /^"[^"]*"$/.test(part))) return null
	return parts.map((part) => part.slice(1, -1))
}

/**
 * Controls for a component, from its variant axes first (the curated list) and
 * then any boolean or string-union prop the axes did not already cover.
 */
export function deriveControls(meta: ComponentMeta): PlaygroundControl[] {
	const propsByName = new Map<string, PropMeta>(
		meta.props.map((prop) => [prop.name, prop]),
	)
	const controls: PlaygroundControl[] = []
	const seen = new Set<string>()

	for (const [prop, options] of Object.entries(meta.variants ?? {})) {
		if (!options.length) continue
		seen.add(prop)
		const propMeta = propsByName.get(prop)
		const fallback = unquote(propMeta?.default)
		if (isBooleanAxis(options)) {
			controls.push({
				prop,
				kind: "boolean",
				options,
				initial: fallback === "true",
				description: propMeta?.description,
			})
			continue
		}
		controls.push({
			prop,
			kind: "enum",
			options,
			initial: fallback && options.includes(fallback) ? fallback : options[0],
			description: propMeta?.description,
		})
	}

	for (const prop of meta.props) {
		if (seen.has(prop.name)) continue
		if (prop.type === "boolean") {
			controls.push({
				prop: prop.name,
				kind: "boolean",
				options: ["true", "false"],
				initial: unquote(prop.default) === "true",
				description: prop.description,
			})
			continue
		}
		const members = unionMembers(prop.type)
		if (members) {
			const fallback = unquote(prop.default)
			controls.push({
				prop: prop.name,
				kind: "enum",
				options: members,
				initial: fallback && members.includes(fallback) ? fallback : members[0],
				description: prop.description,
			})
		}
	}

	return controls
}

/** Values that differ from their control's initial, serialized as JSX props. */
function toSnippet(
	name: string,
	controls: PlaygroundControl[],
	values: Record<string, PlaygroundValue>,
	text?: string,
	fixed: string[] = [],
): string {
	// Props the preview supplies but does not expose as a control — `value={72}`
	// on a ring Meter, the fallback on an Avatar. They belong in the snippet even
	// though nothing here can change them: `<Meter shape="ring" />` pasted into a file
	// renders an empty ring, so a snippet that omits them is wrong, not merely terse.
	const attrs: string[] = [...fixed]
	for (const control of controls) {
		const value = values[control.prop]
		// The snippet is meant to be pasted, so it shows what you'd actually
		// write — a prop left at its default is noise, not instruction.
		if (value === control.initial) continue
		if (control.kind === "boolean") {
			if (value === true) attrs.push(control.prop)
			else attrs.push(`${control.prop}={false}`)
			continue
		}
		attrs.push(`${control.prop}="${String(value)}"`)
	}

	const open = attrs.length ? `<${name} ${attrs.join(" ")}` : `<${name}`
	if (!text) return `${open} />`
	// Wrap once the one-liner stops being readable, the way a formatter would.
	const oneLine = `${open}>${text}</${name}>`
	if (oneLine.length <= 72) return oneLine
	return `${attrs.length ? `<${name}\n\t${attrs.join("\n\t")}\n>` : `<${name}>`}\n\t${text}\n</${name}>`
}

/*
 * Prop names and values are code identifiers (`variant`, `icon-sm`). Shown
 * raw as interface text they read as broken lowercase labels, so the panel
 * speaks in sentence case ("Variant", "Icon small") and the generated JSX
 * below carries the exact values. The raw prop name stays one hover away.
 */
const WORDS: Record<string, string> = {
	xs: "extra small",
	sm: "small",
	md: "medium",
	lg: "large",
	xl: "extra large",
	"2xl": "2× large",
	cta: "CTA",
	id: "ID",
	url: "URL",
}

function humanize(raw: string): string {
	const words = raw
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((w) => WORDS[w.toLowerCase()] ?? w.toLowerCase())
	const text = words.join(" ")
	return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Three options or fewer fit side by side; more read better as a list. */
const SEGMENT_LIMIT = 3

function ControlRow({
	control,
	value,
	onChange,
}: {
	control: PlaygroundControl
	value: PlaygroundValue
	onChange: (next: PlaygroundValue) => void
}) {
	const id = `playground-${control.prop}`
	const label = (
		<label htmlFor={id} className="text-body-sm text-muted-foreground" title={`${control.prop}${control.description ? ` — ${control.description}` : ""}`}>
			{humanize(control.prop)}
		</label>
	)
	return (
		<div className="flex min-h-(--control-md) items-center justify-between gap-3 py-1.5">
			{label}
			{control.kind === "boolean" ? (
				<Switch id={id} checked={value === true} onCheckedChange={(checked: boolean) => onChange(checked)} />
			) : control.options.length <= SEGMENT_LIMIT ? (
				// The same segmented control as the Customize panel: a Sable
				// ToggleGroup on a muted track (arrow keys, pressed state).
				<Segmented
					id={id}
					label={humanize(control.prop)}
					value={String(value)}
					onChange={onChange}
					track="muted"
					fill={false}
					options={control.options.map((option) => ({ value: option, label: humanize(option) }))}
				/>
			) : (
				<Select
					value={String(value)}
					onValueChange={(next) => typeof next === "string" && onChange(next)}
					items={control.options.map((option) => ({ value: option, label: humanize(option) }))}
				>
					{/* The form field, like the Text input above it — the xs rung is the
					    tool-panel field (a fill with no edge), and on a tinted panel like
					    Poppy's it all but vanished. */}
					<SelectTrigger id={id} className="w-40" />
					<SelectContent>
						{control.options.map((option) => (
							<SelectItem key={option} value={option} label={humanize(option)}>
								{humanize(option)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</div>
	)
}

export interface PlaygroundProps {
	meta: ComponentMeta
	/** Renders the live component from the current control values. */
	render: (props: Record<string, PlaygroundValue>, text: string, slots: Record<string, ReactNode>) => ReactNode
	/**
	 * Restrict and order the controls. Useful where a component's full prop
	 * surface is wider than the axes worth playing with.
	 */
	only?: string[]
	/** Seed values that override the ones derived from meta defaults. */
	initial?: Record<string, PlaygroundValue>
	/** Editable text child. Omit for components that take no children. */
	text?: string
	/** Slot props shown as on/off switches with a sample element. */
	slots?: PlaygroundSlot[]
	/**
	 * Replace the generated snippet when the preview renders something the
	 * generic serializer cannot express (an icon-only Button). Return null to
	 * keep the default.
	 */
	snippet?: (values: Record<string, PlaygroundValue>, text: string, slots: Record<string, boolean>) => string | null
	/** Extra classes for the preview stage (e.g. a taller frame). */
	stageClassName?: string
	/**
	 * Attributes the preview passes but does not expose as controls, written as
	 * source text (`value={72}`). They appear in the snippet so it stays
	 * copy-pasteable.
	 */
	fixed?: string[]
}

export function Playground({
	meta,
	render,
	only,
	initial,
	text: initialText,
	stageClassName,
	fixed,
	slots = [],
	snippet: customSnippet,
}: PlaygroundProps) {
	const controls = useMemo(() => {
		const derived = deriveControls(meta)
		if (!only) return derived
		const byName = new Map(derived.map((control) => [control.prop, control]))
		return only
			.map((prop) => byName.get(prop))
			.filter((control): control is PlaygroundControl => Boolean(control))
	}, [meta, only])

	const defaults = useMemo(() => {
		const values: Record<string, PlaygroundValue> = {}
		for (const control of controls) values[control.prop] = control.initial
		return { ...values, ...initial }
	}, [controls, initial])

	const [values, setValues] = useState<Record<string, PlaygroundValue>>(defaults)
	const [text, setText] = useState(initialText ?? "")
	const [slotOn, setSlotOn] = useState<Record<string, boolean>>({})
	const slotElements: Record<string, ReactNode> = Object.fromEntries(
		slots.filter((slot) => slotOn[slot.prop]).map((slot) => [slot.prop, slot.element]),
	)

	const dirty =
		text !== (initialText ?? "") ||
		slots.some((slot) => slotOn[slot.prop]) ||
		controls.some((control) => values[control.prop] !== defaults[control.prop])

	const slotAttrs = slots.filter((slot) => slotOn[slot.prop]).map((slot) => `${slot.prop}={${slot.source}}`)
	const snippet =
		customSnippet?.(values, text, slotOn) ??
		toSnippet(meta.name, controls, values, text || undefined, [...(fixed ?? []), ...slotAttrs])

	if (!controls.length) return null

	return (
		<div data-docs-example className="overflow-hidden rounded-xl border border-border">
			<div className="grid lg:grid-cols-[1fr_18rem]">
				<div
					className={cn(
						"flex min-h-[14rem] flex-wrap items-center justify-center gap-4 bg-background p-8",
						stageClassName,
					)}
				>
					{render(values, text, slotElements)}
				</div>
				<div className="border-t border-border bg-muted/30 p-4 lg:border-t-0 lg:border-l">
					<div className="mb-2 flex items-center justify-between gap-2">
						<h3 className="text-label-md">Properties</h3>
						<Button
							variant="ghost"
							size="xs"
							disabled={!dirty}
							onClick={() => {
								setValues(defaults)
								setText(initialText ?? "")
								setSlotOn({})
							}}
						>
							Reset
						</Button>
					</div>
					{initialText !== undefined ? (
						<div className="flex min-h-(--control-md) items-center justify-between gap-3 py-1.5">
							<label htmlFor="playground-children" className="text-body-sm text-muted-foreground" title="children">
								Text
							</label>
							<Input
								id="playground-children"
								value={text}
								onChange={(event) => setText(event.target.value)}
								className="w-40"
							/>
						</div>
					) : null}
					{slots.map((slot) => (
						<div key={slot.prop} className="flex min-h-(--control-md) items-center justify-between gap-3 py-1.5">
							<label htmlFor={`playground-slot-${slot.prop}`} className="text-body-sm text-muted-foreground" title={slot.prop}>
								{slot.label}
							</label>
							<Switch
								id={`playground-slot-${slot.prop}`}
								checked={slotOn[slot.prop] === true}
								onCheckedChange={(checked: boolean) => setSlotOn((current) => ({ ...current, [slot.prop]: checked }))}
							/>
						</div>
					))}
					{controls.map((control) => (
						<ControlRow
							key={control.prop}
							control={control}
							value={values[control.prop]}
							onChange={(next) =>
								setValues((current) => ({ ...current, [control.prop]: next }))
							}
						/>
					))}
				</div>
			</div>
			<CodeBlock code={snippet} className="rounded-none border-0 border-t" />
		</div>
	)
}
