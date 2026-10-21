import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge, validators } from "tailwind-merge"

/**
 * Paired typography utilities (see styles.css `@utility text-*`). Each bundles
 * font-size + weight + line-height + tracking, so tailwind-merge must treat them
 * as one group that conflicts with the individual size/leading/weight/tracking
 * utilities — otherwise `cn("text-heading-1", "text-body-md")` won't dedupe.
 *
 * Keep in sync with the `@utility` blocks in styles.css.
 */
const dsTypographyTokens = [
	"display-4xl",
	"display-3xl",
	"display-2xl",
	"display-xl",
	"display-lg",
	"heading-1",
	"heading-2",
	"heading-3",
	"heading-4",
	"title-lg",
	"title-sm",
	"body-lg",
	"body-md",
	"body-sm",
	"body-xs",
	"label-lg",
	"label-md",
	"label-sm",
	"label-xs",
	"caption",
	"mono-xl",
	"mono-lg",
	"mono-md",
	"mono-caption",
	"mono-sm",
	// UI tier — the workspace register's chrome typography. Registering these is
	// not optional bookkeeping: an unrecognised `text-*` class lands in
	// tailwind-merge's COLOUR group, so `cn("text-ui-md", "text-primary-foreground")`
	// would drop the colour and render, for instance, white text on a white button.
	"ui-title",
	"ui-md",
	"ui-sm",
	"ui-body",
	"ui-section",
	"ui-micro",
	"ui-num",
] as const

const twMerge = extendTailwindMerge<"ds-typography" | "ds-concentric">({
	extend: {
		classGroups: {
			"ds-typography": [{ text: dsTypographyTokens }],
			// `rounded-concentric-<outer>/<inset>` (styles.css) is a border-radius.
			// Unregistered, tailwind-merge kept it AND a component's own
			// `rounded-sm`, so which radius won depended on stylesheet order — a
			// concentric override on a pill tab inside a card silently lost.
			"ds-concentric": [{ "rounded-concentric": [validators.isAny] }],
		},
		conflictingClassGroups: {
			"ds-typography": ["font-size", "leading", "font-weight", "tracking"],
			"ds-concentric": ["rounded"],
			rounded: ["ds-concentric"],
		},
	},
})

/** Merge class names with clsx, then resolve Tailwind conflicts (typography-aware). */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
