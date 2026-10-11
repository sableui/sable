# InviteTeamBlock

An invite card: who is already on the team as an AvatarGroup, and an email field with Send.

**Intent:** Reach for this for team or project invites in onboarding, an empty workspace, or a settings section. For managing an existing member list with roles, use a CardList of Entity rows instead.

**Block:** Settings & team · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The field and Send are a <form>, so Enter sends; `onSend` receives the typed address.
- The AvatarGroup ring matches the card surface when framed and inherits the host surface when not.

## Accessibility

- The AvatarGroup carries an aria-label with the count, so the stack reads as one item, not four initials.
- The email Input carries aria-label; there is no visible label in this compact layout.

## Source

```tsx
import { Avatar, AvatarGroup, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Input } from "@sableui/react"

const collaborators = ["MO", "SR", "JL", "AK"]

export interface InviteTeamBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called with the address typed, on Send or Enter. */
	onSend?: (email: string) => void
}

export function InviteTeamBlock({ className, framed = true, onSend }: InviteTeamBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>Invite your team</CardTitle>
				<CardDescription>Collaborators can edit every project.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<AvatarGroup aria-label={`${collaborators.length} collaborators`} size="sm" surface={framed ? "card" : undefined}>
					{collaborators.map((initials) => (
						<Avatar key={initials} fallback={initials} alt={initials} />
					))}
				</AvatarGroup>
				<form
					className="flex gap-2"
					onSubmit={(event) => {
						event.preventDefault()
						onSend?.(String(new FormData(event.currentTarget).get("email") ?? ""))
					}}
				>
					<Input name="email" type="email" placeholder="name@company.com" aria-label="Email address" />
					<Button type="submit">Send</Button>
				</form>
			</CardContent>
		</Card>
	)
}
```
