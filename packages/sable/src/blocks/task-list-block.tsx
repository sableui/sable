import { useId, useState } from "react"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Checkbox } from "../components/checkbox"
import { Label } from "../components/label"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
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
