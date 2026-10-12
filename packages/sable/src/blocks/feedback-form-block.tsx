import { useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Textarea } from "../components/textarea"
import { Toggle, ToggleGroup } from "../components/toggle"
import { cn } from "../lib/cn"

// ---block-code---
const scale = ["1", "2", "3", "4", "5"]

export interface FeedbackFormBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or Dialog that already frames it. */
	framed?: boolean
	/** Skip calls it with `sent: false`; Send with `sent: true` and the answers. */
	onDone?: (sent: boolean, feedback?: { score: number; notes: string }) => void
}

export function FeedbackFormBlock({ className, framed = true, onDone }: FeedbackFormBlockProps) {
	const [score, setScore] = useState("4")
	const [notes, setNotes] = useState("")
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>How was the session?</CardTitle>
				<CardDescription>One tap is enough. Notes help us more.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<ToggleGroup value={[score]} onValueChange={(v: unknown[]) => v[0] && setScore(String(v[0]))} aria-label="Rating" className="w-full">
					{scale.map((n) => (
						<Toggle key={n} value={n} className="flex-1">
							{n}
						</Toggle>
					))}
				</ToggleGroup>
				<Textarea placeholder="What worked, what didn’t…" aria-label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
			</CardContent>
			<CardFooter actions className="justify-end">
				<Button variant="ghost" size="sm" onClick={() => onDone?.(false)}>
					Skip
				</Button>
				<Button size="sm" onClick={() => onDone?.(true, { score: Number(score), notes })}>
					Send feedback
				</Button>
			</CardFooter>
		</Card>
	)
}
