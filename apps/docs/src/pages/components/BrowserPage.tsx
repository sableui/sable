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
								title="New arrivals"
								description="Fresh from the makers you follow."
								actions={
									<Button size="sm" iconStart={<Icon name="plus" />}>
										Create
									</Button>
								}
							/>
							<div className="grid gap-4 sm:grid-cols-2">
								<Card>
									<CardHeader>
										<Badge tone="1">New</Badge>
										<CardTitle>Linen throw blanket</CardTitle>
										<CardDescription>Washed linen, four colours.</CardDescription>
									</CardHeader>
									<CardContent>
										<CardDescription>$64.00 &middot; 42 in stock</CardDescription>
									</CardContent>
								</Card>
								<Card>
									<CardHeader>
										<Badge tone="2">Bestseller</Badge>
										<CardTitle>Stoneware mug</CardTitle>
										<CardDescription>Glazed by hand.</CardDescription>
									</CardHeader>
									<CardContent>
										<CardDescription>$28.00 &middot; pre-order</CardDescription>
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
						<Browser url="studio.example/u/sam">
							<div className="p-3">
								<Entity
									leading={<Avatar fallback="SA" alt="sam" />}
									title="sam"
									subtitle="128 posts · 12k followers"
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
