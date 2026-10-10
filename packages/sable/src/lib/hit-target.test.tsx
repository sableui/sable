import { describe, expect, it } from "vitest"
import { ToastProvider, toast } from "../components/toast/toast"
import { TreeRow } from "../components/tree/tree"
import { renderWithProviders, screen, within } from "../test/render"
import { hitTargetMin } from "./hit-target"

/**
 * WCAG 2.5.8 asks for 24x24 and measures it AT REST, so the assertions are
 * about the resting class list, not a hover state. jsdom does no layout — the
 * pixel claims (compact draws 18 and catches 24, comfortable draws 20 and
 * catches 28, and a point 2px outside the drawn box hits the button) were
 * measured in a browser. What these pin is the part that can silently revert:
 * that each control still opts in, and that opting in did not resize it.
 */

describe("hitTargetMin", () => {
	it("sizes the target from the control ladder, never a hardcoded 24", () => {
		// --control-xs is the ladder's floor: 28px comfortable, 24px compact. A
		// literal 24 would be correct today and wrong the moment a register
		// retunes the ladder, and nothing would say so.
		expect(hitTargetMin).toContain("before:size-(--control-xs)")
		expect(hitTargetMin).not.toMatch(/\d+px/)
	})

	it("centres physically, so it survives dir=rtl", () => {
		// Centring is symmetric, so the physical inset is right in both
		// directions. A LOGICAL inset (start-1/2) paired with a physical
		// translate is what actually breaks under RTL.
		expect(hitTargetMin).toContain("before:left-1/2")
		expect(hitTargetMin).not.toContain("before:start-1/2")
		expect(hitTargetMin).toContain("before:-translate-x-1/2")
		expect(hitTargetMin).toContain("before:-translate-y-1/2")
	})

	it("positions the pseudo-element against the control itself", () => {
		// Without `relative` the target resolves against some ancestor and lands
		// somewhere else entirely — still a 24px target, just not on the control.
		expect(hitTargetMin).toContain("relative")
		expect(hitTargetMin).toContain("before:absolute")
		expect(hitTargetMin).toContain("before:content-['']")
	})
})

describe("controls that opt in", () => {
	it("Tree's disclosure takes the target and keeps its column", () => {
		renderWithProviders(
			<TreeRow depth={0} expandable expanded toggleLabel="Backdrop">
				Backdrop
			</TreeRow>,
		)
		const toggle = screen.getByRole("button", { name: "Collapse Backdrop" })
		expect(toggle.className).toContain("before:size-(--control-xs)")
		// The drawn box is also the indent step. If this ever becomes the target
		// itself, every name in the tree shifts one column right.
		expect(toggle).toHaveStyle({ width: "var(--tree-column)" })
	})

	it("Toast's dismiss takes the target and keeps its glyph box", async () => {
		renderWithProviders(<ToastProvider timeout={0} />)
		toast("Saved")
		const title = await screen.findByText("Saved")
		const row = title.closest("[role=dialog]") as HTMLElement
		const close = within(row).getByLabelText("Dismiss", { exact: true })
		expect(close.className).toContain("before:size-(--control-xs)")
		// h-6/w-6 is 21px against the 14px desktop root — under the floor, which
		// is the whole reason the target had to come apart from the paint.
		expect(close.className).toContain("h-6")
		expect(close.className).toContain("w-6")
		toast.dismiss()
	})
})
