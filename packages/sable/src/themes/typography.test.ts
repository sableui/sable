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
				// Leading is the theme's ratio, snapped to the 0.25rem grid.
				const expected =
					suffix === "leading"
						? `line-height: round(nearest, calc(var(--type-${tier}-leading,`
						: `${property}: var(--type-${tier}-${suffix},`
				expect(block, `${tier} ${property}`).toContain(expected)
			}
		}
	})

	it("puts every page-tier leading on the 0.25rem grid, keeping the theme's ratio", () => {
		const page = utilities.filter((utility) => !utility[1].startsWith("ui-"))
		for (const [, tier, block] of page) {
			const leading = block.match(/line-height:\s*([^;]+);/)?.[1]
			if (!leading) continue
			expect(leading, tier).toMatch(/^round\(nearest, calc\(var\(--type-[\w-]+-leading, [\d.]+\) \* 1em\), 0\.25rem\)$/)
		}
	})

	it("preserves fallback sizes and naming-case while allowing scoped overrides", () => {
		expect(css).toContain("font-size: var(--type-display-4xl-size, clamp(4.5rem, 12vw, 12rem))")
		expect(css).toContain("font-weight: var(--type-body-md-weight, 400)")
		expect(css).toContain("font-weight: var(--type-label-md-weight, 600)")
		// label-xs is sentence case; the uppercase eyebrow is text-overline.
		expect(css).toContain("text-transform: var(--type-label-xs-transform, none)")
	})
})
