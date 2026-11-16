# Get started with Sable

Sable is on npm as `@sableui/react`. It needs React 19 and Tailwind CSS 4;
`sable init` installs whichever is missing. The installed version's
`registry.json` consume block has the same recipe in machine-readable form, and
`AGENTS.md → Wire it up` has every step in full.

Sable works in any React 19 app and depends on no router, data or form
library. Starting from a blank slate, its suggested stack is React with
TypeScript on Vite, TanStack Router, TanStack Query, TanStack Form for forms with
validation logic, and TanStack Table once a table outgrows `DataTable`
(`sable docs tables-with-tanstack`). An existing app keeps its own.

## 1. Install the package

```bash
pnpm add @sableui/react
```

Use your project's package manager; no registry setup or token is needed.

## 2. Run sable init

From the app root. `--dry-run` lists every change first; nothing is written
until you run it without the flag.

```bash
pnpm exec sable init --dry-run
pnpm exec sable init
```

It reads your package manager from the lockfile and your framework from the
project. It installs what is missing (React, Tailwind and its build plugin),
writes the stylesheet imports in order, installs the agent skill with a short
block in `AGENTS.md` and `CLAUDE.md` that sends every UI request through it, and
finishes with `sable doctor`.

In a Vite app it also adds the Tailwind plugin and React dedupe to the Vite
config, adds the Figtree and DM Mono links to `index.html`, and wraps the
starter's `<App />` in `IconProvider`. In a Next.js app it writes a PostCSS
config and prints the providers file and font tags for you to paste;
[nextjs.md](./nextjs.md) has the whole layout. It does not add antialiasing,
alternate theme CSS or the optional providers.

Anything it cannot change safely, such as an unfamiliar config, is printed as a
snippet with the file it belongs in. In an app that is already set up,
`sable doctor --fix` applies the same fixes to whatever doctor flags. Run
`sable init` with the package installed: before that, `npx sable` names an
unrelated package.

## 3. Render a component

```tsx
import { Button } from "@sableui/react"

export default function App() {
  return <Button>Save changes</Button>
}
```

## Update Sable

```bash
pnpm exec sable upgrade
```

It updates `@sableui/react`, then runs the new version's `init`: the skill
entries and the `AGENTS.md` / `CLAUDE.md` block are refreshed and the wiring is
checked. It is safe on an app that already works. Coming from 0.17 or earlier,
which has no `upgrade` command, do it once by hand:

```bash
pnpm update @sableui/react --latest
pnpm exec sable init
```

If an agent built your UI without Sable's components, tell it to "move this app
onto Sable". It lists what to swap and asks before changing anything
([auditing-an-app.md](./auditing-an-app.md), Adoption).

## Wire it by hand

What `sable init` does in a Vite app, for setups it does not recognise or for
checking its work.

```bash
pnpm add @sableui/react
pnpm add -D tailwindcss @tailwindcss/vite
```

The `@source` path is relative to the stylesheet; this one assumes
`src/styles.css` with `node_modules` at the project root.

```css
@import "tailwindcss";
@import "@sableui/react/styles.css";
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";
```

That `@source` makes Tailwind generate every Sable component's classes; once
the app is built, `sable sources --write src/sable-sources.css` lists just the
ones it imports, to `@import` in its place (`sable check` notes this).

Connect Tailwind and add React dedupe in `vite.config.ts`, keeping your existing
plugins:

```ts
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ["react", "react-dom"] },
})
```

Mount `IconProvider` once at the root in `src/main.tsx`: without it every icon,
including those inside Sable's components, renders nothing, and `sable doctor`
fails.

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { IconProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import App from "./App"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconProvider set={reiconIconSet}>
      <App />
    </IconProvider>
  </StrictMode>,
)
```

Load Figtree and DM Mono in `index.html`, or choose your own fonts with the
theme tokens; the package includes no font files.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Figtree:wght@300..900&display=swap" rel="stylesheet" />
```

Then set up your agent and check the wiring:

```bash
pnpm exec sable setup --agent
pnpm exec sable doctor
```

## Build with an agent

`sable init` already set your agent up. Ask for what you want in plain words;
[building-with-sable.md](./building-with-sable.md) covers the modes, presets and
commands, and `AGENTS.md → The Sable agent skill` covers setup in a monorepo,
the Stop hook and what setup writes. Starting from an empty project? Give your
coding agent this prompt:

```text
Set up Sable in this React project.
Install @sableui/react from npm with this project's package manager.
Run pnpm exec sable init --dry-run, read what it will change, then run pnpm exec sable init.
Apply every step it prints as manual, in the file it names, then run pnpm exec sable doctor until it passes.
Read the installed package's AGENTS.md before building, then build and inspect the result.
```

## Where to go next

- [nextjs.md](./nextjs.md): the providers file, fonts and colour mode before first paint.
- [color-mode.md](./color-mode.md): a dark default, the theme switcher, alternate theme CSS.
- [troubleshooting.md](./troubleshooting.md): unstyled, iconless, blank or wrong-theme pages.
- [converting-an-app.md](./converting-an-app.md): migrate an existing app, including one built on shadcn/ui.
- [building-with-sable.md](./building-with-sable.md): the agent modes, presets and the CLI.
