import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { composeIconSets } from "../icon/compose"
import { BRAND_GLYPHS, brandIconNames, brandIconSet } from "./brands"

/**
 * The brand set is vendored artwork, so the risks are different from the Reicon
 * adapter's. Nothing here can drift against a contract — brand names are not in
 * one — but the artwork itself can arrive wrong in ways that look like a design
 * choice: a mark that keeps its upstream color ignores `text-*`, and a mark
 * left on its source viewBox sits visibly smaller or larger than the UI glyph
 * beside it. Both are asserted below, over every glyph rather than a sample.
 */
describe("brandIconSet", () => {
	it("carries the marks a product actually reaches for", () => {
		// A sample of the retained npm-sourced marks.
		const floor = [
			"x",
			"github",
			"instagram",
			"youtube",
			"discord",
		]
		const missing = floor.filter((name) => !brandIconNames.includes(name))
		expect(missing, `the brand set is missing: ${missing.join(", ")}`).toEqual([])
	})

	it("does not distribute the four uncleared CDN-only marks", () => {
		for (const name of ["linkedin", "slack", "microsoft", "openai"]) {
			expect(brandIconNames).not.toContain(name)
			expect(brandIconSet({ name, variant: "brands" })).toBeNull()
		}
	})

	it("normalizes every mark onto the 24 grid", () => {
		// A mark still on its source viewBox (0 0 256 256, 0 0 2447.6 2452.5 — both
		// real upstream values) renders at the wrong optical size next to a UI
		// glyph on the same row, and no amount of `text-*` sizing fixes it.
		for (const name of brandIconNames) {
			const { container } = render(<>{brandIconSet({ name, variant: "brands" })}</>)
			expect(
				container.querySelector("svg")?.getAttribute("viewBox"),
				`${name} is not on the 24 grid`,
			).toBe("0 0 24 24")
		}
	})

	it("carries no hardcoded color, so a text-* utility can tint the mark", () => {
		// `fill="none"` must survive: it is structure, not color — it is how a
		// counter (the hole in a letterform, the gap in a logo) is drawn, and
		// recoloring it paints the hole solid.
		for (const [name, glyph] of Object.entries(BRAND_GLYPHS)) {
			const colors = [...glyph.markup.matchAll(/(fill|stroke)="([^"]*)"/g)]
				.map((match) => match[2].trim().toLowerCase())
				.filter(
					(value) =>
						value !== "none" &&
						value !== "currentcolor" &&
						value !== "transparent" &&
						!value.startsWith("url("),
				)
			expect(colors, `${name} hardcodes color: ${colors.join(", ")}`).toEqual([])
			expect(glyph.markup, `${name} carries an inline style`).not.toMatch(/style=/)
		}
	})

	it("names the brand for AT, and takes an override", () => {
		const { container } = render(<>{brandIconSet({ name: "github", variant: "brands" })}</>)
		const svg = container.querySelector("svg")
		// A mark used as a link's only content still needs a name, and the brand's
		// own is the right default — an aria-hidden logo is an unlabeled link.
		expect(svg?.getAttribute("role")).toBe("img")
		expect(svg?.getAttribute("aria-label")).toBe("GitHub")

		const custom = render(
			<>{brandIconSet({ name: "github", variant: "brands", title: "Follow us" })}</>,
		)
		expect(custom.container.querySelector("svg")?.getAttribute("aria-label")).toBe("Follow us")
	})

	it("hides the mark when an empty title says it is decorative", () => {
		// `title=""` is the opt-out for a logo sitting beside its own text label,
		// where announcing the brand twice is noise.
		const { container } = render(
			<>{brandIconSet({ name: "github", variant: "brands", title: "" })}</>,
		)
		const svg = container.querySelector("svg")
		expect(svg?.getAttribute("aria-hidden")).toBe("true")
		expect(svg?.getAttribute("role")).toBeNull()
	})

	it("returns null for a name it does not carry, so composition falls through", () => {
		expect(brandIconSet({ name: "gear", variant: "regular" })).toBeNull()

		// The composition contract: brand set first, UI set second, and a UI name
		// still resolves. If the brand set returned an empty element instead of
		// null it would win here and render nothing at all.
		const uiSet = () => <svg data-testid="ui-set" />
		const composed = composeIconSets(brandIconSet, uiSet)
		const { container } = render(<>{composed({ name: "gear", variant: "regular" })}</>)
		expect(container.querySelector("[data-testid=ui-set]")).not.toBeNull()
	})
})
