import { cn } from "@sableui/react"
import {
	EventCardBlock,
	FeedbackFormBlock,
	InviteTeamBlock,
	InvoicePreviewBlock,
	MediaPlayerBlock,
	MessageReactionsBlock,
	NotificationListBlock,
	NotificationSettingsBlock,
	OrderTrackingBlock,
	PricingCardBlock,
	ProductCardBlock,
	ProfileCardBlock,
	ProjectCollectionBlock,
	RevenueBreakdownBlock,
	ScheduleBlock,
	SignInBlock,
	TaskListBlock,
	TrafficSourcesBlock,
	TrafficTrendBlock,
	UploadListBlock,
	WalletBlock,
} from "@sableui/react/blocks"
import { type ComponentType, type ReactNode, createContext, useContext } from "react"

/*
 * The canvas's scenes: each one of Sable's own blocks (`@sableui/react/blocks`),
 * the same source a consumer copies, set on a stage. That is what makes the
 * canvas accurate: what moves here is what moves in an app. The only scene
 * composed here is the type specimen, which is not a block anyone would ship.
 *
 * This module holds the stage and the scenes other pages borrow (the home
 * page, the Presets page, the iPhone canvas), one export per scene, so a page
 * that shows three of them bundles three blocks, not every block on the canvas.
 * The canvas's own list of tiles is canvas/tiles.ts.
 */

const CompactSceneFraming = createContext(false)

/** On a phone-sized screen the screen is the stage: scenes drop their plate. */
export function CanvasContent({ children }: { children: ReactNode }) {
	return <CompactSceneFraming.Provider value={true}>{children}</CompactSceneFraming.Provider>
}

/**
 * A stage: a quiet backdrop holding ONE real-world object, centred on both
 * axes (a block that grows stays centred in its stage). It is the canvas's own
 * layout, not part of the object, so it stays plain.
 */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
	// On a phone the screen is the stage: a muted plate around each card would
	// read as a second, nested surface.
	if (useContext(CompactSceneFraming)) return <div className="flex w-full min-w-0 items-center justify-center [--scene-max:none]">{children}</div>
	return (
		// No content-visibility here, though it looks like a fit: measured, it made
		// a Customize drag SLOWER (12.4 vs 8.9ms per restyle), because every size
		// change re-checks each skipped scene's intrinsic size.
		<div data-canvas-stage="" className={cn("flex min-h-72 items-center justify-center rounded-xl bg-muted p-8", className)}>
			{children}
		</div>
	)
}

/**
 * Every block fills its container up to its designed width (20rem); on the
 * iPhone canvas the screen is the limit instead (--scene-max: none).
 */
export const SCENE = "max-w-[var(--scene-max,20rem)]"

/** A block on a stage: the one wrapper every scene is. */
export function BlockScene<P extends object>({ block: Block, ...props }: { block: ComponentType<P & { className?: string }> } & P) {
	return (
		<Stage>
			<Block {...(props as P)} className={SCENE} />
		</Stage>
	)
}

/** A scene for `Block`, as a component other pages can render by name. */
function scene<P extends object = object>(Block: ComponentType<P & { className?: string }>) {
	const Scene = (props: P) => <BlockScene<P> block={Block} {...props} />
	Scene.displayName = `${Block.displayName ?? Block.name}Scene`
	return Scene
}

export const InvoiceScene = /*#__PURE__*/ scene(InvoicePreviewBlock)
export const ScheduleScene = /*#__PURE__*/ scene(ScheduleBlock)
export const CollectionScene = /*#__PURE__*/ scene(ProjectCollectionBlock)
export const ProductScene = /*#__PURE__*/ scene(ProductCardBlock)
export const BillingScene = /*#__PURE__*/ scene(PricingCardBlock)
export const NotificationsScene = /*#__PURE__*/ scene(NotificationListBlock)
/** Revenue split by type — the palette's decorative tones doing real work. */
export const StatScene = /*#__PURE__*/ scene(RevenueBreakdownBlock)
export const SettingsScene = /*#__PURE__*/ scene(NotificationSettingsBlock)
/** `onSend` lets the iPhone canvas answer Send; on the web it stays a specimen. */
export const InviteScene = /*#__PURE__*/ scene<{ onSend?: () => void }>(InviteTeamBlock)
/** The homepage's conversation: the reactable thread, the fuller of the two chat blocks. */
export const ChatScene = /*#__PURE__*/ scene(MessageReactionsBlock)
export const NowPlayingScene = /*#__PURE__*/ scene(MediaPlayerBlock)
export const EventScene = /*#__PURE__*/ scene(EventCardBlock)
export const ProfileScene = /*#__PURE__*/ scene(ProfileCardBlock)
export const TasksScene = /*#__PURE__*/ scene(TaskListBlock)
/** `framed={false}` when a sheet holds it: the sheet is already the surface. */
export const SignInScene = /*#__PURE__*/ scene<{ framed?: boolean; onSignIn?: () => void }>(SignInBlock)
export const UploadScene = /*#__PURE__*/ scene(UploadListBlock)
export const WalletScene = /*#__PURE__*/ scene(WalletBlock)
/** `onDone` closes the iPhone canvas's sheet from Skip or Send; `framed={false}` there. */
export const FeedbackScene = /*#__PURE__*/ scene<{ framed?: boolean; onDone?: (sent: boolean) => void }>(FeedbackFormBlock)
/** Charts on the canvas: the palette's tones as data colours, judged as a set. */
export const SourcesScene = /*#__PURE__*/ scene(TrafficSourcesBlock)
export const TrendScene = /*#__PURE__*/ scene(TrafficTrendBlock)
export const ShippingScene = /*#__PURE__*/ scene(OrderTrackingBlock)

/** A type specimen: the scale itself is the subject, so it is bare type. */
export function TypeScene() {
	return (
		<Stage>
			<div className={cn("w-full", SCENE, "flex flex-col gap-3 text-center")}>
				<span className="text-display-lg leading-none">Aa</span>
				<span className="text-heading-4">The quick brown fox</span>
				<span className="text-body-sm text-muted-foreground">Headings, body and mono follow the preset and the type you pick.</span>
				<span className="text-mono-md text-muted-foreground">0123456789</span>
			</div>
		</Stage>
	)
}
