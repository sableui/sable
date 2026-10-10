import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, within } from "../../test/render"
import { Stepper, StepperItem } from "./stepper"

function Checkout(props: { current?: number }) {
	return (
		<Stepper current={props.current} aria-label="Checkout progress">
			<StepperItem title="Cart" />
			<StepperItem title="Shipping" />
			<StepperItem title="Payment" />
		</Stepper>
	)
}

describe("Stepper", () => {
	it("with indicator=\"dot\", draws dots instead of numbers and keeps the status words", () => {
		renderWithProviders(
			<Stepper orientation="vertical" indicator="dot" current={1} aria-label="Delivery status">
				<StepperItem title="Placed" />
				<StepperItem title="Shipped" />
				<StepperItem title="Delivered" />
			</Stepper>,
		)
		const [placed, shipped] = screen.getAllByRole("listitem")
		// No position numbers or check glyph: a timeline's order is its own information.
		expect(screen.queryByText("1")).toBeNull()
		expect(screen.queryByText("3")).toBeNull()
		expect(shipped).toHaveAttribute("aria-current", "step")
		expect(within(placed).getByText(/Completed/)).toBeInTheDocument()
	})

	it("is a labelled ordered list with one item per step", () => {
		renderWithProviders(<Checkout current={1} />)
		const list = screen.getByRole("list", { name: "Checkout progress" })
		expect(list.tagName).toBe("OL")
		expect(within(list).getAllByRole("listitem")).toHaveLength(3)
	})

	it("derives status from current and marks the current step", () => {
		renderWithProviders(<Checkout current={1} />)
		const [cart, shipping, payment] = screen.getAllByRole("listitem")
		expect(cart).toHaveAttribute("data-status", "complete")
		expect(shipping).toHaveAttribute("data-status", "current")
		expect(shipping).toHaveAttribute("aria-current", "step")
		expect(payment).toHaveAttribute("data-status", "upcoming")
		expect(payment).not.toHaveAttribute("aria-current")
	})

	it("announces status in words, not only colour", () => {
		renderWithProviders(<Checkout current={1} />)
		const [cart, , payment] = screen.getAllByRole("listitem")
		expect(cart).toHaveTextContent("Cart (Completed)")
		expect(payment).toHaveTextContent("Payment (Not started)")
	})

	it("lets a step override its derived status", () => {
		renderWithProviders(
			<Stepper current={2} aria-label="Flow">
				<StepperItem title="One" status="error" />
				<StepperItem title="Two" />
				<StepperItem title="Three" />
			</Stepper>,
		)
		const [one] = screen.getAllByRole("listitem")
		expect(one).toHaveAttribute("data-status", "error")
		expect(one).toHaveTextContent("(Needs attention)")
	})

	it("only renders a button for steps with onSelect", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		renderWithProviders(
			<Stepper current={1} aria-label="Flow">
				<StepperItem title="Cart" onSelect={onSelect} />
				<StepperItem title="Shipping" />
			</Stepper>,
		)
		const buttons = screen.getAllByRole("button")
		expect(buttons).toHaveLength(1)
		await user.click(buttons[0])
		expect(onSelect).toHaveBeenCalledOnce()
	})

	it("draws a connector between steps but not after the last", () => {
		const { container } = renderWithProviders(<Checkout />)
		const items = container.querySelectorAll("li")
		expect(items[0].querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(1)
		expect(items[2].querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(0)
	})

	it("localizes the status words", () => {
		renderWithProviders(
			<Stepper current={0} aria-label="Flujo" statusLabels={{ current: "Paso actual" }}>
				<StepperItem title="Carrito" />
			</Stepper>,
		)
		expect(screen.getByRole("listitem")).toHaveTextContent("Carrito (Paso actual)")
	})
})
