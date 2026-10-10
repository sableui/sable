import { type ThemeMode, ThemeSwitcher, themeSwitcherMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ThemeSwitcherPage() {
	const [theme, setTheme] = useState<ThemeMode>("system")

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Theme Switcher"
				lede={ledeFor(themeSwitcherMeta)}
			/>

			<Section
				title="Default"
				description="Light, dark, or follow the system."
			>
				<Example>
					<div className="flex flex-col items-center gap-3">
						<ThemeSwitcher value={theme} onValueChange={setTheme} />
						<span className="text-label-md text-muted-foreground">
							Selected: {theme}
						</span>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={themeSwitcherMeta} />
		</>
	)
}
