# Task: building an iOS app prototype

An iOS prototype is a clickable iPhone app that runs in the browser, for demos,
presentations and user testing. It is not a native app and not for production.

## The rule: Sable first

**Every screen is built from Sable components, in the chosen preset.** Rows,
lists, inputs, switches, sliders, search, selects, buttons, forms, toasts,
empty states, cards and all content are Sable — exactly as on the web.

The Sable iOS adapter (`@sableui/react/ios`) supplies only the iOS **system
chrome** Sable has no equivalent for:

| Chrome | Adapter |
| --- | --- |
| App frame, status bar, safe areas | `NativeApp` |
| A screen | `IosPage` |
| Navigation bar: title, large title, back, bar actions | `IosNavbar`, `IosBackLink`, `IosIconButton` |
| Tab bar | `IosTabbar`, `IosTab` |
| Sheet presentation (detents, drag, Escape) | `IosSheet` (its content is Sable) |
| Push and pop between screens | `NavigationStack`, `useNavigation` |

**Never import from `konsta`.** Konsta is the adapter's optional peer, not a
component library for the app; `sable-lint` flags a direct import
(`native-ui-import`). If a screen needs something Sable does not have, report
it as a library gap; do not reach for a native control or hand-build one.

`sable target ios --component <Name> --json` gives the decision for any
component: `preserve` (use the Sable component — almost everything),
`replace` (an adapter chrome component), `contextual` (Button and PageHeader:
the adapter only in the navigation bar, Sable everywhere else), `recompose`
(desktop patterns rebuilt from Sable parts for a phone, e.g. a table becomes
Entity rows in a Card) or `redesign` (desktop workspace tools).

## How iOS screens look in Sable

- **Grouped settings:** a section heading (`text-title-sm text-muted-foreground`)
  over a `Card` with `CardList` and `Entity` rows; a `Switch`, value text or
  chevron in each row's `action`.
- **Forms:** `Form` with `Field` around `Input`, `Textarea`, `Select`, `Slider`.
- **Lists that drill down:** interactive `Entity` rows in a `Card` that call
  `useNavigation().push(id, <NextScreen />)`.
- **Search:** `SearchInput` on the page margin.
- **Feedback:** `toast()` inside `ToastProvider`; `EmptyState` for no results.
- Align content to the native page margin with `px-(--ios-inset)` so it lines
  up with large titles. The adapter spaces a screen's first content below its
  title.

## Setup

1. Install `konsta` in the consuming project only when an iOS prototype is
   requested (`pnpm add konsta`). It is the adapter's optional peer.
2. Give the prototype its own HTML entry, separate from the web app, with one
   stylesheet:

   ```css
   @import "tailwindcss";
   @import "@sableui/react/styles.css";
   @import "@sableui/react/theme/verdant.css"; /* the preset, or themes.css */
   @import "@sableui/react/ios/styles.css";
   @source "../node_modules/@sableui/react/dist";
   ```

   Set the preset with `data-sable-theme` on `<html>`. The adapter maps the
   preset onto the chrome (background, ink, accent, fonts), so chrome and
   content follow the same preset and light or dark mode. It pins Tailwind's
   spacing and radii on the chrome only, so a preset's density and corners
   reach your Sable content and the chrome keeps iOS geometry.
3. Compose: `NativeApp` at the root (`mode` sets light or dark, also on
   `<html>` so portaled Sable popups follow); one `NavigationStack` per tab,
   each holding an `IosPage` with an `IosNavbar` and Sable content; an
   `IosTabbar` of `IosTab`s with Sable `Icon`s; `IosSheet` around Sable forms
   (`background="opaque"` for a form at the medium detent, and the block
   `framed={false}`: the sheet is already its surface).
   Keep the app's `IconProvider`.
4. Frame it on a host page with `PhoneFrame` from `@sableui/react/ios/preview`
   and `@sableui/react/ios/frame.css` (Sable's Phone around an iframe at
   402×874, scaled as a whole device). `fit="contain"` with a height in
   `className` keeps the whole device on screen. Shown on a real phone with no
   frame, pass `systemChrome={false}` to `NativeApp`: the device draws its own
   status bar and home indicator, and the safe areas come from it. To follow a host's live look, call
   `useIosPreviewBridge(frameRef, { mode })` on the host and
   `useIosPreviewTheme()` in the prototype.
5. Verify light and dark, keyboard focus, reduced motion, back and edge swipe,
   independent tabs, sheet drag, Escape and cancel, form validation and save,
   and empty-state recovery. Run `sable-lint` over the prototype: it is a Sable
   app and the same rules apply.

## Geometry hooks

`--ios-inset` (16px page margin), `--ios-safe-top` (62px), `--ios-header-height`,
`--ios-tabbar-bottom`, `--ios-content-bottom` and `--ios-motion`, for the
standard 402×874 phone. Reduced transparency removes the glass blur.

## Engineering handoff

The prototype's colors, fonts, radii and spacing are the preset's tokens.
Engineers take styles from the preset export (Customize → Export, or
`sable preset`), not code from the prototype.

Platform: iOS 27 on a 6.3" iPhone Pro. Chrome by Konsta UI 5.5 (MIT) through
the adapter.

```sh
sable target ios --json
sable target ios --component Switch --json     # preserve: Sable Switch
sable target ios --component BottomNav --json  # replace: IosTabbar + IosTab
sable target ios --component Button --json     # contextual: Sable except in the nav bar
```
