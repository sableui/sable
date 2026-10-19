import { useEffect, useRef, useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { InlineStatus } from "../components/inline-status"
import { ToolCall } from "../components/tool-call"
import { cn } from "../lib/cn"

// ---block-code---
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
