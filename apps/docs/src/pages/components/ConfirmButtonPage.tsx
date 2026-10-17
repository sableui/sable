import { Button, ConfirmButton, Icon, Row, Stack, confirmButtonMeta } from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

const DRAFTS = ["Q3 roadmap", "Launch email", "Pricing notes"]

/** A short list whose rows really go, so the second press has a visible result. */
function DraftList() {
	const [drafts, setDrafts] = useState(DRAFTS)
	return (
		<Stack gap={2} className="w-full max-w-md">
			{drafts.map((name) => (
				<Row key={name} gap={3} className="w-full items-center justify-between">
					<span className="text-body-md text-foreground">{name}</span>
					<ConfirmButton
						variant="ghost"
						size="sm"
						icon={<Icon name="trash" />}
						onConfirm={() => setDrafts((all) => all.filter((d) => d !== name))}
					>
						Delete
					</ConfirmButton>
				</Row>
			))}
			{drafts.length === 0 ? (
				<Row gap={2} className="items-center">
					<span className="text-body-sm text-muted-foreground">All gone.</span>
					<Button variant="link" size="sm" onClick={() => setDrafts(DRAFTS)}>
						Bring them back
					</Button>
				</Row>
			) : null}
		</Stack>
	)
}

export function ConfirmButtonPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Confirm Button" lede={ledeFor(confirmButtonMeta)} />

			<Section
				title="Press twice"
				description="The first press asks; the button grows into the question and a thin line drains along its foot for the three seconds it will wait. Press again to delete. Escape, clicking elsewhere or waiting it out puts it back."
			>
				<Example
					code={`<ConfirmButton variant="ghost" size="sm" icon={<Icon name="trash" />} onConfirm={() => removeDraft(id)}>
  Delete
</ConfirmButton>`}
				>
					<DraftList />
				</Example>
			</Section>

			<Section
				title="The question"
				description="By default the armed label asks about the idle one. Pass confirmLabel to say it your way, or to localise."
			>
				<Example
					code={`<ConfirmButton onConfirm={clearHistory}>Clear history</ConfirmButton>
<ConfirmButton variant="outline" confirmLabel="Revoke this key?" timeout={5000} onConfirm={revokeKey}>
  Revoke
</ConfirmButton>`}
				>
					<ConfirmButton onConfirm={() => {}}>Clear history</ConfirmButton>
					<ConfirmButton variant="outline" confirmLabel="Revoke this key?" timeout={5000} onConfirm={() => {}}>
						Revoke
					</ConfirmButton>
				</Example>
			</Section>

			<Section
				title="Async"
				description="Return a promise from onConfirm and the button stays armed with a spinner until it settles, refusing further presses."
			>
				<Example code={`<ConfirmButton onConfirm={() => api.discardDraft(draft.id)}>Discard draft</ConfirmButton>`}>
					<ConfirmButton onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1200))}>Discard draft</ConfirmButton>
				</Example>
			</Section>

			<Section
				title="Subtle motion"
				description={'motion="subtle" keeps the cross-fade and the colour change and drops the width easing and countdown.'}
			>
				<Example code={`<ConfirmButton motion="subtle" onConfirm={removeRow}>Remove</ConfirmButton>`}>
					<ConfirmButton motion="subtle" onConfirm={() => {}}>
						Remove
					</ConfirmButton>
				</Example>
			</Section>

			<MetaFooter meta={confirmButtonMeta} />
		</>
	)
}
