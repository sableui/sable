/**
 * build-palette — write src/palette.css from src/lib/palette.ts.
 *
 * The palette is CSS, not values: every step is a relative colour computed from
 * the theme's own tokens where it is declared, so a preset, a customizer look
 * or a consumer's `--primary` override carries into it with no regeneration.
 * What this script fixes ahead of time is the part CSS cannot do: fitting each
 * family step's chroma inside sRGB across the whole lean.
 *
 *   node scripts/build-palette.mjs           write it
 *   node scripts/build-palette.mjs --check   fail if it is stale
 *
 * Node runs the two .ts imports directly (type stripping); neither imports
 * anything, which is what keeps that possible.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { maxChromaAt } from "../src/themes/contrast.ts"
import { LEAN, LEAN_REACH, NEUTRAL_MIX, PALETTE_COLORS, PALETTE_FAMILIES, PALETTE_SLOTS, PALETTE_STEPS, PALETTE_TONES, STEP_CURVES, TONE_CHROMA_CAP, stepFrom } from "../src/lib/palette.ts"

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "palette.css")
const GAMUT_SAFETY = 0.97
/** Tailwind's own families that Sable does not generate, switched off so nothing unthemed slips through. */
const UNGENERATED = ["slate", "gray", "zinc", "stone", "amber", "lime", "emerald", "cyan", "sky", "indigo", "violet", "fuchsia", "rose"]

const n = (x, digits = 4) => Number(x.toFixed(digits)).toString()

/** Knot spacing for the chroma bound, in degrees of lean. */
const KNOT = 5

/**
 * A step's chroma under the lean. sRGB's room changes with hue (blue leaning
 * toward cyan loses a third of it) and CSS cannot measure gamut, so the room is
 * written into the CSS as a piecewise-linear bound over the lean, a knot every
 * 5°. Each knot takes the least room on the segments either side of it, so the
 * line between two knots never rises above the real room anywhere on the
 * segment. The CSS evaluates it against the hue the family actually landed on:
 * a family that does not lean keeps its full chroma, one that leans into a
 * narrow region gives up only what it must. When the wanted chroma fits the
 * whole lean, it is written as a plain number.
 */
function chromaFor(l, hue, wanted) {
	const room = (dh) => maxChromaAt(l, (hue + dh + 360) % 360) * GAMUT_SAFETY
	const least = (from, to) => {
		let out = Infinity
		for (let dh = Math.max(from, -LEAN_REACH); dh <= Math.min(to, LEAN_REACH) + 1e-9; dh += 0.5) out = Math.min(out, room(dh))
		return out
	}
	const knots = LEAN_REACH / KNOT
	const knot = (k) => least((k - 1) * KNOT, (k + 1) * KNOT)
	const values = new Map()
	for (let k = -knots; k <= knots; k++) values.set(k, knot(k))
	// What may be left out unbounded: invisible, and inside the gamut headroom
	// even where the room is a near-white wash's few hundredths.
	const slack = Math.min(0.0005, Math.min(...values.values()) * (1 - GAMUT_SAFETY) * 0.5)
	if (wanted <= Math.min(...values.values()) + slack) return n(wanted)
	const gap = `(mod(h - ${hue} + 540, 360) - 180)`
	const terms = [n(values.get(0))]
	for (const sign of [1, -1]) {
		let skipped = 0
		for (let i = 1; i <= knots; i++) {
			const slope = (values.get(sign * i) - values.get(sign * (i - 1))) / KNOT
			// Only falling room needs a term: leaving out a rise lowers the bound,
			// which is always safe. Small falls are left out too while their running
			// total stays inside the slack. Both keep the file readable.
			if (slope >= 0) continue
			if (skipped - slope * KNOT <= slack) {
				skipped -= slope * KNOT
				continue
			}
			const offset = (i - 1) * KNOT
			const along = `${sign === 1 ? gap : `-1 * ${gap}`}${offset ? ` - ${offset}` : ""}`
			terms.push(`${n(slope, 5)} * clamp(0, ${along}, ${KNOT})`)
		}
	}
	return `min(${n(wanted)}, calc(${terms.join(" + ")}))`
}

const lean = (hue) =>
	`calc(${hue} + clamp(-${LEAN.cap}, (mod(h - ${hue} + 540, 360) - 180) * ${LEAN.amount}, ${LEAN.cap}) * var(--palette-harmony) * clamp(0, c / ${LEAN.fullAt}, 1))`

function familySteps(mode) {
	return PALETTE_FAMILIES.flatMap((family) =>
		PALETTE_STEPS.map((step) => {
			const { l, c } = stepFrom(family[mode], step, mode)
			return `--${family.name}-${step}: oklch(from var(--_palette-${family.name}) ${n(l)} ${chromaFor(l, family.hue, c)} h);`
		}),
	)
}

function toneSteps(mode) {
	return PALETTE_TONES.flatMap((tone) =>
		PALETTE_STEPS.map((step) => {
			if (step === 500) return `--${tone}-500: var(--${tone});`
			const { target, pull, chroma } = STEP_CURVES[mode][step]
			const cap = TONE_CHROMA_CAP[mode][step]
			const c = cap === undefined ? `calc(c * ${chroma})` : `min(calc(c * ${chroma}), ${cap})`
			return `--${tone}-${step}: oklch(from var(--${tone}) calc(l + (${target} - l) * ${pull}) ${c} h);`
		}),
	)
}

const block = (selector, lines) => `${selector} {\n${lines.map((line) => `\t${line}`).join("\n")}\n}`

const scales = ["neutral", ...PALETTE_FAMILIES.map((family) => family.name), ...PALETTE_TONES]
const css = `/* GENERATED by scripts/build-palette.mjs from src/lib/palette.ts. Do not edit. */

/* ==========================================================================
   The palette — nine families and a scale under every tone, for any theme.
   See src/lib/palette.ts for the model.

   Declared on every scope, like the art tokens: a custom property resolves
   where it is declared, so a preset-scoped preview or a .dark island has to
   compute its own steps from its own tokens. Zero specificity, so a theme or
   an app can still set any single step by name.
   ========================================================================== */

${block(":where(:root, [data-sable-theme], .dark, .light)", [
	"/* The brand the families lean toward. --theme-art-brand is set wherever",
	"   --primary stops being the brand (a look with neutral buttons). */",
	"--_palette-brand: var(--theme-art-brand, var(--primary));",
	`/* How far the families lean: 0 keeps their own hues, 1 is the default, and ${LEAN.maxHarmony}`,
	"   the most their chroma is fitted for. */",
	`--palette-harmony: clamp(0, var(--theme-palette-harmony, 1), ${LEAN.maxHarmony});`,
	...PALETTE_FAMILIES.map((family) => `--_palette-${family.name}: oklch(from var(--_palette-brand) 0.6 0.1 ${lean(family.hue)});`),
	...PALETTE_STEPS.map((step) => `--neutral-${step}: color-mix(in oklab, var(--background), var(--foreground) ${NEUTRAL_MIX[step]}%);`),
])}

${block(":where(:root, [data-sable-theme], .light)", [...familySteps("light"), ...toneSteps("light")])}

${block(":where(.dark, .dark [data-sable-theme]:not(.light))", [...familySteps("dark"), ...toneSteps("dark")])}

/* Slots: data-palette="blue" fills the palette-* roles from one family, so a
   component (Badge tone="blue") or an app paints any family without naming a
   step: bg-palette-wash text-palette-text. */
${["neutral", ...PALETTE_COLORS].map((name) => block(`:where([data-palette="${name}"])`, Object.entries(PALETTE_SLOTS).map(([slot, step]) => `--palette-${slot}: var(--${name}-${step});`))).join("\n\n")}

/* Utilities: bg-blue-500, text-tone-1-700, border-neutral-200, bg-palette-wash …
   Tailwind's own families that are not generated here are switched off. */
@theme inline {
${UNGENERATED.map((name) => `\t--color-${name}-*: initial;`).join("\n")}
${scales.flatMap((scale) => PALETTE_STEPS.map((step) => `\t--color-${scale}-${step}: var(--${scale}-${step});`)).join("\n")}
${Object.keys(PALETTE_SLOTS).map((slot) => `\t--color-palette-${slot}: var(--palette-${slot});`).join("\n")}
}
`

if (process.argv.includes("--check")) {
	let current = ""
	try {
		current = readFileSync(OUT, "utf8")
	} catch {}
	if (current.replace(/\r\n/g, "\n") !== css) {
		console.error("[build-palette] ✗ src/palette.css is stale — run `node scripts/build-palette.mjs`.")
		process.exit(1)
	}
	console.log("[build-palette] ✓ src/palette.css is current.")
} else {
	writeFileSync(OUT, css)
	console.log(`[build-palette] ✓ wrote src/palette.css (${scales.length} scales × ${PALETTE_STEPS.length} steps).`)
}
