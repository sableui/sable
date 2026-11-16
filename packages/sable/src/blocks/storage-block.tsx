"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { ConfirmButton } from "../components/confirm-button"
import { Meter, MeterLabel, MeterTrack, MeterValue } from "../components/meter"
import { Progress, ProgressLabel, ProgressTrack, ProgressValue } from "../components/progress"
import { Skeleton } from "../components/skeleton"
import { toast } from "../components/toast"
import { cn } from "../lib/cn"

// ---block-code---
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
								<span className="text-mono-sm">{gb(item.id === "cache" && cleared ? 0 : item.size)}</span>
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
