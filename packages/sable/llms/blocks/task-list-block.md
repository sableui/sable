# TaskListBlock

A checklist card: a titled list of Checkbox rows with a category Badge each, a live count of what is left, and a quiet Add task action.

**Intent:** Reach for this for a short, personal to-do list on a dashboard or in onboarding. A team's task board with assignees and status columns needs a Table or DataTable.

**Block:** Dashboard · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Finishing a task strikes it through and mutes it rather than removing it, so the list does not jump under the pointer.
- The count in CardAction updates with every check, so progress reads without counting rows.
- Add task is a ghost Button in the footer — present, but quieter than the list.

## Accessibility

- Every Checkbox has a real <Label htmlFor>, so the whole title is the click target and the accessible name.
- Category Badges carry text; the tone only groups them visually.

## Source

```tsx
import { useState, useId } from "react"
import { Badge, Button, Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle, Checkbox, cn, Icon, Label } from "@sableui/react"

const tasks = [
	{ title: "Pick the cover type", tag: "Design", tone: "collectible", done: true },
	{ title: "Wire up checkout", tag: "Engineering", tone: "info", done: false },
	{ title: "Draft launch post", tag: "Launch", tone: "edition", done: false },
] as const

export interface TaskListBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	onAddTask?: () => void
}

export function TaskListBlock({ className, framed = true, onAddTask }: TaskListBlockProps) {
	const [done, setDone] = useState<boolean[]>(tasks.map((t) => t.done))
	const id = useId()
	const left = done.filter((d) => !d).length
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>This week</CardTitle>
				<CardAction>
					<span className="text-caption text-muted-foreground">{left} left</span>
				</CardAction>
			</CardHeader>
			<CardContent>
				<ul className="flex flex-col gap-1">
					{tasks.map((task, i) => (
						<li key={task.title} className="flex items-center gap-3 py-1.5">
							<Checkbox
								id={`${id}-${i}`}
								checked={done[i]}
								onCheckedChange={(v: boolean) => setDone(done.map((d, j) => (j === i ? v : d)))}
							/>
							<Label
								htmlFor={`${id}-${i}`}
								className={cn("min-w-0 flex-1 motion-interactive", done[i] && "text-muted-foreground line-through")}
							>
								{task.title}
							</Label>
							<Badge tone={task.tone} size="sm">
								{task.tag}
							</Badge>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter>
				<Button variant="ghost" size="sm" bleed="start" iconStart={<Icon name="plus" />} onClick={onAddTask}>
					Add task
				</Button>
			</CardFooter>
		</Card>
	)
}
```
