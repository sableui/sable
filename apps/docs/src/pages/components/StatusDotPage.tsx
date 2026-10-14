import { Badge, PALETTE_COLORS, StatusDot, statusDotMeta } from "@sableui/react"
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
						<StatusDot tone="3" />
						<StatusDot tone="success" />
						<StatusDot tone="info" />
						<StatusDot tone="warning" />
						<StatusDot tone="1" />
						<StatusDot tone="2" />
						<StatusDot tone="destructive" />
					</div>
				</Example>
			</Section>

			<Section title="Palette colours" description="A palette family is a category colour, for a legend or a tag list. Pair each dot with its label.">
				<Example code={`<StatusDot tone="blue" /> <StatusDot tone="teal" /> …`}>
					<div className="flex items-center gap-4">
						{PALETTE_COLORS.map((color) => (
							<StatusDot key={color} tone={color} />
						))}
					</div>
				</Example>
			</Section>

			<Section title="Sizes">
				<Example>
					<div className="flex items-center gap-4">
						<StatusDot tone="3" size="sm" />
						<StatusDot tone="3" size="md" />
						<StatusDot tone="3" size="lg" />
					</div>
				</Example>
			</Section>

			<Section
				title="Pulse"
				description="A soft ring that signals something live."
			>
				<Example>
					<div className="flex items-center gap-4">
						<StatusDot tone="3" pulse />
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
