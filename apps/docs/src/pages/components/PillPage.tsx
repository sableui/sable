import { Pill, pillMeta, Row, SearchInput } from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const FILTERS = ["All", "Projects", "Reports", "Docs"]
const PROJECT_FILTERS = [
	{ id: "all", label: "All 8" },
	{ id: "products", label: "Products 5" },
	{ id: "oss", label: "Open source 2" },
] as const

const TOOLBAR_CODE = `<Row gap={2} align="center" justify="between" wrap>
  <Row gap={1}>
    <Pill size="lg" selected>All 8</Pill>
    <Pill size="lg">Products 5</Pill>
    <Pill size="lg">Open source 2</Pill>
  </Row>
  <SearchInput size="sm" placeholder="Find a project…" aria-label="Find a project" className="max-w-64" />
</Row>`
const TAGS = [
	{ label: "Design", tone: "blue" },
	{ label: "Research", tone: "teal" },
	{ label: "Marketing", tone: "orange" },
	{ label: "Launch", tone: "purple" },
] as const

export function PillPage() {
	const [selected, setSelected] = useState("All")
	const [tags, setTags] = useState<string[]>(["Design"])
	const [project, setProject] = useState<string>("all")
	const [query, setQuery] = useState("")
	const toggle = (tag: string) => setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))

	return (
		<>
			<PageHeader eyebrow="Components" title="Pill" lede={ledeFor(pillMeta)} />

			<ComponentPlayground meta={pillMeta} />

			<Section
				title="Filters"
				description="A row of choices. The chosen one fills in. For a label that only describes something, use Badge."
			>
				<Example>
					<Row gap={1}>
						{FILTERS.map((filter) => (
							<Pill
								key={filter}
								selected={selected === filter}
								onClick={() => setSelected(filter)}
							>
								{filter}
							</Pill>
						))}
					</Row>
				</Example>
			</Section>

			<Section
				title="Filters with search"
				description="Chips beside a search field share one height: Pill lg and SearchInput sm both stand on --control-sm, the toolbar rung (Button sm is on it too). Pill md is 28px and no page field matches it, so md beside a field always reads off by a step."
			>
				<Example code={TOOLBAR_CODE}>
					<Row gap={2} align="center" justify="between" wrap className="w-full">
						<Row gap={1}>
							{PROJECT_FILTERS.map((filter) => (
								<Pill
									key={filter.id}
									size="lg"
									selected={project === filter.id}
									onClick={() => setProject(filter.id)}
								>
									{filter.label}
								</Pill>
							))}
						</Row>
						<SearchInput
							size="sm"
							value={query}
							onValueChange={setQuery}
							placeholder="Find a project…"
							aria-label="Find a project"
							className="max-w-64"
						/>
					</Row>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="lg is the toolbar chip (32px), md the chip in a row of its own (28px), sm the small chip under content (24px, the target floor)."
			>
				<Example
					code={`<Pill size="lg">Large</Pill>
<Pill size="md">Medium</Pill>
<Pill size="sm">Small</Pill>`}
				>
					<Row gap={1} align="center">
						<Pill size="lg">Large</Pill>
						<Pill size="md">Medium</Pill>
						<Pill size="sm">Small</Pill>
					</Row>
				</Example>
			</Section>

			<Section
				title="Tag colours"
				description="A palette family as the tone colours each chip as its category: a wash at rest, the solid colour once chosen. The colours come from the theme's generated palette."
			>
				<Example
					code={`<Pill tone="blue" selected>Design</Pill>
<Pill tone="teal">Research</Pill>
<Pill tone="orange">Marketing</Pill>`}
				>
					<Row gap={1}>
						{TAGS.map((tag) => (
							<Pill key={tag.label} tone={tag.tone} selected={tags.includes(tag.label)} onClick={() => toggle(tag.label)}>
								{tag.label}
							</Pill>
						))}
					</Row>
				</Example>
			</Section>

			<MetaFooter meta={pillMeta} />
		</>
	)
}
