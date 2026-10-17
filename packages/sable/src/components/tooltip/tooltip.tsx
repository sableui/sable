import { Tooltip as Base } from "@base-ui/react/tooltip"
import type { ComponentProps, CSSProperties, ReactElement, ReactNode } from "react"
import { createContext, useContext, useMemo, useState } from "react"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { useAnchoredDensity } from "../../lib/density"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"

/**
 * Tooltip — themed wrapper over Base UI's Tooltip (hover/focus open, ARIA
 * description wiring, collision-aware positioning all come from Base UI).
 * Wrap an app (or a group) in <TooltipProvider> to share open/close delays so
 * adjacent tooltips open instantly once one is visible. Compose:
 *
 *   <TooltipProvider>
 *     <Tooltip>
 *       <TooltipTrigger render={<Button variant="ghost">?</Button>} />
 *       <TooltipContent>Saved to your workspace.</TooltipContent>
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
 *   <SimpleTooltip content="Saved to your workspace">
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
	const group = useContext(TooltipGroupContext)
	// Stable while the inputs are, so a toolbar re-rendering under an open
	// tooltip does not hand Base UI a "new" payload and restart the swap.
	const payload = useMemo<TooltipGroupPayload>(
		() => ({ content, side, align, sideOffset }),
		[content, side, align, sideOffset],
	)
	if (group) {
		// Inside a TooltipGroup this is only a trigger: the group owns the one
		// tooltip, and this trigger hands it what to say and where.
		return <Base.Trigger handle={group} payload={payload} disabled={root.disabled} render={children} />
	}
	return (
		<Base.Root {...root}>
			<Base.Trigger render={children} />
			<TooltipContent side={side} align={align} sideOffset={sideOffset}>
				{content}
			</TooltipContent>
		</Base.Root>
	)
}

/* --- TooltipGroup -----------------------------------------------------------
   One tooltip shared by a row of triggers — a toolbar, a segmented set of icon
   buttons — that travels to the next trigger instead of closing and reopening.

   Separate tooltips cannot do this: each is its own popup, so moving from one
   button to the next is a close here and an open there, two surfaces blinking
   a few pixels apart. Base UI's handle makes it ONE popup with several
   triggers, and its Viewport keeps the outgoing content on screen while the
   incoming content arrives. This file only adds the motion:

   - Positioner: top/right/bottom/left ease, so the surface glides to the new
     trigger. Gated on the viewport's `data-transitioning` (via :has), i.e. only
     while switching triggers. Ungated, the very first placement would also
     ease — in from wherever the positioner sat before it was measured.
     Width/height are deliberately NOT transitioned here: Base UI positions
     from the positioner's measured box, so an easing box would move its own
     target every frame. The size is frozen to the incoming content
     (--positioner-width/height) and the popup inside eases instead.
   - Popup: width/height ease between the two labels' sizes, on the same
     timeline as the glide. Its transition is inline because it has to list
     motion-pop's own properties too (one transition-property slot).
   - Viewport: the old label fades out and the new one fades in, each sliding a
     little in the direction of travel, so the eye reads one label replaced
     by the next rather than two labels overlapping.

   The glide, the resize and the slide are EXPRESSIVE (× --motion-expressive):
   under `subtle` the tooltip jumps to the next trigger and only the
   cross-fade remains. Opening and closing are the same motion-pop as a single
   Tooltip. Opening the FIRST tooltip in a group still waits for the hover
   delay; only moving between triggers is instant, which is the point.
   ------------------------------------------------------------------------- */

interface TooltipGroupPayload {
	content: ReactNode
	side?: PositionerProps["side"]
	align?: PositionerProps["align"]
	sideOffset?: PositionerProps["sideOffset"]
}

type TooltipGroupHandle = ReturnType<typeof Base.createHandle<TooltipGroupPayload>>

const TooltipGroupContext = createContext<TooltipGroupHandle | null>(null)

/** The expressive glide timing, shared by the positioner, popup and labels. */
const GLIDE_DURATION = "calc(var(--motion-duration-slow) * var(--motion-expressive, 1))"

const GROUP_POSITIONER = cn(
	"z-(--z-overlay) h-(--positioner-height) w-(--positioner-width)",
	"[&:has([data-transitioning])]:[transition-property:top,right,bottom,left]",
	"[&:has([data-transitioning])]:[transition-duration:calc(var(--motion-duration-slow)*var(--motion-expressive,1))]",
	"[&:has([data-transitioning])]:ease-emphasized",
)

/**
 * Inline so it can extend motion-pop's list with width/height without two
 * transition-property declarations racing on source order. Returns nothing
 * while Base UI holds the mount frame transition-free (`starting`), so its own
 * `transition: none` keeps the first frame still.
 */
function groupPopupStyle(state: Base.Popup.State): CSSProperties | undefined {
	if (state.transitionStatus === "starting") return undefined
	const closing = state.transitionStatus === "ending"
	return {
		transitionProperty: "opacity, scale, width, height",
		transitionDuration: closing
			? `var(--motion-duration-exit), var(--motion-duration-exit), ${GLIDE_DURATION}, ${GLIDE_DURATION}`
			: `var(--motion-duration-fast), var(--motion-duration-fast), ${GLIDE_DURATION}, ${GLIDE_DURATION}`,
		transitionTimingFunction: closing
			? "var(--motion-ease-standard), var(--motion-ease-standard), var(--motion-ease-emphasized), var(--motion-ease-emphasized)"
			: "var(--motion-ease-standard), var(--motion-ease-spring), var(--motion-ease-emphasized), var(--motion-ease-emphasized)",
	}
}

/*
 * The two label containers Base UI renders inside the viewport. The outgoing
 * one keeps the width it had (--popup-width on itself) so its text does not
 * rewrap while it fades. The slide is a small step (--spacing(2)), toward the
 * direction of travel.
 */
const GROUP_VIEWPORT = cn(
	"relative",
	"[&>*]:[transition-property:opacity,translate]",
	"[&>*]:[transition-duration:var(--motion-duration-fast),calc(var(--motion-duration-slow)*var(--motion-expressive,1))]",
	"[&>*]:[transition-timing-function:var(--motion-ease-standard),var(--motion-ease-emphasized)]",
	"[&>[data-previous]]:w-(--popup-width) [&>[data-previous]]:whitespace-nowrap",
	"[&>[data-current][data-starting-style]]:opacity-0 [&>[data-previous][data-ending-style]]:opacity-0",
	// Travelling right: the new label comes in from the right, the old leaves left.
	"[&[data-activation-direction~=right]>[data-current][data-starting-style]]:translate-x-2",
	"[&[data-activation-direction~=right]>[data-previous][data-ending-style]]:-translate-x-2",
	"[&[data-activation-direction~=left]>[data-current][data-starting-style]]:-translate-x-2",
	"[&[data-activation-direction~=left]>[data-previous][data-ending-style]]:translate-x-2",
	"[&[data-activation-direction~=down]>[data-current][data-starting-style]]:translate-y-2",
	"[&[data-activation-direction~=down]>[data-previous][data-ending-style]]:-translate-y-2",
	"[&[data-activation-direction~=up]>[data-current][data-starting-style]]:-translate-y-2",
	"[&[data-activation-direction~=up]>[data-previous][data-ending-style]]:translate-y-2",
)

export interface TooltipGroupProps {
	/** The triggers — `SimpleTooltip`s — that share the one tooltip. */
	children: ReactNode
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. Under `subtle` the tooltip jumps between triggers and only
	 * cross-fades its label.
	 */
	motion?: MotionLevel
}

/**
 * TooltipGroup — one tooltip shared by every `SimpleTooltip` inside it, which
 * glides from trigger to trigger as the pointer moves along a toolbar instead
 * of closing and reopening:
 *
 *   <TooltipGroup>
 *     <SimpleTooltip content="Bold"><Button … /></SimpleTooltip>
 *     <SimpleTooltip content="Italic"><Button … /></SimpleTooltip>
 *   </TooltipGroup>
 *
 * Renders no element of its own, so it drops into any layout. Each
 * SimpleTooltip keeps its own `content`, `side`, `align` and `sideOffset`;
 * `disabled` still turns one trigger off. Root-level props a SimpleTooltip
 * would otherwise take (`open`, `onOpenChange`) belong to the shared tooltip
 * and are ignored inside a group. The composable Tooltip parts are unaffected.
 */
export function TooltipGroup({ children, motion }: TooltipGroupProps) {
	const [handle] = useState(() => Base.createHandle<TooltipGroupPayload>())
	return (
		<TooltipGroupContext.Provider value={handle}>
			{children}
			<Base.Root handle={handle}>
				{({ payload }) => <TooltipGroupContent payload={payload} motion={motion} />}
			</Base.Root>
		</TooltipGroupContext.Provider>
	)
}
TooltipGroup.displayName = "TooltipGroup"

function TooltipGroupContent({
	payload,
	motion,
}: {
	payload: TooltipGroupPayload | undefined
	motion: MotionLevel | undefined
}) {
	const anchoredDensity = useAnchoredDensity()
	return (
		<TooltipPortal>
			<Base.Positioner
				side={payload?.side ?? "top"}
				align={payload?.align ?? "center"}
				sideOffset={payload?.sideOffset ?? 6}
				// The popup is portalled out of the group's subtree, so the level
				// rides on the outermost portalled element.
				data-motion={motionAttribute(motion)}
				className={GROUP_POSITIONER}
			>
				<Base.Popup
					{...anchoredDensity}
					style={groupPopupStyle}
					className={cn(
						"select-none rounded-sm border border-border-floating bg-popover px-2.5 py-1.5 text-label-md text-popover-foreground shadow-md outline-none",
						"h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] overflow-clip",
						// The enter/exit targets and transform origin; the transition
						// list itself is groupPopupStyle's.
						"motion-pop",
					)}
				>
					<Base.Viewport className={GROUP_VIEWPORT}>{payload?.content}</Base.Viewport>
				</Base.Popup>
			</Base.Positioner>
		</TooltipPortal>
	)
}
