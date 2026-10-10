import { CodeBlock } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"
import { Markdown } from "../components/Markdown"
import NOTICES from "../generated/guides/credits.md?raw"
import LICENSE from "../generated/guides/license.md?raw"

export function CreditsPage() {
	return <>
		<PageHeader title="Credits and license" lede="The software and fonts used in Sable." />
		<Markdown source={NOTICES.replace(/^# .*\r?\n/, "")} />
		<Section title="Sable source license"><CodeBlock code={LICENSE} showCopy={false} /></Section>
	</>
}
