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
import { LOOK_STYLE_ID, writeLook } from "./apply"
import { resolveTheme } from "./color"
import { loadFont } from "./fonts"
import { resolveShadows } from "./shadow"
import {
	CONTROL_STEPS,
	DEFAULT_LOOK,
	DEFAULT_RHYTHM,
	type Look,
	RADIUS_STEPS,
	TYPE_SIZE_TIERS,
	type ThemeBase,
	SHARE_PARAMS,
	decodeLook,
	encodeLook,
	fontsInUse,
	hasLookParams,
	lookDecls,
	lookFromParams,
	lookToParams,
	toCss,
} from "./look"

const ISOLATION_ID = "sable-docs-isolation"
const STORAGE_KEY = "sable-docs-look"
/**
 * What a share link replaced (the reader's own look, preset and mode), kept
 * until they choose to restore it or keep the shared one.
 */
export const PREVIOUS_KEY = "sable-docs-look-previous"
/** The retired base64 param; old share links still decode. */
const LEGACY_PARAM = "look"
/** Where app.css changes the docs' --type-base (16 → 14). */
const TYPE_BASE_QUERY = "(min-width: 768px)"

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
 * Tokens that Sable re-declares on every `[data-sable-theme]` element (the
 * palette, the derived surfaces, the rhythm) are left alone: they never
 * inherit, and both kinds of isolated element carry the attribute.
 * `:where()` keeps that reset at zero specificity: a preset's own
 * declarations still win, and only the inherited leak is replaced.
 * Preview-only: none of this is part of the export. It lives in its own
 * <style>, rewritten when a preset arrives or the look first sets a new kind
 * of token, never per drag step.
 */
const ISOLATED = ":where([data-canvas-chrome], [data-preset-preview])"
const ISOLATED_DARK =
	":where(.dark [data-canvas-chrome]:not(.light), .dark[data-canvas-chrome], .dark [data-preset-preview]:not(.light), .dark[data-preset-preview])"

type Defaults = { light: Record<string, string>; dark: Record<string, string> }

/**
 * Custom properties by where they are declared: `specific` in a rule for one
 * preset (`[data-sable-theme="…"]`), `generic` in a rule for every themed
 * element (`[data-sable-theme]`, which an isolated element carries itself).
 */
function themeTokenNames(): { specific: Set<string>; generic: Set<string> } {
	const specific = new Set<string>()
	const generic = new Set<string>()
	const walk = (rules: CSSRuleList) => {
		for (const rule of Array.from(rules)) {
			if (rule instanceof CSSStyleRule) {
				const selector = rule.selectorText
				const target = selector.includes("[data-sable-theme]") ? generic : selector.includes("[data-sable-theme") ? specific : null
				if (target) for (const name of Array.from(rule.style)) if (name.startsWith("--")) target.add(name)
			} else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules)
		}
	}
	for (const sheet of Array.from(document.styleSheets)) {
		const owner = sheet.ownerNode as Element | null
		if (owner?.id === LOOK_STYLE_ID || owner?.id === ISOLATION_ID) continue
		try {
			walk(sheet.cssRules)
		} catch {
			// Cross-origin sheets (Google Fonts) cannot be read; they declare no tokens.
		}
	}
	return { specific, generic }
}

/**
 * Sable's defaults for `names` in both modes, read on <html> with the look
 * switched off and no preset attribute. Synchronous inside a layout effect,
 * so nothing paints in between.
 */
function readDefaults(names: string[]): Defaults {
	const html = document.documentElement
	const sheet = (document.getElementById(LOOK_STYLE_ID) as HTMLStyleElement | null)?.sheet
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

function isolationCss(names: Iterable<string>, defaults: Defaults): string {
	const light: string[] = []
	const dark: string[] = []
	for (const name of names) {
		// No default: the token is unset in Sable, so the reset unsets it too
		// (`initial` makes var() fall back, as it would with no preset).
		const value = defaults.light[name] || "initial"
		light.push(`${name}: ${value};`)
		const darkValue = defaults.dark[name] || "initial"
		if (darkValue !== value) dark.push(`${name}: ${darkValue};`)
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

/** What the shared link replaced, restorable. */
interface PreviousLook {
	look: string
	/** The share link's look that replaced it, to tell an untouched link from the reader's later edits. */
	link?: string
	themeId: string | null
	mode: string | null
}

/**
 * The fast-changing half: the look itself and what derives from it. Read it
 * only where the look is shown (the inspector, a live readout); every consumer
 * re-renders on each drag step.
 */
interface CustomizerLook {
	look: Look
	css: string
	base: ThemeBase
	/** A link to the current page with this preset and look. */
	getShareUrl: () => string
}

/**
 * The stable half: actions and panel state. Changes only when the panel opens
 * or closes, a confirm comes up, or the look goes from untouched to touched —
 * so the shell and the canvas can read it without re-rendering per drag step.
 */
interface CustomizerActions {
	setLook: (patch: Partial<Look>) => void
	/** Clear the look, keeping what it was for restoreCleared. */
	reset: () => void
	/** Bring back the look the last reset (or "start fresh") cleared; false when there is none. */
	restoreCleared: () => boolean
	open: boolean
	setOpen: (open: boolean) => void
	isCustomized: boolean
	/**
	 * Choose a preset from anywhere (the inspector, the Themes page). With
	 * changes in play, the choice waits in `pendingPreset` for the inspector's
	 * confirm, which can keep them or start fresh.
	 */
	requestPreset: (id: string) => void
	pendingPreset: string | null
	/** Switch to the pending preset; `keep` carries the look over (it is relative to the preset by construction). */
	confirmPreset: (options?: { keep?: boolean }) => void
	cancelPreset: () => void
	/** Set when a share link replaced the reader's own look; restore it or keep the shared one. */
	sharedLook: { restore: () => void; keep: () => void } | null
}

type CustomizerValue = CustomizerLook & CustomizerActions

const LookContext = createContext<CustomizerLook | null>(null)
const ActionsContext = createContext<CustomizerActions | null>(null)

/** The look and its actions. Re-renders on every look change; prefer useCustomizerActions where the look itself is not shown. */
export function useCustomizer(): CustomizerValue {
	const look = useContext(LookContext)
	const actions = useContext(ActionsContext)
	if (!look || !actions) throw new Error("useCustomizer must be used inside <CustomizerProvider>")
	return { ...look, ...actions }
}

/** Panel state and actions only: does not re-render while a control is dragged. */
export function useCustomizerActions(): CustomizerActions {
	const actions = useContext(ActionsContext)
	if (!actions) throw new Error("useCustomizerActions must be used inside <CustomizerProvider>")
	return actions
}

function storage(key: string): string | null {
	try {
		return window.localStorage.getItem(key)
	} catch {
		return null
	}
}

interface InitialLook {
	look: Look
	/** What a share link replaced, when it differs from the link. */
	previous: PreviousLook | null
}

/**
 * A share link (`?theme=` or any look field) defines the whole design, so its
 * look wins over the reader's saved one — even when it carries no changes.
 * What it replaced is kept (see PREVIOUS_KEY), so opening a colleague's link
 * never silently costs the reader their own work. Runs during the first
 * render, before the theme provider writes the link's preset to storage.
 */
function readInitialLook(): InitialLook {
	if (typeof window === "undefined") return { look: DEFAULT_LOOK, previous: null }
	const params = new URLSearchParams(window.location.search)
	const legacy = params.get(LEGACY_PARAM)
	const shared = legacy ? decodeLook(legacy) : params.has("theme") || hasLookParams(params) ? lookFromParams(params) : null
	if (!shared) {
		const pending = storage(PREVIOUS_KEY)
		return { look: decodeLook(storage(STORAGE_KEY)), previous: pending ? parsePrevious(pending) : null }
	}
	const ownLook = storage(STORAGE_KEY) ?? ""
	// An earlier link is still waiting on the reader's answer, and what is in
	// storage is still that link's look, untouched: it is not theirs. Keep the
	// look already set aside, or a second link would overwrite it with the
	// first link's. If they have edited since, storage is their work again and
	// is set aside below like any other.
	const pending = storage(PREVIOUS_KEY)
	const kept = pending ? parsePrevious(pending) : null
	if (kept?.link != null && kept.link === ownLook) return { look: shared, previous: { ...kept, link: encodeLook(shared) } }
	const ownTheme = storage("sable-docs-theme-id")
	const ownMode = storage("sable-docs-theme")
	const sharedTheme = params.get("theme")
	const lookDiffers = ownLook !== "" && encodeLook(decodeLook(ownLook)) !== encodeLook(shared)
	const themeDiffers = ownTheme != null && sharedTheme != null && ownTheme !== sharedTheme
	const previous = lookDiffers || themeDiffers ? { look: ownLook, themeId: ownTheme, mode: ownMode, link: encodeLook(shared) } : null
	return { look: shared, previous }
}

function parsePrevious(raw: string): PreviousLook | null {
	try {
		const value = JSON.parse(raw) as Partial<PreviousLook>
		return typeof value.look === "string" ? { look: value.look, themeId: value.themeId ?? null, mode: value.mode ?? null, link: typeof value.link === "string" ? value.link : undefined } : null
	} catch {
		return null
	}
}

/** A number token, or `fallback` when the preset leaves it unset. */
function numberToken(computed: CSSStyleDeclaration, name: string, fallback: number): number {
	const n = Number.parseFloat(computed.getPropertyValue(name))
	return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * Read the active preset's own radius, control ladder, type sizes, colors and shadows
 * (both modes) with the look switched off, so every scale is relative to the
 * preset — never compounded on top of a previous scale.
 */
function readThemeBase(themeId: string): ThemeBase {
	const style = document.getElementById(LOOK_STYLE_ID) as HTMLStyleElement | null
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
	const rhythm = {
		leadingScale: numberToken(computed, "--theme-leading-scale", DEFAULT_RHYTHM.leadingScale),
		typeBase: numberToken(computed, "--type-base", DEFAULT_RHYTHM.typeBase),
		bodyLeading: numberToken(computed, "--type-body-md-leading", DEFAULT_RHYTHM.bodyLeading),
	}
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
	return { radius, control, typeSize, colors, rootPx, motionBaseMs, shadows, rhythm }
}

const EMPTY_BASE: ThemeBase = { radius: {}, typeSize: {}, control: {}, colors: null, rootPx: 16, motionBaseMs: 200, shadows: null, rhythm: DEFAULT_RHYTHM }

export function CustomizerProvider({ children }: { children: ReactNode }) {
	const { themeId, setThemeId, setPreference, presets } = useTheme()
	const [initial] = useState(readInitialLook)
	const [look, setLookState] = useState<Look>(initial.look)
	const [base, setBase] = useState<ThemeBase>(EMPTY_BASE)
	const [open, setOpen] = useState(false)
	const [pendingPreset, setPendingPreset] = useState<string | null>(null)
	const [previous, setPrevious] = useState<PreviousLook | null>(initial.previous)

	// The look as of the last change, for setLook calls in the same frame.
	const current = useRef(look)
	// One step back from a clear: Reset all and "Start fresh" are the only
	// actions that throw work away, so the look they cleared is kept.
	const cleared = useRef<Look | null>(null)

	const commit = useCallback((next: Look) => {
		if (encodeLook(current.current) === encodeLook(next)) return
		current.current = next
		setLookState(next)
	}, [])

	// Re-read the preset whenever it changes. Layout effect, so the first paint
	// after a preset switch already carries the rebased look.
	// The theme provider writes `data-sable-theme` in a passive effect, which
	// runs AFTER this layout effect — so without applying it here first, the
	// read measured the previous preset and every scale (corners, density)
	// compounded on the wrong base. Applying is idempotent.
	//
	// The docs' --type-base steps from 16 to 14 at 768px (app.css), and the
	// type anchors are relative to it, so crossing that width re-reads too.
	const [typeBaseQuery, setTypeBaseQuery] = useState(() => typeof window !== "undefined" && window.matchMedia(TYPE_BASE_QUERY).matches)
	useEffect(() => {
		const query = window.matchMedia(TYPE_BASE_QUERY)
		const change = () => setTypeBaseQuery(query.matches)
		query.addEventListener("change", change)
		return () => query.removeEventListener("change", change)
	}, [])
	useLayoutEffect(() => {
		applySableTheme(themeId)
		setBase(readThemeBase(themeId))
	}, [themeId, presets, typeBaseQuery])

	const decls = useMemo(() => lookDecls(look, base), [look, base])
	const css = useMemo(() => toCss(look, base, themeId, decls), [look, base, themeId, decls])

	// The look, applied: changed declarations only, one CSSOM write per frame (see apply.ts).
	useLayoutEffect(() => {
		writeLook(decls)
	}, [decls])

	// The isolation (see ISOLATED). Its token set changes only when a preset
	// arrives or the look sets a kind of token it has not set before, so this
	// rewrites its <style> a handful of times a session — never per drag step.
	const isolation = useRef<{ names: Set<string>; generic: Set<string>; defaults: Defaults; presets: unknown } | null>(null)
	useLayoutEffect(() => {
		let state = isolation.current
		if (!state || state.presets !== presets) {
			const { specific, generic } = themeTokenNames()
			state = { names: new Set([...specific].filter((name) => !generic.has(name))), generic, defaults: { light: {}, dark: {} }, presets }
			isolation.current = state
		}
		// A fresh state (first run, or a preset arrived) has read no defaults yet.
		let grew = Object.keys(state.defaults.light).length === 0
		for (const decl of [...decls.root, ...decls.dark]) {
			const name = decl.slice(0, decl.indexOf(":")).trim()
			if (!state.names.has(name) && !state.generic.has(name)) {
				state.names.add(name)
				grew = true
			}
		}
		if (!grew) return
		const missing = [...state.names].filter((name) => !(name in state.defaults.light))
		if (missing.length) {
			const read = readDefaults(missing)
			Object.assign(state.defaults.light, read.light)
			Object.assign(state.defaults.dark, read.dark)
		}
		let style = document.getElementById(ISOLATION_ID) as HTMLStyleElement | null
		if (!style) {
			style = document.createElement("style")
			style.id = ISOLATION_ID
			document.head.appendChild(style)
		}
		style.textContent = `${isolationCss(state.names, state.defaults)}\n${CHROME_RESET}`
	}, [decls, presets])

	// A restored or shared look names fonts the page has not loaded yet.
	useEffect(() => {
		for (const entry of fontsInUse(look)) loadFont(entry)
	}, [look])

	// A share link has been read (theme, mode and look, during the first
	// render); clear it from the address bar so it does not ride along on every
	// page. What it replaced waits under PREVIOUS_KEY until the reader decides.
	useEffect(() => {
		const url = new URL(window.location.href)
		const before = url.search
		for (const name of SHARE_PARAMS) url.searchParams.delete(name)
		if (url.search !== before) window.history.replaceState(window.history.state, "", url)
		if (initial.previous) {
			try {
				window.localStorage.setItem(PREVIOUS_KEY, JSON.stringify(initial.previous))
			} catch {
				/* storage unavailable: the offer lasts for this page view */
			}
		}
	}, [initial])

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

	const setLook = useCallback((patch: Partial<Look>) => commit({ ...current.current, ...patch }), [commit])
	const reset = useCallback(() => {
		if (encodeLook(current.current)) cleared.current = current.current
		commit(DEFAULT_LOOK)
	}, [commit])
	const restoreCleared = useCallback(() => {
		const look = cleared.current
		if (!look) return false
		cleared.current = null
		commit(look)
		return true
	}, [commit])

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
	const confirmPreset = useCallback(
		({ keep = false }: { keep?: boolean } = {}) => {
			if (!pendingPreset) return
			if (!keep) reset()
			setThemeId(pendingPreset)
			setPendingPreset(null)
		},
		[pendingPreset, setThemeId, reset],
	)
	const cancelPreset = useCallback(() => setPendingPreset(null), [])

	const forgetPrevious = useCallback(() => {
		setPrevious(null)
		try {
			window.localStorage.removeItem(PREVIOUS_KEY)
		} catch {
			/* storage unavailable */
		}
	}, [])
	const sharedLook = useMemo(
		() =>
			previous
				? {
						restore: () => {
							if (previous.themeId) setThemeId(previous.themeId)
							if (previous.mode === "light" || previous.mode === "dark" || previous.mode === "system") setPreference(previous.mode)
							commit(decodeLook(previous.look))
							forgetPrevious()
						},
						keep: forgetPrevious,
					}
				: null,
		[previous, setThemeId, setPreference, commit, forgetPrevious],
	)

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

	const lookValue = useMemo<CustomizerLook>(
		() => ({ look, css, base, getShareUrl }),
		[look, css, base, getShareUrl],
	)
	const actions = useMemo<CustomizerActions>(
		() => ({ setLook, reset, restoreCleared, open, setOpen, isCustomized, requestPreset, pendingPreset, confirmPreset, cancelPreset, sharedLook }),
		[setLook, reset, restoreCleared, open, isCustomized, requestPreset, pendingPreset, confirmPreset, cancelPreset, sharedLook],
	)

	return (
		<ActionsContext.Provider value={actions}>
			<LookContext.Provider value={lookValue}>
				<IconProvider set={reiconIconSet}>{children}</IconProvider>
			</LookContext.Provider>
		</ActionsContext.Provider>
	)
}
