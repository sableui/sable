import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { Button } from "../button"
import { Dialog, DialogContent, DialogTrigger } from "./index"

/** size="fullscreen" — the media viewer that replaced Lightbox. */
function Harness({
	size,
	showCloseButton,
}: {
	size?: "default" | "fullscreen"
	showCloseButton?: boolean
}) {
	return (
		<Dialog>
			<DialogTrigger render={<Button>View full size</Button>} />
			<DialogContent size={size} showCloseButton={showCloseButton} aria-label="Artwork viewer">
				<img src="https://example.com/a.jpg" alt="Artwork" />
			</DialogContent>
		</Dialog>
	)
}

async function open(ui: ReactElement) {
	render(ui)
	await userEvent.click(screen.getByRole("button", { name: "View full size" }))
	return screen.findByRole("dialog")
}

describe("Dialog size=fullscreen", () => {
	it("renders arbitrary media full-bleed with the close button shown by default", async () => {
		const dialog = await open(<Harness size="fullscreen" />)
		expect(dialog).toHaveAttribute("data-size", "fullscreen")
		expect(dialog.className).toContain("inset-0")
		expect(screen.getByRole("img", { name: "Artwork" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
	})

	it("draws the near-opaque scrim", async () => {
		await open(<Harness size="fullscreen" />)
		const scrim = document.querySelector('[data-size="fullscreen"]:not([role="dialog"])')
		expect(scrim).not.toBeNull()
		expect(scrim?.className).toContain("bg-overlay/95")
		expect(scrim?.className).not.toContain("bg-overlay/50")
	})

	it("uses the floating close button and closes on click", async () => {
		await open(<Harness size="fullscreen" />)
		const close = screen.getByRole("button", { name: "Close" })
		expect(close.className).toContain("border-border-floating")
		expect(close.className).not.toContain("bg-overlay/50")
		await userEvent.click(close)
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
	})

	it("honours showCloseButton={false}", async () => {
		await open(<Harness size="fullscreen" showCloseButton={false} />)
		expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
	})

	it("closes on Escape and returns focus to the trigger", async () => {
		await open(<Harness size="fullscreen" />)
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "View full size" })).toHaveFocus(),
		)
	})

	it("leaves the default dialog unchanged: no close button, dimming scrim", async () => {
		const dialog = await open(<Harness />)
		expect(dialog).toHaveAttribute("data-size", "default")
		expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
		const scrim = document.querySelector('[data-size="default"]:not([role="dialog"])')
		expect(scrim?.className).toContain("bg-overlay/(--scrim-alpha)")
	})
})
