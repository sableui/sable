import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { ColorField } from "./color-field"

/** A controlled host, since the interesting behaviour is round-tripping. */
function Host({ initial, ...rest }: { initial: string } & Record<string, unknown>) {
	const [value, setValue] = useState(initial)
	return (
		<>
			<ColorField value={value} onValueChange={setValue} {...rest} />
			<output data-testid="value">{value}</output>
		</>
	)
}

describe("ColorField trigger", () => {
	it("announces the current value, not just 'button'", () => {
		// The swatch conveys nothing without sight, so the value belongs in the name.
		render(<ColorField value="#3b82f6" onValueChange={vi.fn()} label="Tint" />)
		expect(screen.getByRole("button", { name: "Tint: #3b82f6" })).toBeInTheDocument()
	})

	it("says transparent rather than showing an empty swatch", () => {
		render(<ColorField value="transparent" onValueChange={vi.fn()} />)
		expect(screen.getByRole("button", { name: "Colour: Transparent" })).toBeInTheDocument()
	})

	it("sits on the control ladder so it lines up in a property grid", () => {
		render(<ColorField value="#000000" onValueChange={vi.fn()} />)
		const trigger = screen.getByRole("button")
		expect(trigger.className).toContain("size-(--control-xs)")
		// And uses the shared checkerboard rather than a hand-rolled gradient.
		expect(trigger.className).toContain("checkerboard")
	})
})

describe("ColorField hex entry", () => {
	it("commits a parseable value and normalises the form", async () => {
		render(<Host initial="#000000" />)
		await userEvent.click(screen.getByRole("button"))
		const hex = await screen.findByLabelText("Colour hex")

		await userEvent.clear(hex)
		await userEvent.paste("#FFF")
		// Accepts the 3-digit form on paste, but emits the 6-digit one.
		expect(screen.getByTestId("value")).toHaveTextContent("#ffffff")
	})

	it("stays editable mid-typing instead of fighting every keystroke", async () => {
		render(<Host initial="#000000" />)
		await userEvent.click(screen.getByRole("button"))
		const hex = await screen.findByLabelText("Colour hex")

		await userEvent.clear(hex)
		await userEvent.type(hex, "#3b8")
		// "#3b8" IS parseable as a 3-digit hex, so it commits — but the draft the
		// user is typing must survive so they can finish the 6-digit value.
		await userEvent.type(hex, "2f6")
		expect(hex).toHaveValue("#3b82f6")
		expect(screen.getByTestId("value")).toHaveTextContent("#3b82f6")
	})

	it("ignores an unparseable draft rather than emitting garbage", async () => {
		const onValueChange = vi.fn()
		render(<ColorField value="#000000" onValueChange={onValueChange} />)
		await userEvent.click(screen.getByRole("button"))
		const hex = await screen.findByLabelText("Colour hex")

		await userEvent.clear(hex)
		await userEvent.type(hex, "nope")
		expect(onValueChange).not.toHaveBeenCalled()
	})
})

describe("ColorField transparent", () => {
	it("is absent unless allowTransparent", async () => {
		render(<Host initial="#3b82f6" />)
		await userEvent.click(screen.getByRole("button"))
		expect(screen.queryByRole("button", { name: "Transparent" })).toBeNull()
	})

	it("is a pressed toggle inside the picker, not a switch beside the field", async () => {
		render(<Host initial="transparent" allowTransparent />)
		await userEvent.click(screen.getByRole("button", { name: "Colour: Transparent" }))
		const toggle = await screen.findByRole("button", { name: "Transparent" })
		expect(toggle).toHaveAttribute("aria-pressed", "true")
	})

	it("remembers the colour across a transparent round trip", async () => {
		// The bug this component exists to fix: the interim implementation returned
		// you to black, because it had nowhere to hold the previous colour that did
		// not require a ref read during render or a setState inside an effect.
		render(<Host initial="#3b82f6" allowTransparent />)
		await userEvent.click(screen.getByRole("button", { name: "Colour: #3b82f6" }))
		const toggle = await screen.findByRole("button", { name: "Transparent" })

		await userEvent.click(toggle)
		expect(screen.getByTestId("value")).toHaveTextContent("transparent")

		await userEvent.click(toggle)
		expect(screen.getByTestId("value")).toHaveTextContent("#3b82f6")
	})
})

describe("ColorField swatches", () => {
	it("commits a preset by its own name", async () => {
		render(<Host initial="#000000" swatches={["#f43f5e", "#22c55e"]} />)
		await userEvent.click(screen.getByRole("button", { name: "Colour: #000000" }))
		await userEvent.click(await screen.findByRole("button", { name: "#22c55e" }))
		expect(screen.getByTestId("value")).toHaveTextContent("#22c55e")
	})
})

describe("ColorField alpha", () => {
	it("omits the alpha slider, and 8-digit output, unless allowAlpha", async () => {
		// allowAlpha widens the persisted value format, so it must be opt-in.
		render(<Host initial="#3b82f680" />)
		await userEvent.click(screen.getByRole("button"))
		const hex = await screen.findByLabelText("Colour hex")
		expect(hex).toHaveValue("#3b82f6")
	})

	it("keeps 8-digit output when allowAlpha", async () => {
		render(<Host initial="#3b82f680" allowAlpha />)
		await userEvent.click(screen.getByRole("button"))
		expect(await screen.findByLabelText("Colour hex")).toHaveValue("#3b82f680")
	})
})

describe("ColorField external changes", () => {
	it("re-seeds from a value it did not emit", async () => {
		// A preset load must move the picker; our own emissions must not reset it.
		const { rerender } = render(<ColorField value="#3b82f6" onValueChange={vi.fn()} />)
		await userEvent.click(screen.getByRole("button"))
		expect(await screen.findByLabelText("Colour hex")).toHaveValue("#3b82f6")

		rerender(<ColorField value="#22c55e" onValueChange={vi.fn()} />)
		expect(await screen.findByLabelText("Colour hex")).toHaveValue("#22c55e")
	})
})

describe("ColorField presets you can see the keyboard on", () => {
	it("names a preset by its label when it has one, by its hex when not", async () => {
		render(<Host initial="#000000" swatches={[{ value: "#e11d48", label: "Brand red" }, "#22c55e"]} />)
		await userEvent.click(screen.getByRole("button", { name: "Colour: #000000" }))
		const named = await screen.findByRole("button", { name: "Brand red" })
		expect(screen.getByRole("button", { name: "#22c55e" })).toBeInTheDocument()
		// Focus is visible: an outline past the hairline ring, like the trigger.
		expect(named.className).toContain("focus-visible:outline-ring")
		await userEvent.click(named)
		expect(screen.getByTestId("value")).toHaveTextContent("#e11d48")
	})
})

describe("ColorField in a form", () => {
	it("submits the colour under its name, in the hex form it emits", () => {
		const { container } = render(
			<form>
				<ColorField name="tint" value="#3B82F6" onValueChange={vi.fn()} />
				<ColorField name="fill" value="transparent" onValueChange={vi.fn()} />
				<ColorField name="glass" value="#3b82f680" allowAlpha onValueChange={vi.fn()} />
			</form>,
		)
		const data = new FormData(container.querySelector("form") as HTMLFormElement)
		expect(data.get("tint")).toBe("#3b82f6")
		expect(data.get("fill")).toBe("transparent")
		expect(data.get("glass")).toBe("#3b82f680")
	})

	it("stays closed when read-only and still submits", async () => {
		const { container } = render(
			<form>
				<ColorField name="tint" value="#3b82f6" onValueChange={vi.fn()} readOnly />
			</form>,
		)
		const trigger = screen.getByRole("button", { name: "Colour: #3b82f6" })
		expect(trigger).toHaveAttribute("aria-readonly", "true")
		await userEvent.click(trigger)
		expect(screen.queryByRole("textbox")).toBeNull()
		expect(new FormData(container.querySelector("form") as HTMLFormElement).get("tint")).toBe("#3b82f6")
	})

	it("keeps a Field's wiring on the trigger and never puts required on a button", () => {
		render(
			<ColorField
				value="#000000"
				onValueChange={vi.fn()}
				id="tint"
				aria-describedby="tint-help"
				aria-invalid
				required
			/>,
		)
		const trigger = screen.getByRole("button")
		expect(trigger).toHaveAttribute("id", "tint")
		expect(trigger).toHaveAttribute("aria-describedby", "tint-help")
		expect(trigger).toHaveAttribute("aria-invalid", "true")
		expect(trigger).not.toHaveAttribute("required")
	})
})

describe("ColorField words", () => {
	it("takes translated names for the transparent value and the hex input", async () => {
		render(
			<Host
				initial="transparent"
				label="Farbe"
				allowTransparent
				transparentLabel="Transparent (keine)"
				hexLabel={(label: string) => `${label}, Hex-Wert`}
			/>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Farbe: Transparent (keine)" }))
		expect(await screen.findByRole("textbox", { name: "Farbe, Hex-Wert" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Transparent (keine)" })).toHaveAttribute("aria-pressed", "true")
	})
})
