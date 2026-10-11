import { Separator as Base } from "@base-ui/react/separator"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"

export interface SeparatorProps
	extends Omit<ComponentProps<typeof Base>, "className"> {
	/** Axis of the rule. Horizontal spans the inline width; vertical the block height. */
	orientation?: "horizontal" | "vertical"
	/**
	 * When set (horizontal only), centers a muted label between two hairline rules
	 * — e.g. an "Other holdings" section divider.
	 */
	label?: ReactNode
	className?: string
}

/**
 * Separator — a hairline divider over Base UI's Separator (role + aria-orientation
 * come from Base UI). Horizontal is a full-width 1px rule; vertical is a 1px column
 * that stretches to its flex parent's height. Tinted with the `border` token.
 * Pass `label` (horizontal only) for a centered caption between two rules.
 */
export function Separator({
	orientation = "horizontal",
	label,
	className,
	...props
}: SeparatorProps) {
	// Labeled divider: a plain role=separator row (two hairlines + caption). Base
	// UI's automatic role/aria-orientation are replaced by the manual attributes
	// here since this branch is not a single Base.Separator element.
	if (label != null && orientation === "horizontal") {
		return (
			<div
				role="separator"
				aria-orientation="horizontal"
				className={cn("flex items-center gap-3", className)}
			>
				<span className="h-px flex-1 bg-border" />
				<span className="text-body-xs text-muted-foreground">{label}</span>
				<span className="h-px flex-1 bg-border" />
			</div>
		)
	}

	return (
		<Base
			orientation={orientation}
			className={cn(
				"shrink-0 bg-border",
				orientation === "horizontal"
					? "h-px w-full"
					: "h-full w-px self-stretch",
				className,
			)}
			{...props}
		/>
	)
}
Separator.displayName = "Separator"
