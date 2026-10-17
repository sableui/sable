import {
	Button,
	Icon,
	SimpleTooltip,
	Toolbar,
	ToolbarButton,
	ToolbarSeparator,
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipGroup,
	tooltipMeta,
	TooltipProvider,
	TooltipTrigger,
} from "@sableui/react"

import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const FORMATTING = [
	{ icon: "bold", label: "Bold" },
	{ icon: "italic", label: "Italic" },
	{ icon: "link", label: "Insert link" },
	{ icon: "list", label: "Bulleted list" },
] as const

export function TooltipPage() {
	return (
		<TooltipProvider>
			<PageHeader
				eyebrow="Components"
				title="Tooltip"
				lede={ledeFor(tooltipMeta)}
			/>

			<ComponentPlayground meta={tooltipMeta} />

			<Section
				title="Basic"
				description="A short hint on hover or focus, often naming an icon button."
			>
				<Example>
					<Tooltip>
						<TooltipTrigger
							render={
								<Button variant="ghost" size="icon-sm" aria-label="Info">
									<Icon name="info" className="text-base" />
								</Button>
							}
						/>
						<TooltipContent>Saved to your workspace.</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger render={<Button variant="secondary">Hover me</Button>} />
						<TooltipContent>A short, supplementary label.</TooltipContent>
					</Tooltip>
				</Example>
			</Section>

			<Section
				title="Sides"
				description="It flips to the other side when there isn't room."
			>
				<Example
					code={`<TooltipContent side="top">Opens above</TooltipContent>
<TooltipContent side="right">Opens to the right</TooltipContent>
<TooltipContent side="bottom">Opens below</TooltipContent>
<TooltipContent side="left">Opens to the left</TooltipContent>`}
				>
					<Tooltip>
						<TooltipTrigger render={<Button variant="secondary">Top</Button>} />
						<TooltipContent side="top">Opens above</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger render={<Button variant="secondary">Right</Button>} />
						<TooltipContent side="right">Opens to the right</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger render={<Button variant="secondary">Bottom</Button>} />
						<TooltipContent side="bottom">Opens below</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger render={<Button variant="secondary">Left</Button>} />
						<TooltipContent side="left">Opens to the left</TooltipContent>
					</Tooltip>
				</Example>
			</Section>

			<Section
				title="With an arrow"
				description="A small pointer toward the element it describes."
			>
				<Example>
					<Tooltip>
						<TooltipTrigger render={<Button>Publish</Button>} />
						<TooltipContent>
							Shares this report with your team.
							<TooltipArrow />
						</TooltipContent>
					</Tooltip>
				</Example>
			</Section>

			<Section
				title="Shared across a toolbar"
				description="Wrap a row of SimpleTooltips in TooltipGroup and they share one tooltip. Move along the row: it glides to the next button and swaps its label, instead of closing and opening again."
			>
				<Example
					code={`<TooltipGroup>
  <Toolbar aria-label="Formatting">
    <SimpleTooltip content="Bold">
      <ToolbarButton size="icon-sm" aria-label="Bold"><Icon name="bold" /></ToolbarButton>
    </SimpleTooltip>
    <SimpleTooltip content="Italic">
      <ToolbarButton size="icon-sm" aria-label="Italic"><Icon name="italic" /></ToolbarButton>
    </SimpleTooltip>
    <ToolbarSeparator />
    <SimpleTooltip content="Comment">
      <ToolbarButton size="icon-sm" aria-label="Comment"><Icon name="comment" /></ToolbarButton>
    </SimpleTooltip>
  </Toolbar>
</TooltipGroup>`}
				>
					<TooltipGroup>
						<Toolbar aria-label="Formatting">
							{FORMATTING.map((item) => (
								<SimpleTooltip key={item.icon} content={item.label}>
									<ToolbarButton size="icon-sm" aria-label={item.label}>
										<Icon name={item.icon} />
									</ToolbarButton>
								</SimpleTooltip>
							))}
							<ToolbarSeparator />
							<SimpleTooltip content="Comment">
								<ToolbarButton size="icon-sm" aria-label="Comment">
									<Icon name="comment" />
								</ToolbarButton>
							</SimpleTooltip>
						</Toolbar>
					</TooltipGroup>
				</Example>
			</Section>

			<MetaFooter meta={tooltipMeta} />
		</TooltipProvider>
	)
}
