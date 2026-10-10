import {
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
	type ComponentMeta,
	Icon,
	InlineStatus,
	inlineStatusMeta,
	Label,
	labelMeta,
	Marker,
	markerMeta,
	Note,
	noteMeta,
	NotificationBadge,
	notificationBadgeMeta,
	Pill,
	pillMeta,
	Separator,
	separatorMeta,
	StatusDot,
	statusDotMeta,
} from "@sableui/react"
import type { ComponentProps, ReactNode } from "react"
import { deriveControls, type PlaygroundSlot, type PlaygroundValue } from "../components/Playground"
import type { PreviewSlug } from "./preview-index"
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

export interface PreviewEntry {
	meta: ComponentMeta
	/** Renders the component from current control values, the editable child, and any switched-on slots. */
	render: (values: Record<string, PlaygroundValue>, text: string, slots: Record<string, ReactNode>) => ReactNode
	/** Initial text child. Omit for components that take no editable child. */
	text?: string
	/** Restrict/order controls where the full prop surface is wider than useful. */
	only?: string[]
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
		only: ["size"],
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
		only: ["variant", "shimmer"],
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
	return values
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
