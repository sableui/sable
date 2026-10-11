import { Checkbox as Base } from "@base-ui/react/checkbox"
import { CheckboxGroup as BaseGroup } from "@base-ui/react/checkbox-group"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"
import {
	CHECK_BOX,
	SELECTION_CARD_GLYPH,
	SELECTION_CARD_LAYOUT,
	SELECTION_CARD_SHELL,
	SELECTION_CARD_TILE_HEAD,
} from "../../lib/selection-card"
import { CheckboxMark } from "../checkbox/checkbox-mark"
import {
	type CheckboxCardTone,
	checkboxCardToneClasses,
} from "./checkbox-card.variants"

export type CheckboxGroupProps = Omit<
	ComponentProps<typeof BaseGroup>,
	"className" | "children"
> & {
	className?: string
	children?: ReactNode
}

/**
 * CheckboxGroup — a column of CheckboxCards (or plain Checkboxes), over Base
 * UI's CheckboxGroup. Two ways to use it:
 *
 * 1. Layout only (the original contract): no group props, each card drives its
 *    own `checked` / `onCheckedChange`. This path renders a plain
 *    `div role="group"` so nothing about a card's own state changes — Base UI
 *    would otherwise bind any card with a `name` to the (empty) group value.
 * 2. Group-owned selection: pass `value` / `defaultValue` / `onValueChange`
 *    and give each child a `value`. The group holds the array of checked
 *    values. Add `allValues` and a `<Checkbox parent />` for "select all" —
 *    Base UI computes its checked / mixed state from the children.
 *
 *   <CheckboxGroup value={selected} onValueChange={setSelected}>
 *     {REASONS.map((r) => <CheckboxCard key={r} value={r} title={r} />)}
 *   </CheckboxGroup>
 *
 * Override the grid via className for a multi-column layout.
 */
export function CheckboxGroup({
	className,
	children,
	...props
}: CheckboxGroupProps) {
	const classes = cn("grid grid-cols-1 gap-2", className)
	const {
		value,
		defaultValue,
		onValueChange,
		allValues,
		disabled,
		render,
		style,
		...domProps
	} = props
	const groupOwned =
		value !== undefined ||
		defaultValue !== undefined ||
		onValueChange !== undefined ||
		allValues !== undefined ||
		disabled !== undefined ||
		render !== undefined ||
		typeof style === "function"
	if (!groupOwned) {
		return (
			<div
				role="group"
				className={classes}
				style={typeof style === "function" ? undefined : style}
				{...domProps}
			>
				{children}
			</div>
		)
	}
	return (
		<BaseGroup className={classes} {...props}>
			{children}
		</BaseGroup>
	)
}
CheckboxGroup.displayName = "CheckboxGroup"

export type CheckboxCardProps = Omit<
	ComponentProps<typeof Base.Root>,
	// `title` collides with the native HTML title attr; `children` is composed here.
	"className" | "children" | "title"
> & {
	className?: string
	/** The card's primary label. */
	title: ReactNode
	/** Optional supporting copy beneath the title. */
	description?: ReactNode
	/** Optional leading glyph (a solid `<Icon>`); takes the tone colour. */
	icon?: ReactNode
	/**
	 * Semantic colour the checked state carries across the border, checkbox box,
	 * and icon. Defaults to "neutral" (the primary/accent treatment).
	 */
	tone?: CheckboxCardTone
}

/**
 * CheckboxCard — a multi-select selection card: a card-sized Base UI Checkbox
 * with a checkbox box, title, and optional description. The checkbox twin of
 * RadioCard; map a list to a column of cards. Either each card drives its own
 * checked state, or the CheckboxGroup owns the selection and each card names
 * itself with `value`.
 *
 *   <CheckboxGroup value={selected} onValueChange={setSelected}>
 *     {REASONS.map((r) => <CheckboxCard key={r} value={r} title={r} />)}
 *   </CheckboxGroup>
 */
export function CheckboxCard({
	className,
	title,
	description,
	icon,
	tone = "neutral",
	...props
}: CheckboxCardProps) {
	const t = checkboxCardToneClasses[tone]
	const box = (
		<span className={cn(CHECK_BOX, t.box)}>
			<CheckboxMark className={t.check} />
		</span>
	)
	return (
		<Base.Root
			className={cn(
				SELECTION_CARD_SHELL,
				icon != null ? SELECTION_CARD_LAYOUT.tile : SELECTION_CARD_LAYOUT.row,
				t.card,
				className,
			)}
			{...props}
		>
			{icon != null ? (
				// The tile, as RadioCard draws it (lib/selection-card).
				<span className={SELECTION_CARD_TILE_HEAD}>
					<span className={cn(SELECTION_CARD_GLYPH, t.glyph)}>{icon}</span>
					{box}
				</span>
			) : (
				// The box sits on the title's first line — a box `1lh` tall in the
				// title's tier, centred — rather than nudged down by a fixed margin
				// that only matched one line height.
				<span className="flex h-[1lh] shrink-0 items-center text-title-sm">{box}</span>
			)}
			<span className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-title-sm">{title}</span>
				{description ? (
					<span className="text-body-sm text-muted-foreground">
						{description}
					</span>
				) : null}
			</span>
		</Base.Root>
	)
}
CheckboxCard.displayName = "CheckboxCard"
