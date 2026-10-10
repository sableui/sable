import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "../components/button"
import { NotificationBadge } from "../components/notification-badge"
import { Pill } from "../components/pill"
import { trimLabel } from "./trim-label"

/**
 * `text-box-trim` is inert on a flex container, so controls hand their TEXT to a
 * wrapper element that can carry it. The risk this introduces is structural, not
 * visual: wrapping too much collapses icon and label into one flex item and
 * silently kills the control's `gap`, which no snapshot of a single button would
 * catch. These tests pin the child structure, not the CSS.
 */
describe("trimLabel", () => {
	it("wraps a bare string label", () => {
		const { container } = render(<>{trimLabel("Save")}</>)
		const span = container.querySelector(".sable-label-trim")
		expect(span?.textContent).toBe("Save")
	})

	it("wraps a number", () => {
		const { container } = render(<>{trimLabel(7)}</>)
		expect(container.querySelector(".sable-label-trim")?.textContent).toBe("7")
	})

	it("leaves a lone element child alone, so an icon never gets a text wrapper", () => {
		const { container } = render(<>{trimLabel(<svg data-testid="icon" />)}</>)
		expect(container.querySelector(".sable-label-trim")).toBeNull()
		expect(screen.getByTestId("icon")).toBeTruthy()
	})

	it("passes null and booleans through untouched", () => {
		expect(trimLabel(null)).toBeNull()
		expect(trimLabel(false)).toBe(false)
	})

	it("wraps only the text in a mixed icon + text label", () => {
		const { container } = render(
			<div>
				{trimLabel([<svg key="i" data-testid="icon" />, "Save"])}
			</div>,
		)
		const root = container.firstElementChild!
		// Two children still, so the flex gap between icon and label survives.
		expect(root.children.length).toBe(2)
		expect(root.children[0].tagName.toLowerCase()).toBe("svg")
		expect(root.children[1]).toHaveClass("sable-label-trim")
	})
})

describe("controls that adopted it", () => {
	it("Button keeps the icon a separate flex item from the label", () => {
		render(
			<Button>
				<svg data-testid="icon" />
				Save
			</Button>,
		)
		const btn = screen.getByRole("button")
		// icon + wrapped label = 2 element children. One child would mean the gap
		// collapsed and the icon lost its spacing.
		expect(btn.children.length).toBe(2)
		expect(btn.querySelector(".sable-label-trim")?.textContent).toBe("Save")
	})

	it("Button wraps a plain label", () => {
		render(<Button>Collect</Button>)
		expect(
			screen.getByRole("button").querySelector(".sable-label-trim")?.textContent,
		).toBe("Collect")
	})

	it("Button keeps the Spinner separate from the label while loading", () => {
		render(<Button loading>Saving</Button>)
		const btn = screen.getByRole("button")
		expect(btn.querySelector(".sable-label-trim")?.textContent).toBe("Saving")
		expect(btn.getAttribute("aria-busy")).toBe("true")
	})

	it("NotificationBadge wraps its count", () => {
		const { container } = render(<NotificationBadge count={12} />)
		expect(container.querySelector(".sable-label-trim")?.textContent).toBe("12")
	})

	it("NotificationBadge still caps at max", () => {
		const { container } = render(<NotificationBadge count={500} max={99} />)
		expect(container.querySelector(".sable-label-trim")?.textContent).toBe("99+")
	})

	it("NotificationBadge dot mode renders no label wrapper", () => {
		const { container } = render(<NotificationBadge dot />)
		expect(container.querySelector(".sable-label-trim")).toBeNull()
	})

	it("Pill keeps the legacy em nudge as the no-text-box fallback", () => {
		const { container } = render(<Pill>Draft</Pill>)
		const pill = container.firstElementChild!
		// Both must be present: the class @supports neutralises the padding for,
		// and the tuned padding that is still the only correction without it.
		expect(pill.className).toContain("sable-optical-pad")
		expect(pill.className).toContain("pt-[0.23em]")
		expect(pill.querySelector(".sable-label-trim")?.textContent).toBe("Draft")
	})

	it("Pill keeps its icon a separate child", () => {
		const { container } = render(<Pill icon={<svg data-testid="icon" />}>Tag</Pill>)
		expect(container.firstElementChild?.children.length).toBe(2)
	})
})
