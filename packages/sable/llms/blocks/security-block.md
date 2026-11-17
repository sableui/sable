# SecurityBlock

Account security in one card: a Switch for two-factor authentication, passkeys with Manage, and the signed-in devices as Entity rows with RelativeTime and Sign out, plus a two-press Sign out of other devices.

**Intent:** Reach for this in account settings, beside ProfileFormBlock and NotificationSettingsBlock. Keys for programmatic access are ApiKeysBlock; deleting the account is DangerZoneBlock.

**Block:** Settings & team · card · designed for 20rem–28rem wide (fills its container up to the max)

## Notes

- Two-factor is a Switch because it applies the moment it changes, with no Save; its subtitle says what it is set to.
- The device rows share one CardList with the protection rows, set off by a quiet group label ("Signed-in devices") rather than a second card.
- The current device has no Sign out button; a Badge says "This device" in its place, so the one session that cannot be ended here is never offered.
- Last seen is a RelativeTime, and the sample sessions are timed from the page load.
- Sign out of other devices is a ConfirmButton naming how many it will end, and it disables itself when there are none.

## Accessibility

- Each Sign out button is named for its device ("Sign out of Windows desktop").
- Signing a device out moves focus to the group label, since its row is gone, and a status region mounted from the start says what happened.
- The Switch is named "Two-factor authentication", the row's title.

## Source

```tsx
"use client"

import { useState, useRef } from "react"
import { Badge, Button, Card, CardDescription, CardFooter, CardHeader, CardList, CardListLabel, CardTitle, cn, ConfirmButton, Entity, IconTile, RelativeTime, Switch } from "@sableui/react"

const protection = { twoFactor: true, passkeys: 2 }

// Last seen relative to the page load — replace with each session's own timestamp.
const HOUR = 3_600_000
const sessions = [
	{ id: "s1", device: "MacBook Pro", client: "Safari", place: "Lisbon", seen: Date.now(), current: true },
	{ id: "s2", device: "Windows desktop", client: "Edge", place: "Porto", seen: Date.now() - 3 * HOUR, current: false },
	{ id: "s3", device: "Linux workstation", client: "Firefox", place: "Berlin", seen: Date.now() - 50 * HOUR, current: false },
]

type Session = (typeof sessions)[number]

export interface SecurityBlockProps {
	className?: string
	/** false drops the card's surface and border — for a settings section that already frames it. */
	framed?: boolean
	/** Called with the new state the moment two-factor authentication is switched. */
	onTwoFactorChange?: (enabled: boolean) => void
	/** Called when the person asks to manage their passkeys. */
	onManagePasskeys?: () => void
	/** Called with the session's id when the person signs it out. */
	onSignOut?: (sessionId: string) => void
	/** Called when the person signs out every session but this one. */
	onSignOutOthers?: () => void
}

export function SecurityBlock({ className, framed = true, onTwoFactorChange, onManagePasskeys, onSignOut, onSignOutOthers }: SecurityBlockProps) {
	const [twoFactor, setTwoFactor] = useState(protection.twoFactor)
	const [active, setActive] = useState<Session[]>(sessions)
	// What the last sign-out did, for the live region below: the row it was on is gone.
	const [notice, setNotice] = useState("")
	const others = active.filter((session) => !session.current)
	// The row a sign-out button was on leaves with it, so focus goes to the
	// group's label rather than falling back to the top of the page.
	const group = useRef<HTMLDivElement>(null)

	const signOut = (session: Session) => {
		group.current?.focus()
		setActive((current) => current.filter((item) => item.id !== session.id))
		setNotice(`Signed out of ${session.device}`)
		onSignOut?.(session.id)
	}

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-md", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Security</CardTitle>
				<CardDescription>How you sign in, and where you are signed in.</CardDescription>
			</CardHeader>
			{/* Two short groups, set apart by space: no rules. */}
			<CardList divided={false}>
				<Entity
					leading={<IconTile icon="lock" size="sm" appearance="muted" />}
					title="Two-factor authentication"
					subtitle={twoFactor ? "On · codes from an authenticator app" : "Off"}
					action={
						<Switch
							checked={twoFactor}
							aria-label="Two-factor authentication"
							onCheckedChange={(enabled: boolean) => {
								setTwoFactor(enabled)
								onTwoFactorChange?.(enabled)
							}}
						/>
					}
				/>
				<Entity
					leading={<IconTile icon="key" size="sm" appearance="muted" />}
					title="Passkeys"
					subtitle={protection.passkeys === 1 ? "1 saved" : `${protection.passkeys} saved`}
					action={
						<Button variant="ghost" size="sm" bleed="end" aria-label="Manage passkeys" onClick={onManagePasskeys}>
							Manage
						</Button>
					}
				/>
				<CardListLabel ref={group} render={<h3 />} tabIndex={-1} className="outline-none">
					Signed-in devices
				</CardListLabel>
				{active.map((session) => (
					<Entity
						key={session.id}
						leading={<IconTile icon="desktop" size="sm" appearance="muted" />}
						title={`${session.device} · ${session.client}`}
						subtitle={
							session.current ? (
								session.place
							) : (
								<>
									{session.place} · <RelativeTime date={session.seen} />
								</>
							)
						}
						action={
							session.current ? (
								<Badge appearance="plain" tone="success" dot>
									This device
								</Badge>
							) : (
								<Button variant="ghost" size="sm" bleed="end" aria-label={`Sign out of ${session.device}`} onClick={() => signOut(session)}>
									Sign out
								</Button>
							)
						}
					/>
				))}
			</CardList>
			<p role="status" className="sr-only">
				{notice}
			</p>
			<CardFooter actions>
				{/* Two presses, not a dialog: signing out is undone by signing in again. */}
				<ConfirmButton
					variant="outline"
					className="w-full"
					disabled={others.length === 0}
					confirmLabel={others.length === 1 ? "Sign out of 1 device?" : `Sign out of ${others.length} devices?`}
					onConfirm={() => {
						setActive((current) => current.filter((session) => session.current))
						setNotice("Signed out of every other device")
						onSignOutOthers?.()
					}}
				>
					{others.length ? "Sign out of other devices" : "No other devices"}
				</ConfirmButton>
			</CardFooter>
		</Card>
	)
}
```
