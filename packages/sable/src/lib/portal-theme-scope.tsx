"use client";

import {
	type ComponentType,
	type ReactNode,
	type Ref,
	useMemo,
	useRef,
	useState,
} from "react"
import { mergeRefs } from "./refs"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

/**
 * Theme scope, carried across a portal.
 *
 * Themes are CSS scoped by `[data-sable-theme="<id>"]` plus a `dark`/`light`
 * class, and a page may theme just a SUBTREE:
 *
 *   <div data-sable-theme="ember" class="dark"> … <Select /> … </div>
 *
 * Every popup (Select, Menu, Popover, Tooltip, Dialog, …) portals to `<body>`,
 * which is outside that subtree, so before this existed the popup painted with
 * the HOST page's theme and mode: a white Ember timezone list on a dark Ember
 * settings page, which the reference page patched by hand at the call site.
 *
 * Unlike density, a theme scope is a plain attribute the consumer writes — there
 * is no React context to read — so the scope is found in the DOM. While the popup
 * mounts, a hidden probe renders where the content sits in the React tree (inside
 * the subtree, beside its trigger), reads the nearest scope, mirrors it onto the
 * portal root, and is removed in the same commit, before paint. It never stays
 * in the DOM, so it cannot disturb `space-y-*` or `:last-child` selectors.
 *
 * The root scope (`<html data-sable-theme class="dark">`) is the common case, and
 * the portal already inherits it from `<body>`; scopes on `<html>` are ignored, so
 * nothing changes for a page with no themed subtree.
 */

/** The scope a popup should render in, resolved from where it was opened. */
export interface PortalThemeScope {
	/** The nearest non-root `data-sable-theme` value, if any. */
	theme?: string
	/** The nearest non-root explicit mode (`dark` or `light` class), if any. */
	mode?: "dark" | "light"
	/** The themed subtree's resolved font stack (themes set `--font-*`). */
	fontFamily?: string
}

/** Resolve the theme scope around `from`, ignoring scopes set on `<html>`. */
export function resolvePortalThemeScope(from: Element): PortalThemeScope {
	const root = from.ownerDocument.documentElement
	const scope: PortalThemeScope = {}

	const themeEl = from.closest("[data-sable-theme]")
	if (themeEl && themeEl !== root) {
		const theme = themeEl.getAttribute("data-sable-theme")
		if (theme) scope.theme = theme
		const view = from.ownerDocument.defaultView
		const fontFamily = view?.getComputedStyle(themeEl).fontFamily
		if (fontFamily) scope.fontFamily = fontFamily
	}

	// Nearest explicit mode wins. `light` is an explicit opt-out (a light island
	// inside a dark page), so an element carrying it is light even if it also
	// says `dark`.
	const modeEl = from.closest(".dark, .light")
	if (modeEl && modeEl !== root) {
		scope.mode = modeEl.classList.contains("light") ? "light" : "dark"
	}

	return scope
}

/** Mirror a resolved scope onto a portal root. No-op for an empty scope. */
export function applyPortalThemeScope(target: HTMLElement, scope: PortalThemeScope) {
	if (scope.theme) target.setAttribute("data-sable-theme", scope.theme)
	if (scope.mode) {
		target.classList.toggle("dark", scope.mode === "dark")
		target.classList.toggle("light", scope.mode === "light")
	}
	// Only alongside a theme: a mode-only island keeps the page's fonts.
	if (scope.theme && scope.fontFamily) target.style.fontFamily = scope.fontFamily
}

/**
 * Wire a Base UI `Portal` to the theme scope of the place it was rendered from.
 *
 *   const scope = usePortalThemeScope()
 *   return (
 *     <>
 *       <Base.Portal ref={scope.portalRef}>…</Base.Portal>
 *       {scope.probe}
 *     </>
 *   )
 *
 * `probe` must render OUTSIDE the portal (as a sibling), since its job is to sit
 * in the original DOM position. It renders only for the commit in which a portal
 * root first mounts.
 */
export function usePortalThemeScope(): {
	portalRef: (node: HTMLElement | null) => void
	probe: ReactNode
} {
	const [portal, setPortal] = useState<HTMLElement | null>(null)
	const [probed, setProbed] = useState<HTMLElement | null>(null)
	const probeRef = useRef<HTMLSpanElement>(null)
	const pending = portal !== null && probed !== portal

	useIsomorphicLayoutEffect(() => {
		if (!pending || !portal) return
		const probe = probeRef.current
		if (probe) applyPortalThemeScope(portal, resolvePortalThemeScope(probe))
		setProbed(portal)
	}, [pending, portal])

	return {
		portalRef: setPortal,
		probe: pending ? <span ref={probeRef} hidden data-sable-portal-probe="" /> : null,
	}
}

/**
 * Wrap a Base UI `Portal` part so it carries the theme scope across.
 *
 *   export const SelectPortal = withPortalThemeScope(Base.Portal)
 *
 * Every Sable `*Content` renders through its wrapped `*Portal`, so the public
 * `*Portal` part and the composed surface behave the same way.
 */
export function withPortalThemeScope<P extends { ref?: Ref<HTMLDivElement> }>(
	Portal: ComponentType<P>,
) {
	function ScopedPortal(props: P) {
		const { ref } = props
		const scope = usePortalThemeScope()
		const merged = useMemo(
			() => mergeRefs<HTMLDivElement>(ref, scope.portalRef),
			[ref, scope.portalRef],
		)
		return (
			<>
				<Portal {...props} ref={merged} />
				{scope.probe}
			</>
		)
	}
	ScopedPortal.displayName = `ScopedPortal(${Portal.displayName ?? "Portal"})`
	return ScopedPortal
}
