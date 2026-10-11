import type { PatternMeta } from "../lib/meta"

export const authPageMeta: PatternMeta = {
	name: "AuthPage",
	summary:
		"Split sign-in page: a form column (brand mark, heading, email + password, primary sign-in, passkey and wallet alternatives, sign-up switch, terms) beside a brand panel painted from the theme's tones with a featured release card. Below lg the panel drops away and the form is the whole screen.",
	intent:
		"Reach for this for sign-in, sign-up, forgot-password, and any single-purpose one-column form route (invite accept, unsubscribe). Not for multi-section forms (use SettingsPage).",
	notes: [
		"The form column is a `form`-capped Region (480px), so the controls keep the same measure whether the panel is present or not.",
		"No card around the form: the page itself is the surface, and the brand panel carries the identity. A card on a blank page reads as a template.",
		"The heading is `text-heading-1` in an h1 — it is the page outline, so it takes a heading tier, not a card title.",
		"Brand mark, form and terms are a three-part column: mark pinned to the top, form vertically centred in the remaining space, terms pinned to the bottom.",
		"Forgot password sits under the password field, right-aligned, before the submit button — so it comes right after the field in tab order. Field has no label-row action slot yet.",
		"One primary action. Passkey and wallet are outline buttons under an `or` Separator; switching to sign-up is a quiet `link-underline` link.",
		"Validation uses Field `validate` for product copy instead of the browser's generic required message. A rejected sign-in comes back through Form `errors` on the password field; the submit Button shows `loading` while the request is in flight.",
		"The brand panel artwork is a mesh of the theme's decorative tones over `--primary`, so it re-paints for every theme and mode. The relative-colour `oklch(from var(--tone-*) …)` lift needs an `inline-color` disable with a reason.",
		"The panel is `hidden lg:flex`: on a phone the form is the whole screen, with no decorative scroll above it.",
	],
	a11y: [
		"The route renders inside <main> with one h1; the brand panel is an <aside> labelled \"Featured release\".",
		"Field auto-wires labels, describedby, and invalid state onto the inputs; on submit, the first invalid field is focused.",
		"Autocomplete attributes (`email webauthn`, `current-password`) keep password managers and passkey autofill working.",
		"The Forgot password and Create one links use `hit-target` to meet the 44px touch floor without changing layout.",
		"The artwork swatches are aria-hidden decoration; the brand link's accessible name is the wordmark.",
	],
}
