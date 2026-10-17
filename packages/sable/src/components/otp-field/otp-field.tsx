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
type OtpBase = OtpNamespace<typeof OtpParts>
// Resolved on first render, not at module load: a top-level
// `Object.entries(namespace)` is a call no bundler can prove pure, so it kept
// the whole OTP Field in every app that imported anything from the barrel.
let resolvedBase: OtpBase | undefined
function otpBase(): OtpBase {
	if (!resolvedBase) {
		const otpExports = Object.fromEntries(Object.entries(OtpParts))
		resolvedBase = (otpExports.OTPField ?? otpExports.OTPFieldPreview) as OtpBase
	}
	return resolvedBase
}
import { type ComponentProps, Fragment, useEffect, useRef } from "react"
import { cn } from "../../lib/cn"
import { FIELD_INVALID, FIELD_SHELL } from "../../lib/field-shell"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { useShake } from "../../motion/useShake"

type BaseRootProps = ComponentProps<OtpBase["Root"]>

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
	/**
	 * Marks every slot invalid: destructive border and digits, and — when it
	 * turns on after mount — one short shake of the whole field. `<Field error>`
	 * sets this for you.
	 */
	"aria-invalid"?: boolean | "true" | "false"
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. The shake on a refused code is the flourish; the destructive
	 * colour stays at every level.
	 * @default "full"
	 */
	motion?: MotionLevel
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
 *
 * A refused code shakes the field once (motion-shake) as it turns invalid, and
 * the digits take the destructive colour. The slots are NOT cleared: the wrong
 * digits are the evidence of which one was mistyped, and the error message
 * under the field says what to do next.
 */
export function OtpField({
	className,
	length = 6,
	groupSize,
	getSlotLabel = defaultSlotLabel,
	"aria-invalid": ariaInvalid,
	motion,
	onAnimationEnd,
	...root
}: OtpFieldProps) {
	const invalid = ariaInvalid === true || ariaInvalid === "true"
	const Base = otpBase()
	// Shake on the TRANSITION to invalid, never on mount: a field restored with
	// an error (a reload, a server-rendered form) has nothing new to say. An app
	// that clears the error as the user edits — the usual pattern — gets a fresh
	// shake for every new wrong code, because each one is a new transition.
	const { shake, shakeProps } = useShake()
	const wasInvalid = useRef(invalid)
	useEffect(() => {
		if (invalid && !wasInvalid.current) shake()
		wasInvalid.current = invalid
	}, [invalid, shake])
	return (
		<Base.Root
			length={length}
			data-invalid={invalid ? "" : undefined}
			data-motion={motionAttribute(motion)}
			// max-w-full + shrinkable slots (min-w-0): in a column narrower than the
			// code, slots narrow instead of pushing the field off the edge.
			className={cn("inline-flex max-w-full items-center gap-2 motion-shake", className)}
			{...root}
			data-shake={shakeProps["data-shake"]}
			onAnimationEnd={(event) => {
				shakeProps.onAnimationEnd(event)
				onAnimationEnd?.(event)
			}}
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
							// The digits turn too, not just the box: on a six-slot code the
							// border alone is a thin line, and the characters are what the
							// user is reading to find the mistake.
							"aria-[invalid=true]:text-destructive",
						)}
					/>
				</Fragment>
			))}
		</Base.Root>
	)
}
OtpField.displayName = "OtpField"
