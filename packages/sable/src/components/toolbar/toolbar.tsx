import { Toolbar as Base } from "@base-ui/react/toolbar"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { trimLabel } from "../../lib/trim-label"
import { buttonVariants } from "../button/button.variants"
import { Input } from "../input"
import {
	toolbarGroupVariants,
	toolbarSeparatorVariants,
	toolbarVariants,
} from "./toolbar.variants"

/**
 * Toolbar — a row (or column) of controls that behaves as ONE stop in the tab
 * order, over Base UI's Toolbar. Tab lands on the toolbar; the arrow keys move
 * between its items (Left/Right when horizontal, Up/Down when vertical; Home/End
 * jump to the ends). Base UI owns `role="toolbar"`, `aria-orientation`, the
 * roving tabindex, and keeping disabled items focusable so the row does not
 * collapse under the keyboard.
 *
 *   <Toolbar aria-label="Text formatting">
 *     <ToolbarButton size="icon-sm" aria-label="Bold"><Icon name="bold" /></ToolbarButton>
 *     <ToolbarButton size="icon-sm" aria-label="Italic"><Icon name="italic" /></ToolbarButton>
 *     <ToolbarSeparator />
 *     <ToolbarLink href="/help">Help</ToolbarLink>
 *   </Toolbar>
 *
 * Items reuse existing styling rather than defining their own: buttons and links
 * read `buttonVariants` (ghost by default), the input renders `Input`. Heights
 * therefore follow the density ladder like every other control.
 */
export type ToolbarProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
}

export function Toolbar({ className, ...props }: ToolbarProps) {
	return <Base.Root className={cn(toolbarVariants(), className)} {...props} />
}
Toolbar.displayName = "Toolbar"

export type ToolbarButtonProps = Omit<ComponentProps<typeof Base.Button>, "className"> &
	VariantProps<typeof buttonVariants> & {
		className?: string
	}

/**
 * One button in the toolbar. Styled by `buttonVariants` — the same classes as
 * `<Button>` — defaulting to `variant="ghost"`, `size="sm"`; pass
 * `size="icon-sm"` (or `icon-xs`) for an icon-only button, with an `aria-label`.
 *
 * Disabled buttons stay focusable by default (`focusableWhenDisabled`), so
 * arrowing along the row does not skip them silently; they carry
 * `aria-disabled` and dim like any disabled Button.
 *
 * Compose a menu or popover trigger, or a Toggle, through `render`:
 * `<ToolbarButton render={<MenuTrigger />}>View</ToolbarButton>`.
 */
export function ToolbarButton({
	variant = "ghost",
	size = "sm",
	className,
	children,
	...props
}: ToolbarButtonProps) {
	const tier = useTypeTier()
	return (
		<Base.Button
			className={cn(buttonVariants({ variant, size }), tier.action, className)}
			{...props}
		>
			{trimLabel(children)}
		</Base.Button>
	)
}
ToolbarButton.displayName = "ToolbarButton"

export type ToolbarLinkProps = Omit<ComponentProps<typeof Base.Link>, "className"> &
	VariantProps<typeof buttonVariants> & {
		className?: string
	}

/**
 * A link that takes part in the toolbar's arrow-key movement. Same look as
 * ToolbarButton (ghost `buttonVariants`), but an `<a>`: use it when the item
 * navigates rather than acts.
 */
export function ToolbarLink({
	variant = "ghost",
	size = "sm",
	className,
	children,
	...props
}: ToolbarLinkProps) {
	const tier = useTypeTier()
	return (
		<Base.Link
			className={cn(buttonVariants({ variant, size }), tier.action, className)}
			{...props}
		>
			{trimLabel(children)}
		</Base.Link>
	)
}
ToolbarLink.displayName = "ToolbarLink"

export type ToolbarInputProps = Omit<ComponentProps<typeof Base.Input>, "className"> & {
	className?: string
}

/**
 * A text field inside the toolbar, rendered as Sable's `Input` at the `sm`
 * control height. Arrow keys move the caret while the field has text to move
 * through and leave the field at either end, so it does not trap the row.
 * Give it an `aria-label`; a toolbar field almost never has a visible label.
 */
export function ToolbarInput({ className, ...props }: ToolbarInputProps) {
	return (
		<Base.Input
			render={<Input />}
			className={cn("h-(--control-sm) w-40", className)}
			{...props}
		/>
	)
}
ToolbarInput.displayName = "ToolbarInput"

export type ToolbarGroupProps = Omit<ComponentProps<typeof Base.Group>, "className"> & {
	className?: string
}

/**
 * A run of related items inside the toolbar — still one tab stop, arrow keys
 * cross group boundaries freely. `disabled` disables every item in it.
 *
 * For a pressed-state set, put a `ToggleGroup` in the toolbar and render each
 * toggle THROUGH a ToolbarButton — `<ToolbarButton render={<Toggle value="left" />}>`.
 * Inside a toolbar the ToggleGroup hands focus management to the toolbar, so a
 * bare `<Toggle>` there is not a toolbar item and the arrow keys skip it.
 */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
	return <Base.Group className={cn(toolbarGroupVariants(), className)} {...props} />
}
ToolbarGroup.displayName = "ToolbarGroup"

export type ToolbarSeparatorProps = Omit<
	ComponentProps<typeof Base.Separator>,
	"className"
> & {
	className?: string
}

/**
 * A hairline between groups. Base UI orients it across the toolbar (a vertical
 * rule in a horizontal toolbar) and exposes it as `role="separator"`; it is
 * never a focus stop.
 */
export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
	return (
		<Base.Separator className={cn(toolbarSeparatorVariants(), className)} {...props} />
	)
}
ToolbarSeparator.displayName = "ToolbarSeparator"
