import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EDGE_PROP, safeAreaInsets } from "./_safeArea"
import { Region } from "./Region"

function el(node: ReturnType<typeof render>) {
	return node.container.firstChild as HTMLElement
}

describe("Region.max (L1)", () => {
	it("resolves a named max to its CSS var and centers", () => {
		const node = render(<Region max="prose">x</Region>)
		expect(el(node).style.getPropertyValue("--sable-region-max")).toBe("var(--measure-prose)")
		expect(el(node)).toHaveClass("mx-auto", "max-w-(--sable-region-max)")
	})

	it("accepts an arbitrary CSS length for max", () => {
		const node = render(<Region max="56rem">x</Region>)
		expect(el(node).style.getPropertyValue("--sable-region-max")).toBe("56rem")
	})

	it("stays fully fluid (no cap) when max is omitted", () => {
		const node = render(<Region>x</Region>)
		expect(el(node).style.getPropertyValue("--sable-region-max")).toBe("")
		// No cap class either: the variable inherits, so a bare class would read
		// a capped ancestor's width.
		expect(el(node).className).not.toContain("max-w-")
	})
})

// jsdom's CSSOM rejects env() values, so the per-edge behavior is asserted on the
// pure helper Region.safeArea + SafeArea both build from (the actual L3 logic),
// rather than reading it back off the rendered node.
describe("safeAreaInsets (Region.safeArea / SafeArea core)", () => {
	it("pads only the requested edges", () => {
		expect(safeAreaInsets(["top"])).toEqual({
			paddingTop: "env(safe-area-inset-top, 0px)",
		})
	})

	it("maps each edge to its padding property", () => {
		expect(safeAreaInsets(["top", "bottom", "left", "right"])).toEqual({
			paddingTop: "env(safe-area-inset-top, 0px)",
			paddingBottom: "env(safe-area-inset-bottom, 0px)",
			paddingLeft: "env(safe-area-inset-left, 0px)",
			paddingRight: "env(safe-area-inset-right, 0px)",
		})
	})

	it("returns an empty object for no edges", () => {
		expect(safeAreaInsets([])).toEqual({})
	})

	it("EDGE_PROP covers all four edges", () => {
		expect(Object.keys(EDGE_PROP)).toEqual(["top", "bottom", "left", "right"])
	})
})
