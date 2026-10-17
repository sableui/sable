"use client";

import { useRender } from "@base-ui/react/use-render"
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactElement,
	type ReactNode,
	useContext,
	useState,
} from "react"
import { cn } from "../../lib/cn"
import { HighlightGlide } from "../../lib/highlight-glide"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { RAIL_ROW_INLINE, sideNavItemIconVariants, sideNavItemVariants } from "../side-nav/side-nav.variants"
import { SimpleTooltip } from "../tooltip"

type SidebarContextValue = {
	collapsed: boolean
	icons: boolean
	/**
	 * The rail has been collapsed at some point in this mount, so labels that
	 * mount now are coming back on a reopen and may fade in. False on first
	 * paint, so an expanded rail's labels are simply there on load.
	 */
	reopened?: boolean
}
const SidebarContext = createContext<SidebarContextValue>({
	collapsed: false,
	icons: true,
})

/** Read the rail's collapsed state — e.g. to swap a full wordmark for a mark. */
/** A label coming back as the rail reopens fades in rather than appearing. */
const LABEL_FADE = "starting:opacity-0 transition-opacity duration-(--motion-duration-base) ease-decelerate"

export function useSidebar(): SidebarContextValue {
	return useContext(SidebarContext)
}

export interface SidebarProps extends ComponentPropsWithRef<"aside"> {
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the collapse ease and the
	 * current-page glide, `off` stills it. It can only turn motion down — it
	 * never overrides a reader's reduce-motion setting.
	 * @default "full"
	 */
	motion?: MotionLevel
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
	/**
	 * Which surface the rail is painted on.
	 * - `rail` (default) — its own `--sidebar-*` surface, with a border. Right
	 *   for a full-height rail that frames the app on its own; a theme can tint
	 *   it, or paint it dark on a light page.
	 * - `page` — the page's own surface and ink, no border. Use it when a
	 *   full-width header sits above the rail: a tinted column that starts
	 *   under a page-coloured bar reads as pasted on, not as chrome.
	 * @default "rail"
	 */
	surface?: "rail" | "page"
}

/** The layout each `variant` takes; colours and width are shared. */
const SIDEBAR_VARIANT = {
	// Full viewport less an AppShell dock (0 without one), so a persistent
	// player bar never covers the rail's last rows.
	app: "hidden lg:flex lg:sticky lg:top-0 lg:h-[calc(100vh-var(--dock-height,0px))] lg:self-start",
	inline: "flex h-full",
} as const

/**
 * Sidebar — the desktop side-navigation rail. An in-flow sticky column, hidden
 * below `lg` (where the mobile AppHeader + BottomNav take over). Compose a brand
 * header, a scrollable nav, and a bottom-anchored footer:
 *
 *   <Sidebar collapsed={collapsed}>
 *     <SidebarHeader><SidebarBrand mark={<Logo />} label="Studio" render={<Link to="/" />} /></SidebarHeader>
 *     <SidebarNav>
 *       <SidebarItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
 *     </SidebarNav>
 *     <SidebarFooter>{accountMenu}</SidebarFooter>
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

/**
 * The reverse, for `surface="page"`: the rail's tokens re-pointed at the
 * page's, so every part that inks with `--sidebar-*` (SidebarItem, the
 * footer rule, the brand's focus ring) reads as page content. Never combined
 * with SIDEBAR_INK — the two together would be a cycle.
 */
const PAGE_INK = [
	"[--sidebar:var(--background)] [--sidebar-foreground:var(--foreground)]",
	"[--sidebar-muted-foreground:var(--muted-foreground)]",
	"[--sidebar-primary:var(--primary)] [--sidebar-primary-foreground:var(--primary-foreground)]",
	"[--sidebar-accent:var(--muted)] [--sidebar-accent-foreground:var(--foreground)]",
	"[--sidebar-border:var(--border)] [--sidebar-ring:var(--ring)]",
].join(" ")

export function Sidebar({
	collapsed = false,
	icons = true,
	variant = "app",
	surface = "rail",
	motion,
	className,
	children,
	...props
}: SidebarProps) {
	// Labels fade back in only on a REOPEN. @starting-style also fires on an
	// element's first render, so an always-on fade played on every page load;
	// it is applied only once the rail has been collapsed in this mount.
	const [hasCollapsed, setHasCollapsed] = useState(collapsed)
	if (collapsed && !hasCollapsed) setHasCollapsed(true)
	return (
		<SidebarContext.Provider value={{ collapsed, icons, reopened: hasCollapsed && !collapsed }}>
			<aside
				data-motion={motionAttribute(motion)}
				data-collapsed={collapsed || undefined}
				data-variant={variant}
				data-surface={surface}
				className={cn(
					"shrink-0 flex-col bg-sidebar text-sidebar-foreground",
					// The rail is its own surface. Anything placed in it that inks with
					// page tokens — an Entity account row, an Avatar, a ghost Button,
					// an OverflowMenu — reads the rail's set instead, so a theme can paint a
					// dark rail on a light page (Meridian) and the footer row stays
					// legible. Muted ink is the rail's ink at 62% over the rail, unless
					// a theme names --sidebar-muted-foreground.
					// On the page surface the rail is separated by space and its
					// content, not a rule and a tonal step.
					surface === "rail" ? cn("border-r border-sidebar-border", SIDEBAR_INK) : PAGE_INK,
					SIDEBAR_VARIANT[variant],
					"w-[var(--sidebar-width,16rem)] data-[collapsed]:w-[var(--sidebar-width-collapsed,4rem)]",
					// Collapsing eases the width (`motion-size`, expressive) rather than
					// jumping 192px in one frame. It reflows the page beside the rail for
					// the length of the ease, which is the point: the content visibly
					// takes the room the rail gave up. Nothing inside jumps, because a
					// collapsed row's centred icon and an expanded row's inset icon sit
					// on the same column (measured: 21px from the rail edge in both).
					// Labels leave at once and fade back in as the rail reopens; the
					// clip keeps them from painting past the rail while it is narrow.
					"overflow-x-clip motion-size",
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

/**
 * Brand/logo row pinned to the top of the rail. At least 64px tall, not exactly:
 * a second row under the brand (a search field, a notifications button) wraps
 * onto its own line and the header grows to hold it, where a fixed height
 * clipped it. Give that row `basis-full` (or `w-full`) to put it on its own line.
 */
export function SidebarHeader({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	const { collapsed } = useSidebar()
	return (
		<div
			className={cn(
				"flex min-h-16 flex-wrap content-center items-center gap-y-2 px-3 has-[>:nth-child(2)]:py-3",
				// Collapsed, the brand mark centres on the same axis as the item icons.
				collapsed && "justify-center px-0",
				className,
			)}
			{...props}
		/>
	)
}
SidebarHeader.displayName = "SidebarHeader"

export interface SidebarBrandProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
	/** The logo mark. Sits in the items' icon slot (24px); collapsed, it is all that shows. */
	mark: ReactNode
	/** The product name, on the items' label column. Hidden when collapsed. */
	label: ReactNode
	/** Render as a link home, e.g. `render={<Link to="/" />}`. */
	render?: useRender.RenderProp
}

/**
 * The brand row, on the same grid as SidebarItem: the mark in the icon slot,
 * the name on the label column. It takes the item row's own inset, slot and
 * gap from the shared recipe, so it moves with the rail instead of an app
 * copying 12px + 12px + size-6 out of the bundle. Goes inside SidebarHeader.
 *
 *   <SidebarHeader>
 *     <SidebarBrand mark={<Logo />} label="Undertow" render={<Link to="/" />} />
 *   </SidebarHeader>
 */
export function SidebarBrand({ mark, label, render, className, "aria-label": ariaLabel, ...props }: SidebarBrandProps) {
	const { collapsed, reopened } = useSidebar()
	return useRender({
		render: render ?? <div />,
		props: {
			...props,
			// Collapsed shows the mark alone, so a string label still names the link.
			"aria-label": ariaLabel ?? (collapsed && typeof label === "string" ? label : undefined),
			className: cn(
				"flex min-w-0 items-center rounded-sm",
				// The item row's horizontal geometry, without its height.
				RAIL_ROW_INLINE,
				render && "motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
				collapsed && "justify-center px-0",
				className,
			),
			children: (
				<>
					<span className={sideNavItemIconVariants({ size: "rail" })}>{mark}</span>
					{collapsed ? null : <span className={cn("min-w-0 truncate text-title-sm", reopened && LABEL_FADE)}>{label}</span>}
				</>
			),
		},
		defaultTagName: "div",
	}) as ReactElement
}
SidebarBrand.displayName = "SidebarBrand"

/**
 * The scrollable nav region — grows to fill the rail between header and footer.
 *
 * The current-page fill is ONE element that glides to the active item (the
 * same engine and hand-off as SideNav), so a page change inside a persistent
 * layout reads as the marker moving rather than one row dimming and another
 * lighting. Each item keeps its own `data-[active]` fill as the server-render
 * fallback until the glide mounts.
 */
export function SidebarNav({
	className,
	children,
	...props
}: ComponentPropsWithRef<"nav">) {
	return (
		<nav
			className={cn(
					// Thin scrollbar so a long nav does not hand a fat platform bar to a
					// narrow rail, and contained overscroll so a wheel gesture that runs
					// out of nav stops there instead of scrolling the page behind it.
					"flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-quiet",
					"[&[data-glide]_[data-active]]:bg-transparent",
					className,
				)}
			{...props}
		>
			<HighlightGlide follow="data-active" timing="selection" className="rounded-sm bg-sidebar-accent motion-glide" />
			{children}
		</nav>
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
	const { collapsed, icons, reopened } = useSidebar()
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
							<span className={cn("min-w-0 flex-1 truncate", reopened && LABEL_FADE)}>{label}</span>
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
