# CommandPaletteBlock

An inline command palette: CommandMenuPanel with a filter field and grouped actions, each with an icon and its keyboard shortcut.

**Intent:** Reach for this to show a command list in place — an empty state that teaches shortcuts, an onboarding step, a quick-actions card. The ⌘K palette that opens over the app is CommandMenu; this is its panel without the dialog.

**Block:** Navigation · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Each command shows its shortcut as a Kbd hint, so the palette also teaches the keys.
- `onCommand` receives the command's id; ids also key the rows, so two commands may share a label.
- No card around it: the panel is its own surface, lifted with `shadow-sm` when it sits on a muted section.

## Accessibility

- CommandMenuPanel wires the filter input to the list as a combobox, with arrow-key navigation and the active row announced.
- Shortcut hints are Kbd elements, read as keys.

## Source

```tsx
import { cn, CommandMenuPanel, Kbd, type CommandItem } from "@sableui/react"

const commands = [
	{ id: "new-project", icon: "plus", label: "New project", key: "N" },
	{ id: "invite", icon: "user", label: "Invite teammate", key: "I" },
	{ id: "settings", icon: "gear", label: "Open settings", key: "," },
]

export interface CommandPaletteBlockProps {
	className?: string
	/** Called with the chosen command's id. */
	onCommand?: (id: string) => void
}

export function CommandPaletteBlock({ className, onCommand }: CommandPaletteBlockProps) {
	const items: CommandItem[] = commands.map((c) => ({
		id: c.id,
		group: "Actions",
		icon: c.icon,
		label: c.label,
		hint: <Kbd>{c.key}</Kbd>,
		onSelect: () => onCommand?.(c.id),
	}))
	return <CommandMenuPanel className={cn("w-full max-w-xs shadow-sm", className)} placeholder="Type a command…" items={items} />
}
```
