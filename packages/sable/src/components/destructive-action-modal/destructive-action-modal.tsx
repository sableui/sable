"use client";

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "../button"
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../dialog"
import { Code } from "../code"
import { Field } from "../form"
import { Input } from "../input"

export interface DestructiveActionModalProps {
	/** Controlled open state. */
	open: boolean
	/**
	 * Called when the open state should change (Esc, Cancel, or confirm). A click
	 * on the backdrop does not dismiss — this is an alert dialog.
	 */
	onOpenChange: (open: boolean) => void
	/** Modal heading — names the irreversible action. */
	title: ReactNode
	/** Optional supporting copy explaining the consequence. */
	description?: ReactNode
	/** Label for the destructive confirm button. */
	confirmLabel?: string
	/** Label for the dismissing secondary button. */
	cancelLabel?: string
	/**
	 * Called when the user confirms. If it returns a Promise, the modal tracks an
	 * in-flight state (spinner + disabled confirm/cancel) and closes on resolve,
	 * staying open on reject so the user can retry. If it returns void, the modal
	 * closes immediately — unless `pending` is controlled externally, in which
	 * case the parent owns closing (flip `open`).
	 */
	onConfirm: () => void | Promise<void>
	/**
	 * Externally-driven in-flight state. When provided, it overrides the modal's
	 * internal await tracking and the parent owns closing (the modal stays open on
	 * a synchronous confirm). Use when the mutation/pending state lives in a hook.
	 */
	pending?: boolean
	/** Confirm-button label while in flight. @default confirmLabel */
	confirmingLabel?: string
	/**
	 * Body content rendered between the description and the type-to-confirm Input /
	 * footer — e.g. a warning `<Note>` detailing the consequences.
	 */
	children?: ReactNode
	/**
	 * When set, renders a confirmation Input. The destructive Button stays
	 * disabled until the typed value exactly matches this string — a guard for
	 * high-stakes deletions (e.g. type the post title to delete it).
	 */
	confirmText?: string
}

/**
 * DestructiveActionModal — a confirmation modal for irreversible actions,
 * composed from Sable's AlertDialog (role="alertdialog"; the backdrop does not
 * dismiss — only Cancel, Esc, or the confirm action close it). The footer pairs
 * a secondary Cancel with a destructive confirm Button, and focus opens on
 * Cancel so a stray Enter can never fire the irreversible action. Pass `confirmText` to require type-to-confirm:
 * the confirm Button stays disabled until the user types the exact string.
 */
export function DestructiveActionModal({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Delete",
	cancelLabel = "Cancel",
	onConfirm,
	pending,
	confirmingLabel,
	children,
	confirmText,
}: DestructiveActionModalProps) {
	const [typed, setTyped] = useState("")
	const [internalBusy, setInternalBusy] = useState(false)
	// Synchronous re-entrancy guard: the `busy` state lags a render behind, so a
	// fast double-click could fire onConfirm twice before the button disables.
	const inFlight = useRef(false)
	// Initial focus goes to Cancel — the safe action — not the first tabbable
	// element (which would be the type-to-confirm Input when present).
	const cancelRef = useRef<HTMLButtonElement>(null)

	// `pending`, when supplied, is the source of truth; otherwise we track the
	// in-flight state of an awaited onConfirm ourselves.
	const controlledPending = pending !== undefined
	const busy = pending ?? internalBusy

	// Reset the type-to-confirm field whenever the modal closes so a reopen
	// starts clean.
	useEffect(() => {
		if (!open) {
			setTyped("")
		}
	}, [open])

	const requiresMatch = typeof confirmText === "string" && confirmText.length > 0
	const matched = !requiresMatch || typed === confirmText

	async function handleConfirm() {
		if (!matched || busy || inFlight.current) {
			return
		}
		inFlight.current = true
		try {
			const result = onConfirm()
			// When `pending` is controlled, the parent owns the in-flight state AND
			// closing (it flips `open`) — the modal must not auto-close or track busy.
			if (controlledPending) {
				return
			}
			if (result instanceof Promise) {
				setInternalBusy(true)
				try {
					await result
					setInternalBusy(false)
					onOpenChange(false)
				} catch {
					// Stay open so the user can retry or cancel.
					setInternalBusy(false)
				}
			} else {
				// Uncontrolled + synchronous confirm: close immediately (legacy behavior).
				onOpenChange(false)
			}
		} finally {
			inFlight.current = false
		}
	}

	// Block Esc dismissal while a confirm is in flight. (The backdrop never
	// dismisses: AlertDialog disables pointer dismissal.)
	function handleOpenChange(next: boolean) {
		if (busy && !next) {
			return
		}
		onOpenChange(next)
	}

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogContent initialFocus={cancelRef}>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description ? (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					) : null}
				</AlertDialogHeader>

				{/* The body — consequence copy, then the type-to-confirm field —
				    stacked with a gap, so a warning Note never sits flush against
				    the field below it. Rendered only when there is a body. */}
				{children != null || requiresMatch ? (
					<div className="flex flex-col gap-4">
						{children}
						{requiresMatch ? (
							<Field
								label={
									<>
										Type <Code>{confirmText}</Code> to confirm
									</>
								}
							>
								<Input
									value={typed}
									onChange={(event) => setTyped(event.target.value)}
									placeholder={confirmText}
									autoComplete="off"
									autoCapitalize="off"
									spellCheck={false}
								/>
							</Field>
						) : null}
					</div>
				) : null}

				<AlertDialogFooter>
					<AlertDialogClose
						render={
							<Button ref={cancelRef} variant="secondary" disabled={busy}>
								{cancelLabel}
							</Button>
						}
					/>
					<Button
						variant="destructive"
						loading={busy}
						loadingLabel={confirmingLabel ?? confirmLabel}
						disabled={!matched}
						onClick={handleConfirm}
					>
						{confirmLabel}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
DestructiveActionModal.displayName = "DestructiveActionModal"
