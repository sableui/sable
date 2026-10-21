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

describe("DataTable groups", () => {
	type Issue = { id: string; title: string; status: string; rank: number }
	const issues: Issue[] = [
		{ id: "A-3", title: "Gamma", status: "done", rank: 3 },
		{ id: "A-1", title: "Alpha", status: "todo", rank: 1 },
		{ id: "A-4", title: "Delta", status: "doing", rank: 4 },
		{ id: "A-2", title: "Beta", status: "todo", rank: 2 },
		{ id: "A-5", title: "Epsilon", status: "triage", rank: 5 },
	]
	const issueColumns: DataTableColumn<Issue>[] = [
		{ key: "title", header: "Title", sortable: true },
		{ key: "rank", header: "Rank", sortable: true },
	]
	const groups = [
		{ key: "doing", label: "In progress" },
		{ key: "todo", label: "Todo", action: <button type="button">Add to Todo</button> },
		{ key: "done", label: "Done", defaultExpanded: false },
		{ key: "cancelled", label: "Cancelled" },
	]

	/** Group labels and the titles under each, in render order. Hidden rows are marked. */
	function layout() {
		return [...document.querySelectorAll("tbody")].map((body) => {
			const [header, ...rest] = [...body.querySelectorAll("tr")]
			return {
				group: header.querySelector("th")?.textContent,
				rows: rest.map((r) => `${r.querySelector("td")?.textContent}${r.hidden ? " (hidden)" : ""}`),
			}
		})
	}

	it("shares one header across the groups, in the listed order, unlisted groups last", () => {
		renderWithProviders(<DataTable data={issues} columns={issueColumns} rowKey={(i) => i.id} groupBy={(i) => i.status} groups={groups} />)
		expect(document.querySelectorAll("thead")).toHaveLength(1)
		expect(layout()).toEqual([
			{ group: "In progress1", rows: ["Delta"] },
			{ group: "Todo2Add to Todo", rows: ["Alpha", "Beta"] },
			{ group: "Done1", rows: ["Gamma (hidden)"] },
			{ group: "triage1", rows: ["Epsilon"] },
		])
		// A group header is a rowgroup header, not a column header.
		expect(screen.getAllByRole("rowheader").map((h) => h.getAttribute("scope"))).toEqual(["rowgroup", "rowgroup", "rowgroup", "rowgroup"])
	})

	it("opens and closes a group from its header", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataTable data={issues} columns={issueColumns} groupBy={(i) => i.status} groups={groups} />)
		const todo = screen.getByRole("button", { name: /^Todo/ })
		expect(todo).toHaveAttribute("aria-expanded", "true")
		expect(document.getElementById(todo.getAttribute("aria-controls") ?? "")?.tagName).toBe("TBODY")
		await user.click(todo)
		expect(todo).toHaveAttribute("aria-expanded", "false")
		expect(layout()[1].rows).toEqual(["Alpha (hidden)", "Beta (hidden)"])
		await user.click(screen.getByRole("button", { name: /^Done/ }))
		expect(layout()[2].rows).toEqual(["Gamma"])
	})

	it("reports open groups when controlled", async () => {
		const user = userEvent.setup()
		const onExpandedGroupsChange = vi.fn()
		renderWithProviders(
			<DataTable
				data={issues}
				columns={issueColumns}
				groupBy={(i) => i.status}
				expandedGroups={new Set(["todo"])}
				onExpandedGroupsChange={onExpandedGroupsChange}
			/>,
		)
		expect(layout().map((g) => g.rows.every((r) => r.endsWith("(hidden)")))).toEqual([true, false, true, true])
		await user.click(screen.getByRole("button", { name: /done/ }))
		expect([...onExpandedGroupsChange.mock.calls[0][0]].sort()).toEqual(["done", "todo"])
	})

	it("renders plain group headers when not collapsible", () => {
		renderWithProviders(<DataTable data={issues} columns={issueColumns} groupBy={(i) => i.status} groups={groups} collapsible={false} />)
		expect(screen.queryByRole("button", { name: /^Todo/ })).toBeNull()
		expect(layout()[2].rows).toEqual(["Gamma"])
	})

	it("sorts within each group", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataTable data={issues} columns={issueColumns} groupBy={(i) => i.status} groups={groups} />)
		await user.click(screen.getByRole("button", { name: /Rank/ }))
		await user.click(screen.getByRole("button", { name: /Rank/ }))
		expect(layout()[1].rows).toEqual(["Beta", "Alpha"])
		expect(layout()[0].group).toBe("In progress1")
	})

	it("selects across groups; select-all takes only the rows in open groups", async () => {
		const user = userEvent.setup()
		function Selectable() {
			const [keys, setKeys] = useState<Set<string | number>>(new Set())
			return (
				<>
					<DataTable
						data={issues}
						columns={issueColumns}
						rowKey={(i) => i.id}
						groupBy={(i) => i.status}
						groups={groups}
						selectedKeys={keys}
						onSelectedKeysChange={setKeys}
						rowSelectionLabel={(i) => `Select ${i.title}`}
					/>
					<output>{[...keys].sort().join(",")}</output>
				</>
			)
		}
		renderWithProviders(<Selectable />)
		await user.click(screen.getByRole("checkbox", { name: "Select Delta" }))
		await user.click(screen.getByRole("checkbox", { name: "Select Beta" }))
		expect(screen.getByRole("status")).toHaveTextContent("A-2,A-4")
		// Done is closed, so its row is not among the four shown.
		const all = screen.getByRole("checkbox", { name: "Select all 4 shown" })
		await user.click(all)
		expect(screen.getByRole("status")).toHaveTextContent("A-1,A-2,A-4,A-5")
	})

	it("opens a row from the keyboard inside a group", async () => {
		const user = userEvent.setup()
		const onRowClick = vi.fn()
		renderWithProviders(<DataTable data={issues} columns={issueColumns} groupBy={(i) => i.status} onRowClick={onRowClick} />)
		screen.getByText("Delta").closest("tr")?.focus()
		await user.keyboard("{Enter}")
		expect(onRowClick).toHaveBeenCalledWith(issues[2])
	})

	it("shows the empty state, not group headers, with no rows", () => {
		renderWithProviders(<DataTable data={[] as Issue[]} columns={issueColumns} groupBy={(i) => i.status} groups={groups} empty="No issues" />)
		expect(screen.getByText("No issues")).toBeInTheDocument()
		expect(screen.queryAllByRole("rowheader")).toHaveLength(0)
	})
})
