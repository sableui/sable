import {
	Button,
	Icon,
	Tooltip,
	TooltipArrow,
	TooltipContent,
	tooltipMeta,
	TooltipProvider,
	TooltipTrigger,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function TooltipPage() {
	return (
		<TooltipProvider>
			<PageHeader
				eyebrow="Components"
				title="Tooltip"
				lede={ledeFor(tooltipMeta)}
			/>

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
						<TooltipContent>Stored permanently on Arweave.</TooltipContent>
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
						<TooltipTrigger render={<Button>Collect</Button>} />
						<TooltipContent>
							Mints a compressed NFT to your wallet.
							<TooltipArrow />
						</TooltipContent>
					</Tooltip>
				</Example>
			</Section>

			<MetaFooter meta={tooltipMeta} />
		</TooltipProvider>
	)
}
