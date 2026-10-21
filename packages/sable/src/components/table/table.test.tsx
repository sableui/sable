import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Density } from "../../lib/density"
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
