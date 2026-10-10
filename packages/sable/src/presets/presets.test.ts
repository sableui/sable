import { describe, expect, it } from "vitest"
import { SEMANTIC_TOKENS } from "../themes/_contract"
import { parsePreset, presetCss, presetManifest, validatePreset, type SablePreset } from "./index"

const fixture = (): SablePreset => ({
	schemaVersion: 1, id: "clay", label: "Clay", revision: 1, sableVersion: "0.64.0",
	defaultMode: "dark", fonts: { sans: '"Figtree", sans-serif', mono: '"DM Mono", monospace' },
	direction: "Use clear product photography and a compact purchase flow.",
	tokens: {
		shared: { "theme-radius-md": "12px", "control-md": "40px" },
		light: Object.fromEntries(SEMANTIC_TOKENS.map(name => [name, "oklch(98% 0 0)"])),
		dark: Object.fromEntries(SEMANTIC_TOKENS.map(name => [name, "oklch(20% 0 0)"])),
	},
})

describe("portable Sable presets", () => {
	it("keeps nominal durations connected to the live motion policy without scaling references twice", () => {
		const preset = fixture()
		preset.tokens.shared["motion-duration-enter"] = "240ms"
		preset.tokens.shared["motion-duration-fast"] = "calc(120ms * var(--motion-scale))"
		preset.tokens.shared["motion-duration-exit"] = "var(--motion-duration-fast)"
		const css = presetCss(preset)
		expect(css).toContain("--motion-duration-enter: calc((240ms) * var(--motion-scale, 1));")
		expect(css).toContain("--motion-duration-fast: calc(120ms * var(--motion-scale));")
		expect(css).toContain("--motion-duration-exit: var(--motion-duration-fast);")
	})
	it("round-trips JSON and produces scoped CSS and a provider manifest", () => {
		const preset = parsePreset(JSON.parse(JSON.stringify(fixture())))
		expect(presetManifest(preset)).toMatchObject({ id: "clay", modes: ["light", "dark"], defaultMode: "dark" })
		const css = presetCss(preset)
		expect(css).toContain('[data-sable-theme="clay"]')
		expect(css).toContain('.dark [data-sable-theme="clay"]:not(.light)')
		expect(css).toContain('--background: oklch(20% 0 0);')
		expect(css).toContain('--control-md: 40px;')
		expect(css).not.toContain(":root")
	})
	it("requires both complete semantic modes and refuses unknown library tokens", () => {
		const preset = fixture()
		delete preset.tokens.dark.foreground
		preset.tokens.shared["invented-token"] = "12px"
		expect(validatePreset(preset)).toEqual(expect.arrayContaining([
			"Missing dark semantic token: foreground.",
			expect.stringContaining("Unknown Sable token"),
		]))
		expect(() => presetCss(preset)).toThrow("Unknown Sable token")
	})
	it.each(['red; } body { display: none', 'url(https://example.com/x)', '</style><script>', '\\75rl(x)', 'red !important'])("rejects unsafe token values: %s", value => {
		const preset = fixture()
		preset.tokens.light.primary = value
		expect(() => parsePreset(preset)).toThrow("Unsafe")
	})
	it("rejects unresolved internal palette variables and inconsistent fonts", () => {
		const preset = fixture()
		preset.tokens.light.primary = "var(--private-palette-500)"
		preset.tokens.shared["font-sans"] = "serif"
		expect(validatePreset(preset)).toEqual(expect.arrayContaining([expect.stringContaining("unportable variable"), expect.stringContaining("differs from the declared font")]))
	})
	it("rejects unsupported schema versions and malformed reference evidence", () => {
		expect(validatePreset({ ...fixture(), schemaVersion: 2, references: [{ source: "a screenshot", observation: "animation lasts 100ms", method: "proved" }] })).toEqual(expect.arrayContaining([expect.stringContaining("schemaVersion"), expect.stringContaining("reference observation")]))
	})
})
