import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Grid } from "./Grid"

function el(node: ReturnType<typeof render>) {
	return node.container.firstChild as HTMLElement
}

describe("Grid", () => {
	it("takes [row, column] gaps on the rhythm, so a gallery can space rows and columns apart", () => {
		const e = el(render(<Grid cols={2} gap={[5, 3]} />))
		expect(e.style.gap).toBe("calc(var(--rhythm-unit) * 5) calc(var(--rhythm-unit) * 3)")
	})

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

	it("uses an inline track in minItemWidth mode (no grid-cols attr)", () => {
		const e = el(render(<Grid minItemWidth="11rem" />))
		expect(e).not.toHaveAttribute("data-sable-grid-cols")
		expect(e.style.display).toBe("grid")
		expect(e.style.gridTemplateColumns).toContain("minmax(min(11rem, 100%), 1fr)")
	})

	// A lone search result must stay one column wide: with auto-fit the empty
	// tracks collapse and it stretches across the whole row.
	it("keeps empty columns by default, so sparse items keep their size", () => {
		const e = el(render(<Grid minItemWidth="11rem"><div /></Grid>))
		expect(e.style.gridTemplateColumns).toContain("auto-fill")
		expect(e.style.gridTemplateColumns).not.toContain("auto-fit")
	})

	it("stretches items across the row with track=fit", () => {
		const e = el(render(<Grid minItemWidth="11rem" track="fit" />))
		expect(e.style.gridTemplateColumns).toContain("auto-fit")
	})
})
