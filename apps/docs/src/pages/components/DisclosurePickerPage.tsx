import {
	Density,
	DisclosurePicker,
	DisclosurePickerEmpty,
	DisclosurePickerList,
	DisclosurePickerOption,
	DisclosurePickerPanel,
	DisclosurePickerTrigger,
	type ThemeId,
	ThemePreview,
	disclosurePickerMeta,
} from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { useTheme } from "../../theme"

const DENSITIES = [
	{ value: "comfortable", label: "Comfortable" },
	{ value: "compact", label: "Compact" },
	{ value: "spacious", label: "Spacious" },
]

const COUNTRIES = [
	"Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "Denmark", "Finland", "France",
	"Germany", "Ireland", "Italy", "Japan", "Mexico", "Norway", "Portugal", "Spain", "Sweden",
]

const BLENDS = ["normal", "multiply", "screen", "overlay", "darken", "lighten"]

function ShortList() {
	const [density, setDensity] = useState("comfortable")
	return (
		<div className="w-full max-w-72">
			<DisclosurePicker>
				<DisclosurePickerTrigger label="Density">{DENSITIES.find((d) => d.value === density)?.label}</DisclosurePickerTrigger>
				<DisclosurePickerPanel>
					<DisclosurePickerList aria-label="Density" value={density} onValueChange={setDensity}>
						{DENSITIES.map((d) => (
							<DisclosurePickerOption key={d.value} value={d.value}>
								{d.label}
							</DisclosurePickerOption>
						))}
					</DisclosurePickerList>
				</DisclosurePickerPanel>
			</DisclosurePicker>
		</div>
	)
}

function LongList() {
	const [country, setCountry] = useState("Canada")
	const [query, setQuery] = useState("")
	const q = query.trim().toLowerCase()
	const shown = COUNTRIES.filter((name) => name.toLowerCase().includes(q))
	return (
		<div className="w-full max-w-72">
			<DisclosurePicker>
				<DisclosurePickerTrigger label="Country">{country}</DisclosurePickerTrigger>
				<DisclosurePickerPanel search={{ value: query, onValueChange: setQuery, placeholder: `Search ${COUNTRIES.length} countries` }}>
					{shown.length > 0 ? (
						<DisclosurePickerList aria-label="Country" value={country} onValueChange={setCountry}>
							{shown.map((name) => (
								<DisclosurePickerOption key={name} value={name}>
									{name}
								</DisclosurePickerOption>
							))}
						</DisclosurePickerList>
					) : (
						<DisclosurePickerEmpty>No countries match “{query}”.</DisclosurePickerEmpty>
					)}
				</DisclosurePickerPanel>
			</DisclosurePicker>
		</div>
	)
}

function ThemeRow() {
	const { themes, mode } = useTheme()
	const [themeId, setThemeId] = useState<ThemeId>("meridian")
	const current = themes.find((theme) => theme.id === themeId)
	return (
		<div className="w-full max-w-72">
			<DisclosurePicker>
				<DisclosurePickerTrigger
					aria-label={`Theme: ${current?.label ?? themeId}`}
					media={current ? <ThemePreview theme={current} mode={mode} size="sm" /> : null}
				>
					{current?.label ?? themeId}
				</DisclosurePickerTrigger>
				<DisclosurePickerPanel>
					<DisclosurePickerList aria-label="Theme" value={themeId} onValueChange={(id) => setThemeId(id as ThemeId)}>
						{themes.map((theme) => (
							<DisclosurePickerOption key={theme.id} value={theme.id} media={<ThemePreview theme={theme} mode={mode} size="sm" />}>
								{theme.label}
							</DisclosurePickerOption>
						))}
					</DisclosurePickerList>
				</DisclosurePickerPanel>
			</DisclosurePicker>
		</div>
	)
}

function PropertyGrid() {
	const [open, setOpen] = useState<string | null>(null)
	const [blend, setBlend] = useState("normal")
	const [fill, setFill] = useState("Solid")
	const rows = [
		{ id: "blend", label: "Blend", value: blend, set: setBlend, options: BLENDS },
		{ id: "fill", label: "Fill", value: fill, set: setFill, options: ["Solid", "Linear", "Radial", "Image"] },
	]
	return (
		<Density value="compact" className="grid w-full max-w-64 gap-1">
			{rows.map((row) => (
				<DisclosurePicker key={row.id} size="xs" open={open === row.id} onOpenChange={(next) => setOpen(next ? row.id : null)}>
					<DisclosurePickerTrigger label={row.label}>{row.value}</DisclosurePickerTrigger>
					<DisclosurePickerPanel>
						<DisclosurePickerList aria-label={row.label} value={row.value} onValueChange={row.set}>
							{row.options.map((option) => (
								<DisclosurePickerOption key={option} value={option}>
									{option}
								</DisclosurePickerOption>
							))}
						</DisclosurePickerList>
					</DisclosurePickerPanel>
				</DisclosurePicker>
			))}
		</Density>
	)
}

export function DisclosurePickerPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Disclosure Picker" lede={ledeFor(disclosurePickerMeta)} />

			<Section
				title="A short list, no search"
				description="Search is opt-in. Three options read faster with nothing to skip past, so the panel holds the list alone: no empty search row, no gap. Opening from the keyboard lands on the chosen option; the arrow keys, Home/End and type-ahead move through the list without changing anything, Enter (or Space, or a click) picks and closes, and Escape closes with the value untouched."
			>
				<Example>
					<ShortList />
				</Example>
			</Section>

			<Section
				title="A long list, search on"
				description="Once a list scrolls — roughly a dozen options or more — pass `search` to the panel. You own the query and the filtering; the picker clears it when the row closes, and Escape clears it before it closes anything. ArrowDown steps from the field into the list and ArrowUp from the first option steps back. When nothing matches, render DisclosurePickerEmpty in place of the list."
			>
				<Example>
					<LongList />
				</Example>
			</Section>

			<Section
				title="Options with media"
				description="A ThemePreview tile in each option's `media`, and the current theme's in the trigger's. Not ThemeSelector's radio list: there each arrow key switches the theme, which is right when switching is free. Where a pick has a cost — a confirm, a reset, a load, as in the Customize panel's preset row — use this list: arrows only move, Enter commits."
			>
				<Example>
					<ThemeRow />
				</Example>
			</Section>

			<Section
				title="Property-grid rung"
				description="size xs in a compact Density: a --control-xs row on the inset panel-field fill, the shape ScrubField and an xs SelectTrigger share. The parent keeps one list open at a time."
			>
				<Example>
					<PropertyGrid />
				</Example>
			</Section>

			<MetaFooter meta={disclosurePickerMeta} />
		</>
	)
}
