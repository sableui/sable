import type { BlockMeta } from "../lib/meta"

export const verifyCodeBlockMeta: BlockMeta = {
	name: "VerifyCodeBlock",
	family: "Auth",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "A one-time-code card: where the code went, a six-slot OtpField grouped 3 + 3 under a visible label, and a quiet Resend.",
	intent:
		"Reach for this for email or SMS verification, two-factor sign-in, or confirming a sensitive change. For a code someone copies out (a recovery key), show it with Code and a copy button instead.",
	notes: [
		"No submit button: the code verifies the moment the last slot fills, which is what people expect from a code field.",
		"The destination is named in the description, so a mistyped address is caught before the wait.",
		"Resend is a ghost Button — present for the stuck case, never competing with the field.",
	],
	a11y: [
		"OtpField names each slot (\"Character 1 of 6\") and accepts a pasted code into all six at once.",
		"Field labels the group and reads the expiry as its description.",
	],
}
