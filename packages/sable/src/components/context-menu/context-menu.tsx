import { ContextMenu as Base } from "@base-ui/react/context-menu"
import type { ComponentProps } from "react"
import { anchoredScroll } from "../../lib/anchored-scroll"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity, useTypeTier } from "../../lib/density"
import { HighlightGlide } from "../../lib/highlight-glide"
import { MENU_ITEM_DESTRUCTIVE, MenuItemShortcut, type ItemShortcut } from "../menu/menu"

/*
 * Source of truth: ../menu/menu.tsx. ContextMenu is Menu opened by a right
 * click, so its surface and parts must render identically. Menu does not export
 * its class strings, so the item / separator / group-label classes below are
 * replicated EXACTLY from MenuItem / MenuSeparator / MenuGroupLabel (including
 * the type tier and the --item-* density hooks). Change Menu first, then mirror
 * it here.
 */

/**
 * ContextMenu — themed right-click menu over Base UI's ContextMenu (roving
 * focus, typeahead, ARIA menu/menuitem wiring, collision-aware positioning,
 * Esc/outside dismissal all come from Base UI). Unlike Menu, the trigger opens
 * on the native `contextmenu` event (right click) or long press, and the popup
 * positions at the pointer. Compose:
 *
 *   <ContextMenu>
 *     <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
 *     <ContextMenuContent>
 *       <ContextMenuItem>Cut</ContextMenuItem>
 *       <ContextMenuItem>Copy</ContextMenuItem>
 *       <ContextMenuSeparator />
 *       <ContextMenuGroup>
 *         <ContextMenuGroupLabel>Danger</ContextMenuGroupLabel>
 *         <ContextMenuItem>Delete</ContextMenuItem>
 *       </ContextMenuGroup>
 *     </ContextMenuContent>
 *   </ContextMenu>
 *
 * State surfaces via Base UI data-attributes: data-[highlighted] (active item),
 * data-[disabled], and data-[starting-style]/data-[ending-style] (open/close).
 */
export const ContextMenu = Base.Root
export const ContextMenuPortal = withPortalThemeScope(Base.Portal)

type TriggerProps = Omit<ComponentProps<typeof Base.Trigger>, "className"> & {
	className?: string
}

/**
 * The right-clickable area that opens the menu on `contextmenu` (right click)
 * or long press. Renders a `<div>`; style it however you like (e.g. a
 * drop-zone). Compose with render={<… />} to swap the element.
 */
export function ContextMenuTrigger({ className, ...props }: TriggerProps) {
	return <Base.Trigger className={cn(className)} {...props} />
}

type PositionerProps = ComponentProps<typeof Base.Positioner>
type ContentProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/** Which side of the anchor to render against. @default "bottom" */
	side?: PositionerProps["side"]
	/** Alignment along the chosen side. @default "start" */
	align?: PositionerProps["align"]
	/** Gap between the anchor and popup, in px. @default 6 */
	sideOffset?: PositionerProps["sideOffset"]
}

/**
 * The menu surface. Composes Portal + Positioner + Popup so callers pass a
 * single element. Positions at the pointer; defaults to the `bottom` side,
 * `start` aligned, 6px offset.
 */
export function ContextMenuContent({
	className,
	children,
	side = "bottom",
	align = "start",
	sideOffset = 6,
	...props
}: ContentProps) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<ContextMenuPortal>
			<Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-(--z-overlay)">
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"min-w-[10rem] origin-(--transform-origin) rounded-md border border-border-floating bg-popover popup-inset text-popover-foreground shadow-md outline-none",
						// A context menu opened near the bottom edge has very little room
						// below the pointer; cap against it and scroll. See lib/anchored-scroll.
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
		</ContextMenuPortal>
	)
}

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> &
	ItemShortcut & {
		className?: string
		/**
		 * `destructive` for an action that deletes or cannot be undone: keeps the
		 * destructive ink when highlighted (see MenuItem).
		 * @default "default"
		 */
		variant?: "default" | "destructive"
	}

/** A single interactive row. Highlights via Base UI's data-[highlighted]. */
export function ContextMenuItem({ className, variant = "default", shortcut, children, ...props }: ItemProps) {
	const tier = useTypeTier()
	return (
		<Base.Item
			className={cn(
				`flex cursor-default select-none items-center gap-(--item-gap) rounded-popup-item px-(--item-px) py-1.5 ${tier.body} outline-none motion-interactive data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0`,
				variant === "destructive" && MENU_ITEM_DESTRUCTIVE,
				className,
			)}
			{...props}
		>
			{children}
			{shortcut != null ? <MenuItemShortcut>{shortcut}</MenuItemShortcut> : null}
		</Base.Item>
	)
}

type SeparatorProps = Omit<ComponentProps<typeof Base.Separator>, "className"> & {
	className?: string
}

/** A hairline rule between item runs. Bleeds past the popup padding. */
export function ContextMenuSeparator({ className, ...props }: SeparatorProps) {
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
export function ContextMenuGroup({ className, ...props }: GroupProps) {
	return <Base.Group className={cn(className)} {...props} />
}

type GroupLabelProps = Omit<
	ComponentProps<typeof Base.GroupLabel>,
	"className"
> & { className?: string }

/** The label for a ContextMenuGroup. Auto-associated with the group it sits in. */
export function ContextMenuGroupLabel({ className, ...props }: GroupLabelProps) {
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
