import type { ComponentMeta } from "../../lib/meta"

export const otpFieldMeta: ComponentMeta = {
	name: "OtpField",
	summary:
		"One-time-code entry over Base UI's OTP Field — one slot per character, SMS autofill on the first slot, paste fills every slot, and only one tab stop for the whole code.",
	status: "stable",
	keywords: [
		"otp",
		"one-time code",
		"one-time password",
		"verification code",
		"2fa",
		"two-factor",
		"mfa",
		"pin",
		"passcode",
		"input otp",
	],
	usage: {
		description:
			"Use OtpField for a short, fixed-length code the user copies from somewhere else — an SMS or email verification code, an authenticator app, a device pairing PIN. The slots show how long the code is and where the user is in it, which a plain Input cannot.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Set `length` to the exact length the server sends, and verify in `onValueComplete` (or with `autoSubmit` inside a form). Most users paste or autofill the whole code at once, so the moment of completion is the natural submit.",
			},
			{
				guidance: "do",
				description:
					"Label it through a `Field` (\"Verification code\") and say where the code was sent in the description. The first slot takes the field's name; the rest are announced by position.",
			},
			{
				guidance: "do",
				description:
					"Use `groupSize` for codes of 6 or more so the user can check the code in chunks against the message they are reading from.",
			},
			{
				guidance: "dont",
				description:
					"Do not use OtpField for a password, an arbitrary-length PIN, or anything the user types from memory. Slots promise a fixed length; use Input with `type=\"password\"` and `autocomplete=\"current-password\"` instead.",
			},
			{
				guidance: "do",
				description:
					"Clear the error as soon as the user edits the code (`onValueChange` → reset the error), and set it again when the next code is refused. Each refusal is then a fresh change to invalid, so the field shakes for every wrong code, not only the first.",
			},
			{
				guidance: "dont",
				description:
					"Do not intercept paste or clear the field on a wrong code before the user has seen the error. Blocking paste breaks SMS autofill and password managers, and wiping the slots erases the evidence of which digit was wrong.",
			},
			{
				guidance: "dont",
				description:
					"Do not swap it for NumberField because the code is digits. A code is an identifier, not a quantity: NumberField strips leading zeros and offers steppers that make no sense here.",
			},
		],
		anatomy: [
			{
				name: "Root",
				required: true,
				description:
					"A role=group that holds the value, carries the field label and description, and reports completion.",
			},
			{
				name: "Slot",
				required: true,
				description:
					"One input per character. The first carries autocomplete=\"one-time-code\" and accepts the whole code.",
			},
			{
				name: "Group gap",
				required: false,
				description:
					"A decorative dash inserted every `groupSize` slots; hidden from assistive tech.",
			},
		],
	},
	related: {
		components: ["Input", "Form", "NumberField"],
	},
	props: [
		{
			name: "length",
			type: "number",
			default: "6",
			description: "Number of character slots. Completion fires when every slot is filled.",
		},
		{
			name: "groupSize",
			type: "number",
			description:
				"Insert a visual gap every N slots (3 renders 123 – 456). The value stays one contiguous string.",
		},
		{
			name: "value / defaultValue",
			type: "string",
			description: "Controlled / uncontrolled code.",
		},
		{
			name: "onValueChange",
			type: "(value: string, details) => void",
			description:
				"Fires on every edit. `details.reason` is input-change, input-clear, input-paste or keyboard.",
		},
		{
			name: "onValueComplete",
			type: "(value: string, details) => void",
			description:
				"Fires once every slot is filled — the place to verify the code. Also fires when a complete code is pasted over a complete value.",
		},
		{
			name: "onValueInvalid",
			type: "(attempted: string, details) => void",
			description:
				"Fires when typed or pasted text contains characters `validationType` rejects, so you can explain the rejection rather than letting it vanish.",
		},
		{
			name: "validationType",
			type: '"numeric" | "alpha" | "alphanumeric" | "none"',
			default: '"numeric"',
			description:
				"Which characters a slot accepts. Also picks the virtual keyboard (numeric → number pad).",
		},
		{
			name: "autoSubmit",
			type: "boolean",
			default: "false",
			description: "Submit the owning form when the code becomes complete.",
		},
		{
			name: "mask",
			type: "boolean",
			default: "false",
			description:
				"Render slots as password inputs. Only for codes that are secret on screen, such as a card PIN.",
		},
		{
			name: "getSlotLabel",
			type: "(index: number, length: number) => string",
			default: "Character N of L",
			description:
				"Accessible name for slots after the first. Override to localize.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description:
				"Marks every slot invalid (destructive border and digits). Turning it on after mount shakes the field once. `<Field error>` sets it for you.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The shake is the flourish; the destructive colour stays at every level.",
		},
		{
			name: "disabled / readOnly / required / name / id / form",
			type: "—",
			description:
				"Standard form-control props. `id` lands on the first slot, so `<Field>` and `<label htmlFor>` name the field.",
		},
	],
	tokensUsed: [
		"field-border",
		"field",
		"foreground",
		"muted-foreground",
		"border-strong",
		"primary",
		"ring",
		"destructive",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "A code field is part of the form it sits in and appears with it. Animating it in would delay the one thing the user arrived to do — paste the code they just copied.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Slot",
			why: "Focus moves between slots on every keystroke. The eased ring and border are what let the eye follow the cursor across six identical boxes instead of hunting for it after each digit.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Slot",
			why: "A filled slot strengthens its border, so a pasted code visibly lands in every slot at once. Easing it reads as the code arriving rather than the field flickering.",
		},
		{
			slot: "transition",
			recipe: "motion-shake",
			part: "Root",
			why: "A refused code shakes the field once as it turns invalid — the short horizontal no that makes a second wrong code feel noticed rather than ignored. It never carries the refusal alone: the digits and borders turn destructive and the Field says why. It plays on the change to invalid, not on mount, and is expressive, so `subtle` keeps only the colour.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Verifying the code is the form's work, not the field's. Show it on the submit Button's `loading` state, where the user expects the answer to appear.",
		},
	],
	a11y: [
		"The root is a role=group named by the field label; the first slot shares the label through `id`/`htmlFor`, and later slots are announced by position (\"Character 2 of 6\").",
		"Only one slot is in the tab order. Arrow keys, Home/End and Backspace move between slots; Tab leaves the whole field.",
		"The first slot carries autocomplete=\"one-time-code\" and the numeric virtual keyboard, so iOS and Android offer the SMS code above the keyboard.",
		"Slots render at 20px (`text-mono-lg`), above the 16px floor that stops iOS Safari zooming on focus.",
		"An invalid code is never signalled by motion alone: every slot carries aria-invalid, the digits and borders turn destructive, and the Field's error message is wired through aria-describedby. The shake resolves instantly under reduced motion and `subtle`.",
	],
	examples: [
		{
			label: "Six digits",
			code: '<Field label="Verification code"><OtpField length={6} onValueComplete={verify} /></Field>',
		},
		{
			label: "In a field, grouped",
			code: '<Field label="Verification code" description="Enter the 6-digit code we sent to your phone."><OtpField length={6} groupSize={3} /></Field>',
		},
		{
			label: "With an error",
			code: '<Field label="Verification code" error="That code has expired. Request a new code and try again."><OtpField length={6} groupSize={3} defaultValue="482913" /></Field>',
		},
		{
			label: "Verify on completion, shake on a wrong code",
			code: 'const [code, setCode] = useState("")\nconst [wrong, setWrong] = useState(false)\n<Field label="Verification code" error={wrong ? "That code does not match. Check the message and try again." : undefined}><OtpField length={6} groupSize={3} value={code} onValueChange={(next) => { setCode(next); setWrong(false) }} onValueComplete={(value) => setWrong(value !== expected)} /></Field>',
		},
		{
			label: "Alphanumeric",
			code: '<Field label="Pairing code"><OtpField length={8} groupSize={4} validationType="alphanumeric" /></Field>',
		},
	],
}
