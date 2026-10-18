"use client";

import type { ComponentProps } from "react"
import { useScrollActivity } from "../../lib/use-scroll-activity"

/**
 * AppShell's `<main>`. A client leaf only so an inset shell — where main is the
 * page's scroll container on desktop — can mark it `data-scrolling` while it
 * moves, which is what fades `scrollbar-quiet`'s thumb in on a touch drag or a
 * programmatic scroll (hover cannot see either). A flush shell scrolls the
 * document, so its main is left untracked.
 */
export function AppShellMain({ scrolls, ...props }: ComponentProps<"main"> & { scrolls: boolean }) {
	const trackScroll = useScrollActivity()
	return <main ref={scrolls ? trackScroll : undefined} {...props} />
}
