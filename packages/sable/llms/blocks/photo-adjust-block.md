# PhotoAdjustBlock

A photo with its adjustments under it: PropertyRows that pair a Slider with a ScrubField, a ColorField tint, and Reset and Save at the foot — all applied live to the preview.

**Intent:** Reach for this as the inspector of an image, video or canvas tool: a few numeric properties and a colour, changed while watching the result. A whole editor with layers and panels is the Workspace shell with PanelSections; a single percentage a reader sets once is a Slider.

**Block:** Media & files · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Every row is a PropertyRow, so the labels form one column and the controls another. Do not hand-lay a label and a field per property.
- Each adjustment has one drag, the Slider, and a ScrubField beside it for the exact value, typing and arrow keys. A row with no slider would make its name the drag handle instead (`scrub` on PropertyRow).
- The actions come after the controls, in the card's footer: Reset to undo every adjustment, Save as the primary. Two actions of one kind, so both are plain Buttons.
- Reset is disabled until something has changed, so it never looks like it did nothing.
- The tint starts transparent (`allowTransparent`): no tint is a value, not a missing one.

## Accessibility

- Each adjustment is a named slider and a labelled number input, so it can be set by dragging, arrow keys or typing.
- The photo's alt is its title. The tint overlay is decorative and hidden from assistive technology.

## Source

```tsx
"use client"

import { useState, useId } from "react"
import { AspectBox, Button, Card, CardContent, CardFooter, cn, ColorField, MediaImage, PropertyRow, ScrubField, Slider } from "@sableui/react"

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
```
