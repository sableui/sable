import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { Message } from "../message"
import { MessageScroller, type MessageScrollerHandle } from "./index"

/**
 * jsdom does not lay out: `scrollHeight` and `clientHeight` are 0 for
 * everything, so nothing ever overflows and no scroll is ever real. What these
 * tests hold is the part that is structural rather than pixel-dependent — which
 * element carries the consumer's bound, which element carries the messages,
 * what the ref hands back, and how the follow state responds to a scroll event
 * with metrics stubbed in.
 *
 * The behaviors that genuinely need layout — prepend preservation and the
 * IntersectionObserver visibility pass (the setup mocks both observers to
 * no-ops) — are exercised in the docs app, not here. Asserting them against
 * fake geometry would test the fake.
 */

/** Give an element the scroll geometry jsdom refuses to compute. */
function stubScroll(
	el: HTMLElement,
	{ scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number },
) {
	Object.defineProperty(el, "scrollHeight", {
		configurable: true,
		value: scrollHeight,
	})
	Object.defineProperty(el, "clientHeight", {
		configurable: true,
		value: clientHeight,
	})
}

function viewportOf(container: HTMLElement) {
	const el = container.firstElementChild as HTMLElement
	expect(el).not.toBeNull()
	return el
}

describe("MessageScroller", () => {
	it("puts the consumer's bound on the element that scrolls", () => {
		const { container } = renderWithProviders(
			<MessageScroller className="max-h-96">
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		expect(viewport.className).toContain("max-h-96")
		expect(viewport.className).toContain("overflow-y-auto")
		expect(viewport.className).toContain("overscroll-contain")
	})

	it("lays the messages out in a column inside the scroll region, not on it", () => {
		const { container } = renderWithProviders(
			<MessageScroller className="px-4" gap="lg">
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		const column = viewport.firstElementChild as HTMLElement
		// The gap belongs to the column; the padding belongs to the region.
		expect(column.className).toContain("flex-col")
		expect(column.className).toContain("gap-6")
		expect(viewport.className).not.toContain("gap-6")
	})

	it("publishes the rhythm as --message-gap so a grouped Message can close it", () => {
		const { container } = renderWithProviders(
			<MessageScroller gap="sm">
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const column = viewportOf(container).firstElementChild as HTMLElement
		expect(column.className).toContain("[--message-gap:calc(var(--spacing)*2)]")
	})

	it("hands back a command handle, not the DOM node — with the node on it", () => {
		const ref = createRef<MessageScrollerHandle>()
		const { container } = renderWithProviders(
			<MessageScroller ref={ref}>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		expect(typeof ref.current?.scrollToBottom).toBe("function")
		expect(typeof ref.current?.scrollToMessage).toBe("function")
		expect(ref.current?.element).toBe(viewportOf(container))
	})

	it("scrollToMessage resolves a messageId, and reports when it cannot", () => {
		const ref = createRef<MessageScrollerHandle>()
		const scrollIntoView = vi.fn()
		Element.prototype.scrollIntoView = scrollIntoView

		renderWithProviders(
			<MessageScroller ref={ref}>
				<Message messageId="first">first</Message>
				<Message messageId="second">second</Message>
			</MessageScroller>,
		)

		expect(ref.current?.scrollToMessage("second")).toBe(true)
		expect(scrollIntoView).toHaveBeenCalledWith(
			expect.objectContaining({ block: "center" }),
		)
		// A thread that has not loaded that far back should be told so, rather
		// than silently doing nothing — the caller's next move is to fetch more.
		expect(ref.current?.scrollToMessage("not-loaded")).toBe(false)
	})

	it("escapes the id, so a messageId is never a selector injection", () => {
		const ref = createRef<MessageScrollerHandle>()
		Element.prototype.scrollIntoView = vi.fn()
		renderWithProviders(
			<MessageScroller ref={ref}>
				<Message messageId='weird"]:has(*)'>odd</Message>
			</MessageScroller>,
		)
		expect(ref.current?.scrollToMessage('weird"]:has(*)')).toBe(true)
	})

	it("releases follow when the reader scrolls away, and resumes at the bottom", () => {
		const onFollowChange = vi.fn()
		const ref = createRef<MessageScrollerHandle>()
		const { container } = renderWithProviders(
			<MessageScroller ref={ref} onFollowChange={onFollowChange}>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		stubScroll(viewport, { scrollHeight: 1000, clientHeight: 200 })

		viewport.scrollTop = 200 // 600px from the bottom — well clear of the band
		fireEvent.scroll(viewport)
		expect(onFollowChange).toHaveBeenLastCalledWith(false)
		expect(ref.current?.isFollowing()).toBe(false)

		viewport.scrollTop = 800 // back to the bottom
		fireEvent.scroll(viewport)
		expect(onFollowChange).toHaveBeenLastCalledWith(true)
		expect(ref.current?.isFollowing()).toBe(true)
	})

	it("treats the threshold as a band, so a token arriving mid-frame does not release", () => {
		const onFollowChange = vi.fn()
		const { container } = renderWithProviders(
			<MessageScroller onFollowChange={onFollowChange}>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		stubScroll(viewport, { scrollHeight: 1000, clientHeight: 200 })

		viewport.scrollTop = 760 // 40px short of the bottom, inside the 64px band
		fireEvent.scroll(viewport)
		expect(onFollowChange).not.toHaveBeenCalled()
	})

	it("never follows when autoFollow is off, however close to the bottom", () => {
		const ref = createRef<MessageScrollerHandle>()
		const { container } = renderWithProviders(
			<MessageScroller ref={ref} autoFollow={false}>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		stubScroll(viewport, { scrollHeight: 1000, clientHeight: 200 })
		viewport.scrollTop = 800
		fireEvent.scroll(viewport)
		expect(ref.current?.isFollowing()).toBe(false)
	})

	it("offers the jump control only when there is somewhere to jump to", () => {
		const { container } = renderWithProviders(
			<MessageScroller>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		expect(screen.queryByRole("button", { name: "Jump to latest" })).toBeNull()

		stubScroll(viewport, { scrollHeight: 1000, clientHeight: 200 })
		viewport.scrollTop = 100
		fireEvent.scroll(viewport)

		expect(
			screen.getByRole("button", { name: "Jump to latest" }),
		).toBeInTheDocument()
	})

	it("keeps the jump control inside the scroll region, so no wrapper is needed", () => {
		const { container } = renderWithProviders(
			<MessageScroller jumpToLatestLabel="Newest">
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		stubScroll(viewport, { scrollHeight: 1000, clientHeight: 200 })
		viewport.scrollTop = 0
		fireEvent.scroll(viewport)

		// One element rendered at the top level; the control lives within it,
		// stuck to the bottom edge, rather than in a positioned wrapper the
		// consumer would then have to reach past to size the scroller.
		expect(container.children).toHaveLength(1)
		const jump = screen.getByRole("button", { name: "Newest" })
		expect(viewport.contains(jump)).toBe(true)
		expect(jump.parentElement?.className).toContain("sticky")
	})

	it("composes the consumer's onScroll with its own", () => {
		const onScroll = vi.fn()
		const { container } = renderWithProviders(
			<MessageScroller onScroll={onScroll}>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const viewport = viewportOf(container)
		stubScroll(viewport, { scrollHeight: 1000, clientHeight: 200 })
		fireEvent.scroll(viewport)
		expect(onScroll).toHaveBeenCalledTimes(1)
	})
})
