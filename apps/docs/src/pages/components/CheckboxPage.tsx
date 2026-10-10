import { Checkbox, CheckboxGroup, checkboxMeta, Field } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const CHANNELS = [
	{ value: "email", label: "Email" },
	{ value: "sms", label: "Text message" },
	{ value: "push", label: "Push notification" },
]

const SELECT_ALL_CODE = `const [channels, setChannels] = useState(["email"])

<CheckboxGroup
	allValues={["email", "sms", "push"]}
	value={channels}
	onValueChange={setChannels}
	className="gap-3"
>
	<Field label="All channels" orientation="horizontal">
		<Checkbox parent />
	</Field>
	<Field label="Email" orientation="horizontal" className="ps-7">
		<Checkbox value="email" />
	</Field>
	<Field label="Text message" orientation="horizontal" className="ps-7">
		<Checkbox value="sms" />
	</Field>
	<Field label="Push notification" orientation="horizontal" className="ps-7">
		<Checkbox value="push" />
	</Field>
</CheckboxGroup>`

function SelectAllDemo() {
	const [channels, setChannels] = useState<string[]>(["email"])
	return (
		<CheckboxGroup
			allValues={CHANNELS.map((c) => c.value)}
			value={channels}
			onValueChange={setChannels}
			className="gap-3"
		>
			<Field label="All channels" orientation="horizontal">
				<Checkbox parent />
			</Field>
			{/* Indented by the box plus Field's gap, so each child box sits under
			    the parent's label text. */}
			{CHANNELS.map((c) => (
				<Field
					key={c.value}
					label={c.label}
					orientation="horizontal"
					className="ps-7"
				>
					<Checkbox value={c.value} />
				</Field>
			))}
		</CheckboxGroup>
	)
}

export function CheckboxPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Checkbox"
				lede={ledeFor(checkboxMeta)}
			/>

			<Section title="States">
				<Example
					code={`<Checkbox />
<Checkbox defaultChecked />
<Checkbox indeterminate />
<Checkbox disabled />
<Checkbox defaultChecked disabled />`}
				>
					<Checkbox />
					<Checkbox defaultChecked />
					<Checkbox indeterminate />
					<Checkbox disabled />
					<Checkbox defaultChecked disabled />
				</Example>
			</Section>

			<Section
				title="With a label"
				description="The label is part of the click target."
			>
				<Example
					code={`<Field label="Remember this device" orientation="horizontal">
	<Checkbox defaultChecked />
</Field>
<Field label="Email me about new drops" orientation="horizontal">
	<Checkbox />
</Field>`}
				>
					<Field label="Remember this device" orientation="horizontal">
						<Checkbox defaultChecked />
					</Field>
					<Field label="Email me about new drops" orientation="horizontal">
						<Checkbox />
					</Field>
				</Example>
			</Section>

			<Section
				title="Select all"
				description="Put the boxes in a group and add a parent box on top. It checks or clears them all, and shows a dash when only some are on."
			>
				<Example code={SELECT_ALL_CODE}>
					<SelectAllDemo />
				</Example>
			</Section>

			<MetaFooter meta={checkboxMeta} />
		</>
	)
}
