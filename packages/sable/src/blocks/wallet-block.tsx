import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Entity } from "../components/entity"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
const balance = "$2,418.50"

const activity = [
	{ title: "Subscription", detail: "Team plan · 2h ago", amount: "+49.00", tone: "1" },
	{ title: "Refund", detail: "Order 1042 · Yesterday", amount: "-24.00", tone: "2" },
	{ title: "Payout", detail: "To checking · Mon", amount: "-850.00", tone: "3" },
] as const

/** Each row's mark: its tone at graphic strength, which every theme tunes. */
const TONE_MARK = { "1": "bg-tone-1-mark", "2": "bg-tone-2-mark", "3": "bg-tone-3-mark" } as const

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
									className={cn("block size-8 rounded-full", TONE_MARK[item.tone])}
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
