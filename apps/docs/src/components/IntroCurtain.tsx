import { cn } from "@sableui/react"
import type { Ref } from "react"
import { createPortal } from "react-dom"
import { SableMark, type SableMarkHandle } from "./SableLogo"

/*
 * The homepage intro: on a blank page the S is traced as a technical drawing —
 * construction guides, then its outline — fills in, turns into the sable, and
 * fades and softens out while the page arrives underneath.
 *
 * It plays on every full page load that lands on the homepage — a refresh
 * included — and at most once per load: someone clicking Home from a docs page
 * wants the page, not a show. Never under reduced motion. The decision is made
 * at module load, so the route fallback (before the homepage code has loaded)
 * and the homepage itself always agree about whether the curtain is up.
 */

function decide(): boolean {
	if (typeof window === "undefined") return false
	// The homepage answers at both `/` and `/introduction` (where the logo links).
	if (!["", "introduction"].includes(window.location.pathname.replace(/^\/+|\/+$/g, ""))) return false
	return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

let pending = decide()

/** Whether the intro still has to play in this page load. */
export function introPending(): boolean {
	return pending
}

export function markIntroPlayed(): void {
	pending = false
}

/**
 * The curtain. Two layers on purpose: the background dissolves at its own pace
 * while the mark softens out with a blur and a slight lift, so the mark reads
 * as leaving rather than just dimming with the page. Portaled to <body> because AppShell's <main> is a size
 * container, which makes `position: fixed` resolve against <main>, not the
 * viewport.
 */
export function IntroCurtain({
	markRef,
	leaving = false,
}: {
	markRef?: Ref<SableMarkHandle>
	leaving?: boolean
}) {
	return createPortal(
		// Catches pointer input while it covers the page, so a click meant to skip
		// the intro never lands on a control nobody can see yet.
		<div aria-hidden="true" data-intro-curtain="" className={cn("fixed inset-0 z-(--z-overlay)", leaving && "pointer-events-none")}>
			<div
				className={cn(
					"absolute inset-0 bg-background transition-opacity duration-(--motion-duration-slower) ease-standard",
					leaving && "opacity-0",
				)}
			/>
			<div className="absolute inset-0 grid place-items-center">
				<div
					className={cn(
						"text-foreground transition-[opacity,filter,scale] duration-(--motion-duration-slower) ease-standard",
						leaving && "scale-110 opacity-0 blur-md",
					)}
				>
					<SableMark ref={markRef} outlined className="size-16 sm:size-20" />
				</div>
			</div>
		</div>,
		document.body,
	)
}
