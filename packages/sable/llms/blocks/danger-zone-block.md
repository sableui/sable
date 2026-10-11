# DangerZoneBlock

A delete-account card: what deleting removes and what survives, one destructive Button, and a DestructiveActionModal that asks for the handle to be typed before it acts.

**Intent:** Reach for this as the last section of account, workspace or project settings. Deleting a single record from a list is an OverflowMenu item that opens DestructiveActionModal directly, not a card.

**Block:** Settings & team · card · designed for 20rem–42rem wide (fills its container up to the max)

## Notes

- Copied from the SettingsPage page shell's Delete account section.
- The button never acts directly: it opens the modal, whose confirm stays disabled until the handle is typed.
- The description says what is lost AND what is kept ("Collectors keep the editions they own"), which is what people want to know before they decide.

## Accessibility

- DestructiveActionModal is an alertdialog: focus opens on Cancel and the backdrop does not dismiss it.
- The CardTitle is an h2, so the section is reachable by heading.

## Source

```tsx
import { useState } from "react"
import { Button, Card, CardDescription, CardFooter, CardHeader, CardTitle, cn, DestructiveActionModal } from "@sableui/react"

const account = { handle: "ada", editions: 12 }

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
						Permanently remove your profile, editions, and sales history. Collectors keep the editions they own.
					</CardDescription>
				</CardHeader>
				<CardFooter className="justify-end">
					<Button variant="destructive" onClick={() => setOpen(true)}>
						Delete account
					</Button>
				</CardFooter>
			</Card>
			<DestructiveActionModal
				open={open}
				onOpenChange={setOpen}
				title="Delete your account?"
				description={`This permanently removes your profile, ${account.editions} editions, and sales history. Pending payouts are still sent. This can't be undone.`}
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
```
