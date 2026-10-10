import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "./meter"

describe("Meter", () => {
	it("is a meter, not a progressbar", () => {
		renderWithProviders(<Meter value={64} aria-label="Storage used" />)
		const meter = screen.getByRole("meter", { name: "Storage used" })
		expect(meter).toHaveAttribute("aria-valuenow", "64")
		expect(meter).toHaveAttribute("aria-valuemax", "100")
		expect(screen.queryByRole("progressbar")).toBeNull()
	})

	it("is named by MeterLabel and reads custom value text", () => {
		renderWithProviders(
			<Meter
				value={7.2}
				max={10}
				getAriaValueText={(_, v) => `${v} of 10 gigabytes used`}
			>
				<MeterLabel>Storage</MeterLabel>
				<MeterValue>{(_, value) => `${value} of 10 GB`}</MeterValue>
				<MeterTrack />
			</Meter>,
		)
		const meter = screen.getByRole("meter", { name: "Storage" })
		expect(meter).toHaveAttribute("aria-valuetext", "7.2 of 10 gigabytes used")
		expect(screen.getByText("7.2 of 10 GB")).toBeInTheDocument()
	})

	it("sizes the fill from the value and colours it by tone", () => {
		const { container } = renderWithProviders(
			<Meter value={25} tone="warning" aria-label="Quota" />,
		)
		const fill = container.querySelector(".bg-tone-warning") as HTMLElement
		expect(fill).not.toBeNull()
		expect(fill.style.width).toBe("25%")
	})

	it("lets an indicator override the inherited tone", () => {
		const { container } = renderWithProviders(
			<Meter value={50} tone="success" aria-label="Seats">
				<MeterTrack>
					<MeterIndicator tone="destructive" />
				</MeterTrack>
			</Meter>,
		)
		expect(container.querySelector(".bg-destructive")).not.toBeNull()
		expect(container.querySelector(".bg-success")).toBeNull()
	})

	it("sizes the bar on the shared rails, inherited by MeterTrack", () => {
		const { container } = renderWithProviders(
			<Meter value={40} size="lg" aria-label="Seats">
				<MeterTrack />
			</Meter>,
		)
		expect(container.querySelector(".h-3")).not.toBeNull()
		expect(container.querySelector(".h-2")).toBeNull()
	})

	it("steps the ring's centre value with its size", () => {
		const { container } = renderWithProviders(<Meter shape="ring" size="sm" value={66} showValue aria-label="Score" />)
		expect(container.querySelector(".text-label-xs")).not.toBeNull()
	})
})
