import {
	Field,
	Fieldset,
	FieldsetContent,
	FieldsetLegend,
	Radio,
	RadioGroup,
	radioMeta,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function RadioPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Radio" lede={ledeFor(radioMeta)} />

			<Section
				title="Basic"
				description="Pick exactly one from a short, visible set."
			>
				<Example
					code={`<Fieldset>
	<FieldsetLegend>Post type</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="standard">
			<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
			<Field label="Collectible" orientation="horizontal"><Radio value="collectible" /></Field>
			<Field label="Edition" orientation="horizontal"><Radio value="edition" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>`}
				>
					<Fieldset className="w-full max-w-xs">
						<FieldsetLegend>Post type</FieldsetLegend>
						<FieldsetContent>
							<RadioGroup defaultValue="standard">
								<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
								<Field label="Collectible" orientation="horizontal"><Radio value="collectible" /></Field>
								<Field label="Edition" orientation="horizontal"><Radio value="edition" /></Field>
							</RadioGroup>
						</FieldsetContent>
					</Fieldset>
				</Example>
			</Section>

			<Section
				title="Disabled"
				description="One option, or the whole group, can be turned off."
			>
				<Example
					code={`<Fieldset>
	<FieldsetLegend>Post type</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="standard">
			<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
			<Field label="Edition" orientation="horizontal" disabled><Radio value="edition" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>`}
				>
					<Fieldset className="w-full max-w-xs">
						<FieldsetLegend>Post type</FieldsetLegend>
						<FieldsetContent>
							<RadioGroup defaultValue="standard">
								<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
								<Field label="Edition" orientation="horizontal" disabled><Radio value="edition" /></Field>
							</RadioGroup>
						</FieldsetContent>
					</Fieldset>
				</Example>
			</Section>

			<Section
				title="With descriptions"
				description="The radio stays on the label's first line when the option carries more text."
			>
				<Example
					code={`<Fieldset>
	<FieldsetLegend>Visibility</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="public">
			<Field label="Public" description="Anyone with the link can view and collect." orientation="horizontal"><Radio value="public" /></Field>
			<Field label="Unlisted" description="Only people you share it with can find it." orientation="horizontal"><Radio value="unlisted" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>`}
				>
					<Fieldset className="w-full max-w-xs">
						<FieldsetLegend>Visibility</FieldsetLegend>
						<FieldsetContent>
							<RadioGroup defaultValue="public">
								<Field label="Public" description="Anyone with the link can view and collect." orientation="horizontal"><Radio value="public" /></Field>
								<Field label="Unlisted" description="Only people you share it with can find it." orientation="horizontal"><Radio value="unlisted" /></Field>
							</RadioGroup>
						</FieldsetContent>
					</Fieldset>
				</Example>
			</Section>

			<MetaFooter meta={radioMeta} />
		</>
	)
}
