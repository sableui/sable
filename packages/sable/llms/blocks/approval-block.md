# ApprovalBlock

An agent asking permission for one tool call: the question, what will happen and what can't be undone, the call's details, an "allow for the rest of this chat" Checkbox, and Deny / Allow.

**Intent:** Reach for this in a chat or agent run when a tool call waits on the person — sending, paying, deleting, publishing. The call itself, before and after the decision, is a ToolCall with status="awaiting", then "complete" or "denied". A destructive action outside an agent is DestructiveActionModal.

**Block:** AI & agents · card · designed for 18rem–28rem wide (fills its container up to the max)

## Notes

- The title is the question in plain words ("Send the invoice to Ada?"), not the tool's name; the tool's name is one row of the details, for the person who wants to know exactly what runs.
- The description says what can't be undone. That sentence is what the person is deciding on.
- Deny comes first and Allow is the primary on the end, the same order as every Sable confirmation. Neither is focused on arrival: an approval that a stray Enter can grant is not an approval.
- After a decision the buttons give way to one InlineStatus line saying what happened, so the thread keeps a record of the answer.

## Accessibility

- Focus moves to the outcome line when the buttons leave, instead of dropping to the page; the line is a role=status region, so the decision is announced.
- The details are a dl, so each value is read with its label.
- The remember Checkbox has its own Label, so the tool name inside it is part of its accessible name.

## Source

```tsx
import { useState, useEffect, useRef, useId } from "react"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, cn, Code, InlineStatus, Label } from "@sableui/react"

const request = {
	tool: "send_email",
	title: "Send the invoice to Ada?",
	description: "The agent wants to email invoice INV-1042. An email can't be unsent.",
	details: [
		{ label: "To", value: "ada@example.com" },
		{ label: "Subject", value: "INV-1042 for October" },
		{ label: "Attached", value: "INV-1042.pdf" },
	],
	allowed: "Allowed. Sending the email.",
	denied: "Denied. The agent won't send it.",
}

export interface ApprovalBlockProps {
	className?: string
	/** false drops the card's surface and border — for a chat column that already frames it. */
	framed?: boolean
	/** The person allowed the call. `remember` is the "for the rest of this chat" choice. */
	onApprove?: (options: { remember: boolean }) => void
	/** The person declined the call. */
	onDeny?: () => void
}

export function ApprovalBlock({ className, framed = true, onApprove, onDeny }: ApprovalBlockProps) {
	const [decision, setDecision] = useState<"allowed" | "denied" | null>(null)
	const [remember, setRemember] = useState(false)
	const id = useId()
	const outcome = useRef<HTMLDivElement>(null)
	// The buttons leave with the decision, so focus moves to the line that
	// replaces them instead of falling back to the top of the page.
	useEffect(() => {
		if (decision) outcome.current?.focus()
	}, [decision])

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-md", className)}>
			<CardHeader>
				<CardTitle>{request.title}</CardTitle>
				<CardDescription>{request.description}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-body-sm">
					{request.details.map((d) => (
						<div key={d.label} className="contents">
							<dt className="text-muted-foreground">{d.label}</dt>
							<dd className="truncate text-foreground">{d.value}</dd>
						</div>
					))}
					<div className="contents">
						<dt className="text-muted-foreground">Tool</dt>
						<dd className="min-w-0">
							<Code>{request.tool}</Code>
						</dd>
					</div>
				</dl>
				{decision ? null : (
					<div className="flex items-center gap-2">
						<Checkbox id={`${id}-remember`} checked={remember} onCheckedChange={(v: boolean) => setRemember(v)} />
						<Label htmlFor={`${id}-remember`} className="text-body-sm">
							Allow <Code>{request.tool}</Code> for the rest of this chat
						</Label>
					</div>
				)}
			</CardContent>
			<CardFooter actions className="justify-end">
				{decision ? (
					<InlineStatus
						ref={outcome}
						tabIndex={-1}
						role="status"
						tone={decision === "allowed" ? "success" : "neutral"}
						className="me-auto outline-none"
					>
						{decision === "allowed" ? request.allowed : request.denied}
					</InlineStatus>
				) : (
					<>
						<Button
							variant="outline"
							onClick={() => {
								setDecision("denied")
								onDeny?.()
							}}
						>
							Deny
						</Button>
						<Button
							onClick={() => {
								setDecision("allowed")
								onApprove?.({ remember })
							}}
						>
							Allow
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	)
}
```
