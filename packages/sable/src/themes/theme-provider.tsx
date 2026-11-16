"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react"
import type { ReactNode } from "react"
import {
	SABLE_COLOR_STORAGE_KEY,
	SABLE_THEME_ATTRIBUTE,
	SABLE_THEME_STORAGE_KEY,
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

// SABLE_COLOR_STORAGE_KEY / SABLE_THEME_STORAGE_KEY live in registry.ts (no
// "use client"), so the server-safe boot script can share them.

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
	/**
	 * localStorage key for the color preference. Pass null to disable persistence.
	 * An app with its own `defaultThemeId` gets a key of its own by default.
	 */
	colorStorageKey?: string | null
	/**
	 * localStorage key for the design theme id. Pass null to disable persistence.
	 * An app with its own `defaultThemeId` gets a key of its own by default.
	 */
	themeStorageKey?: string | null
	/**
	 * Where to write `.dark` and `data-sable-theme`. Defaults to <html> so
	 * portaled overlays share the same token layer. A getter is read when the
	 * mode or theme changes; an inline arrow is fine (it is held in a ref, so a
	 * new function each render does not re-run the write).
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

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"

function systemColorMode(): SableColorMode {
	if (typeof window === "undefined" || !window.matchMedia) return "dark"
	return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function subscribeColorScheme(callback: () => void) {
	if (typeof window === "undefined" || !window.matchMedia) return () => {}
	const media = window.matchMedia(COLOR_SCHEME_QUERY)
	media.addEventListener?.("change", callback)
	return () => media.removeEventListener?.("change", callback)
}

/**
 * Storage as an external store. Read through `useSyncExternalStore`, never in a
 * `useState` initialiser: the server has no storage, so a value read during the
 * first client render would differ from the HTML it hydrates, and anything
 * rendering `mode` (a ThemeSwitcher) would mismatch. The server snapshot is
 * `null` (the defaults); React re-renders with the stored value right after
 * hydration, and a client-only app reads it on its first render.
 */
const storageListeners = new Set<() => void>()

function notifyStorage() {
	for (const listener of storageListeners) listener()
}

function subscribeStorage(callback: () => void) {
	storageListeners.add(callback)
	if (typeof window !== "undefined") window.addEventListener("storage", callback)
	return () => {
		storageListeners.delete(callback)
		if (typeof window !== "undefined") window.removeEventListener("storage", callback)
	}
}

function useStoredValue(key: string | null): string | null {
	return useSyncExternalStore(
		subscribeStorage,
		() => readStorage(key),
		() => null,
	)
}

const subscribeNothing = () => () => {}

/** False on the server and while hydrating; true from then on (and at once in a client-only render). */
function useHydrated(): boolean {
	return useSyncExternalStore(
		subscribeNothing,
		() => true,
		() => false,
	)
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
	notifyStorage()
}

/**
 * The default key for a stored setting. localStorage is shared by every app on
 * an origin, so an app that names its own theme stores under that name: what
 * another Sable app on the domain saved can't replace the look it opens in.
 */
function defaultStorageKey(key: string, defaultThemeId: AnyThemeId) {
	return defaultThemeId === sableDefaultThemeId ? key : `${key}:${defaultThemeId}`
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

/**
 * Writes the color mode as `.dark` on the target. A no-op when the target is
 * already in that mode, so a re-render, the first render after a pre-paint
 * `sableThemeScript`, or a repeated call costs no reflow.
 */
export function applySableColorMode(
	mode: SableColorMode,
	target: HTMLElement | null = rootElement(),
) {
	if (!target) return
	if (target.classList.contains("dark") === (mode === "dark")) return
	withSuppressedTransitions(() => {
		target.classList.toggle("dark", mode === "dark")
	})
}

/** Writes the design theme as `data-sable-theme` (none for the default). A no-op when unchanged. */
export function applySableTheme(
	themeId: AnyThemeId,
	target: HTMLElement | null = rootElement(),
) {
	if (!target) return
	const next = themeId === sableDefaultThemeId ? null : themeId
	if (target.getAttribute(SABLE_THEME_ATTRIBUTE) === next) return
	withSuppressedTransitions(() => {
		if (next === null) {
			target.removeAttribute(SABLE_THEME_ATTRIBUTE)
			return
		}
		target.setAttribute(SABLE_THEME_ATTRIBUTE, next)
	})
}

// The bundler's build-mode flag, as Base UI and React read it.
declare const process: { env: { NODE_ENV?: string } }

function isDevelopment() {
	try {
		return process.env.NODE_ENV !== "production"
	} catch {
		return false
	}
}

const missingThemeWarned = new Set<string>()

/**
 * The silent failure the docs keep warning about: `data-sable-theme="meridian"`
 * set, its CSS never imported, and the page renders as the Sable theme with no
 * error. Each bundled theme's CSS declares `--sable-theme-id`; in development,
 * a built-in id that the element does not report gets one warning. Skipped when
 * no Sable CSS is loaded at all (a test DOM) and for app-owned custom themes.
 */
function warnIfThemeCssMissing(themeId: AnyThemeId, element: HTMLElement | null) {
	if (!element || !isDevelopment() || !isThemeId(themeId) || missingThemeWarned.has(themeId)) return
	if (typeof getComputedStyle !== "function") return
	const painting = getComputedStyle(element).getPropertyValue("--sable-theme-id").trim()
	if (!painting || painting === themeId) return
	missingThemeWarned.add(themeId)
	console.warn(
		// design-lint-disable-next-line self-import -- the warning text names the consumer's import, not an import
		`Sable: data-sable-theme="${themeId}" is set, but that theme's CSS is not loaded, so the page renders as the "${painting}" theme. Import "@sableui/react/theme/${themeId}.css" (or "@sableui/react/themes.css" for every bundled theme) after "@sableui/react/styles.css".`,
	)
}

/**
 * Applies and persists Sable's two theme axes:
 *
 * - color preference: light / dark / system, written as `.dark`
 * - design theme: any id in `themeIds` (or a custom theme), written as `data-sable-theme`
 *
 * SSR-safe: nothing reads storage or the media query during render. The server
 * and the hydrating client render the defaults, then the stored choice arrives
 * in the re-render React makes right after hydration. The DOM is written only
 * after hydration, so the provider never overwrites what a pre-paint
 * `sableThemeScript` already put on `<html>`. Inline that script in `<head>`
 * (with `suppressHydrationWarning` on `<html>`) to avoid a first-paint flash.
 */
export function SableThemeProvider({
	children,
	defaultPreference = "system",
	preference: controlledPreference,
	onPreferenceChange,
	defaultThemeId = sableDefaultThemeId,
	themeId: controlledThemeId,
	onThemeIdChange,
	colorStorageKey = defaultStorageKey(SABLE_COLOR_STORAGE_KEY, defaultThemeId),
	themeStorageKey = defaultStorageKey(SABLE_THEME_STORAGE_KEY, defaultThemeId),
	target = "root",
	customThemes,
}: SableThemeProviderProps) {
	const themeManifestById = useMemo(
		() => buildThemeManifestById(customThemes),
		[customThemes],
	)

	const hydrated = useHydrated()
	const storedPreference = useStoredValue(colorStorageKey)
	const storedThemeId = useStoredValue(themeStorageKey)
	// A choice made in this tab, held in memory too, so switching still works
	// when storage is disabled or persistence is off. Cleared when another tab
	// changes the stored value, which then wins.
	const [localPreference, setLocalPreference] =
		useState<SableThemePreference | null>(null)
	const [localThemeId, setLocalThemeId] = useState<AnyThemeId | null>(null)
	const systemMode = useSyncExternalStore<SableColorMode | null>(
		subscribeColorScheme,
		systemColorMode,
		() => null,
	)

	const preference =
		controlledPreference ??
		localPreference ??
		coercePreference(storedPreference, defaultPreference)
	const themeId =
		controlledThemeId ??
		localThemeId ??
		coerceThemeId(storedThemeId, defaultThemeId, themeManifestById)
	// The server cannot know the OS preference. It renders the design's home
	// mode, and the client corrects it right after hydration.
	const mode: SableColorMode =
		preference === "system" ? (systemMode ?? "dark") : preference

	useEffect(() => {
		if (typeof window === "undefined") return
		function onStorage(event: StorageEvent) {
			if (event.key === null || event.key === colorStorageKey) setLocalPreference(null)
			if (event.key === null || event.key === themeStorageKey) setLocalThemeId(null)
		}
		window.addEventListener("storage", onStorage)
		return () => window.removeEventListener("storage", onStorage)
	}, [colorStorageKey, themeStorageKey])

	// The target getter lives in a ref, so an inline `target={() => el}` (a new
	// function every render) does not re-run the DOM writes on every parent
	// render. It is read when the mode or theme actually changes.
	const targetRef = useRef(target)
	useEffect(() => {
		targetRef.current = target
	})
	const targetKind = target === "root" ? "root" : "getter"
	// A getter can start returning its element only after a later render
	// (`target={() => el}` over a callback ref). `written` is the element the
	// last write went to; when the getter resolves to another, the tick below
	// runs the writes again. An unchanged element costs one comparison.
	const written = useRef<HTMLElement | null>(null)
	const [targetTick, setTargetTick] = useState(0)

	useEffect(() => {
		if (!hydrated) return
		const element = resolveTarget(targetRef.current)
		written.current = element
		applySableColorMode(mode, element)
	}, [hydrated, mode, targetKind, targetTick])

	useEffect(() => {
		if (!hydrated) return
		const element = resolveTarget(targetRef.current)
		applySableTheme(themeId, element)
		warnIfThemeCssMissing(themeId, element)
	}, [hydrated, themeId, targetKind, targetTick])

	// After the writes above, on every render: has the getter's element changed?
	useEffect(() => {
		if (!hydrated || targetKind !== "getter") return
		if (resolveTarget(targetRef.current) !== written.current) setTargetTick((n) => n + 1)
	})

	const setPreference = useCallback(
		(next: SableThemePreference) => {
			if (controlledPreference === undefined) setLocalPreference(next)
			writeStorage(colorStorageKey, next)
			onPreferenceChange?.(next)
		},
		[controlledPreference, colorStorageKey, onPreferenceChange],
	)

	const setThemeId = useCallback(
		(next: AnyThemeId) => {
			if (controlledThemeId === undefined) setLocalThemeId(next)
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

function subscribeRoot(callback: () => void) {
	const root = rootElement()
	if (!root || typeof MutationObserver === "undefined") return () => {}
	const observer = new MutationObserver(callback)
	observer.observe(root, { attributes: true, attributeFilter: ["class", SABLE_THEME_ATTRIBUTE] })
	return () => observer.disconnect()
}

const SERVER_ROOT_SNAPSHOT = `dark ${sableDefaultThemeId}`

/** What <html> actually carries, as one comparable string: `<mode> <themeId>`. */
function rootSnapshot(): string {
	const root = rootElement()
	if (!root) return SERVER_ROOT_SNAPSHOT
	const mode = root.classList.contains("dark") ? "dark" : "light"
	return `${mode} ${root.getAttribute(SABLE_THEME_ATTRIBUTE) ?? sableDefaultThemeId}`
}

const emptySnapshot = () => ""
const serverRootSnapshot = () => SERVER_ROOT_SNAPSHOT

/**
 * Reads Sable's active color preference and design theme. Safe without a
 * provider: mutators become no-ops, and the mode and theme are read from what
 * `<html>` actually carries (`.dark`, `data-sable-theme`) rather than assumed,
 * so a page themed by hand reports what it shows. The server reports the
 * default (Sable, dark).
 */
export function useSableTheme(): SableThemeContextValue {
	const ctx = useContext(SableThemeContext)
	const root = useSyncExternalStore(
		ctx ? subscribeNothing : subscribeRoot,
		ctx ? emptySnapshot : rootSnapshot,
		ctx ? emptySnapshot : serverRootSnapshot,
	)
	if (ctx) return ctx

	const [rootMode, rootTheme] = root.split(" ") as [SableColorMode, AnyThemeId]
	return {
		mode: rootMode,
		colorMode: rootMode,
		preference: rootMode,
		colorPreference: rootMode,
		themeId: rootTheme,
		themes: featuredThemeManifests,
		setPreference: () => {},
		setColorPreference: () => {},
		setThemeId: () => {},
		toggle: () => {},
		toggleColorMode: () => {},
	}
}
