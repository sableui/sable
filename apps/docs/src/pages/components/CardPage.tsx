import {
	Avatar,
	Badge,
	Button,
	Card,
	CardContent,
	cardMeta,
	CardDescription,
	CardFooter,
	CardHeader,
	CardList,
	CardTitle,
	Entity,
	Icon,
} from "@sableui/react"

const MEMBERS = [
	{ id: "m1", name: "Ana Chen", initials: "AC", role: "Owner" },
	{ id: "m2", name: "Mo Ortiz", initials: "MO", role: "Editor" },
	{ id: "m3", name: "Sam Reyes", initials: "SR", role: "Viewer" },
]
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function CardPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Card" lede={ledeFor(cardMeta)} />

			<ComponentPlayground meta={cardMeta} />

			<Section title="Anatomy">
				<Example className="!block">
					<Card className="max-w-sm">
						<CardHeader>
							<Badge tone="1">New</Badge>
							<CardTitle>Linen throw blanket</CardTitle>
							<CardDescription>
								Washed linen, in four colours. Ships in two days.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-body-md text-muted-foreground">
							$64.00 · 42 in stock
						</CardContent>
						<CardFooter>
							<Button size="sm">Add to cart</Button>
							<Button size="sm" variant="ghost">
								Details
							</Button>
						</CardFooter>
					</Card>
				</Example>
			</Section>

			<Section
				title="Variants"
				description="Raised with a border and soft shadow, or flat with no surface."
			>
				<Example>
					<Card className="w-40">
						<CardContent>
							<CardTitle className="text-center">Default</CardTitle>
						</CardContent>
					</Card>
					<Card variant="flat" className="w-40">
						<CardContent>
							<CardTitle className="text-center">Flat</CardTitle>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="Density"
				description="Compact tightens the padding for denser panels."
			>
				<Example className="items-start">
					<Card className="w-56">
						<CardHeader>
							<CardTitle>Comfortable</CardTitle>
							<CardDescription>The default spacing.</CardDescription>
						</CardHeader>
						<CardContent className="text-body-sm text-muted-foreground">
							Spacious section padding.
						</CardContent>
					</Card>
					<Card density="compact" className="w-56">
						<CardHeader>
							<CardTitle>Compact</CardTitle>
							<CardDescription>Tighter spacing.</CardDescription>
						</CardHeader>
						<CardContent className="text-body-sm text-muted-foreground">
							Denser section padding.
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="As a link"
				description="When the whole card goes one place, make the card the link. It gets a hover, a focus ring around the whole card, and eased motion. If anything inside the card is clickable, keep the card plain and link the title instead."
			>
				<Example
					className="!block"
					code={`<Card render={<a href="/button" />} className="max-w-sm">
  <CardContent className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <CardTitle>Button</CardTitle>
      <CardDescription>The primary action, in every size and state.</CardDescription>
    </div>
    <Icon
      name="chevron-right"
      className="text-sm text-muted-foreground motion-interactive group-hover/card:translate-x-0.5 group-hover/card:text-foreground"
    />
  </CardContent>
</Card>`}
				>
					<Card render={<a href="/button" />} className="max-w-sm">
						<CardContent className="flex items-center justify-between gap-4">
							<div className="min-w-0">
								<CardTitle>Button</CardTitle>
								<CardDescription>The primary action, in every size and state.</CardDescription>
							</div>
							<Icon
								name="chevron-right"
								className="text-sm text-muted-foreground motion-interactive group-hover/card:translate-x-0.5 group-hover/card:text-foreground"
							/>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="List card"
				description="Rows run edge to edge with hairlines between them, inset to the card's own padding so they line up with the header."
			>
				<Example
					className="!block"
					code={`<Card className="max-w-sm">
  <CardHeader>
    <CardTitle>Members</CardTitle>
    <CardDescription>3 people can edit this space.</CardDescription>
  </CardHeader>
  <CardList>
    {members.map((m) => (
      <Entity
        key={m.id}
        interactive
        onSelect={() => open(m)}
        leading={<Avatar size="sm" fallback={m.initials} alt={m.name} />}
        title={m.name}
        subtitle={m.role}
      />
    ))}
  </CardList>
</Card>`}
				>
					<Card className="max-w-sm">
						<CardHeader>
							<CardTitle>Members</CardTitle>
							<CardDescription>3 people can edit this space.</CardDescription>
						</CardHeader>
						<CardList>
							{MEMBERS.map((m) => (
								<Entity
									key={m.id}
									interactive
									onSelect={() => undefined}
									leading={<Avatar size="sm" fallback={m.initials} alt={m.name} />}
									title={m.name}
									subtitle={m.role}
								/>
							))}
						</CardList>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={cardMeta} />
		</>
	)
}
