import * as OtpParts from "@base-ui/react/otp-field"

/*
 * Base UI shipped OTP Field as `OTPFieldPreview` and renamed it to `OTPField`
 * when it went stable in 1.6.0. The dependency range is ^1.5, so a consumer can
 * resolve either — and a named import of the one that is missing is a hard
 * ESM link error that blanks the whole package, not just this component (the
 * packed-consumer check caught exactly that). Read whichever the installed
 * version exports; the parts API is the same in both.
 */
// Enumerating the namespace keeps bundlers from statically linking an export
// absent in the other supported version. Direct namespace property access still
// produces a missing-export warning in Rollup on newer Base UI installations.
type OtpNamespace<T> = T extends { OTPField: infer Parts } ? Parts
	: T extends { OTPFieldPreview: infer Parts } ? Parts : never
const otpExports = Object.fromEntries(Object.entries(OtpParts))
const Base: OtpNamespace<typeof OtpParts> = (otpExports.OTPField ?? otpExports.OTPFieldPreview) as OtpNamespace<typeof OtpParts>
import { type ComponentProps, Fragment } from "react"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL } from "../../lib/field-shell"

type BaseRootProps = ComponentProps<typeof Base.Root>

export type OtpFieldProps = Omit<
	BaseRootProps,
	"className" | "render" | "length" | "children"
> & {
	className?: string
	/**
	 * Number of character slots. Match the length the server actually sends —
	 * a field that accepts more slots than the code has can never complete.
	 * @default 6
	 */
	length?: number
	/**
	 * Insert a visual gap every `groupSize` slots (3 → `123 456`). Purely
	 * visual: the value stays one contiguous string, and the gap is hidden from
	 * assistive tech.
	 */
	groupSize?: number
	/**
	 * Accessible name for slots after the first. The first slot is named by the
	 * field's own label (a `<Field label>` or `<label htmlFor>`), which is the
	 * name a screen-reader user hears on entry; the rest need a position.
	 * @default (index, length) => `Character ${index + 1} of ${length}`
	 */
	getSlotLabel?: (index: number, length: number) => string
	/** Marks every slot invalid. `<Field error>` sets this for you. */
	"aria-invalid"?: boolean | "true" | "false"
}

const defaultSlotLabel = (index: number, length: number) =>
	`Character ${index + 1} of ${length}`

/**
 * OtpField — a one-time-code entry over Base UI's OTP Field.
 *
 * Base UI owns the hard parts, and they are the parts hand-rolled OTP inputs
 * get wrong: the first slot carries `autocomplete="one-time-code"` and accepts
 * the whole code (so SMS autofill and password managers can target it), paste
 * anywhere fills every slot from that point, Backspace walks back, arrow keys
 * move, and only one slot is in the tab order. Paste is never blocked.
 *
 *   <OtpField length={6} onValueComplete={verify} />
 *   <Field label="Verification code"><OtpField length={6} groupSize={3} /></Field>
 *
 * Slots are `text-mono-lg` (20px) so iOS Safari never zooms on focus, and sit
 * on the control ladder — `--control-md` wide, `--control-lg` tall — so a
 * compact Workspace retunes them with everything else.
 */
export function OtpField({
	className,
	length = 6,
	groupSize,
	getSlotLabel = defaultSlotLabel,
	"aria-invalid": ariaInvalid,
	...root
}: OtpFieldProps) {
	const invalid = ariaInvalid === true || ariaInvalid === "true"
	return (
		<Base.Root
			length={length}
			data-invalid={invalid ? "" : undefined}
			// max-w-full + shrinkable slots (min-w-0): in a column narrower than the
			// code, slots narrow instead of pushing the field off the edge.
			className={cn("inline-flex max-w-full items-center gap-2", className)}
			{...root}
		>
			{Array.from({ length }, (_, index) => (
				// Slots are positional and never reorder, so the index is the identity.
				// biome-ignore lint/suspicious/noArrayIndexKey: positional slots
				<Fragment key={index}>
					{groupSize && index > 0 && index % groupSize === 0 ? (
						<span
							aria-hidden="true"
							data-otp-gap=""
							className="h-px w-2 shrink-0 bg-border-strong"
						/>
					) : null}
					<Base.Input
						aria-label={index === 0 ? undefined : getSlotLabel(index, length)}
						aria-invalid={invalid || undefined}
						className={cn(
							"h-(--control-lg) w-(--control-md) min-w-0 text-center text-mono-lg text-foreground caret-primary",
							// The shell Input wears — lib/field-shell — so a slot reads as
							// the same field; only the slot-specific states are added here.
							FIELD_SHELL,
							// Focus is FIELD_SHELL's ring alone, like every other field — a ring-
							// coloured border under it made a 3px edge only here.
							"data-[filled]:border-border-strong",
							FIELD_INVALID,
						)}
					/>
				</Fragment>
			))}
		</Base.Root>
	)
}
OtpField.displayName = "OtpField"
