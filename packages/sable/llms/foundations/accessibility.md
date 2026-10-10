# Accessibility

Sable's components ship accessible behavior from Base UI. These rules cover what an app composing them still has to get right.

**WCAG AA · 44px targets · visible focus · reduced motion · logical properties**

## Floors

| Name | Value | Use |
|---|---|---|
| `Contrast` | 4.5:1 text · 3:1 UI and large text | Every semantic text/surface pair is checked per theme by contrast.test.ts. |
| `Hit area` | 44×44px | hit-target keeps a small control at the floor without moving layout. |
| `Focus` | ring-2 ring-ring, full opacity | Visible on every interactive element, in light, dark and forced-colors. |
| `Mobile input text` | ≥ 16px | iOS Safari zooms the page on focus below it. |
| `Reduced motion` | --motion-scale: 0 | Transitions resolve instantly; loaders hold their first frame. |

## Rules

1. **Use the component, not a div with a click handler.** Base UI supplies roles, keyboard handling and focus management. A clickable div has none of them.
2. **Every control has an accessible name.** Icon-only buttons take aria-label. Fields take a <Label> through <Field>, which also wires aria-describedby and aria-invalid.
3. **A live region exists before it has anything to say.** Render role="status" empty from the start and swap its text. A region inserted together with its content is announced inconsistently.
4. **On client-side navigation, update document.title and move focus to the new view's h1.** Route changes are silent to assistive technology unless the app announces them. AppShell supplies the skip link and landmarks; the app does the rest.
5. **Keep submit enabled; validate on submit and focus the first invalid field.** A disabled submit hides why it is disabled. Focus is the only way a screen-reader user finds the error.
6. **Use logical properties: ms-/me-/ps-/pe-/text-start/inset-inline-*.** Flex and grid mirror for free under dir="rtl"; hand-positioned elements do not. *Enforced by design-lint: physical-direction (ratchet).*
7. **Decorative layers over content take pointer-events-none and aria-hidden.** Scrims, glows and fades otherwise swallow clicks on the controls beneath.
8. **Check focus and disabled states under forced-colors: active.** Windows High Contrast overrides ring colors and erases opacity-based disabled styling.

## Never

- **Never:** Color as the only signal (a red border with no message). **Instead:** Color plus text or an icon. Roughly 1 in 12 men cannot tell red from green.
- **Never:** Opacity on the focus ring. **Instead:** ring-ring at full opacity; tune the token in the theme. A faded ring loses the contrast the theme tested. *Enforced by sable-lint: faded-focus-ring.*
- **Never:** Blocking paste, or type="number" for codes and card numbers. **Instead:** type="text" inputMode="numeric" with the right autocomplete. Blocking paste breaks password managers; number inputs scroll-change identifiers.
- **Never:** forced-color-adjust: none to 'fix' high-contrast mode. **Instead:** Let the system colors apply; verify the result. It removes the user's chosen colors exactly where they need them.
- **Never:** outline: none without a replacement. **Instead:** focus-visible:ring-2 ring-ring. Keyboard users lose their place.

## Details

### An icon-only button

```tsx
// before
<Button size="icon"><Icon name="xmark" /></Button>
// after
<Button size="icon" aria-label="Close"><Icon name="xmark" /></Button>
```

Without a name, a screen reader announces only 'button'.

### A status that announces

```tsx
// before
{saved && <p role="status">Saved</p>}
// after
<p role="status">{saved ? "Saved" : ""}</p>
```

The region is in the accessibility tree before its text changes, so the change is announced.

**Related:** `sable docs typography` · `sable docs motion` · `sable component <Name> --a11y`
