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
		const fill = container.querySelector(".bg-tone-warning-mark") as HTMLElement
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
		expect(container.querySelector(".bg-destructive-mark")).not.toBeNull()
		expect(container.querySelector(".bg-success-mark")).toBeNull()
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

	describe("segments", () => {
		const ticks = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('[data-slot="meter-tick"]'))
		const filled = (container: HTMLElement) => ticks(container).filter((t) => t.hasAttribute("data-filled"))

		it("draws N ticks, filled by the rounded share, in the meter's tone", () => {
			const { container } = renderWithProviders(
				<Meter value={1240} max={2000} segments={20} tone="warning" aria-label="Spend" />,
			)
			expect(ticks(container)).toHaveLength(20)
			// 1240 / 2000 × 20 = 12.4 → 12
			expect(filled(container)).toHaveLength(12)
			for (const t of filled(container)) expect(t).toHaveClass("bg-tone-warning-mark")
			for (const t of ticks(container).slice(12)) expect(t).toHaveClass("bg-secondary")
			expect(container.querySelector(".rounded-full")).toBeNull()
		})

		it("fills at least one tick for any reading above min, none at min", () => {
			const { container, rerender } = renderWithProviders(
				<Meter value={2} max={2000} segments={20} aria-label="Spend" />,
			)
			expect(filled(container)).toHaveLength(1)
			rerender(<Meter value={0} max={2000} segments={20} aria-label="Spend" />)
			expect(filled(container)).toHaveLength(0)
			rerender(<Meter value={2000} max={2000} segments={20} aria-label="Spend" />)
			expect(filled(container)).toHaveLength(20)
		})

		it("keeps role=meter and hides the ticks from assistive tech", () => {
			const { container } = renderWithProviders(<Meter value={7} max={10} segments={10} aria-label="Lead score" />)
			const meter = screen.getByRole("meter", { name: "Lead score" })
			expect(meter).toHaveAttribute("aria-valuenow", "7")
			for (const t of ticks(container)) expect(t).toHaveAttribute("aria-hidden", "true")
		})

		it("staggers the fill from the edge it is leaving when the value changes", () => {
			const { container, rerender } = renderWithProviders(<Meter value={20} segments={10} aria-label="Credits" />)
			rerender(<Meter value={50} segments={10} aria-label="Credits" />)
			// 2 → 5 filled: ticks 2, 3, 4 light up in order; the first has no delay.
			const t = ticks(container)
			expect(t[2]?.style.transitionDelay).toBe("")
			expect(t[3]?.style.transitionDelay).toContain("var(--motion-expressive, 1)")
			expect(t[4]?.style.transitionDelay).toContain("0.2")
			rerender(<Meter value={20} segments={10} aria-label="Credits" />)
			// 5 → 2: ticks empty from the right — 4 first, 2 last.
			expect(ticks(container)[4]?.style.transitionDelay).toBe("")
			expect(ticks(container)[2]?.style.transitionDelay).toContain("0.2")
		})

		it("uses its own, taller size ladder", () => {
			const { container } = renderWithProviders(<Meter value={40} segments={10} size="lg" aria-label="Seats" />)
			const track = container.querySelector("[data-segmented]")
			expect(track).toHaveClass("h-5")
		})

		it("renders ticks in the composed form, through MeterTrack", () => {
			const { container } = renderWithProviders(
				<Meter value={60} segments={5} tone="success">
					<MeterLabel>ICP score</MeterLabel>
					<MeterValue />
					<MeterTrack />
				</Meter>,
			)
			expect(screen.getByRole("meter", { name: "ICP score" })).toBeInTheDocument()
			expect(ticks(container)).toHaveLength(5)
			expect(filled(container)).toHaveLength(3)
			for (const t of filled(container)) expect(t).toHaveClass("bg-success-mark")
		})

		it("is ignored by the ring", () => {
			const { container } = renderWithProviders(<Meter shape="ring" value={50} segments={10} aria-label="Score" />)
			expect(ticks(container)).toHaveLength(0)
			expect(container.querySelector("svg")).not.toBeNull()
		})
	})

	it("steps the ring's centre value with its size", () => {
		const { container } = renderWithProviders(<Meter shape="ring" size="sm" value={66} showValue aria-label="Score" />)
		expect(container.querySelector(".text-label-xs")).not.toBeNull()
	})
})
