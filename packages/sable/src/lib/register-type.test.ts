import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The type half of the density ladder, made checkable.
 *
 * Heights retune inside a `data-density` scope for free, because `--control-*`
 * is a custom property. Typography does not: the page and workspace registers
 * are separate paired utilities, so anything naming `text-body-md` kept
 * page-register type while its box shrank around it. A compact `Input` was a
 * 32px control carrying 15px text, and every form in a workspace read
 * oversized — which is exactly how it was reported.
 *
 * The fix is a scoped redefinition in styles.css: inside
 * `[data-density="compact"]`, each page tier compresses onto the workspace
 * scale. It works on consumer markup too, which is the half a component sweep
 * can never reach — an agent writing `<p class="text-body-md">` in a tool panel
 * is the same bug, in code this package does not own.
 *
 * This test is the guard for the ONE way that can rot: adding a new paired
 * type utility and forgetting its compact counterpart. jsdom applies no
 * stylesheet, so the check is static — the stylesheet either declares the
 * override or it does not.
 */

const CSS = readFileSync(join(import.meta.dirname, "..", "styles.css"), "utf8")

/**
 * Tiers with no workspace counterpart, by declaration.
 *
 * `display-*` and `heading-*` are the marketing/document voice — a workspace is
 * chrome and has no use for a 48px headline, so there is nothing to compress
 * them to. `overline` is already at the floor of the scale.
 */
const PAGE_ONLY = /^(?:display|heading)-|^overline$/

describe("the compact register retunes type, not just heights", () => {
	const compactBlock = (() => {
		// There is more than one `[data-density="compact"]` block — the control
		// ladder redefines `--control-*` under the same selector. Take the one that
		// actually carries type overrides rather than whichever comes first.
		const blocks: string[] = []
		for (const m of CSS.matchAll(/\[data-density="compact"\][^{]*\{/g)) {
			let depth = 0
			for (let i = m.index + m[0].length - 1; i < CSS.length; i++) {
				if (CSS[i] === "{") depth++
				else if (CSS[i] === "}" && --depth === 0) {
					blocks.push(CSS.slice(m.index, i + 1))
					break
				}
			}
		}
		const typeBlock = blocks.find((b) => /\.text-body-md\b/.test(b))
		expect(
			typeBlock,
			"styles.css has no [data-density=\"compact\"] block redefining the page type tiers",
		).toBeDefined()
		return typeBlock as string
	})()

	const pageTiers = [...CSS.matchAll(/@utility text-((?:body|label|title|caption|display|heading|overline)[a-z0-9-]*)\s*\{/g)]
		.map((m) => m[1])
		.filter((t) => !PAGE_ONLY.test(t))

	it("finds the page type tiers", () => {
		expect(pageTiers.length).toBeGreaterThanOrEqual(8)
	})

	it("every page tier has a compact counterpart", () => {
		const missing = pageTiers.filter(
			(t) => !new RegExp(`\\.text-${t}\\b`).test(compactBlock),
		)
		expect(
			missing,
			`These paired type utilities have no override inside [data-density="compact"], so a component or a consumer using them renders page-register type inside a workspace while its box shrinks around it. Add each to the compact block in styles.css (or to PAGE_ONLY here, with a reason).\n\nmissing: ${missing.map((t) => `text-${t}`).join(", ")}\n`,
		).toEqual([])
	})

	it("compresses rather than grows — every size is clamped with min()", () => {
		// The page tiers are `rem` and the workspace tiers are absolute px, so on
		// a 14px-root app `text-label-md` is 10.5px and would JUMP to 12px inside a
		// tool panel: a denser register rendering larger text than the page beside
		// it. `min()` makes that impossible at any root size.
		const sizes = [...compactBlock.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim())
		expect(sizes.length).toBeGreaterThan(0)
		const unclamped = sizes.filter((v) => !v.startsWith("min("))
		expect(
			unclamped,
			`Every compact font-size must be min(<page value>, <workspace value>) so the register can only compress.\n\nunclamped: ${unclamped.join(", ")}\n`,
		).toEqual([])
	})

	it("moves weight onto the workspace scale, so raw utilities and useTypeTier agree", () => {
		// Without this, a compact panel carries 600 labels from raw utilities
		// beside 500 labels from components wired to useTypeTier — the same
		// nominal tier rendering two weights in one panel.
		expect(compactBlock).toMatch(/--type-ui-md-weight/)
		expect(compactBlock).toMatch(/--type-ui-micro-weight/)
		expect(compactBlock).toMatch(/--type-ui-section-weight/)
	})
})
