import { useRender } from "@base-ui/react/use-render"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"

/**
 * BottomNav — the mobile bottom tab bar. Fixed to the bottom edge, hidden at
 * `lg` (the desktop Sidebar takes over). Pads the home-indicator safe area and
 * distributes its items evenly. Pair with `<AppShell bottomNav={…}>` so the main
 * content reserves matching bottom space.
 *
 *   <BottomNav>
 *     <BottomNavItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
 *     <BottomNavItem icon={<Icon name="search" />} label="Explore" render={<Link to="/explore" />} />
 *   </BottomNav>
 */
export function BottomNav({
	className,
	children,
	...props
}: ComponentPropsWithRef<"nav">) {
	return (
		<nav
			className={cn(
				"fixed inset-x-0 bottom-0 z-(--z-nav) border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm lg:hidden",
				className,
			)}
			{...props}
		>
			<div className="flex h-[var(--nav-height,56px)] items-center justify-around px-2">
				{children}
			</div>
		</nav>
	)
}
BottomNav.displayName = "BottomNav"

export interface BottomNavItemProps
	extends Omit<ComponentPropsWithRef<"button">, "title"> {
	/** The icon node. The consumer swaps fill weight for the active state. */
	icon?: ReactNode
	/** Accessible name (always set as aria-label) and optional visible label. */
	label: string
	/** Marks the current route — applies the active ink + `aria-current="page"`. */
	active?: boolean
	/** Corner badge (dot or count) overlaid on the icon. */
	badge?: ReactNode
	/** Show `label` text beneath the icon. Default false (icon-only). */
	showLabel?: boolean
	/** Render as another element, e.g. `render={<Link to="/x" />}`. */
	render?: useRender.RenderProp
}

/**
 * A single bottom-nav tab. 44px minimum touch target. Router-agnostic via
 * `render`; the badge is overlaid on the icon's top-right corner.
 */
export function BottomNavItem({
	icon,
	label,
	active,
	badge,
	showLabel = false,
	render,
	className,
	...props
}: BottomNavItemProps) {
	return useRender({
		render: render ?? <button type="button" />,
		props: {
			...props,
			"aria-label": label,
			"data-active": active ? "" : undefined,
			"aria-current": active ? "page" : undefined,
			className: cn(
				// design-lint-disable-next-line raw-control-height -- the WCAG 2.5.5 touch-target floor, deliberately density-independent: a compact register still owes a 44px hit area.
				"relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg text-muted-foreground motion-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active]:text-foreground",
				className,
			),
			children: (
				<>
					<span className="relative grid size-[1em] place-items-center text-2xl">
						{icon}
						{badge ? (
							<span className="absolute -right-1 -top-1">{badge}</span>
						) : null}
					</span>
					{showLabel ? <span className="text-label-sm">{label}</span> : null}
				</>
			),
		},
		defaultTagName: "button",
	})
}
BottomNavItem.displayName = "BottomNavItem"
