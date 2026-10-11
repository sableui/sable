import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Entity } from "../components/entity"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
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
