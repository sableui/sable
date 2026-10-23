import type { ComponentMeta } from "../../lib/meta"

export const avatarMeta: ComponentMeta = {
	name: "Avatar",
	summary:
		"Circular (or square) profile image over Base UI Avatar — automatic image-load tracking with an initials/glyph fallback. Ergonomic Avatar plus low-level AvatarRoot/AvatarImage/AvatarFallback parts, and AvatarGroup for an overlapping stack with a \"+N\" overflow count.",
	keywords: [
		"avatar",
		"profile",
		"user",
		"identity",
		"initials",
		"fallback",
		"group",
		"team",
		"stack",
		"overflow",
		"collaborators",
		"facepile",
		"monogram",
		"project mark",
		"workspace icon",
		"org logo",
		"assignee",
	],
	usage: {
		description:
			"Use Avatar to represent a person, team, or account with a compact visual identity. Wrap several in AvatarGroup for collaborators, assignees, or attendees — it overlaps them, rings each in the surface colour, and collapses the rest into a \"+N\" count; use the low-level parts only when you need custom image/fallback layout.",
		bestPractices: [
			{
				guidance: "do",
				description:
					'Use `variant="art"` where people without photos sit side by side — a member list, an activity feed, a chat. Seeded by the person, each gets their own colour, so faces stay tellable apart at a glance; the neutral fallback makes everyone the same grey circle.',
			},
			{
				guidance: "do",
				description:
					"Provide meaningful alt text for profile images, or an empty alt when the adjacent text already names the person.",
			},
			{
				guidance: "dont",
				description:
					'Do not stand in for an AI agent with initials like "AI" or a glyph fallback. "AI" in a circle reads as a person called A. I. An agent\'s turns take AgentAvatar, whose states also show the agent working.',
				instead: ["AgentAvatar"],
			},
			{
				guidance: "do",
				description:
					"Use initials or a simple glyph fallback so missing images still communicate identity.",
			},
			{
				guidance: "do",
				description:
					"Pick the size by the job: 2xs (20px) or xs (24px) in a compact workspace row (an assignee in an issue list, a project mark in a nav item), sm in dense rows and tables, md (the default) beside one line of text, lg in a row with a title and subtitle, xl (96px) for a profile header beside the person's name, 2xl (160px) for an artist or profile hero and roster portraits. Keep one size within a list or group.",
			},
			{
				guidance: "do",
				description:
					"Use AvatarGroup for a stack of people, and give it an aria-label with the real count (\"12 collaborators\"). Set `surface` (or `--avatar-group-ring`) to whatever the group sits on, so the separating ring matches a card or popover, not the page. When it shares a row with actions, set `fit` so it gives up avatars to the \"+N\" count before the row has to wrap.",
			},
			{
				guidance: "do",
				description:
					'Use `shape="square"` for what is not a person (a workspace, a project, an org, a team), with `tone` set to a palette family so each one keeps its own colour: `<Avatar shape="square" tone="teal" fallback="N" alt="Northwind storefront" size="xs" />`. Circles mean people; keep that distinction across the app.',
			},
			{
				guidance: "dont",
				description:
					"Hand-build a stack with negative margins and per-avatar ring classes, or fake the overflow as an Avatar with \"+4\" initials — screen readers hear \"plus 4\" with no context. Use AvatarGroup's `max`/`total`, or AvatarGroupCount.",
			},
			{
				guidance: "dont",
				description:
					"Use avatars as decoration without nearby identity context. They should help users recognize a person or account.",
			},
			{
				guidance: "dont",
				description:
					"Overload a dense table with large avatars; use sm or omit images when scanning data is more important.",
			},
			{
				guidance: "dont",
				description:
					"Resize an Avatar with size classes (`className=\"size-5\"`, `className=\"size-40\"`) — the initials, the status indicator and the image fade stay at the size they were drawn for. Use size=\"2xs\"/\"xs\" for dense rows and size=\"xl\"/\"2xl\" for portraits, which scale all three. Don't hand-build a tinted initials tile for a project or workspace mark either: that is Avatar shape=\"square\" with a tone. Past 160px, or for a cover, it is media: an AspectBox, not an avatar.",
			},
		],
		anatomy: [
			{
				name: "Root",
				required: true,
				description:
					"The circular frame that clips the image, owns size, and contains image plus fallback.",
			},
			{
				name: "Image",
				required: false,
				description:
					"The loaded profile image, cropped to fill the root.",
			},
			{
				name: "Fallback",
				required: true,
				description:
					"Initials, a glyph, or short text shown while loading, on error, or when no image exists.",
			},
			{
				name: "Group",
				required: false,
				description:
					"AvatarGroup: the overlapping stack. Sets one size for every avatar and rings each in the surface colour.",
			},
			{
				name: "Count",
				required: false,
				description:
					"AvatarGroupCount: the \"+N\" avatar ending a group, read as \"and N more\". Rendered automatically by `max`/`total`.",
			},
		],
	},
	related: {
		components: ["Entity", "StatusDot", "Badge", "Row"],
		patterns: ["DashboardPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "src",
			type: "string",
			description:
				"Image source. When omitted, still loading, or failed, the fallback shows.",
		},
		{
			name: "alt",
			type: "string",
			default: '""',
			description: "Alt text for the image. Without an image it becomes the avatar's accessible name (role=img), so the initials are never read out as the name.",
		},
		{
			name: "fallback",
			type: "ReactNode",
			description: "Initials or a glyph rendered when no image is displayed.",
		},
		{
			name: "fallbackDelay",
			type: "number",
			description:
				"Delay before showing the fallback, in ms — avoids a flash on fast loads.",
		},
		{
			name: "status",
			type: "ReactNode",
			description:
				"A presence indicator pinned to the bottom-end edge, usually <StatusDot tone=\"success\" />. It sits outside the clipped circle and wears a ring in the surface colour (--avatar-group-ring, else the page background). Use this instead of absolutely positioning a dot over an Avatar.",
		},
		{
			name: "size",
			type: '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
			default: '"md"',
			description: "Square footprint: 20px / 24px for compact workspace rows; 32px / 40px / 48px for rows; 96px / 160px for portraits (a profile header, an artist hero, a roster tile). The initials, a status indicator and its cut-out ring scale with it, and at the portrait sizes the photo fades in over the resting surface.",
		},
		{
			name: "shape",
			type: '"circle" | "square"',
			default: '"circle"',
			description: "The frame's corner. circle is a person. square is what is not a face — a workspace, a project, an org, a team — with a radius from the theme's steps that grows with the size (4px at 20–24px to 20px at 160px), so a square theme stays square. A status indicator sits on the square's corner.",
		},
		{
			name: "tone",
			type: '"neutral" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
			default: '"neutral"',
			description: "The fallback's colour. neutral is the muted surface; a palette family paints its wash behind the initials and its deep ink on them (a soft Badge's pair, held to contrast in every theme), for a category colour such as one per project. Ignored by variant=\"art\", which colours by seed.",
		},
		{
			name: "variant",
			type: '"neutral" | "art"',
			default: '"neutral"',
			description: "What the fallback looks like. neutral: initials on the muted surface. art: initials over GradientArt seeded by the person, so each person without a photo gets their own stable colour from the theme.",
		},
		{
			name: "seed",
			type: "string | number",
			description: "The art variant's seed. Defaults to the fallback text, then `alt`, so a person keeps one colour wherever they appear; pass a user id to tell apart two people who share initials.",
		},
	],
	subcomponents: [
		{
			name: "AvatarRoot",
			type: "Base UI Avatar.Root props + size + shape + tone + className",
			description:
				"Low-level circular frame for full composition control — clips the image and holds the `size` axis. Wraps AvatarImage and AvatarFallback.",
		},
		{
			name: "AvatarImage",
			type: "Base UI Avatar.Image props + className",
			description:
				"The profile image. Fills and crops the frame; hidden by Base UI until it loads.",
		},
		{
			name: "AvatarFallback",
			type: "Base UI Avatar.Fallback props (delay) + className",
			description:
				"Shown when no image is available — typically initials or a glyph. Accepts a delay prop.",
		},
		{
			name: "AvatarGroup",
			type: '{ size?: "2xs" | "xs" | "sm" | "md" | "lg"; surface?: "background" | "card" | "popover" | "muted"; max?: number; fit?: boolean; total?: number; countLabel?: (count: number) => string; "aria-label"?: string; className?: string; children: ReactNode }',
			description:
				"Overlapping stack (role=group) — name it with aria-label (\"12 collaborators\"). `size` applies to every avatar inside. `max` shows that many and collapses the rest into a \"+N\" count; `total` is the real head-count when you only pass some people. `fit` shows only as many avatars as fit the width the group is given (it fills the space left in a flex row) and folds the rest into the count, so a tight row reads \"MO SR +5\" instead of wrapping. The separating ring reads the inherited `--avatar-group-ring` (default: the page background); `surface` sets it to card, popover, or muted.",
		},
		{
			name: "AvatarGroupCount",
			type: '{ count: number; label?: string; size?: "2xs" | "xs" | "sm" | "md" | "lg"; className?: string }',
			description:
				"The \"+N\" avatar. Shows \"+4\" and reads \"and 4 more\" (override with label). AvatarGroup renders it for you from max/total; use it directly only when composing the stack yourself.",
		},
	],
	variants: {
		size: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
		shape: ["circle", "square"],
		variant: ["neutral", "art"],
	},
	tokensUsed: ["muted", "muted-foreground", "background", "card", "popover", "overlay", "overlay-foreground"],
	a11y: [
		"Base UI tracks the image loading status and swaps to the fallback on missing/loading/error — no manual onError wiring.",
		"Provide meaningful alt text via the alt prop; pass an empty alt for decorative avatars.",
		"The fallback (initials/glyph) gives a non-image identity cue for screen readers and slow connections.",
		"AvatarGroup renders role=group; give it an aria-label naming the whole set (\"12 collaborators\"), since the visible stack only shows some of them.",
		"The \"+N\" count is hidden from screen readers and replaced by \"and N more\" (AvatarGroupCount `label`, or AvatarGroup `countLabel`).",
	],
	motion: [
		{ slot: "arrival", recipe: "motion-fade", part: "Image", why: "At the portrait sizes (xl, 2xl) the photo replacing the initials is a visible pop across one of the page's largest elements; fading it in reads as the picture arriving, not the layout glitching. Row sizes swap instantly — too small to register, and a list of fading faces would shimmer." },
		{ slot: "response", recipe: "none", part: "Root", why: "An avatar is not interactive itself; a link or button wrapping it owns the response." },
		{ slot: "transition", recipe: "none", part: "Root", why: "It has no states of its own to move between beyond the image arriving." },
		{ slot: "activity", recipe: "none", part: "Root", why: "Loading shows the fallback, which is already a finished resting state rather than a spinner." },
	],
	examples: [
		{
			label: "With image",
			code: '<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" />',
		},
		{
			label: "Fallback only",
			code: '<Avatar fallback="AM" alt="Alex Morgan" />',
		},
		{
			label: "Art fallback",
			code: '<Avatar variant="art" fallback="AM" alt="Alex Morgan" />',
		},
		{
			label: "Sizes",
			code: '<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="sm" />\n<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="md" />\n<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="lg" />',
		},
		{
			label: "Profile portrait",
			code: `<div className="flex flex-col items-center gap-3 text-center">
	<Avatar variant="art" size="2xl" fallback="LV" alt="Lena Vale" status={<StatusDot tone="success" />} />
	<div className="flex flex-col gap-1">
		<h1 className="text-heading-1">Lena Vale</h1>
		<p className="text-body-sm text-muted-foreground">1.2M monthly listeners</p>
	</div>
</div>`,
		},
		{
			label: "Dense row sizes",
			code: `<Avatar fallback="EL" alt="Emma Lee" size="2xs" />
<Avatar fallback="EL" alt="Emma Lee" size="xs" />`,
		},
		{
			label: "Project marks",
			code: `<Avatar shape="square" tone="teal" size="xs" fallback="N" alt="Northwind storefront" />
<Avatar shape="square" tone="orange" size="xs" fallback="H" alt="Harbor brand refresh" />
<Avatar shape="square" tone="purple" size="xs" fallback="L" alt="Lumen editorial" />`,
		},
		{
			label: "Low-level parts",
			code: '<AvatarRoot size="lg"><AvatarImage src="/pfp.png" alt="Mara Okafor" /><AvatarFallback>MO</AvatarFallback></AvatarRoot>',
		},
		{
			label: "Group with overflow",
			code: '<AvatarGroup aria-label="6 collaborators" max={3} size="sm" surface="card"><Avatar src="/ana.png" alt="Ana Chen" fallback="AC" /><Avatar src="/mika.png" alt="Mika Lee" fallback="ML" /><Avatar fallback="JL" alt="Jo Lund" /><Avatar fallback="AK" alt="Ari Kim" /><Avatar fallback="SR" alt="Sam Reyes" /><Avatar fallback="MO" alt="Mo Ortiz" /></AvatarGroup>',
		},
		{
			label: "Group of a larger set",
			code: '<AvatarGroup aria-label="12 attendees" total={12} countLabel={(n) => `and ${n} more attendees`}><Avatar fallback="MO" alt="Mo Ortiz" /><Avatar fallback="SR" alt="Sam Reyes" /><Avatar fallback="JL" alt="Jo Lund" /></AvatarGroup>',
		},
		{
			label: "Composed count",
			code: '<AvatarGroup aria-label="7 reviewers"><Avatar fallback="AC" alt="Ana Chen" /><Avatar fallback="ML" alt="Mika Lee" /><AvatarGroupCount count={5} label="and 5 more reviewers" /></AvatarGroup>',
		},
		{
			label: "With status",
			code: '<Entity leading={<Avatar src="/pfp.png" alt="Nova Reed" fallback="NR" status={<StatusDot tone="success" />} />} title="Nova Reed" subtitle="Online" />',
		},
	],
}
