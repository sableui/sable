import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { RadialChart } from "../components/radial-chart"
import { cn } from "../lib/cn"

// ---block-code---
const goals = [
	{ goal: "Releases", progress: 82 },
	{ goal: "Customers", progress: 64 },
	{ goal: "Revenue", progress: 91 },
]

export interface GoalProgressBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function GoalProgressBlock({ className, framed = true }: GoalProgressBlockProps) {
	const behind = goals.filter((g) => g.progress < 70)
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Quarter goals</CardTitle>
				<CardDescription>Progress toward each target, in percent.</CardDescription>
			</CardHeader>
			<CardContent>
				<RadialChart label="Progress toward quarter goals" data={goals} index="goal" valueKey="progress" max={100} className="h-64" valueFormatter={(v) => `${v}%`} />
			</CardContent>
			<CardFooter className="text-body-sm text-muted-foreground">
				{behind.length ? `${behind.map((g) => g.goal).join(" and ")} behind pace.` : "Every goal on pace."}
			</CardFooter>
		</Card>
	)
}
