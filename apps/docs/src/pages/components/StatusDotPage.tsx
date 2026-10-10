import { Badge, StatusDot, statusDotMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function StatusDotPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Status Dot"
				lede={ledeFor(statusDotMeta)}
			/>

			<ComponentPlayground meta={statusDotMeta} />

			<Section title="Tones">
				<Example>
					<div className="flex items-center gap-4">
						<StatusDot tone="neutral" />
						<StatusDot tone="standard" />
						<StatusDot tone="success" />
						<StatusDot tone="info" />
						<StatusDot tone="warning" />
						<StatusDot tone="edition" />
						<StatusDot tone="collectible" />
						<StatusDot tone="destructive" />
					</div>
				</Example>
			</Section>

			<Section title="Sizes">
				<Example>
					<div className="flex items-center gap-4">
						<StatusDot tone="standard" size="sm" />
						<StatusDot tone="standard" size="md" />
						<StatusDot tone="standard" size="lg" />
					</div>
				</Example>
			</Section>

			<Section
				title="Pulse"
				description="A soft ring that signals something live."
			>
				<Example>
					<div className="flex items-center gap-4">
						<StatusDot tone="standard" pulse />
						<StatusDot tone="info" pulse size="lg" />
						<StatusDot tone="destructive" pulse />
					</div>
				</Example>
			</Section>

			<Section
				title="With label"
				description="Always pair the dot with a word. A plain Badge with a dot does both."
			>
				<Example>
					<div className="flex flex-col gap-3">
						<Badge appearance="plain" tone="success" dot pulse>
							Online
						</Badge>
						<Badge appearance="plain" tone="warning" dot>
							Degraded
						</Badge>
						<Badge appearance="plain" tone="destructive" dot>
							Offline
						</Badge>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={statusDotMeta} />
		</>
	)
}
