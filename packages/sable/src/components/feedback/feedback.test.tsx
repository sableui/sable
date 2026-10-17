import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor } from "../../test/render"
import { Feedback } from "./feedback"

describe("Feedback", () => {
	it("says thanks after sending, then closes on its own", async () => {
		const user = userEvent.setup()
		const onSubmit = vi.fn()
		renderWithProviders(<Feedback onSubmit={onSubmit} />)
		await user.click(screen.getByRole("button", { name: "Feedback" }))
		await user.click(await screen.findByRole("button", { name: "good" }))
		await user.type(screen.getByRole("textbox"), "Lovely")
		await user.click(screen.getByRole("button", { name: "Send" }))

		expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ rating: "good", message: "Lovely" })
		const thanks = screen.getByText("Thanks for the feedback.").parentElement as HTMLElement
		// Focus moves to the thanks, which reads it out; the form under it is inert.
		expect(thanks).toHaveFocus()
		expect(screen.getByRole("form", { hidden: true })).toHaveAttribute("inert")

		await waitFor(() => expect(screen.queryByText("Thanks for the feedback.")).toBeNull(), { timeout: 3000 })
	})

	it("opens to a fresh form after a send", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Feedback successMessage="Got it." />)
		const trigger = screen.getByRole("button", { name: "Feedback" })
		await user.click(trigger)
		await user.click(await screen.findByRole("button", { name: "ok" }))
		await user.click(screen.getByRole("button", { name: "Send" }))
		expect(screen.getByText("Got it.")).toBeInTheDocument()
		await waitFor(() => expect(screen.queryByText("Got it.")).toBeNull(), { timeout: 3000 })

		await user.click(trigger)
		expect(await screen.findByRole("button", { name: "Send" })).toBeDisabled()
		expect(screen.queryByText("Got it.")).toBeNull()
	})

	it("turns its own motion down through data-motion on the popover", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Feedback motion="off" />)
		await user.click(screen.getByRole("button", { name: "Feedback" }))
		const form = await screen.findByRole("form")
		expect(form.closest("[data-motion]")).toHaveAttribute("data-motion", "off")
	})
})
