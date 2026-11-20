import {
	Panel,
	PanelSection,
	PropertyRow,
	ScrubField,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	Slider,
	SliderField,
	sliderFieldMeta,
} from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function InspectorDemo() {
	const [strength, setStrength] = useState(3)
	const [falloff, setFalloff] = useState(1)
	const [opacity, setOpacity] = useState(100)
	const [commits, setCommits] = useState(0)
	const commit = () => setCommits((n) => n + 1)

	return (
		<div className="flex flex-col gap-3">
			<Panel
				label="Chromatic aberration properties"
				width={260}
				scroll={false}
				data-density="compact"
				className="sable-frame sable-frame-tool overflow-hidden"
			>
				<PanelSection title="Parameters" className="border-t-0">
					<PropertyRow label="Strength">
						<SliderField
							size="xs"
							className="w-36"
							label="Strength"
							suffix="px"
							value={strength}
							min={0}
							max={20}
							onValueChange={setStrength}
							onValueCommitted={commit}
						/>
					</PropertyRow>
					<PropertyRow label="Falloff">
						<SliderField
							size="xs"
							className="w-36"
							label="Falloff"
							value={falloff}
							min={0}
							max={2}
							step={0.1}
							onValueChange={setFalloff}
							onValueCommitted={commit}
						/>
					</PropertyRow>
					<PropertyRow label="Opacity">
						<SliderField
							size="xs"
							className="w-36"
							label="Opacity"
							suffix="%"
							value={opacity}
							onValueChange={setOpacity}
							onValueCommitted={commit}
						/>
					</PropertyRow>
					<PropertyRow label="Blend">
						<Select defaultValue="normal">
							<SelectTrigger size="xs" className="w-36" />
							<SelectContent>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="multiply">Multiply</SelectItem>
							</SelectContent>
						</Select>
					</PropertyRow>
				</PanelSection>
			</Panel>
			<p className="text-body-sm text-muted-foreground">Undo entries recorded: {commits}</p>
		</div>
	)
}

function PairComparison() {
	const [a, setA] = useState(32)
	const [b, setB] = useState(32)
	return (
		<Panel
			label="Block size, two ways"
			width={260}
			scroll={false}
			data-density="compact"
			className="sable-frame sable-frame-tool overflow-hidden"
		>
			<PanelSection title="One control" className="border-t-0">
				<PropertyRow label="Block size">
					<SliderField size="xs" label="Block size" suffix="px" value={a} min={4} max={256} onValueChange={setA} className="w-36" />
				</PropertyRow>
			</PanelSection>
			<PanelSection title="Slider and field">
				<PropertyRow label="Block size">
					<div className="flex w-36 items-center gap-2">
						<Slider value={b} min={4} max={256} onValueChange={setB} aria-label="Block size" className="min-w-0 flex-1" />
						<ScrubField label="Block size" value={b} min={4} max={256} suffix="px" className="w-16 shrink-0" onValueChange={setB} />
					</div>
				</PropertyRow>
			</PanelSection>
		</Panel>
	)
}

export function SliderFieldPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Slider Field" lede={ledeFor(sliderFieldMeta)} />

			<Section
				title="In an inspector"
				description="Press anywhere on a field and drag. Double-click it, or focus it and press Enter or a digit, to type an exact value; Escape puts back what was there."
			>
				<InspectorDemo />
			</Section>

			<Section
				title="Against the pair it replaces"
				description="The same number in the same row width. The pair gives the drag a 6px rail and the value a second control; the field gives both the whole row."
			>
				<PairComparison />
			</Section>

			<Section
				title="Sizes"
				description="The field ladder: md in a form, sm in a toolbar, xs in a property grid. A prefix names the value where no label sits beside it."
			>
				<Example code='<SliderField size="sm" label="Opacity" prefix="Opacity" suffix="%" defaultValue={80} className="w-44" />'>
					<div className="flex w-full max-w-sm flex-col gap-3">
						<SliderField label="Opacity" prefix="Opacity" suffix="%" defaultValue={80} />
						<SliderField size="sm" label="Opacity" prefix="Opacity" suffix="%" defaultValue={80} />
						<SliderField size="xs" label="Opacity" prefix="Opacity" suffix="%" defaultValue={80} />
					</div>
				</Example>
			</Section>

			<Section title="At the ends" description="The grip always rides inside the fill. At the minimum a short stub of fill is left to hold it, so an empty field still shows where to take hold.">
				<Example code='<SliderField label="Noise" defaultValue={0} />'>
					<div className="flex w-full max-w-sm flex-col gap-3">
						<SliderField label="Noise" defaultValue={0} />
						<SliderField label="Detail" defaultValue={100} />
						<SliderField label="Locked" defaultValue={40} disabled />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={sliderFieldMeta} />
		</>
	)
}
