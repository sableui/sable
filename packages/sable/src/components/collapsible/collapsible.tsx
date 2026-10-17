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
 * An auto-rotating chevron for a Collapsible trigger — the disclosure caret that
 * flips 180° when the panel opens (parity with AccordionTrigger's chevron). Drop
 * it inside the trigger's content and mark the trigger with the `group/collapsible`
 * class so the indicator can read its open state (Base UI puts `data-panel-open`
 * on the trigger, not the icon):
 *
 *   <CollapsibleTrigger className="group/collapsible" render={
 *     <Button variant="ghost">Details <CollapsibleIndicator /></Button>
 *   } />
 */
export function CollapsibleIndicator({ className }: { className?: string }) {
	// The rotate class and motion-interactive sit on the same element (the
	// glyph), and the recipe lists `rotate`, so the flip eases with the panel.
	return (
		<Icon
			name="chevron-down"
			className={cn(
				"text-xs text-muted-foreground motion-interactive group-data-[panel-open]/collapsible:rotate-180",
				className,
			)}
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
