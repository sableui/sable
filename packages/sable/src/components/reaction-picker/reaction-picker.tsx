"use client"

import { Menu as BaseMenu } from "@base-ui/react/menu"
import type { ComponentProps, CSSProperties, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { Toolbar, ToolbarButton, type ToolbarProps } from "../toolbar/toolbar"

/** One choice in a reaction picker: the emoji and the name a screen reader says for it. */
export interface Reaction {
	emoji: string
	/** The accessible name, e.g. "Heart". An emoji's own spoken name varies by platform. */
	label: string
}

/** The quick set a picker offers when you pass none — the reactions most chats lead with. */
export const DEFAULT_REACTIONS: readonly Reaction[] = [
	{ emoji: "👍", label: "Thumbs up" },
	{ emoji: "❤️", label: "Heart" },
	{ emoji: "😂", label: "Laughing" },
	{ emoji: "🎉", label: "Party" },
	{ emoji: "😮", label: "Surprised" },
	{ emoji: "😢", label: "Sad" },
	{ emoji: "🙏", label: "Thank you" },
]

/*
 * One cell: a round, control-height target with the emoji sized from that
 * height (three fifths of it, like an icon in its button) rather than from a
 * text tier, so a reaction reads as a picture, not a character in a line. The
 * reader's own reactions take the same primary tint a selected outline Pill
 * does, so a chosen reaction looks the same in the picker and under the bubble.
 *
 * In the toolbar the cell is a ToolbarButton at the square `icon` size, so its
 * hover, focus ring and press are Button's. In a menu it is a checkbox item
 * shaped the same, and the keyboard highlight is the menu's own HighlightGlide.
 */
const PRESSED = "aria-pressed:bg-primary/10 data-[checked]:bg-primary/10"
const MENU_CELL = `group/reaction grid size-(--control-md) shrink-0 cursor-pointer select-none place-items-center rounded-full outline-none sable-surface-interactive motion-interactive motion-press ${PRESSED}`

/*
 * The glyph rides two layers so their motions never fight over `scale`: the
 * outer one blooms in when the picker opens, one emoji after another, and the
 * inner one magnifies under the pointer or the keyboard highlight.
 */
function Glyph({ emoji, index }: { emoji: string; index: number }) {
	return (
		<span
			aria-hidden={true}
			className="motion-bloom"
			style={{ "--motion-bloom-delay": `${index * 24}ms` } as CSSProperties}
		>
			<span className="block text-[calc(var(--control-md)*0.6)] leading-none transition-[scale] duration-(--motion-duration-fast) ease-standard group-hover/reaction:scale-125 group-focus-visible/reaction:scale-125 group-data-[highlighted]/reaction:scale-125">
				{emoji}
			</span>
		</span>
	)
}

interface ReactionChoiceProps {
	/** The choices, in order. @default DEFAULT_REACTIONS */
	reactions?: readonly Reaction[]
	/** The emoji the reader has already reacted with: shown pressed, and choosing one again removes it. */
	selected?: readonly string[]
	/** Called with the emoji the reader chose. Toggle it in or out of `selected`. */
	onSelect?: (emoji: string) => void
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps the press and drops the wave of emoji blooming in,
	 * `off` stills it. It can only turn motion down.
	 */
	motion?: MotionLevel
}

export interface ReactionPickerProps
	extends ReactionChoiceProps,
		Omit<ToolbarProps, "children" | "onSelect"> {
	/** Trailing controls after the emoji — a "more" button that opens a full picker. */
	children?: ReactNode
}

/**
 * ReactionPicker — the quick row of emoji you react to a message with. A
 * toolbar: one stop in the tab order, the arrow keys move along it, and each
 * emoji is a toggle reporting `aria-pressed`. Opening it plays a short wave as
 * the emoji bloom in one after another, and the one under the pointer
 * magnifies. Put it in a Popover from an add-reaction control — or use
 * `BubbleReactionAdd`, which is exactly that — and use `MenuReactions` for the
 * same row inside a right-click menu.
 *
 *   <ReactionPicker selected={mine} onSelect={(emoji) => toggle(message.id, emoji)} />
 */
export function ReactionPicker({
	reactions = DEFAULT_REACTIONS,
	selected = [],
	onSelect,
	motion,
	className,
	children,
	"aria-label": ariaLabel = "Reactions",
	...props
}: ReactionPickerProps) {
	return (
		<Toolbar
			aria-label={ariaLabel}
			data-motion={motionAttribute(motion)}
			className={cn("gap-0.5", className)}
			{...props}
		>
			{reactions.map((reaction, index) => (
				<ToolbarButton
					key={reaction.emoji}
					size="icon"
					aria-label={reaction.label}
					aria-pressed={selected.includes(reaction.emoji)}
					onClick={() => onSelect?.(reaction.emoji)}
					className={cn("group/reaction rounded-full", PRESSED)}
				>
					<Glyph emoji={reaction.emoji} index={index} />
				</ToolbarButton>
			))}
			{children}
		</Toolbar>
	)
}
ReactionPicker.displayName = "ReactionPicker"

export interface MenuReactionsProps
	extends ReactionChoiceProps,
		Omit<ComponentProps<typeof BaseMenu.Group>, "className" | "children" | "onSelect"> {
	className?: string
}

/**
 * The same quick row as the first group of a menu — the reactions above Reply
 * and Copy when a message is right-clicked or long-pressed. Each emoji is a
 * checkbox menu item (checked when the reader has reacted with it), so the
 * arrow keys and typeahead reach it like any other row, and choosing one
 * closes the menu. Works in `MenuContent` and `ContextMenuContent` alike.
 *
 *   <ContextMenuContent>
 *     <MenuReactions selected={mine} onSelect={toggle} />
 *     <ContextMenuSeparator />
 *     <ContextMenuItem>Reply</ContextMenuItem>
 *   </ContextMenuContent>
 */
export function MenuReactions({
	reactions = DEFAULT_REACTIONS,
	selected = [],
	onSelect,
	motion,
	className,
	"aria-label": ariaLabel = "Reactions",
	...props
}: MenuReactionsProps) {
	return (
		<BaseMenu.Group
			aria-label={ariaLabel}
			data-motion={motionAttribute(motion)}
			className={cn("flex items-center gap-0.5", className)}
			{...props}
		>
			{reactions.map((reaction, index) => (
				<BaseMenu.CheckboxItem
					key={reaction.emoji}
					label={reaction.label}
					aria-label={reaction.label}
					checked={selected.includes(reaction.emoji)}
					onCheckedChange={() => onSelect?.(reaction.emoji)}
					closeOnClick
					className={MENU_CELL}
				>
					<Glyph emoji={reaction.emoji} index={index} />
				</BaseMenu.CheckboxItem>
			))}
		</BaseMenu.Group>
	)
}
MenuReactions.displayName = "MenuReactions"
