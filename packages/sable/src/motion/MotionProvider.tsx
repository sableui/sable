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
 * - `subtle`  — essential motion only: feedback, overlays, disclosure and
 *               loaders play; expressive motion (glides, rolling numbers, drawn
 *               ticks, shakes, staggers, overshoot) resolves instantly. Follows
 *               the OS preference for everything else, so it never turns motion
 *               on for someone who asked for it off.
 * - `reduced` — damp all token-driven motion to static.
 * - `off`     — synonym for `reduced`; motion is fully disabled.
 */
export type MotionPolicy = "system" | "full" | "subtle" | "reduced" | "off"

/**
 * How much motion one component or region may use — the value of a
 * component's `motion` prop and of `<MotionScope level>`. It can only turn
 * motion DOWN from what the surroundings allow: `full` means "inherit", never
 * "override the reader's reduce-motion setting".
 */
export type MotionLevel = "full" | "subtle" | "off"

interface MotionContextValue {
	policy: MotionPolicy
	setPolicy: (policy: MotionPolicy) => void
	/** OS-level reduced-motion preference. */
	prefersReducedMotion: boolean
	/** Resolved: will token-driven motion play right now? Mirrors the CSS. */
	enabled: boolean
	/**
	 * Resolved: will EXPRESSIVE motion play — glides, rolling numbers, drawn
	 * ticks, shakes, staggers? False under `subtle` as well as when motion is
	 * off. JS-driven flourishes read this; essential JS motion reads `enabled`.
	 */
	expressive: boolean
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

/** Resolve a policy + OS preference into "do flourishes play". */
function resolveExpressive(
	policy: MotionPolicy,
	prefersReducedMotion: boolean,
): boolean {
	return policy !== "subtle" && resolveEnabled(policy, prefersReducedMotion)
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
			expressive: resolveExpressive(policy, prefersReducedMotion),
		}),
		[policy, setPolicy, prefersReducedMotion],
	)

	return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

const LEVEL_RANK: Record<MotionLevel, number> = { off: 0, subtle: 1, full: 2 }

/** The lower of two levels: a scope can only turn motion down. */
function lowerLevel(a: MotionLevel, b: MotionLevel): MotionLevel {
	return LEVEL_RANK[a] <= LEVEL_RANK[b] ? a : b
}

/** The level a resolved context amounts to. */
function contextLevel(ctx: Pick<MotionContextValue, "enabled" | "expressive">): MotionLevel {
	if (!ctx.enabled) return "off"
	return ctx.expressive ? "full" : "subtle"
}

/**
 * The value `data-motion` should carry for a component's `motion` prop:
 * nothing for `full` (inherit), the level otherwise. Spread it on the
 * component's root element — the CSS policy does the rest.
 */
export function motionAttribute(level: MotionLevel | undefined): MotionLevel | undefined {
	return level === undefined || level === "full" ? undefined : level
}

/**
 * A component's motion, from its own `motion` prop and everything around it
 * (provider, scopes, the OS preference) — whichever is lower. Use the returned
 * `enabled` / `expressive` to gate JS-driven motion, and spread `attribute`
 * as the root's `data-motion` so the CSS recipes inside agree:
 *
 *   const motion = useMotionLevel(props.motion)
 *   <div data-motion={motion.attribute}>…</div>
 */
export function useMotionLevel(level?: MotionLevel): {
	level: MotionLevel
	enabled: boolean
	expressive: boolean
	attribute: MotionLevel | undefined
} {
	const ctx = useMotion()
	const resolved = lowerLevel(contextLevel(ctx), level ?? "full")
	return {
		level: resolved,
		enabled: resolved !== "off",
		expressive: resolved === "full",
		attribute: motionAttribute(level),
	}
}

export interface MotionScopeProps {
	children: ReactNode
	/**
	 * How much motion this region may use. `subtle` keeps feedback, overlays
	 * and loaders and drops the flourishes; `off` stills everything. A scope
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting.
	 */
	level: Exclude<MotionLevel, "full">
}

/**
 * Turns motion down for one region — a dense data view, an embedded widget, a
 * screen a test captures — without touching the rest of the app. Renders a
 * `display: contents` wrapper carrying `data-motion`, so it adds no box to the
 * layout, and provides the same level to `useMotion()` / `useMotionLevel()`
 * below it so JS-driven motion agrees with the CSS.
 *
 * Overlays portal out of the DOM subtree, so their CSS follows the app-level
 * policy rather than the scope; set the level on <MotionProvider> to cover
 * them too.
 */
export function MotionScope({ children, level }: MotionScopeProps) {
	const parent = useMotion()
	const resolved = lowerLevel(contextLevel(parent), level)
	const value = useMemo<MotionContextValue>(
		() => ({
			...parent,
			enabled: resolved !== "off",
			expressive: resolved === "full",
		}),
		[parent, resolved],
	)
	return (
		<MotionContext.Provider value={value}>
			<div data-motion={level} style={{ display: "contents" }}>
				{children}
			</div>
		</MotionContext.Provider>
	)
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
		expressive: resolveExpressive("system", prefersReducedMotion),
	}
}
