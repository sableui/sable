import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { LABEL_CONTRAST_RULE, parsePreset, presetCss, presetLabelContrast } from "../dist/presets/index.js"
import { parseFlags } from "./design-preferences.mjs"

const packageRoot = fileURLToPath(new URL("../", import.meta.url))
const args = process.argv.slice(2)
const json = args.includes("--json")
function emit(type, data, output) { process.stdout.write(json ? JSON.stringify({ type, data }) + "\n" : output + "\n") }
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
		const { PRESET_TOKEN_NAMES } = await import("../dist/presets/index.js")
		function tokens(mode) {
			const values = { ...groups.light, ...(mode === "dark" ? groups.dark : {}) }
			function resolveValue(value, chain = []) {
				return value.replace(/var\(--([\w-]+)\)/g, (_, name) => {
					if (name === "motion-scale") return "var(--motion-scale)"
					if (chain.includes(name) || !values[name]) throw new Error(`Cannot resolve template variable --${name}.`)
					return resolveValue(values[name], [...chain, name])
				})
			}
			return Object.fromEntries(PRESET_TOKEN_NAMES.filter(name => values[name]).map(name => [name, resolveValue(values[name])]))
		}
		const preset = parsePreset({ schemaVersion: 1, id: "my-preset", label: "My preset", revision: 1, sableVersion: manifest.version, defaultMode: "dark", fonts: { sans: groups.light["font-sans"], mono: groups.light["font-mono"] }, direction: "Content-first composition with a clear primary action. Replace this guidance with the direction for your product.", tokens: { shared: {}, light: tokens("light"), dark: tokens("dark") } })
		emit("preset.template", preset, JSON.stringify(preset, null, 2))
	} else {
		const file = flags.get(action)
		if (!file || file.startsWith("--")) throw new Error(`${action} requires a preset JSON path.`)
		const preset = parsePreset(JSON.parse(readFileSync(resolve(file), "utf8")))
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
			emit(
				"preset.check",
				{ valid: true, id: preset.id, revision: preset.revision, authoredWith: preset.sableVersion, labelContrast: { measured: labels.measured, accepted: labels.accepted, unmeasured: labels.unmeasured } },
				`Valid preset ${preset.id}, revision ${preset.revision}. Labels on filled roles: ${labels.measured} pairs measured${unmeasured}.${accepted}\nReview rendered contrast and brief fit separately.`,
			)
		} else { const css = presetCss(preset); emit("preset.css", { id: preset.id, revision: preset.revision, css }, css) }
	}
} catch (error) {
	process.stderr.write(JSON.stringify({ type: "error", code: error.code ?? "ERR_PRESET_INVALID", message: error.message, ...(error.data ? { data: error.data } : {}), suggestions: error.suggestions ?? ["sable docs using-presets", "sable preset --template"] }) + "\n")
	process.exitCode = 1
}
