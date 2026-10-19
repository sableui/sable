import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { isPaletteColor } from "../../lib/palette"
import { trimLabel } from "../../lib/trim-label"
import { pillVariants } from "./pill.variants"

export interface PillProps
	extends ComponentPropsWithRef<"button">,
		Omit<VariantProps<typeof pillVariants>, "selected"> {
	/** Marks the pill as chosen (each appearance has its own selected look). Sets aria-pressed. */
	selected?: boolean
	/** A leading icon. */
	icon?: ReactNode
}

/**
 * Pill — a chip someone clicks: a filter, a tag choice, a toggle in a row of
 * options. Always a `<button>` with `aria-pressed`. A static label is a Badge;
 * Pill used to be both, which is how a row of identical-looking chips ended up
 * half clickable and half not.
 *
 * `appearance="outline"` is the quiet chip for choices that annotate other
 * content (a reaction, a tag on a card); `size="sm"` is the small chip under
 * content, `size="lg"` the toolbar chip that shares `--control-sm` with a
 * SearchInput `size="sm"` and Button `size="sm"` beside it. Use these rather
 * than restyling a Pill with classes — an override is
 * a look that exists nowhere else in the system. `tone="blue"` (any palette
 * family) colours the chip as a category, like a tag picker's choices.
 */
export function Pill({ selected = false, appearance, size, tone, icon, className, children, type, ...props }: PillProps) {
	return (
		<button
			type={type ?? "button"}
			aria-pressed={selected}
			data-palette={isPaletteColor(tone) ? tone : undefined}
			className={cn(pillVariants({ appearance, size, selected, tone }), className)}
			{...props}
		>
			{icon}
			{trimLabel(children)}
		</button>
	)
}
Pill.displayName = "Pill"
