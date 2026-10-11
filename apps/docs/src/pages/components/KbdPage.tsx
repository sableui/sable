import { Kbd, KbdGroup, kbdMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function KbdPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Kbd" lede={ledeFor(kbdMeta)} />

			<Section title="Single keys">
				<Example>
					<Kbd>Esc</Kbd>
					<Kbd>Tab</Kbd>
					<Kbd>↵</Kbd>
					<Kbd>⇧</Kbd>
					<Kbd>K</Kbd>
				</Example>
			</Section>

			<Section
				title="Combo"
				description="One cap per key inside KbdGroup. With mod, the modifier reads ⌘ on a Mac and Ctrl everywhere else."
			>
				<Example code="<KbdGroup><Kbd mod /><Kbd>⇧</Kbd><Kbd>P</Kbd></KbdGroup>">
					<KbdGroup>
						<Kbd mod />
						<Kbd>⇧</Kbd>
						<Kbd>P</Kbd>
					</KbdGroup>
				</Example>
			</Section>

			<Section
				title="In running text"
				description="The cap sizes itself from the text around it, so it sits on the line at any type size."
			>
				<Example
					code={'<p className="text-body-md">Press <KbdGroup><Kbd mod /><Kbd>K</Kbd></KbdGroup> to search.</p>'}
				>
					<p className="text-body-md">
						Press{" "}
						<KbdGroup>
							<Kbd mod />
							<Kbd>K</Kbd>
						</KbdGroup>{" "}
						to search, or <Kbd>Esc</Kbd> to close.
					</p>
				</Example>
			</Section>

			<Section
				title="Ghost"
				description="The bare label, for a menu row's shortcut or a tooltip — places that are already a surface of their own."
			>
				<Example code={'<KbdGroup><Kbd variant="ghost" mod /><Kbd variant="ghost">K</Kbd></KbdGroup>'}>
					<KbdGroup>
						<Kbd variant="ghost" mod />
						<Kbd variant="ghost">K</Kbd>
					</KbdGroup>
				</Example>
			</Section>

			<MetaFooter meta={kbdMeta} />
		</>
	)
}
