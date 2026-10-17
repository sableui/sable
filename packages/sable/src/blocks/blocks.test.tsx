import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentType } from "react"
import { describe, expect, it, vi } from "vitest"
import * as blocks from "./index"

type BlockProps = { className?: string; framed?: boolean }
const entries = Object.entries(blocks).filter(([name]) => name.endsWith("Block")) as [string, ComponentType<BlockProps>][]

/**
 * Blocks are copy-in source, so a broken one ships as a broken file in someone
 * else's app. These pin the block contract every block shares — renders on its
 * own, takes className on its root, and (when built on a Card) drops the card
 * surface for framed={false} — and the callbacks the docs canvases rely on.
 */
describe("blocks", () => {
	it("exports a meta for every block", () => {
		for (const [name] of entries) {
			const meta = (blocks as Record<string, unknown>)[`${name.charAt(0).toLowerCase()}${name.slice(1)}Meta`] as { name: string } | undefined
			expect(meta?.name, name).toBe(name)
		}
	})

	it.each(entries)("%s renders and merges className onto its root", (_, Block) => {
		const { container } = render(<Block className="max-w-none" />)
		const root = container.firstElementChild as HTMLElement
		expect(root.className).toContain("max-w-none")
		expect(root.className).not.toContain("max-w-xs")
	})

	// That every Card-built block TAKES `framed` is a registry contract check;
	// this pins what it does where it applies.
	it.each(entries)("%s drops the card surface when framed={false}", (_, Block) => {
		const framed = render(<Block />).container.firstElementChild as HTMLElement
		const flat = render(<Block framed={false} />).container.firstElementChild as HTMLElement
		if (flat.className === framed.className) return // not built on a Card: no `framed`
		expect(flat.className).not.toContain("bg-card")
		expect(flat.className).not.toContain("shadow-sm")
	})

	it("SignInBlock reports the method chosen", () => {
		const onSignIn = vi.fn()
		render(<blocks.SignInBlock onSignIn={onSignIn} />)
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
		fireEvent.click(screen.getByRole("button", { name: "Use a passkey" }))
		expect(onSignIn.mock.calls).toEqual([["password"], ["passkey"]])
	})

	it("ApprovalBlock reports the decision, then says what happened where the buttons were", () => {
		const onApprove = vi.fn()
		const onDeny = vi.fn()
		const allow = render(<blocks.ApprovalBlock onApprove={onApprove} onDeny={onDeny} />)
		fireEvent.click(screen.getByRole("checkbox"))
		fireEvent.click(screen.getByRole("button", { name: "Allow" }))
		expect(onApprove.mock.calls).toEqual([[{ remember: true }]])
		expect(screen.queryByRole("button", { name: "Deny" })).toBeNull()
		expect(screen.getByRole("status")).toHaveFocus()
		allow.unmount()
		render(<blocks.ApprovalBlock onApprove={onApprove} onDeny={onDeny} />)
		fireEvent.click(screen.getByRole("button", { name: "Deny" }))
		expect(onDeny).toHaveBeenCalledOnce()
		expect(screen.getByRole("status")).toHaveTextContent("Denied")
	})

	it("InviteTeamBlock sends the typed address", () => {
		const onSend = vi.fn()
		render(<blocks.InviteTeamBlock onSend={onSend} />)
		fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "ada@studio.com" } })
		fireEvent.click(screen.getByRole("button", { name: "Send" }))
		expect(onSend).toHaveBeenCalledWith("ada@studio.com")
	})

	it("FeedbackFormBlock reports skip and send", () => {
		const onDone = vi.fn()
		render(<blocks.FeedbackFormBlock onDone={onDone} />)
		fireEvent.click(screen.getByRole("button", { name: "Skip" }))
		fireEvent.click(screen.getByRole("button", { name: "Send feedback" }))
		expect(onDone.mock.calls).toEqual([[false], [true, { score: 4, notes: "" }]])
	})
})
