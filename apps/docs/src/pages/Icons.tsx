import { CodeBlock, Grid, Icon } from "@sableui/react"
import { reiconIconNames } from "@sableui/react/icons/reicon"
import { reiconSolidIconNames, reiconSolidIconSet } from "@sableui/react/icons/reicon-solid"
import { brandIconNames, brandIconSet } from "@sableui/react/icons/brands"
import { PageHeader, Section } from "../components/docs-ui"

const names = reiconIconNames

export function IconsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Icons"
				lede="Icons come from the set your app mounts once through IconProvider. Reicon ships with Sable as an opt-in set; replace or extend it and every component follows."
			/>

			<Section
				title="The set"
				description="Each icon is named for what it means, not what it looks like."
			>
				<Grid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={1.5}>
					{names.map((name) => (
						<div
							key={name}
							className="flex flex-col items-center gap-3 rounded-lg border border-border p-5 text-center"
						>
							<Icon name={name} className="text-2xl" title={name} />
							<code className="text-mono-sm text-muted-foreground">{name}</code>
						</div>
					))}
				</Grid>
			</Section>

			<Section
				title="Solid weight"
				description="reiconIconSet draws the outline weight, and solid only for the glyphs Sable's own components fill: a pressed like, the media controls, the overflow dots. For the solid weight of every other icon, put reiconSolidIconSet in front of it."
			>
				<CodeBlock code={`import { composeIconSets, IconProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import { reiconSolidIconSet } from "@sableui/react/icons/reicon-solid"

<IconProvider set={composeIconSets(reiconSolidIconSet, reiconIconSet)}>
  <App />
</IconProvider>

<Icon name="bell" variant="solid" />`} />
				<Grid cols={{ base: 3, sm: 4, md: 6, lg: 8 }} gap={1.5} className="mt-4">
					{reiconSolidIconNames.map((name) => (
						<div
							key={name}
							className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center"
						>
							{/* Drawn through the solid set directly, so this catalog does
							    not depend on the docs app composing it into its provider. */}
							<span className="text-2xl text-foreground">
								{reiconSolidIconSet({ name, variant: "solid", title: name })}
							</span>
							<code className="text-mono-sm text-muted-foreground">{name}</code>
						</div>
					))}
				</Grid>
			</Section>

			<Section
				title="Brand marks"
				description="Logos for social links, sign-in providers and integrations. They take the text color, not their brand color."
			>
				<Grid cols={{ base: 3, sm: 4, md: 6, lg: 7 }} gap={1.5}>
					{brandIconNames.map((name) => (
						<div
							key={name}
							className="flex flex-col items-center gap-3 rounded-lg border border-border p-4 text-center"
						>
							{/* Rendered through the brand set directly rather than <Icon>, so
							    this catalog does not depend on the docs app mounting it. */}
							<span className="text-2xl text-foreground">
								{brandIconSet({ name, variant: "brands", title: name })}
							</span>
							<code className="text-mono-sm text-muted-foreground">{name}</code>
						</div>
					))}
				</Grid>
				<p className="mt-4 text-body-sm text-muted-foreground">LinkedIn, Slack, Microsoft, and OpenAI marks are excluded pending artwork permission. The remaining marks retain Reicon's MIT notice; follow each brand's usage guidelines.</p>
			</Section>

			<Section title="Use another icon package" description="Map Sable's semantic names to your chosen package in an IconSet, then wrap your app once. Return null for unknown names and preserve the size, color, animation, and accessible label props.">
				<CodeBlock code={'import { IconProvider, type IconSet } from "@sableui/react"\nimport { myIconSet } from "./icons"\n\n<IconProvider set={myIconSet}>\n  <App />\n</IconProvider>'} />
				<p className="mt-4 text-body-md text-muted-foreground">Map every name in registry.json's iconContract for a complete replacement. To add domain icons while keeping Reicon, use composeIconSets(myIconSet, reiconIconSet).</p>
			</Section>

			<Section title="Sizing" description="Icons scale with the text around them.">
				<div className="flex flex-wrap items-end gap-6 rounded-lg border border-border p-6">
					{["text-base", "text-lg", "text-2xl", "text-4xl"].map((size) => (
						<div key={size} className="flex flex-col items-center gap-2">
							<Icon name="gem" className={size} />
							<code className="text-mono-sm text-muted-foreground">{size}</code>
						</div>
					))}
				</div>
			</Section>
		</>
	)
}
