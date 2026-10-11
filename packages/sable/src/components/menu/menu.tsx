import { Menu as Base } from "@base-ui/react/menu"
import type { ComponentProps } from "react"
import { Icon } from "../../icon"
import { anchoredScroll } from "../../lib/anchored-scroll"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity, useTypeTier } from "../../lib/density"
import { HighlightGlide } from "../../lib/highlight-glide"

/**
 * Menu — themed dropdown over Base UI's Menu (roving focus, typeahead, ARIA
 * menu/menuitem wiring, collision-aware positioning, Esc/outside dismissal all
 * come from Base UI). Compose:
 *
 *   <Menu>
 *     <MenuTrigger render={<Button variant="secondary">Options</Button>} />
 *     <MenuContent>
 *       <MenuItem>Edit</MenuItem>
 *       <MenuItem>Duplicate</MenuItem>
 *       <MenuSeparator />
 *       <MenuGroup>
 *         <MenuGroupLabel>Danger</MenuGroupLabel>
 *         <MenuItem>Delete</MenuItem>
 *       </MenuGroup>
 *     </MenuContent>
 *   </Menu>
 *
 * State surfaces via Base UI data-attributes: data-[highlighted] (active item),
 * data-[disabled], and data-[starting-style]/data-[ending-style] (open/close).
 */
export const Menu = Base.Root
export const MenuTrigger = Base.Trigger
export const MenuPortal = withPortalThemeScope(Base.Portal)

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
 * The dropdown surface. Composes Portal + Positioner + Popup so callers pass a
 * single element. Defaults to the `bottom` side, `start` aligned, 6px offset.
 */
export function MenuContent({
	className,
	children,
	side = "bottom",
	align = "start",
	sideOffset = 6,
	...props
}: ContentProps) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<MenuPortal>
			<Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-(--z-overlay)">
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"min-w-40 rounded-md border border-border-floating bg-popover popup-inset text-popover-foreground shadow-md outline-none",
						// A menu taller than the room under its trigger scrolls inside
						// itself instead of running off the screen. Rationale for the cap,
						// the thin scrollbar and the overscroll containment: lib/anchored-scroll.
						anchoredScroll,
						"motion-pop",
						className,
					)}
					{...props}
				>
					<HighlightGlide />
					{children}
				</Base.Popup>
			</Base.Positioner>
		</MenuPortal>
	)
}

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> & {
	className?: string
	/**
	 * `destructive` for an action that deletes or cannot be undone. It keeps the
	 * destructive ink when highlighted — the default highlight repaints the row
	 * in accent ink, which hid the warning exactly when the row was targeted —
	 * and washes the highlight in the destructive tone instead.
	 * @default "default"
	 */
	variant?: "default" | "destructive"
}

/** Shared with ContextMenuItem so the two destructive rows cannot drift apart. */
export const MENU_ITEM_DESTRUCTIVE =
	// The ink is pulled a quarter toward --foreground (as Badge's soft tones
	// are): raw dark-mode destructive on the popover's 10% red wash measured
	// 3.5-4.0:1 across themes. It reads as the same red and clears 4.5:1.
	"text-[color-mix(in_oklch,var(--destructive)_75%,var(--foreground))] data-[highlighted]:bg-destructive/10 data-[highlighted]:text-[color-mix(in_oklch,var(--destructive)_75%,var(--foreground))]"

/** A single interactive row. Highlights via Base UI's data-[highlighted]. */
export function MenuItem({ className, variant = "default", ...props }: ItemProps) {
	const tier = useTypeTier()
	return (
		<Base.Item
			className={cn(
				`flex cursor-default select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0`,
				variant === "destructive" && MENU_ITEM_DESTRUCTIVE,
				className,
			)}
			{...props}
		/>
	)
}

type SeparatorProps = Omit<ComponentProps<typeof Base.Separator>, "className"> & {
	className?: string
}

/** A hairline rule between item runs. Bleeds past the popup padding. */
export function MenuSeparator({ className, ...props }: SeparatorProps) {
	return (
		<Base.Separator
			className={cn("popup-bleed my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}

type GroupProps = Omit<ComponentProps<typeof Base.Group>, "className"> & {
	className?: string
}

/** Groups related items with a label for screen readers. */
export function MenuGroup({ className, ...props }: GroupProps) {
	return <Base.Group className={cn(className)} {...props} />
}

type GroupLabelProps = Omit<
	ComponentProps<typeof Base.GroupLabel>,
	"className"
> & { className?: string }

/** The label for a MenuGroup. Auto-associated with the group it sits in. */
export function MenuGroupLabel({ className, ...props }: GroupLabelProps) {
	const tier = useTypeTier()
	return (
		<Base.GroupLabel
			className={cn(
				`select-none px-(--item-px) py-1.5 ${tier.label} text-muted-foreground`,
				className,
			)}
			{...props}
		/>
	)
}

/* ── Nesting and selection ───────────────────────────────────────────────────
   Base UI has shipped submenus, radio items and checkbox items since 1.0; this
   wrapper exposed none of them, so any menu that needed to nest or to show what
   is currently chosen had to reach past the barrel into Base UI directly —
   which breaks the one import rule consumers have. These four parts close that.

   They are ordinary menu vocabulary, not a feature for one caller: "pick one of
   these" and "this row opens more" are what menus are for. */

/**
 * A nested menu. Wraps a `MenuSubmenuTrigger` and its own `MenuContent`:
 *
 *   <MenuSubmenu>
 *     <MenuSubmenuTrigger>Effort</MenuSubmenuTrigger>
 *     <MenuContent side="inline-end" align="start">…</MenuContent>
 *   </MenuSubmenu>
 *
 * `side="inline-end"` rather than `"right"` so the submenu opens away from the
 * parent in RTL as well as LTR — Base UI flips it at the collision boundary
 * either way, but starting on the correct side avoids a flip on every open.
 */
export const MenuSubmenu = Base.SubmenuRoot

type SubmenuTriggerProps = Omit<
	ComponentProps<typeof Base.SubmenuTrigger>,
	"className"
> & {
	className?: string
	/** Trailing value shown before the chevron — the current choice, usually. */
	value?: ComponentProps<"span">["children"]
}

/**
 * The row that opens a submenu. Styled as a MenuItem plus a trailing chevron,
 * and optionally the current `value` — which is what lets a settings menu read
 * as `Effort   High ›` rather than making the reader open each row to find out
 * what is set.
 */
export function MenuSubmenuTrigger({
	className,
	children,
	value,
	...props
}: SubmenuTriggerProps) {
	const tier = useTypeTier()
	return (
		<Base.SubmenuTrigger
			className={cn(
				`flex cursor-default select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0`,
				className,
			)}
			{...props}
		>
			<span className="flex-1 truncate text-start">{children}</span>
			{value !== undefined ? (
				<span className="truncate text-muted-foreground">{value}</span>
			) : null}
			<Icon name="chevron-right" className="text-xs opacity-60" />
		</Base.SubmenuTrigger>
	)
}

/**
 * A single-choice group inside a menu. Controlled via `value`/`onValueChange`,
 * uncontrolled via `defaultValue`.
 */
export const MenuRadioGroup = Base.RadioGroup

type RadioItemProps = Omit<ComponentProps<typeof Base.RadioItem>, "className"> & {
	className?: string
}

/**
 * One option in a MenuRadioGroup. The check sits in a reserved leading column
 * rather than appearing and disappearing with the selection — otherwise every
 * label shifts sideways as the reader moves the highlight, which is the exact
 * thing a menu of options must not do.
 */
export function MenuRadioItem({ className, children, ...props }: RadioItemProps) {
	const tier = useTypeTier()
	return (
		<Base.RadioItem
			className={cn(
				`flex cursor-default select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
				className,
			)}
			{...props}
		>
			<span className="flex size-4 shrink-0 items-center justify-center">
				<Base.RadioItemIndicator>
					<Icon name="check" className="text-xs" />
				</Base.RadioItemIndicator>
			</span>
			<span className="flex-1 truncate">{children}</span>
		</Base.RadioItem>
	)
}

type CheckboxItemProps = Omit<
	ComponentProps<typeof Base.CheckboxItem>,
	"className"
> & { className?: string }

/**
 * A toggling row. Same reserved leading column as MenuRadioItem, so a menu
 * mixing the two keeps one text margin.
 */
export function MenuCheckboxItem({
	className,
	children,
	...props
}: CheckboxItemProps) {
	const tier = useTypeTier()
	return (
		<Base.CheckboxItem
			className={cn(
				`flex cursor-default select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50`,
				className,
			)}
			{...props}
		>
			<span className="flex size-4 shrink-0 items-center justify-center">
				<Base.CheckboxItemIndicator>
					<Icon name="check" className="text-xs" />
				</Base.CheckboxItemIndicator>
			</span>
			<span className="flex-1 truncate">{children}</span>
		</Base.CheckboxItem>
	)
}
