import { fr } from "date-fns/locale"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "../tooltip"
import { RelativeTime } from "./relative-time"

describe("RelativeTime", () => {
	it("is a keyboard-focusable <time> that inherits its type size", () => {
		const { container } = render(
			<TooltipProvider>
				<RelativeTime date="2025-04-29T16:05:12Z" />
			</TooltipProvider>,
		)
		const time = container.querySelector("time") as HTMLElement
		expect(time).toHaveAttribute("datetime", "2025-04-29T16:05:12.000Z")
		// The tooltip opens on focus, so the absolute time needs a focus stop.
		expect(time).toHaveAttribute("tabindex", "0")
		expect(time.className).not.toMatch(/\btext-body-/)
	})
})

describe("RelativeTime input and reference", () => {
	it("renders an unparseable date as its own text instead of throwing", () => {
		const { container } = render(
			<TooltipProvider>
				<RelativeTime date="not a date" className="meta" />
			</TooltipProvider>,
		)
		const time = container.querySelector("time") as HTMLElement
		expect(time).toHaveTextContent("not a date")
		expect(time).not.toHaveAttribute("datetime")
		expect(time).not.toHaveAttribute("tabindex")
		expect(time).toHaveClass("meta")
	})

	it("measures from now when given one, so server and client agree", () => {
		const { container } = render(
			<TooltipProvider>
				<RelativeTime date="2025-04-29T16:00:00Z" now={new Date("2025-04-29T16:03:00Z")} />
			</TooltipProvider>,
		)
		const time = container.querySelector("time") as HTMLElement
		expect(time).toHaveTextContent("3 minutes ago")
	})

	it("speaks the locale it is given", () => {
		const { container } = render(
			<TooltipProvider>
				<RelativeTime date="2025-04-29T16:00:00Z" now={new Date("2025-04-29T16:03:00Z")} locale={fr} />
			</TooltipProvider>,
		)
		expect(container.querySelector("time")).toHaveTextContent("il y a 3 minutes")
	})
})
