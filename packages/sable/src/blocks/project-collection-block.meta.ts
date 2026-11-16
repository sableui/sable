import type { BlockMeta } from "../lib/meta"
export const projectCollectionBlockMeta: BlockMeta = {
	name: "ProjectCollectionBlock", family: "Media & files", kind: "card", width: { min: "18rem", max: "20rem" },
	summary: "A compact collection of three project summaries that expands into a readable list, with pointer depth while it is closed.",
	intent: "A browsable small collection of related work. Replace the sample projects after copying; use a grid or table for a large workspace.",
	notes: ["CardStack owns overlap, hidden-card inertness and explicit expansion. Tilt gives the closed stack a little depth under a mouse; opened, the cards sit flat and still, a list to read. Static on touch and under subtle/off motion.", "Each project is a Card: a CardHeader with title, description and a count Badge in CardAction, and a footer of collaborators and when it last changed. Cards keep their keys and content while the collection opens; nothing auto-advances."],
	a11y: ["Press the front card to expand or collapse the collection. Base UI owns Enter/Space activation, and the same trigger retains focus in both states.", "All projects become readable in normal flow when expanded. Tilt adds no tab stops or essential content."],
}
