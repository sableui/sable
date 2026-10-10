# AuthPage

Centered auth card: a form-width region vertically centered in the viewport, one Card holding the Form, an alternate-action divider, and a quiet switch-to-sign-up link beneath it.

**Intent:** Reach for this for sign-in, sign-up, forgot-password, and any single-purpose one-column form route (invite accept, unsubscribe). Not for multi-section forms (use SettingsPage).

## Notes

- Region cap is `form` (480px) — the narrowest named cap; auth never needs more.
- The card is the only surface on the page: no app chrome, no sidebar — minimal exit paths.
- min-h-dvh + grid place-items-center centers the card without magic offsets.
- Field handles label/error wiring; the submit button is full-width — the primary (and only) action.
- Secondary actions (here, switch to sign-up; add forgot password the same way) are quiet `link-underline` links, never competing buttons.

## Accessibility

- The route renders inside <main> with the page h1 in the card header (an h1 inside CardTitle, which carries the type).
- Field auto-wires labels, describedby, and invalid state onto the inputs.
- Autocomplete attributes (email, current-password) keep password managers working.

## Source

```tsx
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, Form, Input, Region, Separator, Stack } from "@sableui/react"

export function AuthPage() {
	return (
		<main className="grid min-h-dvh place-items-center bg-background">
			<Region max="form" safeArea={["top", "bottom"]}>
				<Stack gap={3}>
					<Card>
						<CardHeader>
							{/* CardTitle carries the type; the h1 inside it is the page heading. */}
							<CardTitle>
								<h1>Sign in</h1>
							</CardTitle>
							<CardDescription>Welcome back — pick up where you left off.</CardDescription>
						</CardHeader>
						<CardContent>
							<Form onSubmit={(event) => event.preventDefault()}>
								<Field label="Email" required>
									<Input type="email" name="email" autoComplete="email" placeholder="you@example.com" />
								</Field>
								<Field label="Password" required>
									<Input type="password" name="password" autoComplete="current-password" />
								</Field>
								<Button type="submit" className="w-full">
									Sign in
								</Button>
								<Separator label="or" />
								<Button variant="outline" className="w-full">
									Continue with wallet
								</Button>
							</Form>
						</CardContent>
					</Card>
					<p className="text-center text-body-sm text-muted-foreground">
						No account?{" "}
						<a href="/signup" className="link-underline motion-interactive text-foreground">
							Create one
						</a>
					</p>
				</Stack>
			</Region>
		</main>
	)
}
```
