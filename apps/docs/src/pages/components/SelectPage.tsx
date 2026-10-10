import {
	Panel,
	PanelSection,
	PropertyRow,
	Select,
	SelectContent,
	SelectGroup,
	SelectGroupLabel,
	SelectItem,
	selectMeta,
	SelectTrigger,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function SelectPage() {
	const [font, setFont] = useState<string | null>(null)
	const [weight, setWeight] = useState<string | null>("regular")

	return (
		<>
			<PageHeader eyebrow="Components" title="Select" lede={ledeFor(selectMeta)} />

			<Section
				title="Basic"
				description="The trigger shows the chosen option. Typing jumps to a match."
			>
				<Example>
					<div className="w-[240px]">
						<Select value={font} onValueChange={setFont}>
							<SelectTrigger placeholder="Choose a font" />
							<SelectContent>
								<SelectItem value="sans">Sans-serif</SelectItem>
								<SelectItem value="serif">Serif</SelectItem>
								<SelectItem value="mono">Monospace</SelectItem>
								<SelectItem value="cursive">Cursive</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Extra small is the property-panel size, beside other small fields."
			>
				<Example
					code={`<Select>
  <SelectTrigger placeholder="Medium" />
  <SelectContent>…</SelectContent>
</Select>
<Panel label="Layer properties" width={240} scroll={false} data-density="compact" className="rounded-lg border border-border">
  <PanelSection title="Layer">
    <PropertyRow label="Blend">
      <Select>
        <SelectTrigger size="xs" placeholder="Normal" />
        <SelectContent>…</SelectContent>
      </Select>
    </PropertyRow>
  </PanelSection>
</Panel>`}
				>
					<div className="w-[240px]">
						<Select>
							<SelectTrigger placeholder="Medium" />
							<SelectContent>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="multiply">Multiply</SelectItem>
								<SelectItem value="screen">Screen</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{/* The xs rung is a property-grid field: it only reads right on the
					    panel surface it was drawn for, so it is shown in one. */}
					<Panel
						label="Layer properties"
						width={240}
						scroll={false}
						data-density="compact"
						className="rounded-lg border border-border"
					>
						<PanelSection title="Layer">
							<PropertyRow label="Blend">
								<Select>
									<SelectTrigger size="xs" placeholder="Normal" />
									<SelectContent>
										<SelectItem value="normal">Normal</SelectItem>
										<SelectItem value="multiply">Multiply</SelectItem>
										<SelectItem value="screen">Screen</SelectItem>
									</SelectContent>
								</Select>
							</PropertyRow>
						</PanelSection>
					</Panel>
				</Example>
			</Section>

			<Section
				title="Grouped, with a preselected value"
				description="Labels split long lists into sets. A check marks the current choice."
			>
				<Example>
					<div className="w-[240px]">
						<Select value={weight} onValueChange={setWeight}>
							<SelectTrigger placeholder="Pick a weight" />
							<SelectContent>
								<SelectGroup>
									<SelectGroupLabel>Text</SelectGroupLabel>
									<SelectItem value="regular">Regular</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
								</SelectGroup>
								<SelectGroup>
									<SelectGroupLabel>Display</SelectGroupLabel>
									<SelectItem value="semibold">Semibold</SelectItem>
									<SelectItem value="bold">Bold</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</Example>
			</Section>

			<Section
				title="Disabled"
				description="Turn off the whole select, or just single options."
			>
				<Example>
					<div className="flex w-full flex-wrap items-start gap-4">
						<div className="w-[240px]">
							<Select disabled>
								<SelectTrigger placeholder="Unavailable" />
								<SelectContent>
									<SelectItem value="a">Option A</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="w-[240px]">
							<Select>
								<SelectTrigger placeholder="Some disabled" />
								<SelectContent>
									<SelectItem value="open">Open</SelectItem>
									<SelectItem value="locked" disabled>
										Locked
									</SelectItem>
									<SelectItem value="archived">Archived</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={selectMeta} />
		</>
	)
}
