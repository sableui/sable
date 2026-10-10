import {
	Button,
	type CommandItem,
	CommandMenu,
	CommandMenuGroup,
	CommandMenuItem,
	CommandMenuPanel,
	CommandMenuTrigger,
	commandMenuMeta,
	Kbd,
} from "@sableui/react";
import { useState } from "react";
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui";

/** Exact prefix beats substring beats subsequence; unmatched rows drop out. */
function score(label: string, query: string): number {
	const text = label.toLowerCase();
	if (text.startsWith(query)) return 0;
	if (text.includes(query)) return 1;
	let at = 0;
	for (const character of text) {
		if (character === query[at]) at += 1;
		if (at === query.length) return 2;
	}
	return -1;
}

function rank(items: CommandItem[], query: string): CommandItem[] {
	const q = query.trim().toLowerCase();
	if (!q) return items;
	return items
		.map((item) => ({ item, rank: score(item.label, q) }))
		.filter((entry) => entry.rank >= 0)
		.sort((a, b) => a.rank - b.rank)
		.map((entry) => entry.item);
}

// `id` is what lets `rank` above hand back rows the caller can still recognise —
// it ranks over CommandItem here, but a real palette ranks over its own model and
// needs a key to map the returned array onto it.
const RANKED_ITEMS: CommandItem[] = [
	{
		id: "effect-blur",
		group: "Effects",
		label: "Blur",
		icon: "sparkles",
		hint: <Kbd>B</Kbd>,
		onSelect: () => console.log("blur"),
	},
	{
		id: "effect-bloom",
		group: "Effects",
		label: "Bloom",
		icon: "sun",
		onSelect: () => console.log("bloom"),
	},
	{
		id: "layer-front",
		group: "Layers",
		label: "Bring layer to front",
		icon: "arrow-up",
		detail: "Sky",
		onSelect: () => console.log("front"),
	},
	{
		id: "layer-align-left",
		group: "Layers",
		label: "Align left",
		icon: "arrow-left",
		disabled: true,
		hint: "Select another layer to align to",
		onSelect: () => console.log("align"),
	},
];

const INLINE_ITEMS: CommandItem[] = [
	{
		group: "Create",
		label: "New project",
		icon: "plus",
		hint: <Kbd>N</Kbd>,
		onSelect: () => console.log("new-project"),
	},
	{
		group: "Create",
		label: "Invite teammate",
		icon: "user",
		hint: <Kbd>I</Kbd>,
		onSelect: () => console.log("invite"),
	},
	{
		group: "Settings",
		label: "Open settings",
		icon: "gear",
		hint: <Kbd>,</Kbd>,
		onSelect: () => console.log("settings"),
	},
];

/** Enough rows to overflow the list, so the edge fades and the cap are visible. */
const LONG_ITEMS: CommandItem[] = Array.from({ length: 40 }, (_, index) => ({
	id: `layer-${index}`,
	group: index < 20 ? "Layers" : "Effects",
	label: index < 20 ? `Layer ${index + 1}` : `Effect ${index - 19}`,
	icon: index < 20 ? "layout" : "sparkles",
	onSelect: () => console.log(index),
}));

export function CommandMenuPage() {
	const [declarativeOpen, setDeclarativeOpen] = useState(false);
	const [rankedOpen, setRankedOpen] = useState(false);
	const [longOpen, setLongOpen] = useState(false);
	const [triggerOpen, setTriggerOpen] = useState(false);

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Command Menu"
				lede={ledeFor(commandMenuMeta)}
			/>

			<Section
				title="Basic"
				description="Type to filter. Choosing a command runs it and closes the palette."
			>
				<Example>
					<Button onClick={() => setDeclarativeOpen(true)}>
						Open command menu
					</Button>
					<CommandMenu open={declarativeOpen} onOpenChange={setDeclarativeOpen}>
						<CommandMenuGroup label="Navigation">
							<CommandMenuItem
								icon="home"
								onSelect={() => console.log("feed")}
							>
								Go to feed
							</CommandMenuItem>
							<CommandMenuItem
								icon="user"
								onSelect={() => console.log("profile")}
							>
								Go to profile
							</CommandMenuItem>
							<CommandMenuItem
								icon="gear"
								onSelect={() => console.log("settings")}
							>
								Go to settings
							</CommandMenuItem>
						</CommandMenuGroup>
						<CommandMenuGroup label="Actions">
							<CommandMenuItem
								icon="edit"
								onSelect={() => console.log("new-post")}
							>
								New post
							</CommandMenuItem>
							<CommandMenuItem
								icon="gem"
								onSelect={() => console.log("new-edition")}
							>
								New edition
							</CommandMenuItem>
							<CommandMenuItem
								icon="logout"
								onSelect={() => console.log("sign-out")}
							>
								Sign out
							</CommandMenuItem>
						</CommandMenuGroup>
					</CommandMenu>
				</Example>
			</Section>

			<Section
				title="Trigger"
				description="The search field in a header that opens the palette. It looks like a search field, but it's a button, and it brings the ⌘K shortcut with it. This one listens for ⌘J, because this site's header already owns ⌘K."
			>
				<Example
					code={`const [open, setOpen] = useState(false)

<CommandMenuTrigger
  size="sm"
  placeholder="Search layers"
  shortcut="j"
  onOpen={() => setOpen(true)}
  className="w-56"
/>
<CommandMenu open={open} onOpenChange={setOpen} items={items} />`}
				>
					<CommandMenuTrigger
						size="sm"
						placeholder="Search layers"
						shortcut="j"
						onOpen={() => setTriggerOpen(true)}
						className="w-56"
					/>
					<CommandMenu
						open={triggerOpen}
						onOpenChange={setTriggerOpen}
						placeholder="Search layers and effects…"
						items={RANKED_ITEMS}
					/>
				</Example>
			</Section>

			<Section
				title="Inline"
				description="The same palette, set into the page instead of opening over it. For a sidebar launcher, a settings search or a demo. Esc clears what you typed."
			>
				<Example
					code={`<CommandMenuPanel
  className="w-full max-w-sm"
  placeholder="Type a command…"
  items={[
    { group: "Create", label: "New project", icon: "plus", hint: <Kbd>N</Kbd>, onSelect: newProject },
    { group: "Create", label: "Invite teammate", icon: "user", hint: <Kbd>I</Kbd>, onSelect: invite },
    { group: "Settings", label: "Open settings", icon: "gear", hint: <Kbd>,</Kbd>, onSelect: openSettings },
  ]}
/>`}
				>
					<CommandMenuPanel
						className="w-full max-w-sm"
						placeholder="Type a command…"
						items={INLINE_ITEMS}
					/>
				</Example>
			</Section>

			<Section
				title="Hints and disabled commands"
				description="Loose matches rank lower. Commands you can't run stay listed with the reason."
			>
				<Example>
					<Button variant="secondary" onClick={() => setRankedOpen(true)}>
						Open (ranked)
					</Button>
					<CommandMenu
						open={rankedOpen}
						onOpenChange={setRankedOpen}
						placeholder="Try “blr”…"
						filter={rank}
						items={RANKED_ITEMS}
					/>
				</Example>
			</Section>

			<Section
				title="Long list"
				description="The list fades at any edge with more to scroll."
			>
				<Example>
					<Button variant="secondary" onClick={() => setLongOpen(true)}>
						Open (40 rows)
					</Button>
					<CommandMenu
						open={longOpen}
						onOpenChange={setLongOpen}
						placeholder="Search layers and effects…"
						listClassName="max-h-[50vh]"
						items={LONG_ITEMS}
					/>
				</Example>
			</Section>

			<MetaFooter meta={commandMenuMeta} />
		</>
	);
}
