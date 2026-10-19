import {
	Avatar,
	Button,
	Card,
	CardContent,
	Entity,
	Field,
	Grid,
	Icon,
	SectionHeader,
	Stack,
	Switch,
	sectionHeaderMeta,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const ARTISTS = [
	["LV", "Lena Vale"],
	["HL", "Harbour Lights"],
	["OM", "Okra Moon"],
	["JT", "June Tamsin"],
	["RS", "Rue Sorrel"],
] as const

export function SectionHeaderPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Section Header"
				lede={ledeFor(sectionHeaderMeta)}
			/>

			<Section
				title="A shelf with View all"
				description="The title names the section through aria-labelledby. View all is a ghost button rendered as a link, named for the shelf it opens. Its label sits on the grid's edge, not one padding inside it: the header bleeds a trailing ghost or link action by its own padding, and the hover fill runs past the edge."
			>
				<Example
					className="!block"
					code={`<section aria-labelledby="following" className="flex flex-col gap-4">
	<SectionHeader
		titleId="following"
		title="Artists you follow"
		description="New music from these five lands here first."
		actions={
			<Button variant="ghost" size="sm" render={<a href="/following" />} aria-label="View all artists you follow">
				View all
			</Button>
		}
	/>
	<Grid minItemWidth="7rem" gap={2}>
		{artists.map((artist) => (
			<div key={artist.name} className="flex flex-col items-center gap-2 text-center">
				<Avatar variant="art" size="xl" fallback={artist.initials} alt="" />
				<span className="text-label-md">{artist.name}</span>
			</div>
		))}
	</Grid>
</section>`}
				>
					<section aria-labelledby="docs-following" className="flex flex-col gap-4">
						<SectionHeader
							titleId="docs-following"
							title="Artists you follow"
							description="New music from these five lands here first."
							actions={
								<Button
									variant="ghost"
									size="sm"
									render={<a href="#docs-following" />}
									aria-label="View all artists you follow"
								>
									View all
								</Button>
							}
						/>
						<Grid minItemWidth="7rem" gap={2}>
							{ARTISTS.map(([initials, name]) => (
								<div key={name} className="flex flex-col items-center gap-2 text-center">
									<Avatar variant="art" size="xl" fallback={initials} alt="" />
									<span className="text-label-md">{name}</span>
								</div>
							))}
						</Grid>
					</section>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Size sets the look, titleAs the outline. lg is for an editorial page's sections, under a PageHeader size=&quot;lg&quot;; md for a page's sections and shelves; sm for denser groups such as settings. lg stops at heading-2, because heading-1 is the page title's. At every size the actions centre on the title's first line."
			>
				<Example
					className="!block"
					code={`<SectionHeader
	size="lg"
	title="Selected work"
	description="Five projects from the last two years."
	actions={<Button variant="ghost" size="sm">View all</Button>}
/>
<SectionHeader
	title="Recently played"
	description="Picks up where you left off."
	actions={<Button variant="ghost" size="sm">View all</Button>}
/>
<SectionHeader
	size="sm"
	title="Playback"
	description="How tracks start, end and blend into each other."
	actions={<Button variant="ghost" size="sm">Reset</Button>}
/>`}
				>
					<Stack gap={6}>
						<SectionHeader
							titleAs="h3"
							size="lg"
							title="Selected work"
							description="Five projects from the last two years."
							actions={
								<Button variant="ghost" size="sm">
									View all
								</Button>
							}
						/>
						<SectionHeader
							titleAs="h3"
							title="Recently played"
							description="Picks up where you left off."
							actions={
								<Button variant="ghost" size="sm">
									View all
								</Button>
							}
						/>
						<SectionHeader
							titleAs="h3"
							size="sm"
							title="Playback"
							description="How tracks start, end and blend into each other."
							actions={
								<Button variant="ghost" size="sm">
									Reset
								</Button>
							}
						/>
					</Stack>
				</Example>
			</Section>

			<Section
				title="A settings section"
				description="size=&quot;sm&quot; for a denser set of sections. The heading level stays h2: size sets the look, titleAs follows the outline."
			>
				<Example
					className="!block"
					code={`<section aria-labelledby="playback" className="flex flex-col gap-4">
	<SectionHeader
		titleId="playback"
		size="sm"
		title="Playback"
		description="How tracks start, end and blend into each other."
	/>
	<Card>
		<CardContent className="flex flex-col gap-4">
			<Field label="Crossfade" orientation="horizontal"><Switch defaultChecked /></Field>
			<Field label="Normalize volume" orientation="horizontal"><Switch /></Field>
		</CardContent>
	</Card>
</section>`}
				>
					<section aria-labelledby="docs-playback" className="flex max-w-lg flex-col gap-4">
						<SectionHeader
							titleId="docs-playback"
							size="sm"
							title="Playback"
							description="How tracks start, end and blend into each other."
						/>
						<Card>
							<CardContent className="flex flex-col gap-4">
								<Field label="Crossfade" orientation="horizontal">
									<Switch defaultChecked />
								</Field>
								<Field label="Normalize volume" orientation="horizontal">
									<Switch />
								</Field>
							</CardContent>
						</Card>
					</section>
				</Example>
			</Section>

			<Section
				title="Two actions"
				description="Keep it to one or two small buttons. When the row is too narrow for the title and both, they move beneath it rather than squeezing it; the narrow frame below shows that. There the ghost Filter, now first on its line, lines up with the title's start edge instead."
			>
				<Example
					className="!block"
					code={`<SectionHeader
	title="Your playlists"
	actions={
		<>
			<Button variant="ghost" size="sm" iconStart={<Icon name="filter" />}>Filter</Button>
			<Button size="sm" iconStart={<Icon name="plus" />}>New playlist</Button>
		</>
	}
/>`}
				>
					<Stack gap={4}>
						<section aria-labelledby="docs-playlists" className="flex flex-col gap-4">
							<SectionHeader
								titleId="docs-playlists"
								title="Your playlists"
								actions={
									<>
										<Button variant="ghost" size="sm" iconStart={<Icon name="filter" />}>
											Filter
										</Button>
										<Button size="sm" iconStart={<Icon name="plus" />}>
											New playlist
										</Button>
									</>
								}
							/>
							<Stack gap={0}>
								<Entity className="[--entity-px:0]" title="Late drives" subtitle="42 tracks" />
								<Entity className="[--entity-px:0]" title="Focus" subtitle="18 tracks" />
							</Stack>
						</section>
						<div className="max-w-72 rounded-lg border border-dashed border-border p-4">
							<SectionHeader
								titleAs="h3"
								title="Your playlists"
								actions={
									<>
										<Button variant="ghost" size="sm" iconStart={<Icon name="filter" />}>
											Filter
										</Button>
										<Button size="sm" iconStart={<Icon name="plus" />}>
											New playlist
										</Button>
									</>
								}
							/>
						</div>
					</Stack>
				</Example>
			</Section>

			<MetaFooter meta={sectionHeaderMeta} />
		</>
	)
}
