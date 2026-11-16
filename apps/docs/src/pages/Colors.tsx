import {
	APP_SHELL_TOKENS,
	CHART_TOKENS,
	DERIVED_EDGE_TOKENS,
	FIELD_TOKENS,
	Grid,
	MARK_TOKENS,
	PALETTE_SCALES,
	PALETTE_STEPS,
	PALETTE_TONES,
	SEMANTIC_TOKENS,
	Stack,
	WORKSPACE_SURFACE_TOKENS,
} from "@sableui/react"
import { tokenDoc } from "@sableui/react/themes"
import { InlineCode, PageHeader, Section } from "../components/docs-ui"

/** Neutral and the hue families: everything generated that is not a tone's own scale. */
const families = PALETTE_SCALES.filter((name) => !(PALETTE_TONES as readonly string[]).includes(name))
const hasScale = (token: string) => (PALETTE_TONES as readonly string[]).includes(token)

const tones = [
	{ name: "tone-1", foreground: "tone-1-foreground", label: "Tone 1", desc: "Lead extra color" },
	{ name: "tone-2", foreground: "tone-2-foreground", label: "Tone 2", desc: "Second extra color" },
	{ name: "tone-3", foreground: "tone-3-foreground", label: "Tone 3", desc: "Third extra color" },
	{ name: "tone-info", foreground: "tone-info-foreground", label: "Info", desc: "Informational state" },
	{ name: "tone-warning", foreground: "tone-warning-foreground", label: "Warning", desc: "Cautionary state" },
	{ name: "highlight", foreground: "highlight-foreground", label: "Highlight", desc: "Selection / emphasis" },
	{ name: "success", foreground: "success-foreground", label: "Success", desc: "Positive feedback" },
	{ name: "destructive", foreground: "destructive-foreground", label: "Destructive", desc: "Danger feedback" },
]
/** The fills and inks the Tones section shows, so the role groups skip them. */
const shownAsTone = new Set(tones.flatMap((t) => [t.name, t.foreground]))

/**
 * Every colour role in the contract, grouped. The list is the contract itself
 * (SEMANTIC_TOKENS plus the derived groups), and anything a group does not
 * claim lands in "Other" — so a token added to the contract shows up here
 * without anyone remembering this page.
 */
const allRoles = [
	...SEMANTIC_TOKENS,
	...DERIVED_EDGE_TOKENS,
	...FIELD_TOKENS,
	...MARK_TOKENS,
	...WORKSPACE_SURFACE_TOKENS,
	...APP_SHELL_TOKENS,
].filter((token) => !shownAsTone.has(token))

const groups: { title: string; description: string; match: (token: string) => boolean }[] = [
	{
		title: "Page and surfaces",
		description: "The surface stack, bottom to top, each with its ink: background < card < popover in every dark mode.",
		match: (t) => /^(background|foreground|card|popover|muted)(-foreground)?$/.test(t),
	},
	{
		title: "Edges and focus",
		description: "Hairlines for chrome, a stronger rule for structure, the floating edge for popups, control outlines and the focus ring.",
		match: (t) => /^(border|border-strong|border-floating|input|control-border|ring)$/.test(t),
	},
	{
		title: "Actions",
		description: "Primary for the one main action, secondary for the rest, accent for hover and selected rows.",
		match: (t) => /^(primary|secondary|accent)(-foreground)?$/.test(t),
	},
	{
		title: "Status on a surface",
		description: "A status colour as text, icon, border or ring on a page or card. text-destructive reads these; bg-destructive keeps the fill.",
		match: (t) => t.endsWith("-text"),
	},
	{
		title: "Marks",
		description: "A status or tone at graphic strength, for meters, bars, dots and soft tints that carry no text. Held to 2:1 on the page, not a text ratio.",
		match: (t) => t.endsWith("-mark"),
	},
	{
		title: "Fields and overlay",
		description: "The text-field surface and its outline, and the fixed dark surface for scrims, letterboxing and pills on imagery.",
		match: (t) => /^(field|field-border|overlay|overlay-foreground)$/.test(t),
	},
	{
		title: "Sidebar",
		description: "The app rail, tuned separately so it can sit a step off the page.",
		match: (t) => t.startsWith("sidebar"),
	},
	{
		title: "Workspace",
		description: "The tool register's surfaces, derived from each theme's own tokens: the work canvas, docked panels and the hairlines between them.",
		match: (t) => /^(canvas|panel|hairline|shell-ground)/.test(t),
	},
]

const grouped = (() => {
	const claimed = new Set<string>()
	const out = groups.map((group) => {
		const tokens = allRoles.filter((t) => !claimed.has(t) && group.match(t))
		for (const t of tokens) claimed.add(t)
		return { ...group, tokens }
	})
	const rest = allRoles.filter((t) => !claimed.has(t))
	if (rest.length) out.push({ title: "Other", description: "Roles no group above claims yet.", match: () => true, tokens: rest })
	return out
})()

const LINES = /^(border|border-strong|border-floating|input|control-border|ring|field-border|sidebar-border|sidebar-ring|hairline|hairline-strong)$/

/** One generated scale, 50 → 950, as the active theme and mode paint it. */
function Scale({ name, labels = false }: { name: string; labels?: boolean }) {
	return (
		<Grid cols={11} gap={0.25}>
			{PALETTE_STEPS.map((step) => (
				<div key={step} className="flex min-w-0 flex-col gap-1">
					<div className="h-7 rounded-sm" style={{ background: `var(--${name}-${step})` }} title={`--${name}-${step}`} />
					{labels ? <span className="text-mono-sm text-center text-muted-foreground">{step}</span> : null}
				</div>
			))}
		</Grid>
	)
}

/** The swatch shows the token doing its job: ink on the surface it pairs with, a line as a line. */
function Swatch({ name, pairsWith }: { name: string; pairsWith?: string[] }) {
	const isInk = name === "foreground" || name.endsWith("-foreground") || name.endsWith("-text")
	if (isInk) {
		const surface = pairsWith?.[0] ?? "background"
		return (
			<div
				className="flex h-11 w-16 items-center justify-center rounded-md border border-border"
				style={{ background: `var(--${surface})` }}
			>
				<span className="text-title-sm" style={{ color: `var(--${name})` }}>
					Aa
				</span>
			</div>
		)
	}
	if (LINES.test(name)) {
		return <div className="h-11 w-16 rounded-md bg-background" style={{ border: `2px solid var(--${name})` }} />
	}
	if (name.endsWith("-mark")) {
		return (
			<div className="flex h-11 w-16 items-center justify-center rounded-md border border-border bg-card">
				<div className="h-2 w-10 rounded-full" style={{ background: `var(--${name})` }} />
			</div>
		)
	}
	return <div className="h-11 w-16 rounded-md border border-border" style={{ background: `var(--${name})` }} />
}

/** Token-doc prose marks names with backticks; render those as code. */
function Prose({ text }: { text: string }) {
	return (
		<>
			{text.split("`").map((part, i) => (i % 2 ? <InlineCode key={i}>{part}</InlineCode> : part))}
		</>
	)
}

function RoleRow({ name }: { name: string }) {
	const doc = tokenDoc(name)
	return (
		<div className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-4 gap-y-1 border-b border-border py-3 last:border-0">
			<Swatch name={name} pairsWith={doc?.pairsWith} />
			<div className="flex min-w-0 flex-col gap-1">
				<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<p className="text-title-sm">{name}</p>
					<InlineCode className="w-fit max-w-full truncate">--{name}</InlineCode>
				</div>
				{doc ? (
					<p className="text-body-sm text-muted-foreground">
						<Prose text={doc.intent} />
					</p>
				) : null}
				{doc?.pairsWith?.length ? (
					<p className="text-caption text-muted-foreground">
						Pairs with{" "}
						{doc.pairsWith.map((surface, i) => (
							<span key={surface}>
								{i ? ", " : null}
								<InlineCode>{surface}</InlineCode>
							</span>
						))}
					</p>
				) : null}
			</div>
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
				description="Every colour role in the contract, read from it, with what each is for. Switch theme or mode and every swatch updates together."
			>
				<Stack gap={6}>
					<p className="max-w-(--measure-prose) text-body-sm text-muted-foreground">
						An ink is shown on the surface it pairs with. Each pairing is checked in every bundled theme and mode: text
						at 4.5:1, and labels on a brand or status fill at APCA Lc 60 as well. Pick ink by its surface (
						<InlineCode>bg-card text-card-foreground</InlineCode>), never on its own, and never with opacity.
					</p>
					{grouped.map((group) => (
						<Stack key={group.title} gap={2}>
							<div className="flex flex-col gap-1">
								<p className="text-title-lg">{group.title}</p>
								<p className="text-body-sm text-muted-foreground">{group.description}</p>
							</div>
							<div className="rounded-xl border border-border px-5 py-2">
								{group.tokens.map((token) => (
									<RoleRow key={token} name={token} />
								))}
							</div>
						</Stack>
					))}
				</Stack>
			</Section>

			<Section
				title="Tones"
				description="Three extra colors a theme defines for categories and badges, then the colors that carry meaning: status, feedback and highlight. Each comes with a 50–950 scale on one ladder of depths, so bg-tone-1-100 is a wash of tone 1 at the same depth as every other tone's 100. The tone itself sits on whichever step is nearest its own lightness."
			>
				{/* Inherits from <html>, unscoped: re-declaring the preset here would
				    shadow the customizer's :root overrides and freeze the tones. */}
				<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={1.5}>
					{tones.map((t) => (
						<Stack key={t.name} gap={1}>
							<div
								className="flex min-h-36 flex-col justify-between rounded-xl border border-border p-4"
								style={{ background: `var(--${t.name})`, color: `var(--${t.foreground})` }}
							>
								<div>
									<p className="text-title-sm">{t.label}</p>
									<p className="text-body-sm">{t.desc}</p>
								</div>
								<p className="text-display-lg">Aa</p>
							</div>
							{hasScale(t.name) ? <Scale name={t.name} /> : null}
						</Stack>
					))}
				</Grid>
			</Section>

			<Section
				title="Chart palette"
				description="The colours a chart's series take, in order, when they name none. Validated as neighbours, so take the slots in order; past eight series, fold the rest into Other. A series that means something (revenue is the brand, errors are destructive) takes a tone mark instead."
			>
				<Stack gap={3}>
					<Grid cols={{ base: 4, md: 8 }} gap={1}>
						{CHART_TOKENS.map((token) => (
							<div key={token} className="flex min-w-0 flex-col gap-1">
								<div className="h-16 rounded-md" style={{ background: `var(--${token})` }} title={`--${token}`} />
								<span className="text-mono-sm text-muted-foreground">{token}</span>
							</div>
						))}
					</Grid>
					<p className="text-body-sm text-muted-foreground">
						Every bundled theme's set is checked in light and dark: neighbours stay apart under normal vision and under
						protanopia and deuteranopia, and every series clears 2:1 on the page and on a card. Read them as{" "}
						<InlineCode>chartColor(i)</InlineCode>, <InlineCode>var(--chart-3)</InlineCode> or{" "}
						<InlineCode>bg-chart-3</InlineCode>; a theme may override any slot.
					</p>
				</Stack>
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
