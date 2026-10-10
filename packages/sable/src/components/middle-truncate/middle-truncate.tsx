import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

export interface MiddleTruncateProps
	extends Omit<ComponentPropsWithRef<"span">, "title" | "children"> {
	/** The full string to render. Truncated in the middle if long enough. */
	text: string
	/** How many leading characters to keep. @default 6 */
	startChars?: number
	/** How many trailing characters to keep. @default 6 */
	endChars?: number
}

/**
 * Middle-truncates a long string (hash, address, signature) so the start and
 * end stay legible while the middle collapses to an ellipsis:
 * `5J7s…8xQp`. When truncated, the full value is exposed to assistive tech via a
 * visually-hidden copy (the visible ellipsized text is hidden from AT) and kept
 * on `title` for a pointer tooltip, so screen readers announce the whole value
 * rather than the abbreviation. The visible text uses the mono type scale with
 * tabular figures so fixed-width glyphs line up. If the string is short enough
 * that truncation would not save space, it renders verbatim.
 */
export function MiddleTruncate({
	text,
	startChars = 6,
	endChars = 6,
	className,
	...props
}: MiddleTruncateProps) {
	const fits = text.length <= startChars + endChars + 1

	return (
		<span
			title={fits ? undefined : text}
			className={cn("text-mono-sm tabular-nums", className)}
			{...props}
		>
			{fits ? (
				text
			) : (
				<>
					<span aria-hidden="true">
						{`${text.slice(0, startChars)}…${text.slice(-endChars)}`}
					</span>
					<span className="sr-only">{text}</span>
				</>
			)}
		</span>
	)
}
MiddleTruncate.displayName = "MiddleTruncate"
