# SafeArea

**Status:** stable

Pads for device safe-areas (notch, home indicator) on fixed or native-shell surfaces. Wrap fixed bars; content in normal flow rarely needs it.

**Keywords:** safe area, notch, home indicator, fixed chrome

## Usage

Use SafeArea to pad fixed or native-shell surfaces away from device notches and home indicators.

### Best practices

- Do: Use it around fixed headers, bottom bars, and native-shell surfaces.
- Do: Target only the edges that need device inset padding when possible.
- Don't: Do not wrap normal document-flow content in SafeArea unless it actually touches unsafe edges.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| edges | ("top" \| "bottom" \| "left" \| "right")[] | all four | Which edges get env(safe-area-inset-*) padding. |

## Related

- Components: BottomNav, AppHeader, AppShell

## Examples

### Fixed bottom bar

```tsx
import { Button, Row, SafeArea } from "@sableui/react"

<SafeArea edges={["bottom"]} className="fixed inset-x-0 bottom-0 bg-card border-t border-border"><Row gap={2} justify="between" className="p-3"><span className="text-label-md">1 item selected</span><Button size="sm">Continue</Button></Row></SafeArea>
```
