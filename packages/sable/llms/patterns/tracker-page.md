# TrackerPage

Records workspace in the tool register: a Sidebar rail of grouped views ending in an account menu, a WorkspaceBar of Breadcrumbs over pill Tabs, a filter row, one grouped DataTable, and a docked inspector of PanelSection property rows with a pinned comment form. Below lg the rail and the inspector become sheets and a BottomNav takes the last row.

**Intent:** Reach for this when a team works through records in a dense tool — an issue tracker, a support queue, a pipeline: a grouped list, a docked inspector for the selected record, and a rail of views. For records a person reads and edits one at a time on a page, ListDetailPage is the page-register shape; for monitoring with headline numbers, DashboardPage.

## Notes

- Workspace sets the compact density for everything inside: 32px rail rows, 28px tables, 24px property fields. Nothing in the pattern sizes a control or a row by hand. The Overview tab is a reading view, so it sits in `<Density value="comfortable">` and its prose gets page type back.
- The rail is Sable's own parts on one grid: SidebarBrand, SidebarGroup, SidebarItem and SidebarAccount share the icon and label columns. The account row is the trigger of the account Menu, which holds Settings, an Appearance submenu wired to useSableTheme (light, dark, system) and Sign out. No Settings button or badge sits in the footer.
- There is no Workspace `toolbar`: the bars belong to the list column, so the inspector runs the full height beside them. The first WorkspaceBar carries Breadcrumbs; the second carries pill Tabs, a view switch in chrome, which sits beside the bar's other controls rather than drawing a rule.
- One DataTable groups the rows (`groupBy`, `groups`): one header for every group, a StatusDot, a count and an add action per group header, and Done starting closed. The segmented ToggleGroup switches the grouping between status and assignee. Filtering to nothing swaps the table for an EmptyState with a Clear filters action.
- Workflow states map onto StatusDot tones once (`STATUSES`), so group headers and the status Select read from one place. A product with a richer status glyph keeps that one mapping and swaps the icon.
- The inspector is a Panel with `narrow="sheet"`: docked at 320px from lg, a right sheet below it, its content rendered once. Below lg it opens only when a row is picked (`inspecting`), so a phone never loads with a sheet over the list. Properties are PanelSection + PropertyRow with xs Select triggers and an xs DatePicker; Activity uses RelativeTime; the comment Form is pinned under the scrolling body.
- The rail is a Panel with `narrow="sheet" side="left"`, opened from a `lg:hidden` menu button in the first bar; in the sheet the Sidebar fills its width. Workspace `bottomNav` reserves the BottomNav's row below lg, so the status bar ends above it.

## Accessibility

- Workspace renders a skip link to the canvas (`Skip to issues`) and WorkspaceCanvas is the main landmark; the rail and the inspector are labelled complementary regions (`Workspace navigation`, `Issue details`), and as sheets they keep those labels as their dialog titles.
- The page has one level-1 heading (visually hidden; the breadcrumb shows the place) and the inspector's title is a level-2 heading.
- Group header rows are real buttons with aria-expanded; rows open the inspector from the keyboard (DataTable's row activation). Every icon-only action has an accessible name and a tooltip.
- Each SidebarGroup is a named group; the account row names the person, and its menu is a standard Menu with a radio group for the colour mode.

## Source

```tsx
import { useState } from "react"
import { Avatar, Badge, BottomNav, BottomNavItem, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, Breadcrumbs, BreadcrumbSeparator, Button, DataTable, DatePicker, Density, EmptyState, Form, Icon, Kbd, Menu, MenuContent, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuSubmenu, MenuSubmenuTrigger, MenuTrigger, Panel, PanelGroup, PanelSection, PropertyRow, RelativeTime, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, Sidebar, SidebarAccount, SidebarBrand, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem, SidebarNav, SimpleTooltip, StatusBar, StatusBarGroup, StatusDot, Tabs, TabsList, TabsPanel, TabsTrigger, Textarea, Toggle, ToggleGroup, useBelowBreakpoint, useSableTheme, Workspace, WorkspaceBar, WorkspaceCanvas, type DataTableColumn } from "@sableui/react"

// Workflow states → StatusDot tones, mapped once here so every group header,
// row and select follows. Sable has no status vocabulary of its own.
const STATUSES = [
	{ key: "progress", label: "In progress", tone: "warning" },
	{ key: "review", label: "In review", tone: "2" },
	{ key: "todo", label: "Todo", tone: "neutral" },
	{ key: "done", label: "Done", tone: "success" },
] as const
type Status = (typeof STATUSES)[number]["key"]

const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const
type Priority = (typeof PRIORITIES)[number]

const people: Record<string, string> = {
	AK: "Ama Kusi",
	JR: "Jonas Reiter",
	LM: "Lena Moreau",
	TO: "Tomás Ortega",
}

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const isoDay = (offset: number) => {
	const d = new Date(Date.now() + offset)
	return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

type Note = { id: string; who: string; text: string; at: number }
type Issue = {
	id: string
	title: string
	detail: string
	status: Status
	priority: Priority
	assignee: string
	label: string
	due: Date
	notes: Note[]
}

const initialIssues: Issue[] = [
	{ id: "FW-104", title: "Sync offline edits when the app reconnects", detail: "Edits made offline are queued but replayed out of order after a reconnect. Replay them by timestamp and surface conflicts.", status: "progress", priority: "Urgent", assignee: "AK", label: "Sync", due: isoDay(2 * DAY), notes: [{ id: "n1", who: "JR", text: "Repro steps are in the test plan. It only happens after a cold start.", at: -3 * HOUR }] },
	{ id: "FW-105", title: "Onboarding checklist on first launch", detail: "Three steps: connect a calendar, invite a teammate, create a first project.", status: "progress", priority: "Medium", assignee: "LM", label: "Onboarding", due: isoDay(5 * DAY), notes: [] },
	{ id: "FW-108", title: "Push notification settings per project", detail: "Let people mute a project without muting the workspace.", status: "review", priority: "High", assignee: "TO", label: "Notifications", due: isoDay(1 * DAY), notes: [] },
	{ id: "FW-110", title: "Crash when attaching a large photo", detail: "Photos over 20 MB crash the uploader on older devices.", status: "review", priority: "Urgent", assignee: "JR", label: "Bug", due: isoDay(-1 * DAY), notes: [] },
	{ id: "FW-112", title: "Search across archived projects", detail: "Archived projects are left out of search today.", status: "todo", priority: "Low", assignee: "AK", label: "Search", due: isoDay(9 * DAY), notes: [] },
	{ id: "FW-113", title: "Keyboard shortcuts for the board view", detail: "J and K move between cards; C creates an issue in the focused column.", status: "todo", priority: "Medium", assignee: "LM", label: "Board", due: isoDay(12 * DAY), notes: [] },
	{ id: "FW-114", title: "Export a project as CSV", detail: "One row per issue, with status, assignee and dates.", status: "todo", priority: "Low", assignee: "TO", label: "Export", due: isoDay(14 * DAY), notes: [] },
	{ id: "FW-101", title: "Dark mode for the widget", detail: "The home-screen widget ignores the system appearance.", status: "done", priority: "Medium", assignee: "JR", label: "Widget", due: isoDay(-4 * DAY), notes: [] },
]

const MODE_LABEL = { light: "Light", dark: "Dark", system: "System" } as const

/** One icon-only action with a visible name on hover and focus. */
export function TrackerPage() {
	const [issues, setIssues] = useState(initialIssues)
	const [selectedId, setSelectedId] = useState<string | null>("FW-104")
	// Below lg the inspector is a sheet; it opens only when someone picks a row,
	// so a phone does not load with a sheet over the list.
	const [inspecting, setInspecting] = useState(false)
	const [navOpen, setNavOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [priority, setPriority] = useState<"all" | Priority>("all")
	const [groupBy, setGroupBy] = useState<"status" | "assignee">("status")
	const [tab, setTab] = useState("issues")
	const [draft, setDraft] = useState("")
	const narrow = useBelowBreakpoint("lg")
	const { preference, setPreference } = useSableTheme()

	const needle = query.trim().toLowerCase()
	const visible = issues.filter(
		(i) =>
			(priority === "all" || i.priority === priority) &&
			`${i.id} ${i.title} ${i.label}`.toLowerCase().includes(needle),
	)
	const selected = issues.find((i) => i.id === selectedId) ?? null
	const done = issues.filter((i) => i.status === "done").length

	function update(id: string, patch: Partial<Issue>) {
		setIssues((all) => all.map((i) => (i.id === id ? { ...i, ...patch } : i)))
	}
	function open(id: string) {
		setSelectedId(id)
		setInspecting(true)
	}
	function close() {
		setInspecting(false)
		if (!narrow) setSelectedId(null)
	}
	function addIssue(status: Status = "todo") {
		const id = `FW-${115 + issues.length}`
		setIssues((all) => [
			...all,
			{ id, title: "New issue", detail: "", status, priority: "Medium", assignee: "AK", label: "Triage", due: isoDay(7 * DAY), notes: [] },
		])
		open(id)
	}
	function addNote() {
		if (!selected || !draft.trim()) return
		update(selected.id, { notes: [...selected.notes, { id: `n${Date.now()}`, who: "AK", text: draft.trim(), at: 0 }] })
		setDraft("")
	}

	const columns: DataTableColumn<Issue>[] = [
		{ key: "id", header: "ID", className: "w-20 whitespace-nowrap", cell: (i) => <span className="text-ui-num text-muted-foreground">{i.id}</span> },
		{ key: "title", header: "Issue", className: "w-full max-w-0", cell: (i) => <span className="block truncate">{i.title}</span> },
		{ key: "label", header: "Label", className: "w-28 max-sm:hidden", cell: (i) => <Badge appearance="outline" size="sm">{i.label}</Badge> },
		{ key: "due", header: "Due", className: "w-20 whitespace-nowrap max-sm:hidden", sortValue: (i) => i.due.getTime(), cell: (i) => <span className="text-muted-foreground">{i.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span> },
		{ key: "assignee", header: <span className="sr-only">Assignee</span>, className: "w-10", cell: (i) => <Avatar size="2xs" fallback={i.assignee} alt={people[i.assignee]} /> },
	]

	const groups =
		groupBy === "status"
			? STATUSES.map((s) => ({
					key: s.key,
					label: s.label,
					icon: <StatusDot tone={s.tone} />,
					action: <SimpleTooltip content={`Add to ${s.label}`}><Button size="icon-xs" variant="ghost" aria-label={`Add to ${s.label}`} onClick={() => addIssue(s.key)}><Icon name="plus" /></Button></SimpleTooltip>,
					defaultExpanded: s.key !== "done",
				}))
			: Object.entries(people).map(([key, name]) => ({
					key,
					label: name,
					icon: <Avatar size="2xs" fallback={key} alt="" />,
				}))

	const sidebar = (
		<Sidebar variant="inline" className="h-full w-full">
			<SidebarHeader>
				<SidebarBrand mark={<Avatar shape="square" size="2xs" tone="teal" fallback="F" alt="" />} label="Fieldwork" />
				<Button variant="outline" size="sm" className="basis-full justify-between">
					<span className="flex items-center gap-2">
						<Icon name="search" />
						Search
					</span>
					<Kbd>Ctrl K</Kbd>
				</Button>
			</SidebarHeader>
			<SidebarNav aria-label="Workspace">
				<SidebarItem icon={<Icon name="inbox" />} label="Inbox" badge={<span className="text-ui-num text-muted-foreground">3</span>} />
				<SidebarItem icon={<Icon name="circle-check" />} label="My issues" />
				<SidebarGroup label="Mobile app">
					<SidebarItem icon={<Icon name="layers" />} label="Issues" active />
					<SidebarItem icon={<Icon name="refresh" />} label="Cycles" />
					<SidebarItem icon={<Icon name="archive" />} label="Backlog" />
				</SidebarGroup>
				<SidebarGroup label="Workspace">
					<SidebarItem icon={<Icon name="folder" />} label="Projects" />
					<SidebarItem icon={<Icon name="users" />} label="Members" />
				</SidebarGroup>
			</SidebarNav>
			<SidebarFooter>
				<Menu>
					<MenuTrigger
						render={<SidebarAccount avatar={<Avatar size="2xs" fallback="AK" alt="" />} label="Ama Kusi" detail="Fieldwork · Admin" />}
					/>
					<MenuContent side="top" align="start">
						<MenuItem icon={<Icon name="gear" />}>Settings</MenuItem>
						<MenuSubmenu>
							<MenuSubmenuTrigger
								icon={<Icon name={preference === "dark" ? "moon" : preference === "light" ? "sun" : "desktop"} />}
								value={MODE_LABEL[preference]}
							>
								Appearance
							</MenuSubmenuTrigger>
							<MenuContent side="inline-end">
								<MenuRadioGroup value={preference} onValueChange={(v) => setPreference(v as typeof preference)}>
									<MenuRadioItem value="light">Light</MenuRadioItem>
									<MenuRadioItem value="dark">Dark</MenuRadioItem>
									<MenuRadioItem value="system">System</MenuRadioItem>
								</MenuRadioGroup>
							</MenuContent>
						</MenuSubmenu>
						<MenuSeparator />
						<MenuItem icon={<Icon name="logout" />}>Sign out</MenuItem>
					</MenuContent>
				</Menu>
			</SidebarFooter>
		</Sidebar>
	)

	const list =
		visible.length === 0 ? (
			<EmptyState
				icon={<Icon name="search" />}
				title="No issues match"
				description="Try another search, or clear the priority filter."
				action={
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setQuery("")
							setPriority("all")
						}}
					>
						Clear filters
					</Button>
				}
			/>
		) : (
			<DataTable
				columns={columns}
				data={visible}
				rowKey={(i) => i.id}
				groupBy={(i) => (groupBy === "status" ? i.status : i.assignee)}
				groups={groups}
				onRowClick={(i) => open(i.id)}
				// A phone shows the selection only while its sheet is open.
				isRowSelected={(i) => i.id === selectedId && (!narrow || inspecting)}
			/>
		)

	const inspector = selected ? (
		<div className="flex h-full min-h-0 flex-col">
			<WorkspaceBar className="justify-between">
				<span className="text-ui-num text-muted-foreground">{selected.id}</span>
				<SimpleTooltip content="Close issue"><Button size="icon-xs" variant="ghost" aria-label="Close issue" onClick={close}><Icon name="xmark" /></Button></SimpleTooltip>
			</WorkspaceBar>
			<div className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">
				<div className="flex flex-col gap-2 px-2 pt-4 pb-3">
					<h2 className="text-title-lg">{selected.title}</h2>
					<p className="text-ui-body text-muted-foreground">{selected.detail || "Add the details the team needs."}</p>
				</div>
				<PanelSection title="Properties">
					<PropertyRow label="Status">
						<Select value={selected.status} items={STATUSES.map((s) => ({ value: s.key, label: s.label }))} onValueChange={(v) => v && update(selected.id, { status: v as Status })}>
							<SelectTrigger size="xs" aria-label="Status" />
							<SelectContent>
								{STATUSES.map((s) => (
									<SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</PropertyRow>
					<PropertyRow label="Priority">
						<Select value={selected.priority} onValueChange={(v) => v && update(selected.id, { priority: v as Priority })}>
							<SelectTrigger size="xs" aria-label="Priority" />
							<SelectContent>
								{PRIORITIES.map((p) => (
									<SelectItem key={p} value={p}>{p}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</PropertyRow>
					<PropertyRow label="Assignee">
						<Select value={selected.assignee} items={people} onValueChange={(v) => v && update(selected.id, { assignee: v })}>
							<SelectTrigger size="xs" aria-label="Assignee" />
							<SelectContent>
								{Object.entries(people).map(([key, name]) => (
									<SelectItem key={key} value={key}>{name}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</PropertyRow>
					<PropertyRow label="Due date">
						<DatePicker
							size="xs"
							aria-label="Due date"
							value={selected.due}
							formatOptions={{ month: "short", day: "numeric", year: "numeric" }}
							onValueChange={(d) => d && update(selected.id, { due: d })}
						/>
					</PropertyRow>
				</PanelSection>
				<PanelSection title="Activity">
					<div className="flex flex-col gap-3 pb-4">
						<div className="flex items-center gap-2 text-ui-sm text-muted-foreground">
							<Icon name="plus" />
							<span>Created in Mobile app</span>
						</div>
						{selected.notes.map((n) => (
							<div key={n.id} className="flex items-start gap-2">
								<Avatar size="2xs" fallback={n.who} alt="" />
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-ui-md">{people[n.who]}</span>
										<RelativeTime date={new Date(Date.now() + n.at)} className="text-ui-sm text-muted-foreground" />
									</div>
									<p className="mt-1 text-ui-body">{n.text}</p>
								</div>
							</div>
						))}
					</div>
				</PanelSection>
			</div>
			<Form
				className="flex shrink-0 flex-col gap-2 border-t border-hairline p-2"
				onSubmit={(e) => {
					e.preventDefault()
					addNote()
				}}
			>
				<Textarea aria-label="Add a comment" placeholder="Leave a comment…" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} />
				<Button size="xs" variant="secondary" type="submit" className="self-end" disabled={!draft.trim()} iconStart={<Icon name="arrow-up" />}>
					Comment
				</Button>
			</Form>
		</div>
	) : null

	return (
		<Workspace
			skipLinkLabel="Skip to issues"
			statusBar={
				<StatusBar>
					<span className="flex items-center gap-2">
						<StatusDot tone="success" size="sm" />
						Saved
					</span>
					<span className="max-sm:hidden">
						{issues.length} issues · {done} done
					</span>
					<StatusBarGroup align="end">
						<span className="max-sm:hidden">Ctrl K to search</span>
					</StatusBarGroup>
				</StatusBar>
			}
			bottomNav={
				<BottomNav aria-label="Primary">
					<BottomNavItem icon={<Icon name="inbox" />} label="Inbox" showLabel />
					<BottomNavItem icon={<Icon name="layers" />} label="Issues" showLabel active />
					<BottomNavItem icon={<Icon name="folder" />} label="Projects" showLabel />
					<BottomNavItem icon={<Icon name="users" />} label="Members" showLabel />
				</BottomNav>
			}
		>
			<PanelGroup>
				{/* Docked from lg; below it the same rail is a left sheet. */}
				<Panel label="Workspace navigation" width={232} narrow="sheet" side="left" open={narrow ? navOpen : true} onOpenChange={setNavOpen} scroll={false}>
					{sidebar}
				</Panel>
				<WorkspaceCanvas className="flex flex-col">
					<WorkspaceBar className="gap-2 px-3">
						<span className="lg:hidden">
							<SimpleTooltip content="Open navigation"><Button size="icon-xs" variant="ghost" aria-label="Open navigation" onClick={() => setNavOpen(true)}><Icon name="bars" /></Button></SimpleTooltip>
						</span>
						<h1 className="sr-only">Mobile app issues</h1>
						<Breadcrumbs className="min-w-0">
							<BreadcrumbItem className="max-sm:hidden">
								<BreadcrumbLink href="#">Fieldwork</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="max-sm:hidden" />
							<BreadcrumbItem>
								<BreadcrumbPage>Mobile app</BreadcrumbPage>
							</BreadcrumbItem>
						</Breadcrumbs>
					</WorkspaceBar>
					<Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="flex min-h-0 flex-1 flex-col">
						{/* A view switch in tool chrome: pill, beside the bar's other controls. */}
						<WorkspaceBar className="px-3">
							<TabsList variant="pill">
								<TabsTrigger value="issues">
									Issues <span className="text-ui-num text-muted-foreground">{issues.length}</span>
								</TabsTrigger>
								<TabsTrigger value="overview">Overview</TabsTrigger>
							</TabsList>
						</WorkspaceBar>
						<TabsPanel value="issues" className="flex min-h-0 flex-1 flex-col">
							<div className="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2">
								<Menu>
									<MenuTrigger render={<Button variant="ghost" size="xs" iconStart={<Icon name="filter" />}>{priority === "all" ? "Filter" : priority}</Button>} />
									<MenuContent>
										<MenuRadioGroup value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
											<MenuRadioItem value="all">All priorities</MenuRadioItem>
											{PRIORITIES.map((p) => (
												<MenuRadioItem key={p} value={p}>{p}</MenuRadioItem>
											))}
										</MenuRadioGroup>
									</MenuContent>
								</Menu>
								<SearchInput size="xs" value={query} onValueChange={setQuery} placeholder="Find issue…" aria-label="Find issue" className="w-40" />
								<ToggleGroup appearance="segmented" value={[groupBy]} onValueChange={(v) => v[0] && setGroupBy(v[0] as typeof groupBy)} aria-label="Group by" className="ms-auto">
									<Toggle value="status">Status</Toggle>
									<Toggle value="assignee">Assignee</Toggle>
								</ToggleGroup>
								<Button size="xs" iconStart={<Icon name="plus" />} onClick={() => addIssue()}>
									New issue
								</Button>
							</div>
							<div className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">{list}</div>
						</TabsPanel>
						<TabsPanel value="overview" className="flex min-h-0 flex-1 flex-col">
							{/* A reading view: page type comes back inside the compact workspace. */}
							<Density value="comfortable" className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">
								<article className="flex max-w-prose flex-col gap-4 p-8 max-sm:p-5">
									<h2 className="text-heading-3">Mobile app</h2>
									<p className="text-body-md text-muted-foreground">
										The phone app for field teams: capture work on site, sync it when the signal comes back, and hand it to the office without retyping anything.
									</p>
									<dl className="sable-list-dl">
										<dt>Lead</dt>
										<dd>{people.AK}</dd>
										<dt>Open issues</dt>
										<dd>{issues.length - done}</dd>
										<dt>Target</dt>
										<dd>{isoDay(30 * DAY).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</dd>
									</dl>
								</article>
							</Density>
						</TabsPanel>
					</Tabs>
				</WorkspaceCanvas>
				{/* Docked beside the list from lg; a sheet below it. Its content renders once. */}
				<Panel
					label="Issue details"
					width={320}
					narrow="sheet"
					open={narrow ? inspecting && selected !== null : selected !== null}
					onOpenChange={(next) => !next && close()}
					scroll={false}
					className="border-s border-hairline"
				>
					{inspector}
				</Panel>
			</PanelGroup>
		</Workspace>
	)
}
```
