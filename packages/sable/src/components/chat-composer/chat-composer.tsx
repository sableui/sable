"use client";

import type { ComponentPropsWithRef, FormEvent, KeyboardEvent, ReactNode } from "react"
import { useCallback, useRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { setRef } from "../../lib/refs"
import { Button } from "../button"
import { Textarea } from "../textarea"
import { chatComposerVariants } from "./chat-composer.variants"

export interface ChatComposerProps
	extends Omit<ComponentPropsWithRef<"form">, "onSubmit" | "defaultValue"> {
	/** Controlled value. Omit for an uncontrolled composer that owns its own text. */
	value?: string
	/** Initial value when uncontrolled. */
	defaultValue?: string
	/** Notified on every keystroke. Required when `value` is supplied. */
	onValueChange?: (value: string) => void
	/**
	 * Called with the trimmed message when the reader sends. An uncontrolled
	 * composer clears itself afterwards; a controlled one is the caller's to
	 * clear, since only they know whether the send succeeded.
	 */
	onSend?: (value: string) => void
	/** Placeholder for the field. @default "Send a message…" */
	placeholder?: string
	/**
	 * A reply is streaming. Disables send, and swaps it for a stop control when
	 * `onStop` is supplied.
	 * @default false
	 */
	busy?: boolean
	/** Interrupt the in-flight reply. Supplying it turns send into stop while busy. */
	onStop?: () => void
	/** Block sending entirely — over a length limit, disconnected, read-only thread. */
	disabled?: boolean
	/** Mark the current text invalid (too long, failed validation). */
	invalid?: boolean
	/** Attachment chips, shown above the field. */
	attachments?: ReactNode
	/** Controls on the left of the footer row — attach, model picker, tools. */
	leading?: ReactNode
	/** Extra controls left of the send button. */
	actions?: ReactNode
	/** Attach handler. Supplying it renders the built-in attach button in `leading`'s place. */
	onAttach?: () => void
	/** Accessible label for the field itself. @default "Message" */
	label?: string
	/** Accessible label for the send button. @default "Send message" */
	sendLabel?: string
	/** Accessible label for the stop button. @default "Stop generating" */
	stopLabel?: string
	/** Helper or counter text below the controls. */
	footer?: ReactNode
	/** Ref to the underlying textarea — for focusing after a send, or on mount. */
	fieldRef?: ComponentPropsWithRef<"textarea">["ref"]
}

/**
 * ChatComposer — the input half of a conversation.
 *
 * A single surface holding the field and its controls: attachments above,
 * text in the middle, affordances along the bottom. It grows with the message
 * and caps before it eats the transcript.
 *
 *   <ChatComposer onSend={send} busy={streaming} onStop={stop} onAttach={pick} />
 *
 * Works controlled or uncontrolled. Uncontrolled is the default because it is
 * what the common case wants and what lets a hook-free page shell (see the
 * ChatPanel pattern) ship a composer that actually types.
 *
 * The three details that are the whole job:
 *
 * - **Enter sends, Shift+Enter breaks the line** — and neither fires mid-IME.
 *   A Japanese, Chinese, or Korean reader confirming a candidate in the
 *   composition popup presses Enter to *choose a word*, and a composer that
 *   reads that as "send" mails half a sentence. `event.nativeEvent.isComposing`
 *   is the guard, and it is the single most commonly missed line in a chat input.
 * - **Whitespace never sends.** The send button is disabled until there is
 *   something to send, so the affordance and the behaviour agree.
 * - **Send becomes stop while busy**, in place, when `onStop` is given.
 *   Interrupting a long generation is the most common thing a reader wants
 *   during one, and it belongs where their cursor already is.
 */
export function ChatComposer({
	value,
	defaultValue = "",
	onValueChange,
	onSend,
	placeholder = "Send a message…",
	busy = false,
	onStop,
	disabled = false,
	invalid = false,
	attachments,
	leading,
	actions,
	onAttach,
	label = "Message",
	sendLabel = "Send message",
	stopLabel = "Stop generating",
	footer,
	fieldRef,
	className,
	children,
	...props
}: ChatComposerProps) {
	const tier = useTypeTier()
	const [internal, setInternal] = useState(defaultValue)
	const isControlled = value !== undefined
	const text = isControlled ? value : internal
	const field = useRef<HTMLTextAreaElement>(null)

	const setField = useCallback(
		(node: HTMLTextAreaElement | null) => {
			setRef(fieldRef, node)
			field.current = node
		},
		[fieldRef],
	)

	const setText = useCallback(
		(next: string) => {
			if (!isControlled) setInternal(next)
			onValueChange?.(next)
		},
		[isControlled, onValueChange],
	)

	const canSend = text.trim().length > 0 && !busy && !disabled

	const send = useCallback(() => {
		if (!canSend) return
		onSend?.(text.trim())
		// Only an uncontrolled composer clears itself. A controlled one belongs
		// to the caller, who is the only one who knows whether the send actually
		// went through — clearing on their behalf loses the message on a failure.
		if (!isControlled) setInternal("")
	}, [canSend, isControlled, onSend, text])

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			send()
		},
		[send],
	)

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key !== "Enter") return
			// Mid-composition Enter is "commit this candidate", not "send". Without
			// this guard every CJK reader sends a fragment of their first word.
			if (event.nativeEvent.isComposing) return
			if (event.shiftKey) return
			event.preventDefault()
			send()
		},
		[send],
	)

	const showStop = busy && Boolean(onStop)

	return (
		<form
			onSubmit={handleSubmit}
			className={cn(chatComposerVariants({ invalid }), className)}
			{...props}
		>
			{attachments ? (
				// The chips sit p-2 and a 1px border inside this box's corner, so
				// they take its radius less both (never under 4px) — concentric,
				// rather than their own rounded-md bulging against the curve.
				<div
					data-slot="chat-composer-attachments"
					className="flex flex-wrap items-start gap-2 [--attachment-radius:max(--spacing(1),calc(var(--chat-composer-r)-(--spacing(2))-1px))]"
				>
					{attachments}
				</div>
			) : null}

			<Textarea
				ref={setField}
				autoResize
				rows={1}
				aria-label={label}
				aria-invalid={invalid || undefined}
				disabled={disabled}
				placeholder={placeholder}
				value={text}
				onChange={(event) => setText(event.target.value)}
				onKeyDown={handleKeyDown}
				// The surface owns the border, the padding and the focus ring, so the
				// field inside it is stripped back to text. `max-h-40` is the cap that
				// stops a pasted essay from pushing the conversation off the screen.
				className={cn(
					// Inline padding puts the text on the attach glyph's edge: an
					// icon-sm button centres a 1.125rem glyph in --control-sm.
					"min-h-0 max-h-40 resize-none border-0 bg-transparent px-[calc((var(--control-sm)-1.125rem)/2)] py-1 focus-visible:ring-0",
					// What you type has to match what it becomes: the field and the
					// Bubble it turns into both read `prose`, so the message does not
					// change size the moment it is sent.
					tier.prose,
				)}
			/>

			<div className="flex items-center gap-2">
				{onAttach ? (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Add attachment"
						disabled={disabled}
						onClick={onAttach}
					>
						<Icon name="plus" />
					</Button>
				) : null}
				{leading}
				<div className="flex-1" />
				{actions}
				{showStop ? (
					<Button
						type="button"
						variant="secondary"
						size="icon-sm"
						aria-label={stopLabel}
						onClick={onStop}
					>
						{/* A filled square, the universal stop (xmark read as close or clear),
						    drawn smaller than the box so it sits in the button as a mark. */}
						<Icon name="stop" variant="solid" className="text-[0.75em]" />
					</Button>
				) : (
					// Busy without a stop handler: Button's own `loading` swaps the glyph
					// for its Spinner and keeps full colour, rather than a hand-spun icon.
					<Button
						type="submit"
						size="icon-sm"
						aria-label={sendLabel}
						disabled={!canSend}
						loading={busy}
					>
						<Icon name="arrow-up" />
					</Button>
				)}
			</div>

			{footer ? (
				<p className={cn("px-[calc((var(--control-sm)-1.125rem)/2)] text-muted-foreground", tier.secondary)}>
					{footer}
				</p>
			) : null}
			{children}
		</form>
	)
}
ChatComposer.displayName = "ChatComposer"
