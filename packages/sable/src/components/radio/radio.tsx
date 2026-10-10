import { Radio as RadioBase } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupBase } from "@base-ui/react/radio-group"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"

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
				"relative inline-flex size-[18px] shrink-0 rounded-full border border-input bg-card motion-interactive",
				"data-[checked]:border-primary",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{/* The dot is half the ring's inner box (8px in the 18px ring), so the two
			    scale together. Absolutely centered so the dot's position never depends on Base UI's
			    indicator display/line-box; translate + scale are independent CSS
			    properties in Tailwind v4, so the enter/exit animation composes. */}
			<RadioBase.Indicator className="absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary data-[starting-style]:scale-0 data-[ending-style]:scale-0 motion-interactive ease-spring" />
		</RadioBase.Root>
	)
}
Radio.displayName = "Radio"
