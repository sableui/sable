import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Button } from "../button"
import { Field } from "../form"
import { Input } from "../input"
import { InputGroup } from "./input-group"

describe("InputGroup", () => {
	it("puts the addons inside one field shell around the input", () => {
		renderWithProviders(
			<InputGroup leading="https://" trailing=".com">
				<Input aria-label="Website" />
			</InputGroup>,
		)
		const input = screen.getByRole("textbox", { name: "Website" })
		const group = input.closest('[data-slot="input-group"]') as HTMLElement
		expect(group.className).toContain("border-field-border")
		expect(group.className).toContain("focus-within:ring-2")
		expect(group.querySelector('[data-slot="input-group-leading"]')).toHaveTextContent("https://")
		expect(group.querySelector('[data-slot="input-group-trailing"]')).toHaveTextContent(".com")
		// The input gives its own box up to the group.
		expect(group.className).toContain("[&>input]:border-0")
		expect(group.className).toContain("[&>input]:focus-visible:ring-0")
	})

	it("hands a Field's wiring to the input, not the group", () => {
		renderWithProviders(
			<Field label="Website" description="Your public site." error="Enter a domain" required>
				<InputGroup leading="https://">
					<Input />
				</InputGroup>
			</Field>,
		)
		const input = screen.getByRole("textbox", { name: /Website/ })
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toBeRequired()
		expect(input).toHaveAccessibleDescription(/Your public site\./)
		const group = input.closest('[data-slot="input-group"]') as HTMLElement
		expect(group).not.toHaveAttribute("id")
		expect(group).not.toHaveAttribute("aria-invalid")
	})

	it("forwards disabled to the input", () => {
		renderWithProviders(
			<InputGroup disabled leading="$">
				<Input aria-label="Price" />
			</InputGroup>,
		)
		expect(screen.getByRole("textbox", { name: "Price" })).toBeDisabled()
	})

	it("keeps a button addon a real, separate control", async () => {
		let copied = 0
		renderWithProviders(
			<InputGroup
				trailing={
					<Button variant="ghost" size="icon-sm" aria-label="Copy key" onClick={() => copied++}>
						C
					</Button>
				}
			>
				<Input aria-label="API key" readOnly value="sk_test" />
			</InputGroup>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Copy key" }))
		expect(copied).toBe(1)
		// A button addon sits close to the edge, as far in as it is from the top and bottom.
		const trailing = screen.getByRole("button", { name: "Copy key" }).parentElement as HTMLElement
		expect(trailing.className).toContain("has-[>[data-variant]]:pe-1")
	})
})
