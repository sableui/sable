import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { AppShellDock } from "./app-shell-dock"
import { type AppShellFrame, AppShellFrameProvider } from "./app-shell-frame"
import { AppShellMain } from "./app-shell-main"
import { SkipLink } from "./skip-link"

export interface AppShellProps extends Omit<ComponentProps<"div">, "title"> {
	/**
	 * Full-width status banners pinned above the frame (offline / chain-down).
	 * Rendered in flow at the very top so they push the rest down.
	 */
	banners?: ReactNode
	/**
	 * Mobile top header (e.g. `<AppHeader>`). Expected to hide itself at `lg`
	 * (the sidebar takes over). Rendered sticky-friendly above the body row.
	 */
	header?: ReactNode
	/**
	 * Desktop side navigation (e.g. `<Sidebar>`). Expected to hide itself below
	 * `lg`. Rendered in flow as the leading column of the body row.
	 */
	sidebar?: ReactNode
	/**
	 * Mobile bottom navigation (e.g. `<BottomNav>`). Expected to hide itself at
	 * `lg`. Rendered fixed to the bottom edge; `<main>` reserves space for it.
	 */
	bottomNav?: ReactNode
	/**
	 * Persistent chrome that stays on screen across routes — a now-playing bar,
	 * an active-call bar, an upload tray. Full width, pinned to the bottom edge
	 * (above `bottomNav` on mobile); the desktop Sidebar shortens to clear it.
	 * The contents paint their own surface and border, since content scrolls
	 * beneath them. Keep it mounted in a layout that outlives route changes, or
	 * the playback it controls restarts.
	 */
	dock?: ReactNode
	/** Floating overlays (a message launcher, FAB, modal mount points). */
	overlays?: ReactNode
	/**
	 * How the desktop frame (`lg` and up) holds the content. Below `lg` the two
	 * are identical: mobile header, plain main, page scroll, bottom nav.
	 * - `flush` (default) — main sits directly on the page beside the rail and
	 *   the document scrolls.
	 * - `inset` — the shell's ground (`shell-ground`, one step off the rail's
	 *   surface) holds the rail and the gap, and main
	 *   is a raised, rounded, bordered panel inset from the window edges that
	 *   scrolls inside itself while the rail stays put. For dense, multi-pane
	 *   product apps. The Sidebar in the `sidebar` slot reads the frame (see
	 *   `app-shell-frame.tsx`), drops its right border — the gap is the divider
	 *   now — and fills the body row. Pair it with `surface="rail"`; with
	 *   `surface="page"` the ground turns page-coloured and the panel's border
	 *   alone lifts it.
	 * @default "flush"
	 */
	frame?: AppShellFrame
	/** Main content. */
	children?: ReactNode
}

/**
 * AppShell — the application frame. Lays out optional status banners, a mobile
 * header, a desktop sidebar, the main content region, a mobile bottom nav, and
 * a persistent dock, and floating overlays, with a built-in skip link and the `#main-content` target.
 *
 * It is layout-agnostic about the breakpoint switch: each slot component owns
 * its own `hidden`/`lg:*` visibility (Sidebar is `hidden lg:flex`, AppHeader and
 * BottomNav are `lg:hidden`), so the same shell drives mobile and desktop. The
 * only couplings AppShell adds are reserving bottom space for a fixed
 * `bottomNav` and, with `frame="inset"`, telling the Sidebar in its slot to drop
 * its border and fill the row (`AppShellFrameProvider`, app-shell-frame.tsx).
 *
 *   <AppShell
 *     banners={<NetworkBanner />}
 *     header={<AppHeader title="Studio" />}
 *     sidebar={<Sidebar>…</Sidebar>}
 *     bottomNav={<BottomNav>…</BottomNav>}
 *   >
 *     <Region max="feed">…</Region>
 *   </AppShell>
 */
export function AppShell({
	banners,
	header,
	sidebar,
	bottomNav,
	dock,
	overlays,
	frame = "flush",
	className,
	children,
	...rest
}: AppShellProps) {
	const inset = frame === "inset"
	return (
		<div
			data-frame={inset ? "inset" : undefined}
			className={cn(
				// `overflow-x-clip` (not `-hidden`) contains horizontal bleed WITHOUT
				// establishing a scroll container — `-hidden` forces `overflow-y: auto`,
				// which breaks `position: sticky` on a descendant Sidebar.
				"flex min-h-screen flex-col overflow-x-clip bg-background text-foreground",
				// Inset, from lg: the shell IS the viewport and never scrolls — main
				// does. The ground is the rail's surface, so the rail and the gap
				// around the panel read as one plane. A page-surface rail (Sidebar
				// surface="page") is page-coloured, so the ground follows it and the
				// panel's border carries the lift.
				inset &&
					"lg:h-dvh lg:min-h-0 lg:bg-shell-ground lg:[&:has(>[data-app-shell-body]>[data-surface=page])]:bg-background",
				className,
			)}
			{...rest}
		>
			<SkipLink />

			{banners ? <div className="relative z-(--z-nav)">{banners}</div> : null}

			{header}

			<div data-app-shell-body={inset ? "" : undefined} className="flex min-h-0 flex-1">
				{inset ? <AppShellFrameProvider frame="inset">{sidebar}</AppShellFrameProvider> : sidebar}
				<AppShellMain
					id="main-content"
					scrolls={inset}
					// Inset, main is the scroll container, so the skip link has to land
					// focus IN it or PageDown and the arrows have nothing to scroll. -1
					// keeps it out of the tab order (Chrome's focusable-scroller rule
					// would otherwise add a tab stop for the whole panel).
					tabIndex={inset ? -1 : undefined}
					// A query container so layout primitives can size to the content
					// area, not the raw viewport — chiefly `Bleed`, which then fills the
					// space beside a fixed Sidebar instead of bleeding under it.
					// (`container-type: inline-size` also makes this a containing block
					// for position:fixed/absolute descendants; overlays portal to <body>
					// so they're unaffected.)
					style={{ containerType: "inline-size" }}
					className={cn(
						"min-w-0 flex-1",
						bottomNav &&
							"pb-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))] lg:pb-0",
						// The inset panel. A spacing-step gap on the open sides (the rail
						// is the leading one). Banners and the dock are in flow in the
						// shell's column, so the bottom gap already sits above a dock.
						// Sticky children stick to the panel's top, and the overflow
						// clips them to its rounded corners. A resting surface: a hairline
						// edge and the subtlest raise, never a floating shadow.
						inset &&
							cn(
								"outline-none lg:m-2 lg:overflow-y-auto lg:overscroll-contain scrollbar-quiet",
								"lg:rounded-lg lg:border lg:border-border lg:bg-background lg:shadow-sm",
								sidebar && "lg:ms-0",
							),
					)}
				>
					{children}
				</AppShellMain>
			</div>

			{dock ? <AppShellDock aboveBottomNav={Boolean(bottomNav)}>{dock}</AppShellDock> : null}
			{bottomNav}
			{overlays}
		</div>
	)
}
AppShell.displayName = "AppShell"
