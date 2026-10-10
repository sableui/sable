import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Field } from "../form/form"
import { RadioCard } from "../radio-card"
import { Radio, RadioGroup } from "./radio"

describe.each(["radio", "radio-card"] as const)("%s keyboard selection", (kind) => {
	function Fixture({ onSubmit = () => {} }: { onSubmit?: () => void }) {
		const [value, setValue] = useState("")
		const Group = RadioGroup
		return (
			<form onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
				<Group aria-label="Item" name="item" value={value} onValueChange={(next) => setValue(String(next))}>
					{["Lamp", "Chair", "Disabled"].map((name) => kind === "radio" ? (
						<label key={name}><Radio value={name} disabled={name === "Disabled"} />{name}</label>
					) : <RadioCard key={name} value={name} title={name} disabled={name === "Disabled"} />)}
				</Group>
			</form>
		)
	}

	it("selects the initially empty option with Space and moves with arrows without submitting", async () => {
		const user = userEvent.setup()
		const onSubmit = vi.fn()
		renderWithProviders(<Fixture onSubmit={onSubmit} />)
		await user.tab()
		const lamp = screen.getByRole("radio", { name: "Lamp" })
		expect(lamp).toHaveFocus()
		await user.keyboard(" ")
		expect(lamp).toHaveAttribute("aria-checked", "true")
		await user.keyboard("{ArrowDown}")
		expect(screen.getByRole("radio", { name: "Chair" })).toHaveAttribute("aria-checked", "true")
		expect(lamp).toHaveAttribute("aria-checked", "false")
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it("supports pointer selection and leaves disabled options unselected", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Fixture />)
		await user.click(screen.getByRole("radio", { name: "Chair" }))
		expect(screen.getByRole("radio", { name: "Chair" })).toHaveAttribute("aria-checked", "true")
		await user.click(screen.getByRole("radio", { name: "Disabled" }))
		expect(screen.getByRole("radio", { name: "Disabled" })).toHaveAttribute("aria-checked", "false")
	})
})

describe("Radio in a horizontal Field", () => {
	it("is named by the Field label, selects by label click, and dims a disabled option", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<RadioGroup aria-label="Post type" defaultValue="standard">
				<Field label="Standard" orientation="horizontal">
					<Radio value="standard" />
				</Field>
				<Field label="Edition" orientation="horizontal">
					<Radio value="edition" />
				</Field>
				<Field label="Collectible" orientation="horizontal" disabled>
					<Radio value="collectible" />
				</Field>
			</RadioGroup>,
		)
		const edition = screen.getByRole("radio", { name: "Edition" })
		await user.click(screen.getByText("Edition"))
		expect(edition).toHaveAttribute("aria-checked", "true")
		expect(screen.getByRole("radio", { name: "Standard" })).toHaveAttribute("aria-checked", "false")
		const collectible = screen.getByRole("radio", { name: "Collectible" })
		expect(collectible).toBeDisabled()
		await user.click(screen.getByText("Collectible"))
		expect(collectible).toHaveAttribute("aria-checked", "false")
	})
})
