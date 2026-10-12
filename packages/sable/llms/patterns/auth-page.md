# AuthPage

Split sign-in page: a form column (brand mark, heading, email + password, primary sign-in, passkey and wallet alternatives, sign-up switch, terms) beside a brand panel painted from the theme's tones with a featured release card. Below lg the panel drops away and the form is the whole screen.

**Intent:** Reach for this for sign-in, sign-up, forgot-password, and any single-purpose one-column form route (invite accept, unsubscribe). Not for multi-section forms (use SettingsPage).

## Notes

- The form column is a `form`-capped Region (480px), so the controls keep the same measure whether the panel is present or not.
- No card around the form: the page itself is the surface, and the brand panel carries the identity. A card on a blank page reads as a template.
- The heading is `text-heading-1` in an h1 — it is the page outline, so it takes a heading tier, not a card title.
- Brand mark, form and terms are a three-part column: mark pinned to the top, form vertically centred in the remaining space, terms pinned to the bottom.
- Forgot password sits under the password field, right-aligned, before the submit button — so it comes right after the field in tab order. Field has no label-row action slot yet.
- One primary action. Passkey and wallet are outline buttons under an `or` Separator; switching to sign-up is a quiet `link-underline` link.
- Validation uses Field `validate` for product copy instead of the browser's generic required message. A rejected sign-in comes back through Form `errors` on the password field; the submit Button shows `loading` while the request is in flight.
- The brand panel artwork is a mesh of the theme's decorative tones over `--primary`, so it re-paints for every theme and mode. The relative-colour `oklch(from var(--tone-*) …)` lift needs an `inline-color` disable with a reason.
- The panel is `hidden lg:flex`: on a phone the form is the whole screen, with no decorative scroll above it.

## Accessibility

- The route renders inside <main> with one h1; the brand panel is an <aside> labelled "Featured release".
- Field auto-wires labels, describedby, and invalid state onto the inputs; on submit, the first invalid field is focused.
- Autocomplete attributes (`email webauthn`, `current-password`) keep password managers and passkey autofill working.
- The Forgot password and Create one links use `hit-target` to meet the 44px touch floor without changing layout.
- The artwork swatches are aria-hidden decoration; the brand link's accessible name is the wordmark.

## Source

```tsx
import { useState } from "react"
import { Avatar, Badge, Button, Card, CardContent, Entity, Field, Form, GradientArt, Icon, Input, Region, Separator, Stack } from "@sableui/react"

export function AuthPage() {
	const [pending, setPending] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	return (
		<main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
			<Region max="form" safeArea={["top", "bottom"]} className="flex flex-col">
				{/* safeArea owns the region's own padding, so the breathing room sits one level in. */}
				<Stack gap={0} className="flex-1 py-8 sm:py-10">
					<a href="/" className="flex items-center gap-2.5 self-start rounded-sm motion-interactive motion-press">
						{/* The same mark the app shell's sidebar and header carry. */}
						<Icon name="gem" variant="solid" className="text-2xl" />
						<span className="text-title-lg">Atelier</span>
					</a>

					<Stack gap={4} justify="center" className="flex-1 py-12">
						<Stack gap={1.5}>
							<h1 className="text-heading-1">Welcome back</h1>
							<p className="text-body-lg text-muted-foreground">
								Sign in to collect new releases and manage your editions.
							</p>
						</Stack>

						<Form
							className="gap-5"
							errors={errors}
							onFormSubmit={() => {
								setPending(true)
								// Replace with your auth call; a rejected sign-in comes back as a field error.
								setTimeout(() => {
									setPending(false)
									setErrors({ password: "That email and password don’t match. Try again or reset your password." })
								}, 900)
							}}
						>
							<Field label="Email" name="email" validate={(value) => (value ? null : "Enter your email address.")}>
								<Input type="email" autoComplete="email webauthn" placeholder="you@example.com" />
							</Field>
							<Stack gap={1.5}>
								<Field label="Password" name="password" validate={(value) => (value ? null : "Enter your password.")}>
									<Input type="password" autoComplete="current-password" />
								</Field>
								<a href="/forgot-password" className="hit-target self-end text-body-sm text-muted-foreground link-underline motion-interactive">
									Forgot password?
								</a>
							</Stack>
							<Button type="submit" size="cta" loading={pending} loadingLabel="Signing in" className="w-full">
								Sign in
							</Button>
						</Form>

						<Separator label="or" />

						<Stack gap={1.5}>
							<Button variant="outline" size="cta" className="w-full" iconStart={<Icon name="key" />}>
								Sign in with a passkey
							</Button>
							<Button variant="outline" size="cta" className="w-full" iconStart={<Icon name="wallet" />}>
								Connect a wallet
							</Button>
						</Stack>

						<p className="text-body-md text-muted-foreground">
							No account?{" "}
							<a href="/signup" className="hit-target link-underline motion-interactive text-foreground">
								Create one
							</a>
						</p>
					</Stack>

					<p className="text-body-xs text-muted-foreground">
						By signing in you agree to the{" "}
						<a href="/terms" className="link-underline motion-interactive">
							Terms
						</a>{" "}
						and{" "}
						<a href="/privacy" className="link-underline motion-interactive">
							Privacy Policy
						</a>
						.
					</p>
				</Stack>
			</Region>

			{/* The brand panel is decoration: on a phone the form is the whole screen. */}
			<aside aria-label="Featured release" className="hidden p-3 lg:flex">
				{/* Art painted from the theme's tones over its brand, so it follows every look. */}
				<GradientArt seed="Untitled (gold rush)" className="flex flex-1 flex-col justify-end rounded-xl p-8">
					<Card className="max-w-md">
						<CardContent>
							<Stack gap={3}>
								<Badge tone="edition" className="self-start">
									Edition of 50
								</Badge>
								<p className="text-title-lg">
									“Every edition is a conversation with whoever holds it next.”
								</p>
								<Entity
									className="p-0"
									leading={<Avatar variant="art" fallback="MO" />}
									title="Mara Okafor"
									subtitle="Untitled (gold rush), 2026"
								/>
							</Stack>
						</CardContent>
					</Card>
				</GradientArt>
			</aside>
		</main>
	)
}
```
