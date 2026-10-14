import { Badge, Grid, Tabs, TabsList, TabsPanel, TabsTrigger, cn } from "@sableui/react"
import {
	ChatThreadBlock,
	CommandPaletteBlock,
	EventCardBlock,
	FeedbackFormBlock,
	InviteTeamBlock,
	MediaPlayerBlock,
	NotificationListBlock,
	NotificationSettingsBlock,
	OrderTrackingBlock,
	PricingCardBlock,
	ProductCardBlock,
	ProfileCardBlock,
	RevenueBreakdownBlock,
	SignInBlock,
	TrafficSourcesBlock,
	TrafficTrendBlock,
	TaskListBlock,
	UploadListBlock,
	WalletBlock,
} from "@sableui/react/blocks"
import { type ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { PHONE, WIDE, useMediaQuery } from "../lib/use-media-query"
import { IosCanvasPreview } from "./IosCanvasPreview"

const CompactSceneFraming = createContext(false)
export function CanvasContent({ children }: { children: ReactNode }) {
	return <CompactSceneFraming.Provider value={true}>{children}</CompactSceneFraming.Provider>
}

/*
 * The customize canvas: the whole system as a SET, so a change to character,
 * color or corners is judged by its effect on a real composition — a payment
 * card, an app nav, a settings form — rather than on one component in
 * isolation.
 *
 * Every scene is one of Sable's own blocks (`@sableui/react/blocks`), the same
 * source a consumer copies, set on a stage. That is what makes the canvas
 * accurate: what moves here is what moves in an app. The only thing composed
 * here is the type specimen, which is not a block anyone would ship.
 */

/**
 * A stage: a quiet backdrop holding ONE real-world object. It is the canvas's
 * own layout, not part of the object, so it stays plain.
 */
function Stage({ children, className }: { children: ReactNode; className?: string }) {
	// On a phone the screen is the stage: a muted plate around each card would
	// read as a second, nested surface.
	if (useContext(CompactSceneFraming)) return <div className="flex w-full min-w-0 justify-center [--scene-max:none]">{children}</div>
	return (
		// No content-visibility here, though it looks like a fit: measured, it made
		// a Customize drag SLOWER (12.4 vs 8.9ms per restyle), because every size
		// change re-checks each skipped scene's intrinsic size.
		<section className={cn("flex min-h-72 items-center justify-center rounded-xl bg-muted p-8", className)}>
			{children}
		</section>
	)
}

/**
 * Every block fills its container up to its designed width (20rem); on the
 * iPhone canvas the screen is the limit instead (--scene-max: none).
 */
const SCENE = "max-w-[var(--scene-max,20rem)]"

export function ProductScene() {
	return <Stage><ProductCardBlock className={SCENE} /></Stage>
}

export function BillingScene() {
	return <Stage><PricingCardBlock className={SCENE} /></Stage>
}

export function NotificationsScene() {
	return <Stage><NotificationListBlock className={SCENE} /></Stage>
}

/** Revenue split by type — the palette's decorative tones doing real work. */
export function StatScene() {
	return <Stage><RevenueBreakdownBlock className={SCENE} /></Stage>
}

export function SettingsScene() {
	return <Stage><NotificationSettingsBlock className={SCENE} /></Stage>
}

/** `onSend` lets the iPhone canvas answer Send; on the web it stays a specimen. */
export function InviteScene({ onSend }: { onSend?: () => void } = {}) {
	return <Stage><InviteTeamBlock className={SCENE} onSend={onSend} /></Stage>
}

export function ChatScene() {
	// On a card, not the stage: incoming bubbles are the muted surface, the
	// same tone as the stage itself — the block is framed by default.
	return <Stage><ChatThreadBlock className={SCENE} /></Stage>
}

// Selecting a command is a no-op here: the scene is a specimen, not a menu that navigates.
function CommandScene() {
	return <Stage><CommandPaletteBlock className={SCENE} /></Stage>
}

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

export function NowPlayingScene() {
	return <Stage><MediaPlayerBlock className={SCENE} /></Stage>
}

export function EventScene() {
	return <Stage><EventCardBlock className={SCENE} /></Stage>
}

export function ProfileScene() {
	return <Stage><ProfileCardBlock className={SCENE} /></Stage>
}

export function TasksScene() {
	return <Stage><TaskListBlock className={SCENE} /></Stage>
}

/** `framed={false}` when a sheet holds it: the sheet is already the surface. */
export function SignInScene({ framed, onSignIn }: { framed?: boolean; onSignIn?: () => void } = {}) {
	return <Stage><SignInBlock className={SCENE} framed={framed} onSignIn={onSignIn} /></Stage>
}

export function UploadScene() {
	return <Stage><UploadListBlock className={SCENE} /></Stage>
}

export function WalletScene() {
	return <Stage><WalletBlock className={SCENE} /></Stage>
}

/**
 * `onDone` closes the iPhone canvas's sheet from Skip or Send; `framed={false}`
 * there, since the sheet is already the surface and a card in it reads as nested.
 */
export function FeedbackScene({ framed, onDone }: { framed?: boolean; onDone?: (sent: boolean) => void } = {}) {
	return <Stage><FeedbackFormBlock className={SCENE} framed={framed} onDone={onDone} /></Stage>
}

/** Charts on the canvas: the palette's tones as data colours, judged as a set. */
export function SourcesScene() {
	return <Stage><TrafficSourcesBlock className={SCENE} /></Stage>
}

export function TrendScene() {
	return <Stage><TrafficTrendBlock className={SCENE} /></Stage>
}

export function ShippingScene() {
	return <Stage><OrderTrackingBlock className={SCENE} /></Stage>
}

function ThemeCanvas() {
	return (
		// As many columns as fit, not a column count per window width: the space
		// left beside the Customize panel, and the size of everything at the
		// current Character setting, decide how many scenes fit across. The floor
		// is one card at its widest (max-w-xs, 20rem) plus the stage's padding
		// (16 spacing units, which density scales), so a card is never squeezed
		// below the width it is built for.
		<Grid minItemWidth="calc(20rem + var(--spacing) * 16)" gap="calc(var(--spacing) * 4)">
			<ProductScene />
			<BillingScene />
			<NowPlayingScene />
			<StatScene />
			<SourcesScene />
			<TypeScene />
			<ProfileScene />
			<NotificationsScene />
			<EventScene />
			<SignInScene />
			<TasksScene />
			<TrendScene />
			<WalletScene />
			<InviteScene />
			<ChatScene />
			<ShippingScene />
			<SettingsScene />
			<FeedbackScene />
			<UploadScene />
			<CommandScene />
		</Grid>
	)
}

export function CustomizeCanvasPage() {
	// The canvas is where you tune the look, so arriving opens the same
	// Customize panel every page uses (the shell makes room for it). Not on a
	// small screen, where the panel is a whole settings view: arriving there
	// would hide the canvas you came to see.
	const { setOpen } = useCustomizer()
	const [target, setTarget] = useState(() => new URLSearchParams(location.search).get('target') === 'ios' ? 'ios' : 'web')
	const [showIos, setShowIos] = useState(target === 'ios')
	// On a phone the web canvas IS the phone view, and an iPhone prototype
	// inside an iPhone only spends the screen: there is no platform switch, and
	// a shared ?target=ios link opens the web canvas (it still opens iOS on a
	// larger screen).
	const phone = useMediaQuery(PHONE)
	const platform = phone ? 'web' : target
	useEffect(() => { if (window.matchMedia(WIDE).matches) setOpen(true) }, [setOpen])
	return (
		<div>
			<h1 className="sr-only">Customize Sable</h1>
			<Tabs value={platform} onValueChange={value => {
				const next = String(value)
				setTarget(next)
				if (next === 'ios') setShowIos(true)
				const url = new URL(location.href)
				if (next === 'ios') url.searchParams.set('target', 'ios')
				else url.searchParams.delete('target')
				history.replaceState(history.state, '', url)
			}}>
				{/* Hidden by CSS too, so a phone never sees it flash before hydration. */}
				<div className={cn("flex items-center justify-between gap-4 mb-6", "[@media(max-width:47.99rem)_and_(pointer:coarse)]:hidden", phone && "hidden")}>
					<TabsList variant="pill" aria-label="Canvas platform"><TabsTrigger value="web">Web</TabsTrigger><TabsTrigger value="ios">iOS<Badge size="sm">Beta</Badge></TabsTrigger></TabsList>
				</div>
				<TabsPanel value="web" keepMounted><ThemeCanvas /></TabsPanel>
				<TabsPanel value="ios" keepMounted>{showIos && !phone && <IosCanvasPreview />}</TabsPanel>
			</Tabs>
		</div>
	)
}
