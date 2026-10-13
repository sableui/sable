import { SABLE_UI_VERSION } from "@sableui/react"
import { PAGE_WIDTH_TOKENS, PRESET_TOKEN_NAMES, parsePreset, type SablePreset } from "@sableui/react/presets"

/** Freeze resolved values in both modes; restore the document before any paint. */
export function snapshotPreset({ id, label, direction, defaultMode, revision = 1, references }: Pick<SablePreset, "id" | "label" | "direction" | "defaultMode"> & Partial<Pick<SablePreset, "revision" | "references">>): SablePreset {
	const root = document.documentElement
	const dark = root.classList.contains("dark")
	const light = root.classList.contains("light")
	const motionValue = root.style.getPropertyValue("--motion-scale")
	const motionPriority = root.style.getPropertyPriority("--motion-scale")
	const probe = document.createElement("span")
	probe.hidden = true
	root.appendChild(probe)
	const read = () => {
		const style = getComputedStyle(root)
		// Canvas has no width controls: leave page widths out rather than copy the
		// defaults over widths the app sets itself.
		const values = Object.fromEntries(PRESET_TOKEN_NAMES.filter(name => !(PAGE_WIDTH_TOKENS as readonly string[]).includes(name)).flatMap(name => {
			const value = style.getPropertyValue(`--${name}`).trim()
			return value ? [[name, value]] : []
		}))
		// Read nominal durations at scale 1; otherwise a slower preset is scaled
		// twice on re-import, or OS reduced motion exports permanently zero times.
		root.style.setProperty("--motion-scale", "1", "important")
		try {
			for (const name of PRESET_TOKEN_NAMES.filter(name => name.startsWith("motion-duration-"))) {
				probe.style.transitionDuration = `var(--${name})`
				const seconds = Number.parseFloat(getComputedStyle(probe).transitionDuration)
				if (Number.isFinite(seconds)) values[name] = `${seconds * 1000}ms`
			}
		} finally {
			if (motionValue) root.style.setProperty("--motion-scale", motionValue, motionPriority)
			else root.style.removeProperty("--motion-scale")
		}
		return values
	}
	let tokens: SablePreset["tokens"]
	try {
		root.classList.remove("dark", "light")
		const lightTokens = read()
		root.classList.add("dark")
		const darkTokens = read()
		tokens = { shared: {}, light: lightTokens, dark: darkTokens }
	} finally {
		probe.remove()
		root.classList.toggle("dark", dark)
		root.classList.toggle("light", light)
	}
	const sans = tokens.light["font-sans"]
	const mono = tokens.light["font-mono"]
	const display = tokens.light["font-display"] || sans
	// Store stacks once as metadata, so fonts and CSS cannot disagree across modes.
	for (const values of [tokens.light, tokens.dark]) for (const name of ["font-sans", "font-mono", "font-display"]) delete values[name]
	return parsePreset({ schemaVersion: 1, id, label, revision, sableVersion: SABLE_UI_VERSION, defaultMode, fonts: { sans, mono, display }, direction, references, tokens })
}

export function downloadPreset(preset: SablePreset) {
	const blob = new Blob([JSON.stringify(preset, null, 2) + "\n"], { type: "application/json" })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement("a")
	anchor.href = url
	anchor.download = `${preset.id}.json`
	anchor.click()
	window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
