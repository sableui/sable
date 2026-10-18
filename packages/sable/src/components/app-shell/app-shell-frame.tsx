"use client";

import { createContext, type ReactNode, useContext } from "react"

/** How AppShell frames its main content on desktop. See `AppShellProps.frame`. */
export type AppShellFrame = "flush" | "inset"

/**
 * The one coupling between AppShell and the Sidebar in its `sidebar` slot.
 *
 * An inset shell paints the rail's surface behind everything and floats main
 * as a rounded panel, so the rail must (1) drop its own right border — the gap
 * around the panel is the divider now — and (2) fill the body row instead of
 * sizing itself to the viewport, since the shell no longer scrolls. AppShell
 * provides the frame around the `sidebar` slot ONLY: a Sidebar placed in the
 * page content (an inline settings rail) never sees it and keeps its border.
 * `null` means "not inside an AppShell sidebar slot".
 */
const AppShellFrameContext = createContext<AppShellFrame | null>(null)

/** Provided by AppShell around its `sidebar` slot. A component, so a server-rendered AppShell can mount it. */
export function AppShellFrameProvider({ frame, children }: { frame: AppShellFrame; children?: ReactNode }) {
	return <AppShellFrameContext.Provider value={frame}>{children}</AppShellFrameContext.Provider>
}

/** The frame of the AppShell whose `sidebar` slot this renders in, or `null` outside one. */
export function useAppShellFrame(): AppShellFrame | null {
	return useContext(AppShellFrameContext)
}
