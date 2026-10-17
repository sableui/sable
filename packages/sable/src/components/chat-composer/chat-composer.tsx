"use client";

import type { ComponentPropsWithRef, FormEvent, KeyboardEvent, ReactNode } from "react"
import { useCallback, useRef, useState, useSyncExternalStore } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { setRef } from "../../lib/refs"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { Button } from "../button"
import { Textarea } from "../textarea"
import { chatComposerVariants } from "./chat-composer.variants"
import { useEasedGrowth } from "./use-eased-growth"

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
	 * clear, since only they know whether the send succeeded. With `allowEmpty`
	 * the message can be `""`.
	 */
	onSend?: (value: string) => void
	/**
	 * Let the reader send with no text, because the app has something else to
	 * send — pending attachments, a picked file. Pass it only while that is true
	 * (`allowEmpty={files.length > 0}`), or send is enabled with nothing to send.
	 * `onSend` then receives `""`.
	 * @default false
	 */
	allowEmpty?: boolean
	/** Placeholder for the field. @default "Send a message…" */
	placeholder?: string
	/**
	 * Which key sends. `enter` for chat: Enter sends, Shift+Enter breaks the line.
	 * `mod-enter` for long-form replies (an email, a support answer): Enter breaks
	 * the line and ⌘/Ctrl+Enter sends, so a paragraph break never mails a draft.
	 * On a touch device (`pointer: coarse`) `enter` behaves as `mod-enter`: the
	 * soft keyboard's Return breaks the line and the send button sends.
	 * @default "enter"
	 */
	sendOn?: "enter" | "mod-enter"
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
	/**
	 * Helper or counter text below the controls. A function receives the send
	 * key in effect, so a keyboard hint stays true on touch, where `enter`
	 * becomes `mod-enter`; return null and the row goes away.
	 */
	footer?: ReactNode | ((state: { sendOn: "enter" | "mod-enter" }) => ReactNode)
	/** Ref to the underlying textarea — for focusing after a send, or on mount. */
	fieldRef?: ComponentPropsWithRef<"textarea">["ref"]
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. Under `subtle` the field snaps to its new height and the send and
	 * stop glyphs fade rather than morph.
	 */
	motion?: MotionLevel
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
 * - **Enter sends, Shift+Enter breaks the line** (or, with `sendOn="mod-enter"`,
 *   Enter breaks it and ⌘/Ctrl+Enter sends) — and neither fires mid-IME. On
 *   a touch device Return always breaks the line: a soft keyboard has no
 *   Shift+Return, so Enter-to-send would leave no way to write a second line.
 *   A Japanese, Chinese, or Korean reader confirming a candidate in the
 *   composition popup presses Enter to *choose a word*, and a composer that
 *   reads that as "send" mails half a sentence. `event.nativeEvent.isComposing`
 *   is the guard, and it is the single most commonly missed line in a chat input.
 *   An Enter that something else already handled (`preventDefault()`) does not
 *   send either: that is how a CaretMenu on `fieldRef` picks a suggestion.
 * - **Whitespace never sends.** The send button is disabled until there is
 *   something to send, so the affordance and the behaviour agree. When the
 *   something is a file rather than text, the app says so with `allowEmpty`.
 * - **Send becomes stop while busy**, in place, when `onStop` is given.
 *   Interrupting a long generation is the most common thing a reader wants
 *   during one, and it belongs where their cursor already is.
 */
export function ChatComposer({
	value,
	defaultValue = "",
	onValueChange,
	onSend,
	allowEmpty = false,
	placeholder = "Send a message…",
	sendOn = "enter",
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
	motion,
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

	const coarse = useCoarsePointer()
	// A soft keyboard has one Return key and no Shift+Return, so on touch Enter
	// must break the line and the button sends. ⌘/Ctrl+Enter still sends, for a
	// tablet with a hardware keyboard. This is `mod-enter`, which keeps the key
	// handler and aria-keyshortcuts describing the same behaviour.
	const mode = coarse ? "mod-enter" : sendOn
	const footerContent = typeof footer === "function" ? footer({ sendOn: mode }) : footer

	const canSend = (allowEmpty || text.trim().length > 0) && !busy && !disabled

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
			// Something earlier already took this Enter: a CaretMenu choosing the
			// highlighted suggestion, or an app's own listener on `fieldRef`. That
			// is the extension point — whoever handles Enter first and calls
			// preventDefault() owns it, and the composer does not also send.
			if (event.defaultPrevented) return
			if (mode === "mod-enter" ? !(event.metaKey || event.ctrlKey) : event.shiftKey) return
			event.preventDefault()
			send()
		},
		[send, mode],
	)

	const showStop = busy && Boolean(onStop)

	useEasedGrowth(field, text)

	return (
		<form
			data-motion={motionAttribute(motion)}
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
				aria-keyshortcuts={mode === "mod-enter" ? "Meta+Enter Control+Enter" : "Enter"}
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
					// Past the cap the field scrolls; the platform bar (stepper arrows on
					// Windows) would poke into the composer's rounded corner.
					"scrollbar-quiet",
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
				{/* One button that changes role, not two that take turns: the element
				    (and the focus ring, if it is on it) stays put, the fill eases from
				    secondary to primary, and the glyph swaps in place. Both glyphs stay
				    mounted for motion-icon-swap; the label carries the meaning, so the
				    pair is aria-hidden. Busy with no stop handler is Button's own
				    `loading`, which swaps the glyph for its Spinner at full colour. */}
				<Button
					type={showStop ? "button" : "submit"}
					variant={showStop ? "secondary" : "primary"}
					size="icon-sm"
					aria-label={showStop ? stopLabel : sendLabel}
					disabled={showStop ? false : !canSend}
					loading={!showStop && busy}
					onClick={
						showStop
							? (event) => {
									// The same element becomes the submit button. If onStop clears
									// `busy` synchronously, React re-renders it to type="submit"
									// before the click's default action runs, and that action would
									// then submit the form — sending a draft typed while it worked.
									event.preventDefault()
									onStop?.()
									// This button turns back into send, disabled while the field
									// is empty, and a disabled element drops focus to the page.
									// So focus goes to the field, where the next message starts.
									// Not on touch: that would raise the soft keyboard unasked.
									if (!coarse) field.current?.focus()
								}
							: undefined
					}
				>
					<span aria-hidden="true" className="motion-icon-swap">
						<span data-active={!showStop} className="inline-flex">
							<Icon name="arrow-up" />
						</span>
						<span data-active={showStop} className="inline-flex">
							{/* A filled square, the universal stop (xmark read as close or
							    clear), drawn smaller than the box so it sits in the button as
							    a mark. */}
							<Icon name="stop" variant="solid" className="text-[0.75em]" />
						</span>
					</span>
				</Button>
			</div>

			{footerContent ? (
				<p className={cn("px-[calc((var(--control-sm)-1.125rem)/2)] text-muted-foreground", tier.secondary)}>
					{footerContent}
				</p>
			) : null}
			{children}
		</form>
	)
}
ChatComposer.displayName = "ChatComposer"

const COARSE = "(pointer: coarse)"

function subscribeCoarse(onChange: () => void) {
	if (typeof window === "undefined" || !window.matchMedia) return () => {}
	const query = window.matchMedia(COARSE)
	query.addEventListener("change", onChange)
	return () => query.removeEventListener("change", onChange)
}

/** The primary pointer is a finger. The server renders the desktop answer and
 * the client corrects it on hydration, which useSyncExternalStore makes safe. */
function useCoarsePointer() {
	return useSyncExternalStore(
		subscribeCoarse,
		() => typeof window !== "undefined" && Boolean(window.matchMedia?.(COARSE).matches),
		() => false,
	)
}
