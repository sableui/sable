import { CommandMenuPanel, type CommandItem } from "../components/command-menu"
import { Kbd } from "../components/kbd"
import { cn } from "../lib/cn"

// ---block-code---
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
