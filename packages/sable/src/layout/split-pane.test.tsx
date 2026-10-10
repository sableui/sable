import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SplitPane } from "./SplitPane"

describe("SplitPane", () => {
	it("sets the collapse breakpoint + ratio vars and renders both panes", () => {
		const { container, getByText } = render(
			<SplitPane
				collapseBelow="lg"
				ratio="3/2"
				primary={<span>media</span>}
				secondary={<span>details</span>}
			/>,
		)
		const e = container.firstChild as HTMLElement
		expect(e).toHaveAttribute("data-sable-split")
		expect(e).toHaveAttribute("data-collapse", "lg")
		expect(e.style.getPropertyValue("--split-primary")).toBe("3fr")
		expect(e.style.getPropertyValue("--split-secondary")).toBe("2fr")
		expect(getByText("media")).toBeInTheDocument()
		expect(getByText("details")).toBeInTheDocument()
	})

	it("defaults to a 1/1 ratio collapsing below lg", () => {
		const e = render(<SplitPane primary="a" secondary="b" />).container
			.firstChild as HTMLElement
		expect(e).toHaveAttribute("data-collapse", "lg")
		expect(e.style.getPropertyValue("--split-primary")).toBe("1fr")
		expect(e.style.getPropertyValue("--split-secondary")).toBe("1fr")
	})

	it("falls back to an even split for any malformed ratio (no half-parse leak)", () => {
		for (const ratio of ["garbage", "2", "2/", "/2", "3/0", ""]) {
			const e = render(
				<SplitPane ratio={ratio} primary="a" secondary="b" />,
			).container.firstChild as HTMLElement
			expect(e.style.getPropertyValue("--split-primary")).toBe("1fr")
			expect(e.style.getPropertyValue("--split-secondary")).toBe("1fr")
		}
	})

	it("resolves a numeric gap to the rhythm scale", () => {
		const e = render(<SplitPane gap={4} primary="a" secondary="b" />).container
			.firstChild as HTMLElement
		expect(e.style.getPropertyValue("--split-gap")).toBe(
			"calc(var(--rhythm-unit) * 4)",
		)
	})
})
