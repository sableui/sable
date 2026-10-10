import type { ComponentGroup } from "@sableui/react"
import { DESIGN_NOTES } from "../content/design-notes"
import { CATALOG } from "./catalog"

/**
 * Every component's designer do's and don'ts, flattened for the Guidelines
 * page. The agent-side guidance (and the lint rules CI enforces) lives in the
 * registry; this is the site's short telling of it.
 */
export interface Practice {
	component: string
	label: string
	slug: string
	group: ComponentGroup
	guidance: "do" | "dont"
	description: string
}

export const PRACTICES: Practice[] = CATALOG.flatMap((entry) => {
	const notes = DESIGN_NOTES[entry.slug]
	if (!notes) return []
	const base = { component: entry.name, label: entry.label, slug: entry.slug, group: entry.group }
	return [
		...notes.do.map((description) => ({ ...base, guidance: "do" as const, description })),
		...notes.dont.map((description) => ({ ...base, guidance: "dont" as const, description })),
	]
})
