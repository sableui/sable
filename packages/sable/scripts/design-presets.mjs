import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parsePreset, presetCss } from "../dist/presets/index.js"
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
		if (action === "--check") emit("preset.check", { valid: true, id: preset.id, revision: preset.revision, authoredWith: preset.sableVersion }, `Valid preset ${preset.id}, revision ${preset.revision}. Review rendered contrast and brief fit separately.`)
		else { const css = presetCss(preset); emit("preset.css", { id: preset.id, revision: preset.revision, css }, css) }
	}
} catch (error) {
	process.stderr.write(JSON.stringify({ type: "error", code: "ERR_PRESET_INVALID", message: error.message, suggestions: ["sable docs using-presets", "sable preset --template"] }) + "\n")
	process.exitCode = 1
}
