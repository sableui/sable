import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Separator } from "./separator"

describe("Separator", () => {
	it("renders a labeled divider as a horizontal separator with the caption", () => {
		const { getByRole, getByText } = render(
			<Separator label="Other holdings" />,
		)
		const sep = getByRole("separator")
		expect(sep).toHaveAttribute("aria-orientation", "horizontal")
		expect(getByText("Other holdings")).toBeInTheDocument()
	})

	it("ignores the label on a vertical separator (plain rule)", () => {
		const { getByRole, queryByText } = render(
			<Separator orientation="vertical" label="nope" />,
		)
		expect(getByRole("separator")).toHaveAttribute(
			"aria-orientation",
			"vertical",
		)
		expect(queryByText("nope")).not.toBeInTheDocument()
	})
})
