import {
	Button,
	CodeBlock,
	type ComponentMeta,
	Icon,
	Input,
	type MotionLevel,
	type PropMeta,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SimpleTooltip,
	Switch,
	cn,
	useCopy,
} from "@sableui/react"
import { type ReactNode, useMemo, useState } from "react"
import { Segmented } from "../customizer/controls"
import { type SnippetMotion, agentPrompt, useAgentTheme } from "./agent-prompt"
import { PREVIEW_LEVELS, PreviewMotionScope, PreviewReplayButton, usePreviewMotion } from "./preview-motion"

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
	/** `text` is a free string field; meta never derives one, a preview supplies it. */
	kind: "enum" | "boolean" | "text"
	options: string[]
	initial: PlaygroundValue
	description?: string
	/** Display names for options whose values are not words (`"3000"` → "3s"). */
	labels?: Record<string, string>
	/** Panel label, where the prop name alone would mislead. Defaults to the humanized prop. */
	label?: string
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

/**
 * The snippet at the preview's motion level, and how the level got there: as
 * the component's own `motion` prop when it has one, as a <MotionScope> around
 * JSX otherwise, and not at all for an imperative call (a toast), which only
 * the app-wide provider can reach. The code under the preview is always the
 * code for what the preview is doing.
 */
function withMotion(snippet: string, level: MotionLevel, viaProp: boolean): { code: string; how: SnippetMotion } {
	if (level === "full") return { code: snippet, how: "none" }
	if (viaProp) return { code: snippet, how: "prop" }
	if (!snippet.trimStart().startsWith("<")) return { code: snippet, how: "provider" }
	const body = snippet.split("\n").map((line) => `\t${line}`).join("\n")
	return { code: `<MotionScope level="${level}">\n${body}\n</MotionScope>`, how: "scope" }
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
	// `aria-invalid` is, to the reader, whether the field is invalid.
	const words = raw
		.replace(/^aria-/, "")
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
	const name = control.label ?? humanize(control.prop)
	const optionLabel = (option: string) => control.labels?.[option] ?? humanize(option)
	const label = (
		<label htmlFor={id} className="text-body-sm text-muted-foreground" title={`${control.prop}${control.description ? ` — ${control.description}` : ""}`}>
			{name}
		</label>
	)
	return (
		<div className="flex min-h-(--control-md) items-center justify-between gap-3 py-1.5">
			{label}
			{control.kind === "boolean" ? (
				<Switch id={id} checked={value === true} onCheckedChange={(checked: boolean) => onChange(checked)} />
			) : control.kind === "text" ? (
				<Input id={id} value={String(value)} onChange={(event) => onChange(event.target.value)} className="w-40" />
			) : control.options.length <= SEGMENT_LIMIT ? (
				// The same segmented control as the Customize panel: a Sable
				// ToggleGroup on a muted track (arrow keys, pressed state).
				<Segmented
					id={id}
					label={name}
					value={String(value)}
					onChange={onChange}
					track="muted"
					fill={false}
					options={control.options.map((option) => ({ value: option, label: optionLabel(option) }))}
				/>
			) : (
				<Select
					value={String(value)}
					onValueChange={(next) => typeof next === "string" && onChange(next)}
					items={control.options.map((option) => ({ value: option, label: optionLabel(option) }))}
				>
					{/* The form field, like the Text input above it — the xs rung is the
					    tool-panel field (a fill with no edge), and on a tinted panel like
					    Poppy's it all but vanished. */}
					<SelectTrigger id={id} className="w-40" />
					<SelectContent>
						{control.options.map((option) => (
							<SelectItem key={option} value={option} label={optionLabel(option)}>
								{optionLabel(option)}
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
	/**
	 * Controls meta cannot describe — the options of an imperative call like
	 * `toast.success(title, { description })`, or a field the preview owns.
	 * Listed after the derived ones, and `only` can name and order them too;
	 * pair with `snippet`, since the generic serializer writes them as JSX props.
	 */
	controls?: PlaygroundControl[]
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
	/**
	 * Offer Replay, which remounts the preview so its arrival plays again. Only
	 * for a component that plays something on mount (a chart drawing on);
	 * changing a control already shows the rest.
	 */
	replayable?: boolean
}

export function Playground({
	meta,
	render,
	only,
	initial,
	controls: extra,
	text: initialText,
	stageClassName,
	fixed,
	slots = [],
	snippet: customSnippet,
	replayable = false,
}: PlaygroundProps) {
	const controls = useMemo(() => {
		const all = [...deriveControls(meta), ...(extra ?? [])]
		if (!only) return all
		const byName = new Map(all.map((control) => [control.prop, control]))
		return only
			.map((prop) => byName.get(prop))
			.filter((control): control is PlaygroundControl => Boolean(control))
	}, [meta, only, extra])

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

	// The preview's motion level. A component whose meta derives a `motion`
	// control already plays it through its own prop, so the extra row is only
	// for the rest; one with a `motion` prop the panel can't derive gets the
	// level written into its snippet as that prop.
	const motion = usePreviewMotion()
	const ownMotionControl = controls.some((control) => control.prop === "motion")
	const hasMotionProp = meta.props.some((prop) => prop.name === "motion")
	const level: MotionLevel = ownMotionControl ? "full" : motion.level

	const dirty =
		text !== (initialText ?? "") ||
		level !== "full" ||
		slots.some((slot) => slotOn[slot.prop]) ||
		controls.some((control) => values[control.prop] !== defaults[control.prop])

	const slotAttrs = slots.filter((slot) => slotOn[slot.prop]).map((slot) => `${slot.prop}={${slot.source}}`)
	const custom = customSnippet?.(values, text, slotOn) ?? null
	const viaProp = hasMotionProp && custom === null && level !== "full"
	const generated =
		custom ??
		toSnippet(meta.name, controls, values, text || undefined, [
			...(fixed ?? []),
			...slotAttrs,
			...(viaProp ? [`motion="${level}"`] : []),
		])
	const { code: snippet, how } = withMotion(generated, level, viaProp)

	const theme = useAgentTheme()
	const code = useCopy(snippet)
	const agent = useCopy(() => agentPrompt({ name: meta.name, snippet, level, motion: how, theme }))

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
					<PreviewMotionScope level={level} replayKey={motion.replayKey}>
						{render(values, text, slotElements)}
					</PreviewMotionScope>
				</div>
				<div className="border-t border-border bg-muted/30 p-4 lg:border-t-0 lg:border-l">
					<div className="mb-2 flex items-center justify-between gap-2">
						<h3 className="text-label-md">Properties</h3>
						<div className="flex items-center gap-1">
							{replayable ? <PreviewReplayButton onReplay={motion.replay} /> : null}
							<Button
								variant="ghost"
								size="xs"
								disabled={!dirty}
								onClick={() => {
									setValues(defaults)
									setText(initialText ?? "")
									setSlotOn({})
									motion.setLevel("full")
								}}
							>
								Reset
							</Button>
						</div>
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
					{ownMotionControl ? null : (
						// Not a prop of most components: a <MotionScope> around the
						// preview, written into the snippet so the code still matches.
						<div className="flex min-h-(--control-md) items-center justify-between gap-3 py-1.5">
							<label
								htmlFor="playground-motion"
								className="text-body-sm text-muted-foreground"
								title="Motion level for this preview: Subtle keeps feedback, overlays and loaders and drops the flourishes"
							>
								Motion
							</label>
							<Segmented
								id="playground-motion"
								label="Motion"
								value={motion.level}
								onChange={motion.setLevel}
								track="muted"
								fill={false}
								options={PREVIEW_LEVELS.map((option) => ({ value: option.value, label: option.label, title: option.hint }))}
							/>
						</div>
					)}
				</div>
			</div>
			{/* The code's own bar: copy the JSX, or copy it as a request for a
			    coding agent (imports, setup, the CLI that prints the contract). */}
			<div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5">
				<span className="text-label-md text-muted-foreground ps-2">Code</span>
				<div className="flex items-center gap-1">
					<SimpleTooltip content="The JSX, imports and setup steps, as a prompt">
						<Button
							variant="ghost"
							size="xs"
							iconStart={<Icon name={agent.copied ? "check" : "sparkles"} />}
							onClick={agent.copy}
							className="text-muted-foreground"
						>
							{agent.copied ? "Copied" : "Copy for agent"}
						</Button>
					</SimpleTooltip>
					<Button variant="ghost" size="icon-sm" aria-label="Copy code" onClick={code.copy} className="text-muted-foreground">
						{/* Both glyphs mounted so copy cross-fades to check (the
						    use-copy / CodeBlock pattern), and the status says it aloud. */}
						<span aria-hidden="true" className="motion-icon-swap">
							<span data-active={!code.copied} className="inline-flex">
								<Icon name="copy" />
							</span>
							<span data-active={code.copied} className="inline-flex">
								<Icon name="check" />
							</span>
						</span>
					</Button>
					<span role="status" className="sr-only">
						{code.copied ? "Copied" : ""}
					</span>
				</div>
			</div>
			<CodeBlock code={snippet} showCopy={false} className="rounded-none border-0 border-t" />
		</div>
	)
}
