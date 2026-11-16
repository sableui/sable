import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Density } from "../../lib/density"
import { renderWithProviders } from "../../test/render"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table"

describe("TableRow", () => {
	it("hover-lifts body rows only, never the header or footer row", () => {
		render(
			<Table>
				<TableHeader>
					<TableRow><TableHead>Customer</TableHead></TableRow>
				</TableHeader>
				<TableBody>
					<TableRow><TableCell>Ada</TableCell></TableRow>
				</TableBody>
				<TableFooter>
					<TableRow><TableCell>1 customer</TableCell></TableRow>
				</TableFooter>
			</Table>,
		)
		// The hover is scoped to `tbody > tr` in the row's own class, so a header
		// or footer row carries it but never matches; no bare `hover:` fill.
		for (const row of screen.getAllByRole("row")) {
			expect(row).toHaveClass("[tbody>&:hover]:bg-muted/50")
			expect(row.className).not.toMatch(/(^|\s)hover:bg-/)
		}
	})

	it("paints the selected fill on its cells with a 1px spill, so fractional widths leave no seams", () => {
		render(
			<Table>
				<TableBody>
					<TableRow data-selected>
						<TableCell>Low tide, high noon</TableCell>
					</TableRow>
				</TableBody>
			</Table>,
		)
		const row = screen.getByRole("row")
		// Not the row's own background: that is painted per cell and can seam.
		expect(row.className).not.toMatch(/(^|\s)data-\[selected\]:bg-/)
		expect(row).toHaveClass("data-[selected]:*:bg-muted", "data-[selected]:*:shadow-[1px_0_0_var(--muted)]")
	})
})

describe("Table density", () => {
	const css = readFileSync(join(import.meta.dirname, "..", "..", "styles.css"), "utf8")
	const block = (selector: string) => {
		const start = css.indexOf(`${selector} {`)
		return css.slice(start, css.indexOf("\n}", start))
	}

	it("reads its head height and cell padding from the density scope, with the page values as fallbacks", () => {
		render(
			<Table>
				<TableHeader><TableRow><TableHead>Issue</TableHead></TableRow></TableHeader>
				<TableBody><TableRow><TableCell>Refine product page</TableCell></TableRow></TableBody>
			</Table>,
		)
		expect(screen.getByRole("columnheader")).toHaveClass("h-[var(--table-head-h,--spacing(10))]")
		expect(screen.getByRole("cell")).toHaveClass("py-[var(--table-cell-py,--spacing(2.5))]")
		// Compact sets both; comfortable unsets both so a nested page form gets them back.
		expect(block('[data-density="compact"]')).toMatch(/--table-head-h: var\(--control-sm\);[\s\S]*--table-cell-py: calc\(var\(--spacing\) \* 2\);/)
		expect(block(':root,\n[data-density="comfortable"]')).toMatch(/--table-head-h: initial;[\s\S]*--table-cell-py: initial;/)
	})

	it("sets its rows in the register's reading tier", () => {
		const { rerender } = render(<Table><TableBody><TableRow><TableCell>Row</TableCell></TableRow></TableBody></Table>)
		expect(screen.getByRole("table")).toHaveClass("text-body-sm")
		rerender(
			<Density value="compact">
				<Table><TableBody><TableRow><TableCell>Row</TableCell></TableRow></TableBody></Table>
			</Density>,
		)
		expect(screen.getByRole("table")).toHaveClass("text-ui-body")
		expect(screen.getByRole("table")).not.toHaveClass("text-body-sm")
	})

	it("gives compact controls the comfortable ladder on a coarse pointer", () => {
		const coarse = css.slice(css.indexOf("@media (pointer: coarse)"))
		expect(coarse).toMatch(/^@media \(pointer: coarse\) \{\s*\[data-density="compact"\] \{\s*--control-xs: 28px;\s*--control-sm: 32px;\s*--control-md: 40px;/)
	})
})

describe("TableHead sortable", () => {
	it("is a sort button with aria-sort on the cell; the chevron turns for descending", async () => {
		let clicks = 0
		const { rerender } = renderWithProviders(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead sortable sortDirection="asc" onSort={() => clicks++}>Name</TableHead>
						<TableHead sortable numeric>Amount</TableHead>
						<TableHead>Notes</TableHead>
					</TableRow>
				</TableHeader>
			</Table>,
		)
		const name = screen.getByRole("columnheader", { name: /Name/ })
		expect(name).toHaveAttribute("aria-sort", "ascending")
		await userEvent.click(screen.getByRole("button", { name: /Name/ }))
		expect(clicks).toBe(1)
		// Unsorted: no aria-sort, a resting chevron. Numeric: the chevron leads.
		const amount = screen.getByRole("button", { name: /Amount/ })
		expect(screen.getByRole("columnheader", { name: /Amount/ })).not.toHaveAttribute("aria-sort")
		expect(amount.className).toContain("flex-row-reverse")
		expect(amount.querySelector("[data-icon]")?.getAttribute("class")).toContain("opacity-60")
		expect(screen.queryByRole("button", { name: /Notes/ })).toBeNull()

		rerender(
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead sortable sortDirection="desc">Name</TableHead>
					</TableRow>
				</TableHeader>
			</Table>,
		)
		expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "descending")
		expect(screen.getByRole("button", { name: /Name/ }).querySelector("[data-icon]")?.getAttribute("class")).toContain("rotate-180")
	})
})
