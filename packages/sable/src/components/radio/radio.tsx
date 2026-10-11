import { Radio as RadioBase } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupBase } from "@base-ui/react/radio-group"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import { RADIO_DOT, RADIO_RING } from "../../lib/selection-card"

/**
 * Radio — themed wrapper over Base UI's RadioGroup + Radio (Root + Indicator).
 * Base UI supplies the hidden native inputs, roving focus, arrow-key navigation,
 * ARIA radiogroup/radio wiring, form integration, and the `data-[checked]` /
 * `data-disabled` / `data-readonly` state attributes. We own the visual surface.
 *
 *   <RadioGroup defaultValue="standard">
 *     <Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
 *     <Field label="Edition" orientation="horizontal"><Radio value="edition" /></Field>
 *   </RadioGroup>
 *
 * Controlled via value + onValueChange; uncontrolled via defaultValue. Give each
 * Radio a horizontal Field: it names the radio, makes the label part of the hit
 * target, centres the control on the label's first line, and dims a disabled
 * option. Put the group in a Fieldset so the options share a question.
 */

type RadioGroupProps = Omit<
	ComponentProps<typeof RadioGroupBase>,
	"className"
> & {
	className?: string
}

/** The group container — shares selection state across its Radio items. */
export function RadioGroup({ className, ...props }: RadioGroupProps) {
	return (
		<RadioGroupBase
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	)
}
RadioGroup.displayName = "RadioGroup"

type RadioProps = Omit<ComponentProps<typeof RadioBase.Root>, "className"> & {
	className?: string
}

/**
 * A single radio button (Base UI's Radio.Root + Radio.Indicator). The ring
 * border turns primary when checked; the inner dot is the Indicator. `value`
 * pairs it with the group's selected value.
 */
export function Radio({ className, ...props }: RadioProps) {
	return (
		<RadioBase.Root
			// Native activation avoids the non-native composite Space handler
			// passing a prevented key event into Radio's click handler.
			render={<button type="button" />}
			nativeButton
			className={cn(
				RADIO_RING,
				"data-[checked]:border-primary",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{/* Ring and dot are shared with RadioCard (lib/selection-card). */}
			<RadioBase.Indicator className={cn(RADIO_DOT, "bg-primary")} />
		</RadioBase.Root>
	)
}
Radio.displayName = "Radio"
