# Task: troubleshooting a Sable app

Most wiring mistakes in a Sable app fail silently: the page renders, just
wrong. Start with the doctor, from the app root:

```bash
pnpm exec sable doctor         # names each problem and its fix; exits 1 on a failure
pnpm exec sable doctor --fix   # applies the fixes that need no judgment, prints the rest
```

Each row below is a check `sable doctor` runs, by the symptom you see.

| Symptom | Cause | Fix | Doctor check |
|---|---|---|---|
| Everything renders unstyled | No `@source` pointing at the package, so Tailwind emits none of Sable's classes | Add `@source "<path to node_modules>/@sableui/react/dist/**/*.{js,mjs}";` after the Sable import, relative to the stylesheet | `css:source` |
| Everything renders unstyled | Tailwind is not in the build, so `@import "tailwindcss"` compiles to nothing | Vite: add `@tailwindcss/vite` and `tailwindcss()` to the plugins. Next.js: add `@tailwindcss/postcss` and a `postcss.config.mjs` | `css:build` |
| Styles look wrong or are overridden | Sable's `styles.css` is imported before `tailwindcss`, or one of them is missing | `@import "tailwindcss";` first, then `@import "@sableui/react/styles.css";` | `css:order`, `css:tailwind`, `css:styles` |
| A component you just added renders unstyled | The `sable sources` list is stale and does not cover it | Rerun `sable sources --write <file>` | `css:sources` |
| No icons anywhere, including inside Sable's components | No `IconProvider` | Wrap the app once in `<IconProvider set={reiconIconSet}>`, with `reiconIconSet` from `@sableui/react/icons/reicon` | `icons` |
| The selected theme looks like the Sable theme | `data-sable-theme` is set but its stylesheet is not imported | Import `@sableui/react/theme/<id>.css`, or `themes.css` for all of them | `themes` |
| Blank page with "invalid hook call" | A second copy of React, usually in a Vite app | Add `resolve: { dedupe: ["react", "react-dom"] }` to the Vite config | `dedupe` |
| Text renders in a system font | Figtree and DM Mono are never loaded | Add the Google Fonts link to the document head | `fonts` |
| The build cannot resolve `@sableui/react`, React or Tailwind | The package is not a dependency, or React 19 or Tailwind 4 is missing | Install it with the project's package manager | `install`, `react`, `react-dom`, `tailwindcss` |

Two more that doctor cannot see:

- **The page is light when you wanted dark.** The theme renders light until
  `.dark` is on `<html>`. See [color-mode.md](./color-mode.md).
- **A dark frame flashes light on load in a server-rendered app.** The theme
  provider applies the class after hydration. Render `<SableThemeScript />` in
  `<head>` ([nextjs.md](./nextjs.md)).

`sable doctor` also warns when the app barely uses Sable's components
(`adoption`). That is not a wiring fault; `sable check src` lists what to swap.
After an upgrade, a doctor failure on a recorded patch means Sable changed the
patched file: rerun the patch's repro and keep or drop it
([patching-a-component.md](./patching-a-component.md)).
