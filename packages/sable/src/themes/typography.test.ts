import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { TYPE_OVERLINE_TOKENS, TYPE_REFINEMENT_TOKENS, TYPE_SCALE_TOKENS, TYPE_UI_TOKENS } from "./_contract"
import { tokenDoc } from "./token-docs"

const css = readFileSync(resolve(import.meta.dirname, "../styles.css"), "utf8")
const utilities = [...css.matchAll(/@utility text-([\w-]+)\s*\{([^}]+)\}/g)]
const declared = new Set([...TYPE_SCALE_TOKENS, ...TYPE_REFINEMENT_TOKENS, ...TYPE_OVERLINE_TOKENS, ...TYPE_UI_TOKENS])

describe("typography art direction", () => {
	it("advertises every typography variable consumed by a paired utility", () => {
		const unadvertised = utilities.flatMap((match) => [...match[2].matchAll(/var\(--(type-[\w-]+)/g)]
			.map((token) => token[1]).filter((token) => !declared.has(token as never)))
		expect(unadvertised).toEqual([])
	})

	it("keeps refinement hooks optional, usable, and documented", () => {
		for (const token of TYPE_REFINEMENT_TOKENS) {
			expect(utilities.some((utility) => utility[2].includes(`var(--${token},`)), token).toBe(true)
			expect(tokenDoc(token)?.whenToUse, token).toBeTruthy()
		}
	})

	it("lets a theme retune the whole body, label, caption and mono tier without decomposing it", () => {
		const properties = { size: "font-size", weight: "font-weight", leading: "line-height", tracking: "letter-spacing" }
		for (const [, tier, block] of utilities.filter((utility) => /^(body|label|caption|mono)(-|$)/.test(utility[1]))) {
			for (const [suffix, property] of Object.entries(properties)) {
				// Leading is the theme's ratio, snapped to the baseline step.
				const expected =
					suffix === "leading"
						? `line-height: round(nearest, calc(var(--type-${tier}-leading,`
						: suffix === "size"
							? `font-size: calc(var(--type-${tier}-size,`
							: `${property}: var(--type-${tier}-${suffix},`
				expect(block, `${tier} ${property}`).toContain(expected)
			}
		}
	})

	it("puts every page-tier leading on the baseline step, keeping the theme's ratio", () => {
		const page = utilities.filter((utility) => !utility[1].startsWith("ui-"))
		for (const [, tier, block] of page) {
			const leading = block.match(/line-height:\s*([^;]+);/)?.[1]
			if (!leading) continue
			expect(leading, tier).toMatch(
				/^round\(nearest, calc\(var\(--type-[\w-]+-leading, [\d.]+\)( \* var\(--leading-scale, 1\))? \* 1em\), var\(--baseline-step, 0\.25rem\)\)$/,
			)
		}
	})

	it("opens the reading tiers with --leading-scale and leaves display, heading and label shapes alone", () => {
		const scaled = (tier: string) => utilities.find((u) => u[1] === tier)?.[2].includes("var(--leading-scale, 1)")
		for (const tier of ["body-lg", "body-md", "body-sm", "body-xs", "title-lg", "title-sm", "caption", "mono-md"]) expect(scaled(tier), tier).toBe(true)
		for (const tier of ["display-4xl", "heading-1", "heading-4", "label-md", "overline", "mono-sm"]) expect(scaled(tier), tier).toBe(false)
	})

	it("derives the baseline from the body text, and the spacing scale from the baseline", () => {
		const block = css.match(/:root,\s*\[data-sable-theme\]\s*\{\s*--leading-scale[^}]+\}/)?.[0] ?? ""
		expect(block).toContain("var(--type-body-md-size, 0.9375rem) * var(--type-base, 16) / 16 * var(--type-body-md-leading, 1.55) * var(--leading-scale) / var(--baseline-split)")
		expect(block).toContain("--spacing: calc(var(--baseline-step) / 2);")
		expect(block).toContain("--baseline: calc(var(--baseline-step) * var(--baseline-split));")
	})

	it("preserves fallback sizes and naming-case while allowing scoped overrides", () => {
		expect(css).toContain("font-size: calc(var(--type-display-4xl-size, clamp(4.5rem, 12vw, 12rem)) * var(--type-base, 16) / 16)")
		expect(css).toContain("font-weight: var(--type-body-md-weight, 400)")
		expect(css).toContain("font-weight: var(--type-label-md-weight, 600)")
		// label-xs is sentence case; the uppercase eyebrow is text-overline.
		expect(css).toContain("text-transform: var(--type-label-xs-transform, none)")
	})
	describe("the base size rebuilds the page scale", () => {
		const page = utilities.filter((utility) => !utility[1].startsWith("ui-") && /font-size:/.test(utility[2]))
		const SIZE = /font-size: calc\(var\(--type-([\w-]+)-size, (clamp\(([\d.]+)rem, [^)]*\)|([\d.]+)rem)\) \* var\(--type-base, 16\) \/ 16\);/

		it("scales every page tier by --type-base where the size is used", () => {
			// At the use site, so a theme's declared tier values and a consumer's
			// per-tier overrides scale too, on any element the base is set on.
			const unscaled = page.filter(([, , block]) => !SIZE.test(block)).map(([, tier]) => tier)
			expect(unscaled, "page tiers whose font-size ignores --type-base").toEqual([])
		})

		it("keeps every tier's ratio to the base: a 14 base is 14/16 of each 16-base size", () => {
			// The calc is linear in the base, so evaluating the fallback at two bases
			// is the whole contract: same ratio for every tier, headings and body alike.
			const at = (rem: number, base: number) => rem * 16 * (base / 16)
			const sizes = page.map(([, tier, block]) => {
				const m = block.match(SIZE)
				const rem = Number(m?.[3] ?? m?.[4])
				return { tier, at16: at(rem, 16), at14: at(rem, 14) }
			})
			expect(sizes.length).toBeGreaterThanOrEqual(20)
			for (const { tier, at16, at14 } of sizes) expect(at14 / at16, tier).toBeCloseTo(14 / 16, 10)
			const body = sizes.find((s) => s.tier === "body-md")
			const h1 = sizes.find((s) => s.tier === "heading-1")
			expect(body?.at14).toBeCloseTo(13.125)
			expect(h1!.at14 / body!.at14).toBeCloseTo(h1!.at16 / body!.at16, 10)
		})

		it("carries the rhythm with it: the baseline step reads the scaled body size", () => {
			const block = css.match(/:root,\s*\[data-sable-theme\]\s*\{\s*--leading-scale[^}]+\}/)?.[0] ?? ""
			expect(block).toMatch(/var\(--type-body-md-size, 0\.9375rem\) \* var\(--type-base, 16\) \/ 16/)
		})

		it("compresses the compact remaps from the scaled page size, so a smaller base still never grows inside a tool", () => {
			const compact = css.slice(css.indexOf("The type half of the density ladder"))
			const mins = [...compact.matchAll(/font-size: min\(([^;]+)\);/g)].map((m) => m[1].replace(/, var\(--type-ui-[\w-]+, \d+px\)$/, ""))
			expect(mins.length).toBeGreaterThan(8)
			for (const page of mins) expect(page).toMatch(/^calc\([\d.]+rem \* var\(--type-base, 16\) \/ 16\)$/)
		})

		it("leaves the ui chrome tiers in absolute px", () => {
			for (const [, tier, block] of utilities.filter((u) => u[1].startsWith("ui-"))) expect(block, tier).not.toContain("--type-base")
		})

		it("is a refinement token a preset can set", () => {
			expect(TYPE_REFINEMENT_TOKENS).toContain("type-base")
			expect(tokenDoc("type-base")?.whenToUse).toMatch(/preset/)
		})
	})

	it("gives a compact panel title its own tier above the description", () => {
		const title = utilities.find((u) => u[1] === "ui-title")?.[2] ?? ""
		expect(title).toContain("font-size: var(--type-ui-title-size, 14px)")
		expect(TYPE_UI_TOKENS).toContain("type-ui-title-size")
		const compact = css.slice(css.indexOf("The type half of the density ladder"))
		const titleLg = compact.match(/& \.text-title-lg[^{]*\{([^}]+)\}/)?.[1] ?? ""
		expect(titleLg).toContain("var(--type-ui-title-size, 14px)")
		expect(titleLg).not.toContain("--type-ui-md-size")
	})
})
