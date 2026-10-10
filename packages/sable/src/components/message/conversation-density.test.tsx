import { describe, expect, it } from "vitest"
import { Attachment } from "../attachment"
import { Bubble, BubbleReaction } from "../bubble"
import { ChatComposer } from "../chat-composer"
import { Density } from "../../lib/density"
import { Marker } from "../marker"
import { MessageScroller } from "../message-scroller"
import { SettingsMenu, SettingsRow } from "../settings-menu"
import { renderWithProviders, screen } from "../../test/render"
import { Message } from "./index"

/**
 * The conversation set is filed `either` in the taxonomy — a claim that it works
 * in the workspace register as well as on a page. It shipped in 0.45–0.47 not
 * doing that: every part hardcoded a page-register type utility, so a chat panel
 * docked in a compact `Workspace` rendered at page sizes. A consuming app
 * reported it as "text feels too large", which is precisely how it looks.
 *
 * These tests are the register claim, made checkable. Each asserts the same
 * thing twice — page-register type outside a compact scope, workspace-register
 * type inside one — because a component that only gets one of those right is the
 * bug, not half a fix.
 */
describe("the conversation set follows the register", () => {
	function inCompact(ui: React.ReactElement) {
		return renderWithProviders(<Density value="compact">{ui}</Density>)
	}

	it("Bubble sets a transcript in prose type, not control type", () => {
		const page = renderWithProviders(<Bubble>hello</Bubble>)
		expect(page.container.firstElementChild?.className).toContain("text-body-md")
		page.unmount()

		const compact = inCompact(<Bubble>hello</Bubble>)
		const el = compact.container.querySelector("[data-align]") as HTMLElement
		// `text-ui-body` (400), NOT `text-ui-md` (500) — a paragraph set at
		// control weight reads as a wall of emphasis.
		expect(el.className).toContain("text-ui-body")
		expect(el.className).not.toContain("text-body-md")
	})

	it("Message drops its header and footer to the workspace tier", () => {
		const page = renderWithProviders(
			<Message header={<span>Carla</span>}>body</Message>,
		)
		expect(page.container.innerHTML).toContain("text-body-xs")
		page.unmount()

		const compact = inCompact(<Message header={<span>Carla</span>}>body</Message>)
		expect(compact.container.innerHTML).toContain("text-ui-sm")
		expect(compact.container.innerHTML).not.toContain("text-body-xs")
	})

	it("Marker follows too", () => {
		const page = renderWithProviders(<Marker>Thinking…</Marker>)
		expect(screen.getByRole("status").className).toContain("text-body-xs")
		page.unmount()

		inCompact(<Marker>Thinking…</Marker>)
		expect(screen.getByRole("status").className).toContain("text-ui-sm")
	})

	it("Attachment's name and meta both follow", () => {
		const page = renderWithProviders(
			<Attachment name="a.pdf" meta="2 MB" />,
		)
		expect(page.container.innerHTML).toContain("text-body-md")
		page.unmount()

		const compact = inCompact(<Attachment name="a.pdf" meta="2 MB" />)
		expect(compact.container.innerHTML).toContain("text-ui-md")
		expect(compact.container.innerHTML).toContain("text-ui-sm")
	})

	it("ChatComposer's field matches the Bubble its text becomes", () => {
		// If these two disagree, a message changes size the moment it is sent.
		const page = renderWithProviders(<ChatComposer />)
		expect(screen.getByRole("textbox").className).toContain("text-body-md")
		page.unmount()

		inCompact(<ChatComposer />)
		expect(screen.getByRole("textbox").className).toContain("text-ui-body")
	})

	it("BubbleReaction's label follows its already-density-aware height", () => {
		const page = renderWithProviders(<BubbleReaction emoji="🎉" count={3} />)
		expect(screen.getByRole("button").className).toContain("text-body-xs")
		page.unmount()

		inCompact(<BubbleReaction emoji="🎉" count={3} />)
		expect(screen.getByRole("button").className).toContain("text-ui-sm")
	})

	it("SettingsMenu's trigger follows", () => {
		const page = renderWithProviders(
			<SettingsMenu summary="x">
				<SettingsRow label="A" value="1" />
			</SettingsMenu>,
		)
		expect(
			screen.getByRole("button", { name: "Change settings" }).className,
		).toContain("text-body-md")
		page.unmount()

		inCompact(
			<SettingsMenu summary="x">
				<SettingsRow label="A" value="1" />
			</SettingsMenu>,
		)
		expect(
			screen.getByRole("button", { name: "Change settings" }).className,
		).toContain("text-ui-md")
	})

	it("MessageScroller tightens the rhythm, because spacing is a register too", () => {
		const page = renderWithProviders(
			<MessageScroller>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		const column = page.container.firstElementChild
			?.firstElementChild as HTMLElement
		expect(column.className).toContain("gap-4")
		page.unmount()

		const compact = inCompact(
			<MessageScroller>
				<Message messageId="a">a</Message>
			</MessageScroller>,
		)
		// Density renders its own wrapper element, so the viewport is one deeper.
		const scoped = compact.container.querySelector(
			"[class*='overscroll-contain']",
		) as HTMLElement
		const compactColumn = scoped.firstElementChild as HTMLElement
		expect(compactColumn.className).toContain("gap-3")
		expect(compactColumn.className).toContain("[--message-gap:calc(var(--spacing)*3)]")
	})
})
