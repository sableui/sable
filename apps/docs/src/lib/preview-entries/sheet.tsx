import { Button, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, sheetMeta, SheetTitle, SheetTrigger } from "@sableui/react"
import { attrs, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: sheetMeta,
	only: ["side"],
	render: (values) => (
		<Sheet>
			<SheetTrigger render={<Button>Open sheet</Button>} />
			<SheetContent side={values.side as "right" | "left" | "top" | "bottom"}>
				<SheetHeader>
					<SheetTitle>Plan details</SheetTitle>
					<SheetDescription>Up to 10 seats, billed monthly per seat.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetClose render={<Button variant="secondary">Cancel</Button>} />
					<SheetClose render={<Button>Upgrade</Button>} />
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
	snippet: (values) => `<Sheet>
<SheetTrigger render={<Button>Open sheet</Button>} />
<SheetContent${attrs(sheetMeta, values, ["side"])}>
	<SheetHeader>
		<SheetTitle>Plan details</SheetTitle>
		<SheetDescription>Up to 10 seats.</SheetDescription>
	</SheetHeader>
	<SheetFooter>
		<SheetClose render={<Button variant="secondary">Cancel</Button>} />
		<SheetClose render={<Button>Upgrade</Button>} />
	</SheetFooter>
</SheetContent>
/Sheet>`,
}

export default entry
