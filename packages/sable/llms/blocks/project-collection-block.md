# ProjectCollectionBlock

A compact collection of three project summaries that expands into a readable list, with optional pointer depth.

**Intent:** A browsable small collection of related work. Replace the sample projects after copying; use a grid or table for a large workspace.

**Block:** Media & files · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- CardStack owns overlap, hidden-card inertness and explicit expansion. Tilt gives the closed stack a little depth under a mouse; opened, the cards sit flat and still, a list to read. Static on touch and under subtle/off motion.
- Each project is a Card: a CardHeader with title, description and a count Badge in CardAction, and a footer of collaborators and when it last changed. Cards keep their keys and content while the collection opens; nothing auto-advances.

## Accessibility

- Press the front card to expand or collapse the collection. Base UI owns Enter/Space activation, and the same trigger retains focus in both states.
- All projects become readable in normal flow when expanded. Tilt adds no tab stops or essential content.

## Source

```tsx
import { useState } from "react"
import { Avatar, AvatarGroup, Badge, Card, CardAction, CardDescription, CardFooter, CardHeader, CardStack, CardTitle, cn, Tilt } from "@sableui/react"

const collection = { label: "Projects", expand: "Show 3 projects", collapse: "Collapse projects" }

const projects = [
	{ title: "Project research", count: "12 docs", description: "Interviews, notes, and the questions to answer next.", people: ["MO", "SR", "JL"], updated: "Updated today" },
	{ title: "Interface studies", count: "8 studies", description: "Layouts and interaction states for the next review.", people: ["SR", "JL"], updated: "Updated Tue" },
	{ title: "Final designs", count: "6 screens", description: "The selected direction, ready to discuss with the team.", people: ["MO", "JL"], updated: "Updated last week" },
]

export interface ProjectCollectionBlockProps {
	className?: string
	/** false drops each card's surface and border — for a muted section that already frames them. */
	framed?: boolean
}

export function ProjectCollectionBlock({ className, framed = true }: ProjectCollectionBlockProps) {
	const [open, setOpen] = useState(false)
	return (
		// The front card is the expand control, so the cards hold no controls of their own.
		<CardStack
			label={collection.label}
			trigger="stack"
			expanded={open}
			onExpandedChange={setOpen}
			expandLabel={collection.expand}
			collapseLabel={collection.collapse}
			className={cn("w-full max-w-xs", className)}
		>
			{projects.map((project) => (
				// Depth invites a press on the closed stack. Opened, the cards are a list
				// to read: no lean, and the front card eases flat as the stack opens.
				<Tilt key={project.title} maxAngle={open ? 0 : 3} className="h-full">
					{/* Full height, so cards behind a taller front card still show their edge. */}
					<Card variant={framed ? "default" : "flat"} className="h-full">
						<CardHeader>
							<CardTitle>{project.title}</CardTitle>
							<CardDescription>{project.description}</CardDescription>
							<CardAction>
								<Badge size="sm">{project.count}</Badge>
							</CardAction>
						</CardHeader>
						<CardFooter className="justify-between gap-3">
							<AvatarGroup aria-label={`${project.people.length} collaborators`} size="sm" surface={framed ? "card" : undefined}>
								{project.people.map((initials) => (
									<Avatar variant="art" key={initials} fallback={initials} alt={initials} />
								))}
							</AvatarGroup>
							<span className="text-caption text-muted-foreground">{project.updated}</span>
						</CardFooter>
					</Card>
				</Tilt>
			))}
		</CardStack>
	)
}
```
