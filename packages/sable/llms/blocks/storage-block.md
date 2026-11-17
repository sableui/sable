# StorageBlock

Storage used against a plan: a Meter with its reading, what takes the space, and a two-press Clear cache that turns into a Progress bar and ends in a toast.

**Intent:** Reach for this on a settings or account page to show a quota and offer one way to win some back — storage, seats, API calls, credits. A breakdown by category with no limit is SegmentedBar; a task with no level behind it is Progress alone.

**Block:** Settings & team · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The level is a Meter and the clear is a Progress. They look alike and mean different things: one is how full, the other is how far along.
- The Meter's tone comes from thresholds the block owns: warning from 75% of the plan, destructive from 90%. Clearing the cache drops it back under the first.
- While the cache is being cleared its size is a Skeleton, not the old number: the value is not known until the work is done.
- The outcome is a toast, so it is seen even if the person has scrolled on. A ToastProvider must be mounted in the app for it to show.
- Once cleared, the button stays in place, disabled and saying why, instead of disappearing.

## Accessibility

- The Meter is announced as a level with its reading in gigabytes; the Progress as a task with its percentage.
- The footer keeps focus while the button and the progress bar swap, so a keyboard user is not sent back to the top of the page.
- The toast is announced through the provider's live region.

## Source

```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, ConfirmButton, Meter, MeterLabel, MeterTrack, MeterValue, Progress, ProgressLabel, ProgressTrack, ProgressValue, Skeleton, toast } from "@sableui/react"

// Sizes in gigabytes. `cache` is the one that can be cleared.
const plan = { name: "Studio plan", capacity: 50 }
const usage = [
	{ id: "photos", label: "Photos", size: 21.4 },
	{ id: "videos", label: "Videos", size: 9.6 },
	{ id: "documents", label: "Documents", size: 4.1 },
	{ id: "cache", label: "Cache", size: 3.1 },
]

const gb = (size: number) => `${size.toFixed(1)} GB`

export interface StorageBlockProps {
	className?: string
	/** false drops the card's surface and border — for a settings section that already frames it. */
	framed?: boolean
	/** Called once the cache has been cleared. */
	onClear?: () => void
}

export function StorageBlock({ className, framed = true, onClear }: StorageBlockProps) {
	// idle → clearing (a number, the percent done) → cleared
	const [cleared, setCleared] = useState(false)
	const [progress, setProgress] = useState<number | null>(null)
	const clearing = progress !== null

	const cache = usage.find((item) => item.id === "cache")?.size ?? 0
	const used = usage.reduce((sum, item) => sum + item.size, 0) - (cleared ? cache : 0)
	const share = used / plan.capacity

	// The button gives way to the progress bar, so the footer holds the focus
	// while the two swap.
	const footer = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (progress === null) return
		if (progress < 100) {
			const timer = setTimeout(() => setProgress(Math.min(100, progress + 20)), 280)
			return () => clearTimeout(timer)
		}
		setProgress(null)
		setCleared(true)
		toast.success("Cache cleared", { description: `${gb(cache)} freed.` })
		onClear?.()
	}, [progress, cache, onClear])

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Storage</CardTitle>
				<CardDescription>{plan.name}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{/* A level, not a task: Meter. The tone comes from thresholds this block owns. */}
				<Meter
					value={used}
					max={plan.capacity}
					tone={share >= 0.9 ? "destructive" : share >= 0.75 ? "warning" : "primary"}
					getAriaValueText={(_, value) => `${gb(value ?? 0)} of ${plan.capacity} gigabytes used`}
				>
					<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
						<MeterLabel>Used</MeterLabel>
						<MeterValue>{(_, value) => `${gb(value ?? 0)} of ${plan.capacity} GB`}</MeterValue>
					</div>
					<MeterTrack />
				</Meter>
				<ul className="flex flex-col gap-2 text-body-sm">
					{usage.map((item) => (
						<li key={item.id} className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">{item.label}</span>
							{item.id === "cache" && clearing ? (
								// Unknown until the clear finishes, so a placeholder the size of the value.
								<Skeleton className="h-4 w-12" />
							) : (
								<span className="text-mono-md">{gb(item.id === "cache" && cleared ? 0 : item.size)}</span>
							)}
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter>
				<div ref={footer} tabIndex={-1} className="flex min-h-(--control-md) w-full flex-col justify-center outline-none">
					{clearing ? (
						// A task in flight: Progress, in the place of the button that started it.
						<Progress value={progress} size="sm">
							<div className="mb-2 flex items-center justify-between gap-3">
								<ProgressLabel>Clearing cache</ProgressLabel>
								<ProgressValue />
							</div>
							<ProgressTrack />
						</Progress>
					) : (
						// Two presses, not a dialog: a cache rebuilds itself.
						<ConfirmButton
							variant="outline"
							className="w-full"
							disabled={cleared}
							confirmLabel={`Clear ${gb(cache)}?`}
							onConfirm={() => {
								footer.current?.focus()
								setProgress(0)
							}}
						>
							{cleared ? "Cache is empty" : "Clear cache"}
						</ConfirmButton>
					)}
				</div>
			</CardFooter>
		</Card>
	)
}
```
