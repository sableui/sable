import { Button, Field, Icon, Pill, Row, SearchInput, searchInputMeta, Stack } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const PROJECT_FILTERS = [
	{ id: "all", label: "All 8" },
	{ id: "products", label: "Products 5" },
	{ id: "oss", label: "Open source 2" },
] as const

const POST_TYPES = [
	"Projects",
	"Reports",
	"Standard posts",
	"Messages",
	"Profiles",
]

export function SearchInputPage() {
	const [query, setQuery] = useState("")
	const [filtered, setFiltered] = useState("reports")
	const [project, setProject] = useState<string>("all")
	const [toolbarQuery, setToolbarQuery] = useState("")

	const matches = POST_TYPES.filter((type) =>
		type.toLowerCase().includes(filtered.toLowerCase()),
	)

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Search Input"
				lede={ledeFor(searchInputMeta)}
			/>

			<Section
				title="Default"
				description="The clear button fades in once there's text."
			>
				<Example
					code={`<Field label="Search posts" className="w-full max-w-80">
  <SearchInput value={query} onValueChange={setQuery} placeholder="Search posts" />
</Field>`}
				>
					<Field label="Search posts" className="w-full max-w-80">
						<SearchInput value={query} onValueChange={setQuery} placeholder="Search posts" />
					</Field>
				</Example>
			</Section>

			<Section
				title="Live filtering"
				description="Results narrow as you type. The X clears the field."
			>
				<Example>
					<div className="flex w-full max-w-80 flex-col gap-3">
						<Field label="Filter post types">
							<SearchInput
								value={filtered}
								onValueChange={setFiltered}
								placeholder="Filter results"
							/>
						</Field>
						<ul className="flex flex-col gap-1" aria-live="polite">
							{matches.length > 0 ? (
								matches.map((type) => (
									<li key={type} className="text-body-md text-foreground">
										{type}
									</li>
								))
							) : (
								<li className="text-body-md text-muted-foreground">
									No matches.
								</li>
							)}
						</ul>
					</div>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="The same ladder names as Input, Select and Combobox. md is the form field, sm the toolbar field, xs the inset field of a tool panel. The magnifier and the X scale with the rung and stay centred."
			>
				<Example
					code={`<SearchInput size="md" defaultValue="roadmap" aria-label="Search posts" />
<SearchInput size="sm" defaultValue="roadmap" aria-label="Find a project" />
<SearchInput size="xs" defaultValue="roadmap" aria-label="Filter layers" />`}
				>
					<Stack gap={1} className="w-full max-w-80">
						<SearchInput size="md" defaultValue="roadmap" aria-label="Search posts" />
						<SearchInput size="sm" defaultValue="roadmap" aria-label="Find a project" />
						<SearchInput size="xs" defaultValue="roadmap" aria-label="Filter layers" />
					</Stack>
				</Example>
			</Section>

			<Section
				title="Filters with search"
				description="In a toolbar, size sm shares --control-sm with Pill lg and Button sm, so the chips, the field and the action are one height in either density."
			>
				<Example
					code={`<Row gap={2} align="center" justify="between" wrap>
  <Row gap={1}>
    <Pill size="lg" selected>All 8</Pill>
    <Pill size="lg">Products 5</Pill>
    <Pill size="lg">Open source 2</Pill>
  </Row>
  <Row gap={1} align="center">
    <SearchInput size="sm" placeholder="Find a project…" aria-label="Find a project" className="max-w-64" />
    <Button size="sm" iconStart={<Icon name="plus" />}>New</Button>
  </Row>
</Row>`}
				>
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
						<Row gap={1} align="center">
							<SearchInput
								size="sm"
								value={toolbarQuery}
								onValueChange={setToolbarQuery}
								placeholder="Find a project…"
								aria-label="Find a project"
								className="max-w-64"
							/>
							<Button size="sm" iconStart={<Icon name="plus" />}>
								New
							</Button>
						</Row>
					</Row>
				</Example>
			</Section>

			<Section
				title="Uncontrolled"
				description="With a default value the field tracks its own text, and the X still clears it."
			>
				<Example
					code={`<Field label="Search customers" className="w-full max-w-80">
  <SearchInput defaultValue="Morgan" placeholder="Search customers" />
</Field>`}
				>
					<Field label="Search customers" className="w-full max-w-80">
						<SearchInput defaultValue="Morgan" placeholder="Search customers" />
					</Field>
				</Example>
			</Section>

			<Section
				title="States"
				description="Error and disabled."
			>
				<Example>
					<div className="flex w-full max-w-80 flex-col gap-3">
						<Field label="Search posts" error="Search is unavailable right now.">
							<SearchInput aria-invalid placeholder="Invalid" />
						</Field>
						<Field label="Search archive" disabled>
							<SearchInput disabled placeholder="Disabled" />
						</Field>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={searchInputMeta} />
		</>
	)
}
