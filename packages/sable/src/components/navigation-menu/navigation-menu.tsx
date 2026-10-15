import { NavigationMenu as Base } from "@base-ui/react/navigation-menu"
import { type ComponentProps, type ReactNode, createContext, useContext } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useAnchoredDensity, useTypeTier } from "../../lib/density"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"

/**
 * NavigationMenu — a site header's primary nav over Base UI's NavigationMenu
 * (hover/focus-to-open triggers, arrow-key roving across the bar, Esc and
 * outside dismissal, `aria-current` on the active link). Compose:
 *
 *   <NavigationMenu>
 *     <NavigationMenuList>
 *       <NavigationMenuItem>
 *         <NavigationMenuTrigger>Product</NavigationMenuTrigger>
 *         <NavigationMenuContent className="grid w-[30rem] grid-cols-2">
 *           <NavigationMenuLink href="/editor" description="Write and review together.">Editor</NavigationMenuLink>
 *           <NavigationMenuLink href="/sync" description="Offline first, conflict free.">Sync</NavigationMenuLink>
 *         </NavigationMenuContent>
 *       </NavigationMenuItem>
 *       <NavigationMenuItem>
 *         <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
 *       </NavigationMenuItem>
 *     </NavigationMenuList>
 *   </NavigationMenu>
 *
 * The root also renders the one floating panel every trigger shares (Portal +
 * Positioner + Popup + Viewport), so callers never assemble it. Moving between
 * triggers keeps that panel open: it glides to the new trigger, resizes to the
 * new content, and the content slides in from the side it was reached from.
 *
 * Links are router-agnostic: `render={<Link to="/pricing" />}` keeps Base UI's
 * roving focus and `active` (→ `aria-current="page"`) on your router's link.
 */

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
	/** Alignment of the panel along its trigger. @default "start" */
	align?: ComponentProps<typeof Base.Positioner>["align"]
	/** Gap between the bar and the panel, in px. @default 8 */
	sideOffset?: ComponentProps<typeof Base.Positioner>["sideOffset"]
}

const NavigationMenuPortal = withPortalThemeScope(Base.Portal)

export function NavigationMenu({ className, children, align = "start", sideOffset = 8, ...props }: RootProps) {
	return (
		<Base.Root className={cn("relative", className)} {...props}>
			{children}
			<NavigationMenuPanel align={align} sideOffset={sideOffset} />
		</Base.Root>
	)
}

/**
 * The shared panel. The positioner glides between triggers (its inset
 * transitions) and the popup morphs between contents (its size follows
 * --popup-width / --popup-height, which Base UI measures). `data-instant` is
 * set on the first open and on a resize, where gliding would be motion with no
 * meaning, so it snaps.
 */
function NavigationMenuPanel({
	align,
	sideOffset,
}: Pick<RootProps, "align" | "sideOffset">) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<NavigationMenuPortal>
			<Base.Positioner
				align={align}
				sideOffset={sideOffset}
				collisionPadding={16}
				className={cn(
					"z-(--z-overlay) transition-[top,left,right,bottom] duration-(--motion-duration-slow) ease-emphasized data-instant:transition-none",
					// A bridge over the sideOffset gap, so the pointer can travel from
					// the trigger into the panel without crossing open space.
					"before:absolute before:inset-x-0 before:bottom-full before:h-2 before:content-['']",
				)}
			>
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg border border-border-floating bg-popover sable-surface-popover text-popover-foreground shadow-md outline-none",
						"transition-[opacity,scale,width,height] duration-(--motion-duration-slow) ease-emphasized",
						"data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0",
						"data-ending-style:duration-(--motion-duration-exit) data-ending-style:ease-standard",
					)}
				>
					<Base.Viewport className="relative size-full overflow-hidden rounded-[inherit]" />
				</Base.Popup>
			</Base.Positioner>
		</NavigationMenuPortal>
	)
}

type ListProps = Omit<ComponentProps<typeof Base.List>, "className"> & { className?: string }

/** The bar: a `<ul>` of items. Arrow keys rove across it. */
export function NavigationMenuList({ className, ...props }: ListProps) {
	return <Base.List className={cn("flex items-center gap-1", className)} {...props} />
}

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> & { className?: string }

/** One `<li>` in the bar: a NavigationMenuLink, or a Trigger with its Content. */
export function NavigationMenuItem({ className, ...props }: ItemProps) {
	return <Base.Item className={className} {...props} />
}

/*
 * A bar entry, trigger or link, reads like the bar's other entries: muted at
 * rest, full ink when hovered, open or current. Hover and the current page
 * (Base UI's data-active) take a fill stepped off whatever the bar sits on, a
 * header band or the page, rather than a fixed token. The pill takes the
 * theme's button shape, as Tabs' pill variant does.
 */
const BAR_ENTRY =
	"inline-flex h-(--control-sm) select-none items-center gap-1 rounded-[var(--button-radius,9999px)] px-3 text-muted-foreground outline-none sable-surface-interactive motion-interactive focus-visible:ring-2 focus-visible:ring-ring data-popup-open:text-foreground"

type TriggerProps = Omit<ComponentProps<typeof Base.Trigger>, "className"> & { className?: string }

/** Opens its item's Content on hover, click or Enter. Carries its own chevron. */
export function NavigationMenuTrigger({ className, children, ...props }: TriggerProps) {
	const tier = useTypeTier()
	return (
		<Base.Trigger className={cn(BAR_ENTRY, tier.control, className)} {...props}>
			{children}
			<Base.Icon className="flex transition-[rotate] duration-(--motion-duration-fast) ease-standard data-popup-open:rotate-180">
				<Icon name="chevron-down" className="text-[0.875em]" />
			</Base.Icon>
		</Base.Trigger>
	)
}

/** Inside a Content, links render as panel rows; in the bar, as bar entries. */
const InPanelContext = createContext(false)

type ContentProps = Omit<ComponentProps<typeof Base.Content>, "className"> & { className?: string }

/**
 * An item's panel content, rendered into the shared panel when its trigger
 * opens. Size it with layout classes (`w-[30rem] grid grid-cols-2`); the panel
 * follows. It slides in from the side it was reached from.
 */
export function NavigationMenuContent({ className, ...props }: ContentProps) {
	return (
		<InPanelContext.Provider value={true}>
			<Base.Content
				className={cn(
					"h-full w-max max-w-[calc(100vw-2rem)] popup-inset",
					"transition-[opacity,translate] duration-(--motion-duration-slow) ease-emphasized",
					"data-starting-style:opacity-0 data-ending-style:opacity-0",
					"data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2",
					"data-ending-style:data-[activation-direction=left]:translate-x-1/2 data-ending-style:data-[activation-direction=right]:-translate-x-1/2",
					className,
				)}
				{...props}
			/>
		</InPanelContext.Provider>
	)
}

type LinkProps = Omit<ComponentProps<typeof Base.Link>, "className"> & {
	className?: string
	/**
	 * A second line under the title, in a panel: what is behind the link
	 * ("Write and review together"). Ignored in the bar, where a link is one word.
	 */
	description?: ReactNode
}

/**
 * A link: a bar entry when it sits in a NavigationMenuItem, a two-line row
 * when it sits in a NavigationMenuContent. `active` marks the current page
 * (`aria-current="page"`); `render={<Link to="…" />}` uses your router.
 */
export function NavigationMenuLink({ className, description, children, ...props }: LinkProps) {
	const inPanel = useContext(InPanelContext)
	const tier = useTypeTier()
	if (!inPanel) {
		return (
			<Base.Link className={cn(BAR_ENTRY, tier.control, className)} {...props}>
				{children as ReactNode}
			</Base.Link>
		)
	}
	return (
		<Base.Link
			className={cn(
				"flex flex-col gap-0.5 rounded-popup-item px-(--item-px) py-2 outline-none sable-surface-interactive motion-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
				className,
			)}
			{...props}
		>
			<span className={tier.control}>{children as ReactNode}</span>
			{description ? <span className={cn("text-muted-foreground", tier.secondary)}>{description}</span> : null}
		</Base.Link>
	)
}
