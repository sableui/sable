#!/usr/bin/env node
/** Report ratio deficits separately from Sable's house readability policy.
 * This is a token-pair audit. Component context, text size, focus geometry and
 * alternative identifying cues still require a rendered accessibility review.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
	CONTRAST_FLOOR, NON_TEXT_FLOOR, NON_TEXT_PAIRS,
	compositeOver, evaluateContrast, evaluateNonTextContrast, parseColorWithAlpha,
} from "../src/themes/contrast.ts"
import { TOKEN_DOCS } from "../src/themes/token-docs.ts"

const themeRoot = join(dirname(fileURLToPath(import.meta.url)), "../src/themes")

function variables(css, mode) {
	const result = new Map()
	for (const block of css.replace(/\/\*[\s\S]*?\*\//g, "").match(/[^{}]+\{[^{}]*\}/g) ?? []) {
		const selector = block.slice(0, block.indexOf("{"))
		if (mode === "light" && /\.dark/.test(selector)) continue
		for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) result.set(name, value.trim())
	}
	return result
}

function resolve(name, vars, depth = 0) {
	if (depth > 10) return null
	const raw = vars.get(`--${name}`)
	if (!raw) return null
	const relative = raw.match(/^oklch\(\s*from\s+var\(\s*--([\w-]+)\s*\)\s+l\s+c\s+h\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i)
	if (relative) {
		const base = resolve(relative[1], vars, depth + 1)
		if (!base) return null
		const alpha = relative[2] === undefined ? 1 : Number(relative[2]) / (relative[3] === "%" ? 100 : 1)
		return { rgb: base.rgb, alpha: base.alpha * alpha }
	}
	const ref = raw.match(/^var\(\s*--([\w-]+)\s*\)$/)
	return ref ? resolve(ref[1], vars, depth + 1) : parseColorWithAlpha(raw)
}

const pairs = []
const unresolved = []
for (const entry of readdirSync(themeRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
	const theme = entry.name
	if (!existsSync(join(themeRoot, theme, `${theme}.css`))) continue
	const css = readFileSync(join(themeRoot, theme, `${theme}.css`), "utf8")
	for (const mode of ["light", "dark"]) {
		const vars = variables(css, mode)
		const page = resolve("background", vars)
		const measure = (token, surface, kind, tier) => {
			const mark = resolve(token, vars)
			const background = resolve(surface, vars)
			if (!mark || !background || !page) {
				unresolved.push({ theme, mode, token, surface, kind })
				return
			}
			const base = background.alpha < 1 ? compositeOver(background, page.rgb) : background.rgb
			const ink = compositeOver(mark, base)
			const verdict = kind === "text" ? evaluateContrast(ink, base) : evaluateNonTextContrast(ink, base, tier)
			pairs.push({
				theme, mode, token, surface, kind,
				ratio: Number(verdict.ratio.toFixed(3)), ratioFloor: kind === "text" ? CONTRAST_FLOOR : NON_TEXT_FLOOR,
				wcagRatioPasses: verdict.wcagRatioPasses,
				housePasses: verdict.passes, houseBasis: verdict.basis,
				apcaLc: Number(verdict.lc.toFixed(1)),
			})
		}
		for (const [token, doc] of Object.entries(TOKEN_DOCS)) {
			if (token !== "foreground" && !token.endsWith("-foreground")) continue
			// Workspace surfaces are derived by styles.css and require browser measurement.
			if (token === "canvas-foreground" || token === "panel-foreground") continue
			for (const surface of doc.pairsWith ?? []) measure(token, surface, "text")
		}
		for (const [token, { surfaces, tier }] of Object.entries(NON_TEXT_PAIRS)) {
			for (const surface of surfaces) measure(token, surface, tier === "focus" ? "focus" : "boundary", tier)
		}
	}
}

const deficits = pairs.filter((pair) => !pair.wcagRatioPasses)
const report = {
	schemaVersion: 1,
	scope: "Static theme token pairs; not whole-product WCAG conformance. Boundary deficits require rendered review of the cues identifying each control. Derived workspace surfaces require browser measurement.",
	sources: ["https://www.w3.org/TR/WCAG22/#contrast-minimum", "https://www.w3.org/TR/WCAG22/#non-text-contrast"],
	summary: {
		pairs: pairs.length,
		textRatioDeficits: deficits.filter((pair) => pair.kind === "text").length,
		focusRatioDeficits: deficits.filter((pair) => pair.kind === "focus").length,
		boundaryRatioDeficits: deficits.filter((pair) => pair.kind === "boundary").length,
		housePolicyDeficits: pairs.filter((pair) => !pair.housePasses).length,
		unresolved: unresolved.length,
	},
	deficits: deficits.sort((a, b) => a.ratio - b.ratio),
	unresolved,
}

if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2))
else {
	console.log("Theme contrast audit — ratio conformance and house policy are separate")
	console.log(report.scope)
	console.log(JSON.stringify(report.summary, null, 2))
	for (const pair of deficits.filter((pair) => pair.kind !== "boundary")) {
		console.log(`${pair.theme}/${pair.mode}: ${pair.token} on ${pair.surface} ${pair.ratio}:1 < ${pair.ratioFloor}:1 (${pair.kind}; house ${pair.houseBasis})`)
	}
	console.log("Use --json for all boundary deficits and unresolved measurements.")
}
if (unresolved.length) process.exitCode = 1
