# Task: use a portable preset

Bundled presets are maintained with Sable. Personal presets are app-owned JSON
files that use the same component and token contract. Canvas and the skill read
the same portable format; no separate review app is required.

The schema contains `schemaVersion: 1`, a lowercase slug `id`, `label`, positive
`revision`, authoring `sableVersion`, `defaultMode`, `fonts.sans`/`fonts.mono`
(optional `display`), design `direction`, optional `references`, and
`tokens.shared`, `tokens.light`, and `tokens.dark` objects. Token keys omit `--`.
Both mode objects declare the full semantic color set, including `background`,
`foreground`, `primary`, and their paired roles.
Other supported values include typography, radii, control density, motion,
shadows, spacing, workspace surfaces, and layering. `sable preset --template`
prints a complete starting record; the public `PRESET_TOKEN_NAMES` is authoritative.

Font stacks are requirements, not downloaded fonts. Declare matching stacks in
the font metadata and tokens. Resolve internal palette variables before saving;
portable presets may reference public Sable tokens, not private palette names.
A preset does not carry the generated palette (`bg-blue-500` and the rest): it is
computed from the preset's own primary, page and ink. `theme-palette-harmony`
(0 keeps the families' own hues, 1 is the default lean toward the brand) is the
one palette token a preset may set.
The validator rejects unknown tokens and CSS that can escape its declaration.
`sable preset --check` also holds labels on brand and status fills to 4.5:1 and APCA Lc 60
and suggests a pair that reads; a preset may keep a pair deliberately through
`exceptions` with a reason (see `sable docs creating-a-preset`). Neither certifies
the rendered product's contrast or that a CSS value makes visual sense. Do not
change a supplied preset's colours to clear a finding without asking; report the
finding and the suggested pair.

Motion durations are nominal times at scale 1. `presetCss()` and the CLI connect
them to the live `--motion-scale` policy, so reduced motion still stops recipes.
Keep existing duration or motion-scale references when authoring CSS expressions;
do not freeze the current operating system preference into duration values.

## Import and customize

Open Canvas, choose Export, and import the JSON file. An imported preset is
registered as a custom theme, while the inspector uses the default theme.
Review the Sable component scenes in both modes. Customize, add direction notes,
and download a JSON record. Preserve the original record when developing variants.

## Build a product

Place the file in the target project's `.sable/presets/` directory. Read its exact
ID, revision, tokens, fonts, guidance, and evidence before starting. The product
brief determines content, layout, and behavior; guidance informs those decisions.

```bash
pnpm exec sable preset --check .sable/presets/clay.json --json
pnpm exec sable preset --css .sable/presets/clay.json > src/clay.css
```

Import the generated CSS after Sable's stylesheet. Load the declared fonts.
Register the manifest without editing the library:

```tsx
import { SableThemeProvider } from "@sableui/react"
import { parsePreset, presetManifest } from "@sableui/react/presets"
import record from "../.sable/presets/clay.json"
import "./clay.css"

const preset = parsePreset(record)
const customThemes = [presetManifest(preset)]

export function App() {
  return (
    <SableThemeProvider customThemes={customThemes}
      defaultThemeId={preset.id} defaultPreference={preset.defaultMode}>
      {/* Compose the user's product from Sable components. */}
    </SableThemeProvider>
  )
}
```

`presetCss(preset)` also compiles CSS in browser/build tooling. Generated selectors
are scoped by `data-sable-theme`; importing a stylesheet alone does not activate it.
Use a unique preset ID so it cannot override a bundled theme or another record.
Record any intentional adaptation and run the validation and rendered review in
[building-with-sable.md](./building-with-sable.md).

## Apply to an existing app

A preset pasted into an agent for a running app (Canvas's “Copy for agent”) is a
restyle: the job ends with the app built and rendered in the preset, not with a
saved file. Replace, don't add beside:

1. Save it to `.sable/presets/<id>.json`, overwriting an earlier revision of the
   same ID, and run `sable preset --check`.
2. Regenerate its CSS with `sable preset --css` and import it after Sable's
   stylesheet. Remove the stylesheet of a theme it replaces when nothing else uses it.
3. Load the families its `fonts` stacks name through the app's existing font
   setup, and drop the old theme's font loading when no other code uses it.
   An unloaded family falls back to a system face without any error.
4. Point SableThemeProvider's `defaultThemeId` at the preset ID and
   `defaultPreference` at its `defaultMode`, unless the user asked for another
   mode. A bundled theme left as the default keeps the app on the old look.
5. Run the app's build and type check, then `sable check`, and review the result
   in both modes.

## Upgrade the package and skill

```bash
pnpm update @sableui/react --latest
pnpm exec sable setup --agent --update
pnpm exec sable preset --check .sable/presets/clay.json --json
pnpm exec sable doctor
```

The skill loads instructions from the installed package on every task. Setup
refreshes unchanged managed entry files and preserves local edits. Local presets
and project preferences survive upgrades. `sableVersion` records provenance;
validation uses the current installed token vocabulary. Review the changelog
and recheck the product when upgrading.
