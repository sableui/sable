import { Field, Input, inputMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function InputPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Input" lede={ledeFor(inputMeta)} />

			<Section title="Default">
				<Example code='<Input placeholder="Search posts" />'>
					<Input placeholder="Search posts" className="max-w-xs" />
				</Example>
			</Section>

			<Section
				title="With a label"
				description="Always show a label. Placeholder text isn't one."
			>
				<Example code='<Field label="Email"><Input type="email" placeholder="you@example.com" /></Field>'>
					<div className="w-full max-w-xs">
						<Field label="Email">
							<Input type="email" placeholder="you@example.com" />
						</Field>
					</div>
				</Example>
			</Section>

			<Section title="Types">
				<Example
					code={`<Input type="search" placeholder="Search" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Amount" />`}
				>
					<div className="flex w-full max-w-xs flex-col gap-3">
						<Input type="search" placeholder="Search" />
						<Input type="email" placeholder="Email" />
						<Input type="password" placeholder="Password" />
						<Input type="number" placeholder="Amount" />
					</div>
				</Example>
			</Section>

			<Section
				title="States"
				description="Error, disabled and read-only."
			>
				<Example>
					<div className="flex w-full max-w-xs flex-col gap-3">
						<Input aria-invalid defaultValue="not-an-email" />
						<Input disabled placeholder="Disabled" />
						<Input readOnly defaultValue="Read only" />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={inputMeta} />
		</>
	)
}
