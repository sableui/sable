import { reiconIconSet } from "../icon-sets/reicon"
import { useIconSet } from "./IconProvider"
import type { IconVariant } from "./registry"

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

/** Render a semantic icon with Reicon by default, or the app's IconProvider override. */
export function Icon({ name, variant, spin, className, title }: IconProps) {
	const { set, defaultVariant } = useIconSet()
	const resolved = set ?? reiconIconSet
	return (
		<>
			{resolved({ name, variant: variant ?? defaultVariant, spin, className, title })}
		</>
	)
}
