"use client"

import { Card, CardList } from "../components/card"
import { Entity } from "../components/entity"
import { Switch } from "../components/switch"
import { cn } from "../lib/cn"

// ---block-code---
const preferences = [
	{ id: "email", title: "Email notifications", detail: "Replies and mentions", on: true },
	{ id: "push", title: "Push notifications", detail: "On this device", on: false },
	{ id: "digest", title: "Weekly digest", detail: "Every Monday", on: true },
]

export interface NotificationSettingsBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called the moment a switch changes. Toggles apply instantly; there is no Save. */
	onSettingChange?: (id: string, enabled: boolean) => void
}

export function NotificationSettingsBlock({ className, framed = true, onSettingChange }: NotificationSettingsBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			<CardList>
				{preferences.map((p) => (
					<Entity
						key={p.id}
						title={p.title}
						subtitle={p.detail}
						action={<Switch defaultChecked={p.on} aria-label={p.title} onCheckedChange={(enabled: boolean) => onSettingChange?.(p.id, enabled)} />}
					/>
				))}
			</CardList>
		</Card>
	)
}
