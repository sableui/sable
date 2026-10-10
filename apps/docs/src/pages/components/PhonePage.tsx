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
								<h2 className="text-title-lg">Editions</h2>
							</header>
							<Card>
								<CardHeader>
									<CardTitle>Gold rush</CardTitle>
									<CardDescription>Limited run of 100.</CardDescription>
								</CardHeader>
								<CardContent className="text-body-sm text-muted-foreground">
									0.5 SOL · 42 collected
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Night shift</CardTitle>
									<CardDescription>Open edition.</CardDescription>
								</CardHeader>
								<CardContent className="text-body-sm text-muted-foreground">
									0.2 SOL · 318 collected
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
									<CardTitle>Recent collects</CardTitle>
								</CardHeader>
								<CardList>
									{Array.from({ length: 12 }, (_, i) => (
										<Entity
											key={`collect-${i + 1}`}
											title={`Edition #${i + 1}`}
											subtitle={`${(i + 1) * 3} collected`}
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
