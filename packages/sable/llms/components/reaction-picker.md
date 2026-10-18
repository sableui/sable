# ReactionPicker

**Status:** stable

The quick row of emoji you react to a message with: a toolbar of large emoji toggles that bloom in one after another as it opens and magnify under the pointer, with MenuReactions as the same row inside a right-click menu.

**Keywords:** reaction, reactions, emoji, emoji picker, react, tapback, quick reactions, message actions, chat

## Usage

Use ReactionPicker wherever a reader chooses a reaction for something: in a Popover from an add-reaction control (BubbleReactionAdd is that, ready-made), or as a hover bar over a message. Use MenuReactions for the same row as the first group of the menu a message opens on right-click or long-press, above Reply and Copy. Both report which emoji the reader has already used, so choosing one again removes it.

### Best practices

- Do: Keep the quick set short — six to eight. It is the reactions people actually use; a full emoji catalogue belongs behind a trailing "more" control passed as children.
- Do: Give every reaction a `label`. It is the accessible name and the menu's typeahead, and an emoji's own spoken name differs between platforms.
- Do: Pass `selected` so the reader's own reactions show pressed, and toggle in `onSelect`: choosing a reaction you already gave takes it back.
- Do: Offer the right-click menu and a visible add-reaction control together. A context menu is invisible until you know it is there; the pill is how a first-time reader finds reactions.
- Don't: Do not put a ReactionPicker inside a Menu or ContextMenu. A toolbar is not a menu item, so the menu's arrow keys would skip it; use MenuReactions there. → use **MenuReactions**
- Don't: Do not use it to rate an answer or collect a verdict. Reactions are social and many-valued; a helpful / not-helpful question is Feedback. → use **Feedback**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| ReactionPicker | yes | The toolbar: one tab stop, arrow keys move between emoji, each a toggle with `aria-pressed`. |
| MenuReactions | no | The same row as a group of checkbox menu items, for MenuContent and ContextMenuContent. Choosing one closes the menu. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| MenuReactions | { reactions?; selected?; onSelect?; motion? } & ComponentProps<typeof Menu.Group> | The quick row as checkbox menu items, for the first group of a MenuContent or ContextMenuContent. Same props as ReactionPicker, without children. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| reactions | readonly { emoji: string; label: string }[] | DEFAULT_REACTIONS | The choices, in order. The default is 👍 ❤️ 😂 🎉 😮 😢 🙏. |
| selected | readonly string[] | [] | The emoji the reader has already reacted with: shown pressed, and choosing one again removes it. |
| onSelect | (emoji: string) => void | — | Called with the emoji the reader chose. Toggle it in or out of `selected`. |
| children | ReactNode | — | ReactionPicker only: trailing controls after the emoji, such as a button that opens a full emoji picker. |
| aria-label | string | "Reactions" | The name of the toolbar or menu group. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps the press and drops the wave of emoji blooming in and the magnify, `off` stills it. It can only turn motion down. |

## Tokens used

`accent`, `primary`, `ring`

## Motion

- **arrival** · Glyph · `motion-bloom` — Opening the picker is the reader's own action, so the emoji answer it: each blooms in 24ms after the one before, a short wave from first to last. The surface it sits in (a Popover or a menu) arrives with its own motion-pop. Expressive only — under `subtle` the emoji are simply there.
- **response** · Glyph · _custom (outside the recipe layer)_ — The emoji under the pointer or the keyboard highlight magnifies to 1.25 on a fast standard ease, so you can see which one a release will choose; each cell also carries motion-interactive and motion-press. The magnify rides an inner layer so it never fights the bloom over `scale`.
- **transition** · Cell · `motion-interactive` — Pressed and not pressed differ by a tint, eased by motion-interactive. The celebration belongs to the reaction that lands under the message (BubbleReaction), not to the picker that chose it.
- **activity** · Root · _no motion_ — Choosing is instant; there is no in-between state to show.

## Accessibility

- ReactionPicker is a Base UI toolbar: one tab stop, Left/Right move between emoji, Home/End jump to the ends.
- Each emoji is a button named by its `label` and reporting `aria-pressed`, so a screen-reader user hears whether choosing it adds or removes their reaction. The glyph itself is aria-hidden.
- MenuReactions renders checkbox menu items (`menuitemcheckbox` with `aria-checked`), reached by the menu's arrow keys and typeahead like every other row.
- Under reduced motion the emoji appear at once and do not magnify; pressed state is carried by `aria-pressed` and a tint, never motion.

## Related

- Components: Bubble, ContextMenu, Popover, Toolbar, Feedback

## Examples

### In a popover

```tsx
import { Button, Icon, Popover, PopoverContent, PopoverTrigger, ReactionPicker } from "@sableui/react"

<Popover>
	<PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}>
		<Icon name="emoji" />
	</PopoverTrigger>
	<PopoverContent side="top" className="w-auto rounded-full p-1">
		<ReactionPicker selected={mine} onSelect={toggle} />
	</PopoverContent>
</Popover>
```

### In a right-click menu

```tsx
import { Bubble, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, MenuReactions } from "@sableui/react"

<ContextMenu>
	<ContextMenuTrigger render={<Bubble />}>See you at 6.</ContextMenuTrigger>
	<ContextMenuContent>
		<MenuReactions selected={mine} onSelect={toggle} />
		<ContextMenuSeparator />
		<ContextMenuItem>Reply</ContextMenuItem>
		<ContextMenuItem>Copy text</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>
```

### A custom set

```tsx
import { ReactionPicker } from "@sableui/react"

<ReactionPicker
	reactions={[
		{ emoji: "✅", label: "Done" },
		{ emoji: "👀", label: "Looking" },
		{ emoji: "🚀", label: "Shipped" },
	]}
	selected={mine}
	onSelect={toggle}
/>
```
