import {
	Button,
	Icon,
	PanelSection,
	PropertyPair,
	PropertyRow,
	ScrubField,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	Slider,
	Switch,
	panelSectionMeta,
} from "@sableui/react"
import { useState } from "react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function PanelSectionDemo() {
	const [opacity, setOpacity] = useState(80)
	const [blur, setBlur] = useState(4)
	const [x, setX] = useState(120)
	const [y, setY] = useState(48)

	return (
		<div
			data-density="compact"
			className="w-64 overflow-hidden rounded-lg border border-border bg-panel"
		>
			{/* The frame's own border is the first section's top edge. */}
			<PanelSection
				title="Layer"
				className="border-t-0"
				action={
					<Button size="icon-xs" variant="ghost" aria-label="Add effect">
						<Icon name="plus" />
					</Button>
				}
			>
				<PropertyRow label="Visible">
					<Switch defaultChecked />
				</PropertyRow>
				<PropertyRow label="Blend">
					<Select defaultValue="normal">
						<SelectTrigger size="xs" className="w-28" />
						<SelectContent>
							<SelectItem value="normal">Normal</SelectItem>
							<SelectItem value="multiply">Multiply</SelectItem>
							<SelectItem value="screen">Screen</SelectItem>
						</SelectContent>
					</Select>
				</PropertyRow>
			</PanelSection>

			<PanelSection title="Appearance">
				<PropertyRow
					label="Opacity"
					htmlFor="panel-section-opacity"
					scrub={{ value: opacity, onValueChange: setOpacity, min: 0, max: 100 }}
				>
					<ScrubField
						id="panel-section-opacity"
						label="Opacity"
						value={opacity}
						onValueChange={setOpacity}
						min={0}
						max={100}
						suffix="%"
						className="w-20"
					/>
				</PropertyRow>
				<PropertyRow
					label="Blur"
					htmlFor="panel-section-blur"
					scrub={{ value: blur, onValueChange: setBlur, min: 0, max: 64 }}
				>
					<ScrubField
						id="panel-section-blur"
						label="Blur"
						value={blur}
						onValueChange={setBlur}
						min={0}
						max={64}
						suffix="px"
						className="w-20"
					/>
				</PropertyRow>
				<PropertyRow label="Grain" stacked>
					<Slider defaultValue={30} aria-label="Grain" />
				</PropertyRow>
			</PanelSection>

			<PanelSection title="Position">
				<PropertyPair>
					<ScrubField label="X" prefix="X" value={x} onValueChange={setX} />
					<ScrubField label="Y" prefix="Y" value={y} onValueChange={setY} />
				</PropertyPair>
			</PanelSection>
		</div>
	)
}

export function PanelSectionPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Panel Section" lede={ledeFor(panelSectionMeta)} />

			<Section
				title="Live preview"
				description="Sections split by a hairline and nothing else. Drag a property name, or the X and Y handles, to scrub the value."
			>
				<PanelSectionDemo />
			</Section>

			<MetaFooter meta={panelSectionMeta} />
		</>
	)
}
