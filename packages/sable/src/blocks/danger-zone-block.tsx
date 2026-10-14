import { useState } from "react"
import { Button } from "../components/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { DestructiveActionModal } from "../components/destructive-action-modal"
import { cn } from "../lib/cn"

// ---block-code---
const account = { handle: "ada", projects: 12 }

export interface DangerZoneBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** Called once the person has typed the handle and confirmed. */
	onDelete?: () => void
}

export function DangerZoneBlock({ className, framed = true, onDelete }: DangerZoneBlockProps) {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-2xl", className)}>
				<CardHeader>
					<CardTitle render={<h2 />}>Delete account</CardTitle>
					<CardDescription>
						Permanently remove your profile, projects, and billing history. Files you shared stay with your team.
					</CardDescription>
				</CardHeader>
				<CardFooter actions className="justify-end">
					<Button variant="destructive" onClick={() => setOpen(true)}>
						Delete account
					</Button>
				</CardFooter>
			</Card>
			<DestructiveActionModal
				open={open}
				onOpenChange={setOpen}
				title="Delete your account?"
				description={`This permanently removes your profile, ${account.projects} projects, and billing history. Your final invoice is still sent. This can't be undone.`}
				confirmLabel="Delete account"
				confirmingLabel="Deleting…"
				confirmText={account.handle}
				onConfirm={() => {
					setOpen(false)
					onDelete?.()
				}}
			/>
		</>
	)
}
