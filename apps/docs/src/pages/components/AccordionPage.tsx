import {
	Accordion,
	accordionMeta,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function AccordionPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Accordion"
				lede={ledeFor(accordionMeta)}
			/>

			<Section
				title="Basic"
				description="Opening one item closes the others."
			>
				<Example className="block">
					<Accordion defaultValue={["what"]} className="w-full max-w-(--measure-prose)">
						<AccordionItem value="what">
							<AccordionTrigger>What is Sable?</AccordionTrigger>
							<AccordionPanel>
								A themeable product UI system for building app shells, forms,
								data views, and polished marketing routes from the same token
								contract.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="permanent">
							<AccordionTrigger>Can the interface be re-themed?</AccordionTrigger>
							<AccordionPanel>
								Yes. Components read semantic tokens, so a new theme can swap the
								values without changing component code.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="cost">
							<AccordionTrigger>How do consuming apps start?</AccordionTrigger>
							<AccordionPanel>
								Install the package, import the CSS after Tailwind, load the
								fonts, and mount optional providers for icons, motion, and theme
								switching.
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</Example>
			</Section>

			<Section
				title="Multiple open"
				description="Several panels can stay open at once."
			>
				<Example className="block">
					<Accordion
						multiple
						defaultValue={["shipping", "returns"]}
						className="w-full max-w-(--measure-prose)"
					>
						<AccordionItem value="shipping">
							<AccordionTrigger>Workspace setup</AccordionTrigger>
							<AccordionPanel>
								Invite your team, choose a default theme, and connect the product
								areas that should appear in the sidebar.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="returns">
							<AccordionTrigger>Approvals</AccordionTrigger>
							<AccordionPanel>
								Reviews can require a second approver before publishing changes
								to shared customer-facing spaces.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="support">
							<AccordionTrigger>Support</AccordionTrigger>
							<AccordionPanel>
								Reach the team from the command menu or the support link in the
								account menu.
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</Example>
			</Section>

			<Section
				title="Disabled item"
				description="A disabled item dims and can't be opened."
			>
				<Example className="block">
					<Accordion className="w-full max-w-(--measure-prose)">
						<AccordionItem value="open">
							<AccordionTrigger>Available section</AccordionTrigger>
							<AccordionPanel>
								This one toggles normally.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="locked" disabled>
							<AccordionTrigger>Locked section</AccordionTrigger>
							<AccordionPanel>
								You should not be able to reach this.
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</Example>
			</Section>

			<Section
				title="Heading level"
				description="Each trigger sits in a heading, h3 unless you say otherwise. Set headingLevel so the questions fit the page outline: h2 for an FAQ directly under the page title, h4 under an h3 section."
			>
				<Example className="block">
					<Accordion className="w-full max-w-(--measure-prose)">
						<AccordionItem value="refund">
							<AccordionTrigger headingLevel={2}>Can I get a refund?</AccordionTrigger>
							<AccordionPanel>
								Within 30 days of purchase, from billing settings.
							</AccordionPanel>
						</AccordionItem>
						<AccordionItem value="seats">
							<AccordionTrigger headingLevel={2}>Can I change my seat count?</AccordionTrigger>
							<AccordionPanel>
								Any time. The next invoice is prorated.
							</AccordionPanel>
						</AccordionItem>
					</Accordion>
				</Example>
			</Section>

			<MetaFooter meta={accordionMeta} />
		</>
	)
}
