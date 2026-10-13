import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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
