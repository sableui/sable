import { Button, Card, CardDescription, CardFooter, CardHeader, CardTitle, Grid, Icon } from "@sableui/react"
import { GradientArt, gradientArtMeta } from "@sableui/react"
import { ComponentPlayground, Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { useTheme } from "../../theme"

const PEOPLE = [
	{ name: "Mara Okafor", initials: "MO" },
	{ name: "Sam Rivera", initials: "SR" },
	{ name: "Juno Avery", initials: "JA" },
	{ name: "Lee Park", initials: "LP" },
	{ name: "Ada Brooks", initials: "AB" },
	{ name: "Kit Moreau", initials: "KM" },
]

const COVERS = ["Low tide, high noon", "Untitled (gold rush)", "Dusk, no. 4", "Field recordings"]

const PROMPTS = ["Summarise this thread", "Draft a reply", "Find the action items"]
const TOOLS = ["mail", "calendar", "chart"]

export function GradientArtPage() {
	const { themes, mode } = useTheme()
	return (
		<>
			<PageHeader eyebrow="Components" title="Gradient Art" lede={ledeFor(gradientArtMeta)} />

			<ComponentPlayground meta={gradientArtMeta} />

			<Section title="Mesh and grain" description="The same seed and tones in both variants. Mesh, the default, is soft and glassy; grain glows over deep corners with a printed texture.">
				<Example>
					<Grid cols={2} gap={2} className="w-full max-w-lg">
						{(["mesh", "grain"] as const).map((variant) => (
							<figure key={variant} className="grid gap-2">
								<GradientArt variant={variant} seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />
								<figcaption className="text-caption text-muted-foreground">{variant}</figcaption>
							</figure>
						))}
					</Grid>
				</Example>
			</Section>

			<Section
				title="Soft"
				description="intensity=&quot;soft&quot; washes the same art to a pastel of itself: every colour and the ground lifted light and half as saturated. It is a stage, not a surface for text: a card header band, or a field for chips and logo tiles to float on. It stays light in dark mode too."
			>
				<Example>
					<div className="grid w-full max-w-2xl gap-6">
						<Grid cols={2} gap={2}>
							{(["vivid", "soft"] as const).map((intensity) => (
								<figure key={intensity} className="grid gap-2">
									<GradientArt intensity={intensity} seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />
									<figcaption className="text-caption text-muted-foreground">{intensity}</figcaption>
								</figure>
							))}
						</Grid>
						<Grid cols={{ base: 1, sm: 2 }} gap={3}>
							<Card>
								<GradientArt intensity="soft" seed="Integrations" className="flex h-32 items-center justify-center gap-3 rounded-t-lg">
									{TOOLS.map((name) => (
										<span key={name} className="grid size-12 place-items-center rounded-lg border border-border-floating bg-popover text-popover-foreground shadow-md">
											<Icon name={name} className="text-xl" />
										</span>
									))}
								</GradientArt>
								<CardHeader>
									<CardTitle>Connect your tools</CardTitle>
									<CardDescription>Bring mail, calendar and analytics into one place.</CardDescription>
								</CardHeader>
								<CardFooter>
									<Button>Connect</Button>
								</CardFooter>
							</Card>
							<GradientArt intensity="soft" seed="Ask anything" className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg p-6">
								{PROMPTS.map((prompt) => (
									<Button key={prompt} variant="floating" size="sm">
										<Icon name="sparkles" />
										{prompt}
									</Button>
								))}
							</GradientArt>
						</Grid>
					</div>
				</Example>
			</Section>

			<Section
				title="Per preset"
				description="Each preset sets its own art direction through the --art-* tokens: its colours, how far the field bends, how soft the blend is, and whether it carries grain. The same seed in every preset, each shown as shipped."
			>
				<Example>
					<Grid cols={{ base: 2, sm: 3 }} gap={2} className="w-full max-w-2xl">
						{themes.map((theme) => (
							<figure key={theme.id} className="grid gap-2">
								{/* Scoped to the preset as shipped, like the Presets page: the art reads that preset's tokens. */}
								<div data-sable-theme={theme.id} data-preset-preview="" className={mode === "dark" ? "dark" : undefined}>
									<GradientArt seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />
								</div>
								<figcaption className="text-caption text-muted-foreground">{theme.label}</figcaption>
							</figure>
						))}
					</Grid>
				</Example>
			</Section>

			<Section title="Seeds" description="A seed fixes each item's composition, so a grid of covers stays individually recognisable in every theme.">
				<Example>
					<Grid cols={4} gap={1.5} className="w-full max-w-lg">
						{COVERS.map((title) => (
							<GradientArt key={title} seed={title} className="aspect-square rounded-md" />
						))}
					</Grid>
				</Example>
			</Section>

			<Section title="Avatar fallback" description="Initials over art seeded by the name: every person without a photo still gets their own, stable colour. Avatar ships this as variant=&quot;art&quot;.">
				<Example>
					<div className="flex flex-wrap gap-3">
						{PEOPLE.map((person) => (
							<GradientArt
								key={person.name}
								role="img"
								aria-label={person.name}
								seed={person.name}
								className="grid size-10 place-items-center rounded-full text-label-md text-overlay-foreground"
							>
								<span aria-hidden>{person.initials}</span>
							</GradientArt>
						))}
					</div>
				</Example>
			</Section>

			<MetaFooter meta={gradientArtMeta} />
		</>
	)
}
