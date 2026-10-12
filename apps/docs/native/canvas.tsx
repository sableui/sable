import { type ReactNode, StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { Button, Card, CardContent, CardList, Entity, Field, Icon, IconProvider, Input, MotionProvider, Switch, ToastProvider, fallbackIconSet, toast } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import { IosBackLink, IosIconButton, IosNavbar, IosPage, IosSheet, IosTab, IosTabbar, NativeApp, NavigationStack, useNavigation } from "@sableui/react/ios"
import { useIosPreviewTheme } from "@sableui/react/ios/preview"
import {
	BillingScene,
	CanvasContent,
	ChatScene,
	CollectScene,
	EventScene,
	FeedbackScene,
	InviteScene,
	NotificationsScene,
	NowPlayingScene,
	ProfileScene,
	ShippingScene,
	SignInScene,
	StatScene,
	TasksScene,
	TypeScene,
	UploadScene,
	WalletScene,
} from "../src/pages/CustomizeCanvas"
import "./canvas.css"

/*
 * The canvas on iPhone: one document. useIosPreviewTheme sets the Customize
 * panel's resolved tokens on <html>, where Sable's styles and the iOS adapter
 * both read them, so the real canvas scenes and the native chrome follow the
 * same preset. Every screen is Sable, the Settings tab included; the adapter
 * supplies only the iOS chrome (navigation bars, tab bar, sheet).
 *
 * Every web scene is here except the command menu, which the iOS map marks
 * "redesign": a desktop palette has no honest phone form.
 */
type Destination = "explore" | "activity" | "settings"
const destinations: { id: Destination; label: string; icon: string }[] = [
	{ id: "explore", label: "Explore", icon: "grid" },
	{ id: "activity", label: "Activity", icon: "list" },
	{ id: "settings", label: "Settings", icon: "gear" },
]

/** A grouped section on an iOS screen: a heading on the page margin over Sable content. */
function Section({ title, children }: { title?: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-2 px-(--ios-inset) pb-6">
			{title ? <h2 className="text-title-sm text-muted-foreground">{title}</h2> : null}
			{children}
		</section>
	)
}

/** Scenes stacked down the screen, at the phone's width. */
function Scenes({ children }: { children: ReactNode }) {
	return (
		<CanvasContent>
			<div className="flex flex-col items-center gap-6 px-(--ios-inset) pb-6">{children}</div>
		</CanvasContent>
	)
}

function OrderDetail() {
	const navigation = useNavigation()
	return (
		<IosPage>
			<IosNavbar title="Order" left={<IosBackLink onClick={navigation.pop}>Explore</IosBackLink>} />
			<Scenes>
				<ShippingScene />
			</Scenes>
		</IosPage>
	)
}

/** The native layer, one tap each: a sheet, a notification and a pushed screen. */
function TryIt({ onFeedback, onActivity }: { onFeedback: () => void; onActivity: () => void }) {
	const navigation = useNavigation()
	const chevron = <Icon name="chevron-right" className="text-muted-foreground" />
	return (
		<Section title="Try the iOS layer">
			<Card>
				<CardList>
					<Entity
						interactive
						density="comfortable"
						onSelect={onFeedback}
						leading={<Icon name="comment" className="text-xl text-muted-foreground" />}
						title="Rate this session"
						subtitle="Opens a sheet"
						action={chevron}
					/>
					<Entity
						interactive
						density="comfortable"
						onSelect={() => {
							const id = toast.info("Mara collected “Dusk, no. 4”", {
								description: "Edition 3 of 25 · just now",
								// An action doesn't dismiss on its own; View both closes it and goes there.
								actionProps: {
									children: "View",
									onClick: () => {
										toast.dismiss(id)
										onActivity()
									},
								},
							})
						}}
						leading={<Icon name="bell" className="text-xl text-muted-foreground" />}
						title="Show a notification"
						subtitle="Slides in from the top"
						action={chevron}
					/>
					<Entity
						interactive
						density="comfortable"
						onSelect={() => navigation.push("order", <OrderDetail />)}
						leading={<Icon name="inbox" className="text-xl text-muted-foreground" />}
						// design-lint-disable-next-line inline-color -- an order number, not a colour
						title="Track order #2048"
						subtitle="Pushes a screen"
						action={chevron}
					/>
				</CardList>
			</Card>
		</Section>
	)
}

/** `?bare`: shown edge to edge on a real phone, which draws its own status bar and home indicator. */
const BARE = new URLSearchParams(location.search).has("bare")

function CanvasApp() {
	const look = useIosPreviewTheme()
	const [tab, setTab] = useState<Destination>("explore")
	const [about, setAbout] = useState(false)
	const [feedback, setFeedback] = useState(false)
	const [signIn, setSignIn] = useState(false)
	const [email, setEmail] = useState(true)
	const [push, setPush] = useState(false)
	const [digest, setDigest] = useState(true)
	const [name, setName] = useState("Mara Okafor")
	const info = (
		<IosIconButton onClick={() => setAbout(true)} aria-label="About this canvas">
			<Icon name="info" className="shrink-0 text-xl" />
		</IosIconButton>
	)
	return (
		<IconProvider set={look?.icons === "fallback" ? fallbackIconSet : reiconIconSet}>
			<MotionProvider>
				<NativeApp mode={look?.mode ?? "light"} reducedMotion={look?.reducedMotion} systemChrome={!BARE}>
					{/* Inside NativeApp, so the stack can sit under the status bar like an iOS notification. */}
					<ToastProvider position="top-center" viewportClassName="top-(--ios-safe-top)">
						<NavigationStack active={tab === "explore"} label="Explore">
							<IosPage>
								<IosNavbar large title="Explore" right={info} />
								<p className="px-(--ios-inset) pb-4 text-body-md text-muted-foreground">Art, memberships, and a little activity.</p>
								<TryIt onFeedback={() => setFeedback(true)} onActivity={() => setTab("activity")} />
								<Scenes>
									<CollectScene />
									<NowPlayingScene />
									<ProfileScene />
									<BillingScene />
									<StatScene />
									<EventScene />
									<WalletScene />
									<TypeScene />
								</Scenes>
							</IosPage>
						</NavigationStack>
						<NavigationStack active={tab === "activity"} label="Activity">
							<IosPage>
								<IosNavbar large title="Activity" right={info} />
								<p className="px-(--ios-inset) pb-4 text-body-md text-muted-foreground">The same collection, delivery updates and the work in flight.</p>
								<Scenes>
									<NotificationsScene />
									<ShippingScene />
									<TasksScene />
									<UploadScene />
									<ChatScene />
								</Scenes>
							</IosPage>
						</NavigationStack>
						<NavigationStack active={tab === "settings"} label="Settings">
							<IosPage>
								<IosNavbar large title="Settings" />
								<Section title="Profile">
									<Card>
										<CardContent>
											<Field label="Name">
												<Input value={name} onChange={(event) => setName(event.target.value)} />
											</Field>
										</CardContent>
									</Card>
								</Section>
								<Section title="Notifications">
									<Card>
										<CardList>
											<Entity density="comfortable" title="Email notifications" subtitle="Replies and mentions" action={<Switch aria-label="Email notifications" checked={email} onCheckedChange={setEmail} />} />
											<Entity density="comfortable" title="Push notifications" subtitle="On this device" action={<Switch aria-label="Push notifications" checked={push} onCheckedChange={setPush} />} />
											<Entity density="comfortable" title="Weekly digest" subtitle="Every Monday" action={<Switch aria-label="Weekly digest" checked={digest} onCheckedChange={setDigest} />} />
										</CardList>
									</Card>
									<p className="text-body-sm text-muted-foreground">The same settings as the web canvas. Changes stay in this demo.</p>
								</Section>
								<Scenes>
									<InviteScene onSend={() => toast.success("Invite sent")} />
								</Scenes>
								<Section>
									<Button variant="secondary" size="cta" iconStart={<Icon name="logout" />} onClick={() => setSignIn(true)}>
										Sign out
									</Button>
								</Section>
							</IosPage>
						</NavigationStack>
						<IosTabbar aria-label="Canvas app navigation">
							{destinations.map((destination) => (
								<IosTab
									key={destination.id}
									active={tab === destination.id}
									onClick={() => setTab(destination.id)}
									icon={<Icon name={destination.icon} className="shrink-0 text-2xl" />}
									label={destination.label}
								/>
							))}
						</IosTabbar>
						<IosSheet open={about} onOpenChange={setAbout} title="About this canvas">
							<p className="text-body-md text-muted-foreground">
								These are the web canvas’s real scenes, in your current preset. Navigation, the tab bar and these sheets are the native iOS layer; everything inside them is Sable.
							</p>
						</IosSheet>
						<IosSheet open={feedback} onOpenChange={setFeedback} title="Feedback" background="opaque">
							<CanvasContent>
								<FeedbackScene
									framed={false}
									onDone={(sent) => {
										setFeedback(false)
										if (sent) toast.success("Thanks for the feedback")
									}}
								/>
							</CanvasContent>
						</IosSheet>
						<IosSheet open={signIn} onOpenChange={setSignIn} title="Sign in" detent="large">
							<CanvasContent>
								<SignInScene
									framed={false}
									onSignIn={() => {
										setSignIn(false)
										toast.success(`Signed in as ${name}`)
									}}
								/>
							</CanvasContent>
						</IosSheet>
					</ToastProvider>
				</NativeApp>
			</MotionProvider>
		</IconProvider>
	)
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<CanvasApp />
	</StrictMode>,
)
