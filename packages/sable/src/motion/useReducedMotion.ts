"use client";

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(callback: () => void) {
	if (typeof window === "undefined" || !window.matchMedia) return () => {}
	const mql = window.matchMedia(QUERY)
	mql.addEventListener("change", callback)
	return () => mql.removeEventListener("change", callback)
}

function getSnapshot() {
	if (typeof window === "undefined" || !window.matchMedia) return false
	return window.matchMedia(QUERY).matches
}

/** Server always reports "no preference" — the client reconciles on hydration. */
function getServerSnapshot() {
	return false
}

/**
 * `true` when the OS requests reduced motion (`prefers-reduced-motion: reduce`).
 * SSR-safe (returns `false` on the server, then reconciles on the client) and
 * concurrent-safe via `useSyncExternalStore`. Use it to branch JS-driven motion;
 * token-driven CSS motion already honours the preference via `--motion-scale`.
 */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
