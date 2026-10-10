/**
 * Designer-facing notes for each component page: a short intro and the do's
 * and don'ts, in plain words.
 *
 * The component's `.meta.ts` stays the agent contract: full guidance with
 * prop names, token reasoning and edge cases, served through the registry and
 * `llms/`. Agents build from that. These notes are the site's own, shorter
 * telling for a person scanning the catalog, so they live here and never ship
 * in the package. If a note says something the meta does not, the meta is
 * missing it: fix the meta first.
 *
 * One file per component, named by slug (`radio-card.ts`), default-exporting
 * a `DesignNotes`.
 */
export interface DesignNotes {
	/** One or two short sentences: what it is for, when to pick it. */
	intro: string
	/** Two to four short lines. */
	do: string[]
	/** One to three short lines. */
	dont: string[]
}

const modules = import.meta.glob<{ default: DesignNotes }>("./*.ts", { eager: true })

export const DESIGN_NOTES: Record<string, DesignNotes> = Object.fromEntries(
	Object.entries(modules)
		.filter(([path]) => !path.endsWith("/index.ts"))
		.map(([path, mod]) => [path.slice(2, -3), mod.default]),
)
