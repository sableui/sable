import { Pill, pillMeta, Row } from "@sableui/react"
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
const TAGS = [
	{ label: "Design", tone: "blue" },
	{ label: "Research", tone: "teal" },
	{ label: "Marketing", tone: "orange" },
	{ label: "Launch", tone: "purple" },
] as const

export function PillPage() {
	const [selected, setSelected] = useState("All")
	const [tags, setTags] = useState<string[]>(["Design"])
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
