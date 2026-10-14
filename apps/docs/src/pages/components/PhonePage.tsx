import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardList,
	CardTitle,
	Entity,
	Phone,
	phoneMeta,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function PhonePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Phone" lede={ledeFor(phoneMeta)} />

			<Section
				title="Anatomy"
				description="A dark body with thin, even bezels, a camera pill and a status bar around a mobile screen."
			>
				<Example className="!block">
					<Phone>
						<div className="flex flex-col gap-4 p-4">
							<header className="flex flex-col gap-1">
								<p className="text-label-md text-muted-foreground">For you</p>
								<h2 className="text-title-lg">New arrivals</h2>
							</header>
							<Card>
								<CardHeader>
									<CardTitle>Linen throw</CardTitle>
									<CardDescription>Washed linen, four colours.</CardDescription>
								</CardHeader>
								<CardContent className="text-body-sm text-muted-foreground">
									$64.00 · 42 in stock
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Stoneware mug</CardTitle>
									<CardDescription>Glazed by hand.</CardDescription>
								</CardHeader>
								<CardContent className="text-body-sm text-muted-foreground">
									$28.00 · 318 sold
								</CardContent>
							</Card>
						</div>
					</Phone>
				</Example>
			</Section>

			<Section
				title="Scrolling"
				description="Long content scrolls inside the frame."
			>
				<Example className="!block">
					<Phone>
						<div className="p-4">
							<Card>
								<CardHeader>
									<CardTitle>Recent orders</CardTitle>
								</CardHeader>
								<CardList>
									{Array.from({ length: 12 }, (_, i) => (
										<Entity
											key={`order-${i + 1}`}
											title={`Order ${1040 + i}`}
											subtitle={`${(i % 4) + 1} items`}
										/>
									))}
								</CardList>
							</Card>
						</div>
					</Phone>
				</Example>
			</Section>

			<MetaFooter meta={phoneMeta} />
		</>
	)
}
