"use client";

import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { DensityProvider } from "../../lib/density"

type WorkspaceProps = Omit<ComponentProps<"div">, "children"> & {
	/** Top chrome — a toolbar, menubar, or document bar. */
	toolbar?: ReactNode
	/** Bottom chrome — usually a StatusBar. */
	statusBar?: ReactNode
	/**
	 * Phone navigation — usually a BottomNav. Its row is reserved below `lg`
	 * (BottomNav's own breakpoint) and gone above it, so the body ends where the
	 * nav begins without the app subtracting the nav's height from the viewport.
	 */
	bottomNav?: ReactNode
	/**
	 * Density scope for everything inside. Defaults to `compact`, because a
	 * workspace IS the compact register — see DESIGN.md → Registers.
	 */
	density?: "compact" | "comfortable"
	/** Text for the skip link. @default "Skip to canvas" */
	skipLinkLabel?: string
	/** The body — normally a PanelGroup. */
	children: ReactNode
}

/**
 * Workspace — the shell for a tool: a fixed viewport partitioned into regions
 * that scroll independently.
 *
 * Deliberately NOT AppShell. AppShell is the page register's frame, built around
 * a scrolling document whose height comes from its content. A workspace is the
 * opposite shape: it owns the viewport, only its regions scroll, and the canvas
 * never scrolls at all.
 *
 *   <Workspace toolbar={<Toolbar/>} statusBar={<StatusBar>…</StatusBar>}>
 *     <PanelGroup>
 *       <Panel label="Layers" width={240}>…</Panel>
 *       <WorkspaceCanvas>…</WorkspaceCanvas>
 *     </PanelGroup>
 *   </Workspace>
 *
 * Three structural details do the real work:
 *
 * - The shell is a flex column and the body is its only `flex-1` row. Every
 *   slot is optional, and a fixed `auto / 1fr / auto` grid assumed all of them:
 *   with no toolbar, the body fell into the first `auto` track and the status
 *   bar took the `1fr` one, so the body sized to its content and the status bar
 *   was pushed off the bottom. A slot whose component renders nothing now costs
 *   nothing too, which a track list counted from the props could not promise.
 *
 * - `min-h-0` on the body row. Without it a grid/flex child refuses to shrink
 *   below its content, `overflow-y-auto` never activates on a panel, and panels
 *   grow instead of scrolling — the reason a tool shell "mysteriously" ends up
 *   with no scroll containers at all.
 * - `data-density` scopes the control ladder, so every control inside lands on
 *   the workspace sizes without any selector overriding a height afterwards.
 */
export function Workspace({
	toolbar,
	statusBar,
	bottomNav,
	density = "compact",
	skipLinkLabel = "Skip to canvas",
	className,
	children,
	...props
}: WorkspaceProps) {
	return (
		// `data-density` scopes the ladder via CSS for everything in the subtree;
		// DensityProvider carries the same value to anything that PORTALS out of it.
		// A menu or select popup mounts at the document root, so CSS reaches it
		// never — measured, its --control-md resolved to the comfortable 40px while
		// the workspace around it was 32px, and --button-radius reverted to pills.
		<DensityProvider value={density}>
		<div
			data-density={density}
			className={cn(
				"flex h-dvh flex-col overflow-hidden bg-canvas text-canvas-foreground",
				className,
			)}
			{...props}
		>
			{/* Kept by hand, since we're not inheriting AppShell's. A tool still owes
			    keyboard users a way past the chrome. */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-(--z-skip-link) focus:rounded-sm focus:bg-popover focus:px-3 focus:py-2 focus:text-ui-md focus:text-popover-foreground focus:ring-2 focus:ring-ring"
			>
				{skipLinkLabel}
			</a>

			{toolbar}
			<div data-workspace-body="" className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)]">
				{children}
			</div>
			{statusBar}
			{/* BottomNav is fixed to the viewport (it is AppShell's too), so this row
			    holds its height open rather than containing it. Gone at lg, where
			    BottomNav hides itself. */}
			{bottomNav ? (
				<div
					data-workspace-bottom-nav=""
					className="h-[calc(var(--nav-height,56px)+env(safe-area-inset-bottom,0px))] shrink-0 lg:hidden"
				>
					{bottomNav}
				</div>
			) : null}
		</div>
		</DensityProvider>
	)
}
Workspace.displayName = "Workspace"

/**
 * WorkspaceCanvas — the work surface, and the `main` landmark.
 *
 * Panels are `aside` chrome; this is the thing being edited, so it carries the
 * landmark and the `#main-content` target the skip link points at. It clips
 * rather than scrolls: panning and zooming a canvas is the viewport's job, and a
 * scrollbar on the artboard means the transform isn't in charge.
 */
export function WorkspaceCanvas({ className, children, ...props }: ComponentProps<"main">) {
	return (
		<main
			id="main-content"
			className={cn("relative min-h-0 min-w-0 flex-1 overflow-hidden bg-canvas", className)}
			{...props}
		>
			{children}
		</main>
	)
}
WorkspaceCanvas.displayName = "WorkspaceCanvas"

/**
 * WorkspaceBar — the top chrome strip: a toolbar, document tabs, a menubar row.
 * Sits at `--chrome-bar-height` with a hairline beneath, so it reads as chrome
 * rather than as content.
 */
export function WorkspaceBar({ className, children, ...props }: ComponentProps<"header">) {
	return (
		<header
			// Lets a part inside sit on the bar's own edge: underline tabs stretch
			// to its height and draw their mark on its hairline instead of a
			// second, shorter rule of their own.
			data-workspace-bar=""
			className={cn(
				"flex h-(--chrome-bar-height) shrink-0 items-center gap-1 border-b border-hairline bg-panel px-2",
				className,
			)}
			{...props}
		>
			{children}
		</header>
	)
}
WorkspaceBar.displayName = "WorkspaceBar"
