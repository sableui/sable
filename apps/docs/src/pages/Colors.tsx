import { Grid, PALETTE_SCALES, PALETTE_STEPS, PALETTE_TONES, Stack } from "@sableui/react"
import { InlineCode, PageHeader, Section } from "../components/docs-ui"

const semantic = [
	{ name: "background", desc: "App canvas" },
	{ name: "foreground", desc: "Default text" },
	{ name: "card", desc: "Raised surface" },
	{ name: "muted", desc: "Subtle fill" },
	{ name: "muted-foreground", desc: "Secondary text" },
	{ name: "primary", desc: "High-emphasis action" },
	{ name: "secondary", desc: "Low-emphasis surface" },
	{ name: "accent", desc: "Hover / selected" },
	{ name: "destructive", desc: "Irreversible action" },
	{ name: "border", desc: "1px divider" },
	{ name: "ring", desc: "Focus ring" },
]

/** Neutral and the hue families: everything generated that is not a tone's own scale. */
const families = PALETTE_SCALES.filter((name) => !(PALETTE_TONES as readonly string[]).includes(name))
const hasScale = (token: string) => (PALETTE_TONES as readonly string[]).includes(token)

const tones = [
	{
		name: "tone-1",
		foreground: "tone-1-foreground",
		label: "Tone 1",
		desc: "Lead extra color",
	},
	{
		name: "tone-2",
		foreground: "tone-2-foreground",
		label: "Tone 2",
		desc: "Second extra color",
	},
	{
		name: "tone-3",
		foreground: "tone-3-foreground",
		label: "Tone 3",
		desc: "Third extra color",
	},
	{
		name: "tone-info",
		foreground: "tone-info-foreground",
		label: "Info",
		desc: "Informational state",
	},
	{
		name: "tone-warning",
		foreground: "tone-warning-foreground",
		label: "Warning",
		desc: "Cautionary state",
	},
	{
		name: "highlight",
		foreground: "highlight-foreground",
		label: "Highlight",
		desc: "Selection / emphasis",
	},
	{
		name: "success",
		foreground: "success-foreground",
		label: "Success",
		desc: "Positive feedback",
	},
	{
		name: "destructive",
		foreground: "destructive-foreground",
		label: "Destructive",
		desc: "Danger feedback",
	},
]

/** One generated scale, 50 → 950, as the active theme and mode paint it. */
function Scale({ name, labels = false }: { name: string; labels?: boolean }) {
	return (
		<Grid cols={11} gap={0.25}>
			{PALETTE_STEPS.map((step) => (
				<div key={step} className="flex min-w-0 flex-col gap-1">
					<div
						className="h-7 rounded-sm"
						style={{ background: `var(--${name}-${step})` }}
						title={`--${name}-${step}`}
					/>
					{labels ? <span className="text-mono-sm text-center text-muted-foreground">{step}</span> : null}
				</div>
			))}
		</Grid>
	)
}

function SemanticSwatch({ name, desc }: { name: string; desc: string }) {
	const isText = name.endsWith("foreground")
	const isLine = name === "border" || name === "ring"
	return (
		<div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-border py-3 last:border-0 sm:flex sm:gap-4">
			{isText ? (
				<div className="flex h-11 w-16 items-center justify-center rounded-md border border-border bg-card">
					<span className="text-title-sm" style={{ color: `var(--${name})` }}>
						Aa
					</span>
				</div>
			) : isLine ? (
				<div
					className="h-11 w-16 rounded-md bg-background"
					style={{ border: `2px solid var(--${name})` }}
				/>
			) : (
				<div
					className="h-11 w-16 rounded-md border border-border/50"
					style={{ background: `var(--${name})` }}
				/>
			)}
			<div className="min-w-0 flex-1">
				<p className="text-title-sm">{name}</p>
				<p className="text-body-sm text-muted-foreground">{desc}</p>
			</div>
			<InlineCode className="col-start-2 w-fit max-w-full truncate sm:col-auto sm:ml-auto sm:shrink-0">--{name}</InlineCode>
		</div>
	)
}

export function ColorsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Color"
				lede="Components never use a raw color. They use roles, like background or primary, and each theme decides what those roles look like."
			/>

			<Section
				title="Roles"
				description="Switch theme or mode and every role updates together."
			>
				<div className="rounded-xl border border-border px-5 py-2">
					{semantic.map((t) => (
						<SemanticSwatch key={t.name} name={t.name} desc={t.desc} />
					))}
				</div>
			</Section>

			<Section
				title="Tones"
				description="Three extra colors a theme defines for categories, badges and chart series, then the colors that carry meaning: status, feedback and highlight. Each comes with a 50–950 scale built around it, so bg-tone-1-100 is a wash of tone 1 and step 500 is the tone itself."
			>
				{/* Inherits from <html>, unscoped: re-declaring the preset here would
				    shadow the customizer's :root overrides and freeze the tones. */}
				<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={1.5}>
					{tones.map((t) => (
						<Stack key={t.name} gap={1}>
							<div
								className="flex min-h-36 flex-col justify-between rounded-xl border border-border/40 p-4"
								style={{
									background: `var(--${t.name})`,
									color: `var(--${t.foreground})`,
								}}
							>
								<div>
									<p className="text-title-sm">{t.label}</p>
									<p className="text-body-sm opacity-80">{t.desc}</p>
								</div>
								<p className="text-display-lg">Aa</p>
							</div>
							{hasScale(t.name) ? <Scale name={t.name} /> : null}
						</Stack>
					))}
				</Grid>
			</Section>

			<Section
				title="Palette"
				description="More color for tags, avatars, labels and illustration, generated from this theme. Each family keeps its own hue and leans a little toward the brand, so the whole set sits with it; neutral is the theme's own page and ink. Steps follow the mode: a low step is always near the page and a high one always far from it, so bg-blue-100 with text-blue-800 reads in light and dark alike."
			>
				<Stack gap={3}>
					{families.map((name) => (
						<Stack key={name} gap={1}>
							<p className="text-title-sm">{name}</p>
							<Scale name={name} labels />
						</Stack>
					))}
					<p className="text-body-sm text-muted-foreground">
						Use them as utilities (<InlineCode>bg-blue-100</InlineCode>, <InlineCode>text-pink-700</InlineCode>,{" "}
						<InlineCode>border-neutral-200</InlineCode>) or variables (<InlineCode>var(--teal-500)</InlineCode>). Surfaces, text and
						actions still take roles. A theme sets how far the families lean with <InlineCode>--theme-palette-harmony</InlineCode>: 0
						keeps their own hues, 1 is the default.
					</p>
				</Stack>
			</Section>
		</>
	)
}
