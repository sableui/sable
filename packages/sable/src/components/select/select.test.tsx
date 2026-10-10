import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "./index"

describe("SelectItem label defaulting", () => {
	it("shows the item's string children in the trigger, not the raw value", () => {
		renderWithProviders(
			<Select defaultValue="zimage">
				<SelectTrigger placeholder="Choose a model" />
				<SelectContent>
					<SelectItem value="zimage">Z-Image Turbo (ControlNet)</SelectItem>
					<SelectItem value="flux">Flux Dev</SelectItem>
				</SelectContent>
			</Select>,
		)
		const trigger = screen.getByRole("combobox")
		expect(trigger).toHaveTextContent("Z-Image Turbo (ControlNet)")
		expect(trigger).not.toHaveTextContent("zimage")
	})

	it("respects an explicit label over string children", () => {
		renderWithProviders(
			<Select defaultValue="flux">
				<SelectTrigger placeholder="Choose a model" />
				<SelectContent>
					<SelectItem value="flux" label="Flux (Dev)">
						Flux Dev
					</SelectItem>
				</SelectContent>
			</Select>,
		)
		expect(screen.getByRole("combobox")).toHaveTextContent("Flux (Dev)")
	})

	it("derives labels for numeric values", () => {
		renderWithProviders(
			<Select defaultValue={3}>
				<SelectTrigger placeholder="Steps" />
				<SelectContent>
					<SelectItem value={3}>Three steps</SelectItem>
					<SelectItem value={5}>Five steps</SelectItem>
				</SelectContent>
			</Select>,
		)
		expect(screen.getByRole("combobox")).toHaveTextContent("Three steps")
	})

	it("derives labels from interpolated (array) children", () => {
		const n = 2
		renderWithProviders(
			<Select defaultValue="opt-2">
				<SelectTrigger placeholder="Option" />
				<SelectContent>
					<SelectItem value="opt-2">Option {n}</SelectItem>
				</SelectContent>
			</Select>,
		)
		expect(screen.getByRole("combobox")).toHaveTextContent("Option 2")
	})
})

/**
 * The md trigger matches the mobile type floor Input and Textarea carry for
 * iOS Safari's 16px focus-zoom threshold (rationale: components/input/input.tsx).
 * The `xs` property-grid rung deliberately opts out — 17px would not fit a 24px
 * box, and it never stands in a page-register form row.
 */
describe("SelectTrigger mobile type floor", () => {
	it("takes the >=16px paired tier below sm on the md rung", () => {
		renderWithProviders(
			<Select defaultValue="a">
				<SelectTrigger placeholder="Pick" />
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		)
		const trigger = screen.getByRole("combobox")
		expect(trigger.className).toContain("max-sm:text-body-lg")
		expect(trigger.className).toContain("text-body-md")
	})

	it("leaves the xs property-grid rung on its designed tier", () => {
		renderWithProviders(
			<Select defaultValue="a">
				<SelectTrigger size="xs" placeholder="Pick" />
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		)
		expect(screen.getByRole("combobox").className).not.toContain("max-sm:")
	})
})
