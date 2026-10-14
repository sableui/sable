import { useState } from "react"
import {
	Button,
	DestructiveActionModal,
	destructiveActionModalMeta,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

function BasicDemo() {
	const [open, setOpen] = useState(false)
	return (
		<>
			<Button variant="destructive" onClick={() => setOpen(true)}>
				Delete post
			</Button>
			<DestructiveActionModal
				open={open}
				onOpenChange={setOpen}
				title="Delete post?"
				description="This permanently removes the post and all of its comments. This cannot be undone."
				onConfirm={() => {
					// In a real app, fire the delete mutation here.
				}}
			/>
		</>
	)
}

function TypeToConfirmDemo() {
	const [open, setOpen] = useState(false)
	const postTitle = "gold rush"
	return (
		<>
			<Button variant="destructive" onClick={() => setOpen(true)}>
				Delete “{postTitle}”
			</Button>
			<DestructiveActionModal
				open={open}
				onOpenChange={setOpen}
				title="Delete this post?"
				description="This is a high-stakes action. Type the post title to confirm you mean it."
				confirmText={postTitle}
				confirmLabel="Delete forever"
				onConfirm={() => {
					// In a real app, fire the delete mutation here.
				}}
			/>
		</>
	)
}

export function DestructiveActionModalPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Destructive Action Modal"
				lede={ledeFor(destructiveActionModalMeta)}
			/>

			<Section
				title="Basic"
				description="Cancel sits beside a clearly destructive confirm."
			>
				<Example>
					<BasicDemo />
				</Example>
			</Section>

			<Section
				title="Type to confirm"
				description="For high-stakes deletes, the button stays off until the name is typed."
			>
				<Example>
					<TypeToConfirmDemo />
				</Example>
			</Section>

			<MetaFooter meta={destructiveActionModalMeta} />
		</>
	)
}
