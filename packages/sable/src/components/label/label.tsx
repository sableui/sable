import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { SimpleTooltip } from "../tooltip"

/**
 * Label typography. `size` pairs to the `text-label-*` step; the base keeps the
 * non-selectable + peer-disabled dimming. Every size is sentence case. For an
 * uppercase, letter-spaced eyebrow, set `eyebrow` (the `text-overline` tier).
 */
const labelVariants = cva(
	"text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
	{
		variants: {
			size: {
				xs: "text-label-xs",
				sm: "text-label-sm",
				md: "text-label-md",
				lg: "text-label-lg",
			},
		},
		defaultVariants: {
			size: "lg",
		},
	},
)

export interface LabelProps
	extends ComponentPropsWithRef<"label">,
		VariantProps<typeof labelVariants> {
	/**
	 * When set, the label gains a dotted-underline "more info" affordance and
	 * reveals this content in a tooltip on hover/focus. Keyboard-accessible: the
	 * label becomes focusable and Base UI's Tooltip wires aria-describedby.
	 */
	hint?: ReactNode
	/**
	 * Set the label as an eyebrow: the uppercase, letter-spaced `text-overline`
	 * tier (a theme can make it sentence case). Replaces `size`. Use it for a
	 * kicker above a group, not for an ordinary field label.
	 */
	eyebrow?: boolean
}

/**
 * Label — a styled native `<label>`. Pair it with a control via `htmlFor` (or
 * by wrapping the control). When the associated control is a sibling `peer`
 * that is `disabled`, the label dims and shows a not-allowed cursor. Set `hint`
 * for a dotted-underline label that reveals help text in a tooltip.
 *
 *   <Label htmlFor="email">Email</Label>
 *   <Label htmlFor="discount" hint="Taken off every order this code is used on.">Discount</Label>
 */
export function Label({
	size,
	eyebrow = false,
	hint,
	className,
	tabIndex,
	...props
}: LabelProps) {
	const labelEl = (
		<label
			// The hint affordance must be focusable so keyboard users can open the
			// tooltip; otherwise the native label keeps its default (non-)tab behavior.
			tabIndex={hint != null ? (tabIndex ?? 0) : tabIndex}
			className={cn(
				labelVariants({ size }),
				eyebrow && "text-overline",
				hint != null &&
					"cursor-help border-b border-dotted border-muted-foreground/40",
				className,
			)}
			{...props}
		/>
	)
	if (hint == null) {
		return labelEl
	}
	return <SimpleTooltip content={hint}>{labelEl}</SimpleTooltip>
}
Label.displayName = "Label"
