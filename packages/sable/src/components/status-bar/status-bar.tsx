"use client";

import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"

/**
 * StatusBar — the bottom chrome strip of a Workspace.
 *
 * It holds the persistent facts about the document that otherwise have nowhere
 * to live: dimensions, counts, sync state, warnings. Everything in it is
 * ambient — nothing here should be the only way to reach an action.
 *
 *   <StatusBar>
 *     <span className="text-ui-num">1024 × 768</span>
 *     <StatusBarSeparator />
 *     <span>3 layers</span>
 *     <StatusBarGroup align="end"><span>Saved</span></StatusBarGroup>
 *   </StatusBar>
 *
 * Zoom deliberately does NOT belong here — anchor it to the canvas it acts on,
 * which is where every reference tool puts it.
 */
export function StatusBar({ className, children, ...props }: ComponentProps<"footer">) {
	return (
		<footer
			className={cn(
				"flex h-(--status-bar-height) shrink-0 items-center gap-3 border-t border-hairline bg-panel px-2",
				"text-ui-micro text-muted-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</footer>
	)
}
StatusBar.displayName = "StatusBar"

type GroupProps = ComponentProps<"span"> & {
	/** `end` pushes the group to the trailing edge. @default "start" */
	align?: "start" | "end"
}

/** A cluster of status items. `align="end"` pins it to the trailing edge. */
export function StatusBarGroup({ align = "start", className, children, ...props }: GroupProps) {
	return (
		<span
			className={cn("flex items-center gap-3", align === "end" && "ms-auto", className)}
			{...props}
		>
			{children}
		</span>
	)
}
StatusBarGroup.displayName = "StatusBarGroup"

/**
 * A dot between status items. Decorative: it's aria-hidden, because a screen
 * reader announcing "middle dot" between every fact is noise, and the grouping
 * is already conveyed by order.
 */
export function StatusBarSeparator({ className, ...props }: ComponentProps<"span">) {
	return (
		<span aria-hidden className={cn("text-hairline-strong", className)} {...props}>
			·
		</span>
	)
}
StatusBarSeparator.displayName = "StatusBarSeparator"
