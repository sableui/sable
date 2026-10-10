import { Field, Switch, switchMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function SwitchPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Switch" lede={ledeFor(switchMeta)} />

			<Section title="States" description="Off, on and disabled.">
				<Example
					code={`<Switch aria-label="Off" />
<Switch defaultChecked aria-label="On" />
<Switch disabled aria-label="Disabled off" />
<Switch disabled defaultChecked aria-label="Disabled on" />`}
				>
					<Switch aria-label="Off" />
					<Switch defaultChecked aria-label="On" />
					<Switch disabled aria-label="Disabled off" />
					<Switch disabled defaultChecked aria-label="Disabled on" />
				</Example>
			</Section>

			<Section
				title="With a label"
				description="Every switch needs a label that names what it turns on."
			>
				<Example
					code={`<Field label="Reduce motion" orientation="horizontal">
	<Switch defaultChecked />
</Field>`}
				>
					<Field label="Reduce motion" orientation="horizontal">
						<Switch defaultChecked />
					</Field>
				</Example>
			</Section>

			<MetaFooter meta={switchMeta} />
		</>
	)
}
