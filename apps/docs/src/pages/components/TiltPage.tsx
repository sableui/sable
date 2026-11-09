import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Tilt, tiltMeta } from "@sableui/react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function Membership({ maxAngle, motion }: { maxAngle?: number; motion?: "off" }) {
	return (
		<Tilt maxAngle={maxAngle} motion={motion} className="w-full max-w-xs">
			<Card>
				<CardHeader>
					<CardTitle>Studio membership</CardTitle>
					<CardDescription>A desk, the print room and the library, five days a week.</CardDescription>
				</CardHeader>
				<CardContent>
					<span className="text-heading-2 text-foreground">$180</span>
					<span className="text-body-sm text-muted-foreground"> / month</span>
				</CardContent>
				<CardFooter>
					<Button className="w-full">Join the studio</Button>
				</CardFooter>
			</Card>
		</Tilt>
	)
}

export function TiltPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Tilt" lede={ledeFor(tiltMeta)} />

			<Section title="Basic" description="Move a mouse across the card. It leans toward the pointer, up to 6° on each axis, and settles flat when the pointer leaves. Touch leaves it still.">
				<Example code={tiltMeta.examples[0].code}>
					<Membership />
				</Example>
			</Section>

			<Section title="Gentler" description="maxAngle sets the lean. 3° suits a card in a stack or a grid, where a bigger lean crowds its neighbours.">
				<Example code="<Tilt maxAngle={3}>…</Tilt>">
					<Membership maxAngle={3} />
				</Example>
			</Section>

			<Section title="Without animation" description='motion="off" keeps the surface flat; subtle motion and reduced motion do too. Nothing in the card depends on the tilt.'>
				<Example code={'<Tilt motion="off">…</Tilt>'}>
					<Membership motion="off" />
				</Example>
			</Section>

			<MetaFooter meta={tiltMeta} />
		</>
	)
}
