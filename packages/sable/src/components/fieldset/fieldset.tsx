import { Fieldset as Base } from "@base-ui/react/fieldset"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

/**
 * Fieldset — a themed form section panel over Base UI's Fieldset. Base.Root
 * renders a real <fieldset> and Base.Legend renders an auto-associated label,
 * so the group exposes correct grouping semantics to assistive tech for free.
 * Sable layers a Card-like bordered surface and the section parts on top.
 *
 *   <Fieldset>
 *     <FieldsetLegend>Notify me about</FieldsetLegend>
 *     <FieldsetDescription>Pick what reaches your inbox.</FieldsetDescription>
 *     <FieldsetContent>
 *       <Field label="Mentions" orientation="horizontal"><Checkbox /></Field>
 *       <Field label="Replies" orientation="horizontal"><Checkbox /></Field>
 *     </FieldsetContent>
 *     <FieldsetFooter>
 *       <Button>Save</Button>
 *     </FieldsetFooter>
 *   </Fieldset>
 *
 * The legend names ONE question the controls answer together; it is not a
 * section heading. A panel of unrelated fields is a Card or a PanelSection.
 *
 * Disabling the whole group propagates through Base UI as data-[disabled] on
 * the root (native <fieldset disabled> also disables its controls).
 */

type RootProps = Omit<ComponentPropsWithRef<typeof Base.Root>, "className"> & {
	className?: string
}

/** The bordered container. Wraps Base.Root (a native <fieldset>) as a raised card surface. */
export function Fieldset({ className, ...props }: RootProps) {
	return (
		<Base.Root
			className={cn(
				// min-w-0: a native <fieldset> defaults to min-inline-size: min-content
				// and would refuse to shrink below its widest control. overflow-hidden
				// keeps the footer's wash inside the rounded corners.
				"min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm",
				"data-[disabled]:opacity-60",
				className,
			)}
			{...props}
		/>
	)
}
Fieldset.displayName = "Fieldset"

type LegendProps = Omit<
	ComponentPropsWithRef<typeof Base.Legend>,
	"className"
> & {
	className?: string
}

/**
 * The group's name — the question its controls answer. Base.Legend renders a
 * <div> that Base UI wires to the fieldset via aria-labelledby.
 */
export function FieldsetLegend({ className, ...props }: LegendProps) {
	return (
		<Base.Legend
			className={cn("px-6 pt-6 text-title-lg text-foreground", className)}
			{...props}
		/>
	)
}
FieldsetLegend.displayName = "FieldsetLegend"

/** Supporting copy under the legend. Muted body text, full-width gutter padding. */
export function FieldsetDescription({
	className,
	...props
}: ComponentPropsWithRef<"p">) {
	return (
		<p
			data-slot="fieldset-description"
			className={cn("px-6 text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}
FieldsetDescription.displayName = "FieldsetDescription"

/**
 * The stacked body where fields live. Vertical rhythm via space-y-4. As the
 * last part (no footer) it takes the same bottom inset as the legend's top.
 */
export function FieldsetContent({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	return (
		<div className={cn("space-y-4 px-6 py-4 last:pb-6", className)} {...props} />
	)
}
FieldsetContent.displayName = "FieldsetContent"

/** The action bar. Right-aligned, divided from the body, on a subtle muted wash. */
export function FieldsetFooter({
	className,
	...props
}: ComponentPropsWithRef<"div">) {
	return (
		<div
			className={cn(
				"flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4",
				"[[data-slot=fieldset-description]+&]:mt-6",
				className,
			)}
			{...props}
		/>
	)
}
FieldsetFooter.displayName = "FieldsetFooter"
