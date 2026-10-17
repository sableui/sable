import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { useState } from "react"
import { Checkbox } from "../checkbox"
import { CheckboxCard, CheckboxGroup } from "./checkbox-card"

describe("CheckboxCard", () => {
	it("exposes a checkbox role named by its title", () => {
		renderWithProviders(<CheckboxCard title="Spam" />)
		expect(
			screen.getByRole("checkbox", { name: /Spam/ }),
		).toBeInTheDocument()
	})

	it("toggles checked on click", async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()
		renderWithProviders(
			<CheckboxCard title="Spam" onCheckedChange={onCheckedChange} />,
		)
		await user.click(screen.getByRole("checkbox", { name: /Spam/ }))
		expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
	})

	it("renders independent cards inside a group (multi-select)", async () => {
		const user = userEvent.setup()
		const onA = vi.fn()
		const onB = vi.fn()
		renderWithProviders(
			<CheckboxGroup>
				<CheckboxCard title="Reason A" onCheckedChange={onA} />
				<CheckboxCard title="Reason B" onCheckedChange={onB} />
			</CheckboxGroup>,
		)
		expect(screen.getByRole("group")).toBeInTheDocument()
		await user.click(screen.getByRole("checkbox", { name: /Reason A/ }))
		expect(onA).toHaveBeenCalledWith(true, expect.anything())
		expect(onB).not.toHaveBeenCalled()
	})
	it("keeps a named card's own checked state in a layout-only group", () => {
		renderWithProviders(
			<CheckboxGroup>
				<CheckboxCard title="Reason A" name="reason" checked />
			</CheckboxGroup>,
		)
		expect(screen.getByRole("checkbox", { name: /Reason A/ })).toHaveAttribute(
			"aria-checked",
			"true",
		)
	})
})

describe("CheckboxGroup (group-owned selection)", () => {
	it("checks the cards named in defaultValue and reports the next array", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		renderWithProviders(
			<CheckboxGroup defaultValue={["b"]} onValueChange={onValueChange}>
				<CheckboxCard value="a" title="Reason A" />
				<CheckboxCard value="b" title="Reason B" />
			</CheckboxGroup>,
		)
		const a = screen.getByRole("checkbox", { name: /Reason A/ })
		const b = screen.getByRole("checkbox", { name: /Reason B/ })
		expect(a).toHaveAttribute("aria-checked", "false")
		expect(b).toHaveAttribute("aria-checked", "true")
		await user.click(a)
		expect(onValueChange).toHaveBeenLastCalledWith(
			["b", "a"],
			expect.anything(),
		)
		expect(a).toHaveAttribute("aria-checked", "true")
	})

	it("works with plain Checkboxes and a controlled value", async () => {
		const user = userEvent.setup()
		function Controlled() {
			const [value, setValue] = useState<string[]>([])
			return (
				<>
					<CheckboxGroup value={value} onValueChange={setValue}>
						<Checkbox value="email" aria-label="Email" />
						<Checkbox value="sms" aria-label="SMS" />
					</CheckboxGroup>
					<output>{value.join(",")}</output>
				</>
			)
		}
		renderWithProviders(<Controlled />)
		await user.click(screen.getByRole("checkbox", { name: "SMS" }))
		expect(screen.getByRole("status")).toHaveTextContent("sms")
		expect(screen.getByRole("checkbox", { name: "SMS" })).toHaveAttribute(
			"aria-checked",
			"true",
		)
	})

	it("drives a parent select-all checkbox from allValues", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<CheckboxGroup allValues={["a", "b"]} defaultValue={["a"]}>
				<Checkbox parent aria-label="Select all" />
				<CheckboxCard value="a" title="Reason A" />
				<CheckboxCard value="b" title="Reason B" />
			</CheckboxGroup>,
		)
		const all = screen.getByRole("checkbox", { name: "Select all" })
		expect(all).toHaveAttribute("aria-checked", "mixed")
		await user.click(all)
		expect(all).toHaveAttribute("aria-checked", "true")
		expect(screen.getByRole("checkbox", { name: /Reason B/ })).toHaveAttribute(
			"aria-checked",
			"true",
		)
		await user.click(all)
		expect(all).toHaveAttribute("aria-checked", "false")
		expect(screen.getByRole("checkbox", { name: /Reason A/ })).toHaveAttribute(
			"aria-checked",
			"false",
		)
	})

	it("disables every child when the group is disabled", () => {
		renderWithProviders(
			<CheckboxGroup disabled>
				<CheckboxCard value="a" title="Reason A" />
			</CheckboxGroup>,
		)
		expect(screen.getByRole("checkbox", { name: /Reason A/ })).toHaveAttribute(
			"aria-disabled",
			"true",
		)
	})
})

describe("CheckboxMark motion", () => {
	it("draws the tick with motion-tick and nothing that would fight its transition", async () => {
		const user = userEvent.setup()
		renderWithProviders(<CheckboxCard title="Spam" motion="subtle" />)
		const card = screen.getByRole("checkbox", { name: /Spam/ })
		expect(card).toHaveAttribute("data-motion", "subtle")
		await user.click(card)
		const mark = card.querySelector(".motion-tick")
		expect(mark).not.toBeNull()
		// motion-interactive declares its own transition-property list; on the
		// same element it would drop the clip-path wipe.
		expect(mark?.className).not.toContain("motion-interactive")
	})
})
