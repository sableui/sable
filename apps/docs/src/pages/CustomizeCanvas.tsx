import {
	Attachment,
	Avatar,
	AvatarGroup,
	Bubble,
	Badge,
	Button,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardList,
	CardTitle,
	Checkbox,
	CommandMenuPanel,
	Entity,
	Grid,
	Icon,
	Input,
	Kbd,
	Label,
	Message,
	Separator,
	Slider,
	StatusDot,
	Stepper,
	StepperItem,
	Switch,
	Textarea,
	Toggle,
	ToggleGroup,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsPanel,
	cn,
	type CommandItem,
} from "@sableui/react"
import { type ReactNode, createContext, useContext, useEffect, useId, useState } from "react"
import { useCustomizer } from "../customizer/CustomizerProvider"
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
 * Every scene is composed from Sable's own components — Card and its parts,
 * Entity rows, Attachment, Stepper — the way an app would build it, never a
 * hand-made lookalike of one. That is what makes the canvas accurate: what
 * moves here is what moves in an app. The only things drawn by hand are the
 * pieces the library does not model (the date tile, the stacked revenue bar,
 * the palette artwork), and each says so where it is.
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

/** Every scene's card takes the stage's width up to one column. */
// The scene width; on the iPhone canvas the screen is the limit (--scene-max: none).
const SCENE = "w-full max-w-[var(--scene-max,20rem)]"

export function CollectScene() {
	return (
		<Stage>
			<Card className={cn(SCENE, "overflow-hidden")}>
				<div
					aria-hidden
					className="aspect-[4/3]"
					// A soft mesh of the palette's decorative tones over the brand —
					// the tones Customize → Color → Palette generates, so Harmonize /
					// Analogous / Triadic each paint visibly different artwork. The
					// tones are tuned to be legible AS TEXT (dark, restrained); art
					// keeps each hue but lifts lightness and chroma, so the mesh is
					// vivid instead of a blend of muted inks.
					style={{ background: artwork([[18, 22, 58], [82, 18, 55], [70, 88, 60], [12, 92, 55]]) }}
				/>
				<CardHeader>
					<CardTitle>Untitled (gold rush)</CardTitle>
					<CardDescription>Mara Okafor</CardDescription>
					<CardAction>
						<Badge tone="edition">12 of 50</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="justify-between pt-4">
					<span className="text-mono-lg">0.42 SOL</span>
					<Button>Collect</Button>
				</CardFooter>
			</Card>
		</Stage>
	)
}

export function BillingScene() {
	const [yearly, setYearly] = useState(true)
	return (
		<Stage>
			<Card className={SCENE}>
				<CardContent className="flex flex-col gap-5">
					<ToggleGroup
						value={[yearly ? "yearly" : "monthly"]}
						onValueChange={(v: unknown[]) => v[0] && setYearly(v[0] === "yearly")}
						aria-label="Billing period"
						className="w-full"
					>
						<Toggle value="monthly" className="flex-1">Monthly</Toggle>
						<Toggle value="yearly" className="flex-1">Yearly</Toggle>
					</ToggleGroup>
					<div className="flex flex-col gap-1">
						<div className="flex items-baseline gap-1.5">
							<span className="text-heading-2">{yearly ? "$16" : "$20"}</span>
							<span className="text-body-sm text-muted-foreground">per seat / month</span>
						</div>
						<span className="text-body-sm text-muted-foreground">{yearly ? "Billed $192 yearly. You save 20%." : "Billed monthly. Cancel anytime."}</span>
					</div>
					<ul className="flex flex-col gap-2 text-body-sm">
						{["Unlimited projects", "Version history", "Priority support"].map((item) => (
							<li key={item} className="flex items-center gap-2">
								<Icon name="check" className="text-success" />
								{item}
							</li>
						))}
					</ul>
					<Button className="w-full">Start free trial</Button>
				</CardContent>
			</Card>
		</Stage>
	)
}

const NOTIFICATIONS = [
	["MO", "Mara Okafor", "collected your edition", "2m", true],
	["SR", "Sam Rivera", "left a comment on Dusk", "1h", false],
] as const

export function NotificationsScene() {
	return (
		<Stage>
			<Card className={cn(SCENE, "overflow-hidden")}>
				<CardList>
				{NOTIFICATIONS.map(([initials, name, what, when, unread]) => (
					<Entity
						key={name}
						leading={<Avatar size="sm" fallback={initials} alt={name} />}
						title={
							<>
								{name}
								{unread ? <span className="sr-only"> (unread)</span> : null}
							</>
						}
						subtitle={what}
						action={
							<span className="flex items-center gap-1.5 text-caption text-muted-foreground">
								{when}
								{unread ? <StatusDot tone="info" /> : null}
							</span>
						}
					/>
				))}
				</CardList>
			</Card>
		</Stage>
	)
}

// The bar's class is written out whole so Tailwind finds it; the tone feeds StatusDot.
const SALES = [
	["Editions", "edition", "bg-tone-edition", 42],
	["Collectibles", "collectible", "bg-tone-collectible", 27],
	["Standard", "standard", "bg-tone-standard", 19],
	["Commissions", "info", "bg-tone-info", 12],
] as const

/** Revenue split by type — the palette's decorative tones doing real work. */
export function StatScene() {
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					<CardDescription>Revenue this month</CardDescription>
					<CardAction>
						<Badge tone="success" size="sm">+8.2%</Badge>
					</CardAction>
				</CardHeader>
				<CardContent className="flex flex-col gap-4 pt-2">
					<span className="text-mono-xl">$12,480</span>
					{/* Drawn by hand: the library's Meter shows one value, and has no
					    stacked, multi-segment form. */}
					<div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Revenue by type">
						{SALES.map(([label, , bar, pct]) => (
							<span key={label} className={bar} style={{ width: `${pct}%` }} />
						))}
					</div>
					{/* Two columns while each entry fits whole, one when they would not:
					    sized in em, so a larger type or a narrower card drops to one. */}
					<Grid role="list" minItemWidth="9.5em" gap="calc(var(--spacing) * 1.5) calc(var(--spacing) * 4)">
						{SALES.map(([label, tone, , pct]) => (
							<div role="listitem" key={label} className="flex items-center gap-2 text-body-sm">
								<StatusDot tone={tone} />
								<span className="flex-1 text-muted-foreground">{label}</span>
								<span className="text-mono-caption">{pct}%</span>
							</div>
						))}
					</Grid>
				</CardContent>
			</Card>
		</Stage>
	)
}

export function SettingsScene() {
	return (
		<Stage>
			<Card className={cn(SCENE, "overflow-hidden")}>
				<CardList>
				{(
					[
						["Email notifications", "Replies and mentions", true],
						["Push notifications", "On this device", false],
						["Weekly digest", "Every Monday", true],
					] as const
				).map(([title, detail, on]) => (
					<Entity key={title} title={title} subtitle={detail} action={<Switch defaultChecked={on} aria-label={title} />} />
				))}
				</CardList>
			</Card>
		</Stage>
	)
}

function InviteScene() {
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					<CardTitle>Invite your team</CardTitle>
					<CardDescription>Collaborators can edit every project.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<AvatarGroup aria-label="4 collaborators" size="sm" surface="card">
						{["MO", "SR", "JL", "AK"].map((i) => (
							<Avatar key={i} fallback={i} alt={i} />
						))}
					</AvatarGroup>
					<div className="flex gap-2">
						<Input placeholder="name@company.com" aria-label="Email address" />
						<Button>Send</Button>
					</div>
				</CardContent>
			</Card>
		</Stage>
	)
}

export function ChatScene() {
	return (
		<Stage>
			{/* On a card, not the stage: incoming bubbles are the muted surface,
			    the same tone as the stage itself. */}
			<Card className={SCENE}>
				<CardContent className="flex flex-col gap-2">
					<Message messageId="s1">
						<Bubble>Is the new cover ready?</Bubble>
					</Message>
					<Message messageId="s2" align="end">
						<Bubble variant="primary" align="end">Uploading it now 🎉</Bubble>
					</Message>
					<Message messageId="s3">
						<Bubble>Perfect, thank you!</Bubble>
					</Message>
				</CardContent>
			</Card>
		</Stage>
	)
}

// The canvas shows the real palette, not a mock of one. Selecting a row is a
// no-op here: the scene is a specimen, not a menu that navigates.
const COMMANDS: CommandItem[] = [
	{ group: "Actions", icon: "plus", label: "New project", hint: <Kbd>N</Kbd>, onSelect: () => {} },
	{ group: "Actions", icon: "user", label: "Invite teammate", hint: <Kbd>I</Kbd>, onSelect: () => {} },
	{ group: "Actions", icon: "gear", label: "Open settings", hint: <Kbd>,</Kbd>, onSelect: () => {} },
]

function CommandScene() {
	return (
		<Stage>
			<CommandMenuPanel className={cn(SCENE, "shadow-sm")} placeholder="Type a command…" items={COMMANDS} />
		</Stage>
	)
}

/** A type specimen: the scale itself is the subject, so it is bare type. */
function TypeScene() {
	return (
		<Stage>
			<div className={cn(SCENE, "flex flex-col gap-3 text-center")}>
				<span className="text-display-lg leading-none">Aa</span>
				<span className="text-heading-4">The quick brown fox</span>
				<span className="text-body-sm text-muted-foreground">Headings, body and mono follow the preset and the type you pick.</span>
				<span className="text-mono-md text-muted-foreground">0123456789</span>
			</div>
		</Stage>
	)
}

/**
 * Artwork painted from the palette: a soft mesh of the decorative tones over
 * the brand. Each scene passes its own arrangement so the covers differ, but
 * all of them move with Customize → Color → Palette.
 */
const ART_TONES = ["info", "collectible", "edition", "standard"] as const
function artwork(spots: readonly (readonly [number, number, number])[]): string {
	return [
		...spots.map(
			([x, y, reach], i) =>
				// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
				`radial-gradient(in oklab at ${x}% ${y}%, oklch(from var(--tone-${ART_TONES[i % ART_TONES.length]}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent ${reach}%)`,
		),
		"var(--primary)",
	].join(", ")
}

export function NowPlayingScene() {
	const [playing, setPlaying] = useState(true)
	return (
		<Stage>
			<Card className={SCENE}>
				<CardContent className="flex flex-col gap-4">
					{/* Entity's own row padding is for lists; inside a card's content the
					    card already pads it. */}
					<Entity
						className="p-0"
						leading={<div aria-hidden className="size-14 rounded-md" style={{ background: artwork([[20, 20, 70], [85, 30, 60], [60, 90, 65]]) }} />}
						title="Low tide, high noon"
						subtitle="Juno Avery"
						action={
							<Button variant="ghost" size="icon-sm" aria-label="Like">
								<Icon name="heart" />
							</Button>
						}
					/>
					<div className="flex flex-col gap-1.5">
						<Slider defaultValue={38} aria-label="Position" />
						<div className="flex justify-between text-mono-caption text-muted-foreground">
							<span>1:24</span>
							<span>-2:16</span>
						</div>
					</div>
					<div className="flex items-center justify-center gap-3">
						<Button variant="ghost" size="icon" aria-label="Previous">
							<Icon name="previous" variant="solid" />
						</Button>
						<Button size="icon" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
							<Icon name={playing ? "pause" : "play"} variant="solid" />
						</Button>
						<Button variant="ghost" size="icon" aria-label="Next">
							<Icon name="next" variant="solid" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</Stage>
	)
}

export function EventScene() {
	return (
		<Stage>
			<Card className={SCENE}>
				<CardContent className="flex gap-4">
					{/* Drawn by hand: the library has no date tile. The corner follows
					    the look up to a cap: past about the band's own height, the curve
					    starts cutting into the band and its text. */}
					<div className="grid h-fit w-14 shrink-0 overflow-hidden rounded-[min(var(--radius-md),--spacing(3))] bg-muted text-center">
						<span className="bg-primary py-0.5 text-label-sm text-primary-foreground">Oct</span>
						<span className="py-1.5 text-heading-3">14</span>
					</div>
					{/* content-start: the column stretches to the date tile's height,
					    and its two lines must not spread out to fill it. */}
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						{/* The row carries the title's type, so the badge's box is exactly
						    one title line (`h-[1lh]`): it centres on the title and never
						    makes the row taller than the title alone. When a bolder or
						    roomier look leaves no space beside the title, the badge wraps
						    to its own line instead of squeezing the title onto two. */}
						<div className="flex flex-wrap items-start justify-between gap-x-2 text-title-lg">
							<CardTitle>Design review</CardTitle>
							<span className="flex h-[1lh] shrink-0 items-center">
								<Badge tone="info" size="sm">
									In 10 min
								</Badge>
							</span>
						</div>
						<CardDescription>Tuesday, 2:00 – 2:45 PM</CardDescription>
					</div>
				</CardContent>
				{/* `fit`: when a roomy look tightens the row, the stack gives up
				    avatars to the count instead of pushing the actions to a new line. */}
				<CardFooter className="flex-wrap justify-between gap-3">
					<AvatarGroup aria-label="7 attendees" total={7} size="sm" surface="card" fit>
						{["MO", "SR", "JL"].map((i) => (
							<Avatar key={i} fallback={i} alt={i} />
						))}
					</AvatarGroup>
					<div className="flex gap-2">
						<Button variant="outline" size="sm">
							Decline
						</Button>
						<Button size="sm">Join</Button>
					</div>
				</CardFooter>
			</Card>
		</Stage>
	)
}

export function ProfileScene() {
	const [following, setFollowing] = useState(false)
	return (
		<Stage>
			<Card className={cn(SCENE, "overflow-hidden")}>
				<div aria-hidden className="h-20" style={{ background: artwork([[10, 50, 60], [50, 0, 55], [90, 60, 60], [40, 100, 50]]) }} />
				{/* pt-0: the avatar rises into the banner above, so the content
				    starts at the banner's edge rather than a full pad below it. */}
				<CardContent className="flex flex-col gap-3 pt-0">
					<div className="flex items-start justify-between">
						<Avatar size="lg" fallback="JA" alt="Juno Avery" className="-mt-6 ring-4 ring-card" />
						<div className="flex gap-1.5 pt-3">
							<Button variant="ghost" size="icon-sm" aria-label="Share profile">
								<Icon name="share" />
							</Button>
							<Button size="sm" variant={following ? "secondary" : "primary"} onClick={() => setFollowing(!following)}>
								{following ? "Following" : "Follow"}
							</Button>
						</div>
					</div>
					<div className="flex flex-col gap-0.5">
						<CardTitle>Juno Avery</CardTitle>
						<CardDescription>@juno · Sound and light</CardDescription>
					</div>
					<p className="text-body-sm">Field recordings, slowed down. New edition every full moon.</p>
					<div className="flex gap-4 text-body-sm">
						<span>
							<span className="text-label-lg">128</span> <span className="text-muted-foreground">posts</span>
						</span>
						<span>
							<span className="text-label-lg">4.2k</span> <span className="text-muted-foreground">followers</span>
						</span>
					</div>
				</CardContent>
			</Card>
		</Stage>
	)
}

const TASKS = [
	["Pick the cover type", "Design", "collectible", true],
	["Wire up checkout", "Engineering", "info", false],
	["Draft launch post", "Launch", "edition", false],
] as const

export function TasksScene() {
	const [done, setDone] = useState<boolean[]>(TASKS.map((t) => t[3]))
	const id = useId()
	const left = done.filter((d) => !d).length
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					<CardTitle>This week</CardTitle>
					<CardAction>
						<span className="text-caption text-muted-foreground">{left} left</span>
					</CardAction>
				</CardHeader>
				<CardContent>
					<ul className="flex flex-col gap-1">
						{TASKS.map(([title, tag, tone], i) => (
							<li key={title} className="flex items-center gap-3 py-1.5">
								<Checkbox id={`${id}-${i}`} checked={done[i]} onCheckedChange={(v: boolean) => setDone(done.map((d, j) => (j === i ? v : d)))} />
								<Label htmlFor={`${id}-${i}`} className={cn("min-w-0 flex-1 motion-interactive", done[i] ? "text-muted-foreground line-through" : "")}>
									{title}
								</Label>
								<Badge tone={tone} size="sm">
									{tag}
								</Badge>
							</li>
						))}
					</ul>
				</CardContent>
				<CardFooter>
					<Button variant="ghost" size="sm" iconStart={<Icon name="plus" />}>
						Add task
					</Button>
				</CardFooter>
			</Card>
		</Stage>
	)
}

export function SignInScene() {
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					<CardTitle>Welcome back</CardTitle>
					<CardDescription>Sign in to pick up where you left off.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Input type="email" placeholder="you@studio.com" aria-label="Email" />
						<Input type="password" placeholder="Password" aria-label="Password" />
					</div>
					<Button className="w-full">Sign in</Button>
					<Separator label="or" />
					<Button variant="outline" className="w-full" iconStart={<Icon name="lock" />}>
						Use a passkey
					</Button>
				</CardContent>
			</Card>
		</Stage>
	)
}

function UploadScene() {
	return (
		<Stage>
			<div className={cn(SCENE, "flex flex-col gap-2")}>
				<Attachment
					name="brand-guidelines.pdf"
					meta="4.2 MB of 6.8 MB"
					status="uploading"
					progress={62}
					actions={
						<Button variant="ghost" size="icon-sm" aria-label="Cancel upload">
							<Icon name="xmark" />
						</Button>
					}
				/>
				<Attachment
					name="cover-final.png"
					icon="image-stack"
					meta="Uploaded · 2.1 MB"
					// The same box as the icon-sm button above, so the check centres on
					// the cancel button's line instead of hugging the edge.
					actions={
						<span className="grid size-(--control-sm) place-items-center">
							<Icon name="circle-check" className="text-success" aria-label="Uploaded" />
						</span>
					}
				/>
			</div>
		</Stage>
	)
}

const ACTIVITY = [
	["Sold “Dusk, no. 4”", "Edition · 2h ago", "+0.80", "edition"],
	["Royalty", "Collectible · Yesterday", "+0.12", "collectible"],
	["Withdrawal", "To Phantom · Mon", "-1.50", "standard"],
] as const

export function WalletScene() {
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					<CardDescription>Balance</CardDescription>
					<CardTitle className="text-mono-xl">14.62 SOL</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<div className="grid grid-cols-2 gap-2">
						<Button iconStart={<Icon name="arrow-up" />}>Send</Button>
						<Button variant="secondary" iconStart={<Icon name="arrow-down" />}>
							Receive
						</Button>
					</div>
					<div className="flex flex-col">
						{ACTIVITY.map(([title, detail, amount, tone]) => (
							<Entity
								key={title}
								className="px-0"
								leading={
									<span
										aria-hidden
										className="block size-8 rounded-full"
										// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
										style={{ background: `oklch(from var(--tone-${tone}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h)` }}
									/>
								}
								title={title}
								subtitle={detail}
								action={<span className={cn("text-mono-md", amount.startsWith("+") ? "text-success" : "text-muted-foreground")}>{amount}</span>}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</Stage>
	)
}

function FeedbackScene() {
	const [score, setScore] = useState<string>("4")
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					<CardTitle>How was the session?</CardTitle>
					<CardDescription>One tap is enough. Notes help us more.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<ToggleGroup value={[score]} onValueChange={(v: unknown[]) => v[0] && setScore(String(v[0]))} aria-label="Rating" className="w-full">
						{["1", "2", "3", "4", "5"].map((n) => (
							<Toggle key={n} value={n} className="flex-1">
								{n}
							</Toggle>
						))}
					</ToggleGroup>
					<Textarea placeholder="What worked, what didn’t…" aria-label="Notes" rows={3} />
				</CardContent>
				<CardFooter className="justify-end">
					<Button variant="ghost" size="sm">
						Skip
					</Button>
					<Button size="sm">Send feedback</Button>
				</CardFooter>
			</Card>
		</Stage>
	)
}

const SHIPPING = [
	["Order placed", "Oct 9, 10:14 AM"],
	["Printed and packed", "Oct 10, 4:02 PM"],
	["Out for delivery", "Arriving today by 6 PM"],
	["Delivered", undefined],
] as const

export function ShippingScene() {
	return (
		<Stage>
			<Card className={SCENE}>
				<CardHeader>
					{/* design-lint-disable-next-line inline-color -- an order number, not a colour */}
					<CardTitle>Order #2048</CardTitle>
					<CardDescription>Giclée print, 18 × 24 in</CardDescription>
					<CardAction>
						<Badge tone="warning" size="sm">
							In transit
						</Badge>
					</CardAction>
				</CardHeader>
				<CardContent>
					<Stepper orientation="vertical" indicator="dot" current={2} aria-label="Delivery status">
						{SHIPPING.map(([title, detail]) => (
							<StepperItem key={title} title={title} description={detail} />
						))}
					</Stepper>
				</CardContent>
			</Card>
		</Stage>
	)
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
			<CollectScene />
			<BillingScene />
			<NowPlayingScene />
			<StatScene />
			<TypeScene />
			<ProfileScene />
			<NotificationsScene />
			<EventScene />
			<SignInScene />
			<TasksScene />
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
	// Customize panel every page uses (the shell makes room for it).
	const { setOpen } = useCustomizer()
	const [target, setTarget] = useState(() => new URLSearchParams(location.search).get('target') === 'ios' ? 'ios' : 'web')
	const [showIos, setShowIos] = useState(target === 'ios')
	useEffect(() => { setOpen(true) }, [setOpen])
	return (
		<div className="pb-[50vh] lg:pb-0">
			<h1 className="sr-only">Customize Sable</h1>
			<Tabs value={target} onValueChange={value => {
				const next = String(value)
				setTarget(next)
				if (next === 'ios') setShowIos(true)
				const url = new URL(location.href)
				if (next === 'ios') url.searchParams.set('target', 'ios')
				else url.searchParams.delete('target')
				history.replaceState(history.state, '', url)
			}}>
				<div className="flex items-center justify-between gap-4 mb-6">
					<TabsList variant="pill" aria-label="Canvas platform"><TabsTrigger value="web">Web</TabsTrigger><TabsTrigger value="ios">iOS</TabsTrigger></TabsList>
				</div>
				<TabsPanel value="web" keepMounted><ThemeCanvas /></TabsPanel>
				<TabsPanel value="ios" keepMounted>{showIos && <IosCanvasPreview />}</TabsPanel>
			</Tabs>
		</div>
	)
}
