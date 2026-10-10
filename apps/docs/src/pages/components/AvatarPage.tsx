import { Avatar, AvatarGroup, Card, CardContent, Entity, StatusDot, avatarMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const PFP = "/media/avatar-example.svg"

export function AvatarPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Avatar" lede={ledeFor(avatarMeta)} />

			<ComponentPlayground meta={avatarMeta} />

			<Section
				title="With image"
				description="Initials show while the photo loads, or if it's missing."
			>
				<Example code='<Avatar src={pfp} alt="Alex Morgan" fallback="AM" />'>
					<Avatar src={PFP} alt="Alex Morgan" fallback="AM" />
				</Example>
			</Section>

			<Section title="Fallback only">
				<Example code='<Avatar fallback="AM" alt="Alex Morgan" />'>
					<Avatar fallback="AM" alt="Alex Morgan" />
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

			<Section title="Sizes">
				<Example
					code={`<Avatar src={pfp} alt="Alex Morgan" fallback="AM" size="sm" />
<Avatar src={pfp} alt="Alex Morgan" fallback="AM" size="md" />
<Avatar src={pfp} alt="Alex Morgan" fallback="AM" size="lg" />`}
				>
					<Avatar src={PFP} alt="Alex Morgan" fallback="AM" size="sm" />
					<Avatar src={PFP} alt="Alex Morgan" fallback="AM" size="md" />
					<Avatar src={PFP} alt="Alex Morgan" fallback="AM" size="lg" />
				</Example>
			</Section>

			<Section
				title="With status"
				description="A presence dot on the bottom edge, ringed in the surface colour so it reads as a cut-out."
			>
				<Example
					code={`<Entity
  leading={<Avatar src={pfp} alt="Nova Reed" fallback="NR" status={<StatusDot tone="success" />} />}
  title="Nova Reed"
  subtitle="Online"
/>`}
				>
					<Entity
						leading={<Avatar src={PFP} alt="Nova Reed" fallback="NR" status={<StatusDot tone="success" />} />}
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
  <Avatar src={pfp} alt="Alex Morgan" fallback="AM" />
  <Avatar fallback="MO" alt="Mo Ortiz" />
  <Avatar fallback="SR" alt="Sam Reyes" />
  <Avatar fallback="JL" alt="Jo Lund" />
  <Avatar fallback="AK" alt="Ari Kim" />
  <Avatar fallback="NR" alt="Nova Reed" />
  <Avatar fallback="AC" alt="Ana Chen" />
</AvatarGroup>

<Card>
  <CardContent>
    <AvatarGroup aria-label="12 attendees" total={12} size="sm" surface="card">
      <Avatar fallback="MO" alt="Mo Ortiz" />
      <Avatar fallback="SR" alt="Sam Reyes" />
      <Avatar fallback="JL" alt="Jo Lund" />
    </AvatarGroup>
  </CardContent>
</Card>`}
				>
					<AvatarGroup aria-label="7 collaborators" max={3}>
						<Avatar src={PFP} alt="Alex Morgan" fallback="AM" />
						<Avatar fallback="MO" alt="Mo Ortiz" />
						<Avatar fallback="SR" alt="Sam Reyes" />
						<Avatar fallback="JL" alt="Jo Lund" />
						<Avatar fallback="AK" alt="Ari Kim" />
						<Avatar fallback="NR" alt="Nova Reed" />
						<Avatar fallback="AC" alt="Ana Chen" />
					</AvatarGroup>
					<Card>
						<CardContent>
							<AvatarGroup aria-label="12 attendees" total={12} size="sm" surface="card">
								<Avatar fallback="MO" alt="Mo Ortiz" />
								<Avatar fallback="SR" alt="Sam Reyes" />
								<Avatar fallback="JL" alt="Jo Lund" />
							</AvatarGroup>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={avatarMeta} />
		</>
	)
}
