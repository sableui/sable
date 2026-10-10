import type { DesignNotes } from "."

export default {
	intro: "A panel that groups related form fields under one name, like profile details or notification settings.",
	do: [
		"Group fields that answer one shared question.",
		"Give the group a clear, meaningful name.",
		"Disable the whole group at once when it can't be edited.",
	],
	dont: [
		"Use it just for spacing or to box unrelated fields.",
		"Use the group name as a section heading.",
	],
} satisfies DesignNotes
