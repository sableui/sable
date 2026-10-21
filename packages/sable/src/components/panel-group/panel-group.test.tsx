import { act, renderHook } from "@testing-library/react"
import type { ComponentProps } from "react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Panel, PanelGroup, PanelResizer, usePanelWidth } from "./panel-group"

/** matchMedia answering `(width < Nrem)` for a fixed viewport width. */
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
		} as unknown as MediaQueryList
	}) as typeof window.matchMedia
	return () => {
		window.matchMedia = original
	}
}

let restoreViewport: (() => void) | null = null
afterEach(() => {
	restoreViewport?.()
	restoreViewport = null
})

describe("Panel narrow behaviour", () => {
	function Shell(props: Partial<ComponentProps<typeof Panel>>) {
		return (
			<PanelGroup>
				<Panel label="Canvas">List</Panel>
				<Panel label="Issue details" width={320} {...props}>
					<p>Inspector body</p>
				</Panel>
			</PanelGroup>
		)
	}

	it("stays docked by default at any width", () => {
		restoreViewport = setViewport(390)
		renderWithProviders(<Shell />)
		expect(screen.getByRole("complementary", { name: "Issue details" })).toHaveTextContent("Inspector body")
		expect(screen.queryByRole("dialog")).toBeNull()
	})

	it("docks above the breakpoint and renders its content once", () => {
		restoreViewport = setViewport(1280)
		renderWithProviders(<Shell narrow="sheet" open />)
		expect(screen.getByRole("complementary", { name: "Issue details" })).toBeInTheDocument()
		expect(screen.getAllByText("Inspector body")).toHaveLength(1)
		expect(screen.queryByRole("dialog")).toBeNull()
	})

	it("lets a Sidebar moved into the sheet fill it", async () => {
		restoreViewport = setViewport(390)
		renderWithProviders(<Shell narrow="sheet" open />)
		const dialog = await screen.findByRole("dialog")
		expect(dialog.className).toContain("[--sidebar-width:100%]")
	})

	it("removes the docked column when open is false", () => {
		restoreViewport = setViewport(1280)
		renderWithProviders(<Shell narrow="sheet" open={false} />)
		expect(screen.queryByRole("complementary", { name: "Issue details" })).toBeNull()
		expect(screen.queryByText("Inspector body")).toBeNull()
	})

	it("becomes a sheet below the breakpoint, named by its label", () => {
		restoreViewport = setViewport(390)
		renderWithProviders(<Shell narrow="sheet" open />)
		expect(screen.queryByRole("complementary", { name: "Issue details" })).toBeNull()
		const sheet = screen.getByRole("dialog", { name: "Issue details" })
		expect(sheet).toHaveTextContent("Inspector body")
		expect(sheet).toHaveAttribute("data-sable-sheet", "right")
		expect(screen.getAllByText("Inspector body")).toHaveLength(1)
	})

	it("keeps the sheet closed unless open is passed", () => {
		restoreViewport = setViewport(390)
		renderWithProviders(<Shell narrow="sheet" />)
		expect(screen.queryByRole("dialog")).toBeNull()
		expect(screen.queryByText("Inspector body")).toBeNull()
	})

	it("opens from the side it is given and reports Esc through onOpenChange", async () => {
		restoreViewport = setViewport(390)
		const user = userEvent.setup()
		const onOpenChange = vi.fn()
		renderWithProviders(<Shell narrow="sheet" side="left" open onOpenChange={onOpenChange} />)
		expect(screen.getByRole("dialog", { name: "Issue details" })).toHaveAttribute("data-sable-sheet", "left")
		await user.keyboard("{Escape}")
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})

	it("drops a hidden panel below the breakpoint", () => {
		restoreViewport = setViewport(390)
		renderWithProviders(<Shell narrow="hidden" open />)
		expect(screen.queryByText("Inspector body")).toBeNull()
		expect(screen.queryByRole("dialog")).toBeNull()
	})

	it("honours a custom breakpoint", () => {
		restoreViewport = setViewport(900)
		renderWithProviders(<Shell narrow="sheet" open below="md" />)
		expect(screen.getByRole("complementary", { name: "Issue details" })).toBeInTheDocument()
	})
})

describe("usePanelWidth", () => {
	it("keeps unpersisted panels independent of each other", () => {
		const { result } = renderHook(() => ({
			left: usePanelWidth(240),
			right: usePanelWidth(260),
		}))
		act(() => result.current.left[1](300))
		expect(result.current.left[0]).toBe(300)
		expect(result.current.right[0]).toBe(260)
	})

	it("returns the bounds it clamps to", () => {
		const { result } = renderHook(() => usePanelWidth(200, { min: 160, max: 300 }))
		expect(result.current[2]).toEqual({ min: 160, max: 300 })
		act(() => result.current[1](999))
		expect(result.current[0]).toBe(300)
	})
})

describe("PanelResizer", () => {
	function Fixture() {
		const [width, setWidth, bounds] = usePanelWidth(200, { min: 160, max: 300 })
		return <PanelResizer side="left" width={width} onWidthChange={setWidth} label="Resize panel" {...bounds} />
	}

	it("reports and honours the hook's bounds when they are spread onto it", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Fixture />)
		const separator = screen.getByRole("separator", { name: "Resize panel" })
		expect(separator).toHaveAttribute("aria-valuemin", "160")
		expect(separator).toHaveAttribute("aria-valuemax", "300")
		separator.focus()
		await user.keyboard("{Home}")
		expect(separator).toHaveAttribute("aria-valuenow", "160")
		await user.keyboard("{End}")
		expect(separator).toHaveAttribute("aria-valuenow", "300")
	})
})
