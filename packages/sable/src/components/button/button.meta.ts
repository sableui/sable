import type { ComponentMeta } from "../../lib/meta"

export const buttonMeta: ComponentMeta = {
	name: "Button",
	summary:
		"Pill-shaped action primitive (theme-driven radius via --button-radius, defaults to full). Neutral tiers (primary/secondary/ghost/outline), plus destructive and link, and three on-color tiers (on-color/on-color-outline/on-color-ghost) that paint with the surrounding ink so a button reads on any tone or brand fill. Optional loading state shows a spinner and disables the button.",
	keywords: [
		"button",
		"action",
		"cta",
		"submit",
		"save",
		"cancel",
		"destructive",
		"loading",
		"link",
		"icon button",
		"on color",
		"inverse",
		"band",
		"brand fill",
		"tone fill",
		"bleed",
		"optical alignment",
		"align label to edge",
		"negative margin",
		"view all",
	],
	usage: {
		description:
			"Use Button when the user commits an action, submits a form, opens UI, or confirms a decision. Use the visual tier to communicate priority: one primary action per local decision area, then secondary, ghost, outline, or link for lower-emphasis choices.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use a single primary button in a view or dense panel so the action hierarchy stays obvious.",
			},
			{
				guidance: "do",
				description:
					"For a copy control, pair an icon Button with `useCopy(text, { timeout? })`. It takes the text when the hook is called and returns `{ copy, copied }`; `copy()` takes no argument, so pass the value the button copies to the hook, not to `copy`.",
			},
			{
				guidance: "do",
				description:
					"Write labels as actions, such as \"Save changes\" or \"Delete draft\", instead of vague labels like \"OK\".",
			},
			{
				guidance: "do",
				description:
					"Use loading with loadingLabel for async work so the action cannot double-fire and the state is announced.",
			},
			{
				guidance: "do",
				description:
					"Put icons in iconStart / iconEnd rather than as children, so the button applies its optical padding. Start icons say what the action is (plus, share); end icons say where it goes (chevron-right, external).",
			},
			{
				guidance: "do",
				description:
					"Set bleed on a ghost or link button that sits at the start or end of a row, so its LABEL lines up with the content edge the row shares (\"View all\" over a grid, \"Add task\" under a list, \"Resend code\" at a card footer's end). The box moves out by exactly its own padding; the hit area and hover fill stay full size and run past the edge. SectionHeader, PageHeader (back and actions) and CardAction already do this for their outermost ghost/link child — don't add it there, and use bleed=\"none\" to opt one out.",
			},
			{
				guidance: "dont",
				description:
					"Pull a ghost button onto an edge with -ms-3 / -me-3 classNames. That number is one size's padding: it is wrong at xs, md and cta, wrong on a side carrying an icon, and wrong once a preset retunes the spacing. bleed reads the button's own padding var. And don't bleed a filled or outlined button — its visible edge is what aligns, so bleed is a no-op there.",
			},
			{
				guidance: "dont",
				description:
					"Use destructive for reversible or low-risk actions; reserve it for operations with real loss or danger.",
			},
			{
				guidance: "dont",
				description:
					"Use a button for plain navigation. Compose with render={<a />} when the element should behave like a link.",
			},
			{
				guidance: "dont",
				description:
					"Use secondary on a tinted surface — inside a Note, a soft Banner, or any tone fill. `secondary` is a near-background surface token (in some themes within 2% of the page), so on a tint it reads as a hole punched in the fill rather than as a control sitting on it. On a soft tint use outline or ghost; on a full-strength fill use the on-color tiers.",
			},
			{
				guidance: "do",
				description:
					"On a coloured fill — a solid Banner, a bg-tone-* or bg-primary band, an inverse (bg-foreground) section, a brand panel — use variant=\"on-color\" for the main action and on-color-outline / on-color-ghost for the rest. They paint with the band's inherited ink (currentColor), so the surface must set its paired ink (text-tone-info-foreground, text-primary-foreground, text-background…), which it already should. Name the fill once on the surface, e.g. [--on-color-fill:var(--tone-info)], and the solid button's label takes the fill colour; unnamed, it falls back to black or white against the ink. Both clear 4.5:1 in every shipped theme and mode.",
			},
			{
				guidance: "dont",
				description:
					"Use the on-color tiers on the page, a Card, a Note, or a soft tint — there the ink is the page foreground and the normal tiers already fit. And don't restyle a normal variant with bg-*/text-* classNames to make it read on a band; that hard-codes colours per theme and skips the contrast and focus handling on-color carries.",
			},
		],
		anatomy: [
			{
				name: "Container",
				required: true,
				description:
					"The rounded hit target that carries the visual tier, focus ring, disabled state, and loading affordance.",
			},
			{
				name: "Label",
				required: true,
				description:
					"Visible action text and the default accessible name. Icon-only buttons still need an aria-label.",
			},
			{
				name: "Leading icon",
				required: false,
				description:
					"An optional semantic Icon that reinforces the label without replacing it.",
			},
			{
				name: "Spinner",
				required: false,
				description:
					"Displayed during loading and paired with aria-busy plus disabled activation.",
			},
		],
	},
	related: {
		components: ["Menu", "OverflowMenu", "Icon", "Banner"],
		patterns: ["SettingsPage", "AuthPage", "DashboardPage"],
	},
	status: "stable",
	props: [
		{
			name: "variant",
			type: '"primary" | "secondary" | "ghost" | "outline" | "destructive" | "link" | "floating" | "field" | "on-color" | "on-color-outline" | "on-color-ghost"',
			default: '"primary"',
			description:
				"Visual emphasis tier. One primary per screen. The on-color tiers are for buttons ON a coloured fill: they paint with the inherited text colour (the fill's ink) — on-color is solid (ink background, fill-coloured label via the optional --on-color-fill var, else black/white), on-color-outline and on-color-ghost are transparent with an ink label. Never use them on page or card surfaces. floating is for a control that sits OVER content (carousel arrows, a marquee pause, a jump-to-latest over a conversation): its own edge, lift and translucent popover fill, so it reads on arbitrary content beneath. field is for a button docked in a workspace panel among xs fields: the inset panel-field fill and the field's corner, so a picker trigger or an add action reads as one of the row's controls; pair it with size xs or icon-xs.",
		},
		{
			name: "size",
			type: '"xs" | "sm" | "md" | "cta" | "icon" | "icon-sm" | "icon-xs"',
			default: '"md"',
			description:
				"Reads the density ladder, so every value differs by register: page 28/32/40/44, workspace 24/28/32/36. xs and icon-xs were added in 0.31.0 for the workspace control floor and are the sizes tool chrome wants; md is the default everywhere. icon/icon-sm/icon-xs are square.",
		},
		{
			name: "render",
			type: "ReactElement | (props, state) => ReactElement",
			description:
				"Compose with another element/component through the Base UI render prop.",
		},
		{
			name: "loading",
			type: "boolean",
			default: "false",
			description:
				"Show a leading Spinner while an action is in flight and refuse presses. Sets aria-busy and aria-disabled, never the native disabled: disabling the focused button sent focus to <body>, so a sheet the action opened had nowhere to return it.",
		},
		{
			name: "onClick",
			type: "(event: MouseEvent<HTMLButtonElement>) => unknown",
			description:
				"May return a promise: the button shows `loading` until it settles and ignores further presses meanwhile, from the first click on. Prefer it to a `busy` flag in state, which takes effect a render late (three fast clicks ran three times).",
		},
		{
			name: "badge",
			type: "ReactNode",
			description:
				"A corner indicator (usually <NotificationBadge dot /> or a count) overlaid on the top-end corner of the glyph. For icon-only sizes; never hand-position a badge over a Button with absolute offsets.",
		},
		{
			name: "loadingLabel",
			type: "ReactNode",
			description: "Optional text shown in place of children while loading.",
		},
		{
			name: "iconStart",
			type: "ReactNode",
			description: "Icon before the label. The button takes one 2px step off its start padding so icon + label read as centred. Replaced by the spinner while loading.",
		},
		{
			name: "iconEnd",
			type: "ReactNode",
			description: "Icon after the label (disclosure, external link, next). Same optical correction on the end side.",
		},
		{
			name: "bleed",
			type: '"start" | "end" | "both" | "none"',
			description:
				"Optical alignment for a borderless button (ghost, link, on-color-ghost): a negative inline margin of exactly its own padding on that side — --button-px, or the icon side's optical padding when an icon sits there; an icon-only size bleeds by its inset to the glyph — so the label (or glyph) lands on the content edge. Hit area and hover/focus fill keep their full size. Logical sides, so it mirrors in RTL. A no-op on variants with a visible edge (primary, secondary, outline, destructive, floating, field, on-color, on-color-outline): a filled button aligns its edge, not its label. Unset, a borderless button renders data-bleed=\"auto\" and SectionHeader, PageHeader and CardAction bleed it when it is their outermost child; none opts out.",
		},
	],
	variants: {
		variant: [
			"primary",
			"secondary",
			"ghost",
			"outline",
			"destructive",
			"link",
			"floating",
			"field",
			"on-color",
			"on-color-outline",
			"on-color-ghost",
		],
		size: ["xs", "sm", "md", "cta", "icon", "icon-sm", "icon-xs"],
	},
	tokensUsed: [
		"primary",
		"primary-foreground",
		"secondary",
		"secondary-foreground",
		"accent",
		"accent-foreground",
		"input",
		"destructive",
		"destructive-foreground",
		"ring",
		"panel-field",
		"panel-field-hover",
		"panel-foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "A button belongs to the layout it ships in. Whatever staged that region owns the entrance; a button that fades in on its own is a button that is briefly un-clickable for no stated reason.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Root",
			why: "Hover, focus ring and disabled fade all ease on one declaration. This is the reference case for the whole recipe: it lists scale and translate alongside the colours specifically so motion-press can add a transform without a second, conflicting transition-property.",
		},
		{
			slot: "response",
			recipe: "motion-press",
			part: "Root",
			why: "The 0.97 settle on pointer-down is the only confirmation the press registered before the action's own result arrives — which on a slow network is the difference between waiting and clicking again. It skips disabled elements, so a dead button stays visibly dead.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Root",
			why: "A button has no state of its own to move between. A control that toggles is a Switch or a Toggle, and those carry the transition.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Pending work is passed in via `loading`, which renders a Spinner — the activity motion lives there rather than being duplicated here.",
		},
	],
	a11y: [
		"Renders a native <button> by default (keyboard + role free).",
		"Focus-visible ring uses the --ring token at 50% opacity.",
		"Use render={<a/>} for link semantics rather than onClick navigation.",
		"On-color tiers replace the --ring focus ring with one drawn in the band's ink past a transparent 2px gap, so focus stays visible on any fill (ink-on-fill is the theme's own tested pair).",
		"On-color contrast is measured in button.test.tsx for every shipped theme and mode on each tone, primary, destructive, success, highlight and inverse fill: solid label at rest and hover, and outline/ghost label on the hover wash, all at least 4.5:1.",
		"bleed moves only the box, never the hit target: the full padded area stays clickable and the focus ring still draws around the whole button, past the content edge.",
		"loading sets aria-busy and disables activation (disabled on a native button, aria-disabled on a render element) so the action can't double-fire.",
	],
	examples: [
		{ label: "Primary", code: '<Button>Save changes</Button>' },
		{
			label: "Secondary + ghost",
			code: '<Row gap={1}><Button variant="secondary">Cancel</Button><Button variant="ghost">Skip</Button></Row>',
		},
		{
			label: "Loading",
			code: '<Button loading loadingLabel="Saving…">Save</Button>',
		},
		{
			label: "Main action with options",
			code: '<Row gap={2}><Button onClick={deploy}>Deploy</Button><Menu><MenuTrigger render={<Button variant="secondary" size="icon" aria-label="Deploy options"><Icon name="chevron-down" /></Button>} /><MenuContent align="end"><MenuItem>Deploy to preview</MenuItem><MenuItem>Deploy to production</MenuItem></MenuContent></Menu></Row>',
		},
		{
			label: "Copy to clipboard",
			code: 'const { copy, copied } = useCopy(address)\n<Button variant="ghost" size="icon-sm" aria-label="Copy address" onClick={copy}><Icon name={copied ? "check" : "copy"} /></Button>',
		},
		{
			label: "As link",
			code: '<Button render={<a href="/explore" />}>Explore</Button>',
		},
		{
			label: "Primary + secondary decision row",
			code: '<Row gap={1}><Button>Publish</Button><Button variant="secondary">Save draft</Button><Button variant="ghost">Cancel</Button></Row>',
		},
		{
			label: "Destructive with confirmation copy",
			code: '<Row gap={1}><Button variant="secondary">Cancel</Button><Button variant="destructive">Delete project</Button></Row>',
		},
		{
			label: "Leading icon",
			code: '<Button iconStart={<Icon name="plus" />}>New project</Button>',
		},
		{
			label: "Trailing icon",
			code: '<Button variant="secondary" iconEnd={<Icon name="chevron-right" />}>Continue</Button>',
		},
		{
			label: "Both icons",
			code: '<Button variant="outline" iconStart={<Icon name="file" />} iconEnd={<Icon name="chevron-down" />}>Export</Button>',
		},
		{
			label: "Icon-only",
			code: '<Button size="icon" variant="ghost" aria-label="Share"><Icon name="share" /></Button>',
		},
		{
			label: "Optically aligned to the row's edges",
			code: `<Stack gap={1.5}>
  <Row justify="between">
    <span className="text-title-md">Tasks</span>
    <Button variant="ghost" size="sm" bleed="end">View all</Button>
  </Row>
  <span className="text-body-sm text-muted-foreground">Ship the release notes</span>
  <Button variant="ghost" size="sm" bleed="start" iconStart={<Icon name="plus" />} className="self-start">Add task</Button>
</Stack>`,
		},
		{
			label: "Icon button with an unread badge",
			code: '<Button size="icon" variant="ghost" aria-label="Notifications" badge={<NotificationBadge dot />}><Icon name="bell" /></Button>',
		},
		{
			label: "Field button in a panel row",
			code: '<PanelSection title="Text">\n  <PropertyRow label="Font">\n    <Button variant="field" size="xs" className="w-full justify-between" iconEnd={<Icon name="chevron-down" />}>Figtree</Button>\n  </PropertyRow>\n</PanelSection>',
		},
		{
			label: "On a coloured band",
			code: '<div className="flex gap-3 bg-tone-info p-6 text-tone-info-foreground [--on-color-fill:var(--tone-info)]"><Button variant="on-color">Join the beta</Button><Button variant="on-color-outline">Read the notes</Button></div>',
		},
		{
			label: "Action in a solid Banner",
			code: '<Banner tone="warning" appearance="solid" action={<Button variant="on-color" size="sm">Reconnect</Button>}>Calendar sync paused.</Banner>',
		},
	],
}
