# GoalProgressBlock

A goals card: a ring per goal in a RadialChart against its track (a full ring is 100%), a legend, and which goals are behind in the footer.

**Intent:** Reach for this for progress toward two to four targets — a quarter's goals, a plan's limits, onboarding steps. A single reading in a settings row is a Meter; many goals are a list of Progress bars.

**Block:** Dashboard · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- max={100} makes a full ring mean done; each ring draws round from 12 o'clock as the card scrolls into view.
- The footer names what is behind, so the card is actionable without reading the rings.
- Values are formatted as percents in the tooltip and data table.

## Accessibility

- The rings' data table lists each goal and its percent.
- Arrowing through the rings announces each goal; the legend names every ring's colour.

## Source

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, RadialChart } from "@sableui/react"

const goals = [
	{ goal: "Releases", progress: 82 },
	{ goal: "Collectors", progress: 64 },
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
```
