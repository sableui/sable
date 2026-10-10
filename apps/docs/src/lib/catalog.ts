import summary from "../generated/catalog-summary.json"
import {
	type ComponentGroup,
	type ComponentMeta,
	type ComponentRegister,
	componentLabel,
	componentSlug,
} from "@sableui/react"

/** Navigation and gallery metadata only. sync-guides derives this small
 * projection from the registry; full agent contracts never enter the root. */
export interface CatalogEntry extends Pick<ComponentMeta, "name" | "summary" | "keywords" | "status" | "related"> {
	group: ComponentGroup
	register: ComponentRegister
	path: string
	slug: string
	label: string
}

export const CATALOG_VERSION = summary.version
export const CATALOG: CatalogEntry[] = summary.components.map((entry) => ({
	...entry,
	group: entry.group as ComponentGroup,
	register: entry.register as ComponentRegister,
	status: entry.status as ComponentMeta["status"],
	slug: componentSlug(entry.name),
	label: componentLabel(entry.name),
}))

export const CATALOG_BY_SLUG: Record<string, CatalogEntry> = Object.fromEntries(
	CATALOG.map((entry) => [entry.slug, entry]),
)

export const REGISTER_LABELS: Record<ComponentRegister, string> = {
	either: "Any surface",
	page: "Page",
	workspace: "Workspace",
}

/** Keep synonyms searchable without eagerly loading props or example source. */
export const SEARCH_DOCS: Record<string, string> = Object.fromEntries(
	CATALOG.map((entry) => [entry.slug, [entry.label, entry.name, entry.summary,
		entry.group, ...(entry.keywords ?? []), ...(entry.related?.components ?? []),
	].join(" ").toLowerCase()]),
)
