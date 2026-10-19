# ApprovalBlock

An agent asking permission for one tool call: the question, what is at stake, the call itself as a ToolCall with its exact input, and Deny / Always allow / Allow once.

**Intent:** Reach for this in a chat or agent run when a tool call waits on the person — running a command, sending, paying, deleting, publishing. It wraps the call's own ToolCall, which shows status="awaiting" until the person answers and then "complete" or "denied". A destructive action outside an agent is DestructiveActionModal.

**Block:** AI & agents · card · designed for 18rem–28rem wide (fills its container up to the max)

## Notes

- The title is the question in plain words ("Run this command?"); the description says what is at stake. That sentence is what the person is deciding on.
- The call is shown as the agent made it — tool name and raw input, open on arrival — because the exact arguments are what a careful person checks. Do not paraphrase them into a form.
- Three answers, as agent products settle on: Deny on the start edge, then Always allow and Allow once, the primary on the end. Neither is focused on arrival: an approval that a stray Enter can grant is not an approval.
- After a decision the buttons give way to one InlineStatus line saying what happened, and the ToolCall shows the outcome, so the thread keeps a record of the answer.

## Accessibility

- Focus moves to the outcome line when the buttons leave, instead of dropping to the page; the line is a role=status region, so the decision is announced.
- The ToolCall announces its own status change, and its input is a labelled code view.

## Source

```tsx
import { useState, useEffect, useRef } from "react"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, InlineStatus, ToolCall } from "@sableui/react"

const request = {
	title: "Run this command?",
	description: "The agent wants to migrate the production database in acme/api. It changes live data.",
	tool: "run_command",
	action: "Run a command",
	// A command reads as the command; a structured call would pass its arguments object.
	input: "pnpm db:migrate --env production",
	allowed: "Allowed. Running the migration.",
	denied: "Denied. The agent won't run it.",
}

export interface ApprovalBlockProps {
	className?: string
	/** false drops the card's surface and border — for a chat column that already frames it. */
	framed?: boolean
	/** The person allowed the call. `remember` is true for "Always allow". */
	onApprove?: (options: { remember: boolean }) => void
	/** The person declined the call. */
	onDeny?: () => void
}

export function ApprovalBlock({ className, framed = true, onApprove, onDeny }: ApprovalBlockProps) {
	const [decision, setDecision] = useState<"allowed" | "denied" | null>(null)
	const outcome = useRef<HTMLDivElement>(null)
	// The buttons leave with the decision, so focus moves to the line that
	// replaces them instead of falling back to the top of the page.
	useEffect(() => {
		if (decision) outcome.current?.focus()
	}, [decision])

	const approve = (remember: boolean) => {
		setDecision("allowed")
		onApprove?.({ remember })
	}

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-md", className)}>
			<CardHeader>
				<CardTitle>{request.title}</CardTitle>
				<CardDescription>{request.description}</CardDescription>
			</CardHeader>
			<CardContent>
				{/* The call itself, exactly as the agent made it. It answers with the
				    person: held, then done or denied. */}
				<ToolCall
					name={request.tool}
					title={request.action}
					status={decision === "allowed" ? "complete" : decision === "denied" ? "denied" : "awaiting"}
					statusLabel={decision === "allowed" ? "Allowed" : undefined}
					input={request.input}
					defaultOpen
				/>
			</CardContent>
			<CardFooter actions>
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
							variant="ghost"
							className="me-auto"
							onClick={() => {
								setDecision("denied")
								onDeny?.()
							}}
						>
							Deny
						</Button>
						<Button variant="outline" onClick={() => approve(true)}>
							Always allow
						</Button>
						<Button onClick={() => approve(false)}>Allow once</Button>
					</>
				)}
			</CardFooter>
		</Card>
	)
}
```
