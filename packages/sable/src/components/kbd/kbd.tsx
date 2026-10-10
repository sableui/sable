"use client"

import { type ComponentPropsWithRef, useSyncExternalStore } from "react"
import { cn } from "../../lib/cn"

export interface KbdProps extends ComponentPropsWithRef<"kbd"> {
	/**
	 * Render the platform's shortcut modifier instead of children: `⌘` on macOS
	 * and iOS, `Ctrl` everywhere else. Hardcoding either one shows half your
	 * users the wrong key. @default false
	 */
	mod?: boolean
}

/** macOS and iOS take ⌘; every other platform takes Ctrl. */
function detectApple(): boolean {
	if (typeof navigator === "undefined") return false
	const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
	const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || ""
	return /mac|iphone|ipad|ipod/i.test(platform)
}

const noopSubscribe = () => () => {}

/**
 * Whether this platform's modifier is ⌘. The server cannot know, so it renders
 * Ctrl and the client corrects itself on hydration (useSyncExternalStore is
 * the hydration-safe way to read a value server and client disagree on).
 */
function useIsApple(): boolean {
	return useSyncExternalStore(noopSubscribe, detectApple, () => false)
}

/**
 * A keyboard key indicator. Renders a styled `<kbd>` for a single key cap.
 * `mod` renders the platform's shortcut modifier (⌘ or Ctrl).
 *
 *   <Kbd mod /> <Kbd>K</Kbd>
 */
export function Kbd({ mod = false, className, children, ...props }: KbdProps) {
	const apple = useIsApple()
	const content = mod ? (apple ? "⌘" : "Ctrl") : children
	return (
		<kbd
			className={cn(
				"inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border bg-muted px-1.5 text-mono-sm text-muted-foreground",
				className,
			)}
			{...props}
		>
			{content}
		</kbd>
	)
}
Kbd.displayName = "Kbd"
