import {
	Button,
	buttonMeta,
	Icon,
	Menu,
	MenuContent,
	MenuItem,
	MenuTrigger,
	PanelSection,
	PropertyRow,
	Row,
	ScrubField,
	Stack,
	type ButtonBleed,
	useCopy,
} from "@sableui/react"
import { useState } from "react"
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
				<span aria-hidden="true" className="motion-icon-swap">
					<span data-active={!copied} className="inline-flex">
						<Icon name="copy" />
					</span>
					<span data-active={copied} className="inline-flex">
						<Icon name="check" />
					</span>
				</span>
			</Button>
			<span role="status" className="sr-only">
				{copied ? "Copied" : ""}
			</span>
		</div>
	)
}

/** Toggle loading on and off, so the hand-over can be watched both ways. */
function LoadingToggleDemo() {
	const [loading, setLoading] = useState(true)
	return (
		<Stack gap={3} className="items-start">
			<Row gap={2} className="flex-wrap">
				<Button loading={loading}>Save changes</Button>
				<Button variant="secondary" loading={loading} iconStart={<Icon name="download" />}>
					Export
				</Button>
				<Button variant="outline" loading={loading} loadingLabel="Publishing">
					Publish
				</Button>
			</Row>
			<Button variant="ghost" size="sm" onClick={() => setLoading((l) => !l)}>
				{loading ? "Stop loading" : "Start loading"}
			</Button>
		</Stack>
	)
}

function FieldButtonDemo() {
	const [size, setSize] = useState(14)
	return (
		<div data-density="compact" className="sable-frame sable-frame-tool overflow-hidden w-64 bg-panel">
			<PanelSection title="Text" className="border-t-0">
				<PropertyRow label="Font">
					<Button variant="field" size="xs" className="w-28 justify-between" iconEnd={<Icon name="chevron-down" />}>
						Figtree
					</Button>
				</PropertyRow>
				<PropertyRow label="Size">
					<ScrubField label="Size" value={size} onValueChange={setSize} min={1} suffix="px" className="w-28" />
				</PropertyRow>
			</PanelSection>
		</div>
	)
}

/*
 * The dashed rules are the content edges. Without bleed the labels sit one
 * padding inside them; with it the labels sit on them and the hover fill runs
 * past.
 */
function BleedDemo({ bleed }: { bleed: boolean }) {
	const end: ButtonBleed = bleed ? "end" : "none"
	const start: ButtonBleed = bleed ? "start" : "none"
	return (
		<Stack gap={1.5} className="w-full max-w-72 border-x border-dashed border-border-strong">
			<Row justify="between">
				<span className="text-title-md">Tasks</span>
				<Button variant="ghost" size="sm" bleed={end}>
					View all
				</Button>
			</Row>
			<span className="text-body-sm text-muted-foreground">Ship the release notes</span>
			<span className="text-body-sm text-muted-foreground">Review the icon set</span>
			<Button variant="ghost" size="sm" bleed={start} iconStart={<Icon name="plus" />} className="self-start">
				Add task
			</Button>
		</Stack>
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
					code={`<Button>Publish</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Learn more</Button>`}
				>
					<Button>Publish</Button>
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

			<Section
				title="In a panel"
				description="Among compact fields in a tool panel, a field button wears the field's inset fill and corner, so a picker or an add action reads as one of the row's controls."
			>
				<Example
					code={`<div data-density="compact" className="sable-frame sable-frame-tool overflow-hidden w-64 bg-panel">
  <PanelSection title="Text" className="border-t-0">
    <PropertyRow label="Font">
      <Button variant="field" size="xs" className="w-28 justify-between" iconEnd={<Icon name="chevron-down" />}>Figtree</Button>
    </PropertyRow>
    <PropertyRow label="Size">
      <ScrubField label="Size" value={size} onValueChange={setSize} min={1} suffix="px" className="w-28" />
    </PropertyRow>
  </PanelSection>
</div>`}
				>
					<FieldButtonDemo />
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
				title="Optical alignment"
				description="A ghost or link button carries padding you can't see, so at the end or start of a row its label sits inset from the edge everything else lines up on. bleed pulls the box out by exactly its own padding: the label lands on the edge and the hover fill runs past it. Filled and outlined buttons ignore it — their edge is what aligns. SectionHeader, PageHeader and CardAction do this for their outermost ghost action on their own."
			>
				<Example
					code={`<Stack gap={1.5}>
  <Row justify="between">
    <span className="text-title-md">Tasks</span>
    <Button variant="ghost" size="sm" bleed="end">View all</Button>
  </Row>
  <span className="text-body-sm text-muted-foreground">Ship the release notes</span>
  <span className="text-body-sm text-muted-foreground">Review the icon set</span>
  <Button variant="ghost" size="sm" bleed="start" iconStart={<Icon name="plus" />} className="self-start">
    Add task
  </Button>
</Stack>`}
				>
					<BleedDemo bleed={false} />
					<BleedDemo bleed />
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
				description="Copying is behavior, not a kind of button: the ordinary icon button with useCopy. Both glyphs stay mounted in a motion-icon-swap cell, so the copy mark visibly turns into a check, and a polite status line says Copied to a screen reader."
			>
				<Example
					code={`const { copy, copied } = useCopy(address)

<Button variant="ghost" size="icon-sm" aria-label="Copy address" onClick={copy}>
  <span aria-hidden="true" className="motion-icon-swap">
    <span data-active={!copied} className="inline-flex"><Icon name="copy" /></span>
    <span data-active={copied} className="inline-flex"><Icon name="check" /></span>
  </span>
</Button>
<span role="status" className="sr-only">{copied ? "Copied" : ""}</span>`}
				>
					<CopyDemo />
				</Example>
			</Section>

			<Section
				title="Loading"
				description="Shows a spinner and blocks a second click. With no icon and no loadingLabel the spinner lays over the label, which fades out in place, so the button keeps its width; with an icon it takes the icon's slot. A loadingLabel changes the text, and the width with it."
			>
				<Example
					code={`<Button loading>Save changes</Button>
<Button variant="secondary" loading iconStart={<Icon name="download" />}>Export</Button>
<Button variant="outline" loading loadingLabel="Publishing">Publish</Button>`}
				>
					<LoadingToggleDemo />
				</Example>
			</Section>

			<Section
				title="An async action"
				description="Return a promise from onClick and the button shows loading until it settles, ignoring presses meanwhile, from the first click on. It keeps focus throughout, so a sheet the action opens can return focus to it."
			>
				<Example
					code={`<Button onClick={() => addToCart(product)}>Add to cart</Button>`}
				>
					<Button onClick={() => new Promise((resolve) => setTimeout(resolve, 1200))}>Add to cart</Button>
				</Example>
			</Section>

			<MetaFooter meta={buttonMeta} />
		</>
	)
}
