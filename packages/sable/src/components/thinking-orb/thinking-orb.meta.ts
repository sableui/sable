import type { ComponentMeta } from "../../lib/meta"

export const thinkingOrbMeta: ComponentMeta = {
	name: "ThinkingOrb",
	summary:
		"Canvas dot-cloud 'agent is thinking' indicator. Three generated modes (orbit / globe / mesh) drawn from pure math — no icon dependency, no animation library. Ink follows currentColor; size steps are separately tuned.",
	status: "stable",
	keywords: [
		"thinking",
		"orb",
		"agent",
		"ai",
		"chat",
		"loading",
		"streaming",
		"indeterminate",
		"canvas",
	],
	usage: {
		description:
			"Use ThinkingOrb while an AI agent is working and there is nothing specific to report yet — before the first token streams, or between tool calls. It is a richer, more characterful sibling of Spinner for the one place in a product where the wait is the experience.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Reserve it for the single active agent state — the composer, the streaming message header, a standalone thinking screen. One orb on screen reads as intent; several read as decoration.",
			},
			{
				guidance: "do",
				description:
					"Switch mode to say what kind of work is happening: orbit for generic thinking, globe while searching or retrieving, mesh while relating sources or running tools. Pair it with a text status so the phase is legible without decoding the animation.",
			},
			{
				guidance: "do",
				description:
					"Use size=\"sm\" inline in a message row or composer and size=\"lg\" only when the orb is the main thing on screen. The size steps are separately tuned, not scaled, so the small one stays legible.",
			},
			{
				guidance: "dont",
				description:
					"Do not put one on every row of a list or in a repeated skeleton. Each orb runs its own animation frame loop painting hundreds of arcs; use Skeleton for content-shaped waits and Spinner inside buttons.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a determinate wait. It carries no sense of how far along anything is — reach for Progress when a percentage exists.",
			},
			{
				guidance: "dont",
				description:
					"Do not rely on the animation alone to announce the wait. Give the label a short constant phrase (it is the role=status announcement) or place a status message next to it.",
			},
			{
				guidance: "dont",
				description:
					"Do not pass a label that changes while the orb is up. It is the accessible name of a live region, so every change re-announces the whole thing — feed it a per-token phase and a screen reader interrupts on each delta: \"Chromatic drift\" → \"Chromatic drift · rgb-shift\" → \"Chromatic drift · rgb-shift → grain\", which is unusable. The label names the wait (\"Thinking\"); the phase belongs in adjacent text, as in the \"Inline with a status line\" example. If the phase must be announced, announce it once when the turn settles from a separate live region — not per update.",
			},
		],
	},
	related: {
		components: ["Spinner", "Skeleton", "Progress", "InlineStatus", "ChatComposer", "Message"],
	},
	props: [
		{
			name: "mode",
			type: '"orbit" | "globe" | "mesh"',
			default: '"orbit"',
			description:
				"Which cloud to draw. orbit = generic working, globe = searching/retrieving (a scan band sweeps pole to pole), mesh = relating things (nodes wire to near neighbours and signals run the edges).",
		},
		{
			name: "size",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description:
				"Rendered box on the spacing scale: sm 5 units (20px at the default spacing; inline in a composer or message row), md 8 (32px; beside a status line), lg 16 (64px; standalone). The box moves with density like the text beside it, and the canvas re-measures it. Each step has its own dot density, dot size and speed.",
		},
		{
			name: "speed",
			type: "number",
			default: "1",
			description: "Multiplier on top of the per-size tuned speed. Below ~0.5 the orb reads as stalled.",
		},
		{
			name: "paused",
			type: "boolean",
			default: "false",
			description: "Freeze on a representative still frame without unmounting.",
		},
		{
			name: "label",
			type: "string",
			default: '"Thinking"',
			description:
				"Accessible label announced by screen readers while visible (sets aria-label on the role=status element). Must stay constant for as long as the orb is mounted — it names the wait, it does not report progress.",
		},
		{
			name: "className",
			type: "string",
			description:
				"Set the ink with a semantic text-* token (the dots are drawn from the element's computed color). The box is sized by the size prop, not by className.",
		},
	],
	tokensUsed: ["foreground", "muted-foreground", "primary"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "The orb appears when work starts, and the point cloud is already in motion on its first painted frame. There is nothing to stage.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Root",
			why: "It reports state; it is not a control. A hover reaction would suggest the wait is something you can click your way out of.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Root",
			why: "Changing `mode` swaps the renderer on the next frame: the cloud is redrawn as the new shape, not morphed into it. The phase change is carried by the status text beside the orb, which is what a reader actually reads; a per-particle morph would be decoration on top of it.",
		},
		{
			slot: "activity",
			recipe: "custom",
			part: "Root",
			why: "The cloud is drawn per frame on a canvas by a single requestAnimationFrame loop — no CSS animation exists to name here. The loop reads the motion policy itself, which is the part worth checking when auditing: `custom` means the kill-switch is honoured in JS rather than by --motion-scale.",
		},
	],
	a11y: [
		"Wrapped in role=status, a polite live region, with an aria-label (default 'Thinking'); the canvas itself is aria-hidden.",
		"Because that label is the live region's accessible name, it must not change while the orb is mounted — a name that churns re-announces on every change, so a phase recomputed per streamed delta becomes an interruption per delta. Keep the label constant and let the phase live in adjacent text; announce an outcome once when the work settles, from a separate region.",
		"Ink is the element's computed color, so contrast is the consumer's token choice — pair with foreground or muted-foreground rather than a decorative tint.",
		"Honours the motion policy: under prefers-reduced-motion or <MotionProvider> off, it paints one still frame and never starts an animation loop.",
		"The loop also stops when the orb scrolls out of view or the tab is backgrounded, so a forgotten orb cannot burn a CPU core.",
	],
	examples: [
		{ label: "Default", code: "<ThinkingOrb />" },
		{
			label: "Modes",
			code: '<ThinkingOrb mode="orbit" size="lg" />\n<ThinkingOrb mode="globe" size="lg" />\n<ThinkingOrb mode="mesh" size="lg" />',
		},
		{
			label: "Inline with a status line (the label stays constant, the phase moves)",
			code: '<InlineStatus icon={<ThinkingOrb mode="globe" size="sm" label="Searching" />}>Searching your workspace…</InlineStatus>',
		},
		{
			label: "Tinted and paused",
			code: '<ThinkingOrb size="lg" className="text-primary" paused />',
		},
	],
}
