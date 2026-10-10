import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Grid } from "./Grid"

function el(node: ReturnType<typeof render>) {
	return node.container.firstChild as HTMLElement
}

describe("Grid", () => {
	it("emits count vars + the grid-cols attribute in cols mode", () => {
		const e = el(render(<Grid cols={{ base: 2, lg: 4 }} />))
		expect(e).toHaveAttribute("data-sable-grid-cols")
		expect(e.style.getPropertyValue("--cols-base")).toBe("2")
		expect(e.style.getPropertyValue("--cols-lg")).toBe("4")
	})

	it("defaults to a 12-column base", () => {
		const e = el(render(<Grid />))
		expect(e.style.getPropertyValue("--cols-base")).toBe("12")
	})

	it("uses inline auto-fit in minItemWidth mode (no grid-cols attr)", () => {
		const e = el(render(<Grid minItemWidth="11rem" />))
		expect(e).not.toHaveAttribute("data-sable-grid-cols")
		expect(e.style.display).toBe("grid")
		expect(e.style.gridTemplateColumns).toContain("auto-fit")
	})
})
