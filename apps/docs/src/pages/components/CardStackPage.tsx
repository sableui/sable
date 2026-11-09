import { Button, Card, CardAction, CardDescription, CardHeader, CardStack, CardTitle, cardStackMeta } from "@sableui/react"
import { ProjectCollectionBlock } from "@sableui/react/blocks"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

const DOCUMENTS = [
	{ title: "Project brief", detail: "Updated 2 days ago" },
	{ title: "Review notes", detail: "Updated last week" },
	{ title: "Launch plan", detail: "Updated in March" },
]

function Documents({ motion }: { motion?: "off" }) {
	return (
		<CardStack label="Documents" expandLabel="Show 3 documents" collapseLabel="Collapse documents" motion={motion} className="w-full max-w-xs">
			{DOCUMENTS.map((doc) => (
				<Card key={doc.title} className="h-full">
					<CardHeader>
						<CardTitle>{doc.title}</CardTitle>
						<CardDescription>{doc.detail}</CardDescription>
						<CardAction>
							<Button variant="ghost" size="sm">
								Open
							</Button>
						</CardAction>
					</CardHeader>
				</Card>
			))}
		</CardStack>
	)
}

export function CardStackPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Card Stack" lede={ledeFor(cardStackMeta)} />

			<Section title="The front card opens it" description='trigger="stack" for cards with nothing to press: the front card is the button. On a mouse, hovering fans the cards behind it.'>
				<Example code="<ProjectCollectionBlock />">
					<ProjectCollectionBlock />
				</Example>
			</Section>

			<Section title="Cards with controls" description="The default trigger is a separate button, so a card's own controls stay reachable. Covered cards are inert until the stack opens.">
				<Example code={'<CardStack label="Documents" expandLabel="Show 3 documents">\n  <Card>…</Card>\n</CardStack>'}>
					<Documents />
				</Example>
			</Section>

			<Section title="Without animation" description='motion="off" opens and closes in place. Reduced motion does the same everywhere.'>
				<Example code={'<CardStack label="Documents" motion="off">…</CardStack>'}>
					<Documents motion="off" />
				</Example>
			</Section>

			<MetaFooter meta={cardStackMeta} />
		</>
	)
}
