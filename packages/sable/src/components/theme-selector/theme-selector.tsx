import { Radio as RadioBase } from "@base-ui/react/radio"
import type { ComponentPropsWithRef } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { RadioGroup } from "../radio/radio"
import type {
	ThemeManifest,
	ThemeMode as ThemeSelectorPreviewMode,
} from "../../themes/_contract"
import {
	defaultThemeId,
	featuredThemeManifests,
	type ThemeId,
} from "../../themes/registry"

export interface ThemeSelectorProps
	extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
	/** The currently selected Sable design theme id. */
	value: ThemeId
	/** Called with the next design theme id when an option is chosen. */
	onValueChange: (themeId: ThemeId) => void
	/** Theme manifests to render. Defaults to Sable's built-in themes. */
	themes?: readonly ThemeManifest[]
	/**
	 * Preview mode for each card's swatch strip. Pass useSableTheme().mode to
	 * match the current color mode; omitted cards use their manifest defaultMode.
	 */
	mode?: ThemeSelectorPreviewMode
	/** Accessible label for the group. @default "Design theme" */
	label?: string
	/**
	 * Presentation.
	 *
	 * - `cards` (default) — the page-register picker: a swatch strip, name, and
	 *   caption per card. Wants a settings page or a wide panel.
	 * - `list` — one compact row per theme. For tool chrome and popovers, where
	 *   five 144px cards are simply the wrong object.
	 *
	 * This is a genuine presentation variant rather than a size, which is why it
	 * is a prop and not a density scope: `list` is not "cards, smaller".
	 */
	layout?: "cards" | "list"
}

/**
 * The card caption — `null` when there is nothing worth saying.
 *
 * This used to render `themeModeLabel` for every non-default theme, which meant
 * "light / dark modes" on four of the five built-in themes: identical text under
 * four cards, differentiating none of them, in the one slot a picker has to tell
 * options apart. A caption that is the same everywhere is not a caption, it is
 * texture.
 *
 * So it speaks only when it distinguishes: which theme is the default, and which
 * themes cannot follow the color mode. Supporting both modes is the norm and
 * needs no line — the cards keep their height from `min-h-36`, so an absent
 * caption does not make a ragged grid.
 */
function themeCaption(theme: ThemeManifest, defaultId: string): string | null {
	if (theme.id === defaultId) return "Default"
	if (theme.modes.length === 1) {
		const mode = theme.modes[0]
		return `${mode[0].toUpperCase()}${mode.slice(1)} only`
	}
	return null
}

/**
 * A theme, drawn as a sliver of its own interface: its background, "Aa" in its
 * display face, a card and a primary button. The tile carries the theme's scope
 * (`data-sable-theme`, plus `.dark` / `.light`), so every token inside it, the
 * tile's own corners included, resolves to the previewed theme, not the app's.
 *
 * The button and card corners are the theme's real radii scaled to the
 * miniature, because shape is the half of a theme a colour strip never showed:
 * Meridian's square controls, Poppy's soft 12px, Sable's capsule. The old card
 * was four flat colour blocks, and four of six themes came out as the same
 * white-and-black strip.
 *
 * `.light` is set explicitly, not only `.dark`: theme CSS matches
 * `.dark [data-sable-theme]:not(.light)`, so under a dark page a "light"
 * preview without it painted dark.
 */
export interface ThemePreviewProps {
	/** The theme to draw. */
	theme: ThemeManifest
	/** Which of its modes to draw. @default the theme's defaultMode */
	mode?: ThemeSelectorPreviewMode
	/** `md` is the picker tile; `sm` is the row-sized chip a list row or a "current theme" trigger shows. @default "md" */
	size?: "md" | "sm"
}

/**
 * Exported for anywhere that shows a theme outside the picker, e.g. a trigger
 * row naming the current preset before it opens the list.
 */
export function ThemePreview({ theme, mode = theme.defaultMode, size = "md" }: ThemePreviewProps) {
	const face = { fontFamily: theme.fonts.display ?? theme.fonts.sans }
	// The unit is captured here, in the caller's scope, when no picker option
	// above has already done it, so a standalone tile is sized like a picked one.
	return (
		<span className="contents [--picker-u:var(--picker-option-u,var(--spacing))]">
		<span
			data-sable-theme={theme.id}
			aria-hidden
			className={cn(
				mode,
				"shrink-0 overflow-hidden border border-border bg-background text-foreground",
				// Sized in the APP's spacing unit (--picker-u, resolved on the option):
				// inside this scope `h-16` meant the previewed theme's unit, and themes
				// set different ones, so Prism's tile came out shorter than Poppy's and
				// the names below no longer lined up.
				size === "md"
					? [
							"grid h-[calc(var(--picker-u)*16)] w-full grid-cols-[1fr_auto] gap-[calc(var(--picker-u)*2)] rounded-md p-[calc(var(--picker-u)*2)]",
							// The selection outline, in the APP's ink: --picker-* are resolved on
							// the option, outside this scope, so they arrive as the app's colours.
							// (A list row shows selection with its own fill instead.)
							"outline-offset-2 motion-interactive",
							"group-hover:outline-1 group-hover:outline-[color-mix(in_oklab,var(--picker-ink)_35%,transparent)]",
							"group-aria-checked:outline-2 group-aria-checked:outline-(--picker-ink)",
							"group-focus-visible:outline-2 group-focus-visible:outline-(--picker-focus)",
						]
					: "flex h-[calc(var(--picker-u)*6)] w-[calc(var(--picker-u)*11)] items-center justify-between gap-[calc(var(--picker-u)*1)] rounded-xs px-[calc(var(--picker-u)*1.5)]",
			)}
		>
			{size === "md" ? (
				<>
					<span className="flex min-w-0 flex-col justify-between">
						<span className="text-title-lg leading-none" style={face}>
							Aa
						</span>
						<span className="h-[calc(var(--picker-u)*3.5)] w-[calc(var(--picker-u)*10)] rounded-[calc(var(--button-radius,9999px)*0.35)] bg-primary" />
					</span>
					{/* A card, legibly one: a raised panel with two lines of "text". */}
					<span className="flex w-[calc(var(--picker-u)*11)] flex-col justify-end gap-[calc(var(--picker-u)*1)] rounded-[calc(var(--radius-lg)*0.4)] border border-border bg-card p-[calc(var(--picker-u)*1.5)]">
						<span className="h-[calc(var(--picker-u)*1)] w-full rounded-full bg-foreground/70" />
						<span className="h-[calc(var(--picker-u)*1)] w-2/3 rounded-full bg-muted-foreground/40" />
					</span>
				</>
			) : (
				<>
					<span className="text-caption leading-none" style={face}>
						Aa
					</span>
					<span className="h-[calc(var(--picker-u)*2)] w-[calc(var(--picker-u)*3.5)] rounded-[calc(var(--button-radius,9999px)*0.2)] bg-primary" />
				</>
			)}
		</span>
		</span>
	)
}

/**
 * The option's own ink, focus colour and spacing unit, resolved in the app's
 * scope before the tile re-scopes to the previewed theme.
 */
const PICKER_INK = "[--picker-ink:var(--foreground)] [--picker-focus:var(--ring)] [--picker-option-u:var(--spacing)]"

export function ThemeSelector({
	value,
	onValueChange,
	themes = featuredThemeManifests,
	mode,
	label = "Design theme",
	layout = "cards",
	className,
	ref,
	...props
}: ThemeSelectorProps) {
	if (layout === "list") {
		return (
			<RadioGroup
				ref={ref}
				aria-label={label}
				value={value}
				onValueChange={(next) => onValueChange(next as ThemeId)}
				className={cn("relative flex flex-col gap-0.5", className)}
				{...props}
			>
				{themes.map((theme) => (
					<RadioBase.Root
						key={theme.id}
						value={theme.id}
						// Native activation, as in Sable's Radio (see radio.tsx).
						render={<button type="button" />}
						nativeButton
						className={cn(
							// sable-frame-inner: concentric inside a sable-frame host (a frame-styled
							// popover, a docked panel); the theme's small radius anywhere else.
							"group flex h-(--control-sm) w-full items-center gap-2 px-1.5 text-start motion-interactive sable-frame-inner",
							PICKER_INK,
							// Menu / Select rows' fills and ink, so a theme list beside a
							// menu reads as the same kind of row.
							"hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
							"aria-checked:bg-accent aria-checked:text-accent-foreground",
						)}
					>
						<ThemePreview theme={theme} mode={mode ?? theme.defaultMode} size="sm" />
						{/* The name in the app's face: the tile already shows the theme's,
						    and names set in six faces made a ragged column. */}
						<span className="min-w-0 flex-1 truncate text-ui-md">{theme.label}</span>
						<Icon name="check" className="shrink-0 text-xs text-primary opacity-0 motion-interactive group-aria-checked:opacity-100" />
					</RadioBase.Root>
				))}
			</RadioGroup>
		)
	}

	return (
		<RadioGroup
			ref={ref}
			aria-label={label}
			value={value}
			onValueChange={(next) => onValueChange(next as ThemeId)}
			// Sized off its OWN width, not the viewport (a media query cannot know a
			// popover's width). `relative` holds Base UI's visually-hidden inputs.
			className={cn("relative grid grid-cols-[repeat(auto-fill,minmax(--spacing(32),1fr))] gap-x-3 gap-y-4", className)}
			{...props}
		>
			{themes.map((theme) => {
				const caption = themeCaption(theme, defaultThemeId)
				return (
					<RadioBase.Root
						key={theme.id}
						value={theme.id}
						// Native activation, as in Sable's Radio (see radio.tsx).
						render={<button type="button" />}
						nativeButton
						className={cn("group flex min-w-0 flex-col gap-2 text-start focus-visible:outline-none", PICKER_INK)}
					>
						<ThemePreview theme={theme} mode={mode ?? theme.defaultMode} size="md" />
						{/* One line, so every option is the same height whether or not it has a caption. */}
						<span className="flex min-w-0 items-baseline gap-1.5">
							<span className="truncate text-label-md text-muted-foreground motion-interactive group-hover:text-foreground group-aria-checked:text-foreground">
								{theme.label}
							</span>
							{caption ? <span className="shrink-0 truncate text-caption text-muted-foreground">{caption}</span> : null}
						</span>
					</RadioBase.Root>
				)
			})}
		</RadioGroup>
	)
}
ThemeSelector.displayName = "ThemeSelector"
