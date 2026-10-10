import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { UTILITY_DOCS, UTILITY_FAMILIES } from "./utility-docs"

const PKG_ROOT = resolve(__dirname, "..", "..")
const registry = JSON.parse(readFileSync(resolve(PKG_ROOT, "registry.json"), "utf8"))
const css = readFileSync(resolve(PKG_ROOT, "src", "styles.css"), "utf8")

/** Line-anchored: the header comment's "the paired typography @utility set" is prose, not a utility. */
const declared = [
	...[...css.matchAll(/^[ \t]*@utility\s+([a-z][a-z0-9-]*(?:-\*)?)\s*\{/gm)].map((m) => m[1]),
	...[...css.matchAll(/^[ \t]*@custom-variant\s+([a-z][a-z0-9-]*)\s*[({]/gm)].map((m) => m[1]),
]

/**
 * The build gate (build-registry) is what stops an undocumented utility shipping;
 * this pins the same contract from the consumer's side — what registry.json
 * actually says — so a generator change that drops the section fails here too.
 */
describe("utility docs", () => {
	it("ships a utilities section in registry.json generated from utility-docs.ts", () => {
		expect(registry.utilities.items.map((u: { name: string }) => u.name).sort()).toEqual(
			UTILITY_DOCS.map((u) => u.name).sort(),
		)
		expect(registry.utilities.families).toEqual([...UTILITY_FAMILIES])
	})

	it("documents every @utility and @custom-variant in exactly one place", () => {
		const typography = new Set(
			registry.tokens.typography.map((t: { name: string }) => `text-${t.name}`),
		)
		const recipes = new Set(registry.tokens.motion.recipes)
		const utilities = new Set(registry.utilities.items.map((u: { name: string }) => u.name))
		expect(declared.length).toBeGreaterThan(70)
		const wrong = declared.filter(
			(name) => [typography.has(name), recipes.has(name), utilities.has(name)].filter(Boolean).length !== 1,
		)
		expect(wrong, "documented in none, or more than one, of utilities / tokens.typography / tokens.motion.recipes").toEqual([])
	})

	it("documents nothing styles.css does not declare", () => {
		const names = new Set(declared)
		expect(UTILITY_DOCS.filter((u) => !names.has(u.name)).map((u) => u.name)).toEqual([])
	})

	it("covers the relative-surface layer agents kept hand-deriving", () => {
		for (const name of ["sable-well", "sable-surface-interactive", "sable-frame-inner", "rounded-concentric-*", "sable-selected"]) {
			expect(registry.utilities.items.map((u: { name: string }) => u.name), name).toContain(name)
		}
	})

	it("gives every entry the fields search and the mirror rely on", () => {
		for (const u of UTILITY_DOCS) {
			expect(UTILITY_FAMILIES, u.name).toContain(u.family)
			expect(u.keywords.length, u.name).toBeGreaterThan(0)
			for (const field of ["intent", "whenToUse", "insteadOf", "example"] as const) {
				expect(u[field].trim(), `${u.name}.${field}`).not.toBe("")
			}
		}
	})
})
