import type { DesignNotes } from "."

export default {
	intro: "A full-screen branded splash while a whole page or route gets ready.",
	do: [
		"Use it for route changes, sign-in checks or the first data load.",
		"Show a clear message when the wait may be noticeable.",
	],
	dont: [
		"Use it for small waits inside a page. Use a spinner or skeleton.",
		"Leave it up forever if loading can fail. Show the error.",
	],
} satisfies DesignNotes
