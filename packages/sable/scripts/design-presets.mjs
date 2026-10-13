import { readFileSync } from "node:fs"
import { parse, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { LABEL_CONTRAST_RULE, parsePreset, presetCss, presetLabelContrast } from "../dist/presets/index.js"
import { parseFlags } from "./design-preferences.mjs"
import { packageManager } from "./agent-setup.mjs"

const packageRoot = fileURLToPath(new URL("../", import.meta.url))
const args = process.argv.slice(2)
const json = args.includes("--json")
function emit(type, data, output) { process.stdout.write(json ? JSON.stringify({ type, data }) + "\n" : output + "\n") }

/** -1, 0 or 1 for two semver strings; a prerelease sorts before its release. */
function compareVersions(a, b) {
	const parse = (v) => {
		const [core, pre] = String(v).split("-", 2)
		return { nums: core.split(".").map((n) => Number(n) || 0), pre: pre ?? null }
	}
	const x = parse(a), y = parse(b)
	for (let i = 0; i < 3; i++) if ((x.nums[i] ?? 0) !== (y.nums[i] ?? 0)) return (x.nums[i] ?? 0) < (y.nums[i] ?? 0) ? -1 : 1
	if (x.pre === y.pre) return 0
	if (x.pre === null) return 1
	if (y.pre === null) return -1
	return x.pre < y.pre ? -1 : 1
}

/**
 * A preset records the Sable it was authored with. Authored with a NEWER one
 * than is installed, it can name tokens and defaults this package does not have
 * yet; it still validates against the installed contract, so this warns rather
 * than fails — and says how to upgrade, with the project's own package manager.
 */
function versionWarnings(preset, installed) {
	if (compareVersions(preset.sableVersion, installed) <= 0) return []
	const pm = packageManager(parse(process.cwd()).root, process.cwd())
	const upgrade = { pnpm: "pnpm add @sableui/react@latest", yarn: "yarn add @sableui/react@latest", npm: "npm install @sableui/react@latest" }[pm]
	return [{
		code: "WARN_PRESET_NEWER_SABLE",
		message: `Preset ${preset.id} was authored with @sableui/react ${preset.sableVersion}, newer than the installed ${installed}. It validated against ${installed}; tokens or behaviour added after ${installed} will not apply until you upgrade.`,
		authoredWith: preset.sableVersion,
		installed,
		suggestion: upgrade,
	}]
}
try {
	const flags = parseFlags(args, ["--check", "--css"], ["--template", "--json"])
	const modes = ["--template", "--check", "--css"].filter(arg => flags.has(arg))
	if (modes.length !== 1) throw new Error("Choose --template, --check <file.json>, or --css <file.json>.")
	const action = modes[0]
	if (action === "--template") {
		const manifest = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"))
		const css = readFileSync(resolve(packageRoot, "dist/themes/sable/sable.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
		const groups = { light: {}, dark: {} }
		for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
			const target = match[1].includes(".dark") ? groups.dark : groups.light
			for (const declaration of match[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) target[declaration[1]] = declaration[2].trim()
		}
		const { PAGE_WIDTH_TOKENS, PRESET_TOKEN_NAMES } = await import("../dist/presets/index.js")
		function tokens(mode) {
			const values = { ...groups.light, ...(mode === "dark" ? groups.dark : {}) }
			function resolveValue(value, chain = []) {
				return value.replace(/var\(--([\w-]+)\)/g, (_, name) => {
					if (name === "motion-scale") return "var(--motion-scale)"
					if (chain.includes(name) || !values[name]) throw new Error(`Cannot resolve template variable --${name}.`)
					return resolveValue(values[name], [...chain, name])
				})
			}
			// Page widths are opt-in: copying the defaults would override any widths
			// an app already sets in its own CSS, since preset CSS loads after it.
			return Object.fromEntries(PRESET_TOKEN_NAMES.filter(name => values[name] && !PAGE_WIDTH_TOKENS.includes(name)).map(name => [name, resolveValue(values[name])]))
		}
		const preset = parsePreset({ schemaVersion: 1, id: "my-preset", label: "My preset", revision: 1, sableVersion: manifest.version, defaultMode: "dark", fonts: { sans: groups.light["font-sans"], mono: groups.light["font-mono"] }, direction: "Content-first composition with a clear primary action. Replace this guidance with the direction for your product.", tokens: { shared: {}, light: tokens("light"), dark: tokens("dark") } })
		emit("preset.template", preset, JSON.stringify(preset, null, 2))
	} else {
		const file = flags.get(action)
		if (!file || file.startsWith("--")) throw new Error(`${action} requires a preset JSON path.`)
		const preset = parsePreset(JSON.parse(readFileSync(resolve(file), "utf8")))
		const installed = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8")).version
		const warnings = versionWarnings(preset, installed)
		const warningText = warnings.map((w) => `\nWarning: ${w.message}\n  → ${w.suggestion}`).join("")
		if (action === "--check") {
			// Labels on brand and status fills: Sable's opinion, enforced unless the preset
			// records that it declines it (`exceptions`), which is then reported.
			const labels = presetLabelContrast(preset)
			const pair = f => `${f.mode} ${f.fill}-foreground on ${f.fill}: ${f.ratio.toFixed(2)}:1, APCA Lc ${Math.abs(f.lc).toFixed(0)}`
			if (labels.open.length) {
				const exceptions = labels.open.map(f => JSON.stringify({ rule: LABEL_CONTRAST_RULE, mode: f.mode, token: f.fill, reason: "<why>" }))
				const err = new Error(
					"Labels on filled roles must clear 4.5:1 and APCA Lc 60. These fail the ratio or read muddy:\n" +
					labels.open.map(f => `  ${pair(f)} → try ${f.fill}: ${f.suggestion.fill}; ${f.fill}-foreground: ${f.suggestion.ink}`).join("\n") +
					`\nTo keep a pair as designed, record it in the preset: "exceptions": [${exceptions.join(", ")}]`,
				)
				err.code = "ERR_PRESET_CONTRAST"
				err.data = { findings: labels.open }
				err.suggestions = ["Apply the suggested fill/ink pairs", "Or add an exceptions entry with a reason", "sable docs creating-a-preset"]
				throw err
			}
			const accepted = labels.accepted.map(f => `\n  accepted: ${pair(f)} — ${f.reason}`).join("")
			const unmeasured = labels.unmeasured.length ? `, ${labels.unmeasured.length} unmeasured (${labels.unmeasured.join(", ")})` : ""
			// A passing check is the start of applying a preset, not the end: say what
			// makes the app use it, so a check does not read as "done".
			const fonts = [...new Set(Object.values(preset.fonts).filter(Boolean).map(stack => stack.split(",")[0].trim().replace(/^["']|["']$/g, "")))]
			const next = [
				`sable preset --css ${file} > <stylesheet>, imported after Sable's`,
				`load fonts: ${fonts.join(", ")}`,
				`SableThemeProvider defaultThemeId="${preset.id}" defaultPreference="${preset.defaultMode}" with the preset in customThemes`,
				"build the app, run sable check, review both modes (sable docs using-presets)",
			]
			emit(
				"preset.check",
				{ valid: true, id: preset.id, revision: preset.revision, authoredWith: preset.sableVersion, installed, warnings, labelContrast: { measured: labels.measured, accepted: labels.accepted, unmeasured: labels.unmeasured }, fonts, next },
				`Valid preset ${preset.id}, revision ${preset.revision}. Labels on filled roles: ${labels.measured} pairs measured${unmeasured}.${accepted}${warningText}\nReview rendered contrast and brief fit separately.\nTo apply it to an app:\n${next.map(step => `  - ${step}`).join("\n")}`,
			)
		} else {
			const css = presetCss(preset)
			// The CSS is the output, so in text mode the warning goes to stderr.
			if (!json && warningText) process.stderr.write(`${warningText.trim()}\n`)
			emit("preset.css", { id: preset.id, revision: preset.revision, css, warnings }, css)
		}
	}
} catch (error) {
	process.stderr.write(JSON.stringify({ type: "error", code: error.code ?? "ERR_PRESET_INVALID", message: error.message, ...(error.data ? { data: error.data } : {}), suggestions: error.suggestions ?? ["sable docs using-presets", "sable preset --template"] }) + "\n")
	process.exitCode = 1
}
