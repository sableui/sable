import { useIconSet } from "./IconProvider"
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
	return <>{set({ name, variant: variant ?? defaultVariant, spin, className, title })}</>
}
