import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Progress, ProgressTrack } from "./progress"

describe("Progress", () => {
	it("is a named progressbar", () => {
		renderWithProviders(<Progress value={64} aria-label="Upload" />)
		expect(screen.getByRole("progressbar", { name: "Upload" })).toHaveAttribute("aria-valuenow", "64")
	})

	it("defaults to the md rail, matching Meter", () => {
		const { container } = renderWithProviders(<Progress value={10} aria-label="Upload" />)
		expect(container.querySelector(".h-2")).not.toBeNull()
	})

	it("passes size down to a composed ProgressTrack, which can override it", () => {
		const { container } = renderWithProviders(
			<>
				<Progress value={10} size="lg" aria-label="A">
					<ProgressTrack />
				</Progress>
				<Progress value={10} size="lg" aria-label="B">
					<ProgressTrack size="sm" />
				</Progress>
			</>,
		)
		expect(container.querySelectorAll(".h-3")).toHaveLength(1)
		expect(container.querySelectorAll("[class~=\"h-1.5\"]")).toHaveLength(1)
	})
})
