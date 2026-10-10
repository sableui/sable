"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react"
import type { ReactNode } from "react"
import { useReducedMotion } from "./useReducedMotion"

/**
 * Motion policy — the value written to the `data-motion` attribute that drives
 * the global `--motion-scale` switch in styles.css.
 *
 * - `system`  — defer to the OS `prefers-reduced-motion` preference (default).
 * - `full`    — force motion on (overrides the OS preference in-app).
 * - `reduced` — damp all token-driven motion to static.
 * - `off`     — synonym for `reduced`; motion is fully disabled.
 */
export type MotionPolicy = "system" | "full" | "reduced" | "off"

interface MotionContextValue {
	policy: MotionPolicy
	setPolicy: (policy: MotionPolicy) => void
	/** OS-level reduced-motion preference. */
	prefersReducedMotion: boolean
	/** Resolved: will token-driven motion play right now? Mirrors the CSS. */
	enabled: boolean
}

const MotionContext = createContext<MotionContextValue | null>(null)

/** Resolve a policy + OS preference into "is motion playing". */
function resolveEnabled(
	policy: MotionPolicy,
	prefersReducedMotion: boolean,
): boolean {
	if (policy === "off" || policy === "reduced") return false
	if (policy === "full") return true
	return !prefersReducedMotion
}

export interface MotionProviderProps {
	children: ReactNode
	/** Initial policy when uncontrolled. @default "system" */
	defaultPolicy?: MotionPolicy
	/** Controlled policy. Provide with `onPolicyChange` to control externally. */
	policy?: MotionPolicy
	/** Notified whenever the policy changes (controlled or uncontrolled). */
	onPolicyChange?: (policy: MotionPolicy) => void
	/**
	 * Where to write `data-motion`. Defaults to `<html>` so portaled overlays
	 * (dialogs, menus, toasts) are covered too. Pass a getter to scope motion to
	 * a subtree instead.
	 */
	target?: "root" | (() => HTMLElement | null)
}

/**
 * Provides the motion policy and writes `data-motion` to drive the global CSS
 * kill-switch. Zero runtime dependency — it only toggles a CSS variable, so all
 * token-driven motion (recipes, transitions, loaders) responds at once.
 *
 * The provider is optional: with no provider, motion follows the OS preference
 * by default. Mount one near the app root to expose an in-app toggle:
 *
 *   <MotionProvider defaultPolicy="system">
 *     <App />
 *   </MotionProvider>
 *
 * then read/flip it anywhere via `useMotion()`.
 */
export function MotionProvider({
	children,
	defaultPolicy = "system",
	policy: controlledPolicy,
	onPolicyChange,
	target = "root",
}: MotionProviderProps) {
	const [uncontrolled, setUncontrolled] = useState<MotionPolicy>(defaultPolicy)
	const policy = controlledPolicy ?? uncontrolled
	const prefersReducedMotion = useReducedMotion()

	const setPolicy = useCallback(
		(next: MotionPolicy) => {
			if (controlledPolicy === undefined) setUncontrolled(next)
			onPolicyChange?.(next)
		},
		[controlledPolicy, onPolicyChange],
	)

	useEffect(() => {
		const el =
			target === "root"
				? typeof document !== "undefined"
					? document.documentElement
					: null
				: target()
		if (!el) return
		// "system" defers to the media query — remove the attribute entirely.
		if (policy === "system") {
			el.removeAttribute("data-motion")
		} else {
			el.setAttribute("data-motion", policy)
		}
		return () => {
			el.removeAttribute("data-motion")
		}
	}, [policy, target])

	const value = useMemo<MotionContextValue>(
		() => ({
			policy,
			setPolicy,
			prefersReducedMotion,
			enabled: resolveEnabled(policy, prefersReducedMotion),
		}),
		[policy, setPolicy, prefersReducedMotion],
	)

	return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

/**
 * Read and control the motion policy. Falls back to a provider-less default
 * (follows the OS preference) so it's safe to call without a <MotionProvider> —
 * `setPolicy` is a no-op in that case.
 */
export function useMotion(): MotionContextValue {
	const ctx = useContext(MotionContext)
	const prefersReducedMotion = useReducedMotion()
	if (ctx) return ctx
	return {
		policy: "system",
		setPolicy: () => {},
		prefersReducedMotion,
		enabled: resolveEnabled("system", prefersReducedMotion),
	}
}
