/**
 * Providers — the app-level context components, documented the way component
 * metas document components.
 *
 * A provider is not a component in the catalog sense: it renders no UI, it has
 * no register or taxonomy group and no docs page, and it is mounted once near
 * the root rather than composed into a layout. So it does not get a
 * `ComponentMeta`. But an agent wiring an app asks for it by name exactly as it
 * asks for a component — `sable component SableThemeProvider` used to answer
 * ERR_UNKNOWN_COMPONENT — so it needs the same contract: what it does, whether
 * it is required, where it goes, its props and a copyable example.
 *
 * `build-registry` emits this file into `registry.json → providers` (served by
 * `sable provider <Name>`, and by `sable component <Name>` as a fallback), and
 * fails the build when:
 *
 * - a `*Provider` value exported by the package barrel is documented neither
 *   here nor as a prop/subcomponent of the component that owns it (ToastProvider
 *   is documented with Toast, TooltipProvider with Tooltip, CodeHighlightProvider
 *   with CodeBlock — those are derived, not restated here);
 * - a name here is not a real export;
 * - `props` disagrees with the source's `<Name>Props` interface (when `source`
 *   names one), in either direction;
 * - an example uses a tag the package does not export, or passes a provider a
 *   prop documented nowhere.
 */
import type { PropMeta } from "../lib/meta"

export interface ProviderExample {
	label: string
	/** A self-contained snippet. Root-barrel imports are derived by the build. */
	code: string
	/** Import lines the build cannot derive: subpath exports, React types. */
	extraImports?: string[]
}

export interface ProviderMeta {
	/** The exported name. */
	name: string
	summary: string
	/** Whether an app needs it, and what happens without it. Starts "Required" or "Optional". */
	required: string
	/** Where it goes in the tree. */
	placement: string
	/**
	 * Path under src/ to the file declaring `export interface <name>Props`. The
	 * build checks `props` against it. Omit for a bare React context provider
	 * whose only prop is `value`.
	 */
	source?: string
	props: PropMeta[]
	/** Hooks and helpers that read or drive it. */
	companions?: string[]
	examples: ProviderExample[]
	notes?: string[]
	related?: string[]
}

export const PROVIDER_METAS: ProviderMeta[] = [
	{
		name: "SableThemeProvider",
		summary:
			"Applies and persists Sable's two theme axes on <html>: the colour preference (light, dark or system, written as the `.dark` class) and the design theme (written as `data-sable-theme`). Read and change both anywhere below it with useSableTheme().",
		required:
			"Optional. Without it the app renders the default Sable theme in whatever mode the `dark` class on <html> says. Mount it when users can switch colour mode or theme, or to register an app-owned preset theme.",
		placement:
			"Once, at the app root, above everything that renders Sable components or calls useSableTheme(). It writes to <html> by default so portaled overlays (dialogs, menus, toasts) share the same tokens.",
		source: "themes/theme-provider.tsx",
		props: [
			{ name: "defaultPreference", type: '"light" | "dark" | "system"', default: '"system"', description: "Colour preference on a first visit, before anything is stored. Pass \"dark\" (or a preset's `defaultMode`) to open in dark." },
			{ name: "preference", type: '"light" | "dark" | "system"', description: "Controlled colour preference. Pair with onPreferenceChange." },
			{ name: "onPreferenceChange", type: "(preference) => void", description: "Called whenever the colour preference is set." },
			{ name: "defaultThemeId", type: "ThemeId | string", default: '"sable"', description: "Design theme on a first visit, before anything is stored." },
			{ name: "themeId", type: "ThemeId | string", description: "Controlled design theme id. Pair with onThemeIdChange." },
			{ name: "onThemeIdChange", type: "(themeId) => void", description: "Called whenever the design theme is set." },
			{ name: "colorStorageKey", type: "string | null", default: "SABLE_COLOR_STORAGE_KEY", description: "localStorage key for the colour preference. null disables persistence." },
			{ name: "themeStorageKey", type: "string | null", default: "SABLE_THEME_STORAGE_KEY", description: "localStorage key for the design theme. null disables persistence. The default key is shared by every Sable app on an origin (several apps on localhost:5173 in development), and a stored id another app set wins over `defaultThemeId` when this app knows it too. An app with one fixed preset passes `themeId` (or `themeStorageKey={null}`); an app that lets users switch themes passes its own key." },
			{ name: "target", type: '"root" | (() => HTMLElement | null)', default: '"root"', description: "Where to write `.dark` and `data-sable-theme`. A getter scopes theming to a subtree." },
			{ name: "customThemes", type: "ThemeManifest[]", description: "Extra theme manifests, for example `presetManifest(preset)` for an app-owned preset. Their ids become valid themeId values. Sable does not load their CSS: import it yourself." },
		],
		companions: ["useSableTheme", "ThemeSwitcher", "ThemeSelector", "applySableTheme", "applySableColorMode"],
		examples: [
			{
				label: "At the app root, following the visitor's OS",
				code: `export function Root({ children }: { children: ReactNode }) {
	return <SableThemeProvider>{children}</SableThemeProvider>
}`,
				extraImports: ['import type { ReactNode } from "react"'],
			},
			{
				label: "Dark by default, with an app-owned preset theme",
				code: `const customThemes = [presetManifest(parsePreset(presetJson))]

export function Root({ children }: { children: ReactNode }) {
	return (
		<SableThemeProvider defaultPreference="dark" defaultThemeId="my-preset" customThemes={customThemes}>
			{children}
		</SableThemeProvider>
	)
}`,
				extraImports: [
					'import type { ReactNode } from "react"',
					'import { parsePreset, presetManifest } from "@sableui/react/presets"',
					'import presetJson from "../.sable/presets/my-preset.json"',
				],
			},
		],
		notes: [
			"Only the alternate design themes need theme CSS: import `@sableui/react/themes.css`, one `@sableui/react/theme/<id>.css`, or the scoped CSS from `sable preset --css`. Light/dark of the default theme needs nothing extra.",
			"A colour-mode toggle is the ThemeSwitcher component; it reads this provider.",
		],
		related: ["ThemeSwitcher", "ThemeSelector"],
	},
	{
		name: "IconProvider",
		summary:
			"Supplies the icon set every <Icon> renders with, including the icons inside Sable's own components. Components name icons semantically (`chevron-down`, `check`); the set maps each name to artwork.",
		required:
			"Required for icons. `<Icon>` has no built-in fallback: without a provider, icons render nothing and a development build warns once.",
		placement: "Once, at the app root, above every Sable component.",
		source: "icon/IconProvider.tsx",
		props: [
			{ name: "set", type: "IconSet", description: "The icon set: `reiconIconSet` from `@sableui/react/icons/reicon`, another complete set, or `composeIconSets(appExtras, reiconIconSet)` to add app icons over Reicon." },
			{ name: "defaultVariant", type: "IconVariant", default: '"regular"', description: "Variant used when an <Icon> does not set one." },
		],
		companions: ["Icon", "composeIconSets", "useIconSet"],
		examples: [
			{
				label: "Reicon, Sable's bundled set",
				code: `export function Root({ children }: { children: ReactNode }) {
	return <IconProvider set={reiconIconSet}>{children}</IconProvider>
}`,
				extraImports: ['import type { ReactNode } from "react"', 'import { reiconIconSet } from "@sableui/react/icons/reicon"'],
			},
			{
				label: "App icons added over Reicon",
				code: `const icons = composeIconSets(appIcons, reiconIconSet)

export function Root({ children }: { children: ReactNode }) {
	return <IconProvider set={icons}>{children}</IconProvider>
}`,
				extraImports: [
					'import type { ReactNode } from "react"',
					'import { reiconIconSet } from "@sableui/react/icons/reicon"',
					'import { appIcons } from "./icons"',
				],
			},
		],
		notes: [
			"The first set in composeIconSets that returns a node for a name wins, so app icons can also override Reicon's.",
			"List the names an app adds in .sable/icons.json ({ \"names\": [...] }) so `sable grade` does not report them as off-contract.",
		],
		related: ["Icon"],
	},
	{
		name: "MotionProvider",
		summary:
			"Holds the app's motion policy and writes it as `data-motion` on <html>, which drives the `--motion-scale` switch every Sable motion recipe reads. Lets an app offer its own reduce-motion setting.",
		required:
			"Optional. Without it, motion follows the visitor's OS `prefers-reduced-motion` setting, and useMotion() still works (its setPolicy does nothing).",
		placement: "Once, at the app root, when the app has an in-app motion setting.",
		source: "motion/MotionProvider.tsx",
		props: [
			{ name: "defaultPolicy", type: '"system" | "full" | "reduced" | "off"', default: '"system"', description: "Initial policy when uncontrolled. \"system\" defers to the OS preference." },
			{ name: "policy", type: '"system" | "full" | "reduced" | "off"', description: "Controlled policy. Pair with onPolicyChange." },
			{ name: "onPolicyChange", type: "(policy) => void", description: "Called whenever the policy changes." },
			{ name: "target", type: '"root" | (() => HTMLElement | null)', default: '"root"', description: "Where to write `data-motion`. The default covers portaled overlays too; a getter scopes motion to a subtree." },
		],
		companions: ["useMotion", "useReducedMotion"],
		examples: [
			{
				label: "At the app root",
				code: `export function Root({ children }: { children: ReactNode }) {
	return <MotionProvider defaultPolicy="system">{children}</MotionProvider>
}`,
				extraImports: ['import type { ReactNode } from "react"'],
			},
			{
				label: "A reduce-motion setting",
				code: `function ReduceMotionSetting() {
	const { policy, setPolicy } = useMotion()
	return (
		<Switch
			checked={policy === "reduced"}
			onCheckedChange={(on) => setPolicy(on ? "reduced" : "system")}
			aria-label="Reduce motion"
		/>
	)
}`,
			},
		],
		notes: [
			"JavaScript motion must read useMotion().enabled and do nothing when it is false; CSS recipes stop on their own.",
		],
		related: ["Switch"],
	},
	{
		name: "DensityProvider",
		summary:
			"The bare React context behind density. It feeds only the React side, which is the half that reaches portaled popups; it renders no element and sets no `data-density`, so the CSS control ladder in its subtree does not change.",
		required:
			"Optional, and rarely the right choice. To make a region compact use the Density component (or Workspace), which sets both the context and `data-density`.",
		placement: "Around an element you already own that carries `data-density` itself.",
		props: [{ name: "value", type: '"compact" | "comfortable"', description: "The density popups opened from this subtree should use." }],
		companions: ["Density", "useDensity", "useTypeTier"],
		examples: [
			{
				label: "An element that sets data-density itself",
				code: `function CompactRegion({ children }: { children: ReactNode }) {
	return (
		<DensityProvider value="compact">
			<section data-density="compact">{children}</section>
		</DensityProvider>
	)
}`,
				extraImports: ['import type { ReactNode } from "react"'],
			},
		],
		related: ["Workspace"],
	},
	{
		name: "PresentationProvider",
		summary:
			"Declares what its subtree is presented in, a page or a sheet. Action rows (CardFooter actions, SheetFooter) read it: on a page they are a short row; in a sheet they stack full width and pin to the bottom.",
		required:
			"Optional. A bottom Sheet and IosSheet already provide \"sheet\", and Dialog, Popover and side Sheets provide \"page\". Mount it only for a container of your own that presents content like a sheet.",
		placement: "Around the content of a custom sheet-like surface.",
		props: [{ name: "value", type: '"page" | "sheet"', description: "What the subtree is presented in." }],
		companions: ["usePresentation"],
		examples: [
			{
				label: "A custom bottom drawer",
				code: `function Drawer({ children }: { children: ReactNode }) {
	return (
		<PresentationProvider value="sheet">
			<div className="sable-surface-popover bg-popover text-popover-foreground">{children}</div>
		</PresentationProvider>
	)
}`,
				extraImports: ['import type { ReactNode } from "react"'],
			},
		],
		related: ["Sheet", "Card"],
	},
]
