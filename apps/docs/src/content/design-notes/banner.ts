import type { DesignNotes } from "."

export default {
	intro: "A full-width strip for news that affects the whole page or app: outages, maintenance, big warnings.",
	do: [
		"Use the soft fill for notices and the solid fill for urgent, blocking states.",
		"Add one clear action when people can fix or inspect the problem.",
		"Let people dismiss notices that are safe to hide.",
	],
	dont: [
		"Stack several solid banners unless several things are truly broken.",
		"Use it inside a dialog, form or section. Use a note.",
		"Use it for feedback on one action or one field. Use a toast or inline status.",
	],
} satisfies DesignNotes
