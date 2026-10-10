import type { ComponentMeta } from "../../lib/meta"

export const avatarMeta: ComponentMeta = {
	name: "Avatar",
	summary:
		"Circular profile image over Base UI Avatar — automatic image-load tracking with an initials/glyph fallback. Ergonomic Avatar plus low-level AvatarRoot/AvatarImage/AvatarFallback parts, and AvatarGroup for an overlapping stack with a \"+N\" overflow count.",
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
	],
	usage: {
		description:
			"Use Avatar to represent a person, team, or account with a compact visual identity. Wrap several in AvatarGroup for collaborators, assignees, or attendees — it overlaps them, rings each in the surface colour, and collapses the rest into a \"+N\" count; use the low-level parts only when you need custom image/fallback layout.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Provide meaningful alt text for profile images, or an empty alt when the adjacent text already names the person.",
			},
			{
				guidance: "do",
				description:
					"Use initials or a simple glyph fallback so missing images still communicate identity.",
			},
			{
				guidance: "do",
				description:
					"Use consistent sizes within a group; reserve lg for profile headers or major identity moments.",
			},
			{
				guidance: "do",
				description:
					"Use AvatarGroup for a stack of people, and give it an aria-label with the real count (\"12 collaborators\"). Set `surface` (or `--avatar-group-ring`) to whatever the group sits on, so the separating ring matches a card or popover, not the page. When it shares a row with actions, set `fit` so it gives up avatars to the \"+N\" count before the row has to wrap.",
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
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: "Square footprint: 32px / 40px / 48px.",
		},
	],
	subcomponents: [
		{
			name: "AvatarRoot",
			type: "Base UI Avatar.Root props + size + className",
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
			type: '{ size?: "sm" | "md" | "lg"; surface?: "background" | "card" | "popover" | "muted"; max?: number; fit?: boolean; total?: number; countLabel?: (count: number) => string; "aria-label"?: string; className?: string; children: ReactNode }',
			description:
				"Overlapping stack (role=group) — name it with aria-label (\"12 collaborators\"). `size` applies to every avatar inside. `max` shows that many and collapses the rest into a \"+N\" count; `total` is the real head-count when you only pass some people. `fit` shows only as many avatars as fit the width the group is given (it fills the space left in a flex row) and folds the rest into the count, so a tight row reads \"MO SR +5\" instead of wrapping. The separating ring reads the inherited `--avatar-group-ring` (default: the page background); `surface` sets it to card, popover, or muted.",
		},
		{
			name: "AvatarGroupCount",
			type: '{ count: number; label?: string; size?: "sm" | "md" | "lg"; className?: string }',
			description:
				"The \"+N\" avatar. Shows \"+4\" and reads \"and 4 more\" (override with label). AvatarGroup renders it for you from max/total; use it directly only when composing the stack yourself.",
		},
	],
	variants: {
		size: ["sm", "md", "lg"],
	},
	tokensUsed: ["muted", "muted-foreground", "background", "card", "popover"],
	a11y: [
		"Base UI tracks the image loading status and swaps to the fallback on missing/loading/error — no manual onError wiring.",
		"Provide meaningful alt text via the alt prop; pass an empty alt for decorative avatars.",
		"The fallback (initials/glyph) gives a non-image identity cue for screen readers and slow connections.",
		"AvatarGroup renders role=group; give it an aria-label naming the whole set (\"12 collaborators\"), since the visible stack only shows some of them.",
		"The \"+N\" count is hidden from screen readers and replaced by \"and N more\" (AvatarGroupCount `label`, or AvatarGroup `countLabel`).",
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
			label: "Sizes",
			code: '<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="sm" />\n<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="md" />\n<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="lg" />',
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
