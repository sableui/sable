"use client";

import { useCallback, useSyncExternalStore } from "react"
import type { Breakpoint } from "../layout/_responsive"

/** A named viewport breakpoint: Tailwind's defaults, which Sable's `lg:` chrome follows. */
export type ViewportBreakpoint = Exclude<Breakpoint, "base">

/**
 * The min-width each breakpoint starts at, in rem — Tailwind v4's defaults
 * (sm 40 / md 48 / lg 64 / xl 80 / 2xl 96), so `useBelowBreakpoint("lg")` flips
 * at exactly the width where an `lg:` class starts to apply.
 */
export const VIEWPORT_BREAKPOINTS: Record<ViewportBreakpoint, string> = {
	sm: "40rem",
	md: "48rem",
	lg: "64rem",
	xl: "80rem",
	"2xl": "96rem",
}

/** The query that is true below `breakpoint`: the complement of its `lg:`-style min-width. */
export function belowBreakpointQuery(breakpoint: ViewportBreakpoint): string {
	return `(width < ${VIEWPORT_BREAKPOINTS[breakpoint]})`
}

const hasMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function"

export interface UseMediaQueryOptions {
	/**
	 * What the server (and the first client render, before hydration settles)
	 * reports. @default false
	 */
	serverValue?: boolean
}

/**
 * `true` while a media query matches, kept live as the viewport changes.
 *
 * Read through useSyncExternalStore, so there is no setState in a resize
 * listener, no tearing under concurrent rendering, and no hydration mismatch:
 * the server reports `serverValue`, and the client reconciles on hydration.
 * Don't hand-roll a `window.innerWidth` read in state plus a `resize` listener
 * in an effect; that renders the wrong layout first and re-renders on every
 * pixel of a drag.
 *
 *   const coarse = useMediaQuery("(pointer: coarse)")
 */
export function useMediaQuery(query: string, { serverValue = false }: UseMediaQueryOptions = {}): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			if (!hasMatchMedia()) return () => {}
			const mql = window.matchMedia(query)
			mql.addEventListener("change", onChange)
			return () => mql.removeEventListener("change", onChange)
		},
		[query],
	)
	return useSyncExternalStore(
		subscribe,
		() => (hasMatchMedia() ? window.matchMedia(query).matches : serverValue),
		() => serverValue,
	)
}

/**
 * `true` below a named breakpoint, the width where Sable's own chrome changes
 * shape (Sidebar and BottomNav swap at `lg`). Use it to branch structure that a
 * class can't express — a docked panel becoming a sheet — and prefer `lg:` and
 * friends for anything that is only styling.
 *
 *   const narrow = useBelowBreakpoint("lg")
 */
export function useBelowBreakpoint(breakpoint: ViewportBreakpoint = "lg", options?: UseMediaQueryOptions): boolean {
	return useMediaQuery(belowBreakpointQuery(breakpoint), options)
}
