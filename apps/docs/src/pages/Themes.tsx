import { Badge, Button, Grid } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { useTheme } from "../theme"
import { PresetPreview } from "../components/PresetPreview"

/** One line on each preset's character — what you are choosing, in words. */
const CHARACTER: Record<string, string> = {
	sable: "Cool neutrals, soft corners and vivid status tones. The neutral default.",
	meridian: "Warm cream and ink, square edges, one ember-orange accent, no shadows.",
	prism: "Outfit interface text, Playfair Display headings, crisp corners and blue actions.",
	verdant: "Forest ink on warm paper, a serif display face and mono eyebrows.",
	ember: "Warm surfaces, lightweight headings and orange-red actions.",
	poppy: "Cream and plum, wide Unbounded headings, generous spacing and rounded panels.",
}


export function ThemesPage() {
	const { themeId, themes, mode, presets } = useTheme()
	const { requestPreset, isCustomized } = useCustomizer()
	const dark = mode === "dark"

	return (
		<>
			<PageHeader
				title="Presets"
				lede="Color, type, corners, depth and motion designed together. Choose a starting point, customize it in Canvas, and save it with design notes for your next build."
			/>

			<Section
				title={presets.length ? "Starting points and your presets" : "Six starting points"}
				description={`The same card in each preset, shown in ${dark ? "dark" : "light"} mode.${isCustomized ? " Choosing one clears your Customize changes; you will be asked first." : ""}`}
			>
				<Grid cols={{ base: 1, sm: 2 }} gap={[4, 2]}>
					{themes.map((theme) => {
						const active = theme.id === themeId
						return (
							<article key={theme.id} className="grid content-start gap-3">
								<PresetPreview id={theme.id} dark={dark} />
								<div className="flex items-start justify-between gap-3">
									<div className="grid gap-1">
										<h3 className="flex items-center gap-2 text-title-lg">
											{theme.label}
											{active ? (
												<Badge size="sm">
													In use
												</Badge>
											) : null}
										</h3>
										<p className="text-body-sm text-muted-foreground">{CHARACTER[theme.id] ?? presets.find(preset => preset.id === theme.id)?.direction ?? ""}</p>
									</div>
									{active ? null : (
										<Button variant="outline" size="sm" className="shrink-0" onClick={() => requestPreset(theme.id)}>
											Use
										</Button>
									)}
								</div>
							</article>
						)
					})}
				</Grid>
			</Section>

		</>
	)
}
