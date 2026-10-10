import {
	Field,
	Slider,
	SliderControl,
	SliderIndicator,
	sliderMeta,
	SliderRoot,
	SliderThumb,
	SliderTrack,
	SliderValue,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

function RangeSlider() {
	const [range, setRange] = useState<number[]>([20, 60])
	return (
		<div className="w-full max-w-sm">
			<Slider value={range} onValueChange={(v) => setRange(v as number[])} aria-label="Price range" />
			<p className="text-mono-sm text-muted-foreground mt-3">
				[{range[0]}, {range[1]}]
			</p>
		</div>
	)
}

function ValueReadoutSlider() {
	return (
		<Field label="Brightness" className="w-full max-w-sm">
			<SliderRoot defaultValue={35} className="flex items-center gap-3">
				<SliderControl>
					<SliderTrack>
						<SliderIndicator />
						<SliderThumb />
					</SliderTrack>
				</SliderControl>
				<SliderValue className="text-mono-sm text-foreground" />
			</SliderRoot>
		</Field>
	)
}

export function SliderPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Slider" lede={ledeFor(sliderMeta)} />

			<Section
				title="Single value"
				description="Drag the thumb, click the track, or use the arrow keys."
			>
				<Example code='<Slider defaultValue={50} aria-label="Volume" />'>
					<div className="w-full max-w-sm">
						<Slider defaultValue={50} aria-label="Volume" />
					</div>
				</Example>
			</Section>

			<Section
				title="Range"
				description="Two thumbs pick a low and a high value."
			>
				<Example code={`const [range, setRange] = useState([20, 60])\n<Slider value={range} onValueChange={setRange} aria-label="Price range" />`}>
					<RangeSlider />
				</Example>
			</Section>

			<Section
				title="Stepped"
				description="The value snaps to set increments."
			>
				<Example code='<Slider defaultValue={40} min={0} max={100} step={10} aria-label="Stepped" />'>
					<div className="w-full max-w-sm">
						<Slider
							defaultValue={40}
							min={0}
							max={100}
							step={10}
							aria-label="Stepped"
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="Disabled"
				description="Dimmed and can't be moved."
			>
				<Example code='<Slider defaultValue={30} disabled aria-label="Disabled" />'>
					<div className="w-full max-w-sm">
						<Slider defaultValue={30} disabled aria-label="Disabled" />
					</div>
				</Example>
			</Section>

			<Section
				title="With a value readout"
				description="A field label above, and the live number beside the track."
			>
				<Example
					code={`<Field label="Brightness" className="w-full max-w-sm">
  <SliderRoot defaultValue={35} className="flex items-center gap-3">
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb />
      </SliderTrack>
    </SliderControl>
    <SliderValue className="text-mono-sm text-foreground" />
  </SliderRoot>
</Field>`}
				>
					<ValueReadoutSlider />
				</Example>
			</Section>

			<Section
				title="Vertical"
				description="Give it a height; the track runs bottom to top."
			>
				<Example code={`<div className="h-40">
  <Slider orientation="vertical" defaultValue={40} aria-label="Level" />
</div>`}>
					<div className="h-40">
						<Slider orientation="vertical" defaultValue={40} aria-label="Level" />
					</div>
				</Example>
			</Section>

			<Section
				title="The thumb at rest"
				description="The thumb stays small until you hover, focus or drag it, so a stack of sliders stays quiet."
			>
				<Example code='<Slider defaultValue={50} aria-label="Volume" />'>
					<div className="flex w-full max-w-sm flex-col gap-5">
						<Slider defaultValue={25} aria-label="Rest and hover A" />
						<Slider defaultValue={50} aria-label="Rest and hover B" />
						<Slider defaultValue={75} aria-label="Rest and hover C" />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={sliderMeta} />
		</>
	)
}
