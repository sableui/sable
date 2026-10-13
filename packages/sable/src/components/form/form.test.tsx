import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { Input } from "../input"
import { Switch } from "../switch"
import { Textarea } from "../textarea"
import { Field, Form } from "./form"

describe("Field", () => {
	it("associates the label with the control and sets required", () => {
		const { container } = render(
			<Field label="Email" required>
				<Input />
			</Field>,
		)
		// getByLabelText resolving proves the label↔control wiring.
		const input = screen.getByLabelText(/Email/)
		expect(input).toBeRequired()
		expect(input.id).toBeTruthy()
		expect(
			container.querySelector(`label[for="${input.id}"]`),
		).toBeInTheDocument()
	})

	it("wires description + error via aria-describedby and flags aria-invalid", () => {
		render(
			<Field label="Password" description="At least 8 characters." error="Too short.">
				<Input />
			</Field>,
		)
		const input = screen.getByLabelText("Password")
		expect(input).toHaveAttribute("aria-invalid", "true")
		const describedby = input.getAttribute("aria-describedby") ?? ""
		expect(describedby).toContain(`${input.id}-description`)
		expect(describedby).toContain(`${input.id}-error`)
		expect(screen.getByText("At least 8 characters.")).toBeInTheDocument()
		expect(screen.getByText("Too short.")).toBeInTheDocument()
	})

	it("preserves a consumer-provided control id", () => {
		render(
			<Field label="Name">
				<Input id="custom-id" />
			</Field>,
		)
		expect(screen.getByLabelText("Name").id).toBe("custom-id")
	})

	it("does not set aria-invalid without an error", () => {
		render(
			<Field label="City">
				<Input />
			</Field>,
		)
		expect(screen.getByLabelText("City")).not.toHaveAttribute("aria-invalid")
	})
})

describe("Field — Base UI wiring", () => {
	it("labels and describes a Base UI control (Switch)", () => {
		render(
			<Field label="Alerts" description="Email me." orientation="horizontal">
				<Switch />
			</Field>,
		)
		const control = screen.getByRole("switch", { name: "Alerts" })
		expect(control.getAttribute("aria-describedby") ?? "").toContain(
			"-description",
		)
	})

	it("horizontal: centres the control on the label's first line and keeps helper text in the label column", () => {
		render(
			<Field label="Alerts" description="Email me." error="Required." orientation="horizontal">
				<Switch />
			</Field>,
		)
		const control = screen.getByRole("switch", { name: "Alerts" })
		const box = control.parentElement as HTMLElement
		expect(box.className).toContain("h-[1lh]")
		expect(box.className).toContain("items-center")
		const label = screen.getByText("Alerts")
		const column = label.parentElement as HTMLElement
		expect(column).toContainElement(screen.getByText("Email me."))
		expect(column).toContainElement(screen.getByText("Required."))
		expect(column).not.toContainElement(control)
	})

	it("wires an Input that is not Field's direct child", () => {
		render(
			<Field label="Amount" description="In USD.">
				<div>
					<Input />
				</div>
			</Field>,
		)
		const input = screen.getByRole("textbox", { name: "Amount" })
		expect(input).toHaveAccessibleDescription("In USD.")
	})

	it("wires a Textarea and marks it invalid", () => {
		render(
			<Field label="Bio" error="Too long.">
				<Textarea />
			</Field>,
		)
		const textarea = screen.getByLabelText("Bio")
		expect(textarea.tagName).toBe("TEXTAREA")
		expect(textarea).toHaveAttribute("aria-invalid", "true")
		expect(textarea).toHaveAccessibleDescription("Too long.")
	})

	it("exposes data-invalid on the field root when error is set", () => {
		const { container } = render(
			<Field label="Name" error="Required.">
				<Input />
			</Field>,
		)
		expect(container.firstElementChild).toHaveAttribute("data-invalid")
	})

	it("disables the control", () => {
		render(
			<Field label="Locked" disabled>
				<Input />
			</Field>,
		)
		expect(screen.getByLabelText("Locked")).toBeDisabled()
	})
})

describe("Form", () => {
	it("renders a form landmark", () => {
		render(
			<Form aria-label="Sign up">
				<Field label="A">
					<Input />
				</Field>
			</Form>,
		)
		expect(screen.getByRole("form", { name: "Sign up" })).toBeInTheDocument()
	})
})

describe("Form validation", () => {
	it("blocks submit on a required Field and shows the message under it", () => {
		const onSubmit = vi.fn((event) => event.preventDefault())
		const { container } = render(
			<Form onSubmit={onSubmit}>
				<Field label="Email" required>
					<Input />
				</Field>
				<button type="submit">Save</button>
			</Form>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Save" }))
		expect(onSubmit).not.toHaveBeenCalled()
		const input = screen.getByLabelText(/Email/)
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input.getAttribute("aria-describedby")).toContain(`${input.id}-error`)
		expect(container.querySelector(`#${CSS.escape(`${input.id}-error`)}`)).toBeInTheDocument()
		expect(input.closest("[data-invalid]")).not.toBeNull()
	})

	it("runs a Field validate function and submits once valid", () => {
		const onSubmit = vi.fn((event) => event.preventDefault())
		render(
			<Form onSubmit={onSubmit}>
				<Field
					label="Handle"
					validate={(value) => (String(value).length < 3 ? "At least 3 characters." : null)}
				>
					<Input defaultValue="ab" />
				</Field>
				<button type="submit">Save</button>
			</Form>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Save" }))
		expect(onSubmit).not.toHaveBeenCalled()
		expect(screen.getByText("At least 3 characters.")).toBeInTheDocument()
		fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "abcd" } })
		fireEvent.click(screen.getByRole("button", { name: "Save" }))
		expect(onSubmit).toHaveBeenCalledTimes(1)
	})

	it("still blocks a bare required input that is outside any Field", () => {
		const onSubmit = vi.fn((event) => event.preventDefault())
		render(
			<Form onSubmit={onSubmit}>
				<input aria-label="Raw" required />
				<button type="submit">Save</button>
			</Form>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Save" }))
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it("words a failed native constraint with the Field's own message", () => {
		const onSubmit = vi.fn((event) => event.preventDefault())
		render(
			<Form onSubmit={onSubmit}>
				<Field label="Subject" required messages={{ valueMissing: "Enter a subject." }}>
					<Input />
				</Field>
				<button type="submit">Send</button>
			</Form>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Send" }))
		expect(onSubmit).not.toHaveBeenCalled()
		expect(screen.getByText("Enter a subject.")).toBeInTheDocument()
	})

	it("noValidate leaves validation to the app: onSubmit runs and the Field's error shows", () => {
		// The dogfood bug: an empty required Field blocked submit with the
		// browser's wording, so the handler that sets `error` never ran.
		function Ticket() {
			const [error, setError] = useState<string>()
			return (
				<Form noValidate aria-label="Ticket" onSubmit={(event) => { event.preventDefault(); setError("Enter a subject.") }}>
					<Field label="Subject" required error={error}>
						<Input />
					</Field>
					<button type="submit">Send</button>
				</Form>
			)
		}
		render(<Ticket />)
		fireEvent.click(screen.getByRole("button", { name: "Send" }))
		const input = screen.getByLabelText(/Subject/)
		expect(screen.getByText("Enter a subject.")).toBeInTheDocument()
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toBeRequired()
		expect(screen.getByRole("form", { name: "Ticket" })).toHaveAttribute("novalidate")
	})

	it("shows Form errors keyed by Field name", () => {
		render(
			<Form errors={{ email: "Already taken." }}>
				<Field label="Email" name="email">
					<Input />
				</Field>
			</Form>,
		)
		expect(screen.getByText("Already taken.")).toBeInTheDocument()
		expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
	})
})
