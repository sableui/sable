import { useIconSet } from "./IconProvider"
import { nearestIconNames, resolveIconAlias } from "./names"
import type { IconVariant } from "./registry"

// The bundler's build-mode flag, as Base UI and React read it. Declared here
// rather than pulling Node's types into a browser package.
declare const process: { env: { NODE_ENV?: string } }

export interface IconProps {
	/** Semantic icon name (e.g. "heart", "gear", "chevron-down"). */
	name: string
	/** Override the provider's default variant. */
	variant?: IconVariant
	/** Spin animation. */
	spin?: boolean
	/** Size + color via Tailwind (e.g. "text-2xl text-muted-foreground"). Never a type utility. */
	className?: string
	/** Accessible label. Omit for purely decorative icons (hidden from AT). */
	title?: string
}

export const MISSING_ICON_PROVIDER =
	// design-lint-disable-next-line self-import -- the warning text names the consumer's import, not an import
	'Sable: <Icon> has no icon set, so icons render nothing. Wrap your app in <IconProvider set={reiconIconSet}> from "@sableui/react/icons/reicon".'

let warned = false
/** Names already reported as missing, so a list of rows warns once, not per row. */
const missingWarned = new Set<string>()

/** The development warning for a name the active set does not draw. */
export function missingIconMessage(name: string): string {
	return `Sable: <Icon name="${name}"> resolved to nothing in the active icon set, so it renders nothing. Nearest contract names: ${nearestIconNames(name).join(", ")}. The full list is registry.json → iconContract.names; an app's own names go in a set composed with composeIconSets.`
}

/**
 * Inside try, not behind `typeof process`: bundlers replace the literal
 * `process.env.NODE_ENV` text, and a typeof guard would read "undefined" in a
 * Vite dev build and silence the warning there. A build that defines nothing
 * throws, which reads as production — never a crash on the render path.
 */
function isDevelopment() {
	try {
		return process.env.NODE_ENV !== "production"
	} catch {
		return false
	}
}

/**
 * Render a semantic icon through the app's `IconProvider` set.
 *
 * There is no built-in fallback: an app that brings its own icons ships none
 * of Reicon's artwork. Without a provider, icons render nothing, and a
 * development build says so once per page.
 *
 * A name the set does not have is tried once more as another library's
 * spelling (`check-circle`, `settings`, `x` → the contract's `circle-check`,
 * `gear`, `xmark`; see ICON_ALIASES). Still nothing, and a development build
 * names the nearest contract names, once per name: a missing glyph renders as
 * an empty gap that reads like a layout choice, and through an app's own
 * wrapper (`<Glyph name={n} />`) no lint can see the literal.
 */
export function Icon({ name, variant, spin, className, title }: IconProps) {
	const { set, defaultVariant } = useIconSet()
	if (!set) {
		if (!warned && isDevelopment()) {
			warned = true
			console.warn(MISSING_ICON_PROVIDER)
		}
		return null
	}
	const props = { variant: variant ?? defaultVariant, spin, className, title }
	let rendered = set({ name, ...props })
	if (rendered == null) {
		const alias = resolveIconAlias(name)
		if (alias) rendered = set({ name: alias, ...props })
	}
	if (rendered == null) {
		if (!missingWarned.has(name) && isDevelopment()) {
			missingWarned.add(name)
			console.warn(missingIconMessage(name))
		}
		return null
	}
	return <>{rendered}</>
}
