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

			<Section
				title="Subtle motion"
				description="The pill glides between modes by default. motion=&quot;subtle&quot; lands it in place, for a header that already has a lot moving."
			>
				<Example>
					<ThemeSwitcher value={theme} onValueChange={setTheme} motion="subtle" />
				</Example>
			</Section>

			<MetaFooter meta={themeSwitcherMeta} />
		</>
	)
}
