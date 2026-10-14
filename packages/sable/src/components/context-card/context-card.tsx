import { PreviewCard as Base } from "@base-ui/react/preview-card"
import type { ComponentProps } from "react"
import { anchoredScroll } from "../../lib/anchored-scroll"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity } from "../../lib/density"

/**
 * ContextCard — a themed rich hover/preview card over Base UI's PreviewCard
 * (hover/focus open with delay, collision-aware positioning, Esc/outside
 * dismissal, ARIA wiring all come from Base UI). Unlike Tooltip it holds rich,
 * non-interactive context (a profile, a project summary) and opens on hover or
 * focus of an inline anchor. Compose:
 *
 *   <ContextCard>
 *     <ContextCardTrigger render={<a href="/u/ada">@ada</a>} />
 *     <ContextCardContent>
 *       <div className="flex items-center gap-3">
 *         <Avatar src={user.pfp} fallback="AD" />
 *         <div>…name + handle…</div>
 *       </div>
 *       <p className="text-body-sm text-muted-foreground">…bio…</p>
 *     </ContextCardContent>
 *   </ContextCard>
 *
 * State surfaces via Base UI data-attributes: data-[starting-style] and
 * data-[ending-style] drive the open/close transition.
 */
export const ContextCard = Base.Root
export const ContextCardTrigger = Base.Trigger
export const ContextCardPortal = withPortalThemeScope(Base.Portal)

type PositionerProps = ComponentProps<typeof Base.Positioner>
type ContentProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/** Which side of the trigger to render against. @default "bottom" */
	side?: PositionerProps["side"]
	/** Alignment along the chosen side. @default "center" */
	align?: PositionerProps["align"]
	/** Gap between trigger and popup, in px. @default 8 */
	sideOffset?: PositionerProps["sideOffset"]
}

/**
 * The preview-card surface. Composes Portal + Positioner + Popup so callers pass
 * a single element. Defaults to the `bottom` side with an 8px offset; the popup
 * is a fixed 20rem-wide card.
 */
export function ContextCardContent({
	className,
	children,
	side = "bottom",
	align = "center",
	sideOffset = 8,
	...props
}: ContentProps) {
	// Same surface as PopoverContent (radius, popover surface hook, anchored
	// density) — the two are siblings and must not drift. Only the fixed 20rem
	// width differs.
	const anchoredDensity = useAnchoredDensity()
	return (
		<ContextCardPortal>
			<Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-(--z-overlay)">
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"w-80 origin-(--transform-origin) rounded-md border border-border-floating bg-popover sable-surface-popover p-4 text-popover-foreground shadow-md outline-none",
						// A preview card is a fixed width but an unbounded height. See
						// lib/anchored-scroll (the arrow escapes the clip, as in Popover).
						anchoredScroll,
						"motion-pop",
						className,
					)}
					{...props}
				>
					{children}
				</Base.Popup>
			</Base.Positioner>
		</ContextCardPortal>
	)
}

type ArrowProps = Omit<ComponentProps<typeof Base.Arrow>, "className"> & {
	className?: string
}

/** Optional pointer connecting the popup to its trigger. Place inside ContextCardContent. */
export function ContextCardArrow({ className, ...props }: ArrowProps) {
	return (
		<Base.Arrow
			className={cn(
				"group/arrow data-[side=bottom]:-top-1.5 data-[side=left]:-right-1.5 data-[side=right]:-left-1.5 data-[side=top]:-bottom-1.5",
				className,
			)}
			{...props}
		>
			{/* Same mark as PopoverArrow / TooltipArrow: a popup-coloured square
			    turned 45°, bordered on its two outward edges only. Without it the
			    Arrow rendered an empty, invisible box. */}
			<span
				aria-hidden
				className="block size-2.5 rotate-45 border-border-floating bg-popover group-data-[side=top]/arrow:border-b group-data-[side=top]/arrow:border-r group-data-[side=bottom]/arrow:border-t group-data-[side=bottom]/arrow:border-l group-data-[side=left]/arrow:border-t group-data-[side=left]/arrow:border-r group-data-[side=right]/arrow:border-b group-data-[side=right]/arrow:border-l"
			/>
		</Base.Arrow>
	)
}
