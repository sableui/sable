import { Button, Field, Icon, Input, InputGroup, Stack, inputGroupMeta, useCopy } from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const SAMPLE_KEY = "sk_test_51Hx9Lq2eZvKYlo2C"

export function InputGroupPage() {
	const { copy, copied } = useCopy(SAMPLE_KEY)
	const [shown, setShown] = useState(false)

	return (
		<>
			<PageHeader eyebrow="Components" title="Input Group" lede={ledeFor(inputGroupMeta)} />

			<ComponentPlayground meta={inputGroupMeta} />

			<Section
				title="Prefix and suffix"
				description="Fixed text inside the field, in the field's own type, so the reader types only the part that changes."
			>
				<Example
					code={'<Field label="Website">\n\t<InputGroup leading="https://" trailing=".com">\n\t\t<Input placeholder="example" />\n\t</InputGroup>\n</Field>'}
				>
					<Stack gap={4} className="w-full max-w-sm">
						<Field label="Website">
							<InputGroup leading="https://" trailing=".com">
								<Input placeholder="example" />
							</InputGroup>
						</Field>
						<Field label="Price (USD)">
							<InputGroup leading="$" trailing="USD">
								<Input inputMode="decimal" placeholder="0.00" />
							</InputGroup>
						</Field>
					</Stack>
				</Example>
			</Section>

			<Section title="Icon" description="An icon that says what the field holds, before the text.">
				<Example
					code={'<Field label="Email">\n\t<InputGroup leading={<Icon name="mail" />}>\n\t\t<Input type="email" placeholder="you@example.com" />\n\t</InputGroup>\n</Field>'}
				>
					<Field label="Email" className="w-full max-w-sm">
						<InputGroup leading={<Icon name="mail" />}>
							<Input type="email" placeholder="you@example.com" />
						</InputGroup>
					</Field>
				</Example>
			</Section>

			<Section
				title="Button"
				description="A small action on the value itself. A borderless Button lines its glyph up with the text inset."
			>
				<Example
					code={
						'<Field label="API key">\n\t<InputGroup\n\t\ttrailing={\n\t\t\t<Button variant="ghost" size="icon-sm" aria-label="Copy key" onClick={copy}>\n\t\t\t\t<Icon name={copied ? "check" : "copy"} />\n\t\t\t</Button>\n\t\t}\n\t>\n\t\t<Input readOnly value={key} />\n\t</InputGroup>\n</Field>'
					}
				>
					<Stack gap={4} className="w-full max-w-sm">
						<Field label="API key">
							<InputGroup
								trailing={
									<Button variant="ghost" size="icon-sm" aria-label="Copy key" onClick={copy}>
										<Icon name={copied ? "check" : "copy"} />
									</Button>
								}
							>
								<Input readOnly value={SAMPLE_KEY} />
							</InputGroup>
						</Field>
						<Field label="Password">
							<InputGroup
								trailing={
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={shown ? "Hide password" : "Show password"}
										aria-pressed={shown}
										onClick={() => setShown(!shown)}
									>
										<Icon name={shown ? "eye-off" : "eye"} />
									</Button>
								}
							>
								<Input type={shown ? "text" : "password"} autoComplete="new-password" defaultValue="correct horse" />
							</InputGroup>
						</Field>
					</Stack>
				</Example>
			</Section>

			<Section title="With an error" description="The field's error reaches the input; the whole group takes the error edge.">
				<Example
					code={'<Field label="Website" error="Enter a domain, like example.">\n\t<InputGroup leading="https://" trailing=".com">\n\t\t<Input />\n\t</InputGroup>\n</Field>'}
				>
					<Field label="Website" error="Enter a domain, like example." className="w-full max-w-sm">
						<InputGroup leading="https://" trailing=".com">
							<Input />
						</InputGroup>
					</Field>
				</Example>
			</Section>

			<MetaFooter meta={inputGroupMeta} />
		</>
	)
}
