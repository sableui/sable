import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
	Carousel,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	dialogMeta,
	DialogTitle,
	DialogTrigger,
	Icon,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Each fill with its own paired ink — a tone's -foreground is tuned to that fill only. */
const TONES = [
	"bg-tone-3 text-tone-3-foreground",
	"bg-tone-2 text-tone-2-foreground",
	"bg-tone-1 text-tone-1-foreground",
	"bg-tone-info text-tone-info-foreground",
	"bg-tone-warning text-tone-warning-foreground",
]

function Artwork({ n, className }: { n: number; className?: string }) {
	return (
		<div
			className={`flex items-center justify-center rounded-lg ${TONES[n % TONES.length]} text-heading-1 ${className ?? ""}`}
		>
			{n + 1}
		</div>
	)
}

export function DialogPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Dialog" lede={ledeFor(dialogMeta)} />

			<ComponentPlayground meta={dialogMeta} />

			<Section title="Basic">
				<Example>
					<Dialog>
						<DialogTrigger render={<Button>Open dialog</Button>} />
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Plan details</DialogTitle>
								<DialogDescription>
									Up to 10 seats, billed monthly per seat.
								</DialogDescription>
							</DialogHeader>
							<p className="text-body-md text-muted-foreground">
								Upgrading starts a new billing period today.
							</p>
							<DialogFooter>
								<DialogClose render={<Button variant="secondary">Close</Button>} />
								<DialogClose render={<Button>Upgrade</Button>} />
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</Example>
			</Section>

			<Section
				title="Destructive confirm"
				description="Say what will happen. Save red for what can't be undone. A confirmation is an alert dialog: a click outside does not dismiss it, so the answer has to be given. For the full pattern with a pending state and type to confirm, use Destructive Action Modal."
			>
				<Example>
					<AlertDialog>
						<AlertDialogTrigger
							render={<Button variant="destructive">Delete post</Button>}
						/>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete this post?</AlertDialogTitle>
								<AlertDialogDescription>This is permanent.</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogClose render={<Button variant="secondary">Cancel</Button>} />
								<AlertDialogClose
									render={<Button variant="destructive">Delete</Button>}
								/>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</Example>
			</Section>

			<Section
				title="Fullscreen"
				description="For media. Fills the screen over a dark backdrop, with a close button in the corner."
			>
				<Example>
					<Dialog>
						<DialogTrigger
							render={
								<Button variant="secondary">
									<Icon name="expand" className="text-sm" />
									View full size
								</Button>
							}
						/>
						<DialogContent size="fullscreen" aria-label="Artwork 2">
							{/* Width less the gutter rather than w-full plus a margin, which
							    summed to more than the screen on a phone. */}
							<Artwork
								n={1}
								className="aspect-square max-h-[calc(100%-var(--spacing)*16)] w-[calc(100%-var(--spacing)*16)] max-w-2xl"
							/>
						</DialogContent>
					</Dialog>
				</Example>
			</Section>

			<Section
				title="Fullscreen gallery"
				description="Put a carousel inside to flip through several images without leaving the viewer."
			>
				<Example>
					<Dialog>
						<DialogTrigger render={<Button>Open gallery</Button>} />
						<DialogContent size="fullscreen" aria-label="Gallery">
							<Carousel
								loop
								dots
								counter
								label="Gallery"
								className="w-full max-w-4xl px-8"
							>
								{Array.from({ length: 5 }, (_, i) => (
									<Artwork key={i} n={i} className="aspect-video size-full" />
								))}
							</Carousel>
						</DialogContent>
					</Dialog>
				</Example>
			</Section>

			<MetaFooter meta={dialogMeta} />
		</>
	)
}
