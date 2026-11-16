import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { composeIconSets } from "../icon/compose"
import { brandIconSet } from "./brands"
import { ICON_ALIASES, ICON_NAMES } from "../icon/names"
import { reiconIconNames, reiconIconSet, reiconSolidCoreNames } from "./reicon"
import { reiconSolidIconNames, reiconSolidIconSet } from "./reicon-solid"

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

	it("keeps the core's name list and the registry contract the same list", () => {
		// <Icon> suggests from ICON_NAMES without importing any set, so it has to
		// be the contract, and the contract has to be what this adapter draws.
		expect([...ICON_NAMES].sort()).toEqual([...contractNames].sort())
	})

	it("draws every alias's target", () => {
		const missing = Object.values(ICON_ALIASES).filter((name) => !reiconIconNames.includes(name))
		expect(missing).toEqual([])
	})

	it("returns null for an unknown name so composed sets can fall through", () => {
		expect(reiconIconSet({ name: "not-a-real-icon", variant: "regular" })).toBeNull()
	})
})

describe("solid weight", () => {
	const markupOf = (node: ReturnType<typeof reiconIconSet>) => {
		const { container, unmount } = render(<>{node}</>)
		const html = container.innerHTML
		unmount()
		return html
	}

	it("keeps the solid weight for every glyph Sable's own source draws solid", () => {
		// The default set carries Filled artwork only for these names; a component
		// that starts drawing another glyph solid would silently fall back to the
		// outline. Scan the library for literal solid call sites.
		const root = resolve(__dirname, "..")
		const files: string[] = []
		const walk = (dir: string) => {
			for (const entry of readdirSync(dir)) {
				const path = join(dir, entry)
				// The icon sets' own doc comments show solid usage; they are not call sites.
				if (statSync(path).isDirectory()) entry !== "icon-sets" && walk(path)
				else if (/\.tsx?$/.test(entry) && !/\.(test|meta)\.tsx?$/.test(entry)) files.push(path)
			}
		}
		walk(root)
		const used = new Set<string>()
		for (const file of files) {
			const code = readFileSync(file, "utf8")
			for (const [tag] of code.matchAll(/<Icon\b[^>]*variant=(?:"solid"|\{[^}]*"solid"[^}]*\})[^>]*>/g)) {
				for (const [, name] of tag.matchAll(/"([a-z][a-z-]*)"/g)) if (reiconIconNames.includes(name)) used.add(name)
			}
		}
		used.add("ellipsis") // OverflowMenu's default icon, drawn solid through a prop
		const missing = [...used].filter((name) => !reiconSolidCoreNames.includes(name))
		expect(missing, `drawn solid in src but not in SOLID_IN_DEFAULT: ${missing.join(", ")}`).toEqual([])
	})

	it("draws the Filled weight for a core solid glyph and the outline otherwise", () => {
		expect(markupOf(reiconIconSet({ name: "heart", variant: "solid" }))).not.toBe(
			markupOf(reiconIconSet({ name: "heart", variant: "regular" })),
		)
		// Not carried by the default set: the outline, never nothing.
		expect(markupOf(reiconIconSet({ name: "bell", variant: "solid" }))).toBe(
			markupOf(reiconIconSet({ name: "bell", variant: "regular" })),
		)
	})

	it("the solid subpath draws every contract name, and only for variant solid", () => {
		const missing = contractNames.filter((name) => !reiconSolidIconNames.includes(name))
		expect(missing).toEqual([])
		expect(reiconSolidIconSet({ name: "bell", variant: "regular" })).toBeNull()
		const composed = composeIconSets(reiconSolidIconSet, reiconIconSet)
		expect(markupOf(composed({ name: "bell", variant: "solid" }))).not.toBe(
			markupOf(reiconIconSet({ name: "bell", variant: "regular" })),
		)
		expect(markupOf(composed({ name: "bell", variant: "regular" }))).toBe(
			markupOf(reiconIconSet({ name: "bell", variant: "regular" })),
		)
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
