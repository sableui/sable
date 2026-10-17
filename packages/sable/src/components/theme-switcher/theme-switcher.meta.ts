import type { ComponentMeta } from "../../lib/meta"

export const themeSwitcherMeta: ComponentMeta = {
	name: "ThemeSwitcher",
	summary:
		"A segmented light / dark / system switch. Presentational: it renders the selected color preference and reports changes via onValueChange; pair it with useSableTheme() when the app uses SableThemeProvider. A radiogroup of three icon buttons (sun / moon / desktop).",
	status: "stable",
	keywords: [
		"theme switcher",
		"color mode",
		"dark mode",
		"appearance",
	],
	usage: {
		description: "Use ThemeSwitcher for light, dark, and system color mode preference.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it where users expect appearance controls, such as app chrome or settings.",
			},
			{
				guidance: "do",
				description: "Respect persisted system or user preference when initializing the control.",
			},
			{
				guidance: "dont",
				description: "Do not use ThemeSwitcher to choose brand themes or component style presets.",
			},
			{
				guidance: "dont",
				description: "Do not hand-build another segmented capsule for a different choice. ThemeSwitcher wears the shared segmented look (lib/segmented); for any other single-select switch use ToggleGroup appearance=\"segmented\".",
			},
			{
				guidance: "dont",
				description: "Do not omit the `system` option or default to a hardcoded mode. Overriding the OS preference is the single most common accessibility complaint about theme controls.",
			},
		],
	},
	related: {
		components: [
			"ThemeSelector",
			"Switch",
			"Toggle",
		],
	},
	props: [
		{
			name: "value",
			type: '"light" | "dark" | "system"',
			description: "The currently selected color preference.",
		},
		{
			name: "onValueChange",
			type: "(value: ThemeMode) => void",
			description: "Called with the next color preference when an option is chosen.",
		},
		{
			name: "label",
			type: "string",
			default: '"Theme"',
			description: "Accessible label for the radiogroup.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting.",
		},
		{
			name: "className",
			type: "string",
			description: "Merged onto the outer radiogroup container.",
		},
	],
	tokensUsed: [
		"border",
		"card",
		"muted-foreground",
		"foreground",
		"accent",
		"accent-foreground",
		"ring",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives with the header or settings row it lives in; a theme control that announces itself competes with the page it themes.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Option",
			why: "The icon steps from muted to foreground under the pointer, which is what tells an icon-only segment it is a control.",
		},
		{
			slot: "response",
			recipe: "motion-press",
			part: "Option",
			why: "A settle under the press confirms the tap on a 28px target before the theme change repaints the page around it.",
		},
		{
			slot: "transition",
			recipe: "motion-glide",
			part: "Active pill",
			why: "One pill slides to the chosen mode, stepping by option + gap on the spacing scale, so light → dark reads as the same control moving, not three icons trading a fill. Expressive: motion=\"subtle\" lands it in place.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Changing the theme is synchronous; the repaint is the feedback.",
		},
	],
	a11y: [
		'The container is role="radiogroup" with an aria-label; each option is role="radio" with aria-checked reflecting the selected value.',
		"Each icon button carries an aria-label (Light / Dark / System) plus a title tooltip, since the visual is icon-only.",
		"Focus-visible draws a 2px ring on the focused option; selection styling reads from aria-checked.",
		"Presentational only: it does not change the document theme; pass useSableTheme().setPreference or apply the change in onValueChange.",
	],
	examples: [
		{
			label: "Controlled",
			code: 'const [theme, setTheme] = useState<ThemeMode>("system")\n<ThemeSwitcher value={theme} onValueChange={setTheme} />',
		},
		{
			label: "With SableThemeProvider",
			code: 'const { preference, setPreference } = useSableTheme()\n<ThemeSwitcher value={preference} onValueChange={setPreference} />',
		},
		{
			label: "Light selected",
			code: '<ThemeSwitcher value="light" onValueChange={setTheme} />',
		},
		{
			label: "Subtle motion",
			code: '<ThemeSwitcher value={theme} onValueChange={setTheme} motion="subtle" />',
		},
	],
}
