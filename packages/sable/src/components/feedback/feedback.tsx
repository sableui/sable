"use client";

import {
	type ComponentPropsWithRef,
	type FormEvent,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { Button } from "../button"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { Textarea } from "../textarea"
import { Toggle, ToggleGroup } from "../toggle"

/** The data passed to {@link FeedbackProps.onSubmit} when the form is sent. */
export interface FeedbackData {
	/** The selected rating, or undefined if the user left it blank. */
	rating?: string
	/** The free-text message. */
	message: string
}

/** One selectable rating option shown in the row of toggles. */
export interface FeedbackRating {
	/** Stable value reported back through onSubmit. */
	value: string
	/** Visible glyph/label on the toggle (e.g. an emoji or short word). */
	label: string
}

const DEFAULT_RATINGS: FeedbackRating[] = [
	{ value: "bad", label: "🙁" },
	{ value: "ok", label: "😐" },
	{ value: "good", label: "🙂" },
]

export interface FeedbackProps
	extends Omit<ComponentPropsWithRef<"form">, "onSubmit"> {
	/** Trigger button text. @default "Feedback" */
	label?: string
	/** Heading shown above the rating row. @default "Send feedback" */
	heading?: string
	/** Placeholder for the message field. @default "What can we improve?" */
	placeholder?: string
	/** Submit button text. @default "Send" */
	submitLabel?: string
	/** The rating options shown as a row of toggles. */
	ratings?: FeedbackRating[]
	/** Called with the rating + message when the form is submitted. */
	onSubmit?: (data: FeedbackData) => void
	/** The line shown, and read out, once the feedback is sent. @default "Thanks for the feedback." */
	successMessage?: string
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. The drawn check is the flourish; the thanks line stays.
	 * @default "full"
	 */
	motion?: MotionLevel
}

/*
 * How long the thanks stays up before the popover closes. A reading time for a
 * four-word line, not an animation, so it is constant: it does not shrink under
 * reduced motion, where the line still has to be read.
 */
const SUCCESS_DWELL_MS = 1200

/**
 * Feedback — a compact feedback popover. Composes our Popover + Textarea +
 * Button + Toggle. A secondary trigger opens a small form with a row of rating
 * toggles and a message field; submitting calls `onSubmit`, says thanks for a
 * moment, then closes the popover. Rating and message are managed internally:
 *
 *   <Feedback onSubmit={({ rating, message }) => report(rating, message)} />
 *
 * The thanks used to be missing: the popover simply vanished on submit, which
 * looks exactly like the form being dismissed or the message being lost. Now
 * the form gives way to a drawn check and a line in the same box (the two
 * share one grid cell, so the popover does not resize), and the popover closes
 * on its own after a short read.
 */
export function Feedback({
	label = "Feedback",
	heading = "Send feedback",
	placeholder = "What can we improve?",
	submitLabel = "Send",
	ratings = DEFAULT_RATINGS,
	successMessage = "Thanks for the feedback.",
	onSubmit,
	motion,
	className,
	...props
}: FeedbackProps) {
	const [open, setOpen] = useState(false)
	const [rating, setRating] = useState<string | undefined>(undefined)
	const [message, setMessage] = useState("")
	const [sent, setSent] = useState(false)
	// The check is held at its starting style for one frame after the thanks
	// mounts, so motion-tick has something to wipe in from (see the effect).
	const [drawn, setDrawn] = useState(false)
	const thanksRef = useRef<HTMLDivElement>(null)
	const headingId = useId()

	function reset() {
		setRating(undefined)
		setMessage("")
		setSent(false)
		setDrawn(false)
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		// A rating alone is a complete answer; Enter in an empty form is not.
		// While the thanks shows the form is inert, but guard anyway: a second
		// submit would report the same feedback twice.
		if (sent || (!rating && message.trim() === "")) return
		onSubmit?.({ rating, message })
		setSent(true)
	}

	// The form is about to go inert under the focused control, which drops focus
	// to <body> — and a non-modal popover can close when focus leaves it, cutting
	// the thanks short. Focus moves to the thanks instead, and that is also what
	// reads it out: a focused element is announced, so the line is deliberately
	// NOT also a live region (that read it twice). A layout effect, so focus has
	// moved before the inert form is painted.
	useLayoutEffect(() => {
		if (sent) thanksRef.current?.focus({ preventScroll: true })
	}, [sent])

	useEffect(() => {
		if (!sent) return
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => setDrawn(true))
		})
		const timer = setTimeout(() => setOpen(false), SUCCESS_DWELL_MS)
		return () => {
			cancelAnimationFrame(frame)
			clearTimeout(timer)
		}
	}, [sent])

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			// Reset once the close has finished animating, not as it starts: a reset
			// at the start swapped the thanks back to an empty form inside a popover
			// that was still fading out.
			onOpenChangeComplete={(isOpen) => {
				if (!isOpen) reset()
			}}
		>
			<PopoverTrigger
				render={
					<Button variant="secondary" size="sm">
						{label}
					</Button>
				}
			/>
			<PopoverContent className="grid w-80" data-motion={motionAttribute(motion)}>
				<form
					className={cn(
						"col-start-1 row-start-1 flex flex-col gap-3 transition-opacity duration-(--motion-duration-fast) ease-standard",
						sent && "opacity-0",
						className,
					)}
					aria-labelledby={headingId}
					inert={sent}
					onSubmit={handleSubmit}
					{...props}
				>
					<p id={headingId} className="text-title-sm text-popover-foreground">
						{heading}
					</p>
					<ToggleGroup
						value={rating ? [rating] : []}
						onValueChange={(value) => setRating(value[0])}
						aria-label="Rating"
					>
						{ratings.map((option) => (
							<Toggle
								key={option.value}
								value={option.value}
								aria-label={option.value}
								className="flex-1 text-base"
							>
								{option.label}
							</Toggle>
						))}
					</ToggleGroup>
					<Textarea
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						placeholder={placeholder}
						aria-label={placeholder}
					/>
					<div className="flex items-center justify-end gap-2">
						<Button type="submit" size="sm" disabled={!rating && message.trim() === ""}>
							{submitLabel}
						</Button>
					</div>
				</form>
				{/* The form's grid cell, so the popover keeps the form's size and the
				    thanks sits centred where the form was. Mounted only once sent, so
				    it fades in from its starting style as the form fades out; the check
				    draws itself in (motion-tick). */}
				{sent ? (
					<div
						ref={thanksRef}
						tabIndex={-1}
						data-slot="feedback-thanks"
						className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-2 text-center outline-none transition-opacity duration-(--motion-duration-base) ease-standard starting:opacity-0"
					>
						<span
							aria-hidden="true"
							className="inline-flex size-10 items-center justify-center rounded-full bg-success/15 text-2xl text-success"
						>
							{/* The wipe is on the glyph, not the disc: a disc that wipes in
							    reads as a progress bar. */}
							<span data-starting-style={drawn ? undefined : ""} className="inline-flex motion-tick">
								<Icon name="check" />
							</span>
						</span>
						<p className="text-body-md text-popover-foreground">{successMessage}</p>
					</div>
				) : null}
			</PopoverContent>
		</Popover>
	)
}
Feedback.displayName = "Feedback"
