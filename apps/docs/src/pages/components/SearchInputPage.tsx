import { Field, SearchInput, searchInputMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

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
				description="The clear button appears once there's text."
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
