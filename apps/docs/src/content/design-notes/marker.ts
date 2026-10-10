import type { DesignNotes } from "."

export default {
	intro: "Everything in a chat that isn't a message: date breaks, \"Carla joined\", \"Thinking…\", tool activity. It annotates the conversation without competing with it.",
	do: [
		"Update the status text as the work moves along.",
		"Use the separator style for date breaks.",
		"Box a note only when it needs containing, like an error or a deadline.",
	],
	dont: [
		"Style it as loud as a message.",
		"Leave a \"Thinking…\" status up after the work is done.",
		"Use it for something a person or assistant said. That is a message.",
	],
} satisfies DesignNotes
