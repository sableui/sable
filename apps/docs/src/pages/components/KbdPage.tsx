import { Kbd, kbdMeta, Row } from "@sableui/react"
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
					<Kbd>K</Kbd>
				</Example>
			</Section>

			<Section
				title="Combo"
				description="Several keys with a + between them make a shortcut. With mod, the modifier reads ⌘ on a Mac and Ctrl everywhere else."
			>
				<Example code={'<Row gap={1} className="items-center text-body-sm text-muted-foreground"><Kbd mod /><span>+</span><Kbd>K</Kbd></Row>'}>
					<Row gap={1} className="items-center text-body-sm text-muted-foreground">
						<Kbd mod />
						<span>+</span>
						<Kbd>K</Kbd>
					</Row>
				</Example>
			</Section>

			<MetaFooter meta={kbdMeta} />
		</>
	)
}
