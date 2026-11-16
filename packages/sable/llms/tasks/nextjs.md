# Task: set up Sable in Next.js

This covers the App Router. `sable init` recognises a Next.js app (a `next`
dependency or a `next.config.*` file) and does part of the wiring; the rest it
prints for you to paste. This page is that printed part, plus colour mode
before first paint.

## 1. Install and run init

```bash
pnpm add @sableui/react
pnpm exec sable init --dry-run
pnpm exec sable init
```

On Next.js, `init`:

- installs what is missing: React, React DOM, `tailwindcss` and `@tailwindcss/postcss`;
- writes the Sable imports into `app/globals.css` (or `src/app/globals.css`),
  creating it and importing it from the root layout if there is none;
- writes `postcss.config.mjs` when the app has no PostCSS config, and prints the
  plugin line to add when it has one;
- installs the agent skill, then runs `sable doctor`.

It adds no React dedupe: Next.js resolves its own copy of React. It does not edit
your root layout. The next two steps are what it prints for that file.

The stylesheet it writes, for `app/globals.css` with `node_modules` at the
project root (from `src/app/globals.css` the path starts `../../`):

```css
@import "tailwindcss";
@import "@sableui/react/styles.css";
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";
```

The PostCSS config it writes:

```js
const config = {
	plugins: {
		"@tailwindcss/postcss": {},
	},
}

export default config
```

## 2. Add a providers file

`IconProvider` is required: without it every icon renders nothing, including the
icons inside Sable's components. The icon set is made of components, which a
server layout cannot pass as a prop, so the providers live in a client file.
Create `app/providers.tsx`:

```tsx
"use client"

import type { ReactNode } from "react"
import { IconProvider, SableThemeProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<IconProvider set={reiconIconSet}>
			<SableThemeProvider>{children}</SableThemeProvider>
		</IconProvider>
	)
}
```

`SableThemeProvider` is optional. Keep it when the app offers light, dark and
system, or a theme choice; `init` prints the file with `IconProvider` alone.
`MotionProvider` is optional too and goes in the same file.

## 3. Wire the root layout

Wrap `children` in `Providers`, and load the fonts in `<head>`. `init` prints the
font tags as HTML; in JSX, `crossorigin` is written `crossOrigin`.
`SableThemeScript` applies the stored colour mode before first paint (next
section); it renders a plain inline script, so it can sit in the server layout.

```tsx
import type { ReactNode } from "react"
import { SableThemeScript } from "@sableui/react"
import { Providers } from "./providers"
import "./globals.css"

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<SableThemeScript />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Figtree:wght@300..900&display=swap" rel="stylesheet" />
			</head>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
```

Then run `pnpm exec sable doctor` until it passes.

## Colour mode before first paint

`SableThemeProvider` sets the `dark` class on `<html>` in an effect, after
React hydrates. In a server-rendered page the first paint uses whatever class
the HTML arrived with, so a visitor whose preference is dark sees a light frame
first. `SableThemeScript` closes that gap: it reads the provider's stored
preference and theme with the provider's own keys and applies them before
anything paints. `suppressHydrationWarning` on `<html>` is there because the
script changes its class before React hydrates.

Give the script the same options you give the provider (`defaultPreference`,
`defaultThemeId`, the storage keys, `customThemes`); if they differ, the two
read different keys or fall back to different defaults. Pass `nonce` when a
Content Security Policy requires one. An app that is always dark needs neither:
put `className="dark"` on `<html>` and leave out `SableThemeProvider`, or pass
it a fixed `preference`.

## Pages Router

`init` treats a Next.js app without an `app/` directory as the Pages Router. The
stylesheet is `styles/globals.css` and the PostCSS step is the same. Wrap
`<Component {...pageProps} />` in `IconProvider` in `pages/_app.tsx`, and load
the fonts in `pages/_document.tsx`.

See [color-mode.md](./color-mode.md) for theme switching and alternate themes,
and [troubleshooting.md](./troubleshooting.md) when something renders wrong.
