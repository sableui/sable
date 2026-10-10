import {
	Combobox,
	comboboxMeta,
	ComboboxChips,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxVirtualList,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const TAGS = [
	"design",
	"research",
	"engineering",
	"marketing",
	"product",
	"operations",
]

const FRUITS =["Apple", "Banana", "Cherry", "Dragonfruit", "Elderberry", "Fig"]

/** Two thousand rows, grouped — the size at which rendering them all stops being free. */
const CITY_GROUPS = ["North", "South", "East", "West"].map((region) => ({
	value: region,
	items: Array.from({ length: 500 }, (_, index) => ({
		value: `${region}-${index}`,
		label: `${region} district ${index + 1}`,
	})),
}))

export function ComboboxPage() {
	const [tags, setTags] = useState<string[]>(["design", "research"])
	const [city, setCity] = useState<{ value: string; label: string } | null>(
		null,
	)

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Combobox"
				lede={ledeFor(comboboxMeta)}
			/>

			<Section
				title="Basic"
				description="Type to filter the list. The chosen option shows a check."
			>
				<Example>
					<div className="w-[18rem]">
						<Combobox items={FRUITS}>
							<ComboboxInput placeholder="Search fruit…" />
							<ComboboxContent>
								<ComboboxEmpty>No fruit matches your search.</ComboboxEmpty>
								<ComboboxList>
									{(item: string) => (
										<ComboboxItem key={item} value={item}>
											{item}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
					</div>
				</Example>
			</Section>

			<Section
				title="Multiple"
				description="Add multiple to pick several. Each pick becomes a chip you can remove, and the field grows as chips wrap."
			>
				<Example>
					<div className="flex w-full max-w-[420px] flex-col gap-3">
						<Combobox
							multiple
							items={TAGS}
							value={tags}
							onValueChange={setTags}
						>
							<ComboboxChips placeholder="Add tags…" />
							<ComboboxContent>
								<ComboboxEmpty>No matching tags.</ComboboxEmpty>
								<ComboboxList>
									{(item: string) => (
										<ComboboxItem key={item} value={item}>
											{item}
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<p className="text-body-sm text-muted-foreground">
							Selected: {tags.length > 0 ? tags.join(", ") : "none"}
						</p>
					</div>
				</Example>
			</Section>

			<Section
				title="Long lists"
				description="Two thousand options in four groups, still quick to scroll and filter."
			>
				<Example>
					<div className="flex flex-col gap-3">
						<div className="w-[18rem]">
							<Combobox
								virtualized
								items={CITY_GROUPS}
								value={city}
								onValueChange={setCity}
							>
								<ComboboxInput placeholder="Search 2,000 districts…" />
								<ComboboxContent scroll={false}>
									<ComboboxEmpty>No district matches.</ComboboxEmpty>
									<ComboboxVirtualList itemHeight={32}>
										{(item: { label: string }) => item.label}
									</ComboboxVirtualList>
								</ComboboxContent>
							</Combobox>
						</div>
						<p className="text-body-sm text-muted-foreground">
							Selected: {city?.label ?? "none"}
						</p>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={comboboxMeta} />
		</>
	)
}
