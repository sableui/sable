import { Button, buttonMeta, Icon, Menu, MenuContent, MenuItem, MenuTrigger, useCopy } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

function CopyDemo() {
	const address = "0xA1b2c3d4e5f6"
	const { copy, copied } = useCopy(address)
	return (
		<div className="flex items-center gap-2">
			<code className="text-mono-sm text-muted-foreground">{address}</code>
			<Button variant="ghost" size="icon-sm" aria-label="Copy address" onClick={copy}>
				<Icon name={copied ? "check" : "copy"} />
			</Button>
		</div>
	)
}

export function ButtonPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Button" lede={ledeFor(buttonMeta)} />

			<ComponentPlayground meta={buttonMeta} />

			<Section
				title="Variants"
				description="One primary per area. Everything else steps down."
			>
				<Example
					code={`<Button>Collect</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Learn more</Button>`}
				>
					<Button>Collect</Button>
					<Button variant="secondary">Cancel</Button>
					<Button variant="ghost">Skip</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="destructive">Delete</Button>
					<Button variant="link">Learn more</Button>
				</Example>
			</Section>

			<Section
				title="On a coloured fill"
				description="On a tone band or brand panel, the on-color tiers paint with the band's own ink, so they read on any fill. Name the fill once and the solid button's label matches it."
			>
				<Example
					flush
					code={`<div className="flex flex-wrap items-center gap-3 bg-tone-info p-6 text-tone-info-foreground [--on-color-fill:var(--tone-info)]">
  <Button variant="on-color">Join the beta</Button>
  <Button variant="on-color-outline">Read the notes</Button>
  <Button variant="on-color-ghost">Not now</Button>
</div>
<div className="flex flex-wrap items-center gap-3 bg-foreground p-6 text-background">
  <Button variant="on-color">Start free trial</Button>
  <Button variant="on-color-outline">Book a demo</Button>
</div>`}
				>
					<div className="flex flex-wrap items-center gap-3 bg-tone-info p-6 text-tone-info-foreground [--on-color-fill:var(--tone-info)]">
						<Button variant="on-color">Join the beta</Button>
						<Button variant="on-color-outline">Read the notes</Button>
						<Button variant="on-color-ghost">Not now</Button>
					</div>
					<div className="flex flex-wrap items-center gap-3 bg-foreground p-6 text-background">
						<Button variant="on-color">Start free trial</Button>
						<Button variant="on-color-outline">Book a demo</Button>
					</div>
				</Example>
			</Section>

			<Section title="Sizes">
				<Example
					code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="cta">CTA</Button>`}
				>
					<Button size="sm">Small</Button>
					<Button size="md">Medium</Button>
					<Button size="cta">CTA</Button>
				</Example>
			</Section>

			<Section
				title="With icons"
				description="A start icon says what the action is. An end icon says where it goes."
			>
				<Example
					code={`<Button iconStart={<Icon name="plus" />}>New project</Button>
<Button variant="secondary" iconEnd={<Icon name="chevron-right" />}>Continue</Button>
<Button variant="outline" iconStart={<Icon name="file" />} iconEnd={<Icon name="chevron-down" />}>Export</Button>`}
				>
					<Button iconStart={<Icon name="plus" />}>New project</Button>
					<Button variant="secondary" iconEnd={<Icon name="chevron-right" />}>
						Continue
					</Button>
					<Button variant="outline" iconStart={<Icon name="file" />} iconEnd={<Icon name="chevron-down" />}>
						Export
					</Button>
				</Example>
			</Section>

			<Section title="Icon only">
				<Example
					code={`<Button size="icon" aria-label="Add"><Icon name="plus" /></Button>
<Button size="icon" variant="secondary" aria-label="Share"><Icon name="share" /></Button>
<Button size="icon-sm" variant="ghost" aria-label="More"><Icon name="ellipsis" /></Button>`}
				>
					<Button size="icon" aria-label="Add">
						<Icon name="plus" />
					</Button>
					<Button size="icon" variant="secondary" aria-label="Share">
						<Icon name="share" />
					</Button>
					<Button size="icon-sm" variant="ghost" aria-label="More">
						<Icon name="ellipsis" />
					</Button>
				</Example>
			</Section>

			<Section
				title="Main action with options"
				description="The main action as its own button, and a separate icon button beside it for the variations. Two honest buttons, each with one job."
			>
				<Example
					code={`<Button>Deploy</Button>
<Menu>
  <MenuTrigger render={<Button variant="secondary" size="icon" aria-label="Deploy options"><Icon name="chevron-down" /></Button>} />
  <MenuContent align="end">
    <MenuItem>Deploy to preview</MenuItem>
    <MenuItem>Deploy to production</MenuItem>
  </MenuContent>
</Menu>`}
				>
					<div className="flex items-center gap-2">
						<Button>Deploy</Button>
						<Menu>
							<MenuTrigger render={<Button variant="secondary" size="icon" aria-label="Deploy options"><Icon name="chevron-down" /></Button>} />
							<MenuContent align="end">
								<MenuItem>Deploy to preview</MenuItem>
								<MenuItem>Deploy to production</MenuItem>
							</MenuContent>
						</Menu>
					</div>
				</Example>
			</Section>

			<Section
				title="Copy"
				description="Copying is behavior, not a kind of button: the ordinary icon button with useCopy, which flips the icon to a check for a moment."
			>
				<Example
					code={`const { copy, copied } = useCopy(address)

<Button variant="ghost" size="icon-sm" aria-label="Copy address" onClick={copy}>
  <Icon name={copied ? "check" : "copy"} />
</Button>`}
				>
					<CopyDemo />
				</Example>
			</Section>

			<Section
				title="Loading"
				description="Shows a spinner and blocks a second click."
			>
				<Example
					code={`<Button loading loadingLabel="Saving">Save changes</Button>
<Button variant="secondary" loading loadingLabel="Exporting">Export</Button>`}
				>
					<Button loading loadingLabel="Saving">Save changes</Button>
					<Button variant="secondary" loading loadingLabel="Exporting">
						Export
					</Button>
				</Example>
			</Section>

			<MetaFooter meta={buttonMeta} />
		</>
	)
}
