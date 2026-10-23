import type { ComponentMeta } from "../../lib/meta"

export const agentAvatarMeta: ComponentMeta = {
	name: "AgentAvatar",
	summary:
		"The default avatar for an AI agent's turns: a sable looking out of its den. It peeks at rest, climbs out to look at a nearby pointer, sinks low to think and comes up to talk, so the avatar itself says the agent is working. SVG from semantic tokens on the Avatar size ladder; every agent avatar on a page shares one animation loop.",
	status: "stable",
	keywords: [
		"agent",
		"assistant",
		"ai",
		"bot",
		"chat",
		"avatar",
		"copilot",
		"llm",
		"thinking",
		"speaking",
		"mascot",
		"sable",
	],
	usage: {
		description:
			"Use AgentAvatar as the avatar of every AI agent turn in a conversation — the Message `avatar` of an assistant reply, the header of an agent panel. Drive `state` from the turn's own pending state: `thinking` before the first token, `speaking` while the reply streams, `idle` once it settles. It replaces the \"AI\" initials avatar, which reads as a person called A. I.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep only the newest agent turn live. Pass `live={false}` to every earlier turn: they settle into the resting frame and stop tracking the pointer, so a long transcript does not watch the reader from every row.",
			},
			{
				guidance: "do",
				description:
					"Drive `state` from the same flag that drives the composer's busy state and the reply's streaming, so the avatar, the composer and the message never disagree about whether the agent is still working.",
			},
			{
				guidance: "do",
				description:
					"Let the thinking state stand in for a spinner in the message row. Pair it with a text status (role=status) for thinking, writing and completion, so the wait remains understandable without animation or sight. A second animated indicator is unnecessary.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a person, a team or an account. People are an Avatar — a photo, initials, or GradientArt seeded by the person. A character on a human's turn reads as a joke at their expense.",
				instead: ["Avatar"],
			},
			{
				guidance: "dont",
				description:
					"Do not use it as a standalone loading indicator outside a conversation. It is an identity that also shows state; a wait with no agent attached is a Spinner, or a ThinkingOrb when the wait is the experience.",
				instead: ["Spinner", "ThinkingOrb"],
			},
			{
				guidance: "dont",
				description:
					"Do not wrap it in a button or make it clickable to fake an interaction. The pointer reactions are ambient; a control that looks like the agent belongs in the panel header as a real Button.",
				instead: ["Button"],
			},
		],
	},
	related: {
		components: ["Avatar", "Message", "ThinkingOrb", "ChatComposer", "StreamingText", "Bubble"],
	},
	props: [
		{
			name: "state",
			type: '"idle" | "thinking" | "speaking"',
			default: '"idle"',
			description:
				"What the agent is doing. `thinking` sinks it low in the den with its eyes scanning upward; `speaking` brings it up to talk, bobbing with the reply; `idle` peeks.",
		},
		{
			name: "size",
			type: '"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"',
			default: '"md"',
			description:
				"The Avatar size ladder: 20 / 24 / 32 / 40 / 48px for rows, 96 / 160px for portraits. In a Message, match its `avatarSize` (default `sm`).",
		},
		{
			name: "live",
			type: "boolean",
			default: "true",
			description:
				"Whether it animates. `false` settles into the resting frame (ignoring `state`) and stops tracking the pointer — for every agent turn except the newest.",
		},
		{
			name: "label",
			type: "string",
			default: '"Assistant"',
			description: "The accessible name (role=img). Use the agent's product name if it has one.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			description:
				"Turns this avatar's motion down. `subtle` keeps the states (sinking to think, bobbing to speak) and drops the flourishes: pointer tracking, blinks, ear twitches, idle glances, the spring's overshoot. `off` draws each state as a still pose. The reader's reduce-motion setting always wins.",
		},
		{
			name: "className",
			type: "string",
			description: "Layout only. The frame and ink come from the theme's muted, foreground and background tokens.",
		},
	],
	tokensUsed: ["muted", "foreground", "background"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives with its message, and the message owns the arrival. Its first painted frame is already the resting pose for its state, so there is nothing to stage.",
		},
		{
			slot: "response",
			recipe: "custom",
			part: "Root",
			why: "Within about four of its widths it notices the pointer: the eyes follow it, the ears perk and it climbs out of the den; over it, the eyes turn happy. Driven per frame in JS from one shared pointer listener, expressive motion only, and only on a live avatar. It is not a control, so there is no press.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Root",
			why: "Between states the body travels on a spring: up to speak, down to think, back to peeking. The spring's overshoot is expressive; under `subtle` it becomes a plain ease that still carries the state change.",
		},
		{
			slot: "activity",
			recipe: "custom",
			part: "Root",
			why: "Thinking scans the eyes upward and speaking bobs the body with the reply — the avatar's own way of saying the agent is working, in place of a spinner. These run under `subtle` too; under reduced motion or `off`, each state is a still pose (thinking: sunk low, eyes up).",
		},
	],
	a11y: [
		"role=img with an aria-label (default \"Assistant\"); the SVG is aria-hidden.",
		"State changes are not announced by the image. Provide a separate text status (role=status) for thinking, writing and completion. Keep announcements to phase changes rather than every streamed token.",
		"Not focusable and not clickable: every reaction is ambient, so nothing is lost to a keyboard or switch user.",
		"Honours the motion policy: reduce-motion or MotionProvider off draws a still pose per state and never starts the loop; `subtle` drops tracking, blinks and twitches.",
		"Ink is the theme's foreground on the muted frame, held to contrast in every theme; the eyes are the background colour, so they read in light and dark alike.",
	],
	examples: [
		{ label: "Default", code: "<AgentAvatar />" },
		{
			label: "States",
			code: '<AgentAvatar size="lg" />\n<AgentAvatar size="lg" state="thinking" />\n<AgentAvatar size="lg" state="speaking" />',
		},
		{
			label: "Sizes",
			code: '<AgentAvatar size="2xs" />\n<AgentAvatar size="xs" />\n<AgentAvatar size="sm" />\n<AgentAvatar size="md" />\n<AgentAvatar size="lg" />\n<AgentAvatar size="xl" />',
		},
		{
			label: "In a conversation (only the newest turn is live)",
			code: `<Message messageId="a1" avatar={<AgentAvatar size="sm" live={false} />}>
	<Bubble>Anchor on the oldest rendered message instead.</Bubble>
</Message>
<Message messageId="u1" align="end">
	<Bubble variant="primary" align="end">Does that cover new messages too?</Bubble>
</Message>
<Message messageId="a2" avatar={<AgentAvatar size="sm" state="speaking" />}>
	<Bubble>Yes. Appends leave the anchor alone, so the same rule covers both.</Bubble>
</Message>`,
		},
	],
}
