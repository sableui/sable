import { Menubar as Base } from "@base-ui/react/menubar"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { trimLabel } from "../../lib/trim-label"
import { buttonVariants } from "../button/button.variants"
import { MenuTrigger } from "../menu"

/**
 * Menubar — an application's row of menus (File, Edit, View), over Base UI's
 * Menubar. Each menu is an ordinary Sable `Menu`; the bar only joins them:
 *
 *   <Menubar aria-label="Editor">
 *     <Menu>
 *       <MenubarTrigger>File</MenubarTrigger>
 *       <MenuContent>
 *         <MenuItem>New</MenuItem>
 *       </MenuContent>
 *     </Menu>
 *     <Menu>
 *       <MenubarTrigger>Edit</MenubarTrigger>
 *       <MenuContent>…</MenuContent>
 *     </Menu>
 *   </Menubar>
 *
 * Base UI owns the joining: `role="menubar"`, one tab stop for the whole bar,
 * ←/→ between the titles, ↓ into the open menu, and — once one menu is open —
 * moving the pointer across the bar opens its neighbours without another click.
 * Every row, group, submenu and checkbox inside is the Menu part you already
 * know; there is no Menubar-specific item.
 */
export type MenubarProps = Omit<ComponentProps<typeof Base>, "className"> & {
	className?: string
}

export function Menubar({ className, ...props }: MenubarProps) {
	return (
		<Base
			className={cn(
				"inline-flex items-center gap-0.5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
				className,
			)}
			{...props}
		/>
	)
}
Menubar.displayName = "Menubar"

export type MenubarTriggerProps = Omit<ComponentProps<typeof MenuTrigger>, "className"> & {
	className?: string
}

/**
 * A menu's title in the bar. Styled as a small ghost Button (the same classes,
 * so it follows the density ladder and the theme's button shape), set in the
 * control tier a menu row uses rather than a button's louder label, and held in
 * the accent wash while its menu is open so the reader can see which title the
 * popup belongs to.
 */
export function MenubarTrigger({ className, children, ...props }: MenubarTriggerProps) {
	const tier = useTypeTier()
	return (
		<MenuTrigger
			className={cn(
				buttonVariants({ variant: "ghost", size: "sm" }),
				tier.control,
				"sable-open:bg-accent sable-open:text-accent-foreground",
				className,
			)}
			{...props}
		>
			{trimLabel(children)}
		</MenuTrigger>
	)
}
MenubarTrigger.displayName = "MenubarTrigger"
