# NewsletterBlock

A newsletter sign-up card: the list's name, what it sends and how often, and an email field with Subscribe.

**Intent:** Reach for this in a footer, at the end of an article, or beside a changelog. Creating an account is SignUpBlock; inviting a teammate is InviteTeamBlock.

**Block:** Marketing · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- Copied from the BrandLandingPage page shell's footer.
- The description says how often mail arrives — the one thing people want to know before they subscribe.
- The field and button sit side by side from sm up and stack on a phone, where the button goes full width.

## Accessibility

- The input has a real (visually hidden) <label>, not just a placeholder.
- The CardTitle renders an h2, so the sign-up is reachable by heading in a footer.

## Source

```tsx
import { useId } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Input } from "@sableui/react"

const newsletter = { title: "The Cove digest", body: "One note a month on trusted workflows and product releases." }

export interface NewsletterBlockProps {
	className?: string
	/** false drops the card's surface and border — for a footer or muted section that already frames it. */
	framed?: boolean
	/** Called with the address on Subscribe or Enter. */
	onSubscribe?: (email: string) => void
}

export function NewsletterBlock({ className, framed = true, onSubscribe }: NewsletterBlockProps) {
	const emailId = useId()
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>{newsletter.title}</CardTitle>
				<CardDescription>{newsletter.body}</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="grid gap-2 sm:grid-cols-[1fr_auto]"
					onSubmit={(event) => {
						event.preventDefault()
						onSubscribe?.(String(new FormData(event.currentTarget).get("email") ?? ""))
					}}
				>
					<label htmlFor={emailId} className="sr-only">
						Work email
					</label>
					<Input id={emailId} name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
					<Button type="submit" className="w-full sm:w-auto">
						Subscribe
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
```
