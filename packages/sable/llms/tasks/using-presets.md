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
The validator rejects unknown tokens and CSS that can escape its declaration.
It does not certify contrast or that a CSS value makes visual sense.

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
