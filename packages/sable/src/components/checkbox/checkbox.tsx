import { Checkbox as Base } from "@base-ui/react/checkbox"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"
import { CHECK_BOX } from "../../lib/selection-card"
import { CheckboxMark } from "./checkbox-mark"

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
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
export function Checkbox({ className, children, ...props }: RootProps) {
	return (
		<Base.Root
			className={cn(
				CHECK_BOX,
				"text-primary-foreground",
				"data-[checked]:border-primary data-[checked]:bg-primary",
				"data-[indeterminate]:border-primary data-[indeterminate]:bg-primary",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{children ?? <CheckboxMark />}
		</Base.Root>
	)
}
Checkbox.displayName = "Checkbox"
