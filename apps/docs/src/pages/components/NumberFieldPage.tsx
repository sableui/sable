import { Field, NumberField, numberFieldMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function NumberFieldPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Number Field"
				lede={ledeFor(numberFieldMeta)}
			/>

			<Section title="Default">
				<Example code="<NumberField defaultValue={1} min={0} max={99} />">
					<div className="w-full max-w-48">
						<NumberField defaultValue={1} min={0} max={99} />
					</div>
				</Example>
			</Section>

			<Section
				title="With a label"
				description="Inside a field, with a label and helper text."
			>
				<Example
					code={`<Field label="Quantity" description="How many seats to add.">
	<NumberField min={1} max={100} defaultValue={1} />
</Field>`}
				>
					<div className="w-full max-w-60">
						<Field label="Quantity" description="How many seats to add.">
							<NumberField min={1} max={100} defaultValue={1} />
						</Field>
					</div>
				</Example>
			</Section>

			<Section
				title="Step"
				description="Steps by 10. Hold Shift to jump by 100."
			>
				<Example code="<NumberField defaultValue={50} min={0} max={1000} step={10} largeStep={100} />">
					<div className="w-full max-w-48">
						<NumberField defaultValue={50} min={0} max={1000} step={10} largeStep={100} />
					</div>
				</Example>
			</Section>

			<Section
				title="Formatted"
				description="Shows currency, percent or units."
			>
				<Example code='<NumberField defaultValue={9.99} min={0} step={0.5} format={{ style: "currency", currency: "USD" }} />'>
					<div className="w-full max-w-48">
						<NumberField
							defaultValue={9.99}
							min={0}
							step={0.5}
							format={{ style: "currency", currency: "USD" }}
						/>
					</div>
				</Example>
			</Section>

			<Section title="Disabled">
				<Example code="<NumberField defaultValue={3} disabled />">
					<div className="w-full max-w-48">
						<NumberField defaultValue={3} disabled />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={numberFieldMeta} />
		</>
	)
}
