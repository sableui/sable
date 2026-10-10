import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders } from "../../test/render"
import { Scroller } from "./index"

/**
 * jsdom does not lay out, so none of this can prove a pixel: `clientHeight` is 0
 * for everything and nothing ever overflows. What it CAN prove is the structural
 * contract, which is where both of this component's shipped bugs lived.
 *
 * Two boxes, and which is which is the whole design:
 *
 *   chrome  — the consumer's border/background/radius AND the sizing. Never
 *             masked, because a mask applies to an element's own border and a
 *             bordered Scroller used to watch its frame dissolve at the fade.
 *   region  — the element that scrolls. Carries the mask, the scrollbar policy,
 *             the ref, onScroll, focus and the keyboard handling.
 *
 * The failure mode of the FIRST wrapper (removed in 0.44) was bounding: the
 * inner was `h-full`, a `max-h-*` on the wrapper had no definite height to
 * resolve against, and the region grew to full content height — clipped and
 * unscrollable with nothing to say so. Hence the `flex-1 min-h-0` assertions.
 */
describe("Scroller", () => {
	/** The chrome box — what `className` lands on. */
	function chrome(container: HTMLElement) {
		const el = container.firstElementChild as HTMLElement
		expect(el).not.toBeNull()
		return el
	}
	/** The element that actually scrolls. */
	function region(container: HTMLElement) {
		const el = chrome(container).firstElementChild as HTMLElement
		expect(el).not.toBeNull()
		return el
	}

	it("styles and sizes from className, and scrolls inside that box", () => {
		const { container } = renderWithProviders(
			<Scroller className="max-h-80 rounded-lg border border-border">
				<p>content</p>
			</Scroller>,
		)
		// Chrome and cap together, away from the mask.
		expect(chrome(container).className).toContain("max-h-80")
		expect(chrome(container).className).toContain("border")
		expect(chrome(container).className).toContain("flex flex-col")
		// The scroller fills that box without a percentage height — the exact
		// thing the 0.44 wrapper got wrong.
		const el = region(container)
		expect(el.className).toContain("flex-1")
		expect(el.className).toContain("min-h-0")
		expect(el.className).toContain("overflow-y-auto")
		expect(el.className).not.toContain("h-full")
	})

	it("keeps the consumer's chrome off the masked element", () => {
		// The reported bug: mask + border on one box means the border fades out
		// at the scrolling edge. They must never be the same element again.
		const { container } = renderWithProviders(
			<Scroller className="rounded-lg border border-border">content</Scroller>,
		)
		expect(region(container).className).not.toContain("border-border")
		expect(chrome(container).style.maskImage).toBe("")
	})

	it("routes viewportClassName to the scroller, not the chrome", () => {
		const { container } = renderWithProviders(
			<Scroller className="h-64" viewportClassName="snap-x scroll-smooth">
				content
			</Scroller>,
		)
		expect(region(container).className).toContain("snap-x")
		expect(chrome(container).className).not.toContain("snap-x")
	})

	it("wraps the consumer's children in nothing else", () => {
		const { container } = renderWithProviders(
			<Scroller className="max-h-80">
				<p>content</p>
			</Scroller>,
		)
		expect(container.children).toHaveLength(1)
		expect(region(container).firstElementChild?.tagName).toBe("P")
	})

	it("opts into the thin scrollbar and contains overscroll", () => {
		const { container } = renderWithProviders(<Scroller>content</Scroller>)
		expect(region(container).className).toContain("scrollbar-quiet")
		expect(region(container).className).toContain("overscroll-contain")
	})

	it("switches the scrolling axis with orientation", () => {
		const { container } = renderWithProviders(
			<Scroller orientation="horizontal">content</Scroller>,
		)
		const el = region(container)
		expect(el.className).toContain("overflow-x-auto")
		expect(el.className).toContain("overflow-y-hidden")
	})

	it("draws no bar on the horizontal axis — the edge fades are the affordance", () => {
		// A 4px rail under a row of media tiles adds chrome and no information;
		// the fade already says "more this way", which is the carousel read.
		const { container } = renderWithProviders(
			<Scroller orientation="horizontal">content</Scroller>,
		)
		expect(region(container).className).toContain("scrollbar-hidden")
		expect(region(container).className).not.toContain("scrollbar-quiet")
	})

	it("marks itself as scrolling, so the bar can appear while it moves", () => {
		const { container } = renderWithProviders(<Scroller>content</Scroller>)
		const el = region(container)
		expect(el.hasAttribute("data-scrolling")).toBe(false)
		fireEvent.scroll(el)
		// Hover cannot model a touch drag or an auto-scroll; this attribute can.
		expect(el.hasAttribute("data-scrolling")).toBe(true)
	})

	it("forwards a ref to the scrolling element", () => {
		const ref = createRef<HTMLDivElement>()
		const { container } = renderWithProviders(
			<Scroller ref={ref} className="max-h-80">
				content
			</Scroller>,
		)
		expect(ref.current).toBe(region(container))
	})

	it("does not detach and reattach a callback ref on every render", () => {
		// A merged ref built inline is a new function each render, and React tears
		// a changed callback ref down (calls it with null) before calling the new
		// one. A consumer that does work on attach — CommandMenu seeds its keyboard
		// highlight in exactly this callback — silently has that work redone on
		// every render, undoing anything set since the last one.
		const attach = vi.fn()
		function Host({ label }: { label: string }) {
			return <Scroller ref={attach}>{label}</Scroller>
		}
		const { rerender } = renderWithProviders(<Host label="one" />)
		expect(attach).toHaveBeenCalledTimes(1)
		rerender(<Host label="two" />)
		rerender(<Host label="three" />)
		expect(attach).toHaveBeenCalledTimes(1)
	})

	it("calls the consumer's onScroll alongside its own fade sync", () => {
		const onScroll = vi.fn()
		const { container } = renderWithProviders(
			<Scroller onScroll={onScroll}>content</Scroller>,
		)
		region(container).dispatchEvent(new Event("scroll", { bubbles: true }))
		expect(onScroll).toHaveBeenCalledTimes(1)
	})
})
