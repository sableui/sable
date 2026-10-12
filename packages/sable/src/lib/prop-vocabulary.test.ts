import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/*
 * One vocabulary for the props every component shares. tone-vocabulary.test
 * holds the VALUES of `tone`; this holds the NAMES of the axes and callbacks.
 *
 * Before the 0.65 review the same idea was spelled several ways — Banner's
 * emphasis was `fill`, Note's meaning was `variant`, Toast's was `type`, and
 * DatePicker reported with `onChange` while every other value control used
 * `onValueChange`. Each spelling was reasonable alone; together they meant an
 * agent (or a person) could not carry what it learned on one component to the
 * next. A new axis name is a decision, recorded below with what it means.
 */

const registry = JSON.parse(readFileSync(join(__dirname, "../../registry.json"), "utf8")) as {
	components: {
		name: string
		variants?: Record<string, string[]>
		props?: { name: string; type?: string; deprecated?: string }[]
	}[]
}

/** The axis names, and what each one is for. */
const AXES: Record<string, string> = {
	variant: "how the component is drawn, when it has one styling axis (Button, Card)",
	appearance: "how it is drawn, when `tone` carries meaning beside it (Badge, Banner, Spinner)",
	tone: "what it means — values from the shared tone list",
	size: "its footprint on the size ladder",
	shape: "its geometry when the same measurement draws two ways (Meter bar | ring)",
	density: "row/padding rhythm (Card, Entity)",
	orientation: "which way it runs",
	side: "which edge it attaches to",
	align: "which side its content sits on",
	surface: "whether it brings its own surface (EmptyState none | card)",
	status: "a lifecycle state (an upload, a step) — not a severity",
	mode: "a selection model (Calendar single | range)",
	indicator: "what marks each item in a sequence (Stepper number | dot)",
	aspect: "a media frame's proportions (MediaTile square | video | poster) — named for CSS aspect-ratio",
	fit: "how media fills its frame (MediaImage cover | contain) — named for CSS object-fit",
	bleed:
		"which inline edge a borderless control's box extends past, by exactly its own padding, so its label sits on the content edge (Button start | end | both | none) — the popup-bleed / Bleed sense: escape the inset by the inset",
	// States and single-component geometry, documented as variants because they
	// change classes: not shared axes, and not candidates for a synonym.
	selected: "state",
	invalid: "state",
	wheelScroll: "Scroller behaviour",
	tail: "Bubble geometry",
	cols: "Description layout",
	gap: "MessageScroller spacing",
	avatarSize: "Message's avatar, on Avatar's size ladder",
	overlay: "NotificationBadge placement: pinned to its host's top-end corner",
}

/** Spellings that have each been someone's name for an axis above. */
const SYNONYMS: Record<string, string> = {
	kind: "variant or tone",
	intent: "tone",
	color: "tone",
	fill: "appearance",
	emphasis: "appearance",
	look: "appearance",
	level: "tone",
	severity: "tone",
	scale: "size",
	outdent: "bleed",
	hang: "bleed",
}

const SIZE_WORDS = new Set(["xs", "sm", "md", "lg", "xl"])

/** Which callback reports which controlled prop. */
const CALLBACK: Record<string, string> = {
	value: "onValueChange",
	checked: "onCheckedChange",
	open: "onOpenChange",
	expanded: "onExpandedChange",
}
/** `value` that is an item's identity or a reading, not a controlled value. */
const VALUE_IS_NOT_CONTROLLED = new Set([
	"Checkbox", // the value submitted with a group
	"CheckboxCard",
	"RadioCard", // which option this card is
	"Meter", // a reading
	"Progress",
])

describe("prop vocabulary", () => {
	it("names every variant axis from the shared list", () => {
		const offenders = registry.components.flatMap((c) =>
			Object.keys(c.variants ?? {})
				.filter((axis) => !(axis in AXES))
				.map((axis) =>
					SYNONYMS[axis]
						? `${c.name}: "${axis}" — call it ${SYNONYMS[axis]}`
						: `${c.name}: "${axis}" is a new axis name — reuse one, or add it to AXES with what it means`,
				),
		)
		expect(offenders).toEqual([])
	})

	it("uses no synonym for a shared axis as a prop name", () => {
		const offenders = registry.components.flatMap((c) =>
			(c.props ?? [])
				.filter((p) => p.name in SYNONYMS)
				.map((p) => `${c.name}: prop "${p.name}" — call it ${SYNONYMS[p.name]}`),
		)
		expect(offenders).toEqual([])
	})

	it("keeps size words on `size`", () => {
		// `variant="sm"` or `appearance="lg"` hides a size ladder inside a style axis.
		const offenders = registry.components.flatMap((c) =>
			Object.entries(c.variants ?? {})
				.filter(([axis]) => axis !== "size" && axis !== "avatarSize" && axis !== "gap")
				.flatMap(([axis, values]) =>
					values.filter((v) => SIZE_WORDS.has(v)).map((v) => `${c.name}: ${axis}="${v}" is a size`),
				),
		)
		expect(offenders).toEqual([])
	})

	it("reports each controlled prop with its own on…Change callback", () => {
		const offenders = registry.components.flatMap((c) => {
			const names = new Set((c.props ?? []).map((p) => p.name))
			return Object.entries(CALLBACK)
				.filter(([prop]) => names.has(prop))
				.filter(([prop]) => !(prop === "value" && VALUE_IS_NOT_CONTROLLED.has(c.name)))
				.filter(([, callback]) => !names.has(callback))
				.map(([prop, callback]) => `${c.name}: documents \`${prop}\` but not \`${callback}\``)
		})
		expect(offenders).toEqual([])
	})

	it("has no bare onChange as a component's value callback", () => {
		// `onChange` is the DOM's event on a native field; a component's value
		// callback is on<Thing>Change. A kept alias must be declared deprecated.
		const offenders = registry.components.flatMap((c) =>
			(c.props ?? [])
				.filter((p) => p.name === "onChange" && !p.deprecated)
				.map(() => `${c.name}: onChange — use onValueChange (or declare it deprecated)`),
		)
		expect(offenders).toEqual([])
	})
})
