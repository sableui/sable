# ApiKeysBlock

An API keys card: each key's name with its masked hint in Code, when it was created and last used, and an OverflowMenu to rename, roll or revoke.

**Intent:** Reach for this for developer settings — API keys, access tokens, webhook secrets. Show a newly created key once, in a Dialog with a copy button; this list only ever shows the masked hint.

**Block:** Settings & team · card · designed for 20rem–42rem wide (fills its container up to the max)

## Notes

- Only the last four characters are shown. A full key never appears in a list, so there is no copy action here.
- "Last used" sits in the detail line: it is what tells someone a key is safe to revoke.
- Revoke is the destructive item, last and after a separator; confirm it in your handler with DestructiveActionModal.

## Accessibility

- Each OverflowMenu is labelled with the key's name, so the triggers are distinguishable.
- The masked hint is a Code element inside the title, read after the key's name.

## Source

```tsx
import { Button, Card, CardAction, CardDescription, CardHeader, CardList, CardTitle, cn, Code, Entity, Icon, MenuItem, MenuSeparator, OverflowMenu } from "@sableui/react"

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
```
