# ContextCard

**Status:** stable

Hover/focus-triggered rich preview card over Base UI PreviewCard. Reveals contextual content (a profile, a project summary) from an inline anchor; 20rem-wide surface with delayed open and collision-aware positioning.

**Keywords:** context card, rich tooltip, hover card, preview

## Usage

Use ContextCard to show richer contextual content near a trigger without taking users out of flow.

### Best practices

- Do: Use it for previews, summaries, or supporting context tied to a specific element.
- Do: Keep the card read-only and make the trigger the action: it is a real link to the full profile or item. Keyboard users cannot reach a button inside the card, because moving focus off the trigger closes it. If the preview needs an action (Follow, Add), use a Popover instead.
- Don't: Do not put critical decisions, long forms, or required workflow steps inside ContextCard.
- Don't: Do not open it on click. It is a hover/focus preview; making it click-triggered gives you a Popover with no dismiss affordance and no way to reach the content it previews. → use **Popover**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| ContextCardTrigger | yes | The element that anchors the card. |
| ContextCardContent | yes | The contextual surface shown near the trigger. |
| ContextCardArrow | no | An optional arrow connecting card and trigger. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| ContextCardTrigger | Base UI Trigger props + render + delay \| closeDelay | The inline anchor (renders an <a>). Use render={<a href='…'/>} to compose with a link. delay defaults to 600ms, closeDelay to 300ms. |
| ContextCardContent | Base UI Popup props + side \| align \| sideOffset + className | Portals + positions + paints the popup; surface is a fixed 20rem-wide card. side is which side of the trigger to render against (auto-flips on collision), align the alignment along it, sideOffset the gap in px. Defaults to side="bottom", align="center", sideOffset=8. |
| ContextCardArrow | Base UI Arrow props + className | Optional pointer connecting the popup to its trigger. Place inside ContextCardContent. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ContextCard (Root) | Base UI PreviewCard.Root props (open, defaultOpen, onOpenChange) | — | Groups the trigger and content. Uncontrolled by default; opens on hover/focus of the trigger. |

## Tokens used

`popover`, `popover-foreground`, `border`, `muted-foreground`, `accent`

## Accessibility

- Opens on hover and on keyboard focus of the trigger, after a short delay; dismisses on Esc, outside press, and blur.
- The trigger renders an <a> by default — compose render={<a href='…'/>} so it stays a real, navigable link.
- Base UI wires the popup's ARIA association with the trigger; the card holds non-interactive context, not focusable controls.
- Animate via data-[starting-style]/data-[ending-style] opacity attributes on the popup.

## Related

- Components: Popover, Tooltip

## Examples

### Profile preview

```tsx
import { Avatar, ContextCard, ContextCardContent, ContextCardTrigger, Entity } from "@sableui/react"

<ContextCard><ContextCardTrigger render={<a href='/u/ada' className='text-title-sm underline-offset-2 hover:underline'>@ada</a>} /><ContextCardContent><Entity className='[--entity-px:0] [--entity-py:0]' leading={<Avatar fallback='AL' size='lg' />} title='Ada Lovelace' subtitle='@ada' /><p className='mt-3 text-body-sm text-muted-foreground'>Product designer. Building tools for small teams.</p></ContextCardContent></ContextCard>
```

### With stat row

```tsx
import { Avatar, ContextCard, ContextCardContent, ContextCardTrigger, Entity } from "@sableui/react"

<ContextCard><ContextCardTrigger render={<a href='/u/nyx' className='text-title-sm underline-offset-2 hover:underline'>@nyx</a>} /><ContextCardContent><Entity className='[--entity-px:0] [--entity-py:0]' leading={<Avatar fallback='NY' size='lg' />} title='Nyx' subtitle='@nyx' /><div className='@container mt-4 border-t border-border pt-3'><dl className='sable-list-dl sable-list-dl-2'><dt>Posts</dt><dd>128</dd><dt>Followers</dt><dd>4.2k</dd></dl></div></ContextCardContent></ContextCard>
```
