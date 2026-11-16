import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
		const always = render(<blocks.ApprovalBlock onApprove={onApprove} onDeny={onDeny} />)
		fireEvent.click(screen.getByRole("button", { name: "Always allow" }))
		expect(onApprove.mock.calls).toEqual([[{ remember: true }]])
		expect(screen.queryByRole("button", { name: "Deny" })).toBeNull()
		expect(screen.getByText("Allowed. Running the migration.").closest("[role=status]")).toHaveFocus()
		always.unmount()
		const once = render(<blocks.ApprovalBlock onApprove={onApprove} onDeny={onDeny} />)
		fireEvent.click(screen.getByRole("button", { name: "Allow once" }))
		expect(onApprove.mock.calls[1]).toEqual([{ remember: false }])
		once.unmount()
		render(<blocks.ApprovalBlock onApprove={onApprove} onDeny={onDeny} />)
		fireEvent.click(screen.getByRole("button", { name: "Deny" }))
		expect(onDeny).toHaveBeenCalledOnce()
		expect(screen.getByText("Denied. The agent won't run it.").closest("[role=status]")).toHaveFocus()
	})

	it("AgentRunBlock plays a turn for the follow-up and settles", () => {
		vi.useFakeTimers()
		try {
			const onSend = vi.fn()
			const { container } = render(<blocks.AgentRunBlock onSend={onSend} />)
			const status = container.querySelector("p[role=status]") as HTMLElement
			expect(status).toBeEmptyDOMElement()
			fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Which orders?" } })
			fireEvent.click(screen.getByRole("button", { name: "Send message" }))
			expect(onSend).toHaveBeenCalledWith("Which orders?")
			expect(screen.getByText("Which orders?")).toBeInTheDocument()
			// The live region was there before the turn began; only its text changed.
			expect(status).toHaveTextContent("Thinking…")
			// Send is stop while the turn runs.
			expect(screen.getByRole("button", { name: "Stop generating" })).toBeInTheDocument()
			act(() => void vi.advanceTimersByTime(1200))
			expect(screen.getByText("Searching the logs")).toBeInTheDocument()
			for (let i = 0; i < 40; i++) act(() => void vi.advanceTimersByTime(1600))
			expect(screen.getByText("Searched the logs")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument()
			expect(status).toBeEmptyDOMElement()
		} finally {
			vi.useRealTimers()
		}
	})

	it("AgentRunBlock keeps what arrived when stopped", () => {
		vi.useFakeTimers()
		try {
			const { container } = render(<blocks.AgentRunBlock />)
			fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Again" } })
			fireEvent.click(screen.getByRole("button", { name: "Send message" }))
			act(() => void vi.advanceTimersByTime(1200))
			fireEvent.click(screen.getByRole("button", { name: "Stop generating" }))
			expect(container.querySelector("p[role=status]")).toHaveTextContent("Stopped.")
			expect(screen.getByText("Stopped")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument()
		} finally {
			vi.useRealTimers()
		}
	})

	it("PostBlock reports a like, opening the comments, a save and its menu", async () => {
		const onLikeChange = vi.fn()
		const onComment = vi.fn()
		const onSaveChange = vi.fn()
		const onPostAction = vi.fn()
		render(<blocks.PostBlock onLikeChange={onLikeChange} onComment={onComment} onSaveChange={onSaveChange} onPostAction={onPostAction} />)
		fireEvent.click(screen.getByRole("button", { name: /^Like/ }))
		// The count and the hidden word make one name, with the space between them.
		fireEvent.click(screen.getByRole("button", { name: "24 comments" }))
		fireEvent.click(screen.getByRole("button", { name: /^Save/ }))
		expect(onLikeChange).toHaveBeenCalledWith(true)
		expect(onComment).toHaveBeenCalledOnce()
		expect(onSaveChange).toHaveBeenCalledWith(true)
		// The ellipsis is a real menu, named for the post it acts on.
		fireEvent.click(screen.getByRole("button", { name: "More options for Mara Okafor's post" }))
		fireEvent.click(await screen.findByRole("menuitem", { name: "Report post" }))
		expect(onPostAction).toHaveBeenCalledWith("report")
	})

	it("ReserveTableBlock books the day and party shown, then cancels on a second press", () => {
		vi.useFakeTimers()
		try {
			const onReserve = vi.fn()
			const onCancel = vi.fn()
			render(<blocks.ReserveTableBlock onReserve={onReserve} onCancel={onCancel} />)
			fireEvent.click(screen.getByRole("button", { name: /^Reserve for/ }))
			// Two days out from today: the sample's dates follow the calendar.
			const now = new Date()
			expect(onReserve).toHaveBeenCalledWith({ date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2), guests: 2 })
			// The picker leaves; the confirmation takes its place and the focus.
			expect(screen.getByText("Table booked").closest("[role=status]")).toHaveFocus()
			expect(screen.getByText("Table for 2")).toBeInTheDocument()
			expect(screen.queryByRole("grid")).toBeNull()
			const cancel = screen.getByRole("button", { name: /Cancel booking/ })
			fireEvent.click(cancel)
			expect(onCancel).not.toHaveBeenCalled()
			// Past ConfirmButton's double-press guard, so the second press is a decision.
			act(() => void vi.advanceTimersByTime(400))
			fireEvent.click(cancel)
			expect(onCancel).toHaveBeenCalledOnce()
			expect(screen.getByRole("button", { name: /^Reserve for/ })).toHaveFocus()
		} finally {
			vi.useRealTimers()
		}
	})

	it("DeliveryOptionsBlock continues with the chosen option", () => {
		const onContinue = vi.fn()
		render(<blocks.DeliveryOptionsBlock onContinue={onContinue} />)
		fireEvent.click(screen.getByRole("radio", { name: /Express/ }))
		fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }))
		expect(onContinue).toHaveBeenCalledWith("express")
	})

	it("PhotoAdjustBlock saves the edit and resets it", () => {
		const onSave = vi.fn()
		render(<blocks.PhotoAdjustBlock onSave={onSave} />)
		const reset = screen.getByRole("button", { name: "Reset" })
		expect(reset).toBeDisabled()
		// The slider is "Exposure"; the field beside it is its exact value.
		expect(screen.getByRole("slider", { name: "Exposure" })).toBeInTheDocument()
		const exposure = screen.getByLabelText("Exposure value")
		fireEvent.keyDown(exposure, { key: "ArrowUp" })
		fireEvent.click(screen.getByRole("button", { name: "Save" }))
		expect(onSave).toHaveBeenLastCalledWith({ exposure: 1, contrast: 0, saturation: 0, tint: "transparent" })
		fireEvent.click(reset)
		fireEvent.click(screen.getByRole("button", { name: "Save" }))
		expect(onSave).toHaveBeenLastCalledWith({ exposure: 0, contrast: 0, saturation: 0, tint: "transparent" })
	})

	it("StorageBlock clears the cache on a second press and reports the space back", () => {
		vi.useFakeTimers()
		try {
			const onClear = vi.fn()
			render(<blocks.StorageBlock onClear={onClear} />)
			expect(screen.getByText("38.2 GB of 50 GB")).toBeInTheDocument()
			const clear = screen.getByRole("button", { name: /Clear cache/ })
			fireEvent.click(clear)
			act(() => void vi.advanceTimersByTime(400))
			fireEvent.click(clear)
			// The button gives way to the task it started.
			expect(screen.getByRole("progressbar", { name: "Clearing cache" })).toBeInTheDocument()
			expect(onClear).not.toHaveBeenCalled()
			for (let i = 0; i < 8; i++) act(() => void vi.advanceTimersByTime(300))
			expect(onClear).toHaveBeenCalledOnce()
			expect(screen.getByText("35.1 GB of 50 GB")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: /Cache is empty/ })).toBeDisabled()
		} finally {
			vi.useRealTimers()
		}
	})

	it("StreakBlock reports the day chosen on the grid", () => {
		const onSelectDay = vi.fn()
		render(<blocks.StreakBlock onSelectDay={onSelectDay} />)
		const cell = screen.getAllByRole("gridcell").at(-1) as HTMLElement
		fireEvent.click(cell)
		expect(onSelectDay).toHaveBeenCalledWith(cell.getAttribute("data-date"))
		expect(cell).toHaveAttribute("aria-selected", "true")
	})

	it("StreakBlock switches what the grid measures", () => {
		render(<blocks.StreakBlock />)
		expect(screen.getByRole("grid", { name: "Pages read, last 16 weeks" })).toBeInTheDocument()
		const minutes = screen.getByRole("button", { name: "Minutes" })
		fireEvent.click(minutes)
		expect(minutes).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("grid", { name: "Minutes read, last 16 weeks" })).toBeInTheDocument()
	})

	it("ShareBlock copies the link and holds Invite until someone is chosen", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
		try {
			const onCopyLink = vi.fn()
			render(<blocks.ShareBlock onCopyLink={onCopyLink} />)
			expect(screen.getByRole("button", { name: "Invite" })).toBeDisabled()
			fireEvent.click(screen.getByRole("button", { name: "Copy link" }))
			await vi.waitFor(() => expect(onCopyLink).toHaveBeenCalledOnce())
			expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\//))
		} finally {
			Reflect.deleteProperty(navigator, "clipboard")
		}
	})

	it("ShareBlock invites the people chosen with their role, then clears the field", async () => {
		const user = userEvent.setup()
		const onInvite = vi.fn().mockResolvedValue(undefined)
		render(<blocks.ShareBlock onInvite={onInvite} />)
		await user.click(screen.getByPlaceholderText("Search by name"))
		await user.click(await screen.findByRole("option", { name: "Ana Chen" }))
		await user.keyboard("{Escape}")
		const invite = screen.getByRole("button", { name: "Invite" })
		expect(invite).toBeEnabled()
		await user.click(invite)
		expect(onInvite).toHaveBeenCalledWith({ people: ["ana"], role: "view" })
		// Cleared once the app's promise settles, not before.
		await vi.waitFor(() => expect(screen.getByRole("button", { name: "Invite" })).toBeDisabled())
	})

	it("ShareBlock keeps the people chosen when the invite fails", async () => {
		const user = userEvent.setup()
		const onInvite = vi.fn().mockRejectedValue(new Error("offline"))
		render(<blocks.ShareBlock onInvite={onInvite} />)
		await user.click(screen.getByPlaceholderText("Search by name"))
		await user.click(await screen.findByRole("option", { name: "Kofi Mensah" }))
		await user.keyboard("{Escape}")
		await user.click(screen.getByRole("button", { name: "Invite" }))
		await vi.waitFor(() => expect(onInvite).toHaveBeenCalledOnce())
		await act(async () => {})
		expect(screen.getByRole("button", { name: "Invite" })).toBeEnabled()
	})

	it("SearchBlock searches, opens a result, and offers a way out of no results", () => {
		vi.useFakeTimers()
		try {
			const onOpen = vi.fn()
			render(<blocks.SearchBlock onOpen={onOpen} />)
			const field = screen.getByLabelText("Search the workspace")
			const status = screen.getByRole("status")
			expect(status).toHaveTextContent("Recent")
			fireEvent.change(field, { target: { value: "road" } })
			expect(status).toHaveTextContent("Searching")
			act(() => void vi.advanceTimersByTime(450))
			expect(status).toHaveTextContent("2 results")
			fireEvent.click(screen.getByRole("button", { name: /Q4 roadmap/ }))
			expect(onOpen).toHaveBeenCalledWith("roadmap")
			fireEvent.change(field, { target: { value: "zebra" } })
			act(() => void vi.advanceTimersByTime(450))
			expect(screen.getByText("Nothing for “zebra”")).toBeInTheDocument()
			fireEvent.click(screen.getByRole("button", { name: "Reset search" }))
			act(() => void vi.advanceTimersByTime(450))
			expect(status).toHaveTextContent("Recent")
			expect(field).toHaveValue("")
		} finally {
			vi.useRealTimers()
		}
	})

	it("CartBlock changes a quantity, removes a line, and checks out what is left", () => {
		const onQuantityChange = vi.fn()
		const onRemove = vi.fn()
		const onCheckout = vi.fn()
		render(<blocks.CartBlock onQuantityChange={onQuantityChange} onRemove={onRemove} onCheckout={onCheckout} />)
		fireEvent.click(screen.getAllByRole("button", { name: "Increase" })[0])
		expect(onQuantityChange).toHaveBeenCalledWith("throw", 2)
		fireEvent.click(screen.getByRole("button", { name: "Remove Stoneware mug" }))
		expect(onRemove).toHaveBeenCalledWith("mug")
		// The row is gone, so focus goes to the cart's heading, and the removal is announced.
		expect(screen.getByRole("heading", { name: "Your cart" })).toHaveFocus()
		expect(screen.getByText("Removed Stoneware mug")).toHaveAttribute("role", "status")
		fireEvent.click(screen.getByRole("button", { name: "Check out" }))
		expect(onCheckout).toHaveBeenCalledWith({
			lines: [
				{ id: "throw", quantity: 2 },
				{ id: "candle", quantity: 1 },
			],
			// $128 + $24 clears the free-shipping line, so nothing is added.
			total: 152,
		})
	})

	it("CartBlock shows an empty state once the last line is removed", () => {
		render(<blocks.CartBlock />)
		for (const name of ["Linen throw blanket", "Stoneware mug", "Cedar candle"]) {
			fireEvent.click(screen.getByRole("button", { name: `Remove ${name}` }))
		}
		expect(screen.getByText("Your cart is empty")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Check out" })).toBeNull()
	})

	it("SubscriptionBlock cancels on a second press and can be taken back", () => {
		vi.useFakeTimers()
		try {
			const onCancel = vi.fn()
			const onResume = vi.fn()
			const onChangePlan = vi.fn()
			const onUpdatePayment = vi.fn()
			render(<blocks.SubscriptionBlock onCancel={onCancel} onResume={onResume} onChangePlan={onChangePlan} onUpdatePayment={onUpdatePayment} />)
			fireEvent.click(screen.getByRole("button", { name: "Change plan" }))
			fireEvent.click(screen.getByRole("button", { name: "Update payment method" }))
			expect(onChangePlan).toHaveBeenCalledOnce()
			expect(onUpdatePayment).toHaveBeenCalledOnce()
			const cancel = screen.getByRole("button", { name: /Cancel plan/ })
			fireEvent.click(cancel)
			expect(onCancel).not.toHaveBeenCalled()
			act(() => void vi.advanceTimersByTime(400))
			fireEvent.click(cancel)
			expect(onCancel).toHaveBeenCalledOnce()
			expect(screen.getByText("Cancelling")).toBeInTheDocument()
			fireEvent.click(screen.getByRole("button", { name: "Keep my plan" }))
			expect(onResume).toHaveBeenCalledOnce()
			expect(screen.getByText("Active")).toBeInTheDocument()
		} finally {
			vi.useRealTimers()
		}
	})

	it("SecurityBlock switches two-factor and signs a device out", () => {
		const onTwoFactorChange = vi.fn()
		const onSignOut = vi.fn()
		const onManagePasskeys = vi.fn()
		render(<blocks.SecurityBlock onTwoFactorChange={onTwoFactorChange} onSignOut={onSignOut} onManagePasskeys={onManagePasskeys} />)
		fireEvent.click(screen.getByRole("switch", { name: "Two-factor authentication" }))
		expect(onTwoFactorChange).toHaveBeenCalledWith(false)
		fireEvent.click(screen.getByRole("button", { name: "Manage passkeys" }))
		expect(onManagePasskeys).toHaveBeenCalledOnce()
		// The device in use is never offered a sign-out.
		expect(screen.queryByRole("button", { name: "Sign out of MacBook Pro" })).toBeNull()
		fireEvent.click(screen.getByRole("button", { name: "Sign out of Windows desktop" }))
		expect(onSignOut).toHaveBeenCalledWith("s2")
		expect(screen.queryByRole("button", { name: "Sign out of Windows desktop" })).toBeNull()
		expect(screen.getByRole("heading", { name: "Signed-in devices" })).toHaveFocus()
		expect(screen.getByRole("button", { name: /Sign out of other devices/ })).toBeEnabled()
	})

	it("CommentThreadBlock posts a comment, and a reply to the comment chosen", () => {
		const onComment = vi.fn()
		const onLikeChange = vi.fn()
		render(<blocks.CommentThreadBlock onComment={onComment} onLikeChange={onLikeChange} />)
		const send = screen.getByRole("button", { name: "Comment" })
		expect(send).toBeDisabled()
		fireEvent.change(screen.getByRole("textbox", { name: "Add a comment" }), { target: { value: "Looks good." } })
		fireEvent.click(send)
		expect(onComment).toHaveBeenLastCalledWith({ text: "Looks good." })
		expect(screen.getByText("Looks good.")).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Reply to Kofi Mensah" }))
		const field = screen.getByRole("textbox", { name: "Reply to Kofi Mensah" })
		expect(field).toHaveFocus()
		fireEvent.change(field, { target: { value: "Thursday works." } })
		fireEvent.click(screen.getByRole("button", { name: "Reply" }))
		expect(onComment).toHaveBeenLastCalledWith({ text: "Thursday works.", replyTo: "c2" })
		fireEvent.click(screen.getAllByRole("button", { name: /^Like/ })[0])
		expect(onLikeChange).toHaveBeenCalledWith("c1", true)
	})

	it("RecentOrdersBlock filters by status and opens a row", async () => {
		const user = userEvent.setup()
		const onOpen = vi.fn()
		const onViewAll = vi.fn()
		render(<blocks.RecentOrdersBlock onOpen={onOpen} onViewAll={onViewAll} />)
		expect(screen.getByText("6 orders")).toBeInTheDocument()
		await user.click(screen.getByText("Sam Rivera"))
		expect(onOpen).toHaveBeenCalledWith("1047")
		await user.click(screen.getByRole("combobox", { name: "Filter by status" }))
		await user.click(await screen.findByRole("option", { name: "Refunded" }))
		expect(screen.getByText("1 order")).toBeInTheDocument()
		expect(screen.queryByText("Sam Rivera")).toBeNull()
		await user.click(screen.getByRole("button", { name: "View all orders" }))
		expect(onViewAll).toHaveBeenCalledOnce()
	})

	it("CitedAnswerBlock names each citation and reports the source opened", () => {
		const onOpen = vi.fn()
		render(<blocks.CitedAnswerBlock onOpen={onOpen} />)
		const citation = screen.getByRole("link", { name: "Source 2: When will I see my refund?" })
		expect(citation).toHaveAttribute("href", "https://help.atlas.example/refunds/cards")
		fireEvent.click(citation)
		expect(onOpen).toHaveBeenLastCalledWith("cards")
		fireEvent.click(screen.getByRole("link", { name: /^Store credit and gift cards/ }))
		expect(onOpen).toHaveBeenLastCalledWith("store")
	})

	it("InviteTeamBlock sends the typed address", () => {
		const onSend = vi.fn()
		render(<blocks.InviteTeamBlock onSend={onSend} />)
		fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "ada@studio.com" } })
		fireEvent.click(screen.getByRole("button", { name: "Send" }))
		expect(onSend).toHaveBeenCalledWith("ada@studio.com")
	})

	it("FeedbackFormBlock reports skip and send as two callbacks", () => {
		const onSkip = vi.fn()
		const onSend = vi.fn()
		render(<blocks.FeedbackFormBlock onSkip={onSkip} onSend={onSend} />)
		fireEvent.click(screen.getByRole("button", { name: "Skip" }))
		expect(onSkip).toHaveBeenCalledOnce()
		expect(onSend).not.toHaveBeenCalled()
		fireEvent.click(screen.getByRole("button", { name: "Send feedback" }))
		expect(onSend).toHaveBeenCalledWith({ score: 4, notes: "" })
	})

	it("EventCardBlock reports join and decline as two callbacks", () => {
		const onJoin = vi.fn()
		const onDecline = vi.fn()
		render(<blocks.EventCardBlock onJoin={onJoin} onDecline={onDecline} />)
		fireEvent.click(screen.getByRole("button", { name: "Decline" }))
		fireEvent.click(screen.getByRole("button", { name: "Join" }))
		expect(onDecline).toHaveBeenCalledOnce()
		expect(onJoin).toHaveBeenCalledOnce()
	})

	it("PricingTableBlock reports the choice as one object", () => {
		const onChoose = vi.fn()
		render(<blocks.PricingTableBlock onChoose={onChoose} />)
		fireEvent.click(screen.getByRole("button", { name: "Start free trial" }))
		expect(onChoose).toHaveBeenCalledWith({ tier: expect.any(String), period: expect.any(String) })
	})

	it("NotificationSettingsBlock reports the row and its new state", () => {
		const onSettingChange = vi.fn()
		render(<blocks.NotificationSettingsBlock onSettingChange={onSettingChange} />)
		const first = screen.getAllByRole("switch")[0]
		const was = first.getAttribute("aria-checked") === "true"
		fireEvent.click(first)
		expect(onSettingChange).toHaveBeenCalledWith(expect.any(String), !was)
	})

	it("DeviceComparisonBlock plots the series whose tile is pressed", () => {
		render(<blocks.DeviceComparisonBlock />)
		const desktop = screen.getByRole("button", { name: /^Desktop/ })
		const mobile = screen.getByRole("button", { name: /^Mobile/ })
		expect(desktop).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("group", { name: "Desktop visitors per day, last 30 days" })).toBeInTheDocument()
		fireEvent.click(mobile)
		expect(mobile).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("group", { name: "Mobile visitors per day, last 30 days" })).toBeInTheDocument()
		// Pressing the plotted tile again keeps it: the chart always shows a series.
		fireEvent.click(mobile)
		expect(mobile).toHaveAttribute("aria-pressed", "true")
	})

	/*
	 * Card titles are headings, so a dashboard of blocks can be navigated by
	 * heading. A source check: CardTitle is a div by default, and the rule is
	 * one `render`, easy to forget on the next block. A figure in the title
	 * slot (a balance, a stat) is a value, not a name, and stays a div.
	 */
	it("renders every card block's CardTitle as a heading", () => {
		const files = readdirSync(__dirname).filter((file) => file.endsWith("-block.tsx"))
		expect(files.length).toBeGreaterThan(40)
		const bare: string[] = []
		for (const file of files) {
			const source = readFileSync(resolve(__dirname, file), "utf8")
			for (const tag of source.match(/<CardTitle\b[^>]*>/g) ?? []) {
				if (!/render=\{<h[2-6]/.test(tag) && !/text-mono-/.test(tag)) bare.push(`${file}: ${tag}`)
			}
		}
		expect(bare).toEqual([])
	})
})
