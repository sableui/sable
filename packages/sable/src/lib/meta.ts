/**
 * Machine-readable component metadata — the AI-readable surface of the system.
 * Each component ships a `<name>.meta.ts` exporting one `ComponentMeta`. These
 * aggregate into `registry.json` and are what other agents read to understand
 * the component's contract. Keep meta in sync with the component.
 */

export interface PropMeta {
	name: string
	type: string
	default?: string
	description: string
	/**
	 * Set when the prop is deprecated: what to use instead. The registry
	 * contract refuses "deprecated" in prose without it, so an agent reads a
	 * field rather than interpreting a sentence.
	 */
	deprecated?: string
}

export interface ExampleMeta {
	label: string
	/** A self-contained JSX snippet demonstrating the example. */
	code: string
}

export interface BestPracticeMeta {
	/** Whether this is positive guidance or an anti-pattern to avoid. */
	guidance: "do" | "dont"
	/** Short design guidance focused on when and how to use the component. */
	description: string
}

export interface AnatomyMeta {
	/** Visible or structural part name, e.g. "Label", "Trigger", "Content". */
	name: string
	/** Whether the part is required for the component to make sense. */
	required: boolean
	/** The role this part plays in the composed UI. */
	description: string
}

export interface UsageMeta {
	/** What the component is for and when to reach for it. */
	description: string
	/** Do/don't guidance for designers, developers, and AI agents. */
	bestPractices?: BestPracticeMeta[]
	/** Structural parts that make up the component. */
	anatomy?: AnatomyMeta[]
}

/**
 * The four roles motion plays in a component. Every component fills the slots
 * that apply to it and explicitly declines the ones that don't.
 *
 * The vocabulary exists because the motion rules were entirely PROHIBITIVE:
 * `raw-duration`, `builtin-animate`, the bare-colour-transition rule and
 * `unknown-motion` all fire on motion that is present and wrong, and not one of
 * them can fire on motion that is absent. A component with no motion passed every gate
 * in the system. That is precisely the shape an agent optimises into — it writes
 * what is checked — so the catalog filled up with correct, static components and
 * motion became a thing a human had to ask for by name, every time.
 *
 *   arrival     how it enters the page or becomes visible
 *   response    what it does under the pointer — hover, press, focus
 *   transition  how it moves between its own states (open/closed, on/off)
 *   activity    what it does while working, indeterminately
 *
 * The slots are deliberately about the USER'S experience of the component, not
 * about CSS mechanism, so "which slots apply here" is answerable from the
 * component's purpose before a line of it is written.
 */
export type MotionSlot = "arrival" | "response" | "transition" | "activity"

export interface MotionMeta {
	/** Which of the four roles this entry covers. */
	slot: MotionSlot
	/**
	 * The motion recipe that fills it — `motion-interactive`, `motion-pop`,
	 * `motion-disclosure`, … — validated against the recipes the package
	 * actually ships, so a renamed recipe cannot rot here silently.
	 *
	 * Two literals are sanctioned besides a recipe name:
	 *
	 *   "none"    the slot does NOT apply here, and this is the only way to say so
	 *   "custom"  the slot is filled outside the recipe layer — a rAF loop, a
	 *             canvas, a Base UI transition — because no CSS utility can
	 *             express it. ThinkingOrb draws a point cloud per frame; there is
	 *             no recipe that could ever cover it, and forcing it to claim
	 *             `"none"` would file a component that never stops moving under
	 *             "does not animate".
	 *
	 * Both still require a `why`, as does a filled slot. An unfilled slot is
	 * either a considered decision or an oversight, and the difference has to be
	 * legible to the next reader; a `"custom"` with no explanation is just an
	 * opt-out with extra steps. This mirrors `design-lint-disable … -- <reason>`:
	 * the exception is allowed, the silent exception is not.
	 */
	recipe: string
	/**
	 * The anatomy part it applies to ("Trigger", "Panel", "root"). Motion that
	 * cannot name what moves is usually motion nobody checked.
	 */
	part: string
	/**
	 * Why this slot resolves this way here. Not a restatement of the recipe —
	 * `"motion-pop on the panel"` says nothing a reader could not already see.
	 * State what the motion is FOR: what the user would misread without it.
	 */
	why: string
}

export interface RelatedMeta {
	/** Components commonly composed with, compared to, or preferred over this one. */
	components?: string[]
	/** Canonical page patterns that show this component in context. */
	patterns?: string[]
}

/**
 * A composed child component exported alongside the root (e.g. ProgressTrack,
 * SelectItem) — a separate element in JSX, NOT a prop of the root. Keeping
 * these out of `props` is what tells a consumer to write
 * `<Progress><ProgressTrack/></Progress>` rather than
 * `<Progress ProgressTrack={{…}}/>`.
 */
export interface SubcomponentMeta {
	/** Exported component name, e.g. "ProgressTrack". */
	name: string
	/** The props it accepts (same shorthand style as PropMeta.type). */
	type: string
	description: string
}

/**
 * Machine-readable metadata for a page pattern — a canonical full-page
 * composition in `src/patterns/`. The pattern's *source* is the contract: the
 * registry generator extracts the code after the `// ---pattern-code---` marker
 * verbatim, so what ships in `registry.json → patterns` always compiles.
 */
export interface PatternMeta {
	/** Pattern name, e.g. "SettingsPage". */
	name: string
	/** One-line summary. */
	summary: string
	/** When to reach for this shell — and when not to. */
	intent: string
	/** Canonical decisions the pattern encodes (region cap, rhythm, hierarchy). */
	notes?: string[]
	/** Accessibility notes. */
	a11y?: string[]
}

/**
 * A block: a section-sized composition of components with sample content —
 * smaller than a page shell, with no behaviour of its own to upgrade. Ships
 * the way patterns do (copy-in source + importable preview). Its props are
 * the block contract only — `className`, `framed` on Card-built blocks, and
 * the primary action's callback — never content; content is the constant at
 * the top of the source, edited after copying.
 */
export interface BlockMeta {
	/** Block name, e.g. "SignInBlock". Always ends in "Block". */
	name: string
	/** One-line summary. */
	summary: string
	/** When to reach for this block — and when a component or page shell fits better. */
	intent: string
	/**
	 * "card" — one self-contained object that fills its container up to a
	 * designed width. "section" — a full-width band of a page.
	 */
	kind: "card" | "section"
	/**
	 * The width range it is designed for, as CSS lengths. The block renders
	 * `w-full` capped at `max`; `min` is the narrowest it still holds together
	 * (a grid's `minItemWidth`). Section blocks omit it.
	 */
	width?: { min: string; max: string }
	/** Groups related blocks in the catalog ("Auth", "Commerce", …). */
	family: string
	/** Canonical decisions the block encodes. */
	notes?: string[]
	/** Accessibility notes. */
	a11y?: string[]
}

export interface ComponentMeta {
	/** Public component name, e.g. "Button". Must be an actual export. */
	name: string
	/**
	 * Set when `name` labels a SYSTEM rather than a single importable value —
	 * `Toast` is `ToastProvider` + `toast()` + parts, and nothing is exported as
	 * plain `Toast`. The build otherwise requires `name` to exist in the package's
	 * export surface, because the catalog is the API as far as an agent is
	 * concerned and `import { Error }` (for `ErrorState`) was written by every
	 * agent that read it. Declaring this is a visible claim that the name is a
	 * family label; do not reach for it to silence an ordinary mismatch.
	 */
	system?: boolean
	/** One-line summary. */
	summary: string
	/** Search terms and synonyms agents/users might use to discover it. */
	keywords?: string[]
	/** Usage guidance: intent, do/don'ts, and anatomy. */
	usage?: UsageMeta
	/** Related components and patterns for composition/choice guidance. */
	related?: RelatedMeta
	/** Maturity. */
	/**
	 * Maturity.
	 *
	 * `deprecated` exists because it had to: `CategoryPill` announced
	 * "DEPRECATED" in its summary prose while carrying `status: "stable"`, since
	 * the union had no way to say otherwise. An agent reading the contract would
	 * have used it without hesitation. A deprecated component MUST also name its
	 * replacement in `supersededBy` — build-registry enforces both directions, so
	 * prose and status cannot disagree again.
	 */
	status: "stable" | "beta" | "planned" | "deprecated"
	/**
	 * What to use instead. Required when `status` is `deprecated`, and meaningless
	 * otherwise — a deprecation with no forward path just strands the reader.
	 */
	supersededBy?: string
	/**
	 * Marks a composition: a designed arrangement of parts for one kind of item
	 * (a cover tile, a calendar date), not a behaviour. Agents treat it as a
	 * reference, used when its layout fits the brief, otherwise rebuilt to the
	 * product's own design from the parts named here (e.g. "AspectBox,
	 * MediaImage, Card render, Badge"). Behaviour components never set it: those
	 * are always used, never rebuilt.
	 */
	composition?: string
	/** Public props of the root component only — never subcomponents. */
	props: PropMeta[]
	/**
	 * Composed child components, if any. A component that lists subcomponents
	 * must also ship at least one example showing the composed JSX form.
	 */
	subcomponents?: SubcomponentMeta[]
	/** Variant axis → allowed values. */
	variants?: Record<string, string[]>
	/** Semantic tokens the component reads (for theming audits). */
	tokensUsed: string[]
	/**
	 * How the component moves, one entry per applicable motion slot.
	 *
	 * Ordering follows the slot vocabulary (arrival → response → transition →
	 * activity), which is also the order a user encounters them.
	 */
	motion?: MotionMeta[]
	/** Accessibility notes. */
	a11y?: string[]
	/** Usage examples. */
	examples: ExampleMeta[]
}
