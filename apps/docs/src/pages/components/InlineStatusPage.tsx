import { InlineStatus, inlineStatusMeta, Spinner, Stack } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function InlineStatusPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Inline Status"
				lede={ledeFor(inlineStatusMeta)}
			/>

			<ComponentPlayground meta={inlineStatusMeta} />

			<Section
				title="Tones"
				description="The tone picks the icon and the text color."
			>
				<Example>
					<Stack gap={1.5}>
						<InlineStatus tone="neutral">Draft saved locally.</InlineStatus>
						<InlineStatus tone="info">Reports refresh every hour.</InlineStatus>
						<InlineStatus tone="success">Top-up confirmed.</InlineStatus>
						<InlineStatus tone="warning">Gas is elevated right now.</InlineStatus>
						<InlineStatus tone="destructive">Insufficient balance.</InlineStatus>
					</Stack>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Small sits under a control. Medium matches body text."
			>
				<Example>
					<Stack gap={1.5}>
						<InlineStatus tone="success" size="sm">
							Saved.
						</InlineStatus>
						<InlineStatus tone="success" size="md">
							Saved.
						</InlineStatus>
					</Stack>
				</Example>
			</Section>

			<Section
				title="Custom icon"
				description="A spinner in place of the icon reads as pending."
			>
				<Example code='<InlineStatus tone="neutral" icon={<Spinner size="sm" />}>Preparing transaction…</InlineStatus>'>
					<InlineStatus tone="neutral" icon={<Spinner size="sm" />}>
						Preparing transaction…
					</InlineStatus>
				</Example>
			</Section>

			<MetaFooter meta={inlineStatusMeta} />
		</>
	)
}
