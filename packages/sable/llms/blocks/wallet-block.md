# WalletBlock

A balance card: the balance in the metric mono tier, Send and Receive as an equal pair, and recent activity as Entity rows with signed amounts.

**Intent:** Reach for this for a wallet, account balance or credits summary with its latest movements. For a full transaction history with filters, use a DataTable.

**Block:** Commerce · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The balance is CardTitle at `text-mono-xl` — tabular figures, never a heading tier — under its label as CardDescription.
- Send is primary and Receive secondary, side by side at equal width: two directions of one action, with sending the riskier and more frequent.
- Incoming amounts are `text-success`; outgoing stay muted rather than red, because a withdrawal is not an error.

## Accessibility

- Each activity row's leading swatch is aria-hidden; the title and detail carry the meaning.
- Amounts keep their sign in text (+0.80 / -1.50), so the direction does not depend on colour.

## Source

```tsx
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Entity, Icon } from "@sableui/react"

const balance = "14.62 SOL"

const activity = [
	{ title: "Sold “Dusk, no. 4”", detail: "Edition · 2h ago", amount: "+0.80", tone: "edition" },
	{ title: "Royalty", detail: "Collectible · Yesterday", amount: "+0.12", tone: "collectible" },
	{ title: "Withdrawal", detail: "To Phantom · Mon", amount: "-1.50", tone: "standard" },
]

export interface WalletBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
	onSend?: () => void
	onReceive?: () => void
}

export function WalletBlock({ className, framed = true, onSend, onReceive }: WalletBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardDescription>Balance</CardDescription>
				<CardTitle className="text-mono-xl">{balance}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="grid grid-cols-2 gap-2">
					<Button iconStart={<Icon name="arrow-up" />} onClick={onSend}>
						Send
					</Button>
					<Button variant="secondary" iconStart={<Icon name="arrow-down" />} onClick={onReceive}>
						Receive
					</Button>
				</div>
				<div className="flex flex-col">
					{activity.map((item) => (
						<Entity
							key={item.title}
							className="px-0"
							leading={
								<span
									aria-hidden
									className="block size-8 rounded-full"
									// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
									style={{ background: `oklch(from var(--tone-${item.tone}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h)` }}
								/>
							}
							title={item.title}
							subtitle={item.detail}
							action={
								<span className={cn("text-mono-md", item.amount.startsWith("+") ? "text-success" : "text-muted-foreground")}>
									{item.amount}
								</span>
							}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
```
