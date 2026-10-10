import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Field } from "../form"
import { OtpField } from "./otp-field"

describe("OtpField", () => {
	it("renders one slot per character, with autofill on the first only", () => {
		renderWithProviders(<OtpField length={6} />)
		const slots = screen.getAllByRole("textbox")
		expect(slots).toHaveLength(6)
		expect(slots[0]).toHaveAttribute("autocomplete", "one-time-code")
		expect(slots[0]).toHaveAttribute("inputmode", "numeric")
		expect(slots[1]).toHaveAttribute("autocomplete", "off")
	})

	it("is named by its Field label, with later slots named by position", () => {
		renderWithProviders(
			<Field label="Verification code">
				<OtpField length={4} />
			</Field>,
		)
		expect(
			screen.getByRole("group", { name: "Verification code" }),
		).toBeInTheDocument()
		expect(screen.getByLabelText("Verification code", { selector: "input" }))
			.toBeInTheDocument()
		expect(screen.getByLabelText("Character 2 of 4")).toBeInTheDocument()
	})

	it("fills every slot from a paste and reports completion", async () => {
		const user = userEvent.setup()
		const onValueComplete = vi.fn()
		renderWithProviders(
			<OtpField length={6} onValueComplete={onValueComplete} />,
		)
		const slots = screen.getAllByRole("textbox")
		await user.click(slots[0])
		await user.paste("123456")
		expect(slots.map((s) => (s as HTMLInputElement).value).join("")).toBe(
			"123456",
		)
		expect(onValueComplete.mock.calls.at(-1)?.[0]).toBe("123456")
	})

	it("rejects characters outside the validation type", async () => {
		const user = userEvent.setup()
		const onValueInvalid = vi.fn()
		renderWithProviders(
			<OtpField length={4} onValueInvalid={onValueInvalid} />,
		)
		const [first] = screen.getAllByRole("textbox")
		await user.click(first)
		await user.keyboard("a")
		expect((first as HTMLInputElement).value).toBe("")
		expect(onValueInvalid).toHaveBeenCalled()
	})

	it("marks every slot invalid when the Field has an error", () => {
		renderWithProviders(
			<Field label="Code" error="That code has expired. Request a new code.">
				<OtpField length={3} />
			</Field>,
		)
		for (const slot of screen.getAllByRole("textbox")) {
			expect(slot).toHaveAttribute("aria-invalid", "true")
		}
	})

	it("hides the group gap from assistive tech", () => {
		const { container } = renderWithProviders(
			<OtpField length={6} groupSize={3} />,
		)
		const gaps = container.querySelectorAll("[data-otp-gap]")
		expect(gaps).toHaveLength(1)
		expect(gaps[0]).toHaveAttribute("aria-hidden", "true")
	})
})
