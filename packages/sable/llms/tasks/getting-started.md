# Get started with Sable

Sable is on npm as `@sableui/react`. The installed version's `registry.json`
consume block has the exact recipe. Requirements: React 19, React DOM 19, and
Tailwind CSS 4 integrated into your build.

Sable works in any React 19 app and depends on no router, data or form
library. Starting from a blank slate, its suggested stack is React with
TypeScript on Vite, TanStack Router, TanStack Query, TanStack Form for forms with
validation logic, and TanStack Table once a table outgrows `DataTable`
(`sable docs tables-with-tanstack`). An existing app keeps its own.

## Install

```bash
pnpm add @sableui/react
```

## Connect CSS and React

For `src/styles.css` with `node_modules` at the project root:

```css
@import "tailwindcss";
@import "@sableui/react/styles.css";
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";
```

Adjust the relative `@source` path to your stylesheet's location. It makes
Tailwind generate every Sable component's classes; once the app is built,
`sable sources --write src/sable-sources.css` lists just the ones it imports, to
`@import` in its place (`sable check` notes this). Import this stylesheet from
your app entry. For Vite, preserve your plugins and add
`resolve: { dedupe: ["react", "react-dom"] }` to its configuration. Load Figtree
and DM Mono through your font setup, or customize the font tokens.

```tsx
import { Button } from "@sableui/react"
import "./styles.css"

export default function App() {
  return <Button>Save changes</Button>
}
```

No provider or icon dependency is required for this first component. Optional
theme, icon, and motion providers are explained in the package README.

## Connect your agent and verify

```bash
pnpm exec sable setup --agent --dry-run
pnpm exec sable setup --agent
pnpm exec sable doctor
```

After installing Sable, run `pnpm exec sable setup --agent` in the target
project. It installs discoverable entry files in `.agents/skills/sable` for
Codex/Cursor and `.claude/skills/sable` for Claude Code; `--target` selects a host.
In a monorepo where Sable belongs to one workspace package, run setup in that
package with `--root` naming the repository root (for example
`pnpm --filter web exec sable setup --agent --root ../..`); the entries go
there and resolve Sable through the package.
Each entry resolves `skills/sable/SKILL.md` from the installed package, so package
upgrades also update the workflow. Other agents can read that file directly.
Use `$sable build <idea>`, `inspire <references>`, `audit <target>`, or
`polish <target>` in Codex; use `/sable` with the same modes in Claude Code or
Cursor. `create` is a build alias. These are agent modes, not shell commands.

Upgrade with `pnpm update @sableui/react --latest`, then
`pnpm exec sable setup --agent --update`. Setup only replaces managed files
that have not been locally edited; `--dry-run` checks without writing. Keep
project preferences in project instructions. Package installation alone does not
change agent settings. See [building-with-sable.md](./building-with-sable.md),
[creating-a-preset.md](./creating-a-preset.md), and
[using-presets.md](./using-presets.md).
