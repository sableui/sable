import { Button } from "../components/button"
import { Card, CardAction, CardDescription, CardHeader, CardList, CardTitle } from "../components/card"
import { Code } from "../components/code"
import { OverflowMenu } from "../components/overflow-menu"
import { Entity } from "../components/entity"
import { MenuItem, MenuSeparator } from "../components/menu"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
const keys = [
	{ id: "k1", name: "Production", hint: "sk_live_••••4f2a", detail: "Created Mar 2 · used 4 minutes ago" },
	{ id: "k2", name: "Staging", hint: "sk_test_••••91cd", detail: "Created Feb 11 · used yesterday" },
	{ id: "k3", name: "CI deploys", hint: "sk_live_••••0b7e", detail: "Created Jan 5 · never used" },
]

export interface ApiKeysBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	onCreate?: () => void
	/** Called with the key's id and the action chosen from its menu. */
	onKeyAction?: (id: string, action: "rename" | "roll" | "revoke") => void
}

export function ApiKeysBlock({ className, framed = true, onCreate, onKeyAction }: ApiKeysBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-2xl", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>API keys</CardTitle>
				<CardDescription>A key is shown once, when you create it. Store it somewhere safe.</CardDescription>
				<CardAction>
					<Button size="sm" variant="outline" iconStart={<Icon name="key" />} onClick={onCreate}>
						Create key
					</Button>
				</CardAction>
			</CardHeader>
			<CardList>
				{keys.map((k) => (
					<Entity
						key={k.id}
						title={
							<span className="flex flex-wrap items-center gap-x-2">
								{k.name}
								<Code>{k.hint}</Code>
							</span>
						}
						subtitle={k.detail}
						action={
							<OverflowMenu label={`Manage the ${k.name} key`} size="icon-sm">
								<MenuItem onClick={() => onKeyAction?.(k.id, "rename")}>Rename</MenuItem>
								<MenuItem onClick={() => onKeyAction?.(k.id, "roll")}>Roll key</MenuItem>
								<MenuSeparator />
								<MenuItem variant="destructive" onClick={() => onKeyAction?.(k.id, "revoke")}>
									Revoke
								</MenuItem>
							</OverflowMenu>
						}
					/>
				))}
			</CardList>
		</Card>
	)
}
