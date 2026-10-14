import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/card"
import { Input } from "../components/input"
import { Separator } from "../components/separator"
import { StatusDot } from "../components/status-dot"
import { Icon } from "../icon"
import { Grid, Region, Row, Stack } from "../layout"
import { Reveal, TextReveal } from "../motion"

// ---pattern-code---
const navItems = [
	{ label: "Platform", href: "#platform" },
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Customers", href: "#customers" },
	{ label: "Pricing", href: "/pricing" },
]

const spaces = [
	{ name: "Waypoint", value: "98.4%", label: "clear routes" },
	{ name: "Fielddesk", value: "12", label: "open holds" },
	{ name: "Archive", value: "4.8k", label: "sealed records" },
]

const routes = [
	{ label: "Intake", state: "Open", tone: "info" as const },
	{ label: "Review", state: "Live", tone: "1" as const },
	{ label: "Archive", state: "Safe", tone: "success" as const },
]

// Weekly approvals: past weeks recede, the current week carries the signal.
const bars = [
	{ week: "w1", height: "38%", current: false },
	{ week: "w2", height: "56%", current: false },
	{ week: "w3", height: "44%", current: false },
	{ week: "w4", height: "68%", current: false },
	{ week: "w5", height: "52%", current: false },
	{ week: "w6", height: "78%", current: false },
	{ week: "w7", height: "60%", current: false },
	{ week: "w8", height: "72%", current: false },
	{ week: "w9", height: "88%", current: true },
]

const sceneMetrics = [
	{ label: "Cleared", value: "1.8M", detail: "last 30 days" },
	{ label: "Review", value: "42s", detail: "median path" },
	{ label: "Spaces", value: "284", detail: "active teams" },
]

const values = [
	{
		icon: "lock" as const,
		title: "Private by default",
		body: "Roles, approvals, and handoff history stay with the people who need them. No shared inboxes, no forwarded screenshots.",
	},
	{
		icon: "bell" as const,
		title: "Signals before surprises",
		body: "Cove watches every route and surfaces stalled reviews and expiring approvals while there is still time to act.",
	},
	{
		icon: "clock" as const,
		title: "A trail for every decision",
		body: "Each approval keeps its context, reviewer, and timestamp, so an audit takes an afternoon instead of a quarter.",
	},
]

const steps = [
	{
		number: "01",
		title: "Connect your spaces",
		body: "Bring teams, vendors, and record stores into one workspace, with roles that mirror how you already work.",
	},
	{
		number: "02",
		title: "Route every approval",
		body: "Requests follow the path you define, with reviewers, deadlines, and escalation built in from the start.",
	},
	{
		number: "03",
		title: "Seal the record",
		body: "Approved work is archived with its full context and is ready for review the moment it closes.",
	},
]

const outcomes = [
	{ value: "3.2×", label: "faster approvals in the first quarter" },
	{ value: "68%", label: "fewer follow-ups on handoffs" },
	{ value: "1 day", label: "to prepare a quarterly audit" },
]

const footerGroups = [
	{
		title: "Platform",
		links: [
			{ label: "Overview", href: "#platform" },
			{ label: "Signals", href: "/signals" },
			{ label: "Approvals", href: "/approvals" },
			{ label: "Records", href: "/records" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Security", href: "/security" },
			{ label: "Customers", href: "#customers" },
			{ label: "Careers", href: "/careers" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Guides", href: "/guides" },
			{ label: "Status", href: "/status" },
			{ label: "Changelog", href: "/changelog" },
			{ label: "Docs", href: "/docs" },
		],
	},
]

const legalLinks = [
	{ label: "Privacy", href: "/privacy" },
	{ label: "Terms", href: "/terms" },
	{ label: "Contact", href: "/contact" },
]

export function BrandLandingPage() {
	return (
		<div className="min-h-dvh overflow-hidden bg-background text-foreground">
			<header className="relative z-10 pt-4">
				<Region max="wide">
					<nav
						aria-label="Main"
						className="flex min-h-15 items-center justify-between gap-3 rounded-full border border-border bg-card/90 px-3 py-2 shadow-sm backdrop-blur"
					>
						<a href="/" className="flex items-center gap-2 rounded-full px-2 motion-interactive motion-press">
							<span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
								<Icon name="sparkles" className="text-sm" />
							</span>
							<span className="text-title-lg">Cove</span>
						</a>
						<div className="hidden lg:block">
							<Row gap={1}>
								{navItems.map((item) => (
									<Button key={item.label} variant="ghost" size="sm" render={<a href={item.href} />}>
										{item.label}
									</Button>
								))}
							</Row>
						</div>
						<Row gap={1}>
							<Button variant="ghost" size="sm" className="max-sm:hidden" render={<a href="/login" />}>
								Sign in
							</Button>
							<Button size="sm" render={<a href="/demo" />}>
								Request access
							</Button>
						</Row>
					</nav>
				</Region>
			</header>

			<main>
				<Region as="section" max="wide" className="pb-20 pt-14 sm:pt-20 lg:pb-28">
					<div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
						<Stack gap={3} className="max-w-2xl">
							<Badge appearance="outline" icon={<Icon name="lock" className="text-sm" />}>
								Private operations, made legible
							</Badge>
							<TextReveal
								as="h1"
								text="A calmer command center for high-trust work"
								className="text-balance text-display-lg sm:text-display-2xl"
								once
							/>
							<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
								Cove gives teams a polished front door and a serious operating
								surface: approvals, signals, records, and handoffs in one
								understandable flow.
							</p>
							<Row gap={2} wrap className="pt-3">
								<Button size="cta" render={<a href="/demo" />}>
									Book a walkthrough
								</Button>
								<Button size="cta" variant="outline" render={<a href="#platform" />}>
									Explore the platform
								</Button>
							</Row>
						</Stack>

						{/* The product scene is a dark island: `dark` re-scopes every
						    semantic token, so its surfaces, muted ink and status tones
						    are the theme's own dark values in either page mode. It is a
						    picture of the product, so it stays out of the tab order and
						    the accessibility tree; the hero copy carries its meaning. */}
						<div className="dark" aria-hidden inert>
							<div className="overflow-hidden rounded-xl border border-border-floating bg-popover p-3 text-popover-foreground shadow-xl">
								{/* Nested surfaces take concentric corners: each level's radius is
								    the shell's xl minus every inset between it and the shell edge. */}
								<div className="rounded-concentric-xl/3 border border-border bg-card">
									<div className="flex items-center justify-between border-b border-border px-4 py-3">
										<Row gap={1}>
											<StatusDot tone="warning" />
											<StatusDot tone="1" />
											<StatusDot tone="success" />
										</Row>
										<span className="text-label-sm text-muted-foreground">Live workspace</span>
									</div>
									<div className="grid gap-3 p-3 md:grid-cols-[0.7fr_1.3fr]">
										<div className="space-y-3 max-md:hidden">
											<div className="rounded-concentric-xl/6 border border-border bg-background p-4">
												<p className="text-label-sm text-muted-foreground">Spaces</p>
												<div className="mt-4 space-y-2">
													{spaces.map((space) => (
														<div key={space.name} className="rounded-concentric-xl/10 bg-card p-3">
															<Row justify="between">
																<span className="text-title-sm">{space.name}</span>
																<span className="text-mono-sm">{space.value}</span>
															</Row>
															<p className="mt-1 text-body-xs text-muted-foreground">{space.label}</p>
														</div>
													))}
												</div>
											</div>
											<div className="rounded-concentric-xl/6 border border-border bg-background p-4">
												<Row justify="between">
													<span className="text-title-sm">Route status</span>
													<Badge tone="success" size="sm" dot>
														Healthy
													</Badge>
												</Row>
												<div className="mt-4 space-y-2">
													{routes.map((route) => (
														<Row key={route.label} justify="between" className="rounded-full bg-card px-3 py-2">
															<Row gap={1}>
																<StatusDot tone={route.tone} />
																<span className="text-body-sm">{route.label}</span>
															</Row>
															<span className="text-label-sm text-muted-foreground">{route.state}</span>
														</Row>
													))}
												</div>
											</div>
										</div>

										<div className="rounded-concentric-xl/6 border border-border bg-background p-4">
											<Row justify="between" className="border-b border-border pb-4">
												<div>
													<p className="text-label-sm text-muted-foreground">Signal map</p>
													<p className="mt-1 text-heading-4 sm:text-heading-3">Every approval path in view</p>
												</div>
												<Button variant="secondary" size="sm">Review</Button>
											</Row>
											<div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5">
												<div className="grid grid-cols-9 items-end gap-1.5 rounded-concentric-xl/10 bg-card p-4 sm:gap-2">
													{bars.map((bar) => (
														<div key={bar.week} className="flex h-36 items-end sm:h-56">
															<div
																className={`w-full rounded-full ${bar.current ? "bg-success" : "bg-secondary"}`}
																style={{ height: bar.height }}
															/>
														</div>
													))}
												</div>
												<div className="grid grid-cols-3 gap-2">
													{sceneMetrics.map((metric) => (
														<div key={metric.label} className="rounded-concentric-xl/10 border border-border bg-card p-3">
															<p className="truncate text-label-sm text-muted-foreground">{metric.label}</p>
															<p className="mt-2 text-heading-4 sm:text-heading-3">{metric.value}</p>
															<p className="mt-1 text-body-xs text-muted-foreground max-sm:hidden">{metric.detail}</p>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Region>

				<section id="platform" aria-labelledby="brand-platform-title" className="border-y border-border bg-muted/40 py-20 lg:py-28">
					<Region max="wide">
						<Stack gap={6}>
							<Stack gap={2} className="max-w-2xl">
								<p className="text-overline text-muted-foreground">Why Cove</p>
								<h2 id="brand-platform-title" className="text-balance text-heading-1">
									One private workspace for the decisions that matter.
								</h2>
								<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
									Most operations work lives in threads, spreadsheets, and memory.
									Cove gives it a home: every request routed, every signal visible,
									every outcome on the record.
								</p>
							</Stack>
							<Reveal>
								<Grid minItemWidth="calc(var(--spacing) * 64)" gap={2}>
									{values.map((value) => (
										<Card key={value.title} render={<article />} className="h-full">
											<CardContent className="flex flex-col gap-2">
												<span className="mb-4 grid size-11 place-items-center rounded-md border border-border sable-well">
													<Icon name={value.icon} className="text-xl" />
												</span>
												<h3 className="text-title-lg">{value.title}</h3>
												<p className="text-body-sm text-muted-foreground">{value.body}</p>
											</CardContent>
										</Card>
									))}
								</Grid>
							</Reveal>
						</Stack>
					</Region>
				</section>

				<Region as="section" id="how-it-works" aria-labelledby="brand-steps-title" max="wide" className="py-20 lg:py-28">
					<div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
						<Stack gap={2} className="max-w-md">
							<p className="text-overline text-muted-foreground">How it works</p>
							<h2 id="brand-steps-title" className="text-balance text-heading-1">
								From request to sealed record.
							</h2>
							<p className="text-body-md text-muted-foreground">
								Teams are usually live within a week. Cove adapts to the routes
								you already run instead of asking you to start over.
							</p>
							<div className="pt-3">
								<Button variant="outline" iconEnd={<Icon name="arrow-right" />} render={<a href="/guides/rollout" />}>
									Read the rollout guide
								</Button>
							</div>
						</Stack>
						<ol className="grid gap-10 sm:grid-cols-3 sm:gap-6">
							{steps.map((step) => (
								<li key={step.number} className="flex flex-col gap-2 border-t border-border-strong pt-6">
									<span className="text-mono-sm text-muted-foreground">{step.number}</span>
									<h3 className="mt-3 text-title-lg sm:mt-6">{step.title}</h3>
									<p className="text-body-sm text-muted-foreground">{step.body}</p>
								</li>
							))}
						</ol>
					</div>
				</Region>

				<Region as="section" id="customers" aria-label="Customer story" max="wide" className="pb-20 lg:pb-28">
					<Card render={<figure />}>
						<div className="grid lg:grid-cols-[1.5fr_1fr]">
							<CardContent className="flex flex-col justify-between gap-10 sm:p-10">
								<Stack gap={3}>
									<p className="text-overline text-muted-foreground">Customer story</p>
									<blockquote className="text-balance text-heading-3 sm:text-heading-2">
										“We used to chase approvals across four tools. Now every request
										has an owner, a deadline, and a record, and our auditors stopped
										asking for screenshots.”
									</blockquote>
								</Stack>
								<figcaption className="flex items-center gap-3">
									<Avatar variant="art" size="lg" fallback="MO" />
									<div>
										<p className="text-title-sm">Maya Okafor</p>
										<p className="text-body-sm text-muted-foreground">Head of operations, Fielddesk</p>
									</div>
								</figcaption>
							</CardContent>
							<div className="border-border max-lg:border-t lg:border-s">
								<CardContent className="flex h-full flex-col justify-center gap-6 sm:p-10">
									{outcomes.map((outcome, index) => (
										<Stack key={outcome.label} gap={3}>
											{index > 0 && <Separator />}
											<div>
												<p className="text-heading-1 sm:text-display-lg">{outcome.value}</p>
												<p className="mt-1 text-body-sm text-muted-foreground">{outcome.label}</p>
											</div>
										</Stack>
									))}
								</CardContent>
							</div>
						</div>
					</Card>
				</Region>

				<Region as="section" aria-labelledby="brand-cta-title" max="wide" className="pb-20 lg:pb-28">
					<div className="dark">
						<div className="rounded-xl border border-border bg-card px-6 py-12 text-card-foreground sm:px-12 sm:py-16">
							<div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
								<Stack gap={3} className="max-w-2xl">
									<h2 id="brand-cta-title" className="text-balance text-heading-1">
										See your own approval paths in Cove.
									</h2>
									<p className="text-body-lg text-muted-foreground">
										A 30-minute walkthrough with your routes, your roles, and your
										records. No slides.
									</p>
								</Stack>
								<Row gap={2} wrap>
									<Button size="cta" render={<a href="/demo" />}>
										Book a walkthrough
									</Button>
									<Button size="cta" variant="ghost" render={<a href="/pricing" />}>
										View pricing
									</Button>
								</Row>
							</div>
						</div>
					</div>
				</Region>
			</main>

			<footer className="border-t border-border bg-muted/35">
				<Region max="wide" className="py-12 sm:py-16">
					<div className="grid gap-10 lg:grid-cols-[1fr_1.35fr_1fr] lg:gap-8">
						<Stack gap={4} className="max-w-sm">
							<a href="/" className="flex w-fit items-center gap-2 rounded-full motion-interactive motion-press">
								<span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
									<Icon name="sparkles" className="text-sm" />
								</span>
								<span className="text-title-lg">Cove</span>
							</a>
							<p className="text-body-sm text-muted-foreground">
								A calm operating surface for teams that need trust, speed, and
								context without the noise.
							</p>
							<Badge appearance="plain" tone="success" dot>
								All systems normal
							</Badge>
						</Stack>

						<nav aria-label="Footer" className="grid grid-cols-3 gap-6">
							{footerGroups.map((group) => (
								<div key={group.title}>
									<h2 className="text-label-md">{group.title}</h2>
									<ul className="mt-3 space-y-1">
										{group.links.map((link) => (
											<li key={link.label}>
												<a
													href={link.href}
													className="flex min-h-9 items-center text-body-sm text-muted-foreground motion-interactive hover:text-foreground"
												>
													{link.label}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>

						<Card className="h-fit">
							<CardHeader>
								{/* CardTitle carries the type; the h2 inside it keeps the outline. */}
								<CardTitle>
									<h2>The Cove digest</h2>
								</CardTitle>
								<CardDescription>
									One note a month on trusted workflows and product releases.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form action="/newsletter" className="grid gap-2 sm:grid-cols-[1fr_auto]">
									<label htmlFor="brand-footer-email" className="sr-only">
										Work email
									</label>
									<Input
										id="brand-footer-email"
										name="email"
										type="email"
										autoComplete="email"
										placeholder="you@company.com"
									/>
									<Button type="submit" className="w-full sm:w-auto">
										Subscribe
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					<div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-caption text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
						<p>© 2026 Cove. All rights reserved.</p>
						<Row gap={4} wrap>
							{legalLinks.map((link) => (
								<a
									key={link.label}
									href={link.href}
									className="flex min-h-9 min-w-9 items-center motion-interactive hover:text-foreground"
								>
									{link.label}
								</a>
							))}
						</Row>
					</div>
				</Region>
			</footer>
		</div>
	)
}
