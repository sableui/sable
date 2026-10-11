# SignUpBlock

A sign-up card: name, work email and password as labelled Fields, one full-width Create account, and a link to sign in instead.

**Intent:** Reach for this to create an account inside a surface you already have, or as the form of a sign-up route. For the whole route with brand art beside it, start from the AuthPage page shell and drop this card in.

**Block:** Auth · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- Visible labels, not placeholders: someone filling a new form needs to see what each field is after typing in it.
- The password rule is stated up front in the Field description, before anyone fails it.
- `onSignUp` receives the fields only after the browser's own validation (required, type=email, minLength) passes.

## Accessibility

- Field wires each label, description and error to its input; never hand-roll <label> + <input> pairs.
- autoComplete hints (name, email, new-password) let password managers offer to generate and save the password.

## Source

```tsx
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, Field, Form, Input } from "@sableui/react"

export interface SignUpBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called with the submitted fields once the browser's validation passes. */
	onSignUp?: (account: { name: string; email: string; password: string }) => void
}

export function SignUpBlock({ className, framed = true, onSignUp }: SignUpBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
				<CardDescription>Free for 14 days. No card needed.</CardDescription>
			</CardHeader>
			<Form
				className="gap-0"
				onSubmit={(event) => {
					event.preventDefault()
					const data = new FormData(event.currentTarget)
					onSignUp?.({
						name: String(data.get("name") ?? ""),
						email: String(data.get("email") ?? ""),
						password: String(data.get("password") ?? ""),
					})
				}}
			>
				<CardContent className="flex flex-col gap-3">
					<Field label="Name" name="name" required>
						<Input autoComplete="name" />
					</Field>
					<Field label="Work email" name="email" required>
						<Input type="email" autoComplete="email" placeholder="you@studio.com" />
					</Field>
					<Field label="Password" name="password" description="At least 12 characters." required>
						<Input type="password" autoComplete="new-password" minLength={12} />
					</Field>
				</CardContent>
				<CardFooter className="flex-col items-stretch gap-3">
					<Button type="submit" className="w-full">
						Create account
					</Button>
					<p className="text-center text-caption text-muted-foreground">
						Already have an account?{" "}
						<a href="/sign-in" className="text-foreground underline underline-offset-4 motion-interactive hover:text-muted-foreground">
							Sign in
						</a>
					</p>
				</CardFooter>
			</Form>
		</Card>
	)
}
```
