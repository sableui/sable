import { Radio as RadioBase } from "@base-ui/react/radio"
import type { ComponentPropsWithRef } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { SELECTION_CARD_CHECKED, SELECTION_CARD_SHELL } from "../../lib/selection-card"
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
 * ThemeSelector - a presentational card radiogroup for Sable design themes.
 * Pair it with useSableTheme().themeId / setThemeId when the app uses
 * SableThemeProvider.
 *
 * Built on Sable's RadioGroup over Base UI's Radio, so the roles,
 * `aria-checked`, the single tab stop and arrow-key selection come from Base UI
 * (the hand-rolled `role="radio"` buttons this replaced had no arrow keys).
 * Sable's `<Radio>` is the dot-in-a-ring control and takes no content; a card
 * or a row is its own skin, so each option renders Base UI's Radio.Root.
 */
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
				{themes.map((theme) => {
					const checked = theme.id === value
					const previewMode = mode ?? theme.defaultMode
					return (
						<RadioBase.Root
							key={theme.id}
							value={theme.id}
							// Native activation, as in Sable's Radio (see radio.tsx).
							render={<button type="button" />}
							nativeButton
							className={cn(
								// sable-frame-inner: concentric inside a sable-frame host (a frame-styled
								// popover, a docked panel); the theme's small radius anywhere else.
								"flex h-(--control-sm) w-full items-center gap-2 px-1.5 text-start motion-interactive sable-frame-inner",
								// Menu / Select rows' fills and ink, so a theme list beside a
								// menu reads as the same kind of row.
								"hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
								"aria-checked:bg-accent aria-checked:text-accent-foreground",
							)}
						>
							<span
								data-sable-theme={theme.id}
								className={cn(
									"grid h-4 w-8 shrink-0 grid-cols-4 overflow-hidden rounded-xs border border-border bg-background",
									previewMode === "dark" && "dark",
								)}
								aria-hidden
							>
								<span className="bg-background" />
								<span className="border-l border-border bg-card" />
								<span className="border-l border-border bg-primary" />
								<span className="border-l border-border bg-accent" />
							</span>
							{/* The label is set in the theme's OWN typeface. There is no room for a
							    specimen row at --control-sm, and rendering the name in the face it
							    selects costs no space at all — the same trick a font picker uses, and
							    the only thing that separates two achromatic themes here. */}
							<span
								className="min-w-0 flex-1 truncate text-ui-md text-foreground"
								style={{ fontFamily: theme.fonts.display ?? theme.fonts.sans }}
							>
								{theme.label}
							</span>
							<span
								className={cn(
									"shrink-0 text-primary motion-interactive",
									checked ? "opacity-100" : "opacity-0",
								)}
								aria-hidden
							>
								<Icon name="check" className="text-xs" />
							</span>
						</RadioBase.Root>
					)
				})}
			</RadioGroup>
		)
	}

	return (
		<RadioGroup
			ref={ref}
			aria-label={label}
			value={value}
			onValueChange={(next) => onValueChange(next as ThemeId)}
			// Sized off its OWN width, not the viewport. This was
			// `grid-cols-1 sm:grid-cols-3`, and `sm:` is a viewport breakpoint — so
			// in a 256px popover on a wide screen it forced three columns into 256px,
			// leaving ~44px of content per card. "Default" clipped to "D" and the mode
			// caption wrapped one word per line. A component cannot know its
			// container's width from a media query; auto-fit reflows on the real one.
			// `relative` holds Base UI's visually-hidden radio inputs inside the group.
			className={cn("relative grid grid-cols-[repeat(auto-fit,minmax(--spacing(36),1fr))] gap-3", className)}
			{...props}
		>
			{themes.map((theme) => {
				const checked = theme.id === value
				const previewMode = mode ?? theme.defaultMode
				const caption = themeCaption(theme, defaultThemeId)
				return (
					<RadioBase.Root
						key={theme.id}
						value={theme.id}
						// Native activation, as in Sable's Radio (see radio.tsx).
						render={<button type="button" />}
						nativeButton
						// The selection-card shell RadioCard and CheckboxCard wear, with
						// its neutral checked ring: one selected-card look, not a third.
						className={cn(
							SELECTION_CARD_SHELL,
							SELECTION_CARD_CHECKED.neutral,
							"min-h-36 w-full flex-col gap-3 rounded-lg focus-visible:outline-none",
						)}
					>
						<span
							data-sable-theme={theme.id}
							className={cn(
								"block h-14 w-full overflow-hidden rounded-concentric-lg/4 border border-border bg-background",
								previewMode === "dark" && "dark",
							)}
							aria-hidden
						>
							<span className="grid h-7 grid-cols-4">
								<span className="bg-background" />
								<span className="border-l border-border bg-card" />
								<span className="border-l border-border bg-primary" />
								<span className="border-l border-border bg-accent" />
							</span>
							{/* Type specimen.

							    Four colour bands cannot distinguish two achromatic themes at
							    all: measured, the flattest preset sits at 0.7 and the boldest at 3.3 mean
							    channel spread out of 255, so their strips are effectively
							    identical. What separates them is the typeface — Inter + Martian
							    Mono against Figtree + DM Mono — and that was invisible in the
							    one place a person chooses between them.

							    Shows `display` where a theme has one, since that is its most
							    distinctive face, and `sans` otherwise. Fits inside the same
							    h-14 by halving the colour strip, so cards did not grow. */}
							<span className="flex h-7 items-center gap-1.5 border-t border-border px-2">
								<span
									className="text-title-lg text-foreground"
									style={{ fontFamily: theme.fonts.display ?? theme.fonts.sans }}
								>
									Ag
								</span>
								<span
									className="text-mono-caption text-muted-foreground"
									style={{ fontFamily: theme.fonts.mono }}
								>
									01
								</span>
							</span>
						</span>
						<span className="flex min-w-0 items-start justify-between gap-3">
							<span className="min-w-0">
								<span className="block truncate text-title-sm">{theme.label}</span>
								{/* truncate, like the name above it. Without it this caption wrapped
								    one word per line as soon as the card got narrow, which is what
								    turned a 144px card into a 280px one. */}
								{caption ? (
									<span className="mt-1 block truncate text-caption text-muted-foreground">
										{caption}
									</span>
								) : null}
							</span>
							<span
								className={cn(
									"grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground motion-interactive",
									checked ? "opacity-100" : "opacity-0",
								)}
								aria-hidden
							>
								<Icon name="check" className="text-xs" />
							</span>
						</span>
					</RadioBase.Root>
				)
			})}
		</RadioGroup>
	)
}
ThemeSelector.displayName = "ThemeSelector"
