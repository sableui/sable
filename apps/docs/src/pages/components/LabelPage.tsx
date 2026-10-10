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
	<Input id="display-name" placeholder="satoshi" />
</Stack>`}
				>
					<Stack gap={1}>
						<Label htmlFor="display-name">Display name</Label>
						<Input id="display-name" placeholder="satoshi" />
					</Stack>
				</Example>
			</Section>

			<Section
				title="With a hint"
				description="A dotted underline marks a label that explains itself on hover or focus."
			>
				<Example
					code={`<Stack gap={1}>
	<Label htmlFor="royalty" hint="A percentage of every resale, paid to you.">Royalty</Label>
	<Input id="royalty" placeholder="5%" />
</Stack>`}
				>
					<Stack gap={1}>
						<Label htmlFor="royalty" hint="A percentage of every resale, paid to you.">
							Royalty
						</Label>
						<Input id="royalty" placeholder="5%" />
					</Stack>
				</Example>
			</Section>

			<Section
				title="Disabled"
				description="In a form, Field renders the label and dims it with its disabled control."
			>
				<Example
					code={`<Field label="Wallet address" disabled>
	<Input placeholder="Connect a wallet first" />
</Field>`}
				>
					<Field label="Wallet address" disabled>
						<Input placeholder="Connect a wallet first" />
					</Field>
				</Example>
			</Section>

			<MetaFooter meta={labelMeta} />
		</>
	)
}
