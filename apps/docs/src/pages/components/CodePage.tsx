import { Code, codeMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function CodePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Code" lede={ledeFor(codeMeta)} />

			<Section
				title="Inline"
				description="Short commands and names set inside a sentence."
			>
				<Example>
					<p className="text-body-md text-foreground">
						Start the dev server with <Code>pnpm dev</Code>, then type-check
						using <Code>npx tsc</Code> before you open a PR.
					</p>
				</Example>
			</Section>

			<Section
				title="Keys & identifiers"
				description="Token names and config keys work the same way."
			>
				<Example>
					<p className="text-body-md text-foreground">
						The accent token is <Code>--tone-1</Code> and the path alias{" "}
						<Code>@/</Code> maps to <Code>./src/</Code>.
					</p>
				</Example>
			</Section>

			<MetaFooter meta={codeMeta} />
		</>
	)
}
