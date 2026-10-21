import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, within } from "../test/render"
import { TrackerPage } from "./tracker-page"

/** Answers Sable's `(width < Nrem)` breakpoint queries as if the viewport were this wide. */
function setViewport(widthPx: number) {
	const original = window.matchMedia
	window.matchMedia = vi.fn((query: string) => {
		const m = /\(width < ([\d.]+)rem\)/.exec(query)
		return {
			matches: m ? widthPx < Number(m[1]) * 16 : false,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		}
	}) as unknown as typeof window.matchMedia
	return () => {
		window.matchMedia = original
	}
}

let restore: (() => void) | undefined
afterEach(() => {
	restore?.()
	restore = undefined
})

describe("TrackerPage", () => {
	it("groups the issues under one header, with the selected issue in a docked inspector", () => {
		restore = setViewport(1440)
		renderWithProviders(<TrackerPage />)
		const tables = screen.getAllByRole("table")
		expect(tables).toHaveLength(1)
		expect(within(tables[0]).getAllByRole("columnheader", { name: "Issue" })).toHaveLength(1)
		expect(within(tables[0]).getByRole("button", { name: /^In progress/ })).toHaveAttribute("aria-expanded", "true")
		expect(within(tables[0]).getByRole("button", { name: /^Done/ })).toHaveAttribute("aria-expanded", "false")
		const inspector = screen.getByRole("complementary", { name: "Issue details" })
		expect(within(inspector).getByRole("heading", { level: 2 })).toHaveTextContent("Sync offline edits")
		expect(screen.queryByRole("dialog")).toBeNull()
	})

	it("puts the rail's views in named groups and ends it with the account menu", async () => {
		restore = setViewport(1440)
		renderWithProviders(<TrackerPage />)
		const rail = screen.getByRole("complementary", { name: "Workspace navigation" })
		expect(within(rail).getByRole("group", { name: "Mobile app" })).toBeInTheDocument()
		await userEvent.click(within(rail).getByRole("button", { name: /Ama Kusi/ }))
		expect(await screen.findByRole("menuitem", { name: "Settings" })).toBeInTheDocument()
		expect(screen.getByRole("menuitem", { name: /Appearance/ })).toBeInTheDocument()
	})

	it("swaps the table for an empty state when the search matches nothing", async () => {
		restore = setViewport(1440)
		renderWithProviders(<TrackerPage />)
		await userEvent.type(screen.getByRole("searchbox", { name: "Find issue" }), "zzz")
		expect(screen.queryByRole("table")).toBeNull()
		await userEvent.click(screen.getByRole("button", { name: "Clear filters" }))
		expect(screen.getByRole("table")).toBeInTheDocument()
	})

	it("on a phone, loads without a sheet and opens the inspector as one when a row is picked", async () => {
		restore = setViewport(390)
		renderWithProviders(<TrackerPage />)
		expect(screen.queryByRole("dialog")).toBeNull()
		await userEvent.click(screen.getByText("Crash when attaching a large photo"))
		const sheet = await screen.findByRole("dialog", { name: "Issue details" })
		expect(within(sheet).getByRole("heading", { name: "Crash when attaching a large photo" })).toBeInTheDocument()
	})
})
