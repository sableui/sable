import type { DesignNotes } from "."

export default {
	intro: "A box for code people will read or copy, with an optional filename and a copy button. With a prompt, it is a one-line command to paste into a terminal.",
	do: [
		"Add a filename or caption when it helps place the snippet.",
		"Keep examples complete enough to teach the pattern.",
		"Let code colors follow the theme, not a fixed palette.",
		"Keep a command to one line, so copying it gives exactly what runs.",
	],
	dont: [
		"Use it for a short name in a sentence. Use inline code.",
		"Leave stray leading indentation in the example.",
	],
} satisfies DesignNotes
