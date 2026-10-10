import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { buildRange, Pagination } from "./pagination"

describe("buildRange", () => {
	it("lists every page when they fit", () => {
		expect(buildRange(1, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
	})

	it("keeps a constant number of items once it collapses", () => {
		for (let page = 1; page <= 20; page++) {
			expect(buildRange(page, 20, 1)).toHaveLength(7)
		}
		for (let page = 1; page <= 50; page++) {
			expect(buildRange(page, 50, 2)).toHaveLength(9)
		}
	})

	it("always contains the first, last and current page", () => {
		for (let page = 1; page <= 20; page++) {
			const items = buildRange(page, 20, 1)
			expect(items[0]).toBe(1)
			expect(items.at(-1)).toBe(20)
			expect(items).toContain(page)
		}
	})

	it("collapses ten pages at the start", () => {
		expect(buildRange(1, 10, 1)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10])
		expect(buildRange(8, 20, 1)).toEqual([1, "ellipsis", 7, 8, 9, "ellipsis", 20])
		expect(buildRange(20, 20, 1)).toEqual([1, "ellipsis", 16, 17, 18, 19, 20])
	})
})

describe("Pagination", () => {
	function Fixture() {
		const [page, setPage] = useState(1)
		return <Pagination page={page} total={20} onPageChange={setPage} />
	}

	it("marks the current page and moves with next", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Fixture />)
		expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page")
		await user.click(screen.getByRole("button", { name: "Next page" }))
		expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page")
		expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled()
	})
})
