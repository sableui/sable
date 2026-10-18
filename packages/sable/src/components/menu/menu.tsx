import { Menu as Base } from "@base-ui/react/menu"
import type { ComponentProps, ReactNode } from "react"
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

export type ItemContent = {
	/** A leading icon. Beside a `description` it sits in a small tile spanning both lines. */
	icon?: ReactNode
	/**
	 * A second, quieter line under the label: what the action does, where a
	 * label alone is ambiguous ("Copy page" → "Copy page as Markdown for LLMs").
	 */
	description?: ReactNode
}

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> &
	ItemContent & {
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

/** A menu row. Shared with CaretMenuItem, so suggestion rows and menu rows cannot drift apart. */
export const MENU_ITEM =
	"flex cursor-default select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0"

/**
 * The row's content: the label alone, or icon + label + description. The
 * description keeps the muted ink under the highlight, so the two lines stay
 * two levels rather than flattening into the label's accent ink.
 */
export function useItemContent(children: ReactNode, { icon, description }: ItemContent) {
	const tier = useTypeTier()
	if (!description) return icon ? <>{icon}{children}</> : children
	return (
		<>
			{icon ? (
				<span
					data-slot="menu-item-icon"
					className="flex size-(--control-sm) shrink-0 items-center justify-center rounded-sm border border-border-strong bg-popover text-muted-foreground"
				>
					{icon}
				</span>
			) : null}
			<span className="flex min-w-0 flex-col">
				<span>{children}</span>
				<span data-slot="menu-item-description" className={cn("text-muted-foreground", tier.secondary)}>
					{description}
				</span>
			</span>
		</>
	)
}

/** Shared with ContextMenuItem so the two destructive rows cannot drift apart. */
export const MENU_ITEM_DESTRUCTIVE =
	// The ink is pulled a quarter toward --foreground (as Badge's soft tones
	// are), from --destructive-text rather than the fill: dark fills sit low
	// enough for a white label, and ink mixed from them measured 3.8:1 on
	// Meridian's popover. From the text token every theme clears 4.5:1 (worst
	// 5.4:1, Prism dark, on the 10% red wash).
	"text-[color-mix(in_oklch,var(--destructive-text)_75%,var(--foreground))] data-[highlighted]:bg-destructive-mark/10 data-[highlighted]:text-[color-mix(in_oklch,var(--destructive-text)_75%,var(--foreground))]"

/** A single interactive row. Highlights via Base UI's data-[highlighted]. */
export function MenuItem({ className, variant = "default", icon, description, children, ...props }: ItemProps) {
	const tier = useTypeTier()
	const content = useItemContent(children as ReactNode, { icon, description })
	return (
		<Base.Item
			className={cn(MENU_ITEM, tier.body, variant === "destructive" && MENU_ITEM_DESTRUCTIVE, className)}
			{...props}
		>
			{content}
		</Base.Item>
	)
}

type LinkItemProps = Omit<ComponentProps<typeof Base.LinkItem>, "className"> &
	ItemContent & {
		className?: string
	}

/**
 * A row that navigates: a real `<a>`, so it opens in a new tab, middle-clicks
 * and copies as a link, which a MenuItem with an onClick cannot. Pass `href`,
 * and `target="_blank"` for a page outside the app; the row then marks itself
 * as leaving with a trailing ↗.
 */
export function MenuLinkItem({ className, icon, description, children, target, ...props }: LinkItemProps) {
	const tier = useTypeTier()
	const external = target === "_blank"
	const label = external ? (
		<span className="inline-flex items-center gap-1">
			{children as ReactNode}
			<Icon name="arrow-up-right" className="text-[0.875em] text-muted-foreground" />
		</span>
	) : (
		(children as ReactNode)
	)
	const content = useItemContent(label, { icon, description })
	return (
		<Base.LinkItem
			className={cn(MENU_ITEM, tier.body, className)}
			target={target}
			rel={external ? "noopener noreferrer" : undefined}
			{...props}
		>
			{content}
		</Base.LinkItem>
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
