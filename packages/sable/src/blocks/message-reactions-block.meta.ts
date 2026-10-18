import type { BlockMeta } from "../lib/meta"

export const messageReactionsBlockMeta: BlockMeta = {
	name: "MessageReactionsBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary:
		"A short thread you can react to: right-click or long-press a bubble for a menu with a row of quick reactions above Reply and Copy, or use the add-reaction pill under a message. A new reaction blooms in and sprays copies of its emoji.",
	intent:
		"Reach for this when a conversation excerpt should be reactable — a team thread, a comment card, a support transcript. A read-only excerpt is ChatThreadBlock; a working chat with a composer and history is the ChatPanel page shell.",
	notes: [
		"Two ways in, on purpose: the right-click / long-press menu is fast once you know it is there, and the add-reaction pill is how a first-time reader finds reactions at all.",
		"The quick row in the menu is MenuReactions (checkbox menu items) and the one in the pill's popover is ReactionPicker (a toolbar), so each is reachable by the keyboard model of the surface it sits in.",
		"Only the reader's own reaction celebrates. Counts from other people roll quietly, and the reactions a page loads with never play.",
		"The add-reaction pill appears only on messages that already have reactions; a message with none is reacted to from its menu, which keeps quiet rows quiet.",
	],
	a11y: [
		"Each bubble is focusable, and its menu opens on right click, long press, Shift+F10 or the Menu key; its reactions are checkbox items reporting whether the reader has used each one.",
		"Each reaction pill is a toggle named by its meaning and count (\"Party, 3\") with `aria-pressed`; the emoji and the burst are hidden from assistive tech.",
		"Under reduced motion the reaction appears and the count changes at once; nothing else is lost.",
	],
}
