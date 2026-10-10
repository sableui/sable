import { Field as BaseField } from "@base-ui/react/field"
import type { ComponentPropsWithRef, Ref } from "react"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL } from "../../lib/field-shell"
import { useDensity, useTypeTier } from "../../lib/density"

export interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
	/**
	 * Grow to fit content as the user types, via CSS `field-sizing: content`
	 * (no JS, no ResizeObserver). `min-h` still sets the floor; pass `rows` or a
	 * `max-h-*` className to bound it. Browsers without field-sizing support fall
	 * back to the fixed min-height. @default false
	 */
	autoResize?: boolean
}

/**
 * Textarea — a styled native multi-line text control. Soft-square (rounded-sm,
 * like all inputs, never a pill). Sits on the card surface with a 1px input
 * border; the focus ring uses the --ring token. Set `aria-invalid` to surface
 * the destructive error treatment on border + ring (same as Input). Pass `autoResize` to grow with content.
 *
 * Renders a `<textarea>` through Base UI's Field.Control, so inside a `<Field>`
 * it registers as the field's control (label, description, error, validity).
 */
export function Textarea({
	autoResize,
	className,
	ref,
	...props
}: TextareaProps) {
	const tier = useTypeTier()
	// iOS Safari zooms the page when a focused field computes under 16px, and
	// the page body tier is 15px (0.9375rem at a 16px root). Below `sm` we
	// render the next paired tier up (`text-body-lg`, 17px) and hand the
	// designed tier back at `sm` and up, so desktop is unchanged. Never
	// hand-set font-size here — paired tiers are not decomposed. Full rationale
	// (including why compact is excluded): components/input/input.tsx.
	const density = useDensity()
	return (
		<BaseField.Control
			// Field.Control is typed for <input>; it renders the <textarea> below.
			ref={ref as unknown as Ref<HTMLInputElement>}
			render={<textarea />}
			className={cn(
				"flex min-h-20 w-full p-3 text-foreground",
				// The shell Input wears too — lib/field-shell. Hand-copied, this had
				// already lost the invalid ring Input shows on focus.
				FIELD_SHELL,
				FIELD_INVALID,
				autoResize && "field-sizing-content resize-none",
				tier.body,
				density === "comfortable" && "max-sm:text-body-lg",
				className,
			)}
			{...(props as unknown as BaseField.Control.Props)}
		/>
	)
}
Textarea.displayName = "Textarea"
