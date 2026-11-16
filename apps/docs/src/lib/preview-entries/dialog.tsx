import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, dialogMeta, DialogTitle, DialogTrigger } from "@sableui/react"
import { attrs, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: dialogMeta,
	only: ["size"],
	render: (values) => (
		<Dialog>
			<DialogTrigger render={<Button>Open dialog</Button>} />
			<DialogContent size={values.size as "default" | "fullscreen"}>
				<DialogHeader>
					<DialogTitle>Plan details</DialogTitle>
					<DialogDescription>Up to 10 seats, billed monthly per seat.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="secondary">Close</Button>} />
					<DialogClose render={<Button>Upgrade</Button>} />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
	snippet: (values) => `<Dialog>
<DialogTrigger render={<Button>Open dialog</Button>} />
<DialogContent${attrs(dialogMeta, values, ["size"])}>
	<DialogHeader>
		<DialogTitle>Plan details</DialogTitle>
		<DialogDescription>Up to 10 seats.</DialogDescription>
	</DialogHeader>
	<DialogFooter>
		<DialogClose render={<Button variant="secondary">Close</Button>} />
		<DialogClose render={<Button>Upgrade</Button>} />
	</DialogFooter>
</DialogContent>
/Dialog>`,
}

export default entry
