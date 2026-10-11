import { Badge } from "../components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { Grid, Row } from "../layout"

// ---block-code---
const stats = [
	{ label: "Revenue", value: "$18,240", delta: "+8.2%", up: true, note: "vs. $16,857" },
	{ label: "Collects", value: "1,284", delta: "+3.1%", up: true, note: "182 first-time" },
	{ label: "Collectors", value: "312", delta: "+12.4%", up: true, note: "Best month yet" },
	{ label: "Sell-through", value: "64%", delta: "−1.8%", up: false, note: "6 open editions" },
]

export interface StatRowBlockProps {
	className?: string
}

export function StatRowBlock({ className }: StatRowBlockProps) {
	return (
		<Grid cols={{ base: 2, xl: 4 }} gap={3} className={cn("w-full", className)}>
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader>
						<CardDescription>{stat.label}</CardDescription>
						<CardTitle className="text-mono-xl">{stat.value}</CardTitle>
					</CardHeader>
					<CardContent>
						<Row gap={1} wrap>
							<Badge tone={stat.up ? "success" : "warning"} size="sm" icon={<Icon name={stat.up ? "arrow-up" : "arrow-down"} />}>
								{stat.delta}
							</Badge>
							<span className="text-caption text-muted-foreground">{stat.note}</span>
						</Row>
					</CardContent>
				</Card>
			))}
		</Grid>
	)
}
