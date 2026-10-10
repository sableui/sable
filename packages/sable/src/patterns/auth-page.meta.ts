import type { PatternMeta } from "../lib/meta"

export const authPageMeta: PatternMeta = {
	name: "AuthPage",
	summary:
		"Centered auth card: a form-width region vertically centered in the viewport, one Card holding the Form, an alternate-action divider, and a quiet switch-to-sign-up link beneath it.",
	intent:
		"Reach for this for sign-in, sign-up, forgot-password, and any single-purpose one-column form route (invite accept, unsubscribe). Not for multi-section forms (use SettingsPage).",
	notes: [
		"Region cap is `form` (480px) — the narrowest named cap; auth never needs more.",
		"The card is the only surface on the page: no app chrome, no sidebar — minimal exit paths.",
		"min-h-dvh + grid place-items-center centers the card without magic offsets.",
		"Field handles label/error wiring; the submit button is full-width — the primary (and only) action.",
		"Secondary actions (here, switch to sign-up; add forgot password the same way) are quiet `link-underline` links, never competing buttons.",
	],
	a11y: [
		"The route renders inside <main> with the page h1 in the card header (an h1 inside CardTitle, which carries the type).",
		"Field auto-wires labels, describedby, and invalid state onto the inputs.",
		"Autocomplete attributes (email, current-password) keep password managers working.",
	],
}
