import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Stack } from "../../layout/Stack"
import { DialogHeader } from "./dialog"

describe("DialogHeader's margin", () => {
	it("gives way to a Stack's gap, which is what the rule matches", () => {
		render(
			<Stack>
				<DialogHeader>Title</DialogHeader>
			</Stack>,
		)
		const header = screen.getByText("Title")
		expect(header.className).toContain("[[data-slot=stack]>&]:mb-0")
		expect(header.matches("[data-slot=stack]>*")).toBe(true)
	})

	it("stays in plain flow", () => {
		render(
			<div>
				<DialogHeader>Title</DialogHeader>
			</div>,
		)
		const header = screen.getByText("Title")
		expect(header).toHaveClass("mb-4")
		expect(header.matches("[data-slot=stack]>*")).toBe(false)
	})
})
