import { Popover as Base } from "@base-ui/react/popover"
import type { ComponentProps } from "react"
import { anchoredScroll } from "../../lib/anchored-scroll"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { PresentationProvider } from "../../lib/presentation"
import { useAnchoredDensity } from "../../lib/density"

/**
 * Popover — themed wrapper over Base UI's Popover (open/close on trigger press,
 * focus management, collision-aware positioning, Esc/outside dismissal all come
 * from Base UI). Unlike Tooltip, a Popover holds interactive content and opens
 * on click. Compose:
 *
 *   <Popover>
 *     <PopoverTrigger render={<Button variant="secondary">Open</Button>} />
 *     <PopoverContent>
 *       <PopoverTitle>Edition details</PopoverTitle>
 *       <PopoverDescription>Stored permanently on Arweave.</PopoverDescription>
 *       <PopoverClose render={<Button variant="ghost" size="sm">Close</Button>} />
 *     </PopoverContent>
 *   </Popover>
 */
export const Popover = Base.Root
export const PopoverTrigger = Base.Trigger
export const PopoverPortal = withPortalThemeScope(Base.Portal)
export const PopoverClose = Base.Close

type PositionerProps = ComponentProps<typeof Base.Positioner>
type ContentProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/** Which side of the trigger to render against. @default "bottom" */
	side?: PositionerProps["side"]
	/** Alignment along the chosen side. @default "center" */
	align?: PositionerProps["align"]
	/** Gap between trigger and popup, in px. @default 8 */
	sideOffset?: PositionerProps["sideOffset"]
	/**
	 * Position against a different element/ref than the trigger (an element, a
	 * ref, or a getter). Base UI has no separate Anchor part — pass it here to
	 * decouple where the popover opens from what toggles it.
	 */
	anchor?: PositionerProps["anchor"]
}

/**
 * The popover surface. Composes Portal + Positioner + Popup so callers pass a
 * single element. Defaults to the `bottom` side with an 8px offset.
 */
export function PopoverContent({
	className,
	children,
	side = "bottom",
	align = "center",
	sideOffset = 8,
	anchor,
	...props
}: ContentProps) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<PopoverPortal>
			<Base.Positioner
				side={side}
				align={align}
				sideOffset={sideOffset}
				anchor={anchor}
				className="z-(--z-overlay)"
			>
				<Base.Popup
					{...anchoredDensity}
					className={cn(
						"w-72 rounded-md border border-border-floating bg-popover sable-surface-popover p-4 text-popover-foreground shadow-md outline-none",
						// A popover holds arbitrary content, so it is the surface most likely
						// to outgrow the room under its trigger. See lib/anchored-scroll.
						// PopoverArrow is unaffected: its containing block is the positioner
						// (an ancestor of the popup), so it escapes the popup's overflow clip.
						anchoredScroll,
						"motion-pop",
						className,
					)}
					{...props}
				>
					{/* Opened from a sheet, a popover's content is still a page. */}
					<PresentationProvider value="page">{children}</PresentationProvider>
				</Base.Popup>
			</Base.Positioner>
		</PopoverPortal>
	)
}

type TitleProps = Omit<ComponentProps<typeof Base.Title>, "className"> & {
	className?: string
}

/** Accessible heading that labels the popover (Base UI wires aria-labelledby). */
export function PopoverTitle({ className, ...props }: TitleProps) {
	return (
		<Base.Title
			className={cn("mb-1 text-title-sm text-popover-foreground", className)}
			{...props}
		/>
	)
}

type DescriptionProps = Omit<
	ComponentProps<typeof Base.Description>,
	"className"
> & { className?: string }

/** Supplementary copy below the title (Base UI wires aria-describedby). */
export function PopoverDescription({ className, ...props }: DescriptionProps) {
	return (
		<Base.Description
			className={cn("text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}

type ArrowProps = Omit<ComponentProps<typeof Base.Arrow>, "className"> & {
	className?: string
}

/** Optional pointer connecting the popup to its trigger. Place inside PopoverContent. */
export function PopoverArrow({ className, ...props }: ArrowProps) {
	return (
		<Base.Arrow
			className={cn(
				// Offsets on the spacing scale, like the size-2.5 square they place, so
				// the point stays seated on the popup's edge at every density.
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
