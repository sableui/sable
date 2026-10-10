import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { Button } from "../button"
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogTrigger,
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "./index"

/**
 * Every way a Dialog can be closed, because a consuming app reported that Close
 * "doesn't work" and the diagnosis pointed here. It did not hold up: the docs app
 * closes fine on real input, and all three paths below pass. Kept as a regression
 * test so the controlled path — an app driving `open` from its own state, with no
 * DialogTrigger anywhere — stays covered, since that is the shape that was
 * suspected and the one no existing test touched.
 */
describe("dialog close paths", () => {
	it("uncontrolled + trigger: DialogClose closes", async () => {
		render(
			<Dialog>
				<DialogTrigger render={<button type="button">Open</button>} />
				<DialogContent title="T">
					<DialogClose render={<Button>Close</Button>} />
				</DialogContent>
			</Dialog>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		expect(await screen.findByRole("dialog")).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Close" }))
		expect(screen.queryByRole("dialog")).toBeNull()
	})

	it("CONTROLLED, no trigger: DialogClose fires onOpenChange(false)", async () => {
		// This is Glitch's exact shape: <Dialog open={open} onOpenChange={…}> with
		// no DialogTrigger anywhere. Nothing ever opened it via a pointer.
		const onOpenChange = vi.fn()
		render(
			<Dialog open onOpenChange={onOpenChange}>
				<DialogContent title="T">
					<DialogClose render={<Button>Cancel</Button>} />
				</DialogContent>
			</Dialog>,
		)
		expect(await screen.findByRole("dialog")).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
		expect(onOpenChange).toHaveBeenCalledTimes(1)
		expect(onOpenChange.mock.calls[0][0]).toBe(false)
	})

	it("CONTROLLED + state: the dialog actually unmounts", async () => {
		function Harness() {
			const [open, setOpen] = useState(true)
			return (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent title="T">
						<DialogClose render={<Button>Cancel</Button>} />
					</DialogContent>
				</Dialog>
			)
		}
		render(<Harness />)
		expect(await screen.findByRole("dialog")).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
		expect(screen.queryByRole("dialog")).toBeNull()
	})
})

describe("outside click: Dialog dismisses, AlertDialog does not", () => {
	it("Dialog closes on a click outside the popup", async () => {
		const onOpenChange = vi.fn()
		render(
			<Dialog open onOpenChange={onOpenChange}>
				<DialogContent>Body</DialogContent>
			</Dialog>,
		)
		expect(await screen.findByRole("dialog")).toBeInTheDocument()
		await userEvent.click(document.body)
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
	})

	it("AlertDialog is role=alertdialog and ignores an outside click", async () => {
		const onOpenChange = vi.fn()
		render(
			<AlertDialog open onOpenChange={onOpenChange}>
				<AlertDialogContent>
					<AlertDialogTitle>Discard draft?</AlertDialogTitle>
					<AlertDialogClose render={<Button>Cancel</Button>} />
				</AlertDialogContent>
			</AlertDialog>,
		)
		expect(
			await screen.findByRole("alertdialog", { name: "Discard draft?" }),
		).toBeInTheDocument()
		await userEvent.click(document.body)
		expect(onOpenChange).not.toHaveBeenCalled()
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
		expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
	})

	it("AlertDialog opens from its trigger and closes on Esc", async () => {
		render(
			<AlertDialog>
				<AlertDialogTrigger render={<button type="button">Open</button>} />
				<AlertDialogContent>
					<AlertDialogTitle>Leave page?</AlertDialogTitle>
				</AlertDialogContent>
			</AlertDialog>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
		await userEvent.keyboard("{Escape}")
		expect(screen.queryByRole("alertdialog")).toBeNull()
	})
})
