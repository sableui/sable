import { Avatar, AvatarGroup } from "../components/avatar"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Input } from "../components/input"
import { cn } from "../lib/cn"

// ---block-code---
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
