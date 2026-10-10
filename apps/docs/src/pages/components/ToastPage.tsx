import { Button, ToastProvider, toastMeta, useToast } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Pushes a simple title + description toast. Must render under <ToastProvider>. */
function BasicTrigger() {
	const toast = useToast()
	return (
		<Button
			onClick={() =>
				toast.add({
					title: "Post published",
					description: "Your edition is live on Studio.",
				})
			}
		>
			Publish
		</Button>
	)
}

/** Demonstrates description-only and persistent (timeout: 0) toasts. */
function VariantsTrigger() {
	const toast = useToast()
	return (
		<>
			<Button
				variant="secondary"
				onClick={() =>
					toast.add({ description: "Link copied to clipboard." })
				}
			>
				Description only
			</Button>
			<Button
				variant="secondary"
				onClick={() =>
					toast.add({
						title: "Uploading…",
						description: "Pinning your media to Arweave. This won't auto-dismiss.",
						timeout: 0,
					})
				}
			>
				Persistent
			</Button>
		</>
	)
}

/**
 * The action path. `actionProps` is Base UI's own shape — children plus any
 * button props — and the renderer mounts a ToastAction for it. Dismissal is the
 * handler's, not the button's, so the id from add() is what closes it.
 */
function ActionTrigger() {
	const toast = useToast()
	return (
		<Button
			variant="secondary"
			onClick={() => {
				const id = toast.add({
					title: "Layer deleted",
					description: "Backdrop was removed from the document.",
					actionProps: {
						children: "Undo",
						onClick: () => toast.close(id),
					},
				})
			}}
		>
			Delete a layer
		</Button>
	)
}

/** Adds three toasts at once to show the limit-aware stack. */
function StackTrigger() {
	const toast = useToast()
	return (
		<Button
			variant="secondary"
			onClick={() => {
				toast.add({ title: "Saved", description: "Draft #1" })
				toast.add({ title: "Saved", description: "Draft #2" })
				toast.add({ title: "Saved", description: "Draft #3" })
				toast.add({ title: "Saved", description: "Draft #4 (evicts the oldest)" })
			}}
		>
			Add four
		</Button>
	)
}

export function ToastPage() {
	// One provider for the page, as in an app: every provider subscribes to the
	// same toast store, so several on one page would each render every toast.
	return (
		<ToastProvider limit={3}>
			<PageHeader eyebrow="Components" title="Toast" lede={ledeFor(toastMeta)} />

			<Section
				title="Basic"
				description="A title and a line of detail. It dismisses itself after a few seconds."
			>
				<Example>
					<BasicTrigger />
				</Example>
			</Section>

			<Section
				title="Description only and persistent"
				description="A single line, or one that stays until it's dismissed."
			>
				<Example>
					<VariantsTrigger />
				</Example>
			</Section>

			<Section
				title="With an action"
				description="A toast with an action, like Undo, stays until it's dismissed."
			>
				<Example>
					<ActionTrigger />
				</Example>
			</Section>

			<Section
				title="Stacking"
				description="Up to three at once. A new one pushes out the oldest."
			>
				<Example>
					<StackTrigger />
				</Example>
			</Section>

			<MetaFooter meta={toastMeta} />
		</ToastProvider>
	)
}
