# Phone

**Status:** stable

A current smartphone frame at iPhone proportions: a dark body with a titanium band, thin bezels, an island, an optional status bar and a scrollable screen.

**Keywords:** phone, device mockup, mobile preview, frame

## Usage

Use Phone to frame a mobile product preview when the device context is useful.

### Best practices

- Do: Use it for mobile UI demos, screenshots, and responsive previews.
- Do: Keep the framed content legible and avoid stuffing full desktop layouts into the phone frame.
- Don't: Do not use Phone as a generic panel, card, or production app shell.
- Don't: Do not use it to test responsive behaviour. The frame is a fixed aspect box, not a viewport, so media queries inside key off the real window.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | — | Content rendered inside the scrollable screen region. |
| statusBar | boolean | true | Draw a status bar (time, signal, battery) across the top of the screen. Turn it off to frame a screenshot that already has one. |
| systemChrome | boolean | true | Draw the camera pill and home indicator. Turn it off when the content draws its own system chrome, such as an iOS prototype framed by PhoneFrame from @sableui/react/ios/preview. |
| className | string | — | Additional classes merged onto the outer wrapper (set the width here; the screen keeps its proportions). |

## Tokens used

`background`, `foreground`

## Accessibility

- Purely presentational frame; the screen region scrolls when content overflows. Add headings/landmarks in the content as needed.
- The frame's chrome (status bar, camera, buttons) is aria-hidden, so the content inside carries the entire accessible meaning. A screenshot with no alt text makes the whole mockup announce as nothing at all.

## Related

- Components: Browser

## Examples

### Framing a mobile layout

```tsx
import { Phone } from "@sableui/react"

<Phone><div className="p-4"><h2 className="text-title-lg">Activity</h2><p className="text-body-sm text-muted-foreground">3 new collects today.</p></div></Phone>
```

### Mockup, not a responsive preview

```tsx
import { Phone } from "@sableui/react"

// Phone is DECORATIVE framing for a mobile screenshot on a marketing surface.

<Phone>
  <img src="/screenshots/mobile.png" alt="The mobile app" />
</Phone>

// ✗ Using it to test responsive layout. The frame is a fixed aspect box, not a
//   viewport — media queries inside it key off the real window, so what you see
//   is not what a phone renders. Resize the browser, or use device emulation.
// ✗ Wrapping live, interactive app UI (forms, buttons that act). Same as Browser: the frame says "picture of
//   software", so real controls inside it read as a screenshot that moves. Static composed content is fine.
//   The exception is a clickable iOS prototype: PhoneFrame (@sableui/react/ios/preview)
//   frames a whole phone-sized document in an iframe, where the frame is the device.
```
