# FeedbackFormBlock

A feedback card: a one-to-five rating as a full-width ToggleGroup, an optional notes field, and Skip / Send feedback.

**Intent:** Reach for this for a post-session or post-purchase survey in a Sheet, Dialog or end-of-flow screen. For a feedback control anchored to a button in the app chrome, use the Feedback component (a popover).

**Block:** Social & messaging · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The rating is preselected, so one tap on Send is a complete answer; the notes are optional and say so.
- Skip is a ghost Button before the primary, so dismissing is always available and never competes with sending.
- `onDone` reports whether feedback was sent and, if so, the score and notes.

## Accessibility

- The ToggleGroup carries aria-label="Rating"; each Toggle's number is its name.
- The Textarea carries aria-label="Notes"; its placeholder is a prompt, not the label.

## Source

```tsx
import { useState } from "react"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, Textarea, Toggle, ToggleGroup } from "@sableui/react"

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
			<CardFooter className="justify-end">
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
```
