import { useState } from "react"
import {
	Button,
	Entity,
	SearchInput,
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetList,
	sheetMeta,
	SheetTitle,
	type SheetSnapPoint,
	SheetTrigger,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Sample content (invented): enough rows that the full stop has to scroll. */
const PLACES = [
	["Juniper Coffee", "120 m"],
	["Northside Books", "240 m"],
	["Harbor Market", "350 m"],
	["Lantern Noodle Bar", "410 m"],
	["Cedar Park", "520 m"],
	["The Print Room", "600 m"],
	["Fig & Olive Deli", "680 m"],
	["Riverside Climbing", "750 m"],
	["Atlas Records", "820 m"],
	["Moss Plant Studio", "900 m"],
	["Second Spin Cycles", "1.1 km"],
	["Quarry Swim Club", "1.3 km"],
].map(([name, distance]) => ({ name, distance }))

function SnapPointsDemo() {
	const [stop, setStop] = useState<SheetSnapPoint | null>(0.4)
	return (
		<Sheet snapPoints={[0.4, 1]} snapPoint={stop} onSnapPointChange={setStop} onOpenChange={(open) => open && setStop(0.4)}>
			<SheetTrigger render={<Button variant="secondary">Nearby</Button>} />
			<SheetContent side="bottom">
				<SheetHeader>
					<SheetTitle>12 places nearby</SheetTitle>
					<SheetDescription>Drag up for the full list.</SheetDescription>
				</SheetHeader>
				<SearchInput aria-label="Filter places" placeholder="Filter places" />
				<SheetList>
					{PLACES.map((place) => (
						<Entity key={place.name} title={place.name} subtitle={place.distance} />
					))}
				</SheetList>
				{stop !== 1 ? (
					<Button variant="secondary" onClick={() => setStop(1)}>
						Show all 12
					</Button>
				) : null}
			</SheetContent>
		</Sheet>
	)
}

/**
 * Opened from a plain Button through controlled `open`, no SheetTrigger: the
 * search field autofocuses, and closing still returns focus to the button.
 */
function OwnButtonDemo() {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Find a place
			</Button>
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Find a place</SheetTitle>
						<SheetDescription>Close it and focus lands back on the button.</SheetDescription>
					</SheetHeader>
					{/* biome-ignore lint/a11y/noAutofocus: the demo shows focus return past an autofocused field */}
					<SearchInput autoFocus placeholder="Search nearby" aria-label="Search nearby" />
					<SheetFooter>
						<SheetClose render={<Button variant="secondary">Close</Button>} />
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	)
}

export function SheetPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Sheet" lede={ledeFor(sheetMeta)} />

			<ComponentPlayground meta={sheetMeta} />

			<Section
				title="Basic"
				description="A panel that slides in from the edge, keeping the page behind it in view."
			>
				<Example>
					<Sheet>
						<SheetTrigger render={<Button>Open sheet</Button>} />
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Plan details</SheetTitle>
								<SheetDescription>
									Up to 10 seats, billed monthly per seat.
								</SheetDescription>
							</SheetHeader>
							<p className="text-body-md text-muted-foreground">
								Upgrading starts a new billing period today.
							</p>
							<SheetFooter>
								<SheetClose render={<Button variant="secondary">Cancel</Button>} />
								<SheetClose render={<Button>Upgrade</Button>} />
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
				title="Snap points"
				description="A bottom sheet with stops: it opens at the first and a swipe moves between them, the way a map shows a few results and then the whole list. The part below the screen is padding, so the list scrolls within what you can see, and the sheet rides above the on-screen keyboard."
			>
				<Example
					code={`const [stop, setStop] = useState<SheetSnapPoint | null>(0.4)

<Sheet snapPoints={[0.4, 1]} snapPoint={stop} onSnapPointChange={setStop}>
  <SheetTrigger render={<Button variant="secondary">Nearby</Button>} />
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>12 places nearby</SheetTitle>
      <SheetDescription>Drag up for the full list.</SheetDescription>
    </SheetHeader>
    <SearchInput aria-label="Filter places" placeholder="Filter places" />
    <SheetList>
      {places.map((place) => (
        <Entity key={place.id} title={place.name} subtitle={place.distance} />
      ))}
    </SheetList>
    {/* The drag is never the only way: a button reaches the full stop too. */}
    {stop !== 1 ? <Button variant="secondary" onClick={() => setStop(1)}>Show all 12</Button> : null}
  </SheetContent>
</Sheet>`}
				>
					<SnapPointsDemo />
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

			<Section
				title="Opened from your own button"
				description="Drive open from your own state when the opener is not a SheetTrigger. On close, focus returns to whatever held it when the sheet opened, even when a field inside takes focus on mount. Pass finalFocus only to send it somewhere else."
			>
				<Example
					code={`const [open, setOpen] = useState(false)

<Button variant="secondary" onClick={() => setOpen(true)}>Find a place</Button>
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Find a place</SheetTitle>
    </SheetHeader>
    <SearchInput autoFocus placeholder="Search nearby" aria-label="Search nearby" />
  </SheetContent>
</Sheet>`}
				>
					<OwnButtonDemo />
				</Example>
			</Section>

			<MetaFooter meta={sheetMeta} />
		</>
	)
}
