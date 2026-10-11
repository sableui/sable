import {
	ColorField,
	PanelSection,
	PropertyRow,
	StatusBar,
	StatusBarSeparator,
	colorFieldMeta,
} from "@sableui/react"
import { useState } from "react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

/*
 * The one page where literal colour is the subject, not a token violation.
 *
 * ColorField is a colour PICKER: its value is user data chosen at runtime, and
 * a demo of it has to hold real colours the way a date-picker demo holds real
 * dates. Expressing these as semantic tokens would document the opposite of
 * what the component does — a picker that can only pick theme colours.
 */
// design-lint-disable inline-color -- ColorField's own value is user-chosen colour, not themed surface; a picker demo must hold literal colours
const PALETTE = ["#f43f5e", "#facc15", "#22c55e", "#3b82f6", "#a855f7", "#0f172a"]

function ColorFieldDemo() {
	const [background, setBackground] = useState("transparent")
	const [tint, setTint] = useState("#3b82f680")
	const [stroke, setStroke] = useState("#f43f5e")

	return (
		<div
			data-density="compact"
			className="sable-frame sable-frame-tool overflow-hidden w-65 bg-panel"
		>
			<PanelSection title="Canvas">
				<PropertyRow label="Background">
					<ColorField
						value={background}
						onValueChange={setBackground}
						allowTransparent
						label="Background"
					/>
				</PropertyRow>
			</PanelSection>
			<PanelSection title="Appearance">
				<PropertyRow label="Tint">
					<ColorField value={tint} onValueChange={setTint} allowAlpha label="Tint" />
				</PropertyRow>
				<PropertyRow label="Stroke">
					<ColorField
						value={stroke}
						onValueChange={setStroke}
						swatches={PALETTE}
						label="Stroke"
					/>
				</PropertyRow>
			</PanelSection>
			<StatusBar>
				<span>{background}</span>
				<StatusBarSeparator />
				<span>{tint}</span>
				<StatusBarSeparator />
				<span>{stroke}</span>
			</StatusBar>
		</div>
	)
}

export function ColorFieldPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Color Field" lede={ledeFor(colorFieldMeta)} />

			<Section
				title="Live preview"
				description="Transparent, with alpha, and with a palette. The row underneath shows the chosen values."
			>
				<ColorFieldDemo />
			</Section>

			<MetaFooter meta={colorFieldMeta} />
		</>
	)
}
