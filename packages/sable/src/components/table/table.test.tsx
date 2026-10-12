import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Table, TableBody, TableCell, TableRow } from "./table"

describe("TableRow", () => {
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
