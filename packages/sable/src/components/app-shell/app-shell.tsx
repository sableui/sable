import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { buttonVariants } from "../button/button.variants"

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
	/** Floating overlays (a message launcher, FAB, modal mount points). */
	overlays?: ReactNode
	/** Main content. */
	children?: ReactNode
}

/**
 * AppShell — the application frame. Lays out optional status banners, a mobile
 * header, a desktop sidebar, the main content region, a mobile bottom nav, and
 * floating overlays, with a built-in skip link and the `#main-content` target.
 *
 * It is layout-agnostic about the breakpoint switch: each slot component owns
 * its own `hidden`/`lg:*` visibility (Sidebar is `hidden lg:flex`, AppHeader and
 * BottomNav are `lg:hidden`), so the same shell drives mobile and desktop. The
 * only coupling AppShell adds is reserving bottom space for a fixed `bottomNav`.
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
	overlays,
	className,
	children,
	...rest
}: AppShellProps) {
	return (
		<div
			className={cn(
				// `overflow-x-clip` (not `-hidden`) contains horizontal bleed WITHOUT
				// establishing a scroll container — `-hidden` forces `overflow-y: auto`,
				// which breaks `position: sticky` on a descendant Sidebar.
				"flex min-h-screen flex-col overflow-x-clip bg-background text-foreground",
				className,
			)}
			{...rest}
		>
			<a
				href="#main-content"
				// Button's own primary look (radius, control height, ring), so the
				// skip link is not a private lookalike of it.
				className={cn(
					buttonVariants({ variant: "primary", size: "sm" }),
					"text-label-md sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-(--z-skip-link)",
				)}
			>
				Skip to content
			</a>

			{banners ? <div className="relative z-(--z-nav)">{banners}</div> : null}

			{header}

			<div className="flex min-h-0 flex-1">
				{sidebar}
				<main
					id="main-content"
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
					)}
				>
					{children}
				</main>
			</div>

			{bottomNav}
			{overlays}
		</div>
	)
}
AppShell.displayName = "AppShell"
