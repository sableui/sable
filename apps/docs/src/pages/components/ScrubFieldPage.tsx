import {
	Panel,
	PanelSection,
	PropertyPair,
	PropertyRow,
	ScrubField,
	scrubFieldMeta,
} from "@sableui/react"
import { useState } from "react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function ScrubFieldDemo() {
	const [size, setSize] = useState(32)
	const [displacement, setDisplacement] = useState(60)
	const [x, setX] = useState(4)
	const [y, setY] = useState(0)
	const [scrubbing, setScrubbing] = useState(false)

	return (
		<div className="flex flex-col gap-3">
			<Panel
				label="Block displacement properties"
				width={260}
				scroll={false}
				data-density="compact"
				className="sable-frame sable-frame-tool overflow-hidden"
			>
				<PanelSection title="Block displacement" className="border-t-0">
					{/* No glyph fits "block size", so the property name is the handle. */}
					<PropertyRow
						label="Block size"
						scrub={{
							value: size,
							onValueChange: setSize,
							min: 2,
							max: 256,
							onGestureStart: () => setScrubbing(true),
							onGestureEnd: () => setScrubbing(false),
						}}
					>
						<ScrubField
							label="Block size"
							value={size}
							onValueChange={setSize}
							min={2}
							max={256}
							suffix="px"
							onGestureStart={() => setScrubbing(true)}
							onGestureEnd={() => setScrubbing(false)}
						/>
					</PropertyRow>
					<PropertyRow
						label="Displacement"
						scrub={{
							value: displacement,
							onValueChange: setDisplacement,
							min: 0,
							max: 400,
							onGestureStart: () => setScrubbing(true),
							onGestureEnd: () => setScrubbing(false),
						}}
					>
						<ScrubField
							label="Displacement"
							value={displacement}
							onValueChange={setDisplacement}
							min={0}
							max={400}
							suffix="px"
							onGestureStart={() => setScrubbing(true)}
							onGestureEnd={() => setScrubbing(false)}
						/>
					</PropertyRow>
					<PropertyPair labels={["Offset X", "Offset Y"]}>
						<ScrubField
							label="Offset X"
							prefix="X"
							value={x}
							onValueChange={setX}
							min={-64}
							max={64}
							onGestureStart={() => setScrubbing(true)}
							onGestureEnd={() => setScrubbing(false)}
						/>
						<ScrubField
							label="Offset Y"
							prefix="Y"
							value={y}
							onValueChange={setY}
							min={-64}
							max={64}
							onGestureStart={() => setScrubbing(true)}
							onGestureEnd={() => setScrubbing(false)}
						/>
					</PropertyPair>
				</PanelSection>
			</Panel>
			<p className="text-body-sm text-muted-foreground">
				{scrubbing ? "Scrubbing" : "Idle"}
			</p>
		</div>
	)
}

export function ScrubFieldPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Scrub Field" lede={ledeFor(scrubFieldMeta)} />

			<Section
				title="Live preview"
				description="Drag the label or prefix to scrub, or click the number and type."
			>
				<ScrubFieldDemo />
			</Section>

			<MetaFooter meta={scrubFieldMeta} />
		</>
	)
}
