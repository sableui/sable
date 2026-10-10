import type { ComponentProps, ReactNode } from "react"
import { Icon } from "../../icon"
import { Button } from "../button"
import { Menu, MenuContent, MenuTrigger } from "../menu"

type MenuContentProps = ComponentProps<typeof MenuContent>

export interface DotsMenuProps {
	/** The menu rows — MenuItem / MenuSeparator / MenuGroup, etc. */
	children: ReactNode
	/** Alignment of the popup along its side. @default "end" */
	align?: MenuContentProps["align"]
	/** Accessible label for the trigger button. @default "More actions" */
	label?: string
	/** Semantic icon name for the trigger. @default "ellipsis" */
	icon?: string
	/**
	 * The trigger's rung on the icon-button ladder. `icon` (the control-md
	 * square) for a card or page header; `icon-sm` / `icon-xs` for a list row or
	 * a dense toolbar, where a full-size trigger would set the row height.
	 * @default "icon"
	 */
	size?: "icon" | "icon-sm" | "icon-xs"
}

/**
 * DotsMenu — an overflow "…" icon button that opens a Menu. A thin composition
 * over our own Menu + Button + Icon: pass MenuItems as children and it wires the
 * ghost icon trigger, accessible label, and portal-rendered content for you.
 *
 *   <DotsMenu label="Post actions">
 *     <MenuItem>Edit</MenuItem>
 *     <MenuItem>Share</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem variant="destructive">Delete</MenuItem>
 *   </DotsMenu>
 *
 * All Base UI menu behavior (roving focus, typeahead, Esc/outside dismissal)
 * comes through Menu; this component only owns the trigger affordance.
 */
export function DotsMenu({
	children,
	align = "end",
	label = "More actions",
	icon = "ellipsis",
	size = "icon",
}: DotsMenuProps) {
	return (
		<Menu>
			<MenuTrigger
				render={
					<Button variant="ghost" size={size} aria-label={label}>
						<Icon name={icon} />
					</Button>
				}
			/>
			<MenuContent align={align}>{children}</MenuContent>
		</Menu>
	)
}
DotsMenu.displayName = "DotsMenu"
