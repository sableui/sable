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
import {
	SABLE_THEME_ATTRIBUTE,
	buildThemeManifestById,
	defaultThemeId as sableDefaultThemeId,
	isKnownThemeId,
	isThemeId,
	featuredThemeManifests,
	type ThemeId,
} from "./registry"
import type { ThemeManifest } from "./_contract"

/**
 * A theme id: one of Sable's built-in ids (`themeIds`), or any string when a
 * `customThemes` manifest supplies it. The `string & {}` trick keeps
 * autocomplete for the closed union while still accepting arbitrary strings
 * — see https://www.totaltypescript.com/tips/create-autocomplete-helper.
 */
export type AnyThemeId = ThemeId | (string & {})

export const SABLE_COLOR_STORAGE_KEY = "sable-color-preference" as const
export const SABLE_THEME_STORAGE_KEY = "sable-theme-id" as const

export type SableColorMode = "light" | "dark"
export type SableThemePreference = SableColorMode | "system"

export interface SableThemeContextValue {
	/** Resolved color mode applied to the target element. */
	mode: SableColorMode
	/** Explicit alias for consumers that prefer color-mode language. */
	colorMode: SableColorMode
	/** Stored color preference; "system" resolves through prefers-color-scheme. */
	preference: SableThemePreference
	/** Explicit alias for consumers that prefer color-preference language. */
	colorPreference: SableThemePreference
	/** Active Sable design theme id. */
	themeId: AnyThemeId
	/** Featured theme manifests; legacy imports remain available separately. */
	themes: typeof featuredThemeManifests
	setPreference: (preference: SableThemePreference) => void
	setColorPreference: (preference: SableThemePreference) => void
	setThemeId: (themeId: AnyThemeId) => void
	toggle: () => void
	toggleColorMode: () => void
}

export interface SableThemeProviderProps {
	children: ReactNode
	/**
	 * Initial color preference when uncontrolled and no stored value exists.
	 * "system", so a first visit follows the visitor's OS. Dark is still the
	 * design's home mode; pass "dark" (or a preset's `defaultMode`) to open there.
	 * @default "system"
	 */
	defaultPreference?: SableThemePreference
	/** Controlled color preference. */
	preference?: SableThemePreference
	/** Notified whenever setPreference/setColorPreference is called. */
	onPreferenceChange?: (preference: SableThemePreference) => void
	/** Initial design theme when uncontrolled and no stored value exists. @default "sable" */
	defaultThemeId?: AnyThemeId
	/** Controlled design theme id. */
	themeId?: AnyThemeId
	/** Notified whenever setThemeId is called. */
	onThemeIdChange?: (themeId: AnyThemeId) => void
	/** localStorage key for the color preference. Pass null to disable persistence. */
	colorStorageKey?: string | null
	/** localStorage key for the design theme id. Pass null to disable persistence. */
	themeStorageKey?: string | null
	/**
	 * Where to write `.dark` and `data-sable-theme`. Defaults to <html> so
	 * portaled overlays share the same token layer.
	 */
	target?: "root" | (() => HTMLElement | null)
	/**
	 * Additional theme manifests beyond Sable's built-in themes, e.g. a
	 * theme synthesized for a consumer project from an app-owned preset.
	 * Their ids become valid `themeId` values and survive storage-restore
	 * (localStorage / cross-tab `storage` events) just like built-in ids.
	 * Sable does not inject their CSS — the consumer is responsible for
	 * importing the theme's stylesheet.
	 */
	customThemes?: ThemeManifest[]
}

const SableThemeContext = createContext<SableThemeContextValue | null>(null)

function coercePreference(
	value: string | null,
	fallback: SableThemePreference,
): SableThemePreference {
	if (value === "light" || value === "dark" || value === "system") return value
	return fallback
}

function coerceThemeId(
	value: string | null,
	fallback: AnyThemeId,
	manifestById: Record<string, ThemeManifest> = {},
): AnyThemeId {
	if (!value) return fallback
	if (isThemeId(value) || isKnownThemeId(value, manifestById)) {
		return manifestById[value]?.deprecated?.replacement ?? value
	}
	return fallback
}

function systemColorMode(): SableColorMode {
	if (typeof window === "undefined" || !window.matchMedia) return "dark"
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"
}

function readStorage(key: string | null): string | null {
	if (!key || typeof window === "undefined") return null
	try {
		return window.localStorage.getItem(key)
	} catch {
		return null
	}
}

function writeStorage(key: string | null, value: string) {
	if (!key || typeof window === "undefined") return
	try {
		window.localStorage.setItem(key, value)
	} catch {
		// Storage may be disabled or quota-limited; theme switching still works.
	}
}

function rootElement(): HTMLElement | null {
	return typeof document === "undefined" ? null : document.documentElement
}

function resolveTarget(
	target: SableThemeProviderProps["target"],
): HTMLElement | null {
	if (target === undefined || target === "root") return rootElement()
	return target()
}

/** Marks the injected suppressor sheet; internal, not part of the public API. */
const SABLE_TRANSITION_SUPPRESSOR_ATTRIBUTE = "data-sable-theme-transition"

const TRANSITION_SUPPRESSOR_CSS =
	"*,*::before,*::after{transition:none !important}"

/**
 * Runs a theme mutation with every transition suppressed, so switching color
 * mode or design theme *snaps* instead of smearing.
 *
 * `motion-interactive` — Sable's default hover/focus/press recipe — puts
 * transitions on color, background-color, border-color and box-shadow across
 * every interactive control. Toggling `.dark` or `data-sable-theme` changes all
 * of those at once, so without this every control cross-fades to the new theme
 * over the recipe's duration and the page visibly wipes.
 *
 * The sequence is: inject a `transition: none !important` sheet, mutate, force a
 * synchronous reflow (reading `offsetHeight`) so the new colors are committed
 * with the suppression in effect, then remove the sheet.
 *
 * **The removal must be on a DOUBLE `requestAnimationFrame`.** A single rAF
 * fires *before* the paint that commits the new colors; removing the sheet there
 * puts the transitions back while the old colors are still on screen, and the
 * smear this exists to prevent happens anyway. The second rAF lands after that
 * paint, which is the first moment the suppression is safe to lift.
 *
 * Suppressing transitions is always safe (it is the same direction as the motion
 * kill-switch), so there is no reduced-motion branch here. Without a DOM — SSR,
 * or a call before the document exists — the mutation is simply applied
 * directly.
 */
function withSuppressedTransitions(mutate: () => void) {
	if (
		typeof document === "undefined" ||
		!document.head ||
		!document.body ||
		typeof document.createElement !== "function"
	) {
		mutate()
		return
	}

	const style = document.createElement("style")
	style.setAttribute(SABLE_TRANSITION_SUPPRESSOR_ATTRIBUTE, "")
	style.appendChild(document.createTextNode(TRANSITION_SUPPRESSOR_CSS))
	document.head.appendChild(style)

	const removeStyle = () => style.parentNode?.removeChild(style)

	try {
		mutate()
	} catch (error) {
		removeStyle()
		throw error
	}

	// Force a synchronous reflow so the new colors are committed while the
	// suppression sheet is still in the document.
	void document.body.offsetHeight

	const raf =
		typeof requestAnimationFrame === "function" ? requestAnimationFrame : null

	if (!raf) {
		removeStyle()
		return
	}

	raf(() => {
		raf(removeStyle)
	})
}

export function applySableColorMode(
	mode: SableColorMode,
	target: HTMLElement | null = rootElement(),
) {
	if (!target) return
	withSuppressedTransitions(() => {
		target.classList.toggle("dark", mode === "dark")
	})
}

export function applySableTheme(
	themeId: AnyThemeId,
	target: HTMLElement | null = rootElement(),
) {
	if (!target) return
	withSuppressedTransitions(() => {
		if (themeId === sableDefaultThemeId) {
			target.removeAttribute(SABLE_THEME_ATTRIBUTE)
			return
		}
		target.setAttribute(SABLE_THEME_ATTRIBUTE, themeId)
	})
}

/**
 * Applies and persists Sable's two theme axes:
 *
 * - color preference: light / dark / system, written as `.dark`
 * - design theme: any id in `themeIds` (or a custom theme), written as `data-sable-theme`
 */
export function SableThemeProvider({
	children,
	defaultPreference = "system",
	preference: controlledPreference,
	onPreferenceChange,
	defaultThemeId = sableDefaultThemeId,
	themeId: controlledThemeId,
	onThemeIdChange,
	colorStorageKey = SABLE_COLOR_STORAGE_KEY,
	themeStorageKey = SABLE_THEME_STORAGE_KEY,
	target = "root",
	customThemes,
}: SableThemeProviderProps) {
	const themeManifestById = useMemo(
		() => buildThemeManifestById(customThemes),
		[customThemes],
	)

	const [uncontrolledPreference, setUncontrolledPreference] =
		useState<SableThemePreference>(() =>
			coercePreference(readStorage(colorStorageKey), defaultPreference),
		)
	const [uncontrolledThemeId, setUncontrolledThemeId] = useState<AnyThemeId>(
		() => coerceThemeId(readStorage(themeStorageKey), defaultThemeId, themeManifestById),
	)
	const [resolvedSystem, setResolvedSystem] =
		useState<SableColorMode>(systemColorMode)

	const preference = controlledPreference ?? uncontrolledPreference
	const themeId = controlledThemeId ?? uncontrolledThemeId
	const mode: SableColorMode =
		preference === "system" ? resolvedSystem : preference

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const onChange = () => setResolvedSystem(media.matches ? "dark" : "light")

		media.addEventListener?.("change", onChange)
		return () => media.removeEventListener?.("change", onChange)
	}, [])

	useEffect(() => {
		if (typeof window === "undefined") return

		function onStorage(event: StorageEvent) {
			if (controlledPreference === undefined) {
				if (event.key === colorStorageKey) {
					setUncontrolledPreference(
						coercePreference(event.newValue, defaultPreference),
					)
				}
				if (event.key === null) {
					setUncontrolledPreference(
						coercePreference(readStorage(colorStorageKey), defaultPreference),
					)
				}
			}

			if (controlledThemeId === undefined) {
				if (event.key === themeStorageKey) {
					setUncontrolledThemeId(
						coerceThemeId(event.newValue, defaultThemeId, themeManifestById),
					)
				}
				if (event.key === null) {
					setUncontrolledThemeId(
						coerceThemeId(
							readStorage(themeStorageKey),
							defaultThemeId,
							themeManifestById,
						),
					)
				}
			}
		}

		window.addEventListener("storage", onStorage)
		return () => window.removeEventListener("storage", onStorage)
	}, [
		colorStorageKey,
		controlledPreference,
		controlledThemeId,
		defaultPreference,
		defaultThemeId,
		themeManifestById,
		themeStorageKey,
	])

	useEffect(() => {
		applySableColorMode(mode, resolveTarget(target))
	}, [mode, target])

	useEffect(() => {
		applySableTheme(themeId, resolveTarget(target))
	}, [themeId, target])

	const setPreference = useCallback(
		(next: SableThemePreference) => {
			if (controlledPreference === undefined) setUncontrolledPreference(next)
			writeStorage(colorStorageKey, next)
			onPreferenceChange?.(next)
		},
		[controlledPreference, colorStorageKey, onPreferenceChange],
	)

	const setThemeId = useCallback(
		(next: AnyThemeId) => {
			if (controlledThemeId === undefined) setUncontrolledThemeId(next)
			writeStorage(themeStorageKey, next)
			onThemeIdChange?.(next)
		},
		[controlledThemeId, onThemeIdChange, themeStorageKey],
	)

	const toggle = useCallback(() => {
		setPreference(mode === "dark" ? "light" : "dark")
	}, [mode, setPreference])

	const value = useMemo<SableThemeContextValue>(
		() => ({
			mode,
			colorMode: mode,
			preference,
			colorPreference: preference,
			themeId,
			themes: featuredThemeManifests,
			setPreference,
			setColorPreference: setPreference,
			setThemeId,
			toggle,
			toggleColorMode: toggle,
		}),
		[mode, preference, themeId, setPreference, setThemeId, toggle],
	)

	return (
		<SableThemeContext.Provider value={value}>
			{children}
		</SableThemeContext.Provider>
	)
}

/**
 * Reads Sable's active color preference and design theme. Safe without a
 * provider; mutators become no-ops and the default (Sable, dark) is reported.
 */
export function useSableTheme(): SableThemeContextValue {
	const ctx = useContext(SableThemeContext)
	if (ctx) return ctx

	return {
		mode: "dark",
		colorMode: "dark",
		preference: "dark",
		colorPreference: "dark",
		themeId: sableDefaultThemeId,
		themes: featuredThemeManifests,
		setPreference: () => {},
		setColorPreference: () => {},
		setThemeId: () => {},
		toggle: () => {},
		toggleColorMode: () => {},
	}
}
