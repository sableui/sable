import {
	Button,
	Checkbox,
	Field,
	Form,
	formMeta,
	Input,
	Switch,
	Textarea,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function FormPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Form" lede={ledeFor(formMeta)} />

			<Section
				title="Field"
				description="A label, the control, and optional helper text."
			>
				<Example
					code={`<Field label="Email" description="We'll never share it." required><Input type="email" /></Field>`}
				>
					<div className="w-full max-w-sm">
						<Field label="Email" description="We'll never share it." required>
							<Input type="email" placeholder="you@example.com" />
						</Field>
					</div>
				</Example>
			</Section>

			<Section
				title="Error state"
				description="The message sits under the control, in red."
			>
				<Example code='<Field label="Password" error="Must be at least 8 characters."><Input type="password" /></Field>'>
					<div className="w-full max-w-sm">
						<Field label="Password" error="Must be at least 8 characters.">
							<Input type="password" defaultValue="short" />
						</Field>
					</div>
				</Example>
			</Section>

			<Section
				title="Checked on submit"
				description="Press Save with the field empty or too short. The form stops, the message appears under the field, and the cursor goes back to it. It clears as you fix it."
			>
				<Example
					code={`<Form onSubmit={handleSubmit}>
	<Field
		label="Handle"
		required
		validate={(value) =>
			String(value).length < 3 ? "At least 3 characters." : null
		}
	>
		<Input name="handle" />
	</Field>
	<Button type="submit">Claim handle</Button>
</Form>`}
				>
					<Form
						className="w-full max-w-sm gap-4"
						onSubmit={(event) => event.preventDefault()}
					>
						<Field
							label="Handle"
							required
							validate={(value) =>
								String(value).length < 3 ? "At least 3 characters." : null
							}
						>
							<Input name="handle" placeholder="ada" />
						</Field>
						<Button type="submit" className="self-start">
							Claim handle
						</Button>
					</Form>
				</Example>
			</Section>

			<Section
				title="Inline"
				description="For a single checkbox, switch or radio, the control sits before its label."
			>
				<Example>
					<div className="flex w-full max-w-sm flex-col gap-3">
						<Field label="Email me about new collectors" orientation="horizontal">
							<Checkbox />
						</Field>
						<Field label="Public profile" orientation="horizontal">
							<Switch defaultChecked />
						</Field>
					</div>
				</Example>
			</Section>

			<Section
				title="Full form"
				description="Fields stack with even spacing."
			>
				<Example>
					<Form
						className="w-full max-w-sm"
						onSubmit={(event) => event.preventDefault()}
					>
						<Field label="Display name" required>
							<Input name="displayName" placeholder="ada" />
						</Field>
						<Field label="Bio" description="Shown on your public profile.">
							<Textarea name="bio" rows={3} placeholder="Tell collectors who you are" />
						</Field>
						<Field label="Subscribe to the digest" orientation="horizontal">
							<Checkbox name="digest" />
						</Field>
						<Button type="submit" className="self-start">
							Save profile
						</Button>
					</Form>
				</Example>
			</Section>

			<MetaFooter meta={formMeta} />
		</>
	)
}
