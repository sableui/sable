"use client";

import { useRender } from "@base-ui/react/use-render"
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactElement,
	type ReactNode,
	useContext,
} from "react"
import { cn } from "../../lib/cn"
import { sideNavItemIconVariants, sideNavItemVariants } from "../side-nav/side-nav.variants"
import { SimpleTooltip } from "../tooltip"

type SidebarContextValue = { collapsed: boolean; icons: boolean }
const SidebarContext = createContext<SidebarContextValue>({
	collapsed: false,
	icons: true,
})

/** Read the rail's collapsed state — e.g. to swap a full wordmark for a mark. */
export function useSidebar(): SidebarContextValue {
	return useContext(SidebarContext)
}

export interface SidebarProps extends ComponentPropsWithRef<"aside"> {
	/**
	 * Collapse the rail to an icon-only width. Controlled — drive it from app
	 * state and wire a toggle (e.g. a Button in the header or footer). Collapsed,
	 * each `SidebarItem` hides its label + badge and reveals the label in a hover
	 * tooltip, and the rail narrows to `--sidebar-width-collapsed` (4rem) so the
	 * content area reflows automatically.
	 */
	collapsed?: boolean
	/**
	 * Render the leading icon on each `SidebarItem`. Set `false` for a text-only
	 * rail. (Ignored while `collapsed`, which is icon-only by definition.)
	 * @default true
	 */
	icons?: boolean
	/**
	 * Where the rail lives.
	 * - `app` (default) — the page's chrome column: sticky, full viewport
	 *   height, hidden below `lg` where AppHeader + BottomNav take over.
	 * - `inline` — always visible and filling its parent's height, with no
	 *   sticky or breakpoint behaviour: a rail inside a bounded frame (a nested
	 *   shell, an embedded preview, a split view).
	 * @default "app"
	 */
	variant?: "app" | "inline"
}

/** The layout each `variant` takes; colours and width are shared. */
const SIDEBAR_VARIANT = {
	app: "hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:self-start",
	inline: "flex h-full",
} as const

/**
 * Sidebar — the desktop side-navigation rail. An in-flow sticky column, hidden
 * below `lg` (where the mobile AppHeader + BottomNav take over). Compose a brand
 * header, a scrollable nav, and a bottom-anchored footer:
 *
 *   <Sidebar collapsed={collapsed}>
 *     <SidebarHeader>{brand}</SidebarHeader>
 *     <SidebarNav>
 *       <SidebarItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
 *     </SidebarNav>
 *     <SidebarFooter>{walletTrigger}</SidebarFooter>
 *   </Sidebar>
 *
 * Width is the `--sidebar-width` token (16rem), or `--sidebar-width-collapsed`
 * (4rem) when `collapsed`; colors are the `--sidebar-*` set.
 */
/** Page tokens re-pointed at the rail's own, for the components inside it. */
const SIDEBAR_INK = [
	"[--background:var(--sidebar)] [--sable-surface-bg:var(--sidebar)]",
	"[--foreground:var(--sidebar-foreground)]",
	"[--muted:var(--sidebar-accent)]",
	"[--muted-foreground:var(--sidebar-muted-foreground,color-mix(in_oklab,var(--sidebar-foreground)_62%,var(--sidebar)))]",
	"[--accent:var(--sidebar-accent)] [--accent-foreground:var(--sidebar-accent-foreground)]",
	"[--border:var(--sidebar-border)] [--ring:var(--sidebar-ring)]",
].join(" ")

export function Sidebar({
	collapsed = false,
	icons = true,
	variant = "app",
	className,
	children,
	...props
}: SidebarProps) {
	return (
		<SidebarContext.Provider value={{ collapsed, icons }}>
			<aside
				data-collapsed={collapsed || undefined}
				data-variant={variant}
				className={cn(
					"shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
					// The rail is its own surface. Anything placed in it that inks with
					// page tokens — an Entity account row, an Avatar, a ghost Button,
					// an OverflowMenu — reads the rail's set instead, so a theme can paint a
					// dark rail on a light page (Meridian) and the footer row stays
					// legible. Muted ink is the rail's ink at 62% over the rail, unless
					// a theme names --sidebar-muted-foreground.
					SIDEBAR_INK,
					SIDEBAR_VARIANT[variant],
					"w-[var(--sidebar-width,16rem)] data-[collapsed]:w-[var(--sidebar-width-collapsed,4rem)]",
					className,
				)}
				{...props}
			>
				{children}
			</aside>
		</SidebarContext.Provider>
	)
}
Sidebar.displayName = "Sidebar"

/** Brand/logo row pinned to the top of the rail. */
export function SidebarHeader({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	const { collapsed } = useSidebar()
	return (
		<div
			className={cn(
				"flex h-16 items-center px-3",
				// Collapsed, the brand mark centres on the same axis as the item icons.
				collapsed && "justify-center px-0",
				className,
			)}
			{...props}
		/>
	)
}
SidebarHeader.displayName = "SidebarHeader"

/** The scrollable nav region — grows to fill the rail between header and footer. */
export function SidebarNav({
	className,
	...props
}: ComponentPropsWithRef<"nav">) {
	return (
		<nav
			className={cn(
					// Thin scrollbar so a long nav does not hand a fat platform bar to a
					// narrow rail, and contained overscroll so a wheel gesture that runs
					// out of nav stops there instead of scrolling the page behind it.
					"flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-quiet",
					className,
				)}
			{...props}
		/>
	)
}
SidebarNav.displayName = "SidebarNav"

/** Bottom-anchored footer (auth state, overflow menu). */
export function SidebarFooter({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	return (
		<div
			className={cn(
				"flex flex-col gap-1 border-t border-sidebar-border px-3 py-4",
				className,
			)}
			{...props}
		/>
	)
}
SidebarFooter.displayName = "SidebarFooter"

export interface SidebarItemProps
	extends Omit<ComponentPropsWithRef<"button">, "title"> {
	/** Leading icon node. The consumer swaps fill weight for the active state. */
	icon?: ReactNode
	/** Row label. Shown inline when expanded, and in a tooltip when collapsed. */
	label: ReactNode
	/** Marks the current route — applies the accent fill + `aria-current="page"`. */
	active?: boolean
	/** Trailing badge (e.g. a count), pushed to the row end. Hidden when collapsed. */
	badge?: ReactNode
	/** Render as another element, e.g. `render={<Link to="/x" />}`. */
	render?: useRender.RenderProp
}

/**
 * A single sidebar nav row. Router-agnostic: pass `render={<Link to="…" />}` to
 * compose with the app's router; otherwise it renders a `<button>`. When the rail
 * is collapsed it shows the icon only and reveals the label in a hover tooltip.
 */
export function SidebarItem({
	icon,
	label,
	active,
	badge,
	render,
	className,
	"aria-label": ariaLabel,
	...props
}: SidebarItemProps) {
	const { collapsed, icons } = useSidebar()
	// Collapsed is icon-only, so it always shows the icon; otherwise the rail's
	// `icons` flag decides (a text-only rail drops it).
	const showIcon = icon != null && (icons || collapsed)

	const element = useRender({
		render: render ?? <button type="button" />,
		props: {
			...props,
			"data-active": active ? "" : undefined,
			"aria-current": active ? "page" : undefined,
			// Collapsed rows hide their text, so give the control an accessible name
			// from a string label (the tooltip supplies the visible one on hover).
			"aria-label":
				ariaLabel ?? (collapsed && typeof label === "string" ? label : undefined),
			className: cn(
				// SideNav's row recipe on the rail rung — one row, not a copy.
				sideNavItemVariants({ size: "rail", activeVariant: "sidebar" }),
				collapsed && "justify-center px-0",
				className,
			),
			children: (
				<>
					{showIcon ? (
						<span className={sideNavItemIconVariants({ size: "rail" })}>
							{icon}
						</span>
					) : null}
					{collapsed ? null : (
						<>
							<span className="min-w-0 flex-1 truncate">{label}</span>
							{badge ? <span className="ms-auto shrink-0">{badge}</span> : null}
						</>
					)}
				</>
			),
		},
		defaultTagName: "button",
	}) as ReactElement

	if (collapsed) {
		return (
			<SimpleTooltip content={label} side="right">
				{element}
			</SimpleTooltip>
		)
	}
	return element
}
SidebarItem.displayName = "SidebarItem"
