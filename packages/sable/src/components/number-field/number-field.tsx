import { NumberField as Base } from "@base-ui/react/number-field"
import type { ComponentProps } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { FIELD_SHELL } from "../../lib/field-shell"
import { Button } from "../button/button"

export type NumberFieldProps = Omit<
	ComponentProps<typeof Base.Root>,
	"className" | "render"
> & {
	className?: string
	/**
	 * Show the decrement/increment buttons. @default true
	 *
	 * Turn them off in a dense property grid: each stepper is an icon-sm Button
	 * (32px at comfortable density), so with both showing the control can't go
	 * below ~110px — far too wide for a
	 * workspace-register field, where the whole numeric cell is ~44px. Without
	 * this the only option was to hand-roll a replacement field, which is exactly
	 * what happened before it existed.
	 */
	steppers?: boolean
}

/**
 * NumberField — a numeric input with decrement / increment steppers over Base UI's
 * NumberField (keyboard arrows, scroll, scrub, min/max clamping, locale `format`,
 * and form integration all come from Base UI). Styled to match the Input. Drops
 * straight into a `Field` (the label's `htmlFor` ↔ the input `id`; the field's
 * `aria-describedby`/`aria-invalid` reach the input).
 *
 *   <NumberField defaultValue={1} min={0} max={99} />
 *   <Field label="Quantity"><NumberField min={1} /></Field>
 */
export function NumberField({
	className,
	steppers = true,
	"aria-describedby": ariaDescribedby,
	"aria-invalid": ariaInvalid,
	"aria-label": ariaLabel,
	...root
}: NumberFieldProps) {
	// The steppers ARE Sable's icon Button — Base UI's `render` prop composes
	// its press/hold-to-repeat behaviour onto it — so hit size, focus ring, press
	// and hover wash follow every other icon button instead of a hand-styled
	// copy. Inset a hair from the shell's border so the pill hover sits inside.
	const step = (
		<Button
			variant="ghost"
			size="icon-sm"
			className="mx-0.5 self-center text-muted-foreground"
		/>
	)
	const tier = useTypeTier()
	return (
		<Base.Root {...root}>
			<Base.Group
				className={cn(
					"inline-flex h-(--control-md) w-full items-stretch overflow-hidden text-foreground",
					// The shell Input wears — lib/field-shell. Its focus ring keys on
					// focus-visible; the shell here is a group, so ring on focus-within.
					FIELD_SHELL,
					"focus-within:ring-2 focus-within:ring-ring",
					"has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50",
					// FIELD_INVALID, lifted to the group: `aria-invalid` lands on the
					// inner <input> (a Field sets it there), and a group role cannot
					// carry it, so the shell reads it with `has-`. Literal for the
					// Tailwind scan; keep in step with lib/field-shell.
					"has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/30",
					tier.body,
					className,
				)}
			>
				{steppers ? (
					<Base.Decrement aria-label="Decrease" render={step}>
						<Icon name="minus" />
					</Base.Decrement>
				) : null}
				<Base.Input
					aria-describedby={ariaDescribedby}
					aria-invalid={ariaInvalid}
					aria-label={ariaLabel}
					className={cn(
						"w-full min-w-0 bg-transparent tabular-nums outline-none",
						// Centred between two steppers; left-aligned without them, so a
						// column of stepper-less fields reads as a column of values.
						steppers ? "px-2 text-center" : "px-2 text-left",
					)}
				/>
				{steppers ? (
					<Base.Increment aria-label="Increase" render={step}>
						<Icon name="plus" />
					</Base.Increment>
				) : null}
			</Base.Group>
		</Base.Root>
	)
}
NumberField.displayName = "NumberField"
