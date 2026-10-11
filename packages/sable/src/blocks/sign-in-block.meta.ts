import type { BlockMeta } from "../lib/meta"

export const signInBlockMeta: BlockMeta = {
	name: "SignInBlock",
	family: "Auth",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A sign-in card: email and password, a primary Sign in, and a passkey alternative under an \"or\" separator.",
	intent:
		"Reach for this wherever someone signs in inside a surface you already have — a Sheet, a Dialog, a gated panel. For a whole sign-in route with brand art beside the form, start from the AuthPage page shell instead.",
	notes: [
		"One primary action. The passkey is an outline Button under a labelled Separator, so it reads as an alternative, not a second submit.",
		"The fields are a real <form>: Enter submits, and the browser's password manager recognises the autocomplete hints.",
		"framed={false} keeps the padding and drops the surface, for a Sheet or Dialog that is already the frame.",
	],
	a11y: [
		"Inputs carry aria-label because the design shows placeholders, not visible labels; add Field labels if your brief wants them visible.",
		"`onSignIn` receives \"password\" or \"passkey\", so focus and error handling stay with the caller's auth flow.",
	],
}
