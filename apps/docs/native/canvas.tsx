import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { Card, CardContent, CardList, Entity, Field, Icon, IconProvider, Input, MotionProvider, Switch, fallbackIconSet } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import { IosIconButton, IosNavbar, IosPage, IosSheet, IosTab, IosTabbar, NativeApp, NavigationStack } from "@sableui/react/ios"
import { useIosPreviewTheme } from "@sableui/react/ios/preview"
import { BillingScene, CanvasContent, CollectScene, NotificationsScene, ShippingScene, StatScene } from "../src/pages/CustomizeCanvas"
import "./canvas.css"

/*
 * The canvas on iPhone: one document. useIosPreviewTheme sets the Customize
 * panel's resolved tokens on <html>, where Sable's styles and the iOS adapter
 * both read them, so the real canvas scenes and the native chrome follow the
 * same preset. Every screen is Sable, the Settings tab included; the adapter
 * supplies only the iOS chrome (navigation bars, tab bar, sheet).
 */
type Destination = "gallery" | "activity" | "settings"
const destinations: { id: Destination; label: string; icon: string }[] = [
	{ id: "gallery", label: "Explore", icon: "grid" },
	{ id: "activity", label: "Activity", icon: "list" },
	{ id: "settings", label: "Settings", icon: "gear" },
]

function Scenes({ destination }: { destination: Destination }) {
	return (
		<CanvasContent>
			<p className="px-(--ios-inset) pb-4 text-body-md text-muted-foreground">
				{destination === "gallery" ? "Art, memberships, and a little activity." : "The same collection and delivery updates."}
			</p>
			<div className="flex flex-col items-center gap-6 px-(--ios-inset) pb-6">
				{destination === "gallery" ? (
					<>
						<CollectScene />
						<BillingScene />
						<StatScene />
					</>
				) : (
					<>
						<NotificationsScene />
						<ShippingScene />
					</>
				)}
			</div>
		</CanvasContent>
	)
}

function CanvasApp() {
	const look = useIosPreviewTheme()
	const [tab, setTab] = useState<Destination>("gallery")
	const [about, setAbout] = useState(false)
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
				<NativeApp mode={look?.mode ?? "light"} reducedMotion={look?.reducedMotion}>
					<NavigationStack active={tab === "gallery"} label="Explore">
						<IosPage>
							<IosNavbar large title="Explore" right={info} />
							<Scenes destination="gallery" />
						</IosPage>
					</NavigationStack>
					<NavigationStack active={tab === "activity"} label="Activity">
						<IosPage>
							<IosNavbar large title="Activity" right={info} />
							<Scenes destination="activity" />
						</IosPage>
					</NavigationStack>
					<NavigationStack active={tab === "settings"} label="Settings">
						<IosPage>
							<IosNavbar large title="Settings" />
							<section className="flex flex-col gap-2 px-(--ios-inset) pb-6">
								<h2 className="text-title-sm text-muted-foreground">Profile</h2>
								<Card>
									<CardContent>
										<Field label="Name">
											<Input value={name} onChange={(event) => setName(event.target.value)} />
										</Field>
									</CardContent>
								</Card>
							</section>
							<section className="flex flex-col gap-2 px-(--ios-inset) pb-6">
								<h2 className="text-title-sm text-muted-foreground">Notifications</h2>
								<Card>
									<CardList>
										<Entity density="comfortable" title="Email notifications" subtitle="Replies and mentions" action={<Switch aria-label="Email notifications" checked={email} onCheckedChange={setEmail} />} />
										<Entity density="comfortable" title="Push notifications" subtitle="On this device" action={<Switch aria-label="Push notifications" checked={push} onCheckedChange={setPush} />} />
										<Entity density="comfortable" title="Weekly digest" subtitle="Every Monday" action={<Switch aria-label="Weekly digest" checked={digest} onCheckedChange={setDigest} />} />
									</CardList>
								</Card>
								<p className="text-body-sm text-muted-foreground">The same settings as the web canvas. Changes stay in this demo.</p>
							</section>
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
							These are the web canvas’s real cards, badges, billing choices and activity rows, in your current preset. Navigation, settings and this sheet use native iOS controls.
						</p>
					</IosSheet>
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
