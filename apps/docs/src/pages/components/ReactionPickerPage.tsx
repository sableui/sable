import {
	Bubble,
	Card,
	CardContent,
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
	MenuReactions,
	Message,
	ReactionPicker,
	reactionPickerMeta,
} from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

/** The reader's own reactions, toggled in and out. */
function useMine(initial: string[] = []) {
	const [mine, setMine] = useState(initial)
	const toggle = (emoji: string) =>
		setMine((prev) => (prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]))
	return [mine, toggle] as const
}

function BarDemo() {
	const [mine, toggle] = useMine(["❤️"])
	return <ReactionPicker selected={mine} onSelect={toggle} />
}

function MenuDemo() {
	const [mine, toggle] = useMine()
	return (
		<Card className="w-full max-w-sm">
			<CardContent>
				<Message messageId="rp1">
					<ContextMenu>
						<ContextMenuTrigger render={<Bubble tabIndex={0} />}>
							Right-click or long-press me.{mine.length > 0 ? ` You reacted ${mine.join(" ")}` : ""}
						</ContextMenuTrigger>
						<ContextMenuContent>
							<MenuReactions selected={mine} onSelect={toggle} />
							<ContextMenuSeparator />
							<ContextMenuItem>Reply</ContextMenuItem>
							<ContextMenuItem>Copy text</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Message>
			</CardContent>
		</Card>
	)
}

function CustomDemo() {
	const [mine, toggle] = useMine(["🚀"])
	return (
		<ReactionPicker
			aria-label="Status"
			reactions={[
				{ emoji: "✅", label: "Done" },
				{ emoji: "👀", label: "Looking" },
				{ emoji: "🚀", label: "Shipped" },
				{ emoji: "🔥", label: "On fire" },
			]}
			selected={mine}
			onSelect={toggle}
		/>
	)
}

export function ReactionPickerPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Reaction Picker" lede={ledeFor(reactionPickerMeta)} />

			<Section
				title="The quick row"
				description="Opening it plays a short wave as the emoji bloom in one after another; the one under the pointer or the keyboard magnifies. Your own reactions show pressed, and choosing one again takes it back. It is a toolbar: one tab stop, then the arrow keys."
			>
				<Example replayable code={`<ReactionPicker selected={mine} onSelect={toggle} />`}>
					<BarDemo />
				</Example>
			</Section>

			<Section
				title="In a right-click menu"
				description="MenuReactions is the same row as checkbox menu items, so it sits above Reply and Copy in the menu a message opens on right click, long press or Shift+F10. Choosing a reaction closes the menu."
			>
				<Example
					code={`<ContextMenu>
	<ContextMenuTrigger render={<Bubble tabIndex={0} />}>See you at 6.</ContextMenuTrigger>
	<ContextMenuContent>
		<MenuReactions selected={mine} onSelect={toggle} />
		<ContextMenuSeparator />
		<ContextMenuItem>Reply</ContextMenuItem>
		<ContextMenuItem>Copy text</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>`}
				>
					<MenuDemo />
				</Example>
			</Section>

			<Section
				title="Your own set"
				description="Any short list of emoji, each with the label a screen reader says for it."
			>
				<Example
					code={`<ReactionPicker
	aria-label="Status"
	reactions={[
		{ emoji: "✅", label: "Done" },
		{ emoji: "👀", label: "Looking" },
		{ emoji: "🚀", label: "Shipped" },
		{ emoji: "🔥", label: "On fire" },
	]}
	selected={mine}
	onSelect={toggle}
/>`}
				>
					<CustomDemo />
				</Example>
			</Section>

			<MetaFooter meta={reactionPickerMeta} />
		</>
	)
}
