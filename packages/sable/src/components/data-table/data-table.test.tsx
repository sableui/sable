import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { DataTable, type DataTableColumn } from "./data-table"

type Row = { name: string; age: number }
const data: Row[] = [
	{ name: "Carol", age: 30 },
	{ name: "Alice", age: 25 },
	{ name: "Bob", age: 35 },
]
const columns: DataTableColumn<Row>[] = [
	{ key: "name", header: "Name", sortable: true },
	{ key: "age", header: "Age", sortable: true },
]

/** The first-cell (Name) text of each body row, in render order. */
function rowNames() {
	return screen
		.getAllByRole("row")
		.slice(1)
		.map((r) => r.querySelector("td")?.textContent)
}

describe("DataTable", () => {
	it("renders the rows and cycles sort asc → desc on header click", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataTable data={data} columns={columns} />)
		expect(rowNames()).toEqual(["Carol", "Alice", "Bob"])

		await user.click(screen.getByRole("button", { name: /Name/ }))
		expect(rowNames()).toEqual(["Alice", "Bob", "Carol"])

		await user.click(screen.getByRole("button", { name: /Name/ }))
		expect(rowNames()).toEqual(["Carol", "Bob", "Alice"])
	})

	it("sets aria-sort on the active column", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataTable data={data} columns={columns} />)
		await user.click(screen.getByRole("button", { name: /Age/ }))
		expect(
			screen.getByRole("columnheader", { name: /Age/ }),
		).toHaveAttribute("aria-sort", "ascending")
	})

	it("renders the empty state spanning the columns", () => {
		renderWithProviders(
			<DataTable data={[]} columns={columns} empty="Nothing here" />,
		)
		expect(screen.getByText("Nothing here")).toBeInTheDocument()
	})

	it("fires onRowClick with the row", async () => {
		const user = userEvent.setup()
		const onRowClick = vi.fn()
		renderWithProviders(
			<DataTable data={data} columns={columns} onRowClick={onRowClick} />,
		)
		await user.click(screen.getByText("Alice"))
		expect(onRowClick).toHaveBeenCalledWith({ name: "Alice", age: 25 })
	})
})

describe("DataTable selection", () => {
	function Selectable({ onRowClick }: { onRowClick?: (row: Row) => void }) {
		const [keys, setKeys] = useState<Set<string | number>>(new Set())
		return (
			<>
				<DataTable
					columns={columns}
					data={data}
					rowKey={(r) => r.name}
					selectedKeys={keys}
					onSelectedKeysChange={setKeys}
					rowSelectionLabel={(r) => `Select ${r.name}`}
					onRowClick={onRowClick}
				/>
				<output>{[...keys].sort().join(",")}</output>
			</>
		)
	}

	it("checks rows by key, and select-all goes mixed, then all, then none", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Selectable />)
		const all = screen.getByRole("checkbox", { name: "Select all 3 shown" })
		await user.click(screen.getByRole("checkbox", { name: "Select Bob" }))
		expect(screen.getByRole("status")).toHaveTextContent("Bob")
		expect(all).toHaveAttribute("aria-checked", "mixed")
		expect(screen.getByRole("checkbox", { name: "Select Bob" }).closest("tr")).toHaveAttribute("data-selected")
		await user.click(all)
		expect(screen.getByRole("status")).toHaveTextContent("Alice,Bob,Carol")
		expect(all).toHaveAttribute("aria-checked", "true")
		await user.click(all)
		expect(screen.getByRole("status")).toHaveTextContent(/^$/)
	})

	it("keeps a row's key through a re-sort", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Selectable />)
		await user.click(screen.getByRole("checkbox", { name: "Select Carol" }))
		await user.click(screen.getByRole("button", { name: /Name/ }))
		expect(screen.getByRole("checkbox", { name: "Select Carol" })).toHaveAttribute("aria-checked", "true")
		expect(screen.getByRole("checkbox", { name: "Select Alice" })).toHaveAttribute("aria-checked", "false")
	})

	it("checking a box does not open the row", async () => {
		const user = userEvent.setup()
		const onRowClick = vi.fn()
		renderWithProviders(<Selectable onRowClick={onRowClick} />)
		await user.click(screen.getByRole("checkbox", { name: "Select Alice" }))
		expect(onRowClick).not.toHaveBeenCalled()
		expect(screen.getByRole("status")).toHaveTextContent("Alice")
	})

	it("adds no checkbox column without onSelectedKeysChange", () => {
		renderWithProviders(<DataTable columns={columns} data={data} />)
		expect(screen.queryAllByRole("checkbox")).toHaveLength(0)
	})
})
