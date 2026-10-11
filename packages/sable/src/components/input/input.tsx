import { Input as BaseInput } from "@base-ui/react/input"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL, FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { useDensity, useTypeTier } from "../../lib/density"

/**
 * The iOS 16px rule, and why these three fields carry a second type tier.
 *
 * Mobile Safari zooms the whole page when a text field is focused whose
 * COMPUTED font-size is under 16px, and it does not zoom back out. The page
 * register's body tier is `text-body-md` = 0.9375rem = **15px** at a 16px root,
 * so focusing any Sable Input/Textarea on an iPhone shifted the layout — with
 * nothing in the package handling it. (`--control-*` cannot help: the trigger
 * is font-size, not box height.)
 *
 * The fix stays inside the tier system, because rule #2 forbids hand-setting a
 * font-size next to a paired utility: below `sm` the field renders the next
 * paired tier UP — `text-body-lg`, 1.0625rem = 17px, which is also iOS's own
 * field size — and the designed tier takes over from `sm`. Written as
 * `max-sm:` rather than `sm:` on purpose: only the mobile arm is a variant, so
 * a consumer's own unprefixed `text-*` on `className` still wins at every width
 * it used to.
 *
 * Do NOT collapse this to one tier and do NOT swap it for a raw `text-base`.
 *
 * Compact (workspace) register is deliberately excluded: styles.css clamps
 * every page tier to `min(page, --type-ui-*)` inside `[data-density="compact"]`,
 * so the bump literally cannot land there — it would only trade the tier's 500
 * weight for 400 while staying 12px. A tool panel on an iPhone is a register
 * mismatch, not a type bug.
 *
 * Every text-entry field (and SelectTrigger / DatePicker, which stand in the
 * same row) wears it via lib/field-shell; this is where the reasoning is
 * written down.
 */

export interface InputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
	/**
	 * The control ladder, matching Select and Combobox: `md` is the form field;
	 * `xs` is the dense inset field of a tool panel (inspector rows, a hex
	 * input) — an inset canvas fill, no outline, tight padding. @default "md"
	 */
	size?: "md" | "xs"
}

/**
 * Input — a styled native `<input>`. Soft-square (rounded-sm, 8px), never a pill.
 * Sits on the card surface with a 1px input border; focus raises a 2px ring.
 * Set `aria-invalid` (Base UI form fields do this for you) to surface the
 * destructive error treatment on border + ring.
 *
 * Renders through Base UI's Input (= Field.Control), so inside a `<Field>` it
 * registers itself as the field's control: label, description, error and
 * validity wiring arrive from context even when the Input is not Field's direct
 * child. Outside a Field it is a plain `<input>` (plus an auto `id`).
 */
export function Input({ className, type, size = "md", ref, ...props }: InputProps) {
	// The control ladder retunes this box's HEIGHT for free; type is a paired
	// utility and has to be asked for. Without this an Input in a compact
	// Workspace was a 32px box carrying 15px text. See lib/density.tsx.
	const tier = useTypeTier()
	// See MOBILE_FIELD_TIER above — 15px type auto-zooms iOS Safari on focus.
	const density = useDensity()
	return (
		<BaseInput
			ref={ref}
			type={type ?? "text"}
			className={cn(
				"flex w-full text-foreground",
				FIELD_SHELL,
				FIELD_INVALID,
				size === "xs" ? cn("h-(--control-xs) px-1.5", FIELD_SHELL_XS) : "h-(--control-md) px-3",
				// type="file": style the native selector button (otherwise unstyled).
				"file:mr-3 file:cursor-pointer file:border-0 file:bg-transparent file:py-2 file:text-foreground",
				tier.body,
				density === "comfortable" && MOBILE_FIELD_TIER,
				className,
			)}
			{...(props as BaseInput.Props)}
		/>
	)
}
Input.displayName = "Input"
