import { Collapsible as Base } from "@base-ui/react/collapsible"
import type { ComponentProps } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"

/**
 * Collapsible — themed wrapper over Base UI's Collapsible (open/close state,
 * ARIA expanded wiring, and the height transition variables all come from Base
 * UI). This is the minimal primitive behind Accordion; keep it close to
 * unstyled. Compose:
 *
 *   <Collapsible>
 *     <CollapsibleTrigger render={<Button variant="ghost">Details</Button>} />
 *     <CollapsiblePanel>…</CollapsiblePanel>
 *   </Collapsible>
 *
 * State surfaces via Base UI data-attributes: the trigger gets data-[panel-open]
 * when open; the panel gets data-[open]/data-[closed] plus
 * data-[starting-style]/data-[ending-style] during the open/close transition.
 * The panel animates height using the --collapsible-panel-height CSS var Base
 * UI sets on the element.
 */
export const Collapsible = Base.Root
export const CollapsibleTrigger = Base.Trigger

/**
 * Where the closed caret points, and so how it turns. `down` flips 180° on open
 * (parity with AccordionTrigger's chevron). `end` points to the inline end while
 * closed (right in LTR, left in RTL) and turns down a quarter on open — the
 * caret a grouped list or a tree row uses.
 */
const DIRECTION = {
	down: "[[data-panel-open]_&]:rotate-180",
	end: "-rotate-90 rtl:rotate-90 [[data-panel-open]_&]:rotate-0",
} as const

export interface CollapsibleIndicatorProps {
	/** Where the caret points while closed. @default "down" */
	direction?: keyof typeof DIRECTION
	className?: string
}

/**
 * An auto-rotating chevron for a Collapsible trigger. Drop it anywhere inside
 * the trigger's content; nothing else to set up. Base UI puts `data-panel-open`
 * on the trigger, not the icon, so the glyph reads it from the trigger above
 * it. (It used to need a `group/collapsible` class on the trigger, and an app
 * that missed that rotated its own chevron with no transition instead.)
 *
 *   <CollapsibleTrigger render={
 *     <Button variant="ghost">Details <CollapsibleIndicator /></Button>
 *   } />
 */
export function CollapsibleIndicator({ direction = "down", className }: CollapsibleIndicatorProps) {
	// The rotate class and motion-interactive sit on the same element (the
	// glyph), and the recipe lists `rotate`, so the turn eases with the panel.
	return (
		<Icon
			name="chevron-down"
			className={cn("text-xs text-muted-foreground motion-interactive", DIRECTION[direction], className)}
		/>
	)
}

type PanelProps = Omit<ComponentProps<typeof Base.Panel>, "className"> & {
	className?: string
}

/**
 * The collapsible contents. Stays overflow-hidden so the height transition
 * clips cleanly; Base UI drives the height from --collapsible-panel-height.
 */
export function CollapsiblePanel({ className, ...props }: PanelProps) {
	return (
		<Base.Panel
			className={cn(
				"h-[var(--collapsible-panel-height)] text-body-md text-foreground",
				"motion-disclosure data-[ending-style]:h-0 data-[starting-style]:h-0",
				className,
			)}
			{...props}
		/>
	)
}
