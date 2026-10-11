import type { BlockMeta } from "../lib/meta"

export const signUpBlockMeta: BlockMeta = {
	name: "SignUpBlock",
	family: "Auth",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "A sign-up card: name, work email and password as labelled Fields, one full-width Create account, and a link to sign in instead.",
	intent:
		"Reach for this to create an account inside a surface you already have, or as the form of a sign-up route. For the whole route with brand art beside it, start from the AuthPage page shell and drop this card in.",
	notes: [
		"Visible labels, not placeholders: someone filling a new form needs to see what each field is after typing in it.",
		"The password rule is stated up front in the Field description, before anyone fails it.",
		"`onSignUp` receives the fields only after the browser's own validation (required, type=email, minLength) passes.",
	],
	a11y: [
		"Field wires each label, description and error to its input; never hand-roll <label> + <input> pairs.",
		"autoComplete hints (name, email, new-password) let password managers offer to generate and save the password.",
	],
}
