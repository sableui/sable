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
				expect(block, `${tier} ${property}`).toContain(`${property}: var(--type-${tier}-${suffix},`)
			}
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
