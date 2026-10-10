import type { ComponentPropsWithRef, CSSProperties, ElementType } from "react"
import { cn } from "../lib/cn"
import { type Edge, safeAreaInsets } from "./_safeArea"

/**
 * Purpose-named content widths (resolve to theme tokens). Pick by ROLE, not size.
 * Cap text measure (`prose`) separately from layout width.
 * - `prose`   65ch  — long-form reading text (post body, descriptions, articles)
 * - `form`    480px — narrow single-column forms, auth, dialogs
 * - `feed`    640px — single-column timeline / reading feed
 * - `content` 896px — general content + settings/admin panes (some 2-up fields)
 * - `wide`    1280px — dashboards, tables, multi-column grids
 * - `full`    1536px — full-bleed safety ceiling
 * - `ultrawide` 1800px — legacy; prefer `full`
 */
export type RegionMax =
	| "prose"
	| "form"
	| "feed"
	| "content"
	| "wide"
	| "full"
	| "ultrawide"

const NAMED_MAX: Record<RegionMax, string> = {
	prose: "var(--measure-prose)",
	form: "var(--region-form)",
	feed: "var(--region-feed)",
	content: "var(--region-content)",
	wide: "var(--region-wide)",
	full: "var(--region-full)",
	ultrawide: "var(--region-ultrawide)",
}

export interface RegionProps extends ComponentPropsWithRef<"div"> {
	/** Semantic element to render (e.g. "main", "section", "nav"). Default "div". */
	as?: ElementType
	/** Apply the fluid horizontal page inset (`--page-inset`). Default true. */
	inset?: boolean
	/**
	 * Opt-in centered max-width cap: a purpose-named region ("prose" | "form" |
	 * "feed" | "content" | "wide" | "full") or any raw CSS length (e.g. "56rem").
	 * Omit for fully fluid, edge-to-edge (the default).
	 */
	max?: RegionMax | (string & {})
	/** Full-bleed: edge to edge with no inset. Overrides `inset`. */
	bleed?: boolean
	/**
	 * Apply `env(safe-area-inset-*)` padding — for fixed or native-shell surfaces.
	 * `true` pads top + bottom (the legacy behavior); pass an edge array
	 * (`["top"]`, `["bottom"]`, …) to target specific edges, mirroring `SafeArea`.
	 */
	safeArea?: boolean | Edge[]
}

/**
 * The page region. Fluid-first: full width with a fluid page inset, NOT a
 * centered fixed-width container. Reach for `max` only when a specific region
 * (a reading column, a settings pane) genuinely needs a cap.
 */
export function Region({
	as,
	inset = true,
	max,
	bleed = false,
	safeArea = false,
	className,
	style,
	children,
	ref,
	...rest
}: RegionProps) {
	const Comp = (as ?? "div") as ElementType
	const maxWidth = max ? (NAMED_MAX[max as RegionMax] ?? max) : undefined
	const safeEdges: Edge[] =
		safeArea === true
			? ["top", "bottom"]
			: Array.isArray(safeArea)
				? safeArea
				: []
	const mergedStyle: CSSProperties = {
		...(maxWidth ? { maxWidth, marginInline: "auto" } : null),
		...(!bleed && inset ? { paddingInline: "var(--page-inset)" } : null),
		...safeAreaInsets(safeEdges),
		...style,
	}
	return (
		<Comp ref={ref} className={cn("w-full", className)} style={mergedStyle} {...rest}>
			{children}
		</Comp>
	)
}
