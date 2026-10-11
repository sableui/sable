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
 * The cap, sized from the text it sits in rather than fixed: `0.85em` type
 * (never under 12px) in a box `1.6em` of its own type tall, so the same Kbd
 * reads right inline in body copy, in a 12px menu row and in a tooltip.
 *
 * Sans, not mono: word keys (Esc, Enter, Ctrl) read as labels, and the modifier
 * symbols (⌘ ⇧ ⌥ ↵) are not in most mono faces — they fell back to a tiny
 * system glyph. Tabular figures keep number keys on one width.
 *
 * `key` is a raised key ON whatever surface it sits on (it takes the surface's
 * own fill, published as `--sable-surface-bg`), with a heavier bottom edge as
 * the key's lip — the flat muted chip it replaced barely read in dark mode.
 * `ghost` drops the cap for places that are already a surface of their own: a
 * menu row's shortcut column, a tooltip, an inverted chip.
 */
const KBD_VARIANTS = {
	key: "rounded-xs border border-border border-b-border-strong bg-[var(--sable-surface-bg,var(--background))] text-muted-foreground shadow-[0_1px_0_0_var(--border)]",
	ghost: "text-current opacity-70",
} as const

export interface KbdProps extends ComponentPropsWithRef<"kbd"> {
	/**
	 * Render the platform's shortcut modifier instead of children: `⌘` on macOS
	 * and iOS, `Ctrl` everywhere else. Hardcoding either one shows half your
	 * users the wrong key. @default false
	 */
	mod?: boolean
	/**
	 * `key` draws a raised key cap; `ghost` is the bare label, for a menu row,
	 * tooltip or any surface that is already its own frame. @default "key"
	 */
	variant?: keyof typeof KBD_VARIANTS
}

/**
 * A keyboard key indicator. Renders a styled `<kbd>` for a single key cap.
 * `mod` renders the platform's shortcut modifier (⌘ or Ctrl). Show a combo as
 * one cap per key inside a KbdGroup.
 *
 *   <KbdGroup><Kbd mod /><Kbd>K</Kbd></KbdGroup>
 */
export function Kbd({ mod = false, variant = "key", className, children, ...props }: KbdProps) {
	const apple = useIsApple()
	const content = mod ? (apple ? "⌘" : "Ctrl") : children
	return (
		<kbd
			data-slot="kbd"
			className={cn(
				"inline-flex h-[1.6em] min-w-[1.6em] items-center justify-center px-[0.4em] align-middle font-sans text-[max(0.75rem,0.85em)] font-medium leading-none tabular-nums",
				KBD_VARIANTS[variant],
				className,
			)}
			{...props}
		>
			{content}
		</kbd>
	)
}
Kbd.displayName = "Kbd"

export interface KbdGroupProps extends ComponentPropsWithRef<"kbd"> {}

/**
 * A shortcut combo: one cap per key, set tight together. A nested `<kbd>` is
 * the HTML spelling of "this key, then that key", so the combo is announced as
 * one piece of keyboard input.
 *
 *   <KbdGroup><Kbd mod /><Kbd>⇧</Kbd><Kbd>P</Kbd></KbdGroup>
 */
export function KbdGroup({ className, ...props }: KbdGroupProps) {
	return (
		<kbd
			data-slot="kbd-group"
			className={cn("inline-flex items-center gap-[0.2em] align-middle", className)}
			{...props}
		/>
	)
}
KbdGroup.displayName = "KbdGroup"
