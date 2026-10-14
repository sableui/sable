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
		expect(block).toContain("var(--type-body-md-size, 0.9375rem) * var(--type-body-md-leading, 1.55) * var(--leading-scale) / var(--baseline-split)")
		expect(block).toContain("--spacing: calc(var(--baseline-step) / 2);")
		expect(block).toContain("--baseline: calc(var(--baseline-step) * var(--baseline-split));")
	})

	it("preserves fallback sizes and naming-case while allowing scoped overrides", () => {
		expect(css).toContain("font-size: var(--type-display-4xl-size, clamp(4.5rem, 12vw, 12rem))")
		expect(css).toContain("font-weight: var(--type-body-md-weight, 400)")
		expect(css).toContain("font-weight: var(--type-label-md-weight, 600)")
		// label-xs is sentence case; the uppercase eyebrow is text-overline.
		expect(css).toContain("text-transform: var(--type-label-xs-transform, none)")
	})
})
