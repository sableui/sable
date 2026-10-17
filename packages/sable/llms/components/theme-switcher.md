# ThemeSwitcher

**Status:** stable

A segmented light / dark / system switch. Presentational: it renders the selected color preference and reports changes via onValueChange; pair it with useSableTheme() when the app uses SableThemeProvider. A radiogroup of three icon buttons (sun / moon / desktop).

**Keywords:** theme switcher, color mode, dark mode, appearance

## Usage

Use ThemeSwitcher for light, dark, and system color mode preference.

### Best practices

- Do: Use it where users expect appearance controls, such as app chrome or settings.
- Do: Respect persisted system or user preference when initializing the control.
- Don't: Do not use ThemeSwitcher to choose brand themes or component style presets.
- Don't: Do not hand-build another segmented capsule for a different choice. ThemeSwitcher wears the shared segmented look (lib/segmented); for any other single-select switch use ToggleGroup appearance="segmented".
- Don't: Do not omit the `system` option or default to a hardcoded mode. Overriding the OS preference is the single most common accessibility complaint about theme controls.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | "light" \| "dark" \| "system" | — | The currently selected color preference. |
| onValueChange | (value: ThemeMode) => void | — | Called with the next color preference when an option is chosen. |
| label | string | "Theme" | Accessible label for the radiogroup. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. |
| className | string | — | Merged onto the outer radiogroup container. |

## Tokens used

`border`, `card`, `muted-foreground`, `foreground`, `accent`, `accent-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — It arrives with the header or settings row it lives in; a theme control that announces itself competes with the page it themes.
- **response** · Option · `motion-interactive` — The icon steps from muted to foreground under the pointer, which is what tells an icon-only segment it is a control.
- **response** · Option · `motion-press` — A settle under the press confirms the tap on a 28px target before the theme change repaints the page around it.
- **transition** · Active pill · `motion-glide` — One pill slides to the chosen mode, stepping by option + gap on the spacing scale, so light → dark reads as the same control moving, not three icons trading a fill. Expressive: motion="subtle" lands it in place.
- **activity** · Root · _no motion_ — Changing the theme is synchronous; the repaint is the feedback.

## Accessibility

- The container is role="radiogroup" with an aria-label; each option is role="radio" with aria-checked reflecting the selected value.
- Each icon button carries an aria-label (Light / Dark / System) plus a title tooltip, since the visual is icon-only.
- Focus-visible draws a 2px ring on the focused option; selection styling reads from aria-checked.
- Presentational only: it does not change the document theme; pass useSableTheme().setPreference or apply the change in onValueChange.

## Related

- Components: ThemeSelector, Switch, Toggle

## Examples

### Controlled

```tsx
import { ThemeSwitcher, type ThemeMode } from "@sableui/react"

const [theme, setTheme] = useState<ThemeMode>("system")
<ThemeSwitcher value={theme} onValueChange={setTheme} />
```

### With SableThemeProvider

```tsx
import { ThemeSwitcher, useSableTheme } from "@sableui/react"

const { preference, setPreference } = useSableTheme()
<ThemeSwitcher value={preference} onValueChange={setPreference} />
```

### Light selected

```tsx
import { ThemeSwitcher } from "@sableui/react"

<ThemeSwitcher value="light" onValueChange={setTheme} />
```

### Subtle motion

```tsx
import { ThemeSwitcher } from "@sableui/react"

<ThemeSwitcher value={theme} onValueChange={setTheme} motion="subtle" />
```
