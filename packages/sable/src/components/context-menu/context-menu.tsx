"use client"

import { ContextMenu as Base } from "@base-ui/react/context-menu"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import {
	MenuCheckboxItem,
	MenuContent,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuLinkItem,
	MenuPortal,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	MenuSubmenu,
	MenuSubmenuTrigger,
} from "../menu/menu"

/*
 * Source of truth: ../menu/menu.tsx. ContextMenu is Menu opened by a right
 * click. Base UI's ContextMenu owns only two parts of its own — Root and
 * Trigger — and re-exports Menu's Portal, Positioner, Popup, Item, Group,
 * Submenu, Radio and Checkbox parts as they are. So Sable does the same: every
 * part below the trigger IS the Menu part, under a ContextMenu name. Nothing is
 * copied, so a change to MenuItem reaches ContextMenuItem with no mirroring —
 * the hand-copied classes this file used to hold had already drifted (no icon,
 * no description, no submenu, no radio or checkbox rows).
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
 *         <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
 *       </ContextMenuGroup>
 *     </ContextMenuContent>
 *   </ContextMenu>
 *
 * State surfaces via Base UI data-attributes: data-[highlighted] (active item),
 * data-[disabled], and data-[starting-style]/data-[ending-style] (open/close).
 */
export const ContextMenu = Base.Root
export const ContextMenuPortal = MenuPortal

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
ContextMenuTrigger.displayName = "ContextMenuTrigger"

/**
 * The menu surface: MenuContent (Portal + Positioner + Popup). Positions at the
 * pointer; defaults to the `bottom` side, `start` aligned, 6px offset. Also the
 * surface of a ContextMenuSubmenu, with `side="inline-end"`.
 */
export function ContextMenuContent(props: ComponentProps<typeof MenuContent>) {
	return <MenuContent {...props} />
}
ContextMenuContent.displayName = "ContextMenuContent"

/** A single interactive row: MenuItem (`variant`, `icon`, `description`, `shortcut`). */
export const ContextMenuItem = MenuItem
/** A row that navigates (a real `<a>`): MenuLinkItem, with its new-tab label. */
export const ContextMenuLinkItem = MenuLinkItem
/** A hairline rule between item runs: MenuSeparator. */
export const ContextMenuSeparator = MenuSeparator
/** Groups related items with a label for screen readers: MenuGroup. */
export const ContextMenuGroup = MenuGroup
/** The label for a ContextMenuGroup: MenuGroupLabel. */
export const ContextMenuGroupLabel = MenuGroupLabel
/** A nested menu: wraps a ContextMenuSubmenuTrigger and its own ContextMenuContent. */
export const ContextMenuSubmenu = MenuSubmenu
/** The row that opens a submenu: MenuSubmenuTrigger (`value`, `icon`). */
export const ContextMenuSubmenuTrigger = MenuSubmenuTrigger
/** A single-choice group: MenuRadioGroup (`value` / `onValueChange` / `defaultValue`). */
export const ContextMenuRadioGroup = MenuRadioGroup
/** One option in a ContextMenuRadioGroup: MenuRadioItem. */
export const ContextMenuRadioItem = MenuRadioItem
/** A toggling row: MenuCheckboxItem (`checked` / `onCheckedChange`, `shortcut`). */
export const ContextMenuCheckboxItem = MenuCheckboxItem
