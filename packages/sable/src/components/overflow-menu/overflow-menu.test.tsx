import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { IconProvider } from "../../icon"
import { renderWithProviders, screen } from "../../test/render"
import { MenuItem } from "../menu"
import { OverflowMenu } from "./overflow-menu"

describe("OverflowMenu", () => {
	it("labels the icon-only trigger and opens its rows", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<OverflowMenu label="Post actions">
				<MenuItem>Edit</MenuItem>
			</OverflowMenu>,
		)
		await user.click(screen.getByRole("button", { name: "Post actions" }))
		expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument()
	})

	it("renders the trigger glyph at the solid weight", () => {
		const set = ({ name, variant }: { name: string; variant: string }) => (
			<span data-icon={name} data-weight={variant} />
		)
		const { container } = renderWithProviders(
			<IconProvider set={set}>
				<OverflowMenu>
					<MenuItem>Edit</MenuItem>
				</OverflowMenu>
			</IconProvider>,
		)
		expect(container.querySelector('[data-icon="ellipsis"]')?.getAttribute("data-weight")).toBe("solid")
	})

	it("defaults the trigger to the icon rung", () => {
		renderWithProviders(
			<OverflowMenu>
				<MenuItem>Edit</MenuItem>
			</OverflowMenu>,
		)
		expect(screen.getByRole("button", { name: "More actions" }).className).toContain(
			"h-(--control-md)",
		)
	})

	it("steps the trigger down the ladder with size", () => {
		renderWithProviders(
			<OverflowMenu size="icon-xs" label="Row actions">
				<MenuItem>Edit</MenuItem>
			</OverflowMenu>,
		)
		const trigger = screen.getByRole("button", { name: "Row actions" })
		expect(trigger.className).toContain("h-(--control-xs)")
		expect(trigger.className).not.toContain("h-(--control-md)")
	})
})
