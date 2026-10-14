import { BADGE_TONES, Badge, GradientArt, PALETTE_COLORS, badgeMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** The tones that carry meaning; the palette families get their own section. */
const MEANING = BADGE_TONES.filter((tone) => !(PALETTE_COLORS as readonly string[]).includes(tone))

const LABEL: Partial<Record<(typeof BADGE_TONES)[number], string>> = {
	neutral: "Neutral",
	"1": "Tone 1",
	"2": "Tone 2",
	"3": "Tone 3",
	info: "Info",
	success: "Live",
	warning: "Pending",
	destructive: "Failed",
}

/** Sample categories for the palette families. */
const CATEGORY: Record<(typeof PALETTE_COLORS)[number], string> = {
	red: "Urgent",
	orange: "Marketing",
	yellow: "Review",
	green: "Finance",
	teal: "Research",
	blue: "Design",
	purple: "Launch",
	pink: "Community",
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
					code={`<Badge tone="1">New</Badge>                       {/* soft, the default */}
<Badge appearance="outline" tone="1">New</Badge>
<Badge appearance="solid" tone="1">New</Badge>`}
				>
					{(["soft", "outline", "solid"] as const).map((appearance) => (
						<div key={appearance} className="grid grid-cols-[--spacing(20)_1fr] items-center gap-3">
							<code className="text-mono-caption text-muted-foreground">{appearance}</code>
							<div className="flex flex-wrap gap-2">
								{MEANING.map((tone) => (
									<Badge key={tone} appearance={appearance} tone={tone}>
										{LABEL[tone]}
									</Badge>
								))}
							</div>
						</div>
					))}
				</Example>
			</Section>

			<Section
				title="Palette colours"
				description="For a category with no meaning attached (a tag, a label, a project colour), use a palette family as the tone. It paints from the theme's generated palette, so it leans toward the brand and reads in light and dark."
			>
				<Example
					className="flex-col items-stretch gap-3"
					code={`<Badge tone="blue">Design</Badge>
<Badge appearance="outline" tone="teal">Research</Badge>
<Badge appearance="solid" tone="purple">Launch</Badge>`}
				>
					{(["soft", "outline", "solid"] as const).map((appearance) => (
						<div key={appearance} className="grid grid-cols-[--spacing(20)_1fr] items-center gap-3">
							<code className="text-mono-caption text-muted-foreground">{appearance}</code>
							<div className="flex flex-wrap gap-2">
								{PALETTE_COLORS.map((color) => (
									<Badge key={color} appearance={appearance} tone={color}>
										{CATEGORY[color]}
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
<Badge appearance="overlay" tone="1">New</Badge>`}
				>
					{/* A stand-in for artwork: the theme's own tones, so it is busy in every preset. */}
					<GradientArt seed="On media" className="flex aspect-[4/3] w-64 items-end gap-1.5 rounded-lg p-3">
						<Badge appearance="overlay">3 images</Badge>
						<Badge appearance="overlay" tone="1">New</Badge>
					</GradientArt>
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

