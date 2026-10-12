"use client";

import { type ReactNode, useEffect, useRef } from "react"
import { cn } from "../../lib/cn"

/**
 * The dock slot's wrapper. Sticky to the bottom edge, IN FLOW: at the end of
 * the page it sits after `<main>`, so nothing has to reserve its height. Above
 * a fixed BottomNav it sticks at the nav's top instead of under it.
 *
 * It publishes its height as `--dock-height` on the shell, because one thing
 * cannot follow it by flow: the app Sidebar is a sticky full-viewport column,
 * and without subtracting the dock its last rows sit underneath the player.
 */
export function AppShellDock({ aboveBottomNav, children }: { aboveBottomNav: boolean; children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const dock = ref.current
		const shell = dock?.parentElement
		if (!dock || !shell || typeof ResizeObserver === "undefined") return
		const publish = () => shell.style.setProperty("--dock-height", `${dock.offsetHeight}px`)
		publish()
		const observer = new ResizeObserver(publish)
		observer.observe(dock)
		return () => {
			observer.disconnect()
			shell.style.removeProperty("--dock-height")
		}
	}, [])

	return (
		<div
			ref={ref}
			data-app-shell-dock=""
			className={cn(
				"sticky bottom-0 z-(--z-nav)",
				aboveBottomNav && "bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))] lg:bottom-0",
			)}
		>
			{children}
		</div>
	)
}
