import { type ComponentMeta, MenuRadioGroup, MenuRadioItem, SettingsMenu, SettingsRow } from "@sableui/react"
import { type ComponentProps, type ReactNode, useState } from "react"
import { deriveControls, type PlaygroundControl, type PlaygroundSlot, type PlaygroundValue } from "../components/Playground"

/*
 * Shared helpers for the playground previews in ./preview-entries.
 *
 * The entries are the ONE hand-written list in the new docs surfaces, and they
 * are hand-written for a reason a generator cannot cover: a live preview needs
 * a plausible child, a stage that fits it, and, for props the meta describes as
 * numbers or nodes, a fixed stand-in. `Meter` cannot derive `value={72}` from
 * its contract, and a playground showing a Meter with no value shows nothing.
 * Everything else still comes from meta: which controls exist, what they
 * offer, and what each defaults to.
 *
 * Each entry is its own module, loaded only when its component page opens
 * (see PREVIEW_LOADERS in ./previews), so a page downloads its own preview
 * rather than every component's.
 */

/**
 * Control values arrive as an untyped bag (the derivation is contract-driven,
 * not type-driven), so each preview asserts the shape its own component wants.
 */
export function as<T>(values: Record<string, PlaygroundValue>): T {
	return values as unknown as T
}

/**
 * The values that differ from their control's default, as JSX attributes with
 * a leading space — for entries that write their own snippet because the props
 * land on a part (`<ToolbarButton>`, `<SheetContent>`) rather than the root.
 */
export function attrs(
	meta: ComponentMeta,
	values: Record<string, PlaygroundValue>,
	names: string[],
	seeded: Record<string, PlaygroundValue> = {},
): string {
	const initial = new Map<string, PlaygroundValue>(
		deriveControls(meta).map((control) => [control.prop, control.initial]),
	)
	for (const [name, value] of Object.entries(seeded)) initial.set(name, value)
	let out = ""
	for (const name of names) {
		const value = values[name]
		if (value === undefined || value === initial.get(name)) continue
		if (value === true) out += ` ${name}`
		else if (value === false) out += ` ${name}={false}`
		else out += ` ${name}="${value}"`
	}
	return out
}

export const THUMBNAIL = "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=400&q=60"
export const STEPS = ["Cart", "Shipping", "Payment", "Review"]

/** The step the Stepper preview stands on, named for the panel. */
export const STEPPER_CONTROLS: PlaygroundControl[] = [
	{
		prop: "current",
		kind: "enum",
		options: STEPS.map((_, i) => String(i)),
		initial: "1",
		label: "Step",
		labels: Object.fromEntries(STEPS.map((step, i) => [String(i), step])),
	},
	{
		prop: "error",
		kind: "boolean",
		options: ["true", "false"],
		initial: false,
		label: "Step failed",
		description: 'status="error" on the current StepperItem',
	},
]

export const TOOLBAR_ITEMS = [
	["bold", "Bold"],
	["italic", "Italic"],
	["link", "Link"],
] as const
/** ToolbarButton's own defaults, which Toolbar's meta does not carry. */
export const TOOLBAR_DEFAULTS = { variant: "ghost", size: "sm" }

export const MODELS = ["Sol", "Luna", "Terra"]

/** SettingsMenu holds a live choice, so its preview keeps one. */
export function SettingsMenuPreview({ values }: { values: Record<string, PlaygroundValue> }) {
	const [model, setModel] = useState(MODELS[0])
	return (
		<SettingsMenu
			{...as<Omit<ComponentProps<typeof SettingsMenu>, "children">>(values)}
			label="Change model"
			summary={model}
		>
			<SettingsRow label="Model" value={model}>
				<MenuRadioGroup value={model} onValueChange={(next) => setModel(String(next))}>
					{MODELS.map((name) => (
						<MenuRadioItem key={name} value={name}>
							{name}
						</MenuRadioItem>
					))}
				</MenuRadioGroup>
			</SettingsRow>
		</SettingsMenu>
	)
}

export interface PreviewEntry {
	meta: ComponentMeta
	/** Renders the component from current control values, the editable child, and any switched-on slots. */
	render: (values: Record<string, PlaygroundValue>, text: string, slots: Record<string, ReactNode>) => ReactNode
	/** Initial text child. Omit for components that take no editable child. */
	text?: string
	/**
	 * Starting values where meta names no default — Toolbar's `size` belongs to
	 * ToolbarButton, so the derived control would open on the first option.
	 */
	initial?: Record<string, PlaygroundValue>
	/** Restrict/order controls where the full prop surface is wider than useful. */
	only?: string[]
	/** Hand-written controls for what meta cannot describe (an imperative call's options). */
	controls?: PlaygroundControl[]
	/** Extra classes for the preview stage. */
	stageClassName?: string
	/** Props the preview hardcodes, as source text, so the snippet stays valid. */
	fixed?: string[]
	/** ReactNode props offered as on/off switches with a sample element. */
	slots?: PlaygroundSlot[]
	/** Custom snippet for previews the generic serializer cannot express. */
	snippet?: (values: Record<string, PlaygroundValue>, text: string, slots: Record<string, boolean>) => string | null
	/** Offer Replay: only for a component that plays something on mount. */
	replayable?: boolean
}

/** The control values a playground opens on — every derived control at default. */
export function previewDefaults(
	entry: PreviewEntry,
): Record<string, PlaygroundValue> {
	const controls = deriveControls(entry.meta)
	const values: Record<string, PlaygroundValue> = {}
	for (const control of controls) {
		if (entry.only && !entry.only.includes(control.prop)) continue
		values[control.prop] = control.initial
	}
	for (const control of entry.controls ?? []) {
		if (entry.only && !entry.only.includes(control.prop)) continue
		values[control.prop] = control.initial
	}
	return { ...values, ...entry.initial }
}
