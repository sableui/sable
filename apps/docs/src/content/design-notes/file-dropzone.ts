import type { DesignNotes } from "."

export default {
	intro: "A drop target and file picker in one, for sections where adding files is the main job.",
	do: [
		"State the limits up front, like \"PNG or PDF, up to 10 MB\".",
		"List added files below it, and shrink the zone to a strip.",
		"Disable it when the file limit is reached, and say why.",
	],
	dont: [
		"Use it for a quick attach in a composer or toolbar. Use a paperclip button.",
		"Drop rejected files silently. Say which one and how to fix it.",
	],
} satisfies DesignNotes
