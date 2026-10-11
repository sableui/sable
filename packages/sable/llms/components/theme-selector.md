# ThemeSelector

**Status:** stable

A presentational radiogroup for choosing a Sable design theme from theme manifests — swatch-strip cards for a settings page, or compact rows for tool chrome. Pair it with useSableTheme().themeId and setThemeId when the app uses SableThemeProvider.

**Keywords:** theme selector, theme, appearance, skin, design theme, preset

## Usage

Use ThemeSelector wherever a person picks a theme. The default `cards` layout is page-register furniture: a swatch strip, a name, and a caption only where one distinguishes the card (the default theme, or a single-mode theme), at ~144px tall. Use `layout="list"` in tool chrome, a popover, or any docked panel — five cards is the wrong object for a 256px surface, however it is sized. For colour mode (light/dark/system) use ThemeSwitcher, which is a segmented control and belongs in chrome as-is.

### Best practices

- Do: Use layout="list" in a popover, a menu, or a docked panel. Rows sit on the --control-sm ladder and still show each theme's swatch strip, so the choice stays visible rather than described. Rows take `sable-frame-inner`, so host the list in a sable-frame (`sable-frame sable-surface sable-surface-popover sable-frame-popover` — PopoverContent is not one; give it that class list, or its p-4 leaves the rows unnested) and their corners nest concentrically.
- Do: Pass mode={useSableTheme().mode} so every preview renders in the colour mode actually in use, rather than in each theme's manifest default.
- Do: Load each theme's fonts in the host app. Every card carries a type specimen in that theme's own face so people can compare typography as well as color. A theme whose fonts are not loaded falls back to system-ui, and its specimen stops telling the truth.
- Don't: Add a viewport breakpoint to force a column count — `className="sm:grid-cols-1"` or similar. `sm:` keys off the VIEWPORT, not this component's container, so on a wide screen it does nothing for a narrow parent. The cards grid already reflows on its own width via auto-fit.
- Don't: Put the cards layout in workspace chrome. It was built for a settings page; in a 256px popover the cards clip their labels to a single character and grow to roughly twice their intended height.
- Don't: Use ThemeSelector for light / dark / system colour mode. That is ThemeSwitcher — a segmented control. This picks the design theme, which is a different axis entirely, and the two are frequently confused.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | ThemeId | — | The currently selected Sable design theme id. |
| onValueChange | (themeId: ThemeId) => void | — | Called with the next design theme id when an option is chosen. |
| themes | readonly ThemeManifest[] | themeManifests | Theme manifests to render. Defaults to Sable's built-in themes. |
| mode | "light" \| "dark" | — | Preview mode for each card's swatch strip. Pass useSableTheme().mode to match the current color mode; omitted cards use their manifest defaultMode. |
| label | string | "Design theme" | Accessible label for the radiogroup. |
| layout | "cards" \| "list" | "cards" | Presentation. "cards" is the page-register picker (~144px per card); "list" is one compact --control-sm row per theme, for chrome and popovers. A presentation variant, not a size — "list" is not "cards, smaller" — which is why it is a prop rather than a density scope. |
| className | string | — | Merged onto the outer radiogroup grid. |

## Tokens used

`input`, `card`, `border`, `background`, `primary`, `primary-foreground`, `accent`, `muted`, `muted-foreground`, `ring`

## Accessibility

- The container is role="radiogroup" with an aria-label; each card is a role="radio" button with aria-checked reflecting the selected theme.
- Focus-visible draws a 2px ring on the focused card.
- The selected card wears the shared selection-card checked ring (the same as RadioCard and CheckboxCard), a muted fill and a check icon, so selection does not rely on colour alone.
- Presentational only: it does not change the document theme; pass useSableTheme().setThemeId or apply the change in onValueChange.

## Related

- Components: ThemeSwitcher, Popover, RadioCard

## Examples

### With SableThemeProvider

```tsx
import { ThemeSelector, useSableTheme } from "@sableui/react"

const { themeId, setThemeId, themes, mode } = useSableTheme()
<ThemeSelector value={themeId} onValueChange={setThemeId} themes={themes} mode={mode} />
```

### Controlled

```tsx
import { ThemeSelector, type ThemeId } from "@sableui/react"

const [themeId, setThemeId] = useState<ThemeId>("sable")
<ThemeSelector value={themeId} onValueChange={setThemeId} />
```

### In chrome — a popover or a docked panel

```tsx
import { PopoverContent, ThemeSelector, ThemeSwitcher } from "@sableui/react"

// Five 144px cards is the wrong object for a 256px surface. Rows are.
<PopoverContent align="end" className="w-64 p-3">
  <ThemeSwitcher value={preference} onValueChange={setPreference} />
  <ThemeSelector layout="list" value={themeId} onValueChange={setThemeId} mode={mode} />
</PopoverContent>
```

### Do not reach for a viewport breakpoint

```tsx
import { ThemeSelector } from "@sableui/react"

// ✗ `sm:` keys off the VIEWPORT, not this component's container. On a wide
//   screen it does nothing at all for a narrow parent — and this exact
//   workaround, once documented here, is how the cards layout ended up in a
//   256px popover clipping "Default" to "D".
<ThemeSelector className="sm:grid-cols-1" value={themeId} onValueChange={setThemeId} />

// ✓ The cards grid already reflows on its own width (auto-fit, 9rem tracks).
//   For a genuinely narrow surface, change the presentation instead.
<ThemeSelector layout="list" value={themeId} onValueChange={setThemeId} />
```
