import { IconProvider, applySableTheme } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { useTheme } from "../theme"
import { resolveTheme } from "./color"
import { loadFont } from "./fonts"
import { resolveShadows } from "./shadow"
import {
	CONTROL_STEPS,
	DEFAULT_LOOK,
	type Look,
	RADIUS_STEPS,
	TYPE_SIZE_TIERS,
	type ThemeBase,
	SHARE_PARAMS,
	decodeLook,
	encodeLook,
	fontsInUse,
	hasLookParams,
	lookFromParams,
	lookToParams,
	toCss,
} from "./look"

const STYLE_ID = "sable-docs-look"
const STORAGE_KEY = "sable-docs-look"
/** The retired base64 param; old share links still decode. */
const LEGACY_PARAM = "look"

/**
 * Two kinds of element must not take on the reader's look, or the active
 * preset's either:
 *
 * - `data-canvas-chrome` — the inspector itself.
 *   It must not change while you tune the system it edits, or every drag moves
 *   the control under your pointer and every color change repaints the panel
 *   you are using. Chrome also carries `data-sable-theme="sable"`, so it is
 *   always the house look, in the page's mode.
 * - `data-preset-preview` — a preset rendered as shipped (the Presets page).
 *
 * A scoped `[data-sable-theme]` re-declares only the tokens its preset owns;
 * everything else is INHERITED from :root, where the look and the active
 * preset live. So both are reset to Sable's own defaults (what an app gets
 * with no preset and no look) for every token any preset or the look sets.
 * `:where()` keeps that reset at zero specificity: a preset's own
 * declarations still win, and only the inherited leak is replaced.
 * Preview-only: none of this is part of the export.
 */
const ISOLATED = ":where([data-canvas-chrome], [data-preset-preview])"
const ISOLATED_DARK =
	":where(.dark [data-canvas-chrome]:not(.light), .dark[data-canvas-chrome], .dark [data-preset-preview]:not(.light), .dark[data-preset-preview])"

type Defaults = { light: Record<string, string>; dark: Record<string, string> }

/** Every custom property declared by a preset-scoped rule. */
function presetTokenNames(): Set<string> {
	const names = new Set<string>()
	const walk = (rules: CSSRuleList) => {
		for (const rule of Array.from(rules)) {
			if (rule instanceof CSSStyleRule && rule.selectorText.includes("[data-sable-theme")) {
				for (const name of Array.from(rule.style)) if (name.startsWith("--")) names.add(name)
			} else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules)
		}
	}
	for (const sheet of Array.from(document.styleSheets)) {
		try {
			walk(sheet.cssRules)
		} catch {
			// Cross-origin sheets (Google Fonts) cannot be read; they declare no tokens.
		}
	}
	return names
}

/**
 * Sable's defaults for `names` in both modes, read on <html> with the look
 * switched off and no preset attribute. Synchronous inside a layout effect,
 * so nothing paints in between.
 */
function readDefaults(names: string[]): Defaults {
	const html = document.documentElement
	const sheet = (document.getElementById(STYLE_ID) as HTMLStyleElement | null)?.sheet
	const theme = html.getAttribute("data-sable-theme")
	const wasDark = html.classList.contains("dark")
	if (sheet) sheet.disabled = true
	html.removeAttribute("data-sable-theme")
	const read = () => {
		const computed = getComputedStyle(html)
		return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(name).trim()]))
	}
	html.classList.remove("dark")
	const light = read()
	html.classList.add("dark")
	const dark = read()
	html.classList.toggle("dark", wasDark)
	if (theme != null) html.setAttribute("data-sable-theme", theme)
	if (sheet) sheet.disabled = false
	return { light, dark }
}

function isolationCss(defaults: Defaults): string {
	const light: string[] = []
	const dark: string[] = []
	for (const [name, value] of Object.entries(defaults.light)) {
		if (value) light.push(`${name}: ${value};`)
		const darkValue = defaults.dark[name]
		if (darkValue && darkValue !== value) dark.push(`${name}: ${darkValue};`)
	}
	return [`${ISOLATED} {\n\t${light.join("\n\t")}\n}`, dark.length ? `${ISOLATED_DARK} {\n\t${dark.join("\n\t")}\n}` : ""].join("\n")
}

/**
 * On top of the isolation, the chrome runs at a compact tool scale: smaller
 * type, tighter controls, square-ish buttons rather than the house pill.
 * The control ladder stands aside for a `data-density` scope (Advanced is a
 * compact Density), including on a popup that re-applies it across the portal.
 */
const CHROME_RESET = `
[data-canvas-chrome]:not([data-density]) {
	--button-radius: var(--theme-radius-sm);
	--control-xs: 28px; --control-sm: 32px; --control-md: 40px; --control-cta: 44px; --control-lg: 48px;
	--control-gap: 8px; --item-px: 8px; --item-gap: 8px;
}
[data-canvas-chrome] {
	--spacing: 0.25rem; --baseline-step: 0.25rem; --leading-scale: 1;
	--theme-radius-xs: 4px; --theme-radius-sm: 8px; --theme-radius-md: 12px; --theme-radius-lg: 16px; --theme-radius-xl: 20px;
	--font-sans: "Figtree", system-ui, sans-serif; --font-mono: "DM Mono", ui-monospace, monospace; --font-display: var(--font-sans);
	--type-title-sm-size: 0.875rem; --type-title-lg-size: 1rem; --type-body-sm-size: 0.8125rem; --type-body-md-size: 0.9375rem;
	--type-label-lg-size: 0.875rem; --type-label-md-size: 0.75rem; --type-label-sm-size: 0.6875rem; --type-caption-size: 0.75rem; --type-mono-caption-size: 0.75rem;
	--type-title-weight: 600; --type-label-lg-weight: 600; --type-label-md-weight: 600;
	font-family: var(--font-sans);
}`

interface CustomizerValue {
	look: Look
	setLook: (patch: Partial<Look>) => void
	reset: () => void
	css: string
	/** A link to the current page with this preset and look. */
	getShareUrl: () => string
	open: boolean
	setOpen: (open: boolean) => void
	isCustomized: boolean
	base: ThemeBase
	/**
	 * Choose a preset from anywhere (the inspector, the Themes page). A preset
	 * is a starting point, so choosing one clears the look; with changes to
	 * lose, the choice waits in `pendingPreset` for the inspector's confirm.
	 */
	requestPreset: (id: string) => void
	pendingPreset: string | null
	confirmPreset: () => void
	cancelPreset: () => void
}

const CustomizerContext = createContext<CustomizerValue | null>(null)

export function useCustomizer(): CustomizerValue {
	const value = useContext(CustomizerContext)
	if (!value) throw new Error("useCustomizer must be used inside <CustomizerProvider>")
	return value
}

/**
 * A share link (`?theme=` or any look field) defines the whole design, so its
 * look wins over the reader's saved one — even when it carries no changes.
 */
function readInitialLook(): Look {
	if (typeof window === "undefined") return DEFAULT_LOOK
	const params = new URLSearchParams(window.location.search)
	const legacy = params.get(LEGACY_PARAM)
	if (legacy) return decodeLook(legacy)
	if (params.has("theme") || hasLookParams(params)) return lookFromParams(params)
	try {
		return decodeLook(window.localStorage.getItem(STORAGE_KEY))
	} catch {
		return DEFAULT_LOOK
	}
}

/**
 * Read the active preset's own radius, control ladder, type sizes, colors and shadows
 * (both modes) with the look switched off, so every scale is relative to the
 * preset — never compounded on top of a previous scale.
 */
function readThemeBase(themeId: string): ThemeBase {
	const style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
	const sheet = style?.sheet
	if (sheet) sheet.disabled = true
	const computed = getComputedStyle(document.documentElement)
	const read = (name: string) => computed.getPropertyValue(name).trim()
	const radius: Record<string, string> = {}
	for (const step of RADIUS_STEPS) radius[step] = read(`--theme-radius-${step}`)
	const control: Record<string, string> = {}
	for (const step of CONTROL_STEPS) control[step] = read(`--control-${step}`)
	const typeSize: Record<string, string> = {}
	for (const tier of TYPE_SIZE_TIERS) typeSize[tier] = read(`--type-${tier}-size`)
	const colors = resolveTheme(themeId)
	const shadows = resolveShadows(themeId)
	const rootPx = Number.parseFloat(computed.fontSize) || 16
	// Durations are calc()s over --motion-scale; resolve through a probe pinned
	// to scale 1 so the base reads as the preset authored it.
	const probe = document.createElement("div")
	probe.style.cssText = "position:absolute;visibility:hidden;--motion-scale:1;transition-duration:var(--motion-duration-base)"
	document.body.appendChild(probe)
	const motionBaseMs = (Number.parseFloat(getComputedStyle(probe).transitionDuration) || 0.2) * 1000
	probe.remove()
	if (sheet) sheet.disabled = false
	return { radius, control, typeSize, colors, rootPx, motionBaseMs, shadows }
}

const EMPTY_BASE: ThemeBase = { radius: {}, typeSize: {}, control: {}, colors: null, rootPx: 16, motionBaseMs: 200, shadows: null }

export function CustomizerProvider({ children }: { children: ReactNode }) {
	const { themeId, setThemeId, presets } = useTheme()
	const [look, setLookState] = useState<Look>(readInitialLook)
	const [base, setBase] = useState<ThemeBase>(EMPTY_BASE)
	const [open, setOpen] = useState(false)
	const [pendingPreset, setPendingPreset] = useState<string | null>(null)
	const presetNames = useRef<Set<string> | null>(null)
	const defaults = useRef<Defaults>({ light: {}, dark: {} })

	// Re-read the preset whenever it changes. Layout effect, so the first paint
	// after a preset switch already carries the rebased look.
	// The theme provider writes `data-sable-theme` in a passive effect, which
	// runs AFTER this layout effect — so without applying it here first, the
	// read measured the previous preset and every scale (corners, density)
	// compounded on the wrong base. Applying is idempotent.
	useLayoutEffect(() => {
		applySableTheme(themeId)
		setBase(readThemeBase(themeId))
	}, [themeId, presets])

	const css = useMemo(() => toCss(look, base, themeId), [look, base, themeId])

	useLayoutEffect(() => {
		let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
		if (!style) {
			style = document.createElement("style")
			style.id = STYLE_ID
			document.head.appendChild(style)
		}
		// Isolate every preset's tokens plus whatever the look sets now; each
		// name's default is read once and cached.
		presetNames.current = presetTokenNames()
		const names = new Set(presetNames.current)
		for (const match of css.matchAll(/(--[\w-]+)\s*:/g)) names.add(match[1])
		const missing = [...names].filter((name) => !(name in defaults.current.light))
		if (missing.length) {
			const read = readDefaults(missing)
			Object.assign(defaults.current.light, read.light)
			Object.assign(defaults.current.dark, read.dark)
		}
		style.textContent = `${css}\n${isolationCss(defaults.current)}\n${CHROME_RESET}`
	}, [css, presets])

	// A restored or shared look names fonts the page has not loaded yet.
	useEffect(() => {
		for (const entry of fontsInUse(look)) loadFont(entry)
	}, [look])

	// A share link has been read (theme, mode and look, during the first
	// render); clear it from the address bar so it does not ride along on every
	// page. The look is now the reader's own, saved to storage below.
	useEffect(() => {
		const url = new URL(window.location.href)
		const before = url.search
		for (const name of SHARE_PARAMS) url.searchParams.delete(name)
		if (url.search !== before) window.history.replaceState(window.history.state, "", url)
	}, [])

	const encoded = encodeLook(look)
	// Persisting is debounced: a drag produces an update per frame, and a
	// storage write on each one is wasted work. The live CSS above is applied
	// immediately; only the record of it waits for the drag to settle.
	useEffect(() => {
		const timer = window.setTimeout(() => {
			try {
				if (encoded) window.localStorage.setItem(STORAGE_KEY, encoded)
				else window.localStorage.removeItem(STORAGE_KEY)
			} catch {
				/* storage unavailable — the look lasts for this page view */
			}
		}, 250)
		return () => window.clearTimeout(timer)
	}, [encoded])

	const setLook = useCallback((patch: Partial<Look>) => setLookState((prev) => ({ ...prev, ...patch })), [])
	const reset = useCallback(() => {
		setLookState(DEFAULT_LOOK)
		try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* storage disabled */ }
	}, [])

	const isCustomized = Boolean(encoded)
	const requestPreset = useCallback(
		(id: string) => {
			if (isCustomized) {
				setPendingPreset(id)
				setOpen(true)
			} else if (id !== themeId) {
				setThemeId(id)
			}
		},
		[isCustomized, themeId, setThemeId],
	)
	const confirmPreset = useCallback(() => {
		if (!pendingPreset) return
		reset()
		setThemeId(pendingPreset)
		setPendingPreset(null)
	}, [pendingPreset, setThemeId, reset])
	const cancelPreset = useCallback(() => setPendingPreset(null), [])

	// Built only when shared: the current page, the preset and each changed
	// setting. A function, because the page changes without this provider
	// re-rendering. The theme is always named, so the reader's own saved preset
	// never shows through. Light/dark is left to the reader — every preset ships both.
	const getShareUrl = useCallback(() => {
		if (typeof window === "undefined") return ""
		const url = new URL(window.location.pathname, window.location.origin)
		url.searchParams.set("theme", themeId)
		for (const [name, value] of lookToParams(look)) url.searchParams.set(name, value)
		return url.toString()
	}, [look, themeId])

	const value = useMemo<CustomizerValue>(
		() => ({
			look, setLook, reset, css, getShareUrl, open, setOpen, isCustomized, base,
			requestPreset, pendingPreset, confirmPreset, cancelPreset,
		}),
		[look, setLook, reset, css, getShareUrl, open, isCustomized, base, requestPreset, pendingPreset, confirmPreset, cancelPreset],
	)

	return (
		<CustomizerContext.Provider value={value}>
			<IconProvider set={reiconIconSet}>{children}</IconProvider>
		</CustomizerContext.Provider>
	)
}
