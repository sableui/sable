import {
	Button,
	Checkbox,
	Field,
	Fieldset,
	FieldsetContent,
	FieldsetDescription,
	FieldsetFooter,
	FieldsetLegend,
	fieldsetMeta,
	Radio,
	RadioGroup,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function FieldsetPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Fieldset"
				lede={ledeFor(fieldsetMeta)}
			/>

			<Section
				title="A grouped question"
				description="The legend names one question; every control in the group answers it. Screen readers read the legend before each one."
			>
				<Example>
					<Fieldset className="w-full max-w-md">
						<FieldsetLegend>Notify me about</FieldsetLegend>
						<FieldsetDescription>Pick what reaches your inbox.</FieldsetDescription>
						<FieldsetContent>
							<Field label="Mentions" orientation="horizontal">
								<Checkbox defaultChecked />
							</Field>
							<Field label="Replies" orientation="horizontal">
								<Checkbox />
							</Field>
							<Field label="Direct messages" orientation="horizontal">
								<Checkbox />
							</Field>
						</FieldsetContent>
						<FieldsetFooter>
							<Button variant="ghost">Cancel</Button>
							<Button>Save preferences</Button>
						</FieldsetFooter>
					</Fieldset>
				</Example>
			</Section>

			<Section
				title="Disabled group"
				description="The whole panel dims and every control inside turns off at once."
			>
				<Example
					code={`<Fieldset disabled>
	<FieldsetLegend>Payout schedule</FieldsetLegend>
	<FieldsetDescription>Connect a wallet to change when you are paid.</FieldsetDescription>
	<FieldsetContent>
		<RadioGroup defaultValue="weekly">
			<Field label="Weekly" orientation="horizontal"><Radio value="weekly" /></Field>
			<Field label="Monthly" orientation="horizontal"><Radio value="monthly" /></Field>
		</RadioGroup>
	</FieldsetContent>
	<FieldsetFooter>
		<Button>Update</Button>
	</FieldsetFooter>
</Fieldset>`}
				>
					<Fieldset disabled className="w-full max-w-md">
						<FieldsetLegend>Payout schedule</FieldsetLegend>
						<FieldsetDescription>Connect a wallet to change when you are paid.</FieldsetDescription>
						<FieldsetContent>
							<RadioGroup defaultValue="weekly">
								<Field label="Weekly" orientation="horizontal"><Radio value="weekly" /></Field>
								<Field label="Monthly" orientation="horizontal"><Radio value="monthly" /></Field>
							</RadioGroup>
						</FieldsetContent>
						<FieldsetFooter>
							<Button>Update</Button>
						</FieldsetFooter>
					</Fieldset>
				</Example>
			</Section>

			<Section
				title="Without a footer"
				description="The footer is optional; the body then closes with the same inset the legend opens with."
			>
				<Example>
					<Fieldset className="w-full max-w-md">
						<FieldsetLegend>Digest frequency</FieldsetLegend>
						<FieldsetContent>
							<RadioGroup defaultValue="weekly">
								<Field label="Daily" orientation="horizontal"><Radio value="daily" /></Field>
								<Field label="Weekly" orientation="horizontal"><Radio value="weekly" /></Field>
								<Field label="Never" orientation="horizontal"><Radio value="never" /></Field>
							</RadioGroup>
						</FieldsetContent>
					</Fieldset>
				</Example>
			</Section>

			<MetaFooter meta={fieldsetMeta} />
		</>
	)
}
