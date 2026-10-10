import { act, renderHook } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { PanelResizer, usePanelWidth } from "./panel-group"

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
