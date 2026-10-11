import { Icon, Toggle, ToggleGroup, toggleMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function TogglePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Toggle" lede={ledeFor(toggleMeta)} />

			<ComponentPlayground meta={toggleMeta} />

			<Section
				title="Standalone"
				description="A button that stays pressed until pressed again."
			>
				<Example>
					<Toggle aria-label="Mute notifications">Mute</Toggle>
					<Toggle defaultPressed aria-label="Pin to top">
						Pinned
					</Toggle>
					<Toggle disabled aria-label="Archive">
						Archive
					</Toggle>
				</Example>
			</Section>

			<Section
				title="Single-select group"
				description="Only one can be pressed at a time, like a view switch."
			>
				<Example
					code={`<ToggleGroup defaultValue={["grid"]}>
	<Toggle value="grid" aria-label="Grid view">
		<Icon name="grid" />
	</Toggle>
	<Toggle value="list" aria-label="List view">
		<Icon name="list" />
	</Toggle>
</ToggleGroup>`}
				>
					<ToggleGroup defaultValue={["grid"]}>
						<Toggle value="grid" aria-label="Grid view">
							<Icon name="grid" className="text-base" />
						</Toggle>
						<Toggle value="list" aria-label="List view">
							<Icon name="list" className="text-base" />
						</Toggle>
					</ToggleGroup>
				</Example>
			</Section>

			<Section
				title="Segmented"
				description="The same single-select group drawn as one capsule, for a view switch."
			>
				<Example
					code={`<ToggleGroup appearance="segmented" defaultValue={["grid"]} aria-label="View">
	<Toggle value="grid" aria-label="Grid view">
		<Icon name="grid" />
	</Toggle>
	<Toggle value="list" aria-label="List view">
		<Icon name="list" />
	</Toggle>
</ToggleGroup>`}
				>
					<ToggleGroup appearance="segmented" defaultValue={["grid"]} aria-label="View">
						<Toggle value="grid" aria-label="Grid view">
							<Icon name="grid" />
						</Toggle>
						<Toggle value="list" aria-label="List view">
							<Icon name="list" />
						</Toggle>
					</ToggleGroup>
				</Example>
			</Section>

			<Section
				title="Multi-select group"
				description="Several can be pressed at once, like formatting buttons."
			>
				<Example
					code={`<ToggleGroup multiple defaultValue={["bold"]}>
	<Toggle value="bold">Bold</Toggle>
	<Toggle value="italic">Italic</Toggle>
	<Toggle value="underline">Underline</Toggle>
</ToggleGroup>`}
				>
					<ToggleGroup multiple defaultValue={["bold"]}>
						<Toggle value="bold">Bold</Toggle>
						<Toggle value="italic">Italic</Toggle>
						<Toggle value="underline">Underline</Toggle>
					</ToggleGroup>
				</Example>
			</Section>

			<MetaFooter meta={toggleMeta} />
		</>
	)
}
