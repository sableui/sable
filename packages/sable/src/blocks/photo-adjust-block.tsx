"use client"

import { useId, useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardFooter } from "../components/card"
import { ColorField } from "../components/color-field"
import { MediaImage } from "../components/media-image"
import { PropertyRow } from "../components/panel-section"
import { ScrubField } from "../components/scrub-field"
import { Slider } from "../components/slider"
import { AspectBox } from "../layout/AspectBox"
import { cn } from "../lib/cn"

// ---block-code---
// The photo's title is its alt text and seeds the art painted when there is no image.
const photo = { title: "Ridge at first light" }

// Each adjustment runs from -100 to 100 around the untouched photo at 0.
const adjustments = [
	{ id: "exposure", label: "Exposure" },
	{ id: "contrast", label: "Contrast" },
	{ id: "saturation", label: "Saturation" },
] as const

type Adjustment = (typeof adjustments)[number]["id"]

const untouched: Record<Adjustment, number> = { exposure: 0, contrast: 0, saturation: 0 }
const noTint = "transparent"

export interface PhotoAdjustBlockProps {
	className?: string
	/** false drops the card's surface and border — for a panel that already frames it. */
	framed?: boolean
	/**
	 * The photo being adjusted, as a URL. It is the block's input, not its copy,
	 * so it is the one piece of media a block takes as a prop. Omitted, or
	 * failing to load, the preview paints art seeded by the title.
	 */
	image?: string
	/** Called with the adjustments when the person saves. */
	onSave?: (edit: Record<Adjustment, number> & { tint: string }) => void
}

export function PhotoAdjustBlock({ className, framed = true, image, onSave }: PhotoAdjustBlockProps) {
	const [values, setValues] = useState(untouched)
	const [tint, setTint] = useState(noTint)
	const id = useId()
	const edited = tint !== noTint || adjustments.some((item) => values[item.id] !== 0)
	const set = (key: Adjustment) => (next: number) => setValues((current) => ({ ...current, [key]: next }))

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			<AspectBox
				ratio={4 / 3}
				style={{
					filter: `brightness(${1 + values.exposure / 200}) contrast(${1 + values.contrast / 200}) saturate(${1 + values.saturation / 100})`,
				}}
			>
				<MediaImage src={image} alt={photo.title} seed={photo.title} />
				{tint !== noTint ? (
					<div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ backgroundColor: tint }} />
				) : null}
			</AspectBox>
			<CardContent className="flex flex-col gap-1">
				{/* One drag per row: the slider. The field beside it takes typing and
				    arrow keys, and shows the exact value. */}
				{adjustments.map((item) => (
					<PropertyRow key={item.id} label={item.label} htmlFor={`${id}-${item.id}`}>
						<Slider
							aria-label={item.label}
							className="w-24"
							value={values[item.id]}
							min={-100}
							max={100}
							onValueChange={(next: number | number[]) => set(item.id)(Array.isArray(next) ? next[0] : next)}
						/>
						<ScrubField
							id={`${id}-${item.id}`}
							// The slider is "Exposure"; the field beside it is its exact value.
							label={`${item.label} value`}
							className="w-14"
							value={values[item.id]}
							min={-100}
							max={100}
							onValueChange={set(item.id)}
						/>
					</PropertyRow>
				))}
				<PropertyRow label="Tint">
					<ColorField label="Tint" value={tint} onValueChange={setTint} allowTransparent />
				</PropertyRow>
			</CardContent>
			{/* The controls first, then what to do with them: undo everything, or keep it. */}
			<CardFooter actions className="justify-end">
				<Button
					variant="outline"
					disabled={!edited}
					onClick={() => {
						setValues(untouched)
						setTint(noTint)
					}}
				>
					Reset
				</Button>
				<Button onClick={() => onSave?.({ ...values, tint })}>Save</Button>
			</CardFooter>
		</Card>
	)
}
