import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SegmentedBar } from "./segmented-bar"

describe("SegmentedBar", () => {
	it("is one image named by its label and every segment's share", () => {
		render(
			<SegmentedBar
				label="Revenue by channel"
				locale="en-US"
				segments={[
					{ label: "Direct", value: 42 },
					{ label: "Partners", value: 27 },
					{ label: "Referrals", value: 31 },
				]}
			/>,
		)
		expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
			"Revenue by channel: Direct 42%, Partners 27%, Referrals 31%",
		)
	})

	it("sizes segments by value and skips empty ones", () => {
		const { container } = render(
			<SegmentedBar
				label="Storage"
				segments={[
					{ label: "Photos", value: 3 },
					{ label: "Video", value: 0 },
					{ label: "Docs", value: 1 },
				]}
			/>,
		)
		const segments = container.querySelectorAll<HTMLElement>("[data-slot=segmented-bar-segment]")
		expect(segments).toHaveLength(2)
		expect(segments[0].style.flexGrow).toBe("3")
		expect(segments[1].style.flexGrow).toBe("1")
	})

	it("takes the decorative tones in order unless a segment names one", () => {
		const { container } = render(
			<SegmentedBar
				label="Results"
				segments={[
					{ label: "A", value: 1 },
					{ label: "B", value: 1, tone: "destructive" },
				]}
			/>,
		)
		const [a, b] = container.querySelectorAll("[data-slot=segmented-bar-segment]")
		expect(a.className).toContain("bg-tone-1")
		expect(b.className).toContain("bg-destructive")
	})
})
