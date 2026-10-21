import { Avatar, AvatarGroup, Card, CardContent, Entity, StatusDot, avatarMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Illustrated example portraits, one per person, so each example reads as a real roster. */
const photo = (name: string) => `/media/avatars/${name}.jpg`

const GROUP = [
	["alex-morgan", "Alex Morgan", "AM"],
	["mo-ortiz", "Mo Ortiz", "MO"],
	["sam-reyes", "Sam Reyes", "SR"],
	["jo-lund", "Jo Lund", "JL"],
	["ari-kim", "Ari Kim", "AK"],
	["nova-reed", "Nova Reed", "NR"],
	["ana-chen", "Ana Chen", "AC"],
] as const

const ATTENDEES = [
	["kofi-mensah", "Kofi Mensah", "KM"],
	["amira-haddad", "Amira Haddad", "AH"],
	["tala-begay", "Tala Begay", "TB"],
] as const

export function AvatarPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Avatar" lede={ledeFor(avatarMeta)} />

			<ComponentPlayground meta={avatarMeta} />

			<Section
				title="With image"
				description="Initials show while the photo loads, or if it's missing."
			>
				<Example code='<Avatar src="/media/avatars/alex-morgan.jpg" alt="Alex Morgan" fallback="AM" />'>
					<Avatar src={photo("alex-morgan")} alt="Alex Morgan" fallback="AM" />
				</Example>
			</Section>

			<Section title="Fallback only">
				<Example code='<Avatar fallback="AM" alt="Alex Morgan" />'>
					<Avatar fallback="AM" alt="Alex Morgan" />
				</Example>
			</Section>

			<Section
				title="Art fallback"
				description="variant=&quot;art&quot; paints the initials over GradientArt seeded by the person, so everyone without a photo gets their own, stable colour from the theme."
			>
				<Example
					code={`<Avatar variant="art" fallback="MO" alt="Mara Okafor" />
<Avatar variant="art" fallback="SR" alt="Sam Rivera" />
<Avatar variant="art" fallback="JA" alt="Juno Avery" />`}
				>
					<div className="flex flex-wrap items-center gap-3">
						{[
							["MO", "Mara Okafor"],
							["SR", "Sam Rivera"],
							["JA", "Juno Avery"],
							["LP", "Lee Park"],
							["AB", "Ada Brooks"],
						].map(([initials, name]) => (
							<Avatar key={name} variant="art" fallback={initials} alt={name} size="lg" />
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Broken image"
				description="A photo that fails to load falls back to initials."
			>
				<Example code='<Avatar src="/missing.png" alt="Missing" fallback="MX" />'>
					<Avatar src="/does-not-exist.png" alt="Missing" fallback="MX" />
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="2xs and xs for compact workspace rows: 20 and 24px. sm, md and lg for rows: 32, 40 and 48px. xl (96px) and 2xl (160px) are portraits — a profile header, an artist hero, a roster tile. The initials and a status dot scale with them."
			>
				<Example
					code={`<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="2xs" />
<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="xs" />
<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="sm" />
<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="md" />
<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="lg" />
<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="xl" />
<Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" size="2xl" />`}
				>
					<div className="flex flex-wrap items-end justify-center gap-4">
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="2xs" />
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="xs" />
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="sm" />
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="md" />
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="lg" />
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="xl" />
						<Avatar src={photo("ana-chen")} alt="Ana Chen" fallback="AC" size="2xl" />
					</div>
				</Example>
			</Section>

			<Section
				title="Marks for what is not a person"
				description='shape="square" for a workspace, a project, an org or a team, so circles keep meaning people. tone paints a palette family behind the initials, one colour per project, held to contrast in every theme.'
			>
				<Example
					code={`<Avatar shape="square" tone="teal" size="xs" fallback="N" alt="Northwind storefront" />
<Avatar shape="square" tone="orange" size="xs" fallback="H" alt="Harbor brand refresh" />
<Avatar shape="square" tone="purple" size="sm" fallback="L" alt="Lumen editorial" />
<Avatar shape="square" tone="blue" size="lg" fallback="FS" alt="Forma Studio" />`}
				>
					<div className="flex flex-wrap items-end justify-center gap-4">
						<Avatar shape="square" tone="teal" size="xs" fallback="N" alt="Northwind storefront" />
						<Avatar shape="square" tone="orange" size="xs" fallback="H" alt="Harbor brand refresh" />
						<Avatar shape="square" tone="purple" size="sm" fallback="L" alt="Lumen editorial" />
						<Avatar shape="square" tone="blue" size="lg" fallback="FS" alt="Forma Studio" />
					</div>
				</Example>
			</Section>

			<Section
				title="Portraits"
				description="Without a photo the portrait sizes keep the initials at about a third of the circle, and the status dot and its cut-out ring grow with it instead of shrinking to a speck."
			>
				<Example
					code={`<div className="flex flex-col items-center gap-3 text-center">
	<Avatar variant="art" size="2xl" fallback="LV" alt="Lena Vale" status={<StatusDot tone="success" />} />
	<div className="flex flex-col gap-1">
		<h1 className="text-heading-1">Lena Vale</h1>
		<p className="text-body-sm text-muted-foreground">1.2M monthly listeners</p>
	</div>
</div>`}
				>
					<div className="flex flex-wrap items-center justify-center gap-10">
						<div className="flex flex-col items-center gap-3 text-center">
							<Avatar variant="art" size="2xl" fallback="LV" alt="Lena Vale" status={<StatusDot tone="success" />} />
							<div className="flex flex-col gap-1">
								<p className="text-heading-2">Lena Vale</p>
								<p className="text-body-sm text-muted-foreground">1.2M monthly listeners</p>
							</div>
						</div>
						<div className="flex flex-col items-center gap-3 text-center">
							<Avatar variant="art" size="xl" fallback="HL" alt="Harbour Lights" status={<StatusDot tone="success" />} />
							<div className="flex flex-col gap-1">
								<p className="text-title-lg">Harbour Lights</p>
								<p className="text-body-sm text-muted-foreground">Following</p>
							</div>
						</div>
						<Avatar size="xl" fallback="JT" alt="June Tamsin" />
					</div>
				</Example>
			</Section>

			<Section
				title="With status"
				description="A presence dot on the bottom edge, ringed in the surface colour so it reads as a cut-out."
			>
				<Example
					code={`<Entity
  leading={<Avatar src="/media/avatars/nova-reed.jpg" alt="Nova Reed" fallback="NR" status={<StatusDot tone="success" />} />}
  title="Nova Reed"
  subtitle="Online"
/>`}
				>
					<Entity
						leading={<Avatar src={photo("nova-reed")} alt="Nova Reed" fallback="NR" status={<StatusDot tone="success" />} />}
						title="Nova Reed"
						subtitle="Online"
					/>
				</Example>
			</Section>

			<Section
				title="Group"
				description="Overlap a few people and fold the rest into a count. Set the surface so the ring matches what the group sits on."
			>
				<Example
					code={`<AvatarGroup aria-label="7 collaborators" max={3}>
  <Avatar src="/media/avatars/alex-morgan.jpg" alt="Alex Morgan" fallback="AM" />
  <Avatar src="/media/avatars/mo-ortiz.jpg" alt="Mo Ortiz" fallback="MO" />
  <Avatar src="/media/avatars/sam-reyes.jpg" alt="Sam Reyes" fallback="SR" />
  <Avatar src="/media/avatars/jo-lund.jpg" alt="Jo Lund" fallback="JL" />
  <Avatar src="/media/avatars/ari-kim.jpg" alt="Ari Kim" fallback="AK" />
  <Avatar src="/media/avatars/nova-reed.jpg" alt="Nova Reed" fallback="NR" />
  <Avatar src="/media/avatars/ana-chen.jpg" alt="Ana Chen" fallback="AC" />
</AvatarGroup>

<Card>
  <CardContent>
    <AvatarGroup aria-label="12 attendees" total={12} size="sm" surface="card">
      <Avatar src="/media/avatars/kofi-mensah.jpg" alt="Kofi Mensah" fallback="KM" />
      <Avatar src="/media/avatars/amira-haddad.jpg" alt="Amira Haddad" fallback="AH" />
      <Avatar src="/media/avatars/tala-begay.jpg" alt="Tala Begay" fallback="TB" />
    </AvatarGroup>
  </CardContent>
</Card>`}
				>
					<AvatarGroup aria-label="7 collaborators" max={3}>
						{GROUP.map(([name, label, initials]) => (
							<Avatar key={name} src={photo(name)} alt={label} fallback={initials} />
						))}
					</AvatarGroup>
					<Card>
						<CardContent>
							<AvatarGroup aria-label="12 attendees" total={12} size="sm" surface="card">
								{ATTENDEES.map(([name, label, initials]) => (
									<Avatar key={name} src={photo(name)} alt={label} fallback={initials} />
								))}
							</AvatarGroup>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={avatarMeta} />
		</>
	)
}
