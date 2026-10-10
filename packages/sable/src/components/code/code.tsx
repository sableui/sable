import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

export interface CodeProps extends ComponentPropsWithRef<"code"> {}

/** Inline code. A styled `<code>` for code spans inside running text. */
export function Code({ className, ...props }: CodeProps) {
	return (
		<code
			className={cn(
				"rounded-xs bg-muted px-1.5 py-0.5 text-mono-sm text-foreground",
				className,
			)}
			{...props}
		/>
	)
}
Code.displayName = "Code"
