import { describe, expect, it } from "vitest"
import { SEMANTIC_TOKENS } from "../themes/_contract"
import { LABELLED_FILLS, parsePreset, presetCss, presetLabelContrast, presetManifest, validatePreset, type SablePreset } from "./index"

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
	it("carries a product's page widths: the inset and the role caps, under their names", () => {
		const preset = fixture()
		preset.tokens.shared["page-inset"] = "clamp(16px, 3vw, 40px)"
		preset.tokens.shared["region-wide"] = "1440px"
		expect(validatePreset(preset)).toEqual([])
		const css = presetCss(preset)
		expect(css).toContain("--page-inset: clamp(16px, 3vw, 40px);")
		expect(css).toContain("--region-wide: 1440px;")
		// The legacy cap stays out: a preset sets the roles agents are told to pick.
		preset.tokens.shared["region-ultrawide"] = "1800px"
		expect(validatePreset(preset)).toEqual([expect.stringContaining("Unknown Sable token in shared: region-ultrawide")])
	})
	it("keeps a 0.5 preset working: a missing status text token takes its fill, as text did then", () => {
		const preset = fixture()
		preset.tokens.dark.destructive = "oklch(58% 0.2 25)"
		for (const name of ["destructive-text", "success-text", "tone-warning-text", "tone-info-text"]) {
			delete preset.tokens.light[name]
			delete preset.tokens.dark[name]
		}
		expect(validatePreset(preset)).toEqual([])
		const parsed = parsePreset(preset)
		expect(parsed.tokens.dark["destructive-text"]).toBe("oklch(58% 0.2 25)")
		expect(presetCss(preset)).toContain("--destructive-text: oklch(58% 0.2 25);")
		// The input is not rewritten in place.
		expect(preset.tokens.dark["destructive-text"]).toBeUndefined()
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

describe("labels on preset brand and status fills", () => {
	const withPrimary = (dark: [string, string]) => {
		const preset = fixture()
		// Every measured fill reads; then dark primary takes the pair under test.
		for (const mode of ["light", "dark"] as const) for (const fill of LABELLED_FILLS) {
			preset.tokens[mode][fill] = "oklch(55% 0.2 30)"
			preset.tokens[mode][`${fill}-foreground`] = "oklch(98.5% 0.01 30)"
		}
		Object.assign(preset.tokens.dark, { primary: dark[0], "primary-foreground": dark[1] })
		return preset
	}

	it("reports a muddy dark pair with the fix that keeps the brand's white label", () => {
		const { open, accepted } = presetLabelContrast(withPrimary(["oklch(70% 0.18 30)", "oklch(20% 0.03 30)"]))
		expect(accepted).toEqual([])
		expect(open).toHaveLength(1)
		expect(open[0]).toMatchObject({ mode: "dark", fill: "primary" })
		expect(open[0].suggestion.ink).toMatch(/^oklch\(98\.5%/)
		expect(open[0].suggestion.fill).toMatch(/^oklch\(5\d\.\d% /)
	})

	it("accepts a pair the preset declines on the record, and reports it with the reason", () => {
		const preset = withPrimary(["oklch(70% 0.18 30)", "oklch(20% 0.03 30)"])
		preset.exceptions = [{ rule: "label-contrast", mode: "dark", token: "primary", reason: "Brand book: dark ink on the bright fill." }]
		const { open, accepted } = presetLabelContrast(parsePreset(JSON.parse(JSON.stringify(preset))))
		expect(open).toEqual([])
		expect(accepted).toMatchObject([{ mode: "dark", fill: "primary", reason: "Brand book: dark ink on the bright fill." }])
	})

	it("requires a reason and a known token for an exception", () => {
		const preset = fixture()
		preset.exceptions = [{ rule: "label-contrast", mode: "dark", token: "primary", reason: " " }]
		expect(validatePreset(preset).join()).toMatch(/Invalid exception 1/)
		preset.exceptions = [{ rule: "label-contrast", mode: "dark", token: "card" as "primary", reason: "x" }]
		expect(validatePreset(preset).join()).toMatch(/Invalid exception 1/)
	})

	it("follows a var() to another public token before measuring", () => {
		const preset = withPrimary(["oklch(55% 0.2 30)", "oklch(98.5% 0.01 30)"])
		preset.tokens.dark["primary-foreground"] = "var(--background)"
		preset.tokens.dark.background = "oklch(99% 0 0)"
		expect(presetLabelContrast(preset).open).toEqual([])
	})
})

