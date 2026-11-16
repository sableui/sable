import { Avatar, Button, Entity, entityMeta, Icon, StatusDot } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function EntityPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Entity" lede={ledeFor(entityMeta)} />

			<ComponentPlayground meta={entityMeta} />

			<Section
				title="Basic"
				description="An avatar, a name and a short detail, with an action at the end."
			>
				<Example>
					<div className="w-full max-w-md">
						<Entity
							leading={<Avatar fallback="AM" alt="Alex Morgan" />}
							title="Alex Morgan"
							subtitle="@alex"
							action={
								<Button variant="ghost" size="icon" aria-label="More actions">
									<Icon name="ellipsis" className="text-base" />
								</Button>
							}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="List"
				description="Rows stack on their own, with no dividers needed."
			>
				<Example>
					<div className="flex w-full max-w-md flex-col">
						<Entity
							leading={<Avatar fallback="AL" alt="Ada Lovelace" />}
							title="Ada Lovelace"
							subtitle="Online"
							action={<StatusDot tone="3" />}
						/>
						<Entity
							leading={<Avatar fallback="GH" alt="Grace Hopper" />}
							title="Grace Hopper"
							subtitle="@grace"
							action={
								<Button variant="ghost" size="sm">
									Follow
								</Button>
							}
						/>
						<Entity
							leading={<Avatar fallback="AT" alt="Alan Turing" />}
							title="Alan Turing"
							subtitle="Last seen 2h ago"
							action={
								<Button variant="ghost" size="icon" aria-label="More actions">
									<Icon name="ellipsis" className="text-base" />
								</Button>
							}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="Rows that navigate"
				description="In a list–detail view each row is a link. Pass interactive with render set to your router's link (an <a> here): the whole row is the target, the open record announces as the current page, and the trailing action stays its own control."
			>
				<Example>
					<div className="flex w-full max-w-md flex-col">
						<Entity
							interactive
							selected
							render={<a href="#people-ada-lovelace" />}
							leading={<Avatar fallback="AL" alt="" />}
							title="Ada Lovelace"
							subtitle="Engineering"
							action={
								<Button variant="ghost" size="icon" aria-label="More actions for Ada Lovelace">
									<Icon name="ellipsis" className="text-base" />
								</Button>
							}
						/>
						<Entity
							interactive
							render={<a href="#grace" />}
							leading={<Avatar fallback="GH" alt="" />}
							title="Grace Hopper"
							subtitle="Research"
							action={
								<Button variant="ghost" size="icon" aria-label="More actions for Grace Hopper">
									<Icon name="ellipsis" className="text-base" />
								</Button>
							}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="Truncation"
				description="Long text truncates so the action stays in place."
			>
				<Example>
					<div className="w-full max-w-72">
						<Entity
							leading={<Avatar fallback="LR" alt="Long record" />}
							title="A remarkably long display name that will not fit"
							subtitle="@an-equally-verbose-handle-that-overflows"
							action={
								<Button variant="ghost" size="icon" aria-label="More actions">
									<Icon name="ellipsis" className="text-base" />
								</Button>
							}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="Icon, no action"
				description="For things that aren't people, lead with an icon. The action is optional."
			>
				<Example>
					<div className="w-full max-w-md">
						<Entity
							leading={<Icon name="gear" className="text-lg text-muted-foreground" />}
							title="Settings"
							subtitle="Theme, notifications, account"
						/>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={entityMeta} />
		</>
	)
}
