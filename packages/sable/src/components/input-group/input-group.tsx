import {
	type AriaAttributes,
	Children,
	type ComponentPropsWithRef,
	cloneElement,
	type ReactElement,
	type ReactNode,
} from "react"
import { cn } from "../../lib/cn"
import { useDensity, useTypeTier } from "../../lib/density"
import { MOBILE_FIELD_TIER } from "../../lib/field-shell"

/** The control wiring a Field hands its child, forwarded to the input. */
type ControlProps = {
	id?: string
	required?: boolean
	disabled?: boolean
	"aria-describedby"?: AriaAttributes["aria-describedby"]
	"aria-invalid"?: AriaAttributes["aria-invalid"]
}

export interface InputGroupProps extends Omit<ComponentPropsWithRef<"div">, keyof ControlProps | "children">, ControlProps {
	/** Inside the field, before the text: a prefix ("https://", "$"), an icon, or a borderless Button. */
	leading?: ReactNode
	/** Inside the field, after the text: a suffix (".com", "kg"), an icon, or a borderless Button (copy, reveal, clear). */
	trailing?: ReactNode
	/** The single `<Input />` the addons sit around. */
	children: ReactElement
}

/**
 * InputGroup — an Input with addons inside the same field: a prefix or suffix
 * ("https://", ".com", "$"), an icon, or a borderless Button such as copy or
 * reveal. One shell, one focus ring, one error state, so the addons read as
 * part of the field rather than things placed beside it (that is Field's
 * `trailing`: an Apply button next to a promo code).
 *
 *   <Field label="Website">
 *     <InputGroup leading="https://" trailing=".com"><Input placeholder="example" /></InputGroup>
 *   </Field>
 *
 * The group wears the field shell and the Input inside gives up its own border,
 * fill and ring. A Field's wiring (id, aria-describedby, aria-invalid,
 * required, disabled) is forwarded to the Input, so the label still points at
 * the text box and the error still reaches it. A Button addon sits a hairline
 * step in from the edge on every side (the addon shrinks its padding when it
 * holds one), so the button reads as inside the field and its glyph lands near
 * the text's inset.
 */
export function InputGroup({
	leading,
	trailing,
	children,
	className,
	id,
	required,
	disabled,
	"aria-describedby": describedBy,
	"aria-invalid": invalid,
	...props
}: InputGroupProps) {
	const tier = useTypeTier()
	const density = useDensity()
	const input = Children.only(children) as ReactElement<Record<string, unknown>>
	const control = cloneElement(input, {
		...(id != null ? { id } : null),
		...(required != null ? { required } : null),
		...(disabled ? { disabled: true } : null),
		...(describedBy ? { "aria-describedby": describedBy } : null),
		...(invalid ? { "aria-invalid": invalid } : null),
	})
	// Addon text sets in the Input's own tiers, the iOS step included, so a
	// prefix and the typed text stay one size on a phone.
	const addon = cn(
		"flex shrink-0 items-center gap-1.5 text-muted-foreground whitespace-nowrap",
		tier.body,
		density === "comfortable" && MOBILE_FIELD_TIER,
	)
	return (
		<div
			data-slot="input-group"
			className={cn(
				"flex h-(--control-md) w-full items-center",
				// The field shell, moved from the input to the group: focus is the
				// ring on the whole field, and so are the error and disabled states.
				"rounded-sm border border-input bg-card motion-interactive focus-within:ring-2 focus-within:ring-ring",
				"has-[>input[aria-invalid=true]]:border-destructive has-[>input[aria-invalid=true]]:ring-destructive/30",
				"has-[>input:disabled]:cursor-not-allowed has-[>input:disabled]:opacity-50",
				// The Input keeps its type, padding and behaviour; the box is the group's.
				"[&>input]:h-full [&>input]:min-w-0 [&>input]:flex-1 [&>input]:rounded-none [&>input]:border-0 [&>input]:bg-transparent [&>input]:focus-visible:ring-0 [&>input]:disabled:opacity-100",
				leading != null && "[&>input]:ps-1.5",
				trailing != null && "[&>input]:pe-1.5",
				className,
			)}
			{...props}
		>
			{leading != null ? (
				<span data-slot="input-group-leading" className={cn(addon, "ps-3 has-[>[data-variant]]:ps-1")}>
					{leading}
				</span>
			) : null}
			{control}
			{trailing != null ? (
				<span data-slot="input-group-trailing" className={cn(addon, "pe-3 has-[>[data-variant]]:pe-1")}>
					{trailing}
				</span>
			) : null}
		</div>
	)
}
InputGroup.displayName = "InputGroup"
