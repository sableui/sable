import { userEvent } from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor, within } from "../../test/render"
import { toast, ToastProvider, useToast } from "./toast"

/**
 * The contract these protect is the one that was broken: the manager ACCEPTED
 * `actionProps` and the renderer never read it, so an action silently produced
 * no button. A type-level test cannot catch that — the prop type-checked all
 * along — so the assertion has to be that the button reaches the DOM.
 */

afterEach(() => {
	toast.dismiss()
})

function mount() {
	return renderWithProviders(<ToastProvider timeout={0} />)
}

describe("ToastViewport placement", () => {
	it("portals out of the provider's subtree", async () => {
		// Rendered in place, the fixed viewport anchored to any transformed
		// ancestor — a route's enter animation put the stack mid-page.
		const { container } = mount()
		toast("Saved")
		const row = (await screen.findByText("Saved")).closest("[role=dialog]") as HTMLElement
		expect(container.contains(row)).toBe(false)
		expect(document.body.contains(row)).toBe(true)
	})
})

describe("stacked", () => {
	it("pins the toasts to the anchored edge as a deck, and fades the cards behind", async () => {
		renderWithProviders(<ToastProvider timeout={0} stacked position="bottom-right" />)
		toast("First")
		toast("Second")
		const front = (await screen.findByText("Second")).closest("[role=dialog]") as HTMLElement
		// Grows up from a bottom anchor; jsdom has no layout, so the classes are the contract.
		expect(front.className).toContain("bottom-0")
		expect(front.className).toContain("[--toast-dir:-1]")
		const behind = screen.getByText("First").closest("[data-behind]") as HTMLElement
		expect(behind.className).toContain("data-behind:not-data-expanded:opacity-0")
	})

	it("leaves the list layout alone by default", async () => {
		mount()
		toast("Saved")
		const row = (await screen.findByText("Saved")).closest("[role=dialog]") as HTMLElement
		expect(row.className).not.toContain("[--toast-dir")
		expect(row.parentElement?.className).toContain("flex-col")
	})
})

describe("ToastList actions", () => {
	it("renders the action a toast was given", async () => {
		mount()
		toast("Layer deleted", {
			actionProps: { children: "Undo", onClick: vi.fn() },
		})
		expect(await screen.findByRole("button", { name: "Undo" })).toBeVisible()
	})

	it("runs the action's own handler on click", async () => {
		const onClick = vi.fn()
		mount()
		toast("Layer deleted", { actionProps: { children: "Undo", onClick } })

		await userEvent.click(await screen.findByRole("button", { name: "Undo" }))
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it("leaves dismissal to the handler rather than closing on its own", async () => {
		// Base UI's Action does not close the toast, and neither do we: an action
		// that opens a confirmation would lose the toast it was confirming. The doc
		// comment on ToastProvider says to call toast.dismiss(id) — this pins the
		// behaviour that instruction describes.
		mount()
		toast("Layer deleted", { actionProps: { children: "Undo" } })

		await userEvent.click(await screen.findByRole("button", { name: "Undo" }))
		expect(screen.getByText("Layer deleted")).toBeVisible()
	})

	it("renders no action button for a toast without one", async () => {
		mount()
		toast("Saved")
		const title = await screen.findByText("Saved")
		// The close control is the only button on a plain toast. Base UI's Action
		// returns null without children, which is what makes mounting it on every
		// toast free. `hidden: true` because Base UI keeps the close button out of
		// the accessibility tree until the toast is focused — the toast itself is
		// the announced element, and that is Base UI's call, not ours.
		const row = title.closest("[role=dialog]") as HTMLElement
		const buttons = within(row).getAllByRole("button", { hidden: true })
		expect(buttons).toHaveLength(1)
		expect(buttons[0]).toHaveAttribute("aria-label", "Dismiss")
	})

	it("keeps the action reachable alongside the description and close", async () => {
		mount()
		toast("Recovered work from 14:02", {
			description: "An autosave from this session was found.",
			actionProps: { children: "Restore" },
		})

		const action = await screen.findByRole("button", { name: "Restore" })
		expect(action).toBeVisible()
		expect(
			screen.getByText("An autosave from this session was found."),
		).toBeVisible()

		// Action then close, in that order — the dismiss control stays last so it
		// does not sit between the copy and the thing the copy asks you to do.
		const row = action.closest("[role=dialog]") as HTMLElement
		const buttons = within(row).getAllByRole("button", { hidden: true })
		expect(buttons).toHaveLength(2)
		expect(buttons[0]).toHaveTextContent("Restore")
		expect(buttons[1]).toHaveAttribute("aria-label", "Dismiss")
	})

	it("carries the action through toast.success and the other typed helpers", async () => {
		mount()
		toast.success("Exported", { actionProps: { children: "Show file" } })
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Show file" })).toBeVisible(),
		)
	})
})

/**
 * The persistence defaults. The bug these pin: only `loading` defaulted to
 * `timeout: 0`, so a failure the reader looked away from was gone, and an Undo —
 * the only path to that affordance — left on a schedule. That is data loss on a
 * timer, and no assertion about the timer's *duration* catches it.
 *
 * The resolved timeout lives on the manager's toast object, so a probe reading
 * it asserts the precedence exactly, with no clock in the loop. `undefined`
 * means "the toast named none" — it inherits the provider's default and
 * auto-dismisses, which the behavioural tests below confirm end to end.
 */
function TimeoutProbe() {
	const { toasts } = useToast()
	return (
		<ul>
			{toasts.map((item) => (
				<li key={item.id} data-testid="probe" data-timeout={String(item.timeout)}>
					probe
				</li>
			))}
		</ul>
	)
}

async function resolvedTimeout(push: () => void): Promise<string | null> {
	renderWithProviders(
		<ToastProvider>
			<TimeoutProbe />
		</ToastProvider>,
	)
	push()
	return (await screen.findByTestId("probe")).getAttribute("data-timeout")
}

describe("toast persistence defaults", () => {
	it("keeps an error toast until it is dismissed", async () => {
		expect(await resolvedTimeout(() => toast.error("Upload failed"))).toBe("0")
	})

	it("keeps a toast carrying an action until it is dismissed", async () => {
		const timeout = await resolvedTimeout(() =>
			toast("Post archived", { actionProps: { children: "Undo" } }),
		)
		expect(timeout).toBe("0")
	})

	it("keeps an action-carrying toast of any type, not just the neutral one", async () => {
		const timeout = await resolvedTimeout(() =>
			toast.success("Exported", { actionProps: { children: "Show file" } }),
		)
		expect(timeout).toBe("0")
	})

	it("still keeps a loading toast until it is updated or dismissed", async () => {
		expect(await resolvedTimeout(() => toast.loading("Pinning…"))).toBe("0")
	})

	it("leaves a plain info toast on the provider's auto-dismiss default", async () => {
		// No per-toast timeout at all — the provider's value applies, which is what
		// makes the toast transient.
		expect(await resolvedTimeout(() => toast.info("Copied"))).toBe("undefined")
	})

	it("leaves a neutral toast with no action on the provider's default", async () => {
		expect(await resolvedTimeout(() => toast("Saved"))).toBe("undefined")
	})

	it("lets an explicit timeout override the error default", async () => {
		const timeout = await resolvedTimeout(() =>
			toast.error("Upload failed", { timeout: 8000 }),
		)
		expect(timeout).toBe("8000")
	})

	it("lets an explicit timeout override the action default", async () => {
		const timeout = await resolvedTimeout(() =>
			toast("Post archived", {
				timeout: 6000,
				actionProps: { children: "Undo" },
			}),
		)
		expect(timeout).toBe("6000")
	})

	it("lets an explicit timeout override the loading default", async () => {
		const timeout = await resolvedTimeout(() =>
			toast.loading("Pinning…", { timeout: 9000 }),
		)
		expect(timeout).toBe("9000")
	})

	it("honours an explicit 0 on a toast that would not otherwise persist", async () => {
		// The guard reads `timeout === undefined`, not falsiness — an explicit 0
		// must survive rather than be treated as "no value given".
		const timeout = await resolvedTimeout(() =>
			toast.success("Saved", { timeout: 0 }),
		)
		expect(timeout).toBe("0")
	})
})

describe("toast persistence, end to end", () => {
	it("auto-dismisses a plain toast but not an error or an action", async () => {
		renderWithProviders(<ToastProvider timeout={50} />)
		toast.info("Copied")
		toast.error("Upload failed")
		toast("Post archived", { actionProps: { children: "Undo" } })

		expect(await screen.findByText("Copied")).toBeVisible()
		await waitFor(() => expect(screen.queryByText("Copied")).toBeNull())

		// The two that carry consequence are still on screen after the transient
		// one has come and gone.
		expect(screen.getByText("Upload failed")).toBeVisible()
		expect(screen.getByText("Post archived")).toBeVisible()
	})
})

describe("useToast().add persistence", () => {
	function HookAdder({ options }: { options: Parameters<ReturnType<typeof useToast>["add"]>[0] }) {
		const manager = useToast()
		return (
			<button type="button" onClick={() => manager.add(options)}>
				add
			</button>
		)
	}

	it("keeps an action-carrying toast added through the hook until dismissed", async () => {
		renderWithProviders(
			<ToastProvider>
				<HookAdder options={{ title: "Layer deleted", actionProps: { children: "Undo" } }} />
				<TimeoutProbe />
			</ToastProvider>,
		)
		await userEvent.click(screen.getByRole("button", { name: "add" }))
		expect((await screen.findByTestId("probe")).getAttribute("data-timeout")).toBe("0")
	})

	it("still lets an explicit timeout win on the hook path", async () => {
		renderWithProviders(
			<ToastProvider>
				<HookAdder options={{ title: "Layer deleted", actionProps: { children: "Undo" }, timeout: 4000 }} />
				<TimeoutProbe />
			</ToastProvider>,
		)
		await userEvent.click(screen.getByRole("button", { name: "add" }))
		expect((await screen.findByTestId("probe")).getAttribute("data-timeout")).toBe("4000")
	})
})

describe("stacked, beside an open Sheet", () => {
	it("marks stacked toasts so styles.css can re-anchor them when the stack moves edge", async () => {
		renderWithProviders(<ToastProvider timeout={0} stacked position="bottom-right" />)
		toast("Added to cart")
		const row = (await screen.findByText("Added to cart")).closest("[role=dialog]") as HTMLElement
		expect(row).toHaveAttribute("data-sable-toast-stacked")
		expect(row.closest("[data-sable-toast-viewport]")).toHaveAttribute("data-position", "bottom-right")
	})
})

describe("status glyph", () => {
	it("leads each typed toast with its tone's glyph, blooming in", async () => {
		mount()
		toast.success("Exported")
		toast.error("Payment failed")
		// The status glyph, not the dismiss button's xmark.
		const glyphOf = async (text: string) =>
			((await screen.findByText(text)).closest("[role=dialog]") as HTMLElement).querySelector(
				"[data-icon]:not([data-icon=xmark])",
			) as HTMLElement
		const success = await glyphOf("Exported")
		expect(success).toHaveAttribute("data-icon", "circle-check")
		expect(success).toHaveClass("text-success")
		expect(success.parentElement).toHaveClass("motion-bloom")
		// The same glyph and ink as Note and InlineStatus, not a colour bar.
		expect(await glyphOf("Payment failed")).toHaveClass("text-destructive")
	})

	it("draws no glyph for a neutral toast", async () => {
		mount()
		toast("Saved")
		const row = (await screen.findByText("Saved")).closest("[role=dialog]") as HTMLElement
		expect(row.querySelector("[data-icon]:not([data-icon=xmark])")).toBeNull()
	})
})
