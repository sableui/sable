import { Button, Stepper, StepperItem, stepperMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const STEPS = ["Cart", "Shipping", "Payment", "Review"]

/** The stepper reports; the flow's own buttons move it. */
function FlowDemo() {
	const [current, setCurrent] = useState(1)
	return (
		<div className="flex w-full max-w-2xl flex-col gap-6">
			<Stepper current={current} aria-label="Checkout progress">
				{STEPS.map((title, i) => (
					<StepperItem
						key={title}
						title={title}
						onSelect={i < current ? () => setCurrent(i) : undefined}
					/>
				))}
			</Stepper>
			<div className="flex gap-2">
				<Button
					variant="outline"
					disabled={current === 0}
					onClick={() => setCurrent((c) => c - 1)}
				>
					Back
				</Button>
				<Button
					disabled={current === STEPS.length}
					onClick={() => setCurrent((c) => c + 1)}
				>
					{current >= STEPS.length - 1 ? "Place order" : "Continue"}
				</Button>
			</div>
		</div>
	)
}

export function StepperPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Stepper"
				lede={ledeFor(stepperMeta)}
			/>

			<Section
				title="Horizontal"
				description="Earlier steps show as done. Click a finished step to go back to it."
			>
				<Example>
					<FlowDemo />
				</Example>
			</Section>

			<Section
				title="Vertical with descriptions"
				description="For longer flows and narrow columns, with room for a second line."
			>
				<Example
					code={`<Stepper orientation="vertical" current={2} aria-label="Workspace setup">
	<StepperItem title="Create account" description="Email verified" />
	<StepperItem title="Invite team" description="3 people invited" />
	<StepperItem title="Connect data" description="Choose a source to import from" />
	<StepperItem title="Launch" />
</Stepper>`}
				>
					<div className="w-full max-w-sm">
						<Stepper orientation="vertical" current={2} aria-label="Workspace setup">
							<StepperItem title="Create account" description="Email verified" />
							<StepperItem title="Invite team" description="3 people invited" />
							<StepperItem
								title="Connect data"
								description="Choose a source to import from"
							/>
							<StepperItem title="Launch" />
						</Stepper>
					</div>
				</Example>
			</Section>

			<Section
				title="Timeline"
				description="Dots instead of numbers, for a sequence of events like a delivery. Each dot sits on its title's first line."
			>
				<Example
					code={`<Stepper orientation="vertical" indicator="dot" current={2} aria-label="Delivery status">
	<StepperItem title="Order placed" description="Oct 9, 10:14 AM" />
	<StepperItem title="Printed and packed" description="Oct 10, 4:02 PM" />
	<StepperItem title="Out for delivery" description="Arriving today by 6 PM" />
	<StepperItem title="Delivered" />
</Stepper>`}
				>
					<div className="w-full max-w-sm">
						<Stepper
							orientation="vertical"
							indicator="dot"
							current={2}
							aria-label="Delivery status"
						>
							<StepperItem title="Order placed" description="Oct 9, 10:14 AM" />
							<StepperItem title="Printed and packed" description="Oct 10, 4:02 PM" />
							<StepperItem title="Out for delivery" description="Arriving today by 6 PM" />
							<StepperItem title="Delivered" />
						</Stepper>
					</div>
				</Example>
			</Section>

			<Section
				title="Error"
				description="A finished step that now needs fixing."
			>
				<Example>
					<div className="w-full max-w-2xl">
						<Stepper current={2} aria-label="Checkout progress">
							<StepperItem title="Cart" />
							<StepperItem
								title="Shipping"
								status="error"
								description="Address needs a postcode"
							/>
							<StepperItem title="Payment" />
							<StepperItem title="Review" />
						</Stepper>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={stepperMeta} />
		</>
	)
}
