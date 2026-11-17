"use client"

import { useRef, useState } from "react"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardDescription, CardFooter, CardHeader, CardList, CardListLabel, CardTitle } from "../components/card"
import { ConfirmButton } from "../components/confirm-button"
import { Entity } from "../components/entity"
import { IconTile } from "../components/icon-tile"
import { RelativeTime } from "../components/relative-time"
import { Switch } from "../components/switch"
import { cn } from "../lib/cn"

// ---block-code---
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
