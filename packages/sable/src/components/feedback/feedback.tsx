"use client";

import { type ComponentPropsWithRef, type FormEvent, useId, useState } from "react"
import { cn } from "../../lib/cn"
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
}

/**
 * Feedback — a compact feedback popover. Composes our Popover + Textarea +
 * Button + Toggle. A secondary trigger opens a small form with a row of rating
 * toggles and a message field; submitting calls `onSubmit` and closes the
 * popover. Rating and message are managed internally:
 *
 *   <Feedback onSubmit={({ rating, message }) => report(rating, message)} />
 */
export function Feedback({
	label = "Feedback",
	heading = "Send feedback",
	placeholder = "What can we improve?",
	submitLabel = "Send",
	ratings = DEFAULT_RATINGS,
	onSubmit,
	className,
	...props
}: FeedbackProps) {
	const [open, setOpen] = useState(false)
	const [rating, setRating] = useState<string | undefined>(undefined)
	const [message, setMessage] = useState("")
	const headingId = useId()

	function reset() {
		setRating(undefined)
		setMessage("")
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		// A rating alone is a complete answer; Enter in an empty form is not.
		if (!rating && message.trim() === "") return
		onSubmit?.({ rating, message })
		reset()
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button variant="secondary" size="sm">
						{label}
					</Button>
				}
			/>
			<PopoverContent className="w-80">
				<form
					className={cn("flex flex-col gap-3", className)}
					aria-labelledby={headingId}
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
			</PopoverContent>
		</Popover>
	)
}
Feedback.displayName = "Feedback"
