import { BADGE_TONES, Badge, badgeMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const LABEL: Record<(typeof BADGE_TONES)[number], string> = {
	neutral: "Neutral",
	standard: "Standard",
	collectible: "Collectible",
	edition: "Edition",
	info: "Info",
	success: "Live",
	warning: "Pending",
	destructive: "Failed",
}

export function BadgePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Badge" lede={ledeFor(badgeMeta)} />

			<ComponentPlayground meta={badgeMeta} />

			<Section
				title="Appearance × tone"
				description="Two separate choices. Appearance is how loud it is; tone is what it means. Every appearance takes every tone."
			>
				<Example
					className="flex-col items-stretch gap-3"
					code={`<Badge tone="edition">Edition</Badge>                       {/* soft, the default */}
<Badge appearance="outline" tone="edition">Edition</Badge>
<Badge appearance="solid" tone="edition">Edition</Badge>`}
				>
					{(["soft", "outline", "solid"] as const).map((appearance) => (
						<div key={appearance} className="grid grid-cols-[--spacing(20)_1fr] items-center gap-3">
							<code className="text-mono-caption text-muted-foreground">{appearance}</code>
							<div className="flex flex-wrap gap-2">
								{BADGE_TONES.map((tone) => (
									<Badge key={tone} appearance={appearance} tone={tone}>
										{LABEL[tone]}
									</Badge>
								))}
							</div>
						</div>
					))}
				</Example>
			</Section>

			<Section title="On media" description="appearance=&quot;overlay&quot; stays legible over any image: a dark scrim, or the solid tone.">
				<Example
					code={`<Badge appearance="overlay">3 images</Badge>
<Badge appearance="overlay" tone="edition">Edition</Badge>`}
				>
					{/* A stand-in for artwork: the theme's own tones, so it is busy in every preset. */}
					<div
						className="relative flex aspect-[4/3] w-64 items-end gap-1.5 overflow-hidden rounded-lg p-3"
						style={{ background: "linear-gradient(135deg, var(--tone-info), var(--tone-standard) 55%, var(--tone-warning))" }}
					>
						<Badge appearance="overlay">3 images</Badge>
						<Badge appearance="overlay" tone="edition">Edition</Badge>
					</div>
				</Example>
			</Section>

			<Section title="Status" description="appearance=&quot;plain&quot; with dot is a status line. pulse marks something in progress.">
				<Example
					code={`<Badge appearance="plain" tone="success" dot>Ready</Badge>
<Badge appearance="plain" tone="warning" dot pulse>Building</Badge>
<Badge appearance="plain" dot>Queued</Badge>
<Badge appearance="plain" tone="destructive" dot>Failed</Badge>`}
				>
					<Badge appearance="plain" tone="success" dot>Ready</Badge>
					<Badge appearance="plain" tone="warning" dot pulse>Building</Badge>
					<Badge appearance="plain" dot>Queued</Badge>
					<Badge appearance="plain" tone="destructive" dot>Failed</Badge>
				</Example>
			</Section>

			<Section title="Sizes">
				<Example
					code={`<Badge size="sm">Small</Badge>
<Badge>Medium</Badge>`}
				>
					<Badge size="sm">Small</Badge>
					<Badge>Medium</Badge>
				</Example>
			</Section>

			<MetaFooter meta={badgeMeta} />
		</>
	)
}

