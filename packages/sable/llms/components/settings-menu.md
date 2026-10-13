# SettingsMenu

**Status:** stable

A compact trigger that states the current settings, over a menu of rows that change them. Each row shows its own value and opens a submenu; with one setting, the menu opens straight to its options under the row's label.

**Keywords:** settings, model picker, model switcher, options menu, preferences, submenu, quality settings, ai chat

## Usage

For a cluster of related settings that a reader checks often and changes occasionally — the model and effort on an AI composer, quality and format on an export control, density and sort on a table. It encodes one shape: summarise the state on the trigger, then open to a list of name → current value → submenu. It knows nothing about any particular domain; the AI-model case is one instance of it.

### Best practices

- Do: Put the current values in `summary`, not a noun. "5.6 Sol High" tells the reader where they are; a trigger reading "Settings" makes them open it to find out, which is the wrong trade for a control glanced at twenty times a session.
- Do: Give every SettingsRow a `value`. One glance at the open menu should answer every setting at once — a menu of bare names is a menu you have to explore.
- Do: Use `MenuRadioGroup` + `MenuRadioItem` inside a row for single-choice settings, so the current option is checked rather than merely remembered.
- Do: Reach for `variant="subtle"` when the trigger sits on a surface where a ghost control would float unanchored — inside a ChatComposer, for instance.
- Don't: Do not use it for a single setting. One choice is a `Select`; the nesting only earns its cost when there are several related settings to summarise.
- Don't: Do not put actions in it. Rows change state; a menu that mixes "Effort ›" with "Delete conversation" makes destructive commands look like preferences. That is `Menu` or `OverflowMenu`.
- Don't: Do not nest more than one level deep. Past that the reader loses the path back, and the thing you have is a settings dialog wearing a menu.
- Don't: Do not override the upward, end-aligned default without reason. Its home is the bottom of a composer or toolbar, where a downward menu opens off-screen.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Trigger | yes | The summary control. States the current settings and carries a chevron; quiet at rest, so it does not compete with the primary action beside it. |
| SettingsRow | yes | One setting: its name, its current value, and a submenu of options. Without children it renders flat, for a row that is a statement rather than a choice. |
| Submenu contents | no | Usually a MenuRadioGroup of MenuRadioItems, so the active option is checked. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| SettingsRow | { label: ReactNode; value?: ReactNode; disabled?: boolean; children?: ReactNode } | One setting. With children it opens a submenu; without them it renders as a flat statement row. |
| MenuRadioGroup | { value?: string; defaultValue?: string; onValueChange?: (value: string) => void } | Single-choice group for a row's submenu. Exported from Menu; re-used here rather than duplicated. |
| MenuRadioItem | { value: string; disabled?: boolean } | One option, with a check in a reserved leading column so labels do not shift as the highlight moves. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| summary | ReactNode | — | What the trigger reads when closed. Give it the current values, not a noun — the control should answer before it is opened. |
| label | string | "Change settings" | Accessible name for the trigger, since the visible summary is data rather than a label. |
| variant | "ghost" \| "subtle" | "ghost" | Resting treatment. `ghost` disappears into the surface at rest and shows its affordance on hover — right for a toolbar. `subtle` adds a fill for surfaces where a ghost trigger would float unanchored. |
| size | "xs" \| "sm" | "sm" | Trigger height, read off the density ladder so a compact scope retunes it with every other control. |
| side | "top" \| "bottom" \| "inline-start" \| "inline-end" | "top" | Which side the menu opens on. Upward by default — its home is the bottom of a composer. |
| align | "start" \| "center" \| "end" | "end" | Alignment along that side. |
| disabled | boolean | — | Disable the trigger. |
| ...Menu props | Omit<ComponentProps<typeof Menu>, 'children'> | — | `open` / `defaultOpen` / `onOpenChange` and the rest of Base UI's menu root props. |

## Variants

- **variant**: ghost, subtle
- **size**: xs, sm

## Tokens used

`foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `popover`, `popover-foreground`, `border`, `ring`

## Accessibility

- Base UI's Menu underneath, so roving focus, typeahead, Esc and outside-dismissal, and the full menu/menuitemradio ARIA wiring come for free — including submenu traversal with the arrow keys.
- The trigger carries an explicit `label`, because its visible text is the current state rather than a name: without it, a screen reader announces "5.6 Sol High" with no indication that it is a control or what it changes.
- Radio rows are `menuitemradio` with a real checked state, so the current choice is conveyed to assistive tech rather than only by a visible tick.
- The check occupies a reserved column instead of appearing on selection, so labels never shift sideways as the highlight moves — a change that reads as motion to anyone tracking position.
- Submenus open on the inline-end side, which flips correctly in RTL rather than always opening right.

## Related

- Components: Menu, OverflowMenu, Select, ChatComposer, Popover
- Patterns: ChatPanel

## Examples

### A model switcher in a composer

```tsx
import { ChatComposer, MenuRadioGroup, MenuRadioItem, SettingsMenu, SettingsRow } from "@sableui/react"

<ChatComposer
	onSend={send}
	actions={
		<SettingsMenu variant="subtle" size="xs" summary={<><span className="text-foreground">{model.name}</span>{" "}<span className="text-muted-foreground">{effort}</span></>}>
			<SettingsRow label="Model" value={model.name}>
				<MenuRadioGroup value={model.id} onValueChange={setModelId}>
					<MenuRadioItem value="sol">5.6 Sol</MenuRadioItem>
					<MenuRadioItem value="lite">5.6 Lite</MenuRadioItem>
				</MenuRadioGroup>
			</SettingsRow>
			<SettingsRow label="Effort" value={effort}>
				<MenuRadioGroup value={effort} onValueChange={setEffort}>
					<MenuRadioItem value="Low">Low</MenuRadioItem>
					<MenuRadioItem value="High">High</MenuRadioItem>
				</MenuRadioGroup>
			</SettingsRow>
		</SettingsMenu>
	}
/>
```

### Export options — the same shape, no chat involved

```tsx
import { MenuRadioGroup, MenuRadioItem, SettingsMenu, SettingsRow } from "@sableui/react"

<SettingsMenu summary={`${format} · ${quality}`} side="bottom" align="start">
	<SettingsRow label="Format" value={format}>
		<MenuRadioGroup value={format} onValueChange={setFormat}>
			<MenuRadioItem value="PNG">PNG</MenuRadioItem>
			<MenuRadioItem value="SVG">SVG</MenuRadioItem>
		</MenuRadioGroup>
	</SettingsRow>
	<SettingsRow label="Quality" value={quality}>
		<MenuRadioGroup value={quality} onValueChange={setQuality}>
			<MenuRadioItem value="Draft">Draft</MenuRadioItem>
			<MenuRadioItem value="Final">Final</MenuRadioItem>
		</MenuRadioGroup>
	</SettingsRow>
</SettingsMenu>
```

### A flat row for a setting with nothing to choose

```tsx
import { MenuRadioGroup, MenuRadioItem, MenuSeparator, SettingsMenu, SettingsRow } from "@sableui/react"

<SettingsMenu summary="Standard">
	<SettingsRow label="Speed" value="Standard">
		<MenuRadioGroup value="standard">
			<MenuRadioItem value="standard">Standard</MenuRadioItem>
			<MenuRadioItem value="priority">Priority</MenuRadioItem>
		</MenuRadioGroup>
	</SettingsRow>
	<MenuSeparator />
	<SettingsRow label="Plan" value="Team" />
</SettingsMenu>
```
