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
							render={<Button variant="secondary">Plan details</Button>}
						/>
						<PopoverContent>
							<PopoverTitle>Plan details</PopoverTitle>
							<PopoverDescription>
								Up to 10 seats, billed monthly per seat.
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
								Upgrading starts a new billing period today.
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
						<PopoverTrigger render={<Button>Upgrade</Button>} />
						<PopoverContent>
							<PopoverTitle>Upgrade to Studio</PopoverTitle>
							<PopoverDescription>
								Adds unlimited projects for your team.
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
