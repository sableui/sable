import {
	Icon,
	SideNav,
	SideNavGroup,
	SideNavItem,
	sideNavMeta,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

// Rows sit 8px (p-2) inside a rounded-lg frame, so each takes the frame's
// radius minus that inset — concentric at every radius setting.
const ROW = "rounded-concentric-lg/2"

export function SideNavPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Side Nav" lede={ledeFor(sideNavMeta)} />

			<Section
				title="Settings sub-nav"
				description="A light vertical nav that lives inside the page, not the app sidebar."
			>
				<Example
					code={`<div className="w-full max-w-xs rounded-lg border border-border p-2">
  <SideNav aria-label="Settings">
    <SideNavItem icon={<Icon name="user" />} label="Profile" active className="rounded-concentric-lg/2" />
    <SideNavItem icon={<Icon name="lock" />} label="Security" className="rounded-concentric-lg/2" />
    <SideNavItem icon={<Icon name="bell" />} label="Notifications" className="rounded-concentric-lg/2" />
  </SideNav>
</div>`}
				>
					<div className="w-full max-w-xs rounded-lg border border-border p-2">
						<SideNav aria-label="Settings">
							<SideNavItem icon={<Icon name="user" />} label="Profile" active className={ROW} />
							<SideNavItem icon={<Icon name="lock" />} label="Security" className={ROW} />
							<SideNavItem icon={<Icon name="bell" />} label="Notifications" className={ROW} />
						</SideNav>
					</div>
				</Example>
			</Section>

			<Section
				title="Grouped"
				description="Labelled sections, typical for settings."
			>
				<Example
					code={`<div className="w-full max-w-xs rounded-lg border border-border p-2">
  <SideNav aria-label="Settings sections">
    <SideNavGroup label="Account">
      <SideNavItem label="Profile" active className="rounded-concentric-lg/2" />
      <SideNavItem label="Security" className="rounded-concentric-lg/2" />
    </SideNavGroup>
    <SideNavGroup label="Workspace">
      <SideNavItem label="Members" className="rounded-concentric-lg/2" />
      <SideNavItem label="Billing" className="rounded-concentric-lg/2" />
    </SideNavGroup>
  </SideNav>
</div>`}
				>
					<div className="w-full max-w-xs rounded-lg border border-border p-2">
						<SideNav aria-label="Settings sections">
							<SideNavGroup label="Account">
								<SideNavItem label="Profile" active className={ROW} />
								<SideNavItem label="Security" className={ROW} />
							</SideNavGroup>
							<SideNavGroup label="Workspace">
								<SideNavItem label="Members" className={ROW} />
								<SideNavItem label="Billing" className={ROW} />
							</SideNavGroup>
						</SideNav>
					</div>
				</Example>
			</Section>

			<Section
				title="Inside sidebar chrome"
				description="Larger rows and the sidebar's active style when it sits in app chrome."
			>
				<Example
					code={`<div className="w-full max-w-xs rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
  <SideNav size="lg" activeVariant="sidebar" aria-label="Workspace">
    <SideNavItem icon={<Icon name="grid" />} label="Overview" active className="rounded-concentric-lg/2" />
    <SideNavItem icon={<Icon name="component" />} label="Components" className="rounded-concentric-lg/2" />
    <SideNavItem icon={<Icon name="gear" />} label="Settings" className="rounded-concentric-lg/2" />
  </SideNav>
</div>`}
				>
					<div className="w-full max-w-xs rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground">
						<SideNav size="lg" activeVariant="sidebar" aria-label="Workspace">
							<SideNavItem icon={<Icon name="grid" />} label="Overview" active className={ROW} />
							<SideNavItem icon={<Icon name="component" />} label="Components" className={ROW} />
							<SideNavItem icon={<Icon name="gear" />} label="Settings" className={ROW} />
						</SideNav>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={sideNavMeta} />
		</>
	)
}
