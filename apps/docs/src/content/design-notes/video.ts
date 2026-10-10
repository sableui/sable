import type { DesignNotes } from "."

export default {
	intro: "A 16:9 frame for playing or previewing a video, with a poster until it starts.",
	do: [
		"Add captions or a transcript.",
		"Use a poster image and visible controls when the video carries information.",
		"Keep the layout steady while the video loads.",
	],
	dont: [
		"Autoplay important audio.",
		"Make the video the only way to get required information.",
	],
} satisfies DesignNotes
