import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { MenuItem } from "../menu"
import { DotsMenu } from "./dots-menu"

describe("DotsMenu", () => {
	it("labels the icon-only trigger and opens its rows", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<DotsMenu label="Post actions">
				<MenuItem>Edit</MenuItem>
			</DotsMenu>,
		)
		await user.click(screen.getByRole("button", { name: "Post actions" }))
		expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeInTheDocument()
	})

	it("defaults the trigger to the icon rung", () => {
		renderWithProviders(
			<DotsMenu>
				<MenuItem>Edit</MenuItem>
			</DotsMenu>,
		)
		expect(screen.getByRole("button", { name: "More actions" }).className).toContain(
			"h-(--control-md)",
		)
	})

	it("steps the trigger down the ladder with size", () => {
		renderWithProviders(
			<DotsMenu size="icon-xs" label="Row actions">
				<MenuItem>Edit</MenuItem>
			</DotsMenu>,
		)
		const trigger = screen.getByRole("button", { name: "Row actions" })
		expect(trigger.className).toContain("h-(--control-xs)")
		expect(trigger.className).not.toContain("h-(--control-md)")
	})
})
