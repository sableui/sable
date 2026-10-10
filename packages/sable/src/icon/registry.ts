import type { ReactNode } from "react"

/** Icon weight/style. Open-ended so any set can define its own variants. */
export type IconVariant = "regular" | "solid" | "brands" | (string & {})

export interface IconRenderProps {
	/** Semantic icon name (e.g. "heart", "gear", "chevron-down"). */
	name: string
	/** Resolved variant (the IconProvider's default is applied before this reaches the set). */
	variant: IconVariant
	/** Spin animation. */
	spin?: boolean
	/** Tailwind / size + color classes (e.g. "text-2xl text-muted-foreground"). */
	className?: string
	/** Accessible label. When provided the set should expose the icon to AT; otherwise hide it. */
	title?: string
}

/**
 * An icon set resolves a semantic name (+ variant) to a React node.
 *
 * Reicon supplies the default glyphs. A consuming app can override or extend
 * the set through <IconProvider set={…}>.
 *
 * A set may render whatever it likes for a given name; it owns icon a11y
 * (use `title` → role="img"/aria-label, else aria-hidden).
 */
export type IconSet = (props: IconRenderProps) => ReactNode
