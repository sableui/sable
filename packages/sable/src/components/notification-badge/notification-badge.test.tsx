import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { NotificationBadge } from "./notification-badge"

describe("NotificationBadge", () => {
	it("is decorative, so the host's name carries the count", () => {
		const { container } = renderWithProviders(
			<button type="button" aria-label="Notifications, 3 unread">
				<NotificationBadge count={3} />
			</button>,
		)
		expect(container.querySelector("[data-slot=notification-badge]")).toHaveAttribute("aria-hidden", "true")
		expect(screen.getByRole("button", { name: "Notifications, 3 unread" })).toBeInTheDocument()
	})

	it("can be exposed when it stands alone", () => {
		const { container } = renderWithProviders(<NotificationBadge count={3} aria-hidden={false} />)
		expect(container.querySelector("[data-slot=notification-badge]")).toHaveAttribute("aria-hidden", "false")
	})

	it("pins to the host corner with overlay, for counts and dots alike", () => {
		const { container } = renderWithProviders(
			<>
				<NotificationBadge count={5} overlay />
				<NotificationBadge dot overlay />
			</>,
		)
		const [count, dot] = container.querySelectorAll("[data-slot=notification-badge]")
		expect(count).toHaveClass("absolute", "-top-0.5", "-end-0.5")
		expect(dot).toHaveClass("absolute", "top-1", "end-1")
	})

	it("sizes the count pill on the spacing scale and caps it", () => {
		renderWithProviders(<NotificationBadge count={128} size="lg" />)
		const badge = screen.getByText("99+").closest("[data-slot=notification-badge]")
		expect(badge).toHaveClass("h-5", "min-w-5")
	})

	it("renders nothing at zero", () => {
		const { container } = renderWithProviders(<NotificationBadge count={0} />)
		expect(container.querySelector("[data-slot=notification-badge]")).toBeNull()
	})
})
