import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

export interface CodeProps extends ComponentPropsWithRef<"code"> {}

/**
 * Inline code. A styled `<code>` for code spans inside running text.
 *
 * Sized from the text it sits in (`0.875em` — a mono face runs large, so a
 * touch under the surrounding size reads as the same size), not a fixed tier:
 * the fixed 11px read as fine print inside 15px body copy and went smaller
 * still in a heading. Padding is in em for the same reason.
 */
export function Code({ className, ...props }: CodeProps) {
	return (
		<code
			className={cn(
				"rounded-xs bg-muted px-[0.35em] py-[0.15em] font-mono text-[0.875em] tabular-nums text-foreground",
				className,
			)}
			{...props}
		/>
	)
}
Code.displayName = "Code"
