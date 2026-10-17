import { Checkbox as Base } from "@base-ui/react/checkbox"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { CHECK_BOX } from "../../lib/selection-card"
import { CheckboxMark } from "./checkbox-mark"

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. Under `subtle` the tick fades in instead of drawing itself.
	 */
	motion?: MotionLevel
}

/**
 * Checkbox — themed wrapper over Base UI's Checkbox (Root + Indicator).
 * Base UI supplies the hidden native input, ARIA, keyboard toggle, form
 * integration, and `data-[checked]` / `data-[indeterminate]` / `data-disabled`
 * state attributes. We own the visual surface.
 *
 *   <Checkbox defaultChecked />
 *   <Checkbox checked={value} onCheckedChange={setValue} />
 *
 * Label it with Field: `<Field label="Remember me" orientation="horizontal"><Checkbox /></Field>`.
 *
 * The box and its mark are shared with CheckboxCard (`CHECK_BOX` +
 * `CheckboxMark`), so the standalone control and the card's box cannot drift.
 */
export function Checkbox({ className, children, motion, ...props }: RootProps) {
	return (
		<Base.Root
			data-motion={motionAttribute(motion)}
			className={cn(
				CHECK_BOX,
				"text-primary-foreground",
				"data-[checked]:border-primary data-[checked]:bg-primary",
				"data-[indeterminate]:border-primary data-[indeterminate]:bg-primary",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				// Base UI renders the root as a <span>, which `:disabled` never matches —
				// the state is the data attribute, as on Switch.
				"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			{children ?? <CheckboxMark />}
		</Base.Root>
	)
}
Checkbox.displayName = "Checkbox"
