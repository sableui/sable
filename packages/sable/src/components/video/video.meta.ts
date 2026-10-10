import type { ComponentMeta } from "../../lib/meta"

export const videoMeta: ComponentMeta = {
	name: "Video",
	summary:
		"Styled 16:9 video player frame. Mounts a native <video> when given a src, or shows a poster/placeholder with a centered play overlay.",
	status: "stable",
	keywords: [
		"video",
		"media",
		"player",
		"demo",
	],
	usage: {
		description: "Use Video to embed playable or previewable video media inside a page.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use captions, poster imagery, and controls when the video carries information.",
			},
			{
				guidance: "do",
				description: "Keep the surrounding layout stable while media loads.",
			},
			{
				guidance: "dont",
				description: "Do not autoplay important audio or make video the only way to access required information.",
			},
			{
				guidance: "dont",
				description: "Do not ship it without captions or a transcript. Captions are what make video usable for deaf users and searchable for everyone; a video with neither is inaccessible content you also cannot index.",
			},
		],
	},
	related: {
		components: ["Carousel", "Dialog", "Badge"],
	},
	props: [
		{
			name: "onRequestPlay",
			type: "() => void",
			description:
				"Placeholder only (no src): renders the play mark as a real button labelled \"Play video\" that calls this — e.g. to load the source. Without it the mark is decorative.",
		},
		{
			name: "src",
			type: "string",
			description:
				"Video source URL. When omitted, a poster/placeholder with a play overlay renders.",
		},
		{
			name: "poster",
			type: "string",
			description:
				"Poster image shown before playback (and as the placeholder backdrop).",
		},
		{
			name: "controls",
			type: "boolean",
			default: "true",
			description: "Show native playback controls.",
		},
	],
	tokensUsed: ["border", "overlay", "overlay-foreground", "ring"],
	a11y: [
		"Mounts a native <video> element, preserving built-in keyboard controls when controls is enabled.",
		"Without onRequestPlay the placeholder play mark is decorative (aria-hidden) — nothing on the frame pretends to be pressable. With it, the mark is a native button named \"Play video\".",
	],
	examples: [
		{
			label: "With a poster",
			code: '<Video poster="/cover.jpg" src="/clip.mp4" />',
		},
		{
			label: "Placeholder (no src)",
			code: '<Video poster="/cover.jpg" />',
		},
		{
			label: "Placeholder that loads on play",
			code: '<Video poster="/cover.jpg" src={src} onRequestPlay={() => setSrc("/clip.mp4")} />',
		},
	],
}
