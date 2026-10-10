import {
	type ThemeId,
	ThemeSelector,
	themeSelectorMeta,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"
import { useTheme } from "../../theme"

export function ThemeSelectorPage() {
	const { themeId, setThemeId, themes, mode } = useTheme()
	const [localThemeId, setLocalThemeId] = useState<ThemeId>("meridian")

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Theme Selector"
				lede={ledeFor(themeSelectorMeta)}
			/>

			<Section
				title="Cards"
				description="The full theme choice for a settings or onboarding page."
			>
				<Example>
					<div className="w-full max-w-3xl">
						<ThemeSelector
							value={themeId}
							onValueChange={setThemeId}
							themes={themes}
							mode={mode}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="Narrow container"
				description="The cards stack on their own in a narrow column."
			>
				<Example>
					<div className="w-full max-w-xs">
						<ThemeSelector value={localThemeId} onValueChange={setLocalThemeId} />
					</div>
				</Example>
			</Section>

			<Section
				title="List"
				description="Compact rows for a popover or a docked panel, swatches kept."
			>
				<Example>
					<div
						data-density="compact"
						className="sable-frame sable-surface sable-surface-popover sable-frame-popover w-64"
					>
						<ThemeSelector
							layout="list"
							value={localThemeId}
							onValueChange={setLocalThemeId}
							mode={mode}
						/>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={themeSelectorMeta} />
		</>
	)
}
