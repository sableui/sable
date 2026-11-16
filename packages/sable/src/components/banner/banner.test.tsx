import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Banner } from "./banner"

describe("Banner", () => {
	it("is a labelled region by default, and a live region when it announces", () => {
		const { rerender } = renderWithProviders(<Banner>Maintenance tonight</Banner>)
		expect(screen.getByRole("region", { name: "Announcement" })).toHaveTextContent("Maintenance tonight")
		rerender(<Banner live="polite">You are offline</Banner>)
		expect(screen.getByRole("status")).toHaveTextContent("You are offline")
		expect(screen.queryByRole("region")).toBeNull()
		rerender(<Banner live="assertive">Payment failed</Banner>)
		expect(screen.getByRole("alert")).toHaveTextContent("Payment failed")
	})

	it("renames its region through aria-label", () => {
		renderWithProviders(<Banner aria-label="Annonce">Maintenance</Banner>)
		expect(screen.getByRole("region", { name: "Annonce" })).toBeInTheDocument()
	})

	it("dismisses itself and reports it", async () => {
		const onDismiss = vi.fn()
		renderWithProviders(
			<Banner dismissible onDismiss={onDismiss}>
				Session expires soon
			</Banner>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
		expect(onDismiss).toHaveBeenCalledOnce()
		expect(screen.queryByText("Session expires soon")).toBeNull()
	})

	it("takes a translated dismiss label, with a touch-sized target that keeps its box", () => {
		renderWithProviders(
			<Banner dismissible dismissLabel="Fermer">
				Session
			</Banner>,
		)
		const button = screen.getByRole("button", { name: "Fermer" })
		expect(button.className).toContain("pointer-coarse:before:size-[44px]")
		expect(button.className).toContain("h-(--control-xs)")
	})
})
