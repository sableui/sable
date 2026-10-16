import type { ComponentMeta } from "../../lib/meta"

export const toolbarMeta: ComponentMeta = {
	name: "Toolbar",
	summary:
		"A row or column of controls that is one tab stop, with arrow-key movement between its items (role=\"toolbar\"), over Base UI Toolbar. Items reuse Button's ghost variants and Input, so they follow density like every other control.",
	status: "stable",
	keywords: [
		"toolbar",
		"action bar",
		"button row",
		"icon buttons",
		"formatting bar",
		"roving focus",
		"arrow keys",
		"tool chrome",
		"editor toolbar",
	],
	usage: {
		description:
			"Use Toolbar when three or more related controls sit together and act on the same thing — a text selection, a canvas, a document, a table. Tab lands on the toolbar once and the arrow keys move along it, so a keyboard user crosses an editor's twelve buttons in one keystroke instead of twelve. It works in both registers: ghost sm buttons on a page, compact icon-xs buttons inside a Workspace.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Give every Toolbar an aria-label that names what it acts on (\"Text formatting\", \"Canvas\"). With more than one toolbar on screen, that label is the only way a screen-reader user tells them apart.",
			},
			{
				guidance: "do",
				description:
					"Use size=\"icon-sm\" (page) or size=\"icon-xs\" (workspace) with an aria-label for icon-only ToolbarButtons, and keep one size across the row so the controls line up.",
			},
			{
				guidance: "do",
				description:
					"Split a long row into ToolbarGroups with a ToolbarSeparator between them — undo/redo, text style, insert. Groups give the eye the same structure the arrow keys already cross.",
			},
			{
				guidance: "do",
				description:
					"Compose triggers and toggles through ToolbarButton's render prop — render={<MenuTrigger />}, render={<PopoverTrigger />}, or render={<Toggle value=\"bold\" />} inside a ToggleGroup — so they join the toolbar's arrow-key order.",
			},
			{
				guidance: "dont",
				description:
					"Put a bare Button, Toggle or Input inside a Toolbar. It renders, but it is not a toolbar item: the arrow keys skip it and it takes its own tab stop, which is the inconsistency Toolbar exists to remove. Use ToolbarButton, ToolbarInput, or render through ToolbarButton.",
			},
			{
				guidance: "dont",
				description:
					"Wrap one or two buttons, or a dialog's Cancel/Confirm pair, in a Toolbar. Those are independent actions; arrow-key movement there is a surprise, not a shortcut. A plain row of Buttons is right.",
			},
			{
				guidance: "dont",
				description:
					"Use Toolbar for navigation between pages or views. Links that go somewhere are Tabs, SideNav or Breadcrumbs; ToolbarLink is for the odd link that sits among actions, like Help.",
				instead: ["Tabs", "SideNav", "Breadcrumbs"],
			},
			{
				guidance: "dont",
				description:
					"Give toolbar buttons primary or destructive fills by default. A toolbar is a quiet strip of tools; the ghost default keeps it from competing with the page's one primary action.",
			},
		],
		anatomy: [
			{
				name: "Toolbar",
				required: true,
				description:
					"The root (role=\"toolbar\"). Owns orientation, loopFocus and disabled for everything inside it.",
			},
			{
				name: "ToolbarButton",
				required: true,
				description:
					"An action. Button's ghost variants by default; `render` composes a menu trigger, popover trigger or Toggle into the toolbar.",
			},
			{
				name: "ToolbarGroup",
				required: false,
				description: "A run of related items. `disabled` disables the whole run.",
			},
			{
				name: "ToolbarSeparator",
				required: false,
				description: "A hairline between groups, oriented across the toolbar. Never a focus stop.",
			},
			{
				name: "ToolbarInput",
				required: false,
				description: "A compact Input that joins the arrow-key order — a search or find field in the bar.",
			},
			{
				name: "ToolbarLink",
				required: false,
				description: "An <a> styled like a ToolbarButton, for a link that sits among the actions.",
			},
		],
	},
	related: {
		components: [
			"Button",
			"Toggle",
			"Menu",
			"Popover",
			"Tooltip",
			"Workspace",
			"PanelSection",
			"Separator",
		],
	},
	props: [
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description:
				"Which arrow keys move focus (Left/Right or Up/Down) and which way the items stack. Separators turn to match.",
		},
		{
			name: "loopFocus",
			type: "boolean",
			default: "true",
			description: "Arrowing past the last item wraps to the first, and back.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description:
				"Disables every item. Items stay focusable (aria-disabled) so the row keeps its shape under the keyboard.",
		},
		{
			name: "aria-label",
			type: "string",
			description: "Names the toolbar for assistive technology. Always set it.",
		},
		{
			name: "className",
			type: "string",
			description: "Layout overrides — e.g. `flex-1` to let the toolbar fill a bar.",
		},
	],
	subcomponents: [
		{
			name: "ToolbarButton",
			type: '{ variant?: buttonVariants variant (default "ghost"); size?: buttonVariants size (default "sm"); disabled?: boolean; focusableWhenDisabled?: boolean (default true); render?: ReactElement } + Base UI Toolbar.Button props',
			description:
				"A toolbar action, styled exactly like <Button>. Disabled buttons stay focusable by default and carry aria-disabled. Pass size=\"icon-sm\"/\"icon-xs\" plus aria-label for icon-only.",
		},
		{
			name: "ToolbarLink",
			type: '{ href?: string; variant?: buttonVariants variant (default "ghost"); size?: buttonVariants size (default "sm"); render?: ReactElement } + Base UI Toolbar.Link props',
			description: "An <a> in the toolbar's arrow-key order, styled like a ToolbarButton.",
		},
		{
			name: "ToolbarInput",
			type: '{ disabled?: boolean; focusableWhenDisabled?: boolean (default true) } + Base UI Toolbar.Input / native input props',
			description:
				"Sable's Input at the sm control height (w-40 by default; override with className). Arrow keys leave the field so it does not trap the row.",
		},
		{
			name: "ToolbarGroup",
			type: '{ disabled?: boolean } + Base UI Toolbar.Group props',
			description: "Groups related items; `disabled` disables all of them.",
		},
		{
			name: "ToolbarSeparator",
			type: "Base UI Toolbar.Separator props + className",
			description:
				"A hairline-strong rule across the toolbar's axis, exposed as role=\"separator\" and skipped by the arrow keys.",
		},
	],
	variants: {
		orientation: ["horizontal", "vertical"],
		variant: ["ghost", "secondary", "outline", "primary", "destructive", "link"],
		size: ["xs", "sm", "md", "icon", "icon-sm", "icon-xs"],
	},
	tokensUsed: ["foreground", "accent", "accent-foreground", "ring", "hairline-strong", "input", "card"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Toolbar",
			why: "A toolbar is fixed chrome. It is present when its surface is; animating it in would leave the tools briefly unusable for no reason the user can see.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "ToolbarButton",
			why: "Inherited from buttonVariants: hover fill, focus ring and disabled dim ease together, so the item under the arrow keys reads as the one that moved.",
		},
		{
			slot: "response",
			recipe: "motion-press",
			part: "ToolbarButton",
			why: "Inherited from buttonVariants. Many toolbar actions change something off to the side (the canvas, the selection), so the settle on press is the confirmation that lands where the pointer is.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Toolbar",
			why: "The toolbar has no state of its own. Pressed state belongs to a Toggle rendered through ToolbarButton, which carries its own transition.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Toolbar",
			why: "A toolbar never works on its own. Pending work belongs to the surface the action targets, or to a Spinner in the button that started it.",
		},
	],
	a11y: [
		"Base UI renders role=\"toolbar\" with aria-orientation, and a roving tabindex: the toolbar is one tab stop, the arrow keys move between items, Home/End jump to the ends.",
		"Disabled items stay focusable by default and announce as disabled (aria-disabled), so arrowing along the row never silently skips a control. Set focusableWhenDisabled={false} on an item to opt out.",
		"ToolbarSeparator is role=\"separator\" with the orientation opposite the toolbar's, and is not a focus stop.",
		"ToolbarInput lets the arrow keys move the caret and only leaves the field at either end of its text.",
		"Always set aria-label on the Toolbar, and on every icon-only ToolbarButton.",
		"A Toggle rendered through ToolbarButton keeps aria-pressed; a MenuTrigger keeps aria-haspopup/aria-expanded.",
	],
	examples: [
		{
			label: "Formatting toolbar",
			code: `<Toolbar aria-label="Text formatting">
  <ToolbarGroup aria-label="History">
    <ToolbarButton size="icon-sm" aria-label="Undo">
      <Icon name="arrow-left" />
    </ToolbarButton>
    <ToolbarButton size="icon-sm" aria-label="Redo">
      <Icon name="arrow-right" />
    </ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToggleGroup multiple aria-label="Style">
    <ToolbarButton size="icon-sm" aria-label="Bold" render={<Toggle value="bold" />}>
      <Icon name="bold" />
    </ToolbarButton>
    <ToolbarButton size="icon-sm" aria-label="Italic" render={<Toggle value="italic" />}>
      <Icon name="italic" />
    </ToolbarButton>
  </ToggleGroup>
  <ToolbarSeparator />
  <ToolbarLink href="/help">Help</ToolbarLink>
</Toolbar>`,
		},
		{
			label: "With a menu trigger and a search field",
			code: `<Toolbar aria-label="Table">
  <ToolbarButton>Export</ToolbarButton>
  <Menu>
    <ToolbarButton render={<MenuTrigger />}>View</ToolbarButton>
    <MenuContent>
      <MenuItem>Compact rows</MenuItem>
      <MenuItem>Comfortable rows</MenuItem>
    </MenuContent>
  </Menu>
  <ToolbarSeparator />
  <ToolbarInput aria-label="Search rows" placeholder="Search" />
</Toolbar>`,
		},
		{
			label: "Vertical tool rail",
			code: `<Toolbar orientation="vertical" aria-label="Tools">
  <ToolbarButton size="icon-sm" aria-label="Select">
    <Icon name="arrow-up" />
  </ToolbarButton>
  <ToolbarButton size="icon-sm" aria-label="Draw">
    <Icon name="edit" />
  </ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton size="icon-sm" aria-label="Delete" disabled>
    <Icon name="trash" />
  </ToolbarButton>
</Toolbar>`,
		},
		{
			label: "In a workspace bar",
			code: `<WorkspaceBar>
  <Toolbar aria-label="Document" className="flex-1">
    <ToolbarButton size="xs">File</ToolbarButton>
    <ToolbarButton size="xs">Edit</ToolbarButton>
    <ToolbarButton size="icon-xs" aria-label="Share" className="ms-auto">
      <Icon name="share" />
    </ToolbarButton>
  </Toolbar>
</WorkspaceBar>`,
		},
	],
}
