import { Accordion as Base } from "@base-ui/react/accordion"
import type { ComponentProps, ReactNode } from "react"
import { Icon } from "../../icon/Icon"
import { cn } from "../../lib/cn"

/**
 * Accordion — themed wrapper over Base UI's Accordion (roving focus, ARIA
 * region/heading/button wiring, arrow-key navigation, and the open/close height
 * animation all come from Base UI). Compose:
 *
 *   <Accordion defaultValue={["faq-1"]}>
 *     <AccordionItem value="faq-1">
 *       <AccordionTrigger>Is it permanent?</AccordionTrigger>
 *       <AccordionPanel>Yes — stored on Arweave.</AccordionPanel>
 *     </AccordionItem>
 *     <AccordionItem value="faq-2">
 *       <AccordionTrigger>How much does it cost?</AccordionTrigger>
 *       <AccordionPanel>A one-time mint fee.</AccordionPanel>
 *     </AccordionItem>
 *   </Accordion>
 *
 * State surfaces via Base UI data-attributes: the trigger carries
 * data-[panel-open] (drives the chevron rotation), and the panel carries
 * data-[starting-style]/data-[ending-style] during its height transition, with
 * the target height exposed as the `--accordion-panel-height` CSS var.
 */
export const Accordion = Base.Root

type ItemProps = Omit<ComponentProps<typeof Base.Item>, "className"> & {
	className?: string
}

/** Groups one header + its panel. Stacks with a hairline rule below. */
export function AccordionItem({ className, ...props }: ItemProps) {
	return (
		<Base.Item
			className={cn("border-b border-border", className)}
			{...props}
		/>
	)
}

type TriggerProps = Omit<ComponentProps<typeof Base.Trigger>, "className"> & {
	className?: string
	/**
	 * Custom trailing indicator, replacing the default chevron (icon and its
	 * rotate-180-on-open behavior) entirely. Compose your own `<Icon>` (or any
	 * node) and drive its own open-state behavior off the trigger button's
	 * `data-panel-open` attribute via Tailwind's ancestor-attribute selector —
	 * e.g. a plus-becomes-an-× FAQ toggle:
	 *
	 *   indicator={
	 *     <Icon name="plus" className="text-xs text-muted-foreground transition-transform [[data-panel-open]_&]:rotate-45" />
	 *   }
	 *
	 * When omitted, the default chevron (rotating 180° on open) is used.
	 */
	indicator?: ReactNode
}

/**
 * The full-width header button (Base UI's Header + Trigger composed). A
 * trailing chevron rotates 180° when its panel opens via data-[panel-open] —
 * override with `indicator` for a different glyph/behavior (e.g. a plus that
 * becomes an ×).
 */
export function AccordionTrigger({
	className,
	children,
	indicator,
	...props
}: TriggerProps) {
	return (
		<Base.Header>
			<Base.Trigger
				className={cn(
					"flex w-full items-start justify-between gap-3 py-4 text-start text-title-sm text-foreground motion-interactive hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
					!indicator && "[&[data-panel-open]_[data-slot=accordion-chevron]]:rotate-180",
					className,
				)}
				{...props}
			>
				{children}
				{/* `h-[1lh]` centres the indicator on the FIRST line of the label, so a
				    wrapping question keeps its chevron beside the line it starts on. */}
				<span
					data-slot="accordion-chevron"
					className="flex h-[1lh] shrink-0 items-center motion-interactive"
				>
					{indicator ?? (
						<Icon name="chevron-down" className="text-xs text-muted-foreground" />
					)}
				</span>
			</Base.Trigger>
		</Base.Header>
	)
}

type PanelProps = Omit<ComponentProps<typeof Base.Panel>, "className"> & {
	className?: string
}

/**
 * The collapsible body. Base UI animates `height` from/to 0 using the
 * `--accordion-panel-height` CSS var; we transition height and fade the
 * contents on data-[starting-style]/data-[ending-style].
 */
export function AccordionPanel({ className, children, ...props }: PanelProps) {
	return (
		<Base.Panel
			className={cn(
				"h-[var(--accordion-panel-height)] text-body-md text-muted-foreground motion-disclosure data-[ending-style]:h-0 data-[starting-style]:h-0",
				className,
			)}
			{...props}
		>
			<div className="pb-4">{children}</div>
		</Base.Panel>
	)
}
