# SignInBlock

A sign-in card: email and password, a primary Sign in, and a passkey alternative under an "or" separator.

**Intent:** Reach for this wherever someone signs in inside a surface you already have — a Sheet, a Dialog, a gated panel. For a whole sign-in route with brand art beside the form, start from the AuthPage page shell instead.

**Block:** Auth · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- One primary action. The passkey is an outline Button under a labelled Separator, so it reads as an alternative, not a second submit.
- The fields are a real <form>: Enter submits, and the browser's password manager recognises the autocomplete hints.
- framed={false} keeps the padding and drops the surface, for a Sheet or Dialog that is already the frame.

## Accessibility

- Inputs carry aria-label because the design shows placeholders, not visible labels; add Field labels if your brief wants them visible.
- `onSignIn` receives "password" or "passkey", so focus and error handling stay with the caller's auth flow.

## Source

```tsx
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Icon, Input, Separator } from "@sableui/react"

export interface SignInBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called with the method the person chose. Wire your auth here. */
	onSignIn?: (method: "password" | "passkey") => void
}

export function SignInBlock({ className, framed = true, onSignIn }: SignInBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>Sign in to pick up where you left off.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault()
						onSignIn?.("password")
					}}
				>
					<div className="flex flex-col gap-2">
						<Input name="email" type="email" autoComplete="email" placeholder="you@studio.com" aria-label="Email" />
						<Input name="password" type="password" autoComplete="current-password" placeholder="Password" aria-label="Password" />
					</div>
					<Button type="submit" className="w-full">
						Sign in
					</Button>
					<Separator label="or" />
					<Button variant="outline" className="w-full" iconStart={<Icon name="lock" />} onClick={() => onSignIn?.("passkey")}>
						Use a passkey
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
```
