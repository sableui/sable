import { Field, Input, Label, labelMeta, Stack } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function LabelPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Label" lede={ledeFor(labelMeta)} />

			<ComponentPlayground meta={labelMeta} />

			<Section
				title="With a control"
				description="A label always points at a control. Clicking it focuses the field."
			>
				<Example
					code={`<Stack gap={1}>
	<Label htmlFor="display-name">Display name</Label>
	<Input id="display-name" placeholder="sam" />
</Stack>`}
				>
					<Stack gap={1}>
						<Label htmlFor="display-name">Display name</Label>
						<Input id="display-name" placeholder="sam" />
					</Stack>
				</Example>
			</Section>

			<Section
				title="With a hint"
				description="A dotted underline marks a label that explains itself on hover or focus."
			>
				<Example
					code={`<Stack gap={1}>
	<Label htmlFor="discount" hint="Taken off every order this code is used on.">Discount</Label>
	<Input id="discount" placeholder="10%" />
</Stack>`}
				>
					<Stack gap={1}>
						<Label htmlFor="discount" hint="Taken off every order this code is used on.">
							Discount
						</Label>
						<Input id="discount" placeholder="10%" />
					</Stack>
				</Example>
			</Section>

			<Section
				title="Disabled"
				description="In a form, Field renders the label and dims it with its disabled control."
			>
				<Example
					code={`<Field label="Billing email" disabled>
	<Input placeholder="Add a payment method first" />
</Field>`}
				>
					<Field label="Billing email" disabled>
						<Input placeholder="Add a payment method first" />
					</Field>
				</Example>
			</Section>

			<MetaFooter meta={labelMeta} />
		</>
	)
}
