# Task: colour mode and themes

Sable has two independent switches, both set on `<html>`:

- **Colour mode**: light or dark, set by the `dark` class.
- **Design theme**: Sable or another preset, set by the `data-sable-theme`
  attribute. No attribute means the Sable theme.

## Light, dark and system

The Sable theme is designed dark-first, but `:root` carries the light values:
a page renders light until `.dark` is on `<html>`.

For a page that is always dark, put the class in the HTML:

```html
<html lang="en" class="dark">
```

For a page that follows the user, use `SableThemeProvider`. It stores the user's
preference (`light`, `dark` or `system`) in `localStorage`, resolves `system`
through `prefers-color-scheme`, and toggles `.dark` on `<html>`. Its default
preference is `system`; pass `defaultPreference="dark"` to open in dark until
the user chooses. Pair it with `ThemeSwitcher`:

```tsx
import { SableThemeProvider, ThemeSwitcher, useSableTheme } from "@sableui/react"

function ColorModeControl() {
	const { preference, setPreference } = useSableTheme()
	return <ThemeSwitcher value={preference} onValueChange={setPreference} />
}

export function App() {
	return (
		<SableThemeProvider defaultPreference="dark">
			<ColorModeControl />
		</SableThemeProvider>
	)
}
```

Ship both modes unless the brief rules one out, and review the app in each. In
a server-rendered app the provider applies the class after hydration, so render
`<SableThemeScript />` in `<head>`, with the same options as the provider, to
apply it before first paint ([nextjs.md](./nextjs.md)). A static `index.html`
can inline the same script as a string: `sableThemeScript()`.

## Alternate themes

`styles.css` carries the Sable theme only. Every other bundled theme is a
separate stylesheet, scoped to `[data-sable-theme="<id>"]`, that you import
after Sable's:

```css
@import "tailwindcss";
@import "@sableui/react/styles.css";
@import "@sableui/react/theme/prism.css"; /* one theme */
/* or every bundled theme, for a theme picker: */
/* @import "@sableui/react/themes.css"; */
```

Then select it: `setThemeId("prism")` from `useSableTheme()`, or
`<SableThemeProvider defaultThemeId="prism">`. `ThemeSelector` renders a picker
for the bundled themes. Load the fonts each theme declares (`registry.json →
themes.available[].fonts`); a theme names its families but ships no files.

**Symptom of forgetting the stylesheet:** `data-sable-theme` is set, nothing
matches it, and the page renders as the Sable theme with no error. `sable
doctor` fails with a `themes` check when the app selects a theme and imports no
theme CSS.

An app-owned preset works the same way: generate its scoped CSS with `sable
preset --css` and register it through `customThemes`. See
[using-presets.md](./using-presets.md).

## Without the provider

An app that owns this state elsewhere calls the same functions the provider
uses: `applySableColorMode("dark")` toggles the class, and
`applySableTheme("prism")` sets or clears the attribute. Both suppress
transitions for the switch, so controls snap to the new colours instead of
cross-fading.

Sable ships no `dark:` utilities. Add a Tailwind dark variant only if your own
code uses `dark:`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```
