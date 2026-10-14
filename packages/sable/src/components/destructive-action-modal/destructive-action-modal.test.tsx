import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor } from "../../test/render"
import {
	DestructiveActionModal,
	type DestructiveActionModalProps,
} from "./destructive-action-modal"

type HarnessProps = Partial<DestructiveActionModalProps> &
	Pick<DestructiveActionModalProps, "onConfirm">

function Harness({ onConfirm, children, ...props }: HarnessProps) {
	const [open, setOpen] = useState(true)
	return (
		<DestructiveActionModal
			open={open}
			onOpenChange={setOpen}
			title="Delete?"
			onConfirm={onConfirm}
			{...props}
		>
			{children}
		</DestructiveActionModal>
	)
}

describe("DestructiveActionModal", () => {
	it("renders a children body slot between the header and footer", () => {
		renderWithProviders(
			<Harness onConfirm={() => {}}>
				<p>Shared copies stay with your team.</p>
			</Harness>,
		)
		expect(
			screen.getByText("Shared copies stay with your team."),
		).toBeInTheDocument()
	})

	it("closes immediately on a synchronous confirm", async () => {
		const user = userEvent.setup()
		const onConfirm = vi.fn()
		renderWithProviders(<Harness onConfirm={onConfirm} confirmLabel="Delete" />)
		await user.click(screen.getByRole("button", { name: "Delete" }))
		expect(onConfirm).toHaveBeenCalledOnce()
		await waitFor(() =>
			expect(screen.queryByText("Delete?")).not.toBeInTheDocument(),
		)
	})

	it("shows a pending state and closes after an async confirm resolves", async () => {
		const user = userEvent.setup()
		let resolve: () => void = () => {}
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((r) => {
					resolve = r
				}),
		)
		renderWithProviders(
			<Harness
				onConfirm={onConfirm}
				confirmLabel="Delete"
				confirmingLabel="Deleting…"
			/>,
		)
		await user.click(screen.getByRole("button", { name: "Delete" }))
		expect(onConfirm).toHaveBeenCalledOnce()

		// Pending: the confirm button swaps to the confirming label and refuses
		// presses (aria-disabled, so it keeps focus).
		const confirming = await screen.findByText("Deleting…")
		expect(confirming.closest("button")).toHaveAttribute("aria-disabled", "true")

		resolve()
		await waitFor(() =>
			expect(screen.queryByText("Delete?")).not.toBeInTheDocument(),
		)
	})

	it("stays open when an async confirm rejects", async () => {
		const user = userEvent.setup()
		let reject: (reason?: unknown) => void = () => {}
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((_, rj) => {
					reject = rj
				}),
		)
		renderWithProviders(<Harness onConfirm={onConfirm} confirmLabel="Delete" />)
		await user.click(screen.getByRole("button", { name: "Delete" }))

		reject(new Error("failed"))

		// The modal remains mounted and the confirm button re-enables.
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled(),
		)
		expect(screen.getByText("Delete?")).toBeInTheDocument()
	})

	it("keeps the confirm disabled until the type-to-confirm text matches", async () => {
		const user = userEvent.setup()
		const onConfirm = vi.fn()
		renderWithProviders(
			<Harness
				onConfirm={onConfirm}
				confirmLabel="Delete"
				confirmText="gold rush"
			/>,
		)
		const confirm = screen.getByRole("button", { name: "Delete" })
		expect(confirm).toBeDisabled()

		await user.type(screen.getByRole("textbox"), "gold rush")
		expect(confirm).toBeEnabled()
	})

	it("is an alert dialog with focus opening on Cancel", async () => {
		renderWithProviders(<Harness onConfirm={() => {}} />)
		const dialog = await screen.findByRole("alertdialog")
		expect(dialog).toHaveAccessibleName("Delete?")
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
		)
	})

	it("opens focus on Cancel even when a type-to-confirm Input comes first", async () => {
		renderWithProviders(
			<Harness onConfirm={() => {}} confirmText="gold rush" />,
		)
		await screen.findByRole("alertdialog")
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus(),
		)
	})

	it("does not dismiss on an outside click", async () => {
		const user = userEvent.setup()
		const onOpenChange = vi.fn()
		renderWithProviders(
			<DestructiveActionModal
				open
				onOpenChange={onOpenChange}
				title="Delete?"
				onConfirm={() => {}}
			/>,
		)
		await screen.findByRole("alertdialog")
		await user.click(document.body)
		expect(onOpenChange).not.toHaveBeenCalled()
		expect(screen.getByRole("alertdialog")).toBeInTheDocument()
	})

	it("dismisses on Esc and on Cancel", async () => {
		const user = userEvent.setup()
		const onOpenChange = vi.fn()
		renderWithProviders(
			<DestructiveActionModal
				open
				onOpenChange={onOpenChange}
				title="Delete?"
				onConfirm={() => {}}
			/>,
		)
		await screen.findByRole("alertdialog")
		await user.keyboard("{Escape}")
		expect(onOpenChange).toHaveBeenLastCalledWith(false)
		onOpenChange.mockClear()
		await user.click(screen.getByRole("button", { name: "Cancel" }))
		expect(onOpenChange).toHaveBeenLastCalledWith(false)
	})
})
