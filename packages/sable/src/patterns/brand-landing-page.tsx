import { Badge } from "../components/badge"
import { Button } from "../components/button"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/card"
import { Input } from "../components/input"
import { StatusDot } from "../components/status-dot"
import { Icon } from "../icon"
import { Region, Row, Stack } from "../layout"
import { TextReveal } from "../motion"

// ---pattern-code---
const navItems = ["Platform", "Signals", "Security", "Company"]

const metrics = [
	{ label: "Checks cleared", value: "1.8M", detail: "in the last 30 days" },
	{ label: "Review time", value: "42s", detail: "median approval path" },
	{ label: "Spaces online", value: "284", detail: "across active teams" },
]

const workflow = [
	{ label: "Intake", state: "Open", tone: "info" as const },
	{ label: "Review", state: "Live", tone: "edition" as const },
	{ label: "Archive", state: "Safe", tone: "success" as const },
]

const bars = [
	{ height: "38%", tone: "bg-tone-info" },
	{ height: "56%", tone: "bg-tone-edition" },
	{ height: "44%", tone: "bg-tone-standard" },
	{ height: "68%", tone: "bg-success" },
	{ height: "52%", tone: "bg-tone-info" },
	{ height: "78%", tone: "bg-highlight" },
	{ height: "60%", tone: "bg-tone-edition" },
	{ height: "86%", tone: "bg-success" },
	{ height: "64%", tone: "bg-tone-standard" },
]

const features = [
	{
		icon: "lock" as const,
		title: "Private by default",
		body: "Workspace roles, approval trails, and handoff history stay clear without turning the interface into compliance fog.",
	},
	{
		icon: "layout" as const,
		title: "Brand and product together",
		body: "Editorial sections and dense console views share the same semantic tokens, radius, and motion contract.",
	},
	{
		icon: "circle-check" as const,
		title: "Calm confidence",
		body: "Large type, tactile controls, and focused status tones make complex work feel understandable on first pass.",
	},
]

const reviews = [
	{ name: "Waypoint", value: "98.4%", label: "clear routes" },
	{ name: "Fielddesk", value: "12", label: "open holds" },
	{ name: "Archive", value: "4.8k", label: "sealed records" },
]

const footerGroups = [
	{
		title: "Platform",
		links: [
			{ label: "Overview", href: "#platform" },
			{ label: "Signals", href: "#signals" },
			{ label: "Approvals", href: "#approvals" },
			{ label: "Records", href: "#records" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Security", href: "/security" },
			{ label: "Customers", href: "/customers" },
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

const footerSignals = [
	{ label: "Uptime", value: "99.98%" },
	{ label: "Regions", value: "12" },
	{ label: "Response", value: "42s" },
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
									<Button key={item} variant="ghost" size="sm" render={<a href={`#${item.toLowerCase()}`} />}>
										{item}
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
				<Region as="section" max="wide" className="pb-16 pt-14 sm:pt-20 lg:pb-24">
					<div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
						<Stack gap={4} className="max-w-3xl">
							<Badge appearance="outline" icon={<Icon name="lock" className="text-sm" />}>
								Private operations, made legible
							</Badge>
							<TextReveal
								as="h1"
								text="A calmer command center for high-trust digital work"
								className="max-w-4xl text-balance text-display-xl sm:text-display-3xl"
								once
							/>
							<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
								Cove gives teams a polished front door and a serious operating
								surface: approvals, signals, records, and handoffs in one
								understandable flow.
							</p>
							<Row gap={2} wrap>
								<Button size="cta" render={<a href="/demo" />}>
									Book a walkthrough
								</Button>
								<Button size="cta" variant="outline" render={<a href="#platform" />}>
									Explore platform
								</Button>
							</Row>
						</Stack>

						<div className="relative">
							{/* Nested surfaces take concentric corners: each level's radius is
							    the shell's xl minus every inset between it and the shell edge. */}
							<div className="overflow-hidden rounded-xl border border-border-floating bg-overlay p-3 text-overlay-foreground shadow-xl">
								<div className="rounded-concentric-xl/3 border border-overlay-foreground/10 bg-overlay-foreground/8">
									<div className="flex items-center justify-between border-b border-overlay-foreground/10 px-4 py-3">
										<Row gap={1}>
											<StatusDot tone="warning" />
											<StatusDot tone="edition" />
											<StatusDot tone="success" />
										</Row>
										<span className="text-label-sm text-overlay-foreground/70">Live workspace</span>
									</div>
									<div className="grid gap-3 p-3 md:grid-cols-[0.7fr_1.3fr]">
										<div className="space-y-3">
											<div className="rounded-concentric-xl/6 border border-overlay-foreground/10 bg-overlay-foreground/8 p-4">
												<p className="text-label-sm text-overlay-foreground/60">Spaces</p>
												<div className="mt-4 space-y-2">
													{reviews.map((review) => (
														<div key={review.name} className="rounded-concentric-xl/10 bg-overlay p-3">
															<Row justify="between">
																<span className="text-title-sm">{review.name}</span>
																<span className="text-mono-sm text-overlay-foreground">{review.value}</span>
															</Row>
															<p className="mt-1 text-body-xs text-overlay-foreground/60">{review.label}</p>
														</div>
													))}
												</div>
											</div>
											<div className="rounded-concentric-xl/6 border border-overlay-foreground/10 bg-overlay-foreground/8 p-4">
												<Row justify="between">
													<span className="text-title-sm">Route status</span>
													<Badge tone="success" size="sm">Healthy</Badge>
												</Row>
												<div className="mt-4 space-y-2">
													{workflow.map((item) => (
														<Row key={item.label} justify="between" className="rounded-full bg-overlay px-3 py-2">
															<Row gap={1}>
																<StatusDot tone={item.tone} />
																<span className="text-body-sm">{item.label}</span>
															</Row>
															<span className="text-label-sm text-overlay-foreground/60">{item.state}</span>
														</Row>
													))}
												</div>
											</div>
										</div>

										<div className="rounded-concentric-xl/6 border border-overlay-foreground/10 bg-overlay-foreground/8 p-4">
											<Row justify="between" className="border-b border-overlay-foreground/10 pb-4">
												<div>
													<p className="text-label-sm text-overlay-foreground/60">Signal map</p>
													<h2 className="mt-1 text-heading-3">Every approval path in view</h2>
												</div>
												<Button variant="secondary" size="sm">Review</Button>
											</Row>
											<div className="mt-6 grid min-h-72 grid-rows-[1fr_auto] gap-5">
												<div className="grid grid-cols-9 items-end gap-2 rounded-concentric-xl/10 bg-overlay p-4">
													{bars.map((bar, index) => (
														<div key={`${bar.tone}-${index}`} className="flex h-56 items-end">
															<div
																className={`w-full rounded-full ${bar.tone}`}
																style={{ height: bar.height }}
															/>
														</div>
													))}
												</div>
												<div className="grid gap-2 sm:grid-cols-3">
													{metrics.map((metric) => (
														<div key={metric.label} className="rounded-concentric-xl/10 border border-overlay-foreground/10 bg-overlay p-3">
															<p className="text-label-sm text-overlay-foreground/60">{metric.label}</p>
															<p className="mt-2 text-heading-3">{metric.value}</p>
															<p className="mt-1 text-body-xs text-overlay-foreground/60">{metric.detail}</p>
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

				<section id="platform" className="border-y border-border bg-muted/40 py-14">
					<Region max="wide">
						<div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
							<Stack gap={3}>
								<Badge>Design mood</Badge>
								<h2 className="text-heading-1">Marketing warmth, product discipline.</h2>
								<p className="max-w-(--measure-prose) text-body-md text-muted-foreground">
									The page uses a pill nav, tactile surfaces, soft status tones, and
									slower ease-out movement. It stays broad in color so it does not
									collapse into purple-brand sameness.
								</p>
							</Stack>
							<div className="grid gap-3 md:grid-cols-3">
								{features.map((feature) => (
									<Card key={feature.title} render={<article />} className="h-full">
										<CardContent>
											<span className="grid size-10 place-items-center rounded-md bg-highlight text-highlight-foreground">
												<Icon name={feature.icon} className="text-xl" />
											</span>
											<h3 className="mt-5 text-title-lg">{feature.title}</h3>
											<p className="mt-2 text-body-sm text-muted-foreground">{feature.body}</p>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</Region>
				</section>

				<Region as="section" max="wide" className="py-14">
					<div className="grid gap-3 md:grid-cols-3">
						{metrics.map((metric) => (
							<Card key={metric.label}>
								<CardContent>
									<p className="text-label-md text-muted-foreground">{metric.label}</p>
									<p className="mt-3 text-display-lg">{metric.value}</p>
									<p className="mt-1 text-body-sm text-muted-foreground">{metric.detail}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</Region>
			</main>

			<footer className="border-t border-border bg-muted/35">
				<Region max="wide" className="py-10 sm:py-12">
					<div className="grid gap-8 lg:grid-cols-[1fr_1.35fr_1fr]">
						<Stack gap={3} className="max-w-md">
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
							<Row gap={1} wrap>
								<Badge size="sm" icon={<Icon name="lock" />}>
									Private
								</Badge>
								<Badge tone="success" size="sm" icon={<Icon name="circle-check" />}>
									Live
								</Badge>
							</Row>
						</Stack>

						<nav aria-label="Footer" className="grid gap-6 sm:grid-cols-3">
							{footerGroups.map((group) => (
								<div key={group.title}>
									<h2 className="text-label-md text-muted-foreground">{group.title}</h2>
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

						<Card>
							<CardHeader>
								{/* CardTitle carries the type; the h2 inside it keeps the outline. */}
								<CardTitle>
									<h2>Signal digest</h2>
								</CardTitle>
								<CardDescription>
									One weekly note on trusted workflows and product releases.
								</CardDescription>
								<CardAction>
									<span className="grid size-9 place-items-center rounded-full bg-highlight text-highlight-foreground">
										<Icon name="sparkles" className="text-sm" />
									</span>
								</CardAction>
							</CardHeader>
							<CardContent className="flex flex-col gap-4">
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
										Join
									</Button>
								</form>
								<div className="grid grid-cols-3 gap-2">
									{footerSignals.map((signal) => (
										<div key={signal.label} className="rounded-md bg-muted p-3">
											<p className="text-mono-sm">{signal.value}</p>
											<p className="mt-1 text-caption text-muted-foreground">{signal.label}</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-caption text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
						<p>© 2026 Cove. All rights reserved.</p>
						<Row gap={3} wrap>
							<a
								href="/privacy"
								className="flex min-h-9 min-w-9 items-center motion-interactive hover:text-foreground"
							>
								Privacy
							</a>
							<a
								href="/terms"
								className="flex min-h-9 min-w-9 items-center motion-interactive hover:text-foreground"
							>
								Terms
							</a>
							<a
								href="/contact"
								className="flex min-h-9 min-w-9 items-center motion-interactive hover:text-foreground"
							>
								Contact
							</a>
						</Row>
					</div>
				</Region>
			</footer>
		</div>
	)
}
