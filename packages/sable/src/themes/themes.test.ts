import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
	DENSITY_TOKENS,
	LAYERING_TOKENS,
	MOTION_TOKENS,
	RADIUS_TOKENS,
	SEMANTIC_TOKENS,
	TYPE_OVERLINE_TOKENS,
	TYPE_SCALE_TOKENS,
	TYPE_UI_TOKENS,
	WORKSPACE_SURFACE_TOKENS,
} from "./_contract"
import {
	CONTRAST_FLOOR,
	GAMUT_EPSILON,
	HAIRLINE_VISIBILITY_FLOOR,
	NON_TEXT_FLOOR,
	NON_TEXT_PAIRS,
	type ParsedColor,
	compositeOver,
	contrastRatio,
	evaluateContrast,
	evaluateNonTextContrast,
	gamutExcursion,
	isInSrgbGamut,
	linearToSrgb,
	luminance,
	parseColorWithAlpha,
} from "./contrast"
import {
	DEFAULT_THEME_ID,
	SABLE_THEME_ATTRIBUTE,
	isThemeId,
	themeIds,
	themeManifests,
} from "./index"
import { TOKEN_DOCS } from "./token-docs"

function cssFor(themeId: string) {
	return readFileSync(resolve(__dirname, themeId, `${themeId}.css`), "utf8")
}

function declarations(block: string) {
	return new Set(
		Array.from(block.matchAll(/--([\w-]+)\s*:/g), (match) => match[1]),
	)
}

function blockWith(css: string, ...needles: string[]) {
	const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "")
	return (
		cssWithoutComments
			.match(/[^{}]+\{[^{}]*\}/g)
			?.find((block) => needles.every((needle) => block.includes(needle))) ?? ""
	)
}

describe("theme registry", () => {
	it("exports all theme manifests and the public theme helpers", () => {
		expect(DEFAULT_THEME_ID).toBe("base")
		expect(SABLE_THEME_ATTRIBUTE).toBe("data-sable-theme")
		expect(themeIds).toEqual(["base", "meridian", "prism", "verdant", "ember", "poppy", "atelier"])
		expect(themeManifests.map((theme) => theme.id)).toEqual(themeIds)
		expect(isThemeId("base")).toBe(true)
		expect(isThemeId("meridian")).toBe(true)
		expect(isThemeId("verdant")).toBe(true)
		expect(isThemeId("unknown")).toBe(false)
	})

	it("rejects inherited Object.prototype members (own-property check only)", () => {
		for (const inherited of ["toString", "constructor", "hasOwnProperty", "__proto__"]) {
			expect(isThemeId(inherited), `${inherited} must not be a theme id`).toBe(false)
		}
	})
})

describe("theme css contract", () => {
	it("keeps :root owned by the default theme only", () => {
		expect(blockWith(cssFor(DEFAULT_THEME_ID), ":root")).not.toBe("")

		for (const theme of themeIds.filter((id) => id !== DEFAULT_THEME_ID)) {
			expect(blockWith(cssFor(theme), ":root"), `${theme} must not override the default :root theme`).toBe("")
		}
	})

	it("declares every colour token in OKLCH, in every theme", () => {
		// The theme contract already requires this
		// ("Convert every observed color to OKLCH … this is Sable's palette space",
		// reference/theme.md), but nothing enforced it — so Meridian shipped 73 hex
		// declarations across 14 distinct colours, and Prism 7. Both were converted
		// with a verified byte-exact round trip. This is the check whose absence let
		// them drift.
		//
		// Three exemptions, each for its own reason:
		//
		// - Shadows: `0 0 #0000` is the idiomatic "no shadow" — transparency rather
		//   than a colour, and `oklch(0 0 0 / 0)` says it worse.
		// - Pure white and pure black may stay hex. The two notations are the same
		//   colour, and at the extremes there is nothing for OKLCH to buy:
		//   perceptual notation earns its keep on a RAMP, where even lightness steps
		//   and a locked hue matter. `#ffffff` is unambiguous and shorter.
		const TRUE_BW = /^#(?:fff(?:fff)?|000(?:000)?)$/i
		for (const theme of themeIds) {
			const css = cssFor(theme).replace(/\/\*[\s\S]*?\*\//g, "")
			const offenders = [...css.matchAll(/^(\s*--[a-z0-9-]+)\s*:\s*([^;]+);/gm)]
				.filter(
					(m) =>
						/#[0-9a-fA-F]{3,8}/.test(m[2]) &&
						!/shadow/.test(m[1]) &&
						!/#0{4,8}\b/i.test(m[2]) &&
						!TRUE_BW.test(m[2].trim()),
				)
				.map((m) => `${m[1].trim()}: ${m[2].trim()}`)
			expect(
				offenders,
				`${theme} declares colour tokens in hex; OKLCH is Sable's palette space`,
			).toEqual([])
		}
	})

	it("keeps the default theme's semantic layer fully palette-referencing", () => {
		// The real invariant is about the SEMANTIC layer, not about hex per se.
		// Base's palette holds the values; its semantic tokens reference them.
		// Five of them (background, card, popover, destructive-foreground, sidebar)
		// were raw `#ffffff` — white has no ramp step, since zinc tops out at 97.2% L
		// with a faint blue cast — so `--white` was added to the palette and those
		// five now reference it, like every other semantic token in the file.
		//
		// `--white: #ffffff` itself is fine: it is a PALETTE entry, and at the
		// extremes hex and OKLCH are the same colour with nothing to choose between
		// them. What must not happen is a semantic token holding a literal.
		const css = cssFor(DEFAULT_THEME_ID).replace(/\/\*[\s\S]*?\*\//g, "")
		// "References the palette" means the value mentions a `var(--…)` — including
		// relative colour syntax, `oklch(from var(--zinc-700) l c h / 0.4)`, which is
		// how three of Base's tokens add alpha to a ramp step. An earlier version
		// of this test flagged any `oklch(` and failed on those three, which was the
		// test being wrong about correct code rather than the reverse.
		const literalSemantics = [...css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)]
			.filter(
				(m) =>
					(SEMANTIC_TOKENS as readonly string[]).includes(m[1]) &&
					/#[0-9a-fA-F]{3,8}|oklch\(|rgb\(/.test(m[2]) &&
					!/var\(--/.test(m[2]),
			)
			.map((m) => `--${m[1]}: ${m[2].trim()}`)
		expect(
			literalSemantics,
			"a semantic token in the default theme holds a literal; reference a palette entry instead",
		).toEqual([])
		expect(css, "--white must remain a named palette entry").toMatch(/--white:\s*#ffffff/)
	})

	it("keeps the bare .dark selector owned by the default theme only", () => {
		// A non-default theme whose dark block includes a bare `.dark` in its
		// selector group leaks its dark tokens into EVERY theme's dark mode
		// (shipped bug: meridian's warm-black canvas + ember accent bled into
		// base dark). Only the default theme may claim `.dark` unscoped.
		const bareDark = (css: string) =>
			css
				.replace(/\/\*[\s\S]*?\*\//g, "")
				.match(/(^|\})\s*([^{}]+)\{/g)
				?.flatMap((m) => m.replace(/^\}?\s*/, "").replace(/\{$/, "").split(","))
				.map((s) => s.trim())
				.filter((s) => s === ".dark") ?? []

		expect(bareDark(cssFor(DEFAULT_THEME_ID)).length).toBeGreaterThan(0)
		for (const theme of themeIds.filter((id) => id !== DEFAULT_THEME_ID)) {
			expect(bareDark(cssFor(theme)), `${theme} must not claim the bare .dark selector`).toEqual([])
		}
	})

	for (const theme of themeIds) {
		it(`${theme} defines every semantic token for light and dark`, () => {
			const css = cssFor(theme)
			const lightBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`)
			const darkBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`, ".dark")
			const lightDecls = declarations(lightBlock)
			const darkDecls = declarations(darkBlock)

			for (const token of SEMANTIC_TOKENS) {
				expect(lightDecls.has(token), `${theme} light is missing --${token}`).toBe(true)
				expect(darkDecls.has(token), `${theme} dark is missing --${token}`).toBe(true)
			}
		})

		it(`${theme} defines the motion foundation variables the runtime consumes`, () => {
			const css = cssFor(theme)
			const lightBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`)
			const lightDecls = declarations(lightBlock)

			for (const token of MOTION_TOKENS) {
				expect(lightDecls.has(token), `${theme} is missing --${token}`).toBe(true)
			}
		})

		it(`${theme} scales every literal motion duration by --motion-scale`, () => {
			// Reduced motion and the Customize motion slider work by setting
			// --motion-scale; a bare `300ms` ignores both (Ember shipped that way).
			const css = cssFor(theme)
			const durations = [...css.matchAll(/--motion-duration-[\w-]+:\s*([^;]+);/g)].map((m) => m[1].trim())
			expect(durations.length, `${theme} declares no motion durations`).toBeGreaterThan(0)
			for (const value of durations) {
				const scaled = value.includes("var(--motion-scale)") || /^var\(--motion-duration-[\w-]+\)$/.test(value)
				expect(scaled, `${theme}: "${value}" is not scaled by --motion-scale`).toBe(true)
			}
		})

		it(`${theme} defines the radius foundation variables the runtime consumes`, () => {
			const css = cssFor(theme)
			const lightBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`)
			const lightDecls = declarations(lightBlock)

			for (const token of RADIUS_TOKENS) {
				expect(lightDecls.has(token), `${theme} is missing --${token}`).toBe(true)
			}
		})

		it(`${theme} defines the type-scale foundation variables the runtime consumes`, () => {
			const css = cssFor(theme)
			const lightBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`)
			const lightDecls = declarations(lightBlock)

			for (const token of TYPE_SCALE_TOKENS) {
				expect(lightDecls.has(token), `${theme} is missing --${token}`).toBe(true)
			}
		})

		it(`${theme} defines the overline/eyebrow foundation variables the runtime consumes`, () => {
			const css = cssFor(theme)
			const lightBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`)
			const lightDecls = declarations(lightBlock)

			for (const token of TYPE_OVERLINE_TOKENS) {
				expect(lightDecls.has(token), `${theme} is missing --${token}`).toBe(true)
			}
		})

		it(`${theme} font stacks end in a generic family and match the manifest`, () => {
			// A stack without a generic fallback renders in the browser default
			// (shipped bug: meridian's mono was "Geist Mono" alone — unloaded, code
			// and KPIs fell back to a PROPORTIONAL face). And the manifest is the
			// machine-readable copy of the CSS: they must agree byte-for-byte.
			const css = cssFor(theme)
			const lightBlock = blockWith(css, `${SABLE_THEME_ATTRIBUTE}="${theme}"`)
			const manifest = themeManifests.find((t) => t.id === theme)
			if (!manifest) throw new Error(`no manifest for ${theme}`)

			const cssValue = (name: string) =>
				lightBlock.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`))?.[1].trim()

			const generic = { sans: "(serif|sans-serif)", mono: "monospace" }
			for (const [role, family] of Object.entries(manifest.fonts)) {
				const value = cssValue(`font-${role}`)
				expect(value, `${theme} css is missing --font-${role}`).toBeDefined()
				expect(value, `${theme} --font-${role} must match the manifest`).toBe(family)
				const tail = generic[role as keyof typeof generic] ?? "(serif|sans-serif)"
				expect(
					new RegExp(`,\\s*${tail}$`).test(value ?? ""),
					`${theme} --font-${role} must end in a generic family (${tail})`,
				).toBe(true)
			}
		})
	}
})

/**
 * The register foundation lives in styles.css rather than per-theme (density and
 * the workspace surface band are register concerns, not palette concerns), so
 * these assert against that file instead of a theme's.
 */
describe("workspace register foundation", () => {
	const stylesCss = readFileSync(resolve(__dirname, "..", "styles.css"), "utf8")

	it("declares every density token, in both densities", () => {
		// A token declared in one density and not the other is the failure mode
		// that matters: the ladder half-shifts and controls end up mismatched.
		const comfortable = declarations(blockWith(stylesCss, '[data-density="comfortable"]'))
		const compact = declarations(blockWith(stylesCss, '[data-density="compact"]'))
		for (const token of DENSITY_TOKENS) {
			expect(comfortable.has(token), `comfortable is missing --${token}`).toBe(true)
			expect(compact.has(token), `compact is missing --${token}`).toBe(true)
		}
	})

	it("keeps every compact control tighter than its comfortable counterpart", () => {
		const px = (block: string, token: string) =>
			Number(block.match(new RegExp(`--${token}\\s*:\\s*(\\d+)px`))?.[1] ?? Number.NaN)
		const comfortableBlock = blockWith(stylesCss, '[data-density="comfortable"]')
		const compactBlock = blockWith(stylesCss, '[data-density="compact"]')
		for (const token of DENSITY_TOKENS) {
			const loose = px(comfortableBlock, token)
			const tight = px(compactBlock, token)
			if (Number.isNaN(loose) || Number.isNaN(tight)) continue // non-px tokens
			expect(tight, `compact --${token} must not exceed comfortable`).toBeLessThanOrEqual(loose)
		}
	})

	it("keeps the tree indent step equal to the tree column, in every density", () => {
		// The invariant behind Tree's whole geometry. When the step is SMALLER than
		// the column, a child's content lands to the LEFT of where its parent's
		// content starts and the nesting reads inverted — the tree appears to outdent
		// as it descends. That shipped once (a 14px step against a 16px column) and
		// this is what stops it shipping again.
		for (const scope of ['[data-density="comfortable"]', '[data-density="compact"]']) {
			const block = blockWith(stylesCss, scope)
			const column = block.match(/--tree-column\s*:\s*(\d+)px/)?.[1]
			const indent = block.match(/--tree-indent\s*:\s*(\d+)px/)?.[1]
			expect(column, `${scope} must declare --tree-column in px`).toBeDefined()
			expect(indent, `${scope} --tree-indent must equal --tree-column`).toBe(column)
		}
	})

	it("derives the floating edge for every theme", () => {
		// Only the original default theme ever declared --border-floating, so in the other five the
		// documented floating edge resolved to nothing. It is derived now, with a
		// hook a theme may use to tune it.
		expect(stylesCss).toMatch(/--border-floating\s*:\s*var\(--theme-border-floating,/)
		expect(stylesCss).toContain("--color-border-floating: var(--border-floating)")
	})

	it("derives every workspace surface token so no theme has to author them", () => {
		// These are optional-with-derivation on purpose; if a derivation is dropped
		// the utility silently resolves to nothing and the surface renders transparent.
		for (const token of WORKSPACE_SURFACE_TOKENS) {
			expect(
				new RegExp(`--${token}\\s*:\\s*var\\(--theme-${token}`).test(stylesCss),
				`--${token} must derive from a --theme-${token} hook with a fallback`,
			).toBe(true)
		}
	})

	it("maps every workspace surface into the Tailwind colour namespace", () => {
		for (const token of WORKSPACE_SURFACE_TOKENS) {
			expect(
				stylesCss.includes(`--color-${token}: var(--${token})`),
				`--color-${token} must be mapped in @theme inline`,
			).toBe(true)
		}
	})

	it("declares the whole layering scale in styles.css, not in a theme", () => {
		// The bug this pins: the scale lived in the original default theme's CSS and worked only because
		// that block carries a `:root` arm. A consumer shipping atelier/meridian/
		// prism/verdant on its own got no --z-* at all, and every z-(--z-*) utility
		// in the components resolved to `z-index: auto` — silently, and only under a
		// non-default theme, which is the hardest kind of failure to attribute.
		const rootBlocks = stylesCss
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.match(/(^|\})\s*:root\s*(,[^{]*)?\{[^{}]*\}/g)
		const declared = new Set(
			rootBlocks?.flatMap((block) => [...declarations(block)]) ?? [],
		)
		for (const token of LAYERING_TOKENS) {
			expect(declared.has(token), `styles.css :root is missing --${token}`).toBe(true)
		}
	})

	it("lets a theme override a layering step but never be its only home", () => {
		for (const themeId of themeIds) {
			const css = cssFor(themeId)
			for (const token of LAYERING_TOKENS) {
				if (!new RegExp(`--${token}\\s*:`).test(css)) continue
				// Declaring it in a theme is fine — owning it is not, and styles.css
				// having it is asserted above, so reaching here means both have it.
				expect(
					new RegExp(`--${token}\\s*:`).test(stylesCss),
					`${themeId} declares --${token}, which must also exist in styles.css`,
				).toBe(true)
			}
		}
	})

	it("keeps the scale ordered, so the names mean what they say", () => {
		const value = (token: string) =>
			Number(stylesCss.match(new RegExp(`--${token}\\s*:\\s*(\\d+)`))?.[1] ?? Number.NaN)
		const steps = LAYERING_TOKENS.map(value)
		expect(steps.some(Number.isNaN), "every layering token must be a bare number").toBe(false)
		for (let i = 1; i < steps.length; i += 1) {
			expect(
				steps[i],
				`--${LAYERING_TOKENS[i]} must sit above --${LAYERING_TOKENS[i - 1]}`,
			).toBeGreaterThan(steps[i - 1] as number)
		}
	})

	it("registers every UI type tier with cn()'s typography group", () => {
		// An unregistered paired `text-*` utility falls into tailwind-merge's COLOUR
		// group and silently evicts the real colour class — a shipped bug once, and
		// invisible in review, so it gets a test.
		const cnSource = readFileSync(resolve(__dirname, "..", "lib", "cn.ts"), "utf8")
		const tiers = [...stylesCss.matchAll(/@utility text-(ui-[\w-]+)\s*\{/g)].map((m) => m[1])
		expect(tiers.length, "expected the text-ui-* tiers to exist in styles.css").toBeGreaterThan(0)
		for (const tier of tiers) {
			expect(
				cnSource.includes(`"${tier}"`),
				`lib/cn.ts's ds-typography group is missing "${tier}"`,
			).toBe(true)
		}
	})

	it("sizes UI type tiers in absolute px, never rem", () => {
		// Sable's responsive root is 16px mobile / 14px desktop, which is right for
		// READING text and wrong for chrome: a rem-sized 12px label silently became
		// 10.5px on desktop, below the intended floor. Reference tools size chrome
		// type absolutely, so these tiers must not scale with the root.
		const uiBlocks = [...stylesCss.matchAll(/@utility text-(ui-[\w-]+)\s*\{([^}]*)\}/g)]
		expect(uiBlocks.length, "expected text-ui-* tiers in styles.css").toBeGreaterThan(0)
		for (const [, tier, body] of uiBlocks) {
			const sizes = [...body.matchAll(/font-size:[^;]*?([\d.]+)(rem|px)/g)]
			for (const [, , unit] of sizes) {
				expect(unit, `text-${tier} must size in px, not ${unit}`).toBe("px")
			}
			const leading = [...body.matchAll(/line-height:[^;]*?([\d.]+)(rem|px)/g)]
			for (const [, , unit] of leading) {
				expect(unit, `text-${tier} line-height must be px, not ${unit}`).toBe("px")
			}
		}
	})

	it("flattens chrome control radius in the compact register", () => {
		// One of the two rules the workspace register reverses (DESIGN.md →
		// Registers): neither reference tool has a pill in its chrome.
		const compact = blockWith(stylesCss, '[data-density="compact"]')
		expect(
			/--button-radius\s*:/.test(compact),
			"the compact density scope must flatten --button-radius",
		).toBe(true)
	})

	it("backs each UI type tier with a themeable token", () => {
		for (const token of TYPE_UI_TOKENS) {
			expect(stylesCss.includes(`--${token}`), `styles.css never reads --${token}`).toBe(true)
		}
	})
})

describe("theme contrast", () => {
	/**
	 * Resolve a token to a colour, following `var()` chains to the palette.
	 * Returns null for values no static pass can resolve — relative-colour syntax
	 * (`oklch(from … )`) and `color-mix()` — which are skipped rather than guessed
	 * at. Those are derived from tokens that ARE checked here.
	 */
	function resolveVars(css: string, appearance: "light" | "dark") {
		const vars = new Map<string, string>()
		const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "")
		for (const block of noComments.match(/[^{}]+\{[^{}]*\}/g) ?? []) {
			const selector = block.slice(0, block.indexOf("{"))
			// Dark inherits light and then overrides it, so light-only skips .dark
			// blocks and dark applies both in source order.
			if (appearance === "light" && /\.dark/.test(selector)) continue
			for (const d of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
				vars.set(d[1], d[2].trim())
			}
		}
		return vars
	}

	/**
	 * Resolve a token to a colour, alpha included.
	 *
	 * Two things this now does that the first version did not:
	 *
	 * 1. **Keeps alpha.** Every dark theme draws its hairlines translucent
	 *    (`oklch(32% 0.02 270 / 0.45)`), so a check that read the opaque triplet
	 *    would measure a border three times lighter than the one that renders.
	 * 2. **Resolves the identity form of relative-colour syntax.** Base writes
	 *    `oklch(from var(--zinc-700) l c h / 0.4)`, which is not a guess: `l c h`
	 *    is the base colour verbatim, and the only new information is the alpha.
	 *    Skipping it meant the theme with the most translucent chrome was the one
	 *    theme the border gate could not see. Any OTHER relative form (an altered
	 *    channel, `calc()`) still returns null and is a hard failure below.
	 */
	function resolve(
		name: string,
		vars: Map<string, string>,
		depth = 0,
	): ParsedColor | null {
		if (depth > 10) return null
		const raw = vars.get(name)
		if (!raw) return null
		const relative = raw.match(
			/^oklch\(\s*from\s+var\(\s*(--[\w-]+)\s*\)\s+l\s+c\s+h\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i,
		)
		if (relative) {
			const base = resolve(relative[1], vars, depth + 1)
			if (!base) return null
			const alpha =
				relative[2] === undefined
					? 1
					: relative[3] === "%"
						? Number(relative[2]) / 100
						: Number(relative[2])
			return { rgb: base.rgb, alpha: base.alpha * alpha }
		}
		const ref = raw.match(/var\(\s*(--[\w-]+)/)
		if (ref) return resolve(ref[1], vars, depth + 1)
		return parseColorWithAlpha(raw)
	}

	/** A token's literal value with `var()` chains followed, colour or not. */
	function rawValue(
		name: string,
		vars: Map<string, string>,
		depth = 0,
	): string | null {
		if (depth > 10) return null
		const raw = vars.get(name)
		if (!raw) return null
		if (/^oklch\(\s*from/i.test(raw)) return raw
		const ref = raw.match(/var\(\s*(--[\w-]+)/)
		if (ref) return rawValue(ref[1], vars, depth + 1) ?? raw
		return raw
	}

	/**
	 * A SURFACE as it actually renders.
	 *
	 * Surfaces are not always opaque either: a theme may author `--muted` as a 12%
	 * film of a grey, which is a wash over the page rather than a fill. Measuring
	 * against the film's own colour instead of the page it lies on reports a token
	 * drawn in the same base hue as being identical to its surface, when on screen
	 * the two are twelve percent apart — a false failure, and exactly the kind that
	 * gets a real gate deleted. So a translucent surface is composited over
	 * `background` first, and everything above it is then measured against that.
	 */
	function surfaceOf(name: string, vars: Map<string, string>) {
		const raw = resolve(`--${name}`, vars)
		if (!raw) return null
		if (raw.alpha >= 1) return raw
		const page = name === "background" ? null : resolve("--background", vars)
		return { rgb: page ? compositeOver(raw, page.rgb) : raw.rgb, alpha: 1 }
	}

	/** A structural mark as it actually renders: composited onto its surface. */
	function painted(mark: ParsedColor, surface: ParsedColor) {
		return compositeOver(mark, surface.rgb)
	}

	/**
	 * Structural marks that are below the hairline visibility floor in a SHIPPED
	 * theme, recorded pair by pair with the number they measure.
	 *
	 * This is a ratchet, not an amnesty. Every entry is a real defect — a line
	 * that does not reach the threshold of being seen — and the list exists so
	 * that the debt is countable, attributable, and can only ever shrink: a new
	 * theme, or a new pair in an existing one, has to clear the floor or add
	 * itself here in a diff someone has to justify.
	 *
	 * The worst of them is not a near-miss. Meridian's dark `--border` and
	 * `--muted` are the SAME VALUE (`oklch(27.1% 0.0143 101.41)`), so a bordered
	 * control in a muted well has no border at all: 1.00:1, APCA Lc 0.0. Lifting
	 * dark `--border`/`--input` to Meridian's own `--border-strong` step
	 * (`oklch(34.69% …)`) clears the whole Meridian block in one token.
	 */
	const HAIRLINE_EXEMPTIONS = new Map<string, string>([])

	/**
	 * The smallest card-to-fill luminance step a reader sees as two surfaces.
	 * Dark is lower: WCAG's ratio adds a 0.05 flare term that compresses steps
	 * between near-blacks, so the same visible difference measures smaller.
	 *
	 * The dark card floor was 1.04, and that passed surfaces nobody could tell
	 * apart: Meridian's card in a muted well measured 1.06, Atelier's 1.04,
	 * Verdant's 1.05 (muted DARKER than the card), Ember's secondary Button on a
	 * card 1.05 — every canvas stage and playground frame in those presets read
	 * as one flat plane in dark mode, held together only by hairlines. The
	 * presets that read correctly sit at 1.22–1.24. Dark mode cannot lean on
	 * shadow (a drop barely registers on near-black), so the tonal step is the
	 * whole of the separation; 1.12 is the floor a card on a fill visibly clears.
	 * Popover pairs keep the lower floor: popover is already lifted above the
	 * card (see the popover/card test), and a fill inside a menu sits on that.
	 */
	const CARD_STEP_FLOOR = { light: 1.06, dark: 1.04 } as const
	const CARD_ON_FILL_DARK_FLOOR = 1.12

	it.each(themeIds)(
		"%s keeps form-control outlines at least as visible as ordinary chrome",
		(themeId) => {
			/*
			 * `input` is documented as "the outline of a form control" — a BORDER,
			 * not a fill. Deriving it from a background film instead put Ember's
			 * `input` at the same lightness as `card`, which made every input
			 * border AND every unchecked Switch track (`bg-input`) invisible. One
			 * wrong value, two symptoms, and nothing caught it.
			 *
			 * The assertion is deliberately RELATIONAL rather than an absolute
			 * contrast floor. Measured across the shipped themes, real hairline
			 * borders sit between 1.03 and 2.05 — far below WCAG 1.4.11's 3:1 for
			 * UI component boundaries — because a hairline language is the
			 * deliberate house style. An absolute floor would either fail all six
			 * themes or be too low to catch anything.
			 *
			 * What IS defensible is the token's own documentation: a form control
			 * is entitled to read at least as clearly as other chrome. So `input`
			 * must be no less distinguishable from a surface than `border` is.
			 * Every shipped theme satisfies this (most set them equal); the bug
			 * this exists for does not.
			 */
			const css = cssFor(themeId)
			const failures: string[] = []

			for (const appearance of ["light", "dark"] as const) {
				const vars = resolveVars(css, appearance)
				for (const surface of ["card", "background"]) {
					const bg = surfaceOf(surface, vars)
					const input = resolve("--input", vars)
					const border = resolve("--border", vars)
					if (!bg || !input || !border) continue
					const inputRatio = contrastRatio(painted(input, bg), bg.rgb)
					const borderRatio = contrastRatio(painted(border, bg), bg.rgb)
					// A hair of tolerance: these are usually the same value, and float
					// round-tripping through OKLCH should not be a test failure.
					if (inputRatio < borderRatio - 0.01) {
						failures.push(
							`${appearance}: input on ${surface} (${inputRatio.toFixed(2)}) is less visible than border (${borderRatio.toFixed(2)})`,
						)
					}
					if (inputRatio < 1.02) {
						failures.push(
							`${appearance}: input is indistinguishable from ${surface} (${inputRatio.toFixed(2)}) — derived as a fill rather than an outline?`,
						)
					}
				}
			}
			expect(failures).toEqual([])
		},
	)

	it.each(themeIds)(
		"%s lifts popover above card in dark mode, so a menu in a dialog never melts into it",
		(themeId) => {
			/*
			 * Dark mode carries elevation with tone, not shadow (DESIGN.md →
			 * Elevation): a shadow on a near-black canvas barely registers. So a
			 * floating surface (`bg-popover` — Menu, Select, Popover) opened over a
			 * resting one (`bg-card` — Dialog, Sheet, Card) is visible ONLY if the
			 * two differ. Five of seven themes shipped them equal or inverted
			 * (Atelier's popover was darker than its card), so a menu inside a
			 * dialog was the same colour as the dialog. The floor is a luminance
			 * step a reader can see, not merely a different value.
			 */
			const vars = resolveVars(cssFor(themeId), "dark")
			const card = resolve("--card", vars)
			const popover = resolve("--popover", vars)
			expect(card, "--card resolves").toBeTruthy()
			expect(popover, "--popover resolves").toBeTruthy()
			if (!card || !popover) return
			const step = contrastRatio(popover.rgb, card.rgb)
			const lighter = linearToSrgb(popover.rgb[1]) > linearToSrgb(card.rgb[1])
			expect(lighter, "popover is lighter than card").toBe(true)
			expect(step, `popover/card step ${step.toFixed(3)}`).toBeGreaterThanOrEqual(1.08)
		},
	)

	it.each(themeIds)(
		"%s lifts card above the page in dark mode, so a card reads without leaning on its border",
		(themeId) => {
			/*
			 * The same reasoning as popover/card, one layer down. Every docs
			 * playground, anatomy frame and app dashboard puts cards straight on
			 * the page. Meridian (1.08), Atelier (1.09), Prism (1.06) and Ember
			 * (1.07) shipped a dark card a hair off the page, so cards read as
			 * outlines on one flat plane; Base (1.17) and Verdant (1.19) read
			 * as layers. 1.12 is the floor where a card is a surface, not a frame.
			 */
			const vars = resolveVars(cssFor(themeId), "dark")
			const page = resolve("--background", vars)
			const card = resolve("--card", vars)
			expect(page, "--background resolves").toBeTruthy()
			expect(card, "--card resolves").toBeTruthy()
			if (!page || !card) return
			const lighter = linearToSrgb(card.rgb[1]) > linearToSrgb(page.rgb[1])
			const step = contrastRatio(card.rgb, page.rgb)
			expect(lighter, "card is lighter than the page").toBe(true)
			expect(step, `card/page step ${step.toFixed(3)}`).toBeGreaterThanOrEqual(1.12)
		},
	)

	it.each(themeIds)(
		"%s keeps card at or above the page in light mode, so a field reads as a box to type in",
		(themeId) => {
			/*
			 * The light half of the rule above. Fields (FIELD_SHELL), cards and
			 * dialogs all fill with --card, and every component assumes it is the
			 * raised surface. Verdant shipped a card DARKER than its page and
			 * Meridian one level with a tinted page, so in those two presets every
			 * input read as a filled grey well with a near-invisible edge. A white
			 * page can only be matched; a tinted one needs a visible step up.
			 */
			const vars = resolveVars(cssFor(themeId), "light")
			const page = resolve("--background", vars)
			const card = resolve("--card", vars)
			expect(page, "--background resolves").toBeTruthy()
			expect(card, "--card resolves").toBeTruthy()
			if (!page || !card) return
			const pageY = luminance(page.rgb)
			const cardY = luminance(card.rgb)
			expect(cardY, "card is not darker than the page").toBeGreaterThanOrEqual(pageY - 1e-6)
			if (pageY < 0.95) {
				const step = contrastRatio(card.rgb, page.rgb)
				expect(step, `card/page step ${step.toFixed(3)} on a tinted page`).toBeGreaterThanOrEqual(1.03)
			}
		},
	)

	it.each(themeIds)("%s lets a nested .dark element take the dark tokens", (themeId) => {
		/*
		 * Dark islands inside a light page (an inspector, a dark sidebar, a dark
		 * hero) are a normal composition. A theme whose dark block only matched
		 * `.dark` on the root left a nested `.dark` on the LIGHT tokens: light
		 * fields with near-white text inside a dark-looking panel. The default
		 * theme reaches nested `.dark` through its bare `.dark` arm.
		 */
		const css = cssFor(themeId)
		const nested = themeId === DEFAULT_THEME_ID ? /(^|[\s,]):?\.dark\s*,/m : new RegExp(`\\[data-sable-theme="${themeId}"\\]\\s+\\.dark\\s*[,{]`)
		expect(nested.test(css), `no descendant .dark selector in ${themeId}`).toBe(true)
		// And the reverse: a themed subtree under a dark page follows it (unless `.light`).
		const underDark = new RegExp(`\\.dark\\s+\\[data-sable-theme="${themeId}"\\]:not\\(\\.light\\)`)
		expect(underDark.test(css), `no dark-ancestor arm in ${themeId}`).toBe(true)
	})

	it.each(themeIds)(
		"%s authors every tone as a solid, legible hue, not a wash",
		(themeId) => {
			/*
			 * Components draw `text-tone-*`, tone dots and bars, and Badge's
			 * 15% wash straight from the tone token, so it must be the
			 * hue itself. A theme once authored tones as the 16% wash with the hue
			 * in `-foreground`: every tone-coloured label, badge and chart in that
			 * theme rendered as a ghost and nothing here noticed. 3:1 is the WCAG
			 * floor for UI marks; a wash measures ~1.1.
			 */
			const failures: string[] = []
			for (const appearance of ["light", "dark"] as const) {
				const vars = resolveVars(cssFor(themeId), appearance)
				const page = surfaceOf("background", vars)
				if (!page) continue
				for (const tone of ["standard", "collectible", "edition", "info", "warning"]) {
					const value = resolve(`--tone-${tone}`, vars)
					if (!value) continue
					const ratio = contrastRatio(painted(value, page), page.rgb)
					if (ratio < 3) failures.push(`${appearance} tone-${tone} ${ratio.toFixed(2)}:1`)
				}
			}
			expect(failures).toEqual([])
		},
	)

	it.each(themeIds)(
		"%s keeps card and popover a visible step from the fills drawn on them",
		(themeId) => {
			/*
			 * A card does not have to be white — a cream, grey or tinted card is a
			 * legitimate voice. What it cannot be is the SAME surface as the fills
			 * that meet it: a card in a `bg-muted` well, a pressed Toggle or
			 * selected row (`bg-accent`) on a card, a secondary Button
			 * (`bg-secondary`) on a card. Atelier's light card equalled its accent
			 * and sat darker than its muted well; Verdant's equalled muted and
			 * secondary. The gate is the relationship, not the colour.
			 */
			const failures: string[] = []
			for (const appearance of ["light", "dark"] as const) {
				const vars = resolveVars(cssFor(themeId), appearance)
				// Cards AND popovers: a hover row (accent) or chip (muted/secondary)
				// inside a menu or dialog sits on the popover, which dark mode lifts
				// above the card. Verdant's dark accent equalled its popover, so a
				// hovered menu row showed nothing at all.
				for (const surfaceName of ["card", "popover"]) {
					const surface = surfaceOf(surfaceName, vars)
					if (!surface) continue
					for (const fill of ["muted", "accent", "secondary"]) {
						const other = surfaceOf(fill, vars)
						if (!other) continue
						const step = contrastRatio(other.rgb, surface.rgb)
						const floor = appearance === "dark" && surfaceName === "card" ? CARD_ON_FILL_DARK_FLOOR : CARD_STEP_FLOOR[appearance]
						if (step < floor) failures.push(`${appearance} ${surfaceName}/${fill} ${step.toFixed(3)} < ${floor}`)
					}
				}
			}
			expect(failures).toEqual([])
		},
	)

	it.each(themeIds)(
		"%s meets the normal-text WCAG ratio for documented ink/surface pairs",
		(themeId) => {
			const css = cssFor(themeId)
			const failures: string[] = []
			/* Pairs the ratio rejects but perceptual contrast carries. Collected so a
			   deliberate override is recorded rather than indistinguishable from a
			   pair that conformed outright. */
			const perceptualPasses: string[] = []
			let checked = 0

			for (const appearance of ["light", "dark"] as const) {
				const vars = resolveVars(css, appearance)
				for (const [token, doc] of Object.entries(TOKEN_DOCS)) {
					if (token !== "foreground" && !token.endsWith("-foreground")) continue
					const ink = resolve(`--${token}`, vars)
					if (!ink) continue
					// `pairsWith` is the authoritative statement of which surfaces this
					// ink sits on — better than the X/X-foreground naming convention,
					// which misses real pairs. The worst failure this check found on its
					// first run was `muted-foreground` on `card`, which the convention
					// does not suggest at all.
					for (const surface of doc.pairsWith ?? []) {
						const bg = surfaceOf(surface, vars)
						if (!bg) continue
						checked++
						// Both models, always — a pair carried by perceptual contrast
						// alone must be visible as such in the report, never silently
						// equivalent to one that conforms outright.
						const v = evaluateContrast(painted(ink, bg), bg.rgb)
						if (!v.wcagRatioPasses) {
							failures.push(
								`${appearance}: ${token} on ${surface} = ${v.ratio.toFixed(2)}:1 ` +
								`(required ${CONTRAST_FLOOR}), APCA Lc ${v.lc.toFixed(1)} is informational and cannot waive this ratio`,
							)
						} else if (v.basis === "perceptual") {
							perceptualPasses.push(
								`${appearance}: ${token} on ${surface} — WCAG ${v.ratio.toFixed(2)}:1, APCA Lc ${v.lc.toFixed(1)}`,
							)
						}
					}
				}
			}

			// A theme that resolved nothing would pass vacuously, which is the failure
			// mode of every check that filters before it asserts.
			expect(checked).toBeGreaterThan(10)
			expect(failures).toEqual([])
		},
	)

	it.each(themeIds)(
		"%s meets the house visibility policy for structural marks (not an AA conformance audit)",
		(themeId) => {
			/*
			 * The other half of contrast. Everything above measures INK; a border, a
			 * form-control outline and a focus ring carry no ink at all, so a check
			 * driven by `*-foreground` tokens is structurally blind to them. That is
			 * the invisible-input-outline defect class, and it had no gate.
			 *
			 * Two things had to be right before the numbers meant anything:
			 *
			 * - **Alpha.** Prism's dark border is `oklch(32% 0.02 270 / 0.45)` and
			 *   Base's is `oklch(from var(--zinc-700) l c h / 0.4)`. Read as
			 *   opaque triplets they measure far lighter than they render, so every
			 *   mark is composited onto the surface it sits on before measurement.
			 * - **The right floor for the right token.** See the split below; it is
			 *   NOT one number, and pretending it was would have failed all six
			 *   themes on a house style rather than on a defect.
			 */
			const css = cssFor(themeId)
			const failures: string[] = []
			const perceptualPasses: string[] = []
			let checked = 0

			const staleExemptions = new Set(
				[...HAIRLINE_EXEMPTIONS.keys()].filter((key) => key.startsWith(`${themeId}:`)),
			)

			for (const appearance of ["light", "dark"] as const) {
				const vars = resolveVars(css, appearance)
				for (const [token, { surfaces, tier }] of Object.entries(NON_TEXT_PAIRS)) {
					const mark = resolve(`--${token}`, vars)
					if (!mark) continue
					for (const surface of surfaces) {
						const bg = surfaceOf(surface, vars)
						if (!bg) continue
						checked++
						const v = evaluateNonTextContrast(painted(mark, bg), bg.rgb, tier)
						const key = `${themeId}:${appearance}:${token}:${surface}`
						if (tier === "hairline" ? v.passes : v.wcagRatioPasses) {
							if (v.basis === "perceptual") {
								perceptualPasses.push(
									`${appearance}: ${token} on ${surface} — WCAG ${v.ratio.toFixed(2)}:1, APCA Lc ${v.lc.toFixed(1)}`,
								)
							}
							continue
						}
						if (HAIRLINE_EXEMPTIONS.has(key)) {
							staleExemptions.delete(key)
							continue
						}
						const floor =
							tier === "hairline"
								? `floor ${HAIRLINE_VISIBILITY_FLOOR}:1`
								: `required ${NON_TEXT_FLOOR}:1 (APCA cannot waive this ratio)`
						failures.push(
							`${appearance}: ${token} on ${surface} = ${v.ratio.toFixed(2)}:1, ` +
								`APCA Lc ${v.lc.toFixed(1)} (${tier} tier, ${floor}) — a structural ` +
								`mark this faint is not visible against the surface it bounds`,
						)
					}
				}
			}

			expect(checked).toBeGreaterThan(10)
			expect(failures).toEqual([])
			// A fixed theme must drop its exemption, or the ratchet stops ratcheting.
			expect(
				[...staleExemptions],
				`${themeId} now passes these — delete them from HAIRLINE_EXEMPTIONS`,
			).toEqual([])
		},
	)

	/**
	 * The worst sRGB excursion each SHIPPED theme currently gets away with, in
	 * linear units, together with the value that sets it.
	 *
	 * The honest number here is `GAMUT_EPSILON` and no theme meets it: hand-tuned
	 * OKLCH ramps routinely reach past sRGB, and 87 authored values across the six
	 * themes do. Asserting the honest number would fail every theme at once and
	 * could only be satisfied by retuning six palettes, so this is a ratchet on the
	 * WORST value instead — a new theme starts at `GAMUT_EPSILON` (strict), and an
	 * existing one can only improve.
	 *
	 * Base and Prism are not in the same league as the rest. Their
	 * `--tone-collectible` (`oklch(72% 0.225 285)`) misses the blue primary by 0.41
	 * in linear light — a 41% overshoot, not a rounding artefact — so what renders
	 * is a materially different colour from the one authored, and the token's whole
	 * job is to stay visually distinct from `tone-edition`. Everything else sits
	 * under 0.09, which clips to a barely-perceptible chroma shift.
	 */
	const GAMUT_BASELINE: Record<string, number> = {
		base: 0.4121, // Same palette as the existing neutral default; no new exemption.
		prism: 0.4121, // --tone-collectible: oklch(72% 0.225 285)
		ember: 0.082, // --ember-100: oklch(94% 0.045 32.9)
		meridian: 0.032, // --meridian-ember-50: oklch(97% 0.02 30)
		verdant: 0.018, // --success: oklch(50% 0.11 173)
		atelier: 0.005, // --success: oklch(50% 0.10 173)
	}

	it.each(themeIds)("%s authors every colour inside the sRGB gamut", (themeId) => {
		/*
		 * `oklch()` is not clipped by the notation — OKLCH addresses colours sRGB
		 * cannot show, and a value past the boundary does not error. The browser
		 * clips it PER CHANNEL, and per-channel clipping is not monotonic in
		 * lightness: two adjacent steps of a ramp authored outside the gamut can
		 * clip to the SAME rendered colour, silently erasing a step. `contrast.ts`
		 * left out-of-gamut components unclamped "so callers can detect them", and
		 * until now nothing was that caller.
		 *
		 * Two assertions, deliberately different in strength. The excursion is
		 * ratcheted (see GAMUT_BASELINE — the shipped palettes do not meet the real
		 * bar). The CONSEQUENCE is not: no two steps of one ramp may render as the
		 * same colour, ever, in any theme. That is the failure the excursion is only
		 * a proxy for, and every shipped theme passes it today.
		 *
		 * Relative-colour syntax is skipped: `oklch(from X l c h / A)` introduces no
		 * new chroma, so the base — authored in this same file, and checked — is the
		 * value that decides gamut.
		 */
		const css = cssFor(themeId).replace(/\/\*[\s\S]*?\*\//g, "")
		const outside: string[] = []
		const rendered = new Map<string, Map<string, Set<string>>>()
		let checked = 0
		let worst = 0

		for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;]*oklch\([^;]*)/g)) {
			const [, token, value] = match
			for (const call of value.match(/oklch\([^)]*\)/gi) ?? []) {
				if (/\bfrom\b/i.test(call)) continue
				const parsed = parseColorWithAlpha(call)
				expect(parsed, `${themeId} ${token}: cannot parse ${call}`).not.toBeNull()
				if (!parsed) continue
				checked++

				// Ramp steps share a name and differ by a numeric suffix; the clipped
				// 8-bit triple is what the screen actually shows.
				const ramp = token.replace(/-\d+$/, "")
				if (ramp !== token) {
					const pixel = parsed.rgb.map((c) => Math.round(linearToSrgb(c) * 255)).join(",")
					const steps = rendered.get(ramp) ?? new Map<string, Set<string>>()
					const sharing = steps.get(pixel) ?? new Set<string>()
					sharing.add(`${token}: ${call}`)
					steps.set(pixel, sharing)
					rendered.set(ramp, steps)
				}

				if (isInSrgbGamut(parsed.rgb)) continue
				const excursion = gamutExcursion(parsed.rgb)
				worst = Math.max(worst, excursion)
				outside.push(
					`${token}: ${call} falls outside sRGB by ${excursion.toFixed(4)} ` +
						`(linear rgb ${parsed.rgb.map((c) => c.toFixed(4)).join(", ")}, ` +
						`tolerance ${GAMUT_EPSILON}) — the browser clips it per channel, so the ` +
						`colour that renders is not the colour authored`,
				)
			}
		}

		const collapsed: string[] = []
		for (const [ramp, steps] of rendered) {
			for (const [pixel, sharing] of steps) {
				if (sharing.size < 2) continue
				collapsed.push(
					`${ramp} collapses to one rendered colour (rgb ${pixel}): ${[...sharing].join(" and ")} ` +
						`— clipping has erased a step of the ramp`,
				)
			}
		}

		expect(checked, `${themeId} declares no oklch() values at all`).toBeGreaterThan(10)
		expect(collapsed).toEqual([])
		expect(
			worst,
			`${themeId} pushes further outside sRGB than its recorded baseline ` +
				`(${GAMUT_BASELINE[themeId] ?? GAMUT_EPSILON}). Offenders:\n${outside.join("\n")}`,
		).toBeLessThanOrEqual(GAMUT_BASELINE[themeId] ?? GAMUT_EPSILON)
	})

	it.each(themeIds)("%s authors every gated token in a value the gate can measure", (themeId) => {
		/*
		 * `parseColor` returns null for anything that is not hex or `oklch()`, and
		 * both contrast checks above used to `continue` on null. That made the gate
		 * OPT-OUT: a theme that authored `--input: color-mix(in oklab, …)` would not
		 * fail the contrast gate, it would silently leave it — and the token most
		 * likely to be written that way is exactly the structural chrome the
		 * non-text floor exists to protect.
		 *
		 * So a gated token whose value cannot be measured is a failure in its own
		 * right. The fix for one is either to author the value in a form the gate
		 * reads, or to teach the resolver that form (which is what happened to
		 * relative-colour syntax's identity form — it is now resolved, not skipped).
		 */
		const css = cssFor(themeId)
		const gated = new Set<string>()
		for (const [token, { surfaces }] of Object.entries(NON_TEXT_PAIRS)) {
			gated.add(token)
			for (const surface of surfaces) gated.add(surface)
		}
		for (const [token, doc] of Object.entries(TOKEN_DOCS)) {
			if (!token.endsWith("-foreground") || !doc.pairsWith?.length) continue
			gated.add(token)
			for (const surface of doc.pairsWith) gated.add(surface)
		}

		const failures: string[] = []
		for (const appearance of ["light", "dark"] as const) {
			const vars = resolveVars(css, appearance)
			for (const token of gated) {
				const raw = rawValue(`--${token}`, vars)
				if (raw === null) continue // not declared — the contract test owns that
				if (resolve(`--${token}`, vars)) continue
				failures.push(
					`${appearance}: --${token} resolves to \`${raw}\` — un-checkable value — ` +
						`the contrast gate cannot verify this token`,
				)
			}
		}
		expect(failures).toEqual([])
	})
})
