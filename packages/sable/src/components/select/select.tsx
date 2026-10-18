"use client";

import { Select as Base } from "@base-ui/react/select"
import {
	Children,
	type ComponentProps,
	isValidElement,
	type ReactNode,
} from "react"
import { Icon } from "../../icon"
import { anchoredListScroll } from "../../lib/anchored-scroll"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity, useDensity, useTypeTier } from "../../lib/density"
import { HighlightGlide } from "../../lib/highlight-glide"

/**
 * Select — themed wrapper over Base UI's Select (typeahead, roving focus,
 * collision-aware positioning, ARIA listbox/option wiring, and form integration
 * all come from Base UI). Read state from `data-[popup-open]`, `data-[highlighted]`,
 * `data-[selected]`, and `data-[disabled]`. Compose:
 *
 *   <Select value={value} onValueChange={setValue}>
 *     <SelectTrigger placeholder="Pick one" />
 *     <SelectContent>
 *       <SelectItem value="a">Option A</SelectItem>
 *       <SelectItem value="b">Option B</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Grouped:
 *
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectGroupLabel>Fonts</SelectGroupLabel>
 *       <SelectItem value="sans">Sans-serif</SelectItem>
 *     </SelectGroup>
 *   </SelectContent>
 */
/**
 * Flattens string/number children (including interpolation arrays like
 * `Option {n}`) to their text; returns undefined when any part is an element,
 * since its rendered text can't be known without rendering it.
 */
function textContent(node: ReactNode): string | undefined {
	if (typeof node === "string") return node
	if (typeof node === "number") return String(node)
	if (Array.isArray(node)) {
		let text = ""
		for (const part of node) {
			const t = textContent(part)
			if (t === undefined) return undefined
			text += t
		}
		return text
	}
	return undefined
}

/**
 * Walks the JSX children for SelectItems and derives Base UI's `items` map
 * (value → label). Base UI only learns item labels when the (portalled) popup
 * mounts, so without `items` a closed trigger renders the raw `value` instead
 * of the display text. Values may be strings or numbers (Base UI's record
 * lookup coerces keys). The walk only sees literal SelectItem elements — items
 * produced inside consumer wrapper components, or whose children contain
 * elements and carry no `label`, are skipped: pass `items` on Select
 * explicitly for those.
 */
function deriveItemLabels(
	node: ReactNode,
	out: Record<string, ReactNode> = {},
): Record<string, ReactNode> {
	for (const child of Children.toArray(node)) {
		if (!isValidElement(child)) continue
		const props = child.props as {
			value?: unknown
			label?: string
			children?: ReactNode
		}
		if (child.type === SelectItem) {
			const label = props.label ?? textContent(props.children)
			const { value } = props
			if (
				(typeof value === "string" || typeof value === "number") &&
				label !== undefined
			) {
				out[String(value)] = label
			}
			continue
		}
		if (props.children) deriveItemLabels(props.children, out)
	}
	return out
}

/**
 * The root. Base UI's Root plus label derivation: when `items` isn't passed,
 * the SelectItem children are scanned so the closed trigger shows each item's
 * display text (string/number children or `label`) instead of its raw `value`.
 */
export function Select<Value, Multiple extends boolean | undefined = false>({
	items,
	children,
	...props
}: Base.Root.Props<Value, Multiple>) {
	// Not memoized on purpose: JSX children are a fresh object every render, so
	// a children-keyed useMemo would never hit; the walk is a cheap linear scan.
	const derived = items === undefined ? deriveItemLabels(children) : undefined
	const resolvedItems =
		items ??
		(derived && Object.keys(derived).length > 0 ? derived : undefined)
	return (
		<Base.Root items={resolvedItems} {...props}>
			{children}
		</Base.Root>
	)
}
export const SelectPortal = withPortalThemeScope(Base.Portal)
export const SelectGroup = Base.Group
/**
 * Renders the selected option's label (with a `placeholder` fallback). Already
 * composed inside SelectTrigger; exported for advanced layouts that render the
 * value outside the default trigger.
 */
export const SelectValue = Base.Value

type TriggerProps = Omit<
	ComponentProps<typeof Base.Trigger>,
	"className" | "children"
> & {
	className?: string
	/** Placeholder text shown when no value is selected. */
	placeholder?: ReactNode
	/**
	 * Which rung of the control ladder the trigger sits on.
	 *
	 * `xs` is the PROPERTY-GRID size: a select that shares a row with a
	 * `ScrubField` or sits in a `PanelSection`. It is not merely `md` made
	 * shorter — height, padding, radius AND surface move together, which is the
	 * whole reason it is a prop rather than a className.
	 *
	 * The surface is the part a `h-(--control-xs)` override could never reach,
	 * and it is what the eye actually catches. A property grid's fields are
	 * inset, not raised: `ScrubField` — the control immediately beside this one
	 * on the same rung — is `bg-panel-field` with no border, and a bordered `bg-card`
	 * select beside it reads as a different KIND of control rather than the same
	 * control holding a word. Consumers that overrode the height got an
	 * md-register 8px radius on a 24px box and a raised card among inset fields;
	 * Glitch's inspector had eleven of those, and both tells are visible at a
	 * glance in a 240px panel.
	 *
	 * @default "md"
	 */
	size?: "md" | "xs"
	/** Override the rendered value content (receives the selected value). */
	children?: ComponentProps<typeof Base.Value>["children"]
}

/**
 * The trigger button. Composes Base UI's Trigger + Value (the selected label)
 * and a trailing chevron Icon slot that flips via `data-[popup-open]`.
 */
export function SelectTrigger({
	className,
	placeholder,
	size = "md",
	children,
	...props
}: TriggerProps) {
	const tier = useTypeTier()
	// The 16px iOS floor, shared with Input/Textarea (full rationale in
	// components/input/input.tsx). This trigger is a <button>, so Safari does not
	// zoom on IT — but it stands in a form row beside fields that now render
	// `text-body-lg` (17px) below `sm`, and a select left at 15px reads as a
	// different control. Below `sm` it takes the same paired tier up; at `sm` and
	// above the designed tier is restored, so desktop is unchanged. `xs` is the
	// 24px property-grid rung — 17px type would not fit its box, and it never
	// sits in a page-register form row.
	const density = useDensity()
	const mobileTier =
		density === "comfortable" && size === "md" && MOBILE_FIELD_TIER
	return (
		<Base.Trigger
			className={cn(
				`flex w-full items-center justify-between ${tier.body} text-foreground motion-interactive`,
				mobileTier,
				size === "xs"
					? cn("h-(--control-xs) gap-1 px-1.5", FIELD_SHELL_XS)
					: "h-(--control-md) gap-2 rounded-sm border border-field-border bg-field px-3",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"data-[popup-open]:ring-2 data-[popup-open]:ring-ring",
				// Invalid like every other field: Base UI marks the trigger
				// `data-invalid` inside a Field, an explicit aria-invalid works too.
				"data-[invalid]:border-destructive data-[invalid]:ring-destructive/30",
				FIELD_INVALID,
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<Base.Value placeholder={placeholder}>{children}</Base.Value>
			<Base.Icon className="flex items-center justify-center">
				<Icon
					name="chevron-down"
					className="text-xs opacity-60 motion-interactive data-[popup-open]:rotate-180"
				/>
			</Base.Icon>
		</Base.Trigger>
	)
}

type PositionerProps = ComponentProps<typeof Base.Positioner>
type ContentProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/** Which side of the trigger to render against. @default "bottom" */
	side?: PositionerProps["side"]
	/** Alignment along the chosen side. @default "start" */
	align?: PositionerProps["align"]
	/** Gap between trigger and popup, in px. @default 6 */
	sideOffset?: PositionerProps["sideOffset"]
}

/**
 * The popup surface. Composes Portal + Positioner + Popup + List so callers pass
 * SelectItems directly. Scrolls when the option list overflows.
 */
export function SelectContent({
	className,
	children,
	side = "bottom",
	align = "start",
	sideOffset = 6,
	...props
}: ContentProps) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<SelectPortal>
			<Base.Positioner
				side={side}
				align={align}
				sideOffset={sideOffset}
				className="z-(--z-overlay)"
			>
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"min-w-[var(--anchor-width)] rounded-md border border-border-floating bg-popover popup-inset text-popover-foreground shadow-md outline-none",
						// 18rem at rest, but never taller than the room the positioner
						// measured. See lib/anchored-scroll.
						anchoredListScroll,
						"motion-pop",
						className,
					)}
					{...props}
				>
					<HighlightGlide />
					<Base.List>{children}</Base.List>
				</Base.Popup>
			</Base.Positioner>
		</SelectPortal>
	)
}

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> & {
	className?: string
}

/**
 * A single option. Composes Item + ItemText (the label) + ItemIndicator (a check
 * shown for the selected item). Highlight surfaces via `data-[highlighted]`.
 *
 * When `label` is omitted and the children flatten to text (strings/numbers,
 * including interpolation), that text is forwarded as Base UI's `label` —
 * otherwise the trigger's SelectValue falls back to rendering the raw `value`
 * instead of the display text.
 */
export function SelectItem({ className, children, label, ...props }: ItemProps) {
	const tier = useTypeTier()
	return (
		<Base.Item
			label={label ?? textContent(children)}
			className={cn(
				`relative flex cursor-default items-center justify-between gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none`,
				"data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<Base.ItemText>{children}</Base.ItemText>
			<Base.ItemIndicator className="flex items-center justify-center">
				<Icon name="check" className="text-xs" />
			</Base.ItemIndicator>
		</Base.Item>
	)
}

type GroupLabelProps = Omit<
	ComponentProps<typeof Base.GroupLabel>,
	"className"
> & {
	className?: string
}

/** A heading for a SelectGroup. Auto-associated for screen readers by Base UI. */
export function SelectGroupLabel({ className, ...props }: GroupLabelProps) {
	const tier = useTypeTier()
	return (
		<Base.GroupLabel
			className={cn(
				// The item inset, not a fixed px-2: the heading's text starts on the
				// same column as the option labels beneath it at every density.
				`px-(--item-px) py-1.5 ${tier.label} text-muted-foreground`,
				className,
			)}
			{...props}
		/>
	)
}

type SeparatorProps = Omit<ComponentProps<typeof Base.Separator>, "className"> & {
	className?: string
}

/** A thin divider between groups of items. Decorative (Base UI marks it aria-hidden). */
export function SelectSeparator({ className, ...props }: SeparatorProps) {
	return (
		<Base.Separator
			className={cn("popup-bleed my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}
