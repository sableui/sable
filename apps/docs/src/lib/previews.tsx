import {
	Attachment,
	attachmentMeta,
	Avatar,
	avatarMeta,
	Badge,
	badgeMeta,
	Banner,
	bannerMeta,
	Bubble,
	bubbleMeta,
	Button,
	buttonMeta,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	cardMeta,
	CardTitle,
	CheckboxCard,
	checkboxCardMeta,
	type ComponentMeta,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	dialogMeta,
	DialogTitle,
	DialogTrigger,
	EmptyState,
	emptyStateMeta,
	Entity,
	entityMeta,
	FileDropzone,
	fileDropzoneMeta,
	Icon,
	InlineStatus,
	inlineStatusMeta,
	Input,
	inputMeta,
	Kbd,
	kbdMeta,
	Label,
	labelMeta,
	Marker,
	markerMeta,
	MenuRadioGroup,
	MenuRadioItem,
	Message,
	messageMeta,
	Meter,
	meterMeta,
	Note,
	noteMeta,
	NotificationBadge,
	notificationBadgeMeta,
	Pill,
	pillMeta,
	Progress,
	progressMeta,
	RadioCard,
	radioCardMeta,
	RadioGroup,
	Separator,
	separatorMeta,
	SettingsMenu,
	settingsMenuMeta,
	SettingsRow,
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	sheetMeta,
	SheetTitle,
	SheetTrigger,
	Spinner,
	spinnerMeta,
	StatusDot,
	statusDotMeta,
	Stepper,
	StepperItem,
	stepperMeta,
	Textarea,
	textareaMeta,
	ThinkingOrb,
	thinkingOrbMeta,
	toastMeta,
	Toggle,
	ToggleGroup,
	toggleMeta,
	Toolbar,
	ToolbarButton,
	toolbarMeta,
	Tooltip,
	TooltipContent,
	tooltipMeta,
	TooltipTrigger,
} from "@sableui/react"
import { type ComponentProps, type ReactNode, useState } from "react"
import {
	deriveControls,
	type PlaygroundControl,
	type PlaygroundSlot,
	type PlaygroundValue,
} from "../components/Playground"
import type { PreviewSlug } from "./preview-index"
import { TOAST_CONTROLS, ToastStage, toastSnippet } from "./toast-playground"
export { PREVIEW_SLUGS } from "./preview-index"

/**
 * Which components can be played with, and how to render one from a bag of
 * control values.
 *
 * This is the ONE hand-written list in the new docs surfaces, and it is
 * hand-written for a reason a generator cannot cover: a live preview needs a
 * plausible child, a stage that fits it, and — for props the meta describes as
 * numbers or nodes — a fixed stand-in. `Meter` cannot derive `value={72}` from
 * its contract, and a playground showing a Meter with no value shows nothing.
 *
 * Everything else still comes from meta: which controls exist, what they offer,
 * and what each defaults to. Adding a variant to a listed component surfaces
 * here without touching this file.
 */

/**
 * Control values arrive as an untyped bag (the derivation is contract-driven,
 * not type-driven), so each preview asserts the shape its own component wants.
 */
function as<T>(values: Record<string, PlaygroundValue>): T {
	return values as unknown as T
}

/**
 * The values that differ from their control's default, as JSX attributes with
 * a leading space — for entries that write their own snippet because the props
 * land on a part (`<ToolbarButton>`, `<SheetContent>`) rather than the root.
 */
function attrs(
	meta: ComponentMeta,
	values: Record<string, PlaygroundValue>,
	names: string[],
	seeded: Record<string, PlaygroundValue> = {},
): string {
	const initial = new Map<string, PlaygroundValue>(
		deriveControls(meta).map((control) => [control.prop, control.initial]),
	)
	for (const [name, value] of Object.entries(seeded)) initial.set(name, value)
	let out = ""
	for (const name of names) {
		const value = values[name]
		if (value === undefined || value === initial.get(name)) continue
		if (value === true) out += ` ${name}`
		else if (value === false) out += ` ${name}={false}`
		else out += ` ${name}="${value}"`
	}
	return out
}

const THUMBNAIL = "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=400&q=60"
const STEPS = ["Cart", "Shipping", "Payment", "Review"]

/** The step the Stepper preview stands on, named for the panel. */
const STEPPER_CONTROLS: PlaygroundControl[] = [
	{
		prop: "current",
		kind: "enum",
		options: STEPS.map((_, i) => String(i)),
		initial: "1",
		label: "Step",
		labels: Object.fromEntries(STEPS.map((step, i) => [String(i), step])),
	},
	{
		prop: "error",
		kind: "boolean",
		options: ["true", "false"],
		initial: false,
		label: "Step failed",
		description: 'status="error" on the current StepperItem',
	},
]

const TOOLBAR_ITEMS = [
	["bold", "Bold"],
	["italic", "Italic"],
	["link", "Link"],
] as const
/** ToolbarButton's own defaults, which Toolbar's meta does not carry. */
const TOOLBAR_DEFAULTS = { variant: "ghost", size: "sm" }

const MODELS = ["Sol", "Luna", "Terra"]

/** SettingsMenu holds a live choice, so its preview keeps one. */
function SettingsMenuPreview({ values }: { values: Record<string, PlaygroundValue> }) {
	const [model, setModel] = useState(MODELS[0])
	return (
		<SettingsMenu
			{...as<Omit<ComponentProps<typeof SettingsMenu>, "children">>(values)}
			label="Change model"
			summary={model}
		>
			<SettingsRow label="Model" value={model}>
				<MenuRadioGroup value={model} onValueChange={(next) => setModel(String(next))}>
					{MODELS.map((name) => (
						<MenuRadioItem key={name} value={name}>
							{name}
						</MenuRadioItem>
					))}
				</MenuRadioGroup>
			</SettingsRow>
		</SettingsMenu>
	)
}

export interface PreviewEntry {
	meta: ComponentMeta
	/** Renders the component from current control values, the editable child, and any switched-on slots. */
	render: (values: Record<string, PlaygroundValue>, text: string, slots: Record<string, ReactNode>) => ReactNode
	/** Initial text child. Omit for components that take no editable child. */
	text?: string
	/**
	 * Starting values where meta names no default — Toolbar's `size` belongs to
	 * ToolbarButton, so the derived control would open on the first option.
	 */
	initial?: Record<string, PlaygroundValue>
	/** Restrict/order controls where the full prop surface is wider than useful. */
	only?: string[]
	/** Hand-written controls for what meta cannot describe (an imperative call's options). */
	controls?: PlaygroundControl[]
	/** Extra classes for the preview stage. */
	stageClassName?: string
	/** Props the preview hardcodes, as source text, so the snippet stays valid. */
	fixed?: string[]
	/** ReactNode props offered as on/off switches with a sample element. */
	slots?: PlaygroundSlot[]
	/** Custom snippet for previews the generic serializer cannot express. */
	snippet?: (values: Record<string, PlaygroundValue>, text: string, slots: Record<string, boolean>) => string | null
}

export const PREVIEWS: Record<string, PreviewEntry> = {
	button: {
		meta: buttonMeta,
		text: "Collect",
		only: ["variant", "size", "loading"],
		slots: [
			{ prop: "iconStart", label: "Leading icon", element: <Icon name="plus" />, source: '<Icon name="plus" />' },
			{ prop: "iconEnd", label: "Trailing icon", element: <Icon name="chevron-right" />, source: '<Icon name="chevron-right" />' },
		],
		// Icon sizes are square: the text becomes the accessible name and the
		// button shows a glyph instead of squeezing the label into a square.
		render: (values, text, slots) => {
			const props = as<ComponentProps<typeof Button>>(values)
			if (String(values.size).startsWith("icon")) {
				return (
					<Button {...props} aria-label={text || "Add"}>
						{slots.iconEnd ?? slots.iconStart ?? <Icon name="plus" />}
					</Button>
				)
			}
			return (
				<Button {...props} iconStart={slots.iconStart} iconEnd={slots.iconEnd}>
					{text}
				</Button>
			)
		},
		snippet: (values, text, slots) => {
			if (!String(values.size).startsWith("icon")) return null
			const icon = slots.iconEnd ? '<Icon name="chevron-right" />' : '<Icon name="plus" />'
			const variant = values.variant && values.variant !== "primary" ? ` variant="${values.variant}"` : ""
			const loading = values.loading === true ? " loading" : ""
			return `<Button size="${values.size}"${variant}${loading} aria-label="${text || "Add"}">${icon}</Button>`
		},
	},
	badge: {
		meta: badgeMeta,
		text: "Edition",
		render: (values, text) => (
			<Badge {...as<ComponentProps<typeof Badge>>(values)}>{text}</Badge>
		),
	},
	pill: {
		meta: pillMeta,
		text: "Solana",
		render: (values, text) => (
			<Pill {...as<ComponentProps<typeof Pill>>(values)}>{text}</Pill>
		),
	},
	avatar: {
		fixed: ['fallback="AM"', 'alt="Alex Morgan"'],
		meta: avatarMeta,
		only: ["size"],
		render: (values) => (
			<Avatar
				{...as<ComponentProps<typeof Avatar>>(values)}
				fallback="AM"
				alt="Alex Morgan"
			/>
		),
	},
	"status-dot": {
		meta: statusDotMeta,
		only: ["tone", "size", "pulse"],
		render: (values) => (
			<StatusDot {...as<ComponentProps<typeof StatusDot>>(values)} />
		),
	},
	note: {
		meta: noteMeta,
		text: "Editions mint on Solana mainnet.",
		only: ["tone"],
		stageClassName: "block",
		render: (values, text) => (
			<Note {...as<ComponentProps<typeof Note>>(values)}>{text}</Note>
		),
	},
	banner: {
		meta: bannerMeta,
		text: "Maintenance window tonight at 02:00 UTC.",
		only: ["tone", "appearance", "dismissible"],
		stageClassName: "block",
		render: (values, text) => (
			<Banner {...as<ComponentProps<typeof Banner>>(values)}>{text}</Banner>
		),
	},
	"inline-status": {
		meta: inlineStatusMeta,
		text: "Top-up confirmed.",
		only: ["tone", "size"],
		render: (values, text) => (
			<InlineStatus {...as<ComponentProps<typeof InlineStatus>>(values)}>
				{text}
			</InlineStatus>
		),
	},
	label: {
		meta: labelMeta,
		text: "Email",
		only: ["size", "eyebrow"],
		render: (values, text) => (
			<Label {...as<ComponentProps<typeof Label>>(values)}>{text}</Label>
		),
	},
	"notification-badge": {
		meta: notificationBadgeMeta,
		only: ["tone", "size", "dot"],
		// `dot` takes precedence over `count` in the component, so passing both
		// unconditionally keeps the snippet honest without changing what renders.
		fixed: ["count={8}"],
		render: (values) => (
			<NotificationBadge
				{...as<ComponentProps<typeof NotificationBadge>>(values)}
				count={8}
			/>
		),
	},
	marker: {
		meta: markerMeta,
		text: "Thinking…",
		only: ["variant", "spin", "shimmer"],
		render: (values, text) => (
			<Marker {...as<ComponentProps<typeof Marker>>(values)}>{text}</Marker>
		),
	},
	bubble: {
		meta: bubbleMeta,
		text: "Green across the board.",
		only: ["variant", "align", "tail"],
		render: (values, text) => (
			<Bubble {...as<ComponentProps<typeof Bubble>>(values)}>{text}</Bubble>
		),
	},
	separator: {
		meta: separatorMeta,
		only: ["orientation"],
		render: (values) => (
			<div
				className={
					values.orientation === "vertical"
						? "flex h-24 items-center gap-4"
						: "w-full max-w-sm"
				}
			>
				<span className="text-body-sm text-muted-foreground">Above</span>
				<Separator {...as<ComponentProps<typeof Separator>>(values)} />
				<span className="text-body-sm text-muted-foreground">Below</span>
			</div>
		),
	},
	card: {
		meta: cardMeta,
		only: ["variant", "density"],
		stageClassName: "block",
		render: (values) => (
			<Card {...as<ComponentProps<typeof Card>>(values)}>
				<CardHeader>
					<CardTitle>Edition</CardTitle>
					<CardDescription>Limited run of 100.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-body-md">
						Each collector receives a signed print and the on-chain edition.
					</p>
				</CardContent>
			</Card>
		),
	},
	// A toast is a call, not an element: the stage is a button that makes it,
	// and the snippet is the call. Position is the provider's — see ToastStage.
	toast: {
		meta: toastMeta,
		only: ["type", "title", "description", "action", "timeout", "position"],
		controls: TOAST_CONTROLS,
		render: (values) => <ToastStage values={values} />,
		snippet: (values) => toastSnippet(values),
	},
	spinner: {
		meta: spinnerMeta,
		only: ["appearance", "size"],
		render: (values) => <Spinner {...as<ComponentProps<typeof Spinner>>(values)} />,
	},
	progress: {
		meta: progressMeta,
		only: ["size"],
		fixed: ["value={64}", 'aria-label="Upload"'],
		render: (values) => (
			<div className="w-full max-w-sm">
				<Progress {...as<ComponentProps<typeof Progress>>(values)} value={64} aria-label="Upload" />
			</div>
		),
	},
	meter: {
		meta: meterMeta,
		only: ["tone", "shape", "size", "showValue"],
		fixed: ["value={72}", 'aria-label="Storage used"'],
		render: (values) => (
			// A bar needs a width to fill; a ring sizes itself.
			<div className={values.shape === "ring" ? undefined : "w-full max-w-sm"}>
				<Meter {...as<ComponentProps<typeof Meter>>(values)} value={72} aria-label="Storage used" />
			</div>
		),
	},
	kbd: {
		meta: kbdMeta,
		text: "K",
		only: ["variant", "mod"],
		render: (values, text) => <Kbd {...as<ComponentProps<typeof Kbd>>(values)}>{text}</Kbd>,
	},
	input: {
		meta: inputMeta,
		only: ["size", "disabled", "aria-invalid"],
		fixed: ['aria-label="Email"', 'placeholder="you@example.com"'],
		render: (values) => (
			<div className="w-full max-w-xs">
				<Input
					{...as<ComponentProps<typeof Input>>(values)}
					aria-label="Email"
					placeholder="you@example.com"
				/>
			</div>
		),
	},
	textarea: {
		meta: textareaMeta,
		only: ["autoResize", "disabled", "aria-invalid"],
		fixed: ['aria-label="Caption"', 'placeholder="Write a caption…"'],
		render: (values) => (
			<div className="w-full max-w-sm">
				<Textarea
					{...as<ComponentProps<typeof Textarea>>(values)}
					aria-label="Caption"
					placeholder="Write a caption…"
				/>
			</div>
		),
	},
	"thinking-orb": {
		meta: thinkingOrbMeta,
		only: ["mode", "size", "paused"],
		render: (values) => <ThinkingOrb {...as<ComponentProps<typeof ThinkingOrb>>(values)} />,
	},
	"empty-state": {
		meta: emptyStateMeta,
		only: ["tone", "size", "surface"],
		fixed: [
			'icon={<Icon name="image-stack" />}',
			'title="No posts yet"',
			'description="Create your first."',
			"action={<Button>New post</Button>}",
		],
		render: (values) => (
			<EmptyState
				{...as<ComponentProps<typeof EmptyState>>(values)}
				icon={<Icon name="image-stack" />}
				title="No posts yet"
				description="Create your first."
				action={<Button>New post</Button>}
			/>
		),
	},
	entity: {
		meta: entityMeta,
		only: ["density", "interactive", "selected"],
		fixed: ['leading={<Avatar fallback="AM" alt="Alex Morgan" />}', 'title="Alex Morgan"', 'subtitle="@alex"'],
		render: (values) => (
			<div className="w-full max-w-md">
				<Entity
					{...as<ComponentProps<typeof Entity>>(values)}
					leading={<Avatar fallback="AM" alt="Alex Morgan" />}
					title="Alex Morgan"
					subtitle="@alex"
				/>
			</div>
		),
	},
	attachment: {
		meta: attachmentMeta,
		only: ["variant", "status"],
		// A media tile shows its thumbnail; a card shows the file's icon and meta.
		render: (values) => (
			<Attachment
				{...as<ComponentProps<typeof Attachment>>(values)}
				name="cover.png"
				meta="2.4 MB · PNG"
				thumbnail={values.variant === "media" ? THUMBNAIL : undefined}
			/>
		),
		snippet: (values) =>
			`<Attachment${attrs(attachmentMeta, values, ["variant", "status"])} name="cover.png" meta="2.4 MB · PNG"${
				values.variant === "media" ? " thumbnail={url}" : ""
			} />`,
	},
	"checkbox-card": {
		meta: checkboxCardMeta,
		only: ["tone"],
		// Checked from the start: the tone colors only a checked card.
		fixed: ["defaultChecked", 'icon={<Icon name="gem" />}', 'title="Featured"', 'description="Pin for the campaign"'],
		render: (values) => (
			<div className="w-full max-w-xs">
				<CheckboxCard
					{...as<ComponentProps<typeof CheckboxCard>>(values)}
					defaultChecked
					icon={<Icon name="gem" />}
					title="Featured"
					description="Pin for the campaign"
				/>
			</div>
		),
	},
	"radio-card": {
		meta: radioCardMeta,
		only: ["tone", "disabled"],
		render: (values) => {
			const props = as<Omit<ComponentProps<typeof RadioCard>, "value">>(values)
			return (
				<RadioGroup defaultValue="collectible" className="grid w-full max-w-md gap-3 sm:grid-cols-2">
					<RadioCard {...props} value="post" icon={<Icon name="plus" />} title="Standard" description="Publish to the feed" />
					<RadioCard {...props} value="collectible" icon={<Icon name="gem" />} title="Featured" description="Pin for the campaign" />
				</RadioGroup>
			)
		},
		snippet: (values) => {
			const a = attrs(radioCardMeta, values, ["tone", "disabled"])
			return `<RadioGroup defaultValue="collectible">
	<RadioCard${a} value="post" title="Standard" description="Publish to the feed" />
	<RadioCard${a} value="collectible" title="Featured" description="Pin for the campaign" />
</RadioGroup>`
		},
	},
	toggle: {
		meta: toggleMeta,
		only: ["appearance", "multiple"],
		// Keyed on `multiple`: the group's value shape changes with it, so the
		// preview remounts rather than carry a single choice into a multi one.
		render: (values) => (
			<ToggleGroup
				key={String(values.multiple)}
				{...as<ComponentProps<typeof ToggleGroup>>(values)}
				defaultValue={["week"]}
				aria-label="Range"
			>
				<Toggle value="day">Day</Toggle>
				<Toggle value="week">Week</Toggle>
				<Toggle value="month">Month</Toggle>
			</ToggleGroup>
		),
		snippet: (values) => `<ToggleGroup${attrs(toggleMeta, values, ["appearance", "multiple"])} defaultValue={["week"]} aria-label="Range">
	<Toggle value="day">Day</Toggle>
	<Toggle value="week">Week</Toggle>
	<Toggle value="month">Month</Toggle>
</ToggleGroup>`,
	},
	stepper: {
		meta: stepperMeta,
		only: ["orientation", "indicator", "current", "error"],
		controls: STEPPER_CONTROLS,
		render: (values) => {
			const current = Number(values.current)
			return (
				<div className={values.orientation === "vertical" ? undefined : "w-full max-w-2xl"}>
					<Stepper
						current={current}
						orientation={values.orientation as "horizontal" | "vertical"}
						indicator={values.indicator as "number" | "dot"}
						aria-label="Checkout progress"
					>
						{STEPS.map((title, i) => (
							<StepperItem
								key={title}
								title={title}
								status={values.error === true && i === current ? "error" : undefined}
							/>
						))}
					</Stepper>
				</div>
			)
		},
		snippet: (values) => {
			const current = Number(values.current)
			const items = STEPS.map(
				(title, i) =>
					`\t<StepperItem title="${title}"${values.error === true && i === current ? ' status="error"' : ""} />`,
			).join("\n")
			return `<Stepper current={${current}}${attrs(stepperMeta, values, ["orientation", "indicator"])} aria-label="Checkout progress">\n${items}\n</Stepper>`
		},
	},
	"file-dropzone": {
		meta: fileDropzoneMeta,
		only: ["size", "multiple"],
		fixed: ['description="Images or PDFs, up to 10 MB each"'],
		render: (values) => (
			<div className="w-full max-w-lg">
				<FileDropzone
					{...as<ComponentProps<typeof FileDropzone>>(values)}
					description="Images or PDFs, up to 10 MB each"
				/>
			</div>
		),
	},
	message: {
		meta: messageMeta,
		only: ["align", "avatarSize", "grouped"],
		render: (values) => {
			const end = values.align === "end"
			return (
				<div className="w-full max-w-lg">
					<Message
						{...as<ComponentProps<typeof Message>>(values)}
						messageId="playground"
						avatar={<Avatar size={values.avatarSize as "sm" | "md" | "lg"} fallback="CA" />}
						header={<strong className="text-foreground">Carla</strong>}
					>
						<Bubble variant={end ? "primary" : "muted"} align={end ? "end" : "start"}>
							Did the deploy finish?
						</Bubble>
					</Message>
				</div>
			)
		},
		snippet: (values) => {
			const size = values.avatarSize === "sm" ? "" : ` size="${values.avatarSize}"`
			const bubble = values.align === "end" ? ' variant="primary" align="end"' : ""
			return `<Message${attrs(messageMeta, values, ["align", "avatarSize", "grouped"])}
	messageId={id}
	avatar={<Avatar${size} fallback="CA" />}
	header={<strong>Carla</strong>}
>
	<Bubble${bubble}>Did the deploy finish?</Bubble>
</Message>`
		},
	},
	toolbar: {
		meta: toolbarMeta,
		only: ["orientation", "variant", "size"],
		initial: TOOLBAR_DEFAULTS,
		// variant and size are ToolbarButton's (Button's own scales); orientation
		// is the Toolbar's. Icon sizes swap the labels for glyphs.
		render: (values) => {
			const icon = String(values.size).startsWith("icon")
			const button = as<ComponentProps<typeof ToolbarButton>>({ variant: values.variant, size: values.size })
			return (
				<Toolbar orientation={values.orientation as "horizontal" | "vertical"} aria-label="Formatting">
					{TOOLBAR_ITEMS.map(([glyph, label]) => (
						<ToolbarButton key={glyph} {...button} aria-label={icon ? label : undefined}>
							{icon ? <Icon name={glyph} /> : label}
						</ToolbarButton>
					))}
				</Toolbar>
			)
		},
		snippet: (values) => {
			const icon = String(values.size).startsWith("icon")
			const button = attrs(toolbarMeta, values, ["variant", "size"], TOOLBAR_DEFAULTS)
			const items = TOOLBAR_ITEMS.map(([glyph, label]) =>
				icon
					? `\t<ToolbarButton${button} aria-label="${label}"><Icon name="${glyph}" /></ToolbarButton>`
					: `\t<ToolbarButton${button}>${label}</ToolbarButton>`,
			).join("\n")
			return `<Toolbar${attrs(toolbarMeta, values, ["orientation"])} aria-label="Formatting">\n${items}\n</Toolbar>`
		},
	},
	sheet: {
		meta: sheetMeta,
		only: ["side"],
		render: (values) => (
			<Sheet>
				<SheetTrigger render={<Button>Open sheet</Button>} />
				<SheetContent side={values.side as "right" | "left" | "top" | "bottom"}>
					<SheetHeader>
						<SheetTitle>Edition details</SheetTitle>
						<SheetDescription>A limited run of 100, stored permanently on Arweave.</SheetDescription>
					</SheetHeader>
					<SheetFooter>
						<SheetClose render={<Button variant="secondary">Cancel</Button>} />
						<SheetClose render={<Button>Collect</Button>} />
					</SheetFooter>
				</SheetContent>
			</Sheet>
		),
		snippet: (values) => `<Sheet>
	<SheetTrigger render={<Button>Open sheet</Button>} />
	<SheetContent${attrs(sheetMeta, values, ["side"])}>
		<SheetHeader>
			<SheetTitle>Edition details</SheetTitle>
			<SheetDescription>A limited run of 100.</SheetDescription>
		</SheetHeader>
		<SheetFooter>
			<SheetClose render={<Button variant="secondary">Cancel</Button>} />
			<SheetClose render={<Button>Collect</Button>} />
		</SheetFooter>
	</SheetContent>
</Sheet>`,
	},
	dialog: {
		meta: dialogMeta,
		only: ["size"],
		render: (values) => (
			<Dialog>
				<DialogTrigger render={<Button>Open dialog</Button>} />
				<DialogContent size={values.size as "default" | "fullscreen"}>
					<DialogHeader>
						<DialogTitle>Edition details</DialogTitle>
						<DialogDescription>A limited run of 100, stored permanently on Arweave.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose render={<Button variant="secondary">Close</Button>} />
						<DialogClose render={<Button>Collect</Button>} />
					</DialogFooter>
				</DialogContent>
			</Dialog>
		),
		snippet: (values) => `<Dialog>
	<DialogTrigger render={<Button>Open dialog</Button>} />
	<DialogContent${attrs(dialogMeta, values, ["size"])}>
		<DialogHeader>
			<DialogTitle>Edition details</DialogTitle>
			<DialogDescription>A limited run of 100.</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose render={<Button variant="secondary">Close</Button>} />
			<DialogClose render={<Button>Collect</Button>} />
		</DialogFooter>
	</DialogContent>
</Dialog>`,
	},
	tooltip: {
		meta: tooltipMeta,
		only: ["side"],
		render: (values) => (
			<Tooltip>
				<TooltipTrigger render={<Button variant="secondary">Hover me</Button>} />
				<TooltipContent side={values.side as "top" | "right" | "bottom" | "left"}>
					A short, supplementary label.
				</TooltipContent>
			</Tooltip>
		),
		snippet: (values) => `<Tooltip>
	<TooltipTrigger render={<Button variant="secondary">Hover me</Button>} />
	<TooltipContent${attrs(tooltipMeta, values, ["side"])}>A short, supplementary label.</TooltipContent>
</Tooltip>`,
	},
	"settings-menu": {
		meta: settingsMenuMeta,
		only: ["variant", "size", "side", "align", "disabled"],
		render: (values) => <SettingsMenuPreview values={values} />,
		snippet: (values) => `<SettingsMenu${attrs(settingsMenuMeta, values, ["variant", "size", "side", "align", "disabled"])} label="Change model" summary={model}>
	<SettingsRow label="Model" value={model}>
		<MenuRadioGroup value={model} onValueChange={setModel}>
			<MenuRadioItem value="Sol">Sol</MenuRadioItem>
			<MenuRadioItem value="Luna">Luna</MenuRadioItem>
		</MenuRadioGroup>
	</SettingsRow>
</SettingsMenu>`,
	},
} satisfies Record<PreviewSlug, PreviewEntry>

export function hasPreview(slug: string): boolean {
	return slug in PREVIEWS
}

/** The control values a playground opens on — every derived control at default. */
export function previewDefaults(
	entry: PreviewEntry,
): Record<string, PlaygroundValue> {
	const controls = deriveControls(entry.meta)
	const values: Record<string, PlaygroundValue> = {}
	for (const control of controls) {
		if (entry.only && !entry.only.includes(control.prop)) continue
		values[control.prop] = control.initial
	}
	for (const control of entry.controls ?? []) {
		if (entry.only && !entry.only.includes(control.prop)) continue
		values[control.prop] = control.initial
	}
	return { ...values, ...entry.initial }
}

/**
 * A component rendered at its defaults — the gallery's thumbnail.
 *
 * Returns null for anything without a registered preview, so the gallery
 * degrades to a metadata tile rather than a hole.
 */
export function renderThumbnail(slug: string): ReactNode {
	const entry = PREVIEWS[slug]
	if (!entry) return null
	return entry.render(previewDefaults(entry), entry.text ?? "", {})
}
