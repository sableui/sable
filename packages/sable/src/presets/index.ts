import {
	SEMANTIC_TOKENS, MOTION_TOKENS, RADIUS_TOKENS, TYPE_SCALE_TOKENS,
	TYPE_REFINEMENT_TOKENS, TYPE_OVERLINE_TOKENS, DENSITY_TOKENS,
	LAYERING_TOKENS, WORKSPACE_SURFACE_TOKENS, DERIVED_EDGE_TOKENS, TYPE_UI_TOKENS, ART_TOKENS,
	type ThemeManifest,
} from "../themes/_contract"
import { LABEL_CONTRAST_RULE, LABELLED_FILLS, checkLabelledFills, type LabelFinding } from "../themes/contrast"

/** Label-on-fill contrast: build a preset's filled colours with these, not a lightness cut. */
export {
	BRAND_FILLS, LABEL_CONTRAST_RULE, LABELLED_FILLS, STATUS_FILLS, checkLabelledFills, fitFillToInk, inkFor, inkPolarity, labelContrast,
	type LabelFinding, type OklchColor,
} from "../themes/contrast"

/** The public theme vocabulary. Presets never need component overrides. */
export const PRESET_TOKEN_NAMES: readonly string[] = [...new Set([
	...SEMANTIC_TOKENS,
	...WORKSPACE_SURFACE_TOKENS.map(name => `theme-${name}`),
	...DERIVED_EDGE_TOKENS.map(name => `theme-${name}`),
	// Art direction: optional hooks — a preset without them paints the default art.
	...ART_TOKENS.map(name => `theme-${name}`),
	...WORKSPACE_SURFACE_TOKENS, ...DERIVED_EDGE_TOKENS,
	...RADIUS_TOKENS, ...MOTION_TOKENS, ...TYPE_SCALE_TOKENS,
	...TYPE_REFINEMENT_TOKENS, ...TYPE_OVERLINE_TOKENS, ...DENSITY_TOKENS,
	...LAYERING_TOKENS, ...TYPE_UI_TOKENS,
	"font-sans", "font-mono", "font-display", "spacing",
	"theme-shadow-sm", "theme-shadow", "theme-shadow-md", "theme-shadow-lg", "theme-shadow-xl",
	// Chart series colours: optional — a preset without them inherits the Sable theme's validated set.
	"chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7", "chart-8",
])]

export interface SablePreset {
	schemaVersion: 1
	id: string
	label: string
	revision: number
	sableVersion: string
	defaultMode: "light" | "dark"
	fonts: { sans: string; mono: string; display?: string }
	/** Apply alongside tokens: composition, imagery, interaction and motion guidance. */
	direction: string
	references?: { source: string; observation: string; method: "measured" | "estimated" | "derived" | "user-edited" }[]
	tokens: { shared: Record<string, string>; light: Record<string, string>; dark: Record<string, string> }
	/**
	 * Sable's opinions the preset declines, on the record. A check reports an
	 * accepted finding with its reason instead of failing on it.
	 */
	exceptions?: PresetException[]
}

/** A deliberate departure from a Sable check — e.g. a brand that requires dark ink on its primary. */
export interface PresetException {
	rule: typeof LABEL_CONTRAST_RULE
	mode: "light" | "dark"
	/** The fill token, e.g. `primary`. */
	token: (typeof LABELLED_FILLS)[number]
	reason: string
}

const tokenNames = new Set(PRESET_TOKEN_NAMES)
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value)
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0
const safeCss = (value: string) => value.length <= 2048 && !/[;{}<>\\@]|\/\*|\*\/|!important|url\s*\(|expression\s*\(|REPLACE/i.test(value)

/** Structural/contract validation; visual contrast and brief fit still need review. */
/**
 * The status text tokens arrived in 0.6.0. Before them, `text-destructive`,
 * `border-destructive` and the rest read the fill, so a preset saved on 0.5
 * that lacks one takes its fill: it paints exactly as it did, instead of
 * failing every check and vanishing from a browser's saved presets.
 */
const STATUS_TEXT_FROM_FILL = {
	"destructive-text": "destructive",
	"success-text": "success",
	"tone-warning-text": "tone-warning",
	"tone-info-text": "tone-info",
} as const

/** A copy of `input` with any missing status text token filled from its fill, per mode. */
function upgradePreset(input: unknown): unknown {
	if (!record(input) || !record(input.tokens)) return input
	const tokens = input.tokens
	const shared = record(tokens.shared) ? tokens.shared : {}
	const upgraded: Record<string, unknown> = { ...tokens }
	for (const mode of ["light", "dark"] as const) {
		const values = tokens[mode]
		if (!record(values)) continue
		const next: Record<string, unknown> = { ...values }
		for (const [name, fill] of Object.entries(STATUS_TEXT_FROM_FILL)) {
			const value = values[fill] ?? shared[fill]
			if (!text(values[name]) && !text(shared[name]) && text(value)) next[name] = value
		}
		upgraded[mode] = next
	}
	return { ...input, tokens: upgraded }
}

export function validatePreset(raw: unknown): string[] {
	const input = upgradePreset(raw)
	if (!record(input)) return ["Preset must be a JSON object."]
	const issues: string[] = []
	if (input.schemaVersion !== 1) issues.push("Unsupported preset schemaVersion; expected 1.")
	if (typeof input.id !== "string" || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(input.id) || input.id.length > 64) issues.push("id must be a lowercase slug of at most 64 characters.")
	if (!text(input.label) || input.label.length > 120) issues.push("label must contain 1–120 characters.")
	if (!Number.isSafeInteger(input.revision) || Number(input.revision) < 1) issues.push("revision must be a positive integer.")
	if (typeof input.sableVersion !== "string" || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(input.sableVersion)) issues.push("sableVersion must record the package version used to author the preset.")
	if (!["light", "dark"].includes(String(input.defaultMode))) issues.push("defaultMode must be light or dark.")
	if (!text(input.direction) || input.direction.length > 16000) issues.push("direction must contain design guidance, at most 16000 characters.")
	if (!record(input.fonts) || !text(input.fonts.sans) || !text(input.fonts.mono)) issues.push("fonts must declare sans and mono stacks; the app loads their files.")
	else for (const [role, stack] of Object.entries(input.fonts)) {
		if (!["sans", "mono", "display"].includes(role) || !text(stack) || !safeCss(stack)) issues.push(`Invalid font stack: ${role}.`)
	}
	if (input.references !== undefined) {
		if (!Array.isArray(input.references) || input.references.length > 50) issues.push("references must be an array of at most 50 observations.")
		else input.references.forEach((item, index) => {
			if (!record(item) || !text(item.source) || !text(item.observation) || !["measured", "estimated", "derived", "user-edited"].includes(String(item.method))) issues.push(`Invalid reference observation ${index + 1}.`)
		})
	}
	if (input.exceptions !== undefined) {
		if (!Array.isArray(input.exceptions) || input.exceptions.length > 50) issues.push("exceptions must be an array of at most 50 entries.")
		else input.exceptions.forEach((item, index) => {
			if (!record(item) || item.rule !== LABEL_CONTRAST_RULE || !["light", "dark"].includes(String(item.mode)) || !(LABELLED_FILLS as readonly unknown[]).includes(item.token) || !text(item.reason) || item.reason.length > 500)
				issues.push(`Invalid exception ${index + 1}: needs rule "${LABEL_CONTRAST_RULE}", mode light|dark, token (${LABELLED_FILLS.join(", ")}) and a reason.`)
		})
	}
	if (!record(input.tokens)) return [...issues, "tokens must contain shared, light, and dark objects."]
	const groups = input.tokens
	for (const group of ["shared", "light", "dark"] as const) {
		const values = groups[group]
		if (!record(values)) { issues.push(`tokens.${group} must be an object.`); continue }
		for (const [name, value] of Object.entries(values)) {
			if (!tokenNames.has(name)) issues.push(`Unknown Sable token in ${group}: ${name}. Use names without the -- prefix.`)
			if (!text(value) || !safeCss(value)) issues.push(`Unsafe or empty CSS value for ${group}.${name}.`)
		}
	}
	for (const mode of ["light", "dark"] as const) {
		if (!record(groups[mode])) continue
		for (const name of SEMANTIC_TOKENS) {
			if (!text(groups[mode][name])) issues.push(`Missing ${mode} semantic token: ${name}.`)
		}
		const values = { ...(record(groups.shared) ? groups.shared : {}), ...groups[mode] }
		for (const [name, value] of Object.entries(values)) {
			if (typeof value !== "string") continue
			for (const match of value.matchAll(/var\(\s*--([\w-]+)/g)) {
				if (!tokenNames.has(match[1])) issues.push(`${mode}.${name} depends on an unportable variable: --${match[1]}. Resolve palette values before saving.`)
			}
		}
	}
	if (record(input.fonts)) {
		for (const [role, stack] of Object.entries(input.fonts)) for (const group of ["shared", "light", "dark"]) {
			const values = groups[group]
			if (record(values) && values[`font-${role}`] !== undefined && values[`font-${role}`] !== stack) issues.push(`font-${role} differs from the declared font stack.`)
		}
	}
	return issues
}

export function parsePreset(raw: unknown): SablePreset {
	const issues = validatePreset(raw)
	if (issues.length) throw new Error(issues.join("\n"))
	return upgradePreset(raw) as SablePreset
}

export function presetManifest(input: SablePreset): ThemeManifest {
	const preset = parsePreset(input)
	return { id: preset.id, label: preset.label, modes: ["light", "dark"], defaultMode: preset.defaultMode, fonts: preset.fonts }
}

/** Scoped CSS can coexist with built-in presets. Never changes :root globally. */
export function presetCss(input: SablePreset): string {
	const preset = parsePreset(input)
	const selector = `[data-sable-theme="${preset.id}"]`
	const declarations = (values: Record<string, string>) => Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => {
		// Snapshot durations are nominal times. Retain the live accessibility
		// policy instead of freezing a resolved time into every motion recipe.
		const scaled = name.startsWith("motion-duration-") && !/var\(\s*--motion-(?:scale|duration-)/.test(value)
		return `\t--${name}: ${scaled ? `calc((${value}) * var(--motion-scale, 1))` : value};`
	}).join("\n")
	const shared = { ...preset.tokens.shared, "font-sans": preset.fonts.sans, "font-mono": preset.fonts.mono, "font-display": preset.fonts.display ?? preset.fonts.sans }
	return `${selector} {\n${declarations({ ...shared, ...preset.tokens.light })}\n}\n\n${selector}.dark, .dark ${selector}:not(.light) {\n${declarations(preset.tokens.dark)}\n}\n\n${selector}.light {\n${declarations(preset.tokens.light)}\n}\n`
}

/**
 * Labels on the preset's brand and status fills (contrast.ts, "Labels on fills"): each
 * failing pair with the nearest pair that reads. Findings the preset accepts in
 * `exceptions` come back under `accepted` with their reason — reported, not
 * failed, because the choice is the preset author's to make.
 */
export function presetLabelContrast(input: SablePreset): {
	open: LabelFinding[]
	accepted: (LabelFinding & { reason: string })[]
	measured: number
	unmeasured: string[]
} {
	const preset = parsePreset(input)
	const values = (mode: "light" | "dark") => {
		const all: Record<string, string> = { ...preset.tokens.shared, ...preset.tokens[mode] }
		const resolve = (value: string, depth = 0): string =>
			depth > 10 ? value : value.replace(/^var\(\s*--([\w-]+)\s*\)$/, (m, name: string) => (all[name] ? resolve(all[name], depth + 1) : m))
		return Object.fromEntries(Object.entries(all).map(([name, value]) => [name, resolve(value)]))
	}
	const { findings, measured, unmeasured } = checkLabelledFills({ light: values("light"), dark: values("dark") })
	const reasonFor = (f: LabelFinding) =>
		preset.exceptions?.find((e) => e.rule === LABEL_CONTRAST_RULE && e.mode === f.mode && e.token === f.fill)?.reason
	return {
		open: findings.filter((f) => !reasonFor(f)),
		accepted: findings.flatMap((f) => {
			const reason = reasonFor(f)
			return reason ? [{ ...f, reason }] : []
		}),
		measured,
		unmeasured,
	}
}
