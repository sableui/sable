import {
	Button,
	Popover,
	PopoverArrow,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	popoverMeta,
	PopoverTitle,
	PopoverTrigger,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function PopoverPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Popover"
				lede={ledeFor(popoverMeta)}
			/>

			<Section
				title="Basic"
				description="Opens on click. Clicking outside or pressing Esc closes it."
			>
				<Example>
					<Popover>
						<PopoverTrigger
							render={<Button variant="secondary">Edition details</Button>}
						/>
						<PopoverContent>
							<PopoverTitle>Edition details</PopoverTitle>
							<PopoverDescription>
								A limited run of 100, stored permanently on Arweave.
							</PopoverDescription>
						</PopoverContent>
					</Popover>
				</Example>
			</Section>

			<Section
				title="With a close action"
				description="A button inside the popover can close it too."
			>
				<Example>
					<Popover>
						<PopoverTrigger render={<Button variant="secondary">Open</Button>} />
						<PopoverContent>
							<PopoverTitle>Heads up</PopoverTitle>
							<PopoverDescription>
								Collecting mints a compressed NFT to your wallet.
							</PopoverDescription>
							<div className="mt-4 flex justify-end">
								<PopoverClose render={<Button size="sm">Got it</Button>} />
							</div>
						</PopoverContent>
					</Popover>
				</Example>
			</Section>

			<Section
				title="Sides"
				description="Opens on any side, and flips if there isn't room."
			>
				<Example
					code={`<Popover>
	<PopoverTrigger render={<Button variant="secondary">Top</Button>} />
	<PopoverContent side="top">
		<PopoverDescription>Opens above the trigger.</PopoverDescription>
	</PopoverContent>
</Popover>
<Popover>
	<PopoverTrigger render={<Button variant="secondary">Right</Button>} />
	<PopoverContent side="right">
		<PopoverDescription>Opens to the right.</PopoverDescription>
	</PopoverContent>
</Popover>
<Popover>
	<PopoverTrigger render={<Button variant="secondary">Bottom</Button>} />
	<PopoverContent side="bottom">
		<PopoverDescription>Opens below the trigger.</PopoverDescription>
	</PopoverContent>
</Popover>
<Popover>
	<PopoverTrigger render={<Button variant="secondary">Left</Button>} />
	<PopoverContent side="left">
		<PopoverDescription>Opens to the left.</PopoverDescription>
	</PopoverContent>
</Popover>`}
				>
					<Popover>
						<PopoverTrigger render={<Button variant="secondary">Top</Button>} />
						<PopoverContent side="top">
							<PopoverDescription>Opens above the trigger.</PopoverDescription>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger render={<Button variant="secondary">Right</Button>} />
						<PopoverContent side="right">
							<PopoverDescription>Opens to the right.</PopoverDescription>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger
							render={<Button variant="secondary">Bottom</Button>}
						/>
						<PopoverContent side="bottom">
							<PopoverDescription>Opens below the trigger.</PopoverDescription>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger render={<Button variant="secondary">Left</Button>} />
						<PopoverContent side="left">
							<PopoverDescription>Opens to the left.</PopoverDescription>
						</PopoverContent>
					</Popover>
				</Example>
			</Section>

			<Section
				title="With an arrow"
				description="A small pointer ties the popover to its trigger."
			>
				<Example>
					<Popover>
						<PopoverTrigger render={<Button>Collect</Button>} />
						<PopoverContent>
							<PopoverTitle>Collect this edition</PopoverTitle>
							<PopoverDescription>
								Mints a compressed NFT to your wallet.
							</PopoverDescription>
							<PopoverArrow />
						</PopoverContent>
					</Popover>
				</Example>
			</Section>

			<MetaFooter meta={popoverMeta} />
		</>
	)
}
