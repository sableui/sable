# PageLoader

**Status:** stable

Full-screen branded loading splash: the screen fades in, the mark breathes, and an indeterminate Progress bar pulses beneath it. All motion is token-driven, so it freezes to a calm static screen when motion is off/reduced.

**Keywords:** page loader, loading, route, pending

## Usage

Use PageLoader for full-route or full-page pending states where the entire view is not ready yet.

### Best practices

- Do: Use it during route transitions, auth checks, or initial data loading.
- Do: Prefer a clear page-level message when the wait may take noticeable time.
- Don't: Do not use PageLoader for small inline waits; use Spinner, an indeterminate Progress, or Skeleton. → use **Spinner**, **Progress**, **Skeleton**
- Don't: Do not leave it mounted if the route's data can fail. It covers the whole viewport, so a PageLoader that never resolves is indistinguishable from a hung application — always give it a failure path.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | — | Brand mark / logo shown at center. Falls back to a neutral pulsing mark. |
| label | string | "Loading" | Caption beneath the mark; also the accessible label on the role=status region. |
| fullscreen | boolean | true | Cover the viewport (fixed) vs fill the nearest positioned parent (absolute). |
| hideBar | boolean | false | Hide the indeterminate Progress bar under the mark. |

## Tokens used

`background`, `foreground`, `secondary`, `primary`, `muted-foreground`

## Accessibility

- role=status with an aria-label (the label prop) announces the loading state politely.
- Decorative mark and bar are aria-hidden.
- Motion respects the policy: under off/reduced the pulses hold their first frame (static).

## Related

- Components: Spinner, Skeleton, Progress

## Examples

### Default

```tsx
import { PageLoader } from "@sableui/react"

<PageLoader label="Loading Studio" />
```

### With a logo

```tsx
import { PageLoader } from "@sableui/react"

<PageLoader label="Loading"><img src="/logo.svg" alt="" className="h-10 w-auto" /></PageLoader>
```

### Contained (fills parent)

```tsx
import { PageLoader } from "@sableui/react"

<div className="relative h-80"><PageLoader fullscreen={false} hideBar /></div>
```
