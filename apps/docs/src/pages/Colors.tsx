import { cn } from "@sableui/react"
import { InlineCode, PageHeader, Section } from "../components/docs-ui"
import { useTheme } from "../theme"

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

const palettesByTheme = {
	base: [
		"zinc",
		"purple-heart",
		"blue-gem",
		"caribbean-green",
		"azure-radiance",
		"flush-orange",
		"torch-red",
	],
	// Base and Meridian expose palette ramps; other featured presets use semantic tokens.
	meridian: ["meridian-ember"],
} as const
const ramp = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const tones = [
	{
		name: "tone-standard",
		foreground: "tone-standard-foreground",
		label: "Standard",
		desc: "Default item signal",
	},
	{
		name: "tone-collectible",
		foreground: "tone-collectible-foreground",
		label: "Collectible",
		desc: "Collectible / entity signal",
	},
	{
		name: "tone-edition",
		foreground: "tone-edition-foreground",
		label: "Edition",
		desc: "Edition / premium signal",
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

function palettesForTheme(themeId: string) {
	if (themeId === "meridian") return palettesByTheme.meridian
	if (themeId === "base") return palettesByTheme.base
	// Other featured presets declare semantic tokens without named palette ramps.
	return []
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
	const { mode, themeId } = useTheme()
	const palettes = palettesForTheme(themeId)
	const scoped = mode === "dark" ? "dark" : undefined

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
				description="Color that carries meaning: status, feedback and highlight."
			>
				<div
					className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", scoped)}
					data-sable-theme={themeId}
				>
					{tones.map((t) => (
						<div
							key={t.name}
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
					))}
				</div>
			</Section>

			{palettes.length ? (
				<Section
					title="Palette"
					description="The raw scales this theme builds its roles from."
				>
					<div className={cn("space-y-6", scoped)} data-sable-theme={themeId}>
						{palettes.map((p) => (
							<div key={p}>
								<p className="text-title-sm mb-2">{p}</p>
								<div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
									{ramp.map((step) => (
										<div key={step} className="flex flex-col gap-1.5">
											<div
												className="aspect-square rounded-md border border-border/30"
												style={{ background: `var(--${p}-${step})` }}
											/>
											<span className="text-mono-sm text-center text-muted-foreground">
												{step}
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</Section>
			) : null}
		</>
	)
}
