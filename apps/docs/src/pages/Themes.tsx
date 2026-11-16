import { Badge, Button, CodeBlock, Grid, Note, Stack, isThemeId } from "@sableui/react"
import { InlineCode, PageHeader, Section } from "../components/docs-ui"
import { useCustomizerActions } from "../customizer/CustomizerProvider"
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
	const { requestPreset, isCustomized } = useCustomizerActions()
	const dark = mode === "dark"
	// The snippets name the preset in use when it ships with Sable, else Verdant.
	const example = isThemeId(themeId) && themeId !== "sable" ? themeId : "verdant"

	return (
		<>
			<PageHeader
				title="Presets"
				lede="Color, type, corners, depth and motion designed together. Choose a starting point, customize it in Canvas, and save it with design notes for your next build."
			/>

			<Section
				title={presets.length ? "Starting points and your presets" : "Six starting points"}
				description={`The same card in each preset, shown in ${dark ? "dark" : "light"} mode.${isCustomized ? " You have Customize changes: choosing one asks whether to keep them or start fresh." : ""}`}
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

			<Section
				title="Use a preset in your app"
				description="Choosing a preset here changes this site. In your app it takes two things: the preset's CSS, and the attribute that turns it on."
			>
				<Stack gap={4}>
					<Stack gap={2}>
						<p className="text-title-sm">1. Import its CSS, after Sable's styles</p>
						<p className="max-w-(--measure-prose) text-body-sm text-muted-foreground">
							<InlineCode>styles.css</InlineCode> carries only the Sable preset. Each other preset is opt-in, so an app that never
							uses it never ships it. A theme switcher over every bundled preset imports <InlineCode>themes.css</InlineCode>{" "}
							instead.
						</p>
						<CodeBlock
							code={`@import "tailwindcss";
@import "@sableui/react/styles.css";
@import "@sableui/react/theme/${example}.css"; /* one preset */
/* or every bundled preset: @import "@sableui/react/themes.css"; */`}
						/>
					</Stack>
					<Stack gap={2}>
						<p className="text-title-sm">2. Turn it on with SableThemeProvider</p>
						<p className="max-w-(--measure-prose) text-body-sm text-muted-foreground">
							The provider writes <InlineCode>data-sable-theme</InlineCode> and the <InlineCode>dark</InlineCode> class on{" "}
							<InlineCode>{"<html>"}</InlineCode>, remembers the choice, and lets anything below read or change it with{" "}
							<InlineCode>useSableTheme()</InlineCode>. Sable, the default, needs no attribute.
						</p>
						<CodeBlock
							code={`import { SableThemeProvider, useSableTheme } from "@sableui/react"

<SableThemeProvider defaultThemeId="${example}" defaultPreference="system">
  <App />
</SableThemeProvider>

// anywhere below
const { themeId, setThemeId, mode, toggle } = useSableTheme()`}
						/>
						<p className="max-w-(--measure-prose) text-body-sm text-muted-foreground">
							Server-rendered app? Inline <InlineCode>{"<SableThemeScript />"}</InlineCode> in <InlineCode>{"<head>"}</InlineCode>{" "}
							with the provider's options, so the first paint is already in the visitor's preset and mode.
						</p>
					</Stack>
					<Note tone="warning" title="If the preset seems to do nothing">
						The attribute is set but the preset's CSS was never imported, so nothing matches it and the page renders as Sable,
						with no error. Check the import in step 1 first. A development build warns in the console when this happens, and{" "}
						<InlineCode>sable doctor</InlineCode> catches it from the source.
					</Note>
				</Stack>
			</Section>
		</>
	)
}
