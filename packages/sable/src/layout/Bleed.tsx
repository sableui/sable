import type { ComponentPropsWithRef } from "react"
import { cn } from "../lib/cn"

export interface BleedProps extends ComponentPropsWithRef<"div"> {}

/**
 * Bleed — lets content escape a width-capped or inset ancestor and span the full
 * width of its layout container: a profile cover, a hero band, or full-bleed
 * media inside a `max`-capped `Region` / `Page`.
 *
 * It uses container-query width units (`width: 100cqw` + `margin-inline: calc(50%
 * - 50cqw)`), so it spans the nearest query container rather than the raw
 * viewport. `AppShell`'s content region is a container (`container-type:
 * inline-size`), so a Bleed inside it fills the content area and stops at a fixed
 * left `Sidebar` instead of bleeding under it. With no container ancestor (a
 * full-bleed app, or `Bleed` used standalone) `cqw` resolves against the viewport,
 * so behavior is unchanged there. Nest a `Region` / `Center` inside to re-inset.
 *
 * The width and margins are classes, never inline style, so a breakpoint can
 * turn the bleed off: `<Bleed className="lg:mx-0 lg:w-auto">` runs edge to edge
 * on a phone and sits inside the column on a desktop.
 *
 *   <Region max="feed">
 *     <Bleed><ProfileCover /></Bleed>
 *     …
 *   </Region>
 */
export function Bleed({ className, style, children, ref, ...rest }: BleedProps) {
	return (
		<div
			ref={ref}
			className={cn("mx-[calc(50%_-_50cqw)] w-[100cqw]", className)}
			style={style}
			{...rest}
		>
			{children}
		</div>
	)
}
Bleed.displayName = "Bleed"
