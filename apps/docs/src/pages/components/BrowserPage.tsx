import {
	Avatar,
	Badge,
	Browser,
	browserMeta,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Entity,
	Icon,
	PageHeader as SablePageHeader,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function BrowserPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Browser"
				lede={ledeFor(browserMeta)}
			/>

			<Section title="Anatomy">
				<Example className="!block">
					<Browser url="studio.example/explore">
						<div className="space-y-6 p-8">
							<SablePageHeader
								title="New editions"
								description="Fresh drops from artists you follow."
								actions={
									<Button size="sm" iconStart={<Icon name="plus" />}>
										Create
									</Button>
								}
							/>
							<div className="grid gap-4 sm:grid-cols-2">
								<Card>
									<CardHeader>
										<Badge tone="edition">Edition</Badge>
										<CardTitle>Untitled (gold rush)</CardTitle>
										<CardDescription>Limited run of 100.</CardDescription>
									</CardHeader>
									<CardContent>
										<CardDescription>0.5 SOL &middot; 42 collected</CardDescription>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<Badge tone="collectible">Collectible</Badge>
										<CardTitle>Quiet harbor</CardTitle>
										<CardDescription>One of one, on-chain.</CardDescription>
									</CardHeader>
									<CardContent>
										<CardDescription>1.2 SOL &middot; reserved</CardDescription>
									</CardContent>
								</Card>
							</div>
						</div>
					</Browser>
				</Example>
			</Section>

			<Section
				title="Address pill"
				description="Show an address, or leave the field blank."
			>
				<Example className="!block">
					<div className="space-y-6">
						<Browser url="studio.example/u/satoshi">
							<div className="p-3">
								<Entity
									leading={<Avatar fallback="SA" alt="satoshi" />}
									title="satoshi"
									subtitle="128 posts · 12k collectors"
								/>
							</div>
						</Browser>
						<Browser>
							<div className="p-3">
								<Entity
									leading={<Icon name="file" className="text-2xl text-muted-foreground" />}
									title="Untitled page"
									subtitle="Blank address pill (no url)"
								/>
							</div>
						</Browser>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={browserMeta} />
		</>
	)
}
