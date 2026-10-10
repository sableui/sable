import type { ComponentMeta } from "../../lib/meta"

export const themeSelectorMeta: ComponentMeta = {
	name: "ThemeSelector",
	summary:
		"A presentational radiogroup for choosing a Sable design theme from theme manifests — swatch-strip cards for a settings page, or compact rows for tool chrome. Pair it with useSableTheme().themeId and setThemeId when the app uses SableThemeProvider.",
	status: "stable",
	// keywords and related were inherited from lib/component-guidance.ts until that
	// entry was removed as dead code. They belong here now: the fall-through is
	// per-field (`meta.keywords ?? metaGuidance.keywords`), so deleting the central
	// entry drops every field the meta does not state itself.
	keywords: ["theme selector", "theme", "appearance", "skin", "design theme", "preset"],
	related: { components: ["ThemeSwitcher", "Popover", "RadioCard"] },
	usage: {
		description:
			"Use ThemeSelector wherever a person picks a theme. The default `cards` layout is page-register furniture: a swatch strip, a name, and a caption only where one distinguishes the card (the default theme, or a single-mode theme), at ~144px tall. Use `layout=\"list\"` in tool chrome, a popover, or any docked panel — five cards is the wrong object for a 256px surface, however it is sized. For colour mode (light/dark/system) use ThemeSwitcher, which is a segmented control and belongs in chrome as-is.",
		bestPractices: [
			{
				guidance: "do",
				description:
					'Use layout="list" in a popover, a menu, or a docked panel. Rows sit on the --control-sm ladder and still show each theme\'s swatch strip, so the choice stays visible rather than described. Rows take `sable-frame-inner`, so host the list in a sable-frame (a Popover, or `sable-frame sable-surface sable-surface-popover sable-frame-popover`) and their corners nest concentrically.',
			},
			{
				guidance: "do",
				description:
					"Pass mode={useSableTheme().mode} so every preview renders in the colour mode actually in use, rather than in each theme's manifest default.",
			},
			{
				guidance: "do",
				description:
					"Load each theme's fonts in the host app. Every card carries a type specimen in that theme's own face so people can compare typography as well as color. A theme whose fonts are not loaded falls back to system-ui, and its specimen stops telling the truth.",
			},
			{
				guidance: "dont",
				description:
					"Add a viewport breakpoint to force a column count — `className=\"sm:grid-cols-1\"` or similar. `sm:` keys off the VIEWPORT, not this component's container, so on a wide screen it does nothing for a narrow parent. The cards grid already reflows on its own width via auto-fit.",
			},
			{
				guidance: "dont",
				description:
					"Put the cards layout in workspace chrome. It was built for a settings page; in a 256px popover the cards clip their labels to a single character and grow to roughly twice their intended height.",
			},
			{
				// Recovered from lib/component-guidance.ts, whose entry for this
				// component was silently shadowed the moment this `usage` block was
				// added — `meta.usage ?? metaGuidance.usage` means the meta wins whole,
				// so a partial override destroys whatever it does not restate.
				guidance: "dont",
				description:
					"Use ThemeSelector for light / dark / system colour mode. That is ThemeSwitcher — a segmented control. This picks the design theme, which is a different axis entirely, and the two are frequently confused.",
			},
		],
	},
	props: [
		{
			name: "value",
			type: "ThemeId",
			description: "The currently selected Sable design theme id.",
		},
		{
			name: "onValueChange",
			type: "(themeId: ThemeId) => void",
			description: "Called with the next design theme id when an option is chosen.",
		},
		{
			name: "themes",
			type: "readonly ThemeManifest[]",
			default: "themeManifests",
			description:
				"Theme manifests to render. Defaults to Sable's built-in themes.",
		},
		{
			name: "mode",
			type: '"light" | "dark"',
			description:
				"Preview mode for each card's swatch strip. Pass useSableTheme().mode to match the current color mode; omitted cards use their manifest defaultMode.",
		},
		{
			name: "label",
			type: "string",
			default: '"Design theme"',
			description: "Accessible label for the radiogroup.",
		},
		{
			name: "layout",
			type: '"cards" | "list"',
			default: '"cards"',
			description:
				'Presentation. "cards" is the page-register picker (~144px per card); "list" is one compact --control-sm row per theme, for chrome and popovers. A presentation variant, not a size — "list" is not "cards, smaller" — which is why it is a prop rather than a density scope.',
		},
		{
			name: "className",
			type: "string",
			description: "Merged onto the outer radiogroup grid.",
		},
	],
	tokensUsed: [
		"input",
		"card",
		"border",
		"background",
		"primary",
		"primary-foreground",
		"accent",
		"muted",
		"muted-foreground",
		"ring",
	],
	a11y: [
		'The container is role="radiogroup" with an aria-label; each card is a role="radio" button with aria-checked reflecting the selected theme.',
		"Focus-visible draws a 2px ring on the focused card.",
		"The selected card wears the shared selection-card checked ring (the same as RadioCard and CheckboxCard), a muted fill and a check icon, so selection does not rely on colour alone.",
		"Presentational only: it does not change the document theme; pass useSableTheme().setThemeId or apply the change in onValueChange.",
	],
	examples: [
		{
			label: "With SableThemeProvider",
			code: "const { themeId, setThemeId, themes, mode } = useSableTheme()\n<ThemeSelector value={themeId} onValueChange={setThemeId} themes={themes} mode={mode} />",
		},
		{
			label: "Controlled",
			code: 'const [themeId, setThemeId] = useState<ThemeId>("base")\n<ThemeSelector value={themeId} onValueChange={setThemeId} />',
		},
		{
			label: "In chrome — a popover or a docked panel",
			code: `// Five 144px cards is the wrong object for a 256px surface. Rows are.
<PopoverContent align="end" className="w-64 p-3">
  <ThemeSwitcher value={preference} onValueChange={setPreference} />
  <ThemeSelector layout="list" value={themeId} onValueChange={setThemeId} mode={mode} />
</PopoverContent>`,
		},
		{
			label: "Do not reach for a viewport breakpoint",
			code: `// ✗ \`sm:\` keys off the VIEWPORT, not this component's container. On a wide
//   screen it does nothing at all for a narrow parent — and this exact
//   workaround, once documented here, is how the cards layout ended up in a
//   256px popover clipping "Default" to "D".
<ThemeSelector className="sm:grid-cols-1" value={themeId} onValueChange={setThemeId} />

// ✓ The cards grid already reflows on its own width (auto-fit, 9rem tracks).
//   For a genuinely narrow surface, change the presentation instead.
<ThemeSelector layout="list" value={themeId} onValueChange={setThemeId} />`,
		},
	],
}
