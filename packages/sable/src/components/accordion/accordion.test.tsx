import { fireEvent, renderWithProviders as render, screen } from "../../test/render"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { Icon } from "../../icon/Icon"
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "./accordion"

function Faq({ headingLevel, indicator }: { headingLevel?: 2 | 3 | 4 | 5 | 6; indicator?: ReactNode }) {
	return (
		<Accordion>
			<AccordionItem value="a">
				<AccordionTrigger headingLevel={headingLevel} indicator={indicator}>
					Can I cancel anytime?
				</AccordionTrigger>
				<AccordionPanel>Yes, from billing settings.</AccordionPanel>
			</AccordionItem>
		</Accordion>
	)
}

describe("Accordion", () => {
	it("wraps the trigger in an h3 by default", () => {
		render(<Faq />)
		const heading = screen.getByRole("heading", { level: 3 })
		expect(heading).toContainElement(screen.getByRole("button", { name: "Can I cancel anytime?" }))
	})

	it("takes the heading level the page outline needs", () => {
		render(<Faq headingLevel={2} />)
		expect(screen.queryByRole("heading", { level: 3 })).toBeNull()
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Can I cancel anytime?")
	})

	it("rotates its own chevron by default, and leaves a custom indicator's behaviour to the caller", () => {
		const { unmount } = render(<Faq />)
		const button = screen.getByRole("button")
		expect(button.className).toContain("[&[data-panel-open]_[data-slot=accordion-chevron]]:rotate-180")
		expect(button.querySelector("[data-slot=accordion-chevron] [data-icon]")).not.toBeNull()
		unmount()

		render(<Faq indicator={<Icon name="plus" data-testid="plus" />} />)
		const custom = screen.getByRole("button")
		expect(custom.className).not.toContain("rotate-180")
		expect(custom.querySelector("[data-slot=accordion-chevron]")).not.toBeNull()
	})

	it("opens its panel from the trigger", () => {
		render(<Faq />)
		const button = screen.getByRole("button")
		expect(button).toHaveAttribute("aria-expanded", "false")
		fireEvent.click(button)
		expect(button).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText("Yes, from billing settings.")).toBeInTheDocument()
	})
})
