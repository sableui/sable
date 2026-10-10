import { Markdown } from "../components/Markdown"
import { PageHeader } from "../components/docs-ui"
import UPDATES from "../generated/guides/changelog.md?raw"

export function WhatsNewPage() {
	return (
		<>
			<PageHeader title="What's new" lede="The latest additions to Sable's presets, components, and agent tools." />
			<Markdown source={UPDATES.replace(/^# .*\r?\n/, "")} />
		</>
	)
}
