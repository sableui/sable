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

export function GradientArtPage() {
	const { themes, mode } = useTheme()
	return (
		<>
			<PageHeader eyebrow="Components" title="Gradient Art" lede={ledeFor(gradientArtMeta)} />

			<ComponentPlayground meta={gradientArtMeta} />

			<Section title="Mesh and grain" description="The same seed and tones in both variants. Mesh, the default, is soft and glassy; grain glows over deep corners with a printed texture.">
				<Example>
					<div className="grid w-full max-w-lg grid-cols-2 gap-4">
						{(["mesh", "grain"] as const).map((variant) => (
							<figure key={variant} className="grid gap-2">
								<GradientArt variant={variant} seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />
								<figcaption className="text-caption text-muted-foreground">{variant}</figcaption>
							</figure>
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Per preset"
				description="Each preset sets its own art direction through the --art-* tokens: its colours, how far the field bends, how soft the blend is, and whether it carries grain. The same seed in every preset, each shown as shipped."
			>
				<Example>
					<div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
						{themes.map((theme) => (
							<figure key={theme.id} className="grid gap-2">
								{/* Scoped to the preset as shipped, like the Presets page: the art reads that preset's tokens. */}
								<div data-sable-theme={theme.id} data-preset-preview="" className={mode === "dark" ? "dark" : undefined}>
									<GradientArt seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />
								</div>
								<figcaption className="text-caption text-muted-foreground">{theme.label}</figcaption>
							</figure>
						))}
					</div>
				</Example>
			</Section>

			<Section title="Seeds" description="A seed fixes each item's composition, so a grid of covers stays individually recognisable in every theme.">
				<Example>
					<div className="grid w-full max-w-lg grid-cols-4 gap-3">
						{COVERS.map((title) => (
							<GradientArt key={title} seed={title} className="aspect-square rounded-md" />
						))}
					</div>
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
