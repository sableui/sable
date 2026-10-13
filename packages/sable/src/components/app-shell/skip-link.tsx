import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import { buttonVariants } from "../button/button.variants"

/**
 * SkipLink — the first stop in the tab order: hidden until focused, then a
 * small primary button pinned to the top-start corner that jumps past the
 * header and navigation to the page's main content.
 *
 * AppShell renders one already. Use this in a layout of your own (a storefront
 * with a top header, a marketing page), put it first in the body, and give the
 * `<main>` the matching id:
 *
 *   <SkipLink />
 *   <SiteHeader />
 *   <main id="main-content" tabIndex={-1}>…</main>
 */
export function SkipLink({
	href = "#main-content",
	children = "Skip to content",
	className,
	...props
}: ComponentProps<"a">) {
	return (
		<a
			href={href}
			// Button's own primary look (radius, control height, ring), so the
			// skip link is not a private lookalike of it.
			className={cn(
				buttonVariants({ variant: "primary", size: "sm" }),
				"text-label-md sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-(--z-skip-link)",
				className,
			)}
			{...props}
		>
			{children}
		</a>
	)
}
SkipLink.displayName = "SkipLink"
