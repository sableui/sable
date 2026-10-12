import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { composeIconSets } from "../icon/compose"
import { brandIconSet } from "./brands"
import { reiconIconNames, reiconIconSet } from "./reicon"

/**
 * The whole reason this adapter moved into the package was drift: two apps kept
 * their own copy of the same mapping and one had silently lost `eye`/`eye-off`,
 * which renders as nothing rather than as an error. One adapter, one assertion.
 */
const contractNames: string[] = JSON.parse(
	readFileSync(resolve(__dirname, "..", "..", "registry.json"), "utf8"),
).iconContract.names

describe("reiconIconSet", () => {
	it("maps every name in the icon contract", () => {
		const missing = contractNames.filter((name) => !reiconIconNames.includes(name))
		expect(missing, `the Reicon adapter is missing: ${missing.join(", ")}`).toEqual([])
	})

	it("renders no inline color, so a text-* utility can tint the glyph", () => {
		// Reicon's createIcon defaults to style={{ color: 'currentColor', ...style }},
		// and an inline declaration outranks a class — so every tint Sable or a
		// consumer put on an icon was silently dead and the glyph took its parent's
		// ink instead. Note's severity-colored icons were neutral for anyone on the
		// default set, which is exactly the kind of miss that looks like a design
		// choice rather than a bug. Guard the absence, not the presence.
		const { container } = render(
			<>
				{reiconIconSet({
					name: "warning",
					variant: "outline",
					className: "text-tone-warning",
				})}
			</>,
		)
		const svg = container.querySelector("svg")
		expect(svg).not.toBeNull()
		expect(svg?.getAttribute("class")).toContain("text-tone-warning")
		expect(svg?.getAttribute("style") ?? "").not.toContain("color")
	})

	it("maps no name outside the contract", () => {
		// A stray mapping is a name a component can never legitimately ask for, and
		// it hides the fact that the contract should have grown instead.
		const extra = reiconIconNames.filter((name) => !contractNames.includes(name))
		expect(extra, `mapped but not in the contract: ${extra.join(", ")}`).toEqual([])
	})

	it("renders something for every contract name", () => {
		const empty: string[] = []
		for (const name of contractNames) {
			if (reiconIconSet({ name, variant: "regular" }) == null) empty.push(name)
		}
		expect(empty, `resolved to null: ${empty.join(", ")}`).toEqual([])
	})

	it("returns null for an unknown name so composed sets can fall through", () => {
		expect(reiconIconSet({ name: "not-a-real-icon", variant: "regular" })).toBeNull()
	})
})

describe("composeIconSets", () => {
	it("prefers the first set that resolves a name", () => {
		const marker = <span data-testid="from-override" />
		const overrides = ({ name }: { name: string }) => (name === "heart" ? marker : null)
		const composed = composeIconSets(overrides, reiconIconSet)

		const { container } = render(<>{composed({ name: "heart", variant: "regular" })}</>)
		expect(container.querySelector('[data-testid="from-override"]')).not.toBeNull()
	})

	it("falls through to the next set for names the first does not handle", () => {
		const overrides = ({ name }: { name: string }) =>
			name === "heart" ? <span data-testid="from-override" /> : null
		const composed = composeIconSets(overrides, reiconIconSet)

		// `gear` isn't in the override set, so the Reicon adapter must supply it.
		expect(composed({ name: "gear", variant: "regular" })).not.toBeNull()
	})

	it("returns null when no set in the chain resolves the name", () => {
		const composed = composeIconSets(reiconIconSet)
		expect(composed({ name: "nothing-maps-this", variant: "regular" })).toBeNull()
	})
})

describe("icon sets on re-render", () => {
	// Reicon and the brand set draw with dangerouslySetInnerHTML, and React 19
	// writes innerHTML back whenever the `{ __html }` object changes. A fresh one
	// per render replaced the glyph's nodes on every parent render, which Base
	// UI's Toast.Content (it re-measures on DOM changes, then re-renders) turned
	// into an infinite loop that froze the page.
	it.each([
		["reicon", reiconIconSet, "xmark"],
		["brands", brandIconSet, "github"],
	])("%s keeps the glyph's nodes when the props have not changed", (_, set, name) => {
		const { container, rerender } = render(<>{set({ name, variant: "regular", className: "text-sm" })}</>)
		const before = container.querySelector("svg")?.firstChild
		expect(before).toBeTruthy()
		rerender(<>{set({ name, variant: "regular", className: "text-sm" })}</>)
		expect(container.querySelector("svg")?.firstChild).toBe(before)
	})
})
