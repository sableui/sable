import { Badge } from "../components/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "../components/card"
import { SegmentedBar } from "../components/segmented-bar"
import { StatusDot } from "../components/status-dot"
import { cn } from "../lib/cn"
import { Grid } from "../layout"

// ---block-code---
const revenue = { label: "Revenue this month", total: "$12,480", change: "+8.2%" }

const segments = [
	{ label: "Direct", value: 42, tone: "1" },
	{ label: "Partners", value: 27, tone: "2" },
	{ label: "Referrals", value: 19, tone: "3" },
	{ label: "Resellers", value: 12, tone: "info" },
] as const

export interface RevenueBreakdownBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function RevenueBreakdownBlock({ className, framed = true }: RevenueBreakdownBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardDescription>{revenue.label}</CardDescription>
				<CardAction>
					<Badge tone="success" size="sm">
						{revenue.change}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-2">
				<span className="text-mono-xl">{revenue.total}</span>
				<SegmentedBar label="Revenue by channel" segments={[...segments]} size="lg" />
				{/* Two columns while each entry fits whole, one when they would not:
				    sized in em, so a larger type or a narrower card drops to one.
				    aria-hidden: the bar already reads every share aloud. */}
				<Grid aria-hidden minItemWidth="9.5em" gap="calc(var(--spacing) * 1.5) calc(var(--spacing) * 4)">
					{segments.map((s) => (
						<div key={s.label} className="flex items-center gap-2 text-body-sm">
							<StatusDot tone={s.tone} />
							<span className="flex-1 text-muted-foreground">{s.label}</span>
							<span className="text-mono-caption">{s.value}%</span>
						</div>
					))}
				</Grid>
			</CardContent>
		</Card>
	)
}
