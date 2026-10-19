import { act, render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { type ReactNode, useRef, useState } from "react"
import { describe, expect, it } from "vitest"
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogTitle,
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "./index"

/**
 * Focus return without a DialogTrigger. An app that opens a dialog from its own
 * button through controlled `open` used to lose focus to <body> on close
 * whenever something inside the dialog focused itself on mount (an autoFocus
 * field, CommandMenu's search box): Base UI records the "previous" element after
 * the popup commits, by which time that field already holds focus.
 */

/** Let Base UI's queued focus moves run. */
async function settle() {
	await act(async () => {})
}

function OwnButton({ autoFocus = false, finalFocusOther = false }: { autoFocus?: boolean; finalFocusOther?: boolean }) {
	const [open, setOpen] = useState(false)
	const other = useRef<HTMLButtonElement>(null)
	return (
		<>
			<button type="button" ref={other}>
				Elsewhere
			</button>
			<button type="button" onClick={() => setOpen(true)}>
				Edit profile
			</button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent finalFocus={finalFocusOther ? other : undefined}>
					<DialogTitle>Edit profile</DialogTitle>
					{/* biome-ignore lint/a11y/noAutofocus: the case under test */}
					<input aria-label="Name" autoFocus={autoFocus} />
					<DialogClose render={<button type="button">Done</button>} />
				</DialogContent>
			</Dialog>
		</>
	)
}

async function openAndClose(opener: string, close = "Done", role: "dialog" | "alertdialog" = "dialog") {
	const user = userEvent.setup()
	await user.click(screen.getByRole("button", { name: "Elsewhere" }))
	await user.click(screen.getByRole("button", { name: opener }))
	await screen.findByRole(role)
	await settle()
	await user.click(screen.getByRole("button", { name: close }))
	await waitFor(() => expect(screen.queryByRole(role)).toBeNull())
	await settle()
}

describe("Dialog focus return", () => {
	it("returns focus to your own button when opened through controlled open", async () => {
		render(<OwnButton />)
		await openAndClose("Edit profile")
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit profile" }))
	})

	it("returns focus to the opener even when a field inside autofocuses", async () => {
		render(<OwnButton autoFocus />)
		await openAndClose("Edit profile")
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit profile" }))
	})

	it("honours an explicit finalFocus over the opener", async () => {
		render(<OwnButton autoFocus finalFocusOther />)
		await openAndClose("Edit profile")
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Elsewhere" }))
	})

	it("still returns to a DialogTrigger", async () => {
		render(
			<>
				<button type="button">Elsewhere</button>
				<Dialog>
					<DialogTrigger render={<button type="button">Open</button>} />
					<DialogContent>
						<DialogTitle>T</DialogTitle>
						{/* biome-ignore lint/a11y/noAutofocus: the case under test */}
						<input aria-label="Name" autoFocus />
						<DialogClose render={<button type="button">Done</button>} />
					</DialogContent>
				</Dialog>
			</>,
		)
		await openAndClose("Open")
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open" }))
	})

	it("AlertDialog returns focus to your own button too", async () => {
		function Confirm() {
			const [open, setOpen] = useState(false)
			return (
				<>
					<button type="button">Elsewhere</button>
					<button type="button" onClick={() => setOpen(true)}>
						Delete
					</button>
					<AlertDialog open={open} onOpenChange={setOpen}>
						<AlertDialogContent>
							<AlertDialogTitle>Delete project?</AlertDialogTitle>
							{/* biome-ignore lint/a11y/noAutofocus: the case under test */}
							<input aria-label="Type the name" autoFocus />
							<AlertDialogClose render={<button type="button">Cancel</button>} />
						</AlertDialogContent>
					</AlertDialog>
				</>
			)
		}
		render(<Confirm />)
		await openAndClose("Delete", "Cancel", "alertdialog")
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete" }))
	})
})

function Draft({ keepMounted, children }: { keepMounted?: boolean; children?: ReactNode }) {
	const [open, setOpen] = useState(false)
	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Compose
			</button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent keepMounted={keepMounted}>
					<DialogTitle>New message</DialogTitle>
					<textarea aria-label="Message" />
					{children}
					<DialogClose render={<button type="button">Close</button>} />
				</DialogContent>
			</Dialog>
		</>
	)
}

describe("DialogContent keepMounted", () => {
	async function writeCloseReopen() {
		const user = userEvent.setup()
		await user.click(screen.getByRole("button", { name: "Compose" }))
		await user.type(await screen.findByRole("textbox", { name: "Message" }), "Half a thought")
		await user.click(screen.getByRole("button", { name: "Close" }))
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
		await user.click(screen.getByRole("button", { name: "Compose" }))
		return screen.findByRole("textbox", { name: "Message" })
	}

	it("keeps a draft across close and reopen", async () => {
		render(<Draft keepMounted />)
		expect(await writeCloseReopen()).toHaveValue("Half a thought")
	})

	it("hides the kept content while closed", async () => {
		const user = userEvent.setup()
		render(<Draft keepMounted />)
		await user.click(screen.getByRole("button", { name: "Compose" }))
		await screen.findByRole("dialog")
		await user.click(screen.getByRole("button", { name: "Close" }))
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
		// Still in the DOM, out of the accessibility tree and the tab order.
		const kept = screen.getByRole("dialog", { hidden: true })
		expect(kept).toHaveAttribute("hidden")
	})

	it("starts fresh by default", async () => {
		render(<Draft />)
		expect(await writeCloseReopen()).toHaveValue("")
	})
})
