import * as blocks from "@sableui/react/blocks"
import type { ComponentType } from "react"
import { TypeScene } from "./scenes"

/*
 * The web canvas's tiles, in order: data, so one wrapper draws them all. The
 * name is each tile's accessible name; the canvas shows no captions.
 * Add a block here (not a new wrapper component) to put it on the canvas.
 * Only the canvas imports this list; pages that borrow a scene import it by
 * name from ./scenes, so they do not bundle every block.
 */

type BlockName = keyof typeof blocks & `${string}Block`

export interface CanvasTile {
	id: string
	/** The block's export name, or null for a scene composed here. */
	block: BlockName | null
	/** Its accessible name. */
	name: string
	/** A scene that is not a bare block (the type specimen). */
	scene?: ComponentType
}

const tile = (block: BlockName, name?: string): CanvasTile => ({
	id: block.replace(/Block$/, "").replace(/(?<=[a-z])(?=[A-Z])/g, "-").toLowerCase(),
	block,
	name: name ?? titleOf(block),
})

/** "SignInBlock" → "Sign in" */
export function titleOf(block: string) {
	const words = block.replace(/Block$/, "").split(/(?=[A-Z])/).map((word) => word.toLowerCase())
	const title = words.join(" ")
	return title.charAt(0).toUpperCase() + title.slice(1)
}

export const CANVAS_TILES: CanvasTile[] = [
	tile("ProductCardBlock"),
	tile("PricingCardBlock"),
	tile("MediaPlayerBlock"),
	tile("RevenueBreakdownBlock"),
	tile("InvoicePreviewBlock"),
	tile("ScheduleBlock"),
	tile("ProjectCollectionBlock"),
	tile("TrafficSourcesBlock"),
	{ id: "type", block: null, name: "Type specimen", scene: TypeScene },
	tile("ProfileCardBlock"),
	tile("NotificationListBlock"),
	tile("EventCardBlock"),
	tile("SignInBlock"),
	tile("TaskListBlock"),
	tile("TrafficTrendBlock"),
	tile("WalletBlock"),
	tile("InviteTeamBlock"),
	tile("OrderTrackingBlock"),
	tile("NotificationSettingsBlock"),
	tile("FeedbackFormBlock"),
	tile("UploadListBlock"),
	// Selecting a command is a no-op here: the scene is a specimen, not a menu that navigates.
	tile("CommandPaletteBlock"),
	// An agent's tool call waiting on the person: held, then allowed or denied.
	tile("ApprovalBlock"),
	tile("VerifyCodeBlock"),
	tile("GoalProgressBlock"),
	tile("DeviceComparisonBlock"),
	tile("MessageReactionsBlock"),
	// The destructive tone, and the modal that guards it.
	tile("DangerZoneBlock"),
	// An agent turn: send a follow-up and it thinks, calls a tool and streams.
	tile("AgentRunBlock"),
	tile("PostBlock"),
	tile("ReserveTableBlock"),
	tile("DeliveryOptionsBlock"),
	// Tool UI on the canvas: scrub a property name and the photo answers.
	tile("PhotoAdjustBlock"),
	// Storage and Share end in a toast: the canvas mounts a ToastProvider.
	tile("StorageBlock"),
	tile("StreakBlock"),
	tile("ShareBlock"),
	tile("SearchBlock"),
	// Commerce at checkout: line items with steppers, and the plan a person pays for.
	tile("CartBlock"),
	tile("SubscriptionBlock"),
	tile("SecurityBlock"),
	tile("CommentThreadBlock"),
	tile("RecentOrdersBlock"),
	// An agent's answer that shows its sources.
	tile("CitedAnswerBlock"),
]

export const BLOCKS = blocks as unknown as Record<string, ComponentType<{ className?: string }>>
