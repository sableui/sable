# NumberTicker

**Status:** stable

A number that rolls to its new value digit by digit, like an odometer. Formatted with Intl.NumberFormat (currency, percent, compact, any locale); separators, signs and units hold still while each digit column turns, and a digit that appears or goes away eases its width so nothing around it jumps. At rest on first paint; under subtle or reduced motion the value simply updates.

**Keywords:** number, counter, odometer, rolling number, animated number, ticker, count up, stat, kpi, metric, price

## Usage

Use NumberTicker for a figure that changes in place while someone is looking at it — a dashboard total after a filter changes, a live count, a price as a plan's options change, a score. The roll says "this number moved, and by roughly this much"; the reader sees the change happen instead of noticing, later, that a number is different.

### Best practices

- Do: Use it for the headline figure that a control on the same screen changes — the total above a chart, the price beside a quantity stepper — so cause and effect are seen together.
- Do: Format through `format` (currency, percent, compact) rather than pre-formatting a string, so separators and units stay put while only the digits roll.
- Do: Pass `aria-live="polite"` only when the change itself is news the reader would otherwise miss; most tickers sit beside the control that changed them and need no announcement.
- Don't: Do not use it for values that change many times a second (a stopwatch, a stock tick, a progress percentage) — the rolls never land and read as a blur. Render the number as plain tabular text.
- Don't: Do not use it for numbers that are names rather than amounts — an order ID, a phone number, a year, a version. Rolling implies a quantity going up or down.
- Don't: Do not animate a number on page load to make it feel alive. The first paint is at rest on purpose; for an entrance, reveal the card it sits in (the Reveal motion primitive).
- Don't: Do not use it for a value inside a known range that needs a picture of how full it is — show a Meter, with the number beside it. → use **Meter**

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | — | The number to show. When it changes, the digits roll to it. |
| format | Intl.NumberFormatOptions | — | How to write the number — `{ style: "currency", currency: "USD" }`, `{ style: "percent" }`, `{ notation: "compact" }`, fraction digits. Passed to Intl.NumberFormat; an inline object is fine (it is compared by value). |
| locales | string \| string[] | runtime locale | BCP 47 locale(s) for the formatting. Digits roll through the locale's own numbering system. |
| prefix | ReactNode | — | Before the number. A string becomes part of the number's text (and rolls in or out with it); an element is rendered as given. |
| suffix | ReactNode | — | After the number ("+", " pts"). A string becomes part of the number's text; an element is rendered as given. |
| trend | "auto" \| "up" \| "down" | "auto" | Which way the digits roll. `auto` rolls up as the value grows and down as it shrinks; `up` / `down` fix it (a countdown, a score that only climbs). |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The roll is expressive, so `subtle` updates the value in place. |
| className | string | — | Merged onto the root span. Set the type tier here (`text-heading-2`, `text-display-lg`); the ticker adds tabular figures so widths hold still. |
| ...span props | Omit<ComponentPropsWithRef<"span">, "children" \| "prefix"> | — | Remaining span attributes pass through to the root — `aria-live` to announce changes, `id`, data attributes. |

## Motion

- **arrival** · Root · _no motion_ — The first paint is at rest. A number counting up on page load is decoration that delays the reading; the roll is kept for the moment the value actually changes.
- **response** · Root · _no motion_ — It is a reading, not a control; the control that changes it gives the feedback.
- **transition** · Digit · _custom (outside the recipe layer)_ — Each digit column turns to its new place on the expressive roll (the slower token, emphasized easing, staggered from the ones column), and arriving or departing columns ease their width. The roll is what shows a change happened and how big it was — the hundreds turning reads as a bigger move than the ones. No recipe can translate per-digit columns, so it is custom; it is multiplied by --motion-expressive, so `subtle` and reduced motion land the value at once.
- **activity** · Root · _no motion_ — A number has no working state; show a Skeleton while it loads.

## Accessibility

- The whole written number (with any string prefix or suffix) is real text in a visually hidden span; the rolling columns are aria-hidden and draw their glyphs as generated content, so screen readers, find-in-page and copy all get "$1,234.50", never a stack of digits.
- It is not a live region by default — a figure that changes because the reader moved a control is already where their attention is. Pass `aria-live="polite"` when a change elsewhere should be announced.
- Tabular figures keep every digit the same width, so a roll never shifts the text around it.

## Related

- Components: Meter, NotificationBadge, PieChart, RadialChart, Sparkline

## Examples

### Basic

```tsx
import { NumberTicker } from "@sableui/react"

<NumberTicker value={1284} className="text-heading-2" />
```

### Currency

```tsx
import { NumberTicker } from "@sableui/react"

<NumberTicker value={4280.5} format={{ style: "currency", currency: "USD" }} className="text-display-lg" />
```

### Percent, announced

```tsx
import { NumberTicker } from "@sableui/react"

<NumberTicker value={0.428} format={{ style: "percent", maximumFractionDigits: 1 }} aria-live="polite" />
```

### Subtle

```tsx
import { NumberTicker } from "@sableui/react"

<NumberTicker value={92} suffix=" pts" motion="subtle" />
```
