import { useEffect, useId, useRef, useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Checkbox } from "../components/checkbox"
import { Code } from "../components/code"
import { InlineStatus } from "../components/inline-status"
import { Label } from "../components/label"
import { cn } from "../lib/cn"

// ---block-code---
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
