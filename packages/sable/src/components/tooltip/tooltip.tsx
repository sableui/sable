import { Tooltip as Base } from "@base-ui/react/tooltip"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity } from "../../lib/density"

/**
 * Tooltip — themed wrapper over Base UI's Tooltip (hover/focus open, ARIA
 * description wiring, collision-aware positioning all come from Base UI).
 * Wrap an app (or a group) in <TooltipProvider> to share open/close delays so
 * adjacent tooltips open instantly once one is visible. Compose:
 *
 *   <TooltipProvider>
 *     <Tooltip>
 *       <TooltipTrigger render={<Button variant="ghost">?</Button>} />
 *       <TooltipContent>Stored permanently on Arweave.</TooltipContent>
 *     </Tooltip>
 *   </TooltipProvider>
 */
export const TooltipProvider = Base.Provider
export const Tooltip = Base.Root
export const TooltipTrigger = Base.Trigger
export const TooltipPortal = withPortalThemeScope(Base.Portal)

type PositionerProps = ComponentProps<typeof Base.Positioner>
type PopupProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/** Which side of the trigger to render against. @default "top" */
	side?: PositionerProps["side"]
	/** Alignment along the chosen side. @default "center" */
	align?: PositionerProps["align"]
	/** Gap between trigger and popup, in px. @default 6 */
	sideOffset?: PositionerProps["sideOffset"]
}

/**
 * The tooltip surface. Composes Portal + Positioner + Popup so callers pass a
 * single element. Defaults to the `top` side with a 6px offset.
 */
export function TooltipContent({
	className,
	children,
	side = "top",
	align = "center",
	sideOffset = 6,
	...props
}: PopupProps) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<TooltipPortal>
			<Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-(--z-overlay)">
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"select-none rounded-sm border border-border-floating bg-popover px-2.5 py-1.5 text-label-md text-popover-foreground shadow-md outline-none",
						"motion-pop duration-(--motion-duration-fast)",
						className,
					)}
					{...props}
				>
					{children}
				</Base.Popup>
			</Base.Positioner>
		</TooltipPortal>
	)
}

type ArrowProps = Omit<ComponentProps<typeof Base.Arrow>, "className"> & {
	className?: string
}

/** Optional pointer connecting the popup to its trigger. Place inside TooltipContent. */
export function TooltipArrow({ className, ...props }: ArrowProps) {
	return (
		<Base.Arrow
			className={cn(
				"group/arrow data-[side=bottom]:-top-1.5 data-[side=left]:-right-1.5 data-[side=right]:-left-1.5 data-[side=top]:-bottom-1.5",
				className,
			)}
			{...props}
		>
			{/* A popup-coloured square turned 45°. Only the two outward edges carry
			    the border, so the inner half covers the popup's own border and the
			    point reads as part of the surface. */}
			<span
				aria-hidden
				className="block size-2.5 rotate-45 border-border-floating bg-popover group-data-[side=top]/arrow:border-b group-data-[side=top]/arrow:border-r group-data-[side=bottom]/arrow:border-t group-data-[side=bottom]/arrow:border-l group-data-[side=left]/arrow:border-t group-data-[side=left]/arrow:border-r group-data-[side=right]/arrow:border-b group-data-[side=right]/arrow:border-l"
			/>
		</Base.Arrow>
	)
}

type SimpleTooltipProps = Omit<ComponentProps<typeof Base.Root>, "children"> & {
	/** The tooltip body. */
	content: ReactNode
	/** The single element the tooltip describes; becomes the trigger. */
	children: ReactElement
	/** Which side of the trigger to render against. @default "top" */
	side?: PopupProps["side"]
	/** Alignment along the chosen side. @default "center" */
	align?: PopupProps["align"]
	/** Gap between trigger and popup, in px. @default 6 */
	sideOffset?: PopupProps["sideOffset"]
}

/**
 * Shorthand tooltip for the common case — no Trigger/Content boilerplate:
 *
 *   <SimpleTooltip content="Stored on Arweave">
 *     <Button variant="ghost">?</Button>
 *   </SimpleTooltip>
 *
 * The child becomes the trigger (via Base UI's `render`). Root props (delay,
 * open, …) pass through. For grouped open/close delays, wrap a region in
 * <TooltipProvider>; for arrows or richer content, use the composable parts.
 */
export function SimpleTooltip({
	content,
	children,
	side,
	align,
	sideOffset,
	...root
}: SimpleTooltipProps) {
	return (
		<Base.Root {...root}>
			<Base.Trigger render={children} />
			<TooltipContent side={side} align={align} sideOffset={sideOffset}>
				{content}
			</TooltipContent>
		</Base.Root>
	)
}
