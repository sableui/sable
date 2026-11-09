import { Button, TextSwap, type TextSwapProps, textSwapMeta, Toggle, ToggleGroup } from "@sableui/react"
import { InvoicePreviewBlock } from "@sableui/react/blocks"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function SavedDemo() {
	const [saved, setSaved] = useState(false)
	return (
		<div className="flex flex-col items-center gap-4">
			<TextSwap text={saved ? "Saved" : "Unsaved changes"} aria-live="polite" className="text-heading-3 text-foreground" />
			<Button variant="secondary" onClick={() => setSaved((s) => !s)}>
				{saved ? "Edit" : "Save"}
			</Button>
		</div>
	)
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const EFFECTS: NonNullable<TextSwapProps["effect"]>[] = ["blur", "slide", "fade"]

function EffectDemo() {
	const [day, setDay] = useState(0)
	const [effect, setEffect] = useState<NonNullable<TextSwapProps["effect"]>>("blur")
	return (
		<div className="flex flex-col items-center gap-4">
			<TextSwap text={DAYS[day]} effect={effect} className="text-heading-3 text-foreground" />
			<div className="flex flex-wrap justify-center gap-2">
				<ToggleGroup value={[effect]} onValueChange={(v: unknown[]) => v[0] && setEffect(v[0] as typeof effect)} aria-label="Effect">
					{EFFECTS.map((name) => (
						<Toggle key={name} value={name} className="capitalize">
							{name}
						</Toggle>
					))}
				</ToggleGroup>
				<Button variant="secondary" onClick={() => setDay((d) => (d + 1) % DAYS.length)}>
					Next day
				</Button>
			</div>
		</div>
	)
}

function SubtleDemo() {
	const [day, setDay] = useState(0)
	return (
		<div className="flex flex-col items-center gap-4">
			<TextSwap text={DAYS[day]} motion="subtle" className="text-heading-3 text-foreground" />
			<Button variant="secondary" onClick={() => setDay((d) => (d + 1) % DAYS.length)}>
				Next day
			</Button>
		</div>
	)
}

export function TextSwapPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Text Swap" lede={ledeFor(textSwapMeta)} />

			<Section title="Basic" description="The new label resolves in while the old one leaves. Assistive tech reads one string, the current one, and only once.">
				<Example code={'<TextSwap text={saved ? "Saved" : "Unsaved changes"} aria-live="polite" />'}>
					<SavedDemo />
				</Example>
			</Section>

			<Section title="Effects" description="blur (the default) sharpens the label as it lands; slide moves it without the blur; fade only crossfades.">
				<Example code={'<TextSwap text={day} effect="slide" />'}>
					<EffectDemo />
				</Example>
			</Section>

			<Section title="Subtle" description='motion="subtle" replaces the label at once. Reduced motion does the same everywhere.'>
				<Example code={textSwapMeta.examples[1].code}>
					<SubtleDemo />
				</Example>
			</Section>

			<Section title="Inside an action" description="The invoice's button swaps Send invoice for Sending… and Sent, with the spinner beside the label instead of over it.">
				<Example code="<InvoicePreviewBlock />">
					<InvoicePreviewBlock />
				</Example>
			</Section>

			<MetaFooter meta={textSwapMeta} />
		</>
	)
}
