import { userEvent } from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MotionProvider } from "../../motion/MotionProvider"
import { renderWithProviders, screen } from "../../test/render"
import { Marquee } from "./marquee"

describe("Marquee", () => {
	// jsdom does no layout, and a strip with no measured width never animates.
	let width: { mockRestore: () => void }
	beforeEach(() => {
		width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200)
	})
	afterEach(() => {
		width.mockRestore()
	})

	it("pauses and plays from its control, with translatable names", async () => {
		renderWithProviders(
			<Marquee controls pauseLabel="Pause défilement" playLabel="Lire">
				<span>Acme</span>
			</Marquee>,
		)
		const control = screen.getByRole("button", { name: "Pause défilement" })
		await userEvent.click(control)
		expect(screen.getByRole("button", { name: "Lire" })).toBe(control)
	})

	it("reports the play state when controlled", async () => {
		const onPlayChange = vi.fn()
		renderWithProviders(
			<Marquee controls play onPlayChange={onPlayChange}>
				<span>Acme</span>
			</Marquee>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Pause" }))
		expect(onPlayChange).toHaveBeenCalledWith(false)
	})

	it("stops and becomes a scroll region with no control when motion is off", () => {
		const { container } = renderWithProviders(
			<MotionProvider policy="off">
				<Marquee controls>
					<span>Acme</span>
				</Marquee>
			</MotionProvider>,
		)
		expect(screen.queryByRole("button")).toBeNull()
		const root = container.querySelector("[data-sable-marquee]") as HTMLElement
		expect(root.className).toContain("overflow-x-auto")
		expect(root.className).toContain("scrollbar-quiet")
	})
})
