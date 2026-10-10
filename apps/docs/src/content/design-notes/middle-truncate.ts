import type { DesignNotes } from "."

export default {
	intro: "Shortens a long ID, hash or address from the middle so both ends stay readable.",
	do: [
		"Use it for hashes, addresses, long file names and generated IDs.",
		"Offer a way to copy or see the full value.",
	],
	dont: [
		"Use it on prose, where the middle words matter.",
	],
} satisfies DesignNotes
