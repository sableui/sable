/**
 * Foundations — the system's rules as typed data.
 *
 * Typography, motion, spacing, shape, surfaces, scrolling and accessibility
 * rules used to live as prose spread across AGENTS.md and DESIGN.md, which is
 * where agents least often read and where they drifted from the docs pages.
 * Each foundation is now ONE object, rendered three ways from the same source:
 *
 *   - the docs site's foundation pages (rules, no-gos and demos)
 *   - `llms/foundations/<slug>.md`, served as `sable docs <slug>`
 *   - `registry.json → foundations`
 *
 * `build-registry` generates the second and third, so a rule cannot say one
 * thing on the site and another to an agent.
 *
 * Every rule is short enough to obey without reading the rationale; `why` is
 * there for when a rule seems wrong. `enforcedBy` names the gate that checks it
 * (a `sable-lint` rule id, a test, or the registry build). A rule with no gate
 * is a judgment call, and should read like one.
 */

/** One entry of a closed vocabulary — a type tier, a duration, a radius step. */
export interface FoundationTerm {
	/** The name an author writes: a utility, a token, a recipe. */
	name: string
	/** The value it carries in the default theme, as a reader would say it. */
	value: string
	/** When to reach for it. One line. */
	use: string
}

export interface FoundationVocabulary {
	title: string
	/** Optional one-line framing shown above the table. */
	note?: string
	terms: readonly FoundationTerm[]
}

export interface FoundationRule {
	rule: string
	why: string
	/** The gate that checks it: a sable-lint rule id, a test file, or "build-registry". */
	enforcedBy?: string
}

export interface FoundationNoGo {
	never: string
	instead: string
	why: string
	enforcedBy?: string
}

/** A small, measurable detail, shown as before/after code. */
export interface FoundationDetail {
	title: string
	before: string
	after: string
	why: string
}

export interface Foundation {
	slug: string
	title: string
	/** One sentence: what this foundation governs. */
	summary: string
	/** The headline count, e.g. "6 families · 2 text colors · 1 utility per node". */
	headline: string
	vocabularies: readonly FoundationVocabulary[]
	rules: readonly FoundationRule[]
	noGos: readonly FoundationNoGo[]
	details: readonly FoundationDetail[]
	/** Other foundation slugs, docs slugs, or CLI commands worth reading next. */
	related: readonly string[]
}
