import {
	Button,
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	sheetMeta,
	SheetTitle,
	SheetTrigger,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function SheetPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Sheet" lede={ledeFor(sheetMeta)} />

			<Section
				title="Basic"
				description="A panel that slides in from the edge, keeping the page behind it in view."
			>
				<Example>
					<Sheet>
						<SheetTrigger render={<Button>Open sheet</Button>} />
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Edition details</SheetTitle>
								<SheetDescription>
									A limited run of 100, stored permanently on Arweave.
								</SheetDescription>
							</SheetHeader>
							<p className="text-body-md text-muted-foreground">
								Collecting mints a compressed NFT to your wallet.
							</p>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Cancel</Button>} />
								<SheetClose render={<Button>Collect</Button>} />
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</Example>
			</Section>

			<Section
				title="Sides"
				description="Side sheets run full height. Top and bottom sheets span the width. On touch, each swipes closed toward its own edge."
			>
				<Example
					code={`<Sheet>
  <SheetTrigger render={<Button variant="secondary">Right</Button>} />
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Right sheet</SheetTitle>
      <SheetDescription>Slides in from the right.</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose render={<Button variant="secondary">Close</Button>} />
    </SheetFooter>
  </SheetContent>
</Sheet>
// side="left" · side="top" · side="bottom" are built the same way`}
				>
					<Sheet>
						<SheetTrigger render={<Button variant="secondary">Right</Button>} />
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Right sheet</SheetTitle>
								<SheetDescription>Slides in from the right.</SheetDescription>
							</SheetHeader>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Close</Button>} />
							</SheetFooter>
						</SheetContent>
					</Sheet>

					<Sheet>
						<SheetTrigger render={<Button variant="secondary">Left</Button>} />
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle>Navigation</SheetTitle>
								<SheetDescription>Slides in from the left.</SheetDescription>
							</SheetHeader>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Close</Button>} />
							</SheetFooter>
						</SheetContent>
					</Sheet>

					<Sheet>
						<SheetTrigger render={<Button variant="secondary">Top</Button>} />
						<SheetContent side="top">
							<SheetHeader>
								<SheetTitle>Top sheet</SheetTitle>
								<SheetDescription>Drops down from the top.</SheetDescription>
							</SheetHeader>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Close</Button>} />
							</SheetFooter>
						</SheetContent>
					</Sheet>

					<Sheet>
						<SheetTrigger render={<Button variant="secondary">Bottom</Button>} />
						<SheetContent side="bottom">
							<SheetHeader>
								<SheetTitle>Bottom sheet</SheetTitle>
								<SheetDescription>Rises from the bottom.</SheetDescription>
							</SheetHeader>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Close</Button>} />
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</Example>
			</Section>

			<Section
				title="With a form"
				description="Actions sit in a footer at the bottom of the panel."
			>
				<Example>
					<Sheet>
						<SheetTrigger render={<Button variant="secondary">Filters</Button>} />
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Filter feed</SheetTitle>
								<SheetDescription>
									Narrow the timeline to the posts you care about.
								</SheetDescription>
							</SheetHeader>
							<p className="text-body-md text-muted-foreground">
								Filter controls live here.
							</p>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Reset</Button>} />
								<SheetClose render={<Button>Apply</Button>} />
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</Example>
			</Section>

			<MetaFooter meta={sheetMeta} />
		</>
	)
}
