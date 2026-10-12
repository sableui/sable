# LandingPage

Product / open-source landing page: a centered hero with an eyebrow Badge, one display headline, lede, two CTAs and a copyable install command; a Browser-framed product preview composed from real components; a six-up feature grid; a setup section with tabbed code; an agent-workflow section with terminal output; a CTA card; and a link-column footer.

**Intent:** Reach for this for the marketing route of a developer product, library, or tool: the page where the product shows itself working and the reader installs or signs up. For a branded, editorial marketing site use BrandLandingPage. Not for product UI (display type and one-per-view rules forbid it inside the app).

## Notes

- Display type is the marketing voice: exactly one display headline per page (`text-display-lg` on phones, `text-display-2xl` from `sm`). Every section below uses `text-heading-1` with a `text-overline` kicker.
- The eyebrow is a small outline Badge (`size="sm"`): the badge's own size, never a type class forced onto its label. Hierarchy above the fold is eyebrow, display, lede, CTAs, install command.
- The lede is body-lg capped at the prose measure. The headline may be wide; reading text may not.
- Two CTAs max per row: one primary, one quiet outline. The install line is a `CodeBlock` with `prompt="$"`, so it truncates on one line and copy takes only the command.
- Show the product instead of describing it. The preview is real components (PageHeader, metric Cards, a Meter, a CardList of Entity rows, Message and Bubble, ChatComposer) inside `Browser`, wrapped in an `inert` div so the picture's controls never take focus. Secondary columns hide on small screens rather than stacking into a long mock.
- Features are Cards in a fixed `Grid cols={{ base: 1, sm: 2, lg: 3 }}`, so six items always land as full rows (3 x 2, 2 x 3, 1 x 6) without an orphan.
- Multi-line code uses `CodeBlock` with a filename; switch related snippets with `Tabs`, defaulting to the most complete one. Terminal output passes `highlight={false}` so a code highlighter does not colour prose.
- Reveal wraps below-the-fold blocks only (features, code, CTA). It no-ops under reduced motion via the motion policy.
- Hide nav groups on narrow screens by wrapping them in a `max-md:hidden` div: a `Row` or `Button` sets its own display, which a `hidden` class on the same element does not reliably override.

## Accessibility

- The hero headline is the page h1; section titles are h2s and feature and step titles are h3s. Footer column labels are h2s inside the footer nav.
- The product preview is a `figure` with a visible figcaption. Its content is `inert`, which removes it from the tab order and the accessibility tree, so its headings and buttons do not pollute the outline.
- Reveal renders content immediately (no animation) when prefers-reduced-motion is set.
- CTA buttons are real links with visible text, with no icon-only CTAs. Footer links keep a 36px minimum row height for touch.

## Source

```tsx
import { Avatar, Badge, Browser, Bubble, Button, Card, CardAction, CardContent, CardDescription, CardHeader, CardList, CardTitle, ChatComposer, Code, CodeBlock, Entity, Grid, Icon, Message, Meter, MeterLabel, MeterTrack, MeterValue, PageHeader, Region, Reveal, Row, Stack, Tabs, TabsList, TabsPanel, TabsTrigger } from "@sableui/react"

const navLinks = [
	{ label: "Docs", href: "/docs" },
	{ label: "Components", href: "/components" },
	{ label: "Patterns", href: "/patterns" },
	{ label: "Themes", href: "/themes" },
]

const deploys = [
	{
		initials: "MO",
		name: "Maya Ortiz",
		title: "Add usage-based billing",
		meta: "main · a3f9c21 · 2m ago",
		status: "Building",
		tone: "info" as const,
		pulse: true,
	},
	{
		initials: "SR",
		name: "Sam Reyes",
		title: "Fix search ranking for long queries",
		meta: "main · 81be04d · 18m ago",
		status: "Ready",
		tone: "success" as const,
		pulse: false,
	},
	{
		initials: "JL",
		name: "Jun Lee",
		title: "Rotate webhook signing keys",
		meta: "main · 5c7e9aa · 1h ago",
		status: "Ready",
		tone: "success" as const,
		pulse: false,
	},
]

const features = [
	{
		icon: "component" as const,
		title: "Behavior built in",
		body: "Focus management, keyboard navigation, and ARIA come from Base UI primitives under every control.",
	},
	{
		icon: "eyedropper" as const,
		title: "Semantic tokens end to end",
		body: "Re-theme the whole product, light and dark, from one preset without touching a component.",
	},
	{
		icon: "layout" as const,
		title: "Pages, not just parts",
		body: "Landing, dashboard, settings, auth, and list-detail shells to copy and adapt.",
	},
	{
		icon: "book" as const,
		title: "A contract agents can read",
		body: "registry.json, llms.txt, and a CLI hand agents the exact props, examples, and rules.",
	},
	{
		icon: "circle-check" as const,
		title: "Lint that knows the design",
		body: "sable-lint flags raw colors, hand-built controls, and motion that ignores reduced motion.",
	},
	{
		icon: "play" as const,
		title: "Motion with an off switch",
		body: "Named recipes run on one scale variable, so reduced motion stops every transition at once.",
	},
]

const steps = [
	{
		title: "Install the package",
		body: "One dependency. React 19 and Tailwind v4 are the only peers.",
	},
	{
		title: "Import the styles",
		body: "Tailwind first, then Sable's tokens, then a source glob over the package.",
	},
	{
		title: "Compose your screens",
		body: "Build from components and layout primitives. Your theme does the rest.",
	},
]

const stylesCode = `@import "tailwindcss";
@import "@sableui/react/styles.css";
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";`

// design-lint-disable-next-line self-import -- a consumer code sample displayed on the page, not an import
const composeCode = `import { Button, Card, CardContent, CardHeader, CardTitle } from "@sableui/react"

export function DeployCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Deploy</Button>
      </CardContent>
    </Card>
  )
}`

const terminalCode = `$ npx sable search "confirm before deleting"
component  DestructiveActionModal
component  Dialog

$ npx sable component DestructiveActionModal --props
props, a11y contract, composed examples

$ npx sable lint src
0 findings in 42 files`

const agentPoints = [
	"Search ranks components, patterns, tokens, and docs for a plain-language need.",
	"Every component ships its props, accessibility contract, and composed examples.",
	"The same lint runs in the editor, in CI, and inside the agent's own loop.",
]

const footerGroups = [
	{
		title: "Product",
		links: [
			{ label: "Components", href: "/components" },
			{ label: "Patterns", href: "/patterns" },
			{ label: "Themes", href: "/themes" },
			{ label: "Canvas", href: "/canvas" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Documentation", href: "/docs" },
			{ label: "Changelog", href: "/changelog" },
			{ label: "llms.txt", href: "/llms.txt" },
			{ label: "registry.json", href: "/registry.json" },
		],
	},
	{
		title: "Community",
		links: [
			{ label: "GitHub", href: "/github" },
			{ label: "npm", href: "/npm" },
			{ label: "Discussions", href: "/discussions" },
		],
	},
]

export function LandingPage() {
	return (
		<div className="min-h-dvh bg-background text-foreground">
			<header className="border-b border-border">
				<Region as="nav" aria-label="Main" max="wide" className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">
					<a href="/" className="justify-self-start text-title-lg motion-interactive hover:text-muted-foreground">
						Sable
					</a>
					<div className="justify-self-center max-md:hidden">
						<Row gap={1}>
							{navLinks.map((link) => (
								<Button key={link.label} variant="ghost" size="sm" render={<a href={link.href} />}>
									{link.label}
								</Button>
							))}
						</Row>
					</div>
					<Row gap={1} className="col-start-3 justify-self-end">
						<div className="max-sm:hidden">
							<Button variant="ghost" size="sm" render={<a href="/github" />}>
								GitHub
							</Button>
						</div>
						<Button size="sm" render={<a href="/docs/getting-started" />}>
							Get started
						</Button>
					</Row>
				</Region>
			</header>

			<main>
				<Region as="section" max="wide" className="pb-16 pt-16 sm:pt-24">
					<Stack gap={8} align="center">
						<Stack gap={4} align="center" className="text-center">
							<Badge appearance="outline" size="sm" icon={<Icon name="sparkles" />}>
								Open source · MIT licensed
							</Badge>
							<h1 className="max-w-4xl text-balance text-display-lg sm:text-display-2xl">
								Product UI your agents can't get wrong
							</h1>
							<p className="max-w-(--measure-prose) text-pretty text-body-lg text-muted-foreground">
								Sable is a themeable React component library with enforced tokens,
								typography, and motion, documented for coding agents as carefully
								as for people.
							</p>
							<Row gap={2} justify="center" wrap className="pt-2">
								<Button size="cta" render={<a href="/docs/getting-started" />}>
									Get started
								</Button>
								<Button size="cta" variant="outline" render={<a href="/components" />}>
									Browse components
								</Button>
							</Row>
						</Stack>
						<div className="w-full max-w-sm">
							<CodeBlock prompt="$" code="pnpm add @sableui/react" />
						</div>
					</Stack>
				</Region>

				<Region as="section" aria-label="Product preview" max="wide" className="pb-20 sm:pb-28">
					<figure>
						<Browser url="atlas.example/deploys" className="shadow-xl">
							{/* A picture of software, not live UI: inert keeps its controls
							    out of the tab order and the accessibility tree. */}
							<div inert className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
								<Stack gap={4} className="min-w-0">
									<PageHeader
										titleAs="h2"
										title="Deployments"
										description="atlas-web · production"
										actions={
											<Row gap={2}>
												<Button variant="outline" size="sm">
													View logs
												</Button>
												<Button size="sm" iconStart={<Icon name="upload" />}>
													Deploy
												</Button>
											</Row>
										}
									/>
									<Grid cols={{ base: 2, md: 3 }} gap={3}>
										<Card density="compact">
											<CardHeader>
												<CardTitle>Uptime</CardTitle>
												<CardDescription>Last 30 days</CardDescription>
											</CardHeader>
											<CardContent>
												<p className="text-heading-3">99.98%</p>
											</CardContent>
										</Card>
										<Card density="compact">
											<CardHeader>
												<CardTitle>p95 latency</CardTitle>
												<CardDescription>Edge, all regions</CardDescription>
											</CardHeader>
											<CardContent>
												<p className="text-heading-3">182 ms</p>
											</CardContent>
										</Card>
										<Card density="compact" className="max-md:hidden">
											<CardHeader>
												<CardTitle>Build minutes</CardTitle>
												<CardDescription>Team plan</CardDescription>
											</CardHeader>
											<CardContent>
												<Meter value={64} tone="standard">
													<Row justify="between" wrap className="mb-2">
														<MeterLabel>Used</MeterLabel>
														<MeterValue>{(_, value) => `${(value * 30).toLocaleString("en-US")} of 3,000`}</MeterValue>
													</Row>
													<MeterTrack />
												</Meter>
											</CardContent>
										</Card>
									</Grid>
									<Card>
										<CardHeader>
											<CardTitle>Recent deploys</CardTitle>
											<CardDescription>Production branch</CardDescription>
											<CardAction>
												<Badge appearance="plain" tone="success" dot>
													Healthy
												</Badge>
											</CardAction>
										</CardHeader>
										<CardList>
											{deploys.map((deploy) => (
												<Entity
													key={deploy.meta}
													leading={<Avatar variant="art" size="sm" fallback={deploy.initials} alt={deploy.name} />}
													title={deploy.title}
													subtitle={deploy.meta}
													action={
														<Badge appearance="plain" tone={deploy.tone} dot pulse={deploy.pulse}>
															{deploy.status}
														</Badge>
													}
												/>
											))}
										</CardList>
									</Card>
								</Stack>
								<Card className="max-lg:hidden">
									<CardHeader>
										<CardTitle>Release assistant</CardTitle>
										<CardDescription>Summaries from today's deploys</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-col gap-4">
										<Message align="end">
											<Bubble variant="primary" align="end">
												What shipped to production today?
											</Bubble>
										</Message>
										<Message>
											<Bubble>
												Three deploys. Search ranking is fixed, webhook keys are
												rotated, and usage-based billing is building now.
											</Bubble>
										</Message>
										<ChatComposer placeholder="Ask about a deploy" />
									</CardContent>
								</Card>
							</div>
						</Browser>
						<figcaption className="mt-4 text-center text-body-sm text-muted-foreground">
							Every surface in this preview is a Sable component, styled by the active theme.
						</figcaption>
					</figure>
				</Region>

				<section aria-labelledby="landing-features" className="border-y border-border bg-muted/40 py-20 sm:py-28">
					<Region max="wide">
						<Stack gap={10}>
							<Stack gap={3} className="max-w-2xl">
								<p className="text-overline text-muted-foreground">Why Sable</p>
								<h2 id="landing-features" className="text-balance text-heading-1">
									A design system with the rules written down
								</h2>
								<p className="text-body-lg text-muted-foreground">
									The decisions a senior designer would make are encoded once, so every
									screen your team or your agent builds starts from them.
								</p>
							</Stack>
							<Reveal>
								<Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
									{features.map((feature) => (
										<Card key={feature.title} render={<article />} className="h-full">
											<CardContent className="flex flex-col gap-3">
												<span className="grid size-10 place-items-center rounded-md sable-well">
													<Icon name={feature.icon} className="text-xl" />
												</span>
												<h3 className="pt-2 text-title-lg">{feature.title}</h3>
												<p className="text-body-sm text-muted-foreground">{feature.body}</p>
											</CardContent>
										</Card>
									))}
								</Grid>
							</Reveal>
						</Stack>
					</Region>
				</section>

				<Region as="section" aria-labelledby="landing-setup" max="wide" className="py-20 sm:py-28">
					<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
						<Stack gap={8}>
							<Stack gap={3}>
								<p className="text-overline text-muted-foreground">Setup</p>
								<h2 id="landing-setup" className="text-balance text-heading-1">
									From install to first screen in three steps
								</h2>
							</Stack>
							<ol className="flex flex-col gap-6">
								{steps.map((step, index) => (
									<li key={step.title} className="grid grid-cols-[auto_1fr] gap-4">
										<span className="pt-0.5 text-mono-md text-muted-foreground">0{index + 1}</span>
										<div>
											<h3 className="text-title-lg">{step.title}</h3>
											<p className="mt-1 text-body-md text-muted-foreground">{step.body}</p>
										</div>
									</li>
								))}
							</ol>
						</Stack>
						<Reveal className="min-w-0">
							<Tabs defaultValue="compose">
								<TabsList>
									<TabsTrigger value="install">Install</TabsTrigger>
									<TabsTrigger value="styles">Styles</TabsTrigger>
									<TabsTrigger value="compose">Compose</TabsTrigger>
								</TabsList>
								<TabsPanel value="install" className="pt-4">
									<CodeBlock prompt="$" code="pnpm add @sableui/react" />
								</TabsPanel>
								<TabsPanel value="styles" className="pt-4">
									<CodeBlock filename="app.css" code={stylesCode} />
								</TabsPanel>
								<TabsPanel value="compose" className="pt-4">
									<CodeBlock filename="deploy-card.tsx" code={composeCode} />
								</TabsPanel>
							</Tabs>
						</Reveal>
					</div>
				</Region>

				<section aria-labelledby="landing-agents" className="border-t border-border py-20 sm:py-28">
					<Region max="wide">
						<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
							<Stack gap={5}>
								<Stack gap={3}>
									<p className="text-overline text-muted-foreground">Built for agents</p>
									<h2 id="landing-agents" className="text-balance text-heading-1">
										Your agent reads the same contract you do
									</h2>
									<p className="text-body-lg text-muted-foreground">
										Point Claude Code, Codex, or Cursor at the installed package. The{" "}
										<Code>sable</Code> CLI answers what to use, how to use it, and whether
										the result holds up.
									</p>
								</Stack>
								<ul className="sable-list">
									{agentPoints.map((point) => (
										<li key={point}>{point}</li>
									))}
								</ul>
							</Stack>
							<Reveal className="min-w-0">
								<CodeBlock filename="Terminal" code={terminalCode} highlight={false} />
							</Reveal>
						</div>
					</Region>
				</section>

				<Region as="section" aria-labelledby="landing-cta" max="wide" className="pb-20 sm:pb-28">
					<Reveal>
						<Card>
							<CardContent>
								<Stack gap={4} align="center" className="py-8 text-center sm:py-12">
									<h2 id="landing-cta" className="max-w-2xl text-balance text-heading-1">
										Build the product, not another component library
									</h2>
									<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
										Install Sable, pick a preset, and ship the first screen today.
									</p>
									<Row gap={2} justify="center" wrap className="pt-2">
										<Button size="cta" render={<a href="/docs/getting-started" />}>
											Get started
										</Button>
										<Button size="cta" variant="outline" render={<a href="/github" />}>
											Star on GitHub
										</Button>
									</Row>
								</Stack>
							</CardContent>
						</Card>
					</Reveal>
				</Region>
			</main>

			<footer className="border-t border-border">
				<Region max="wide" className="py-12">
					<div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
						<Stack gap={3} className="max-w-xs">
							<a href="/" className="w-fit text-title-lg motion-interactive hover:text-muted-foreground">
								Sable
							</a>
							<p className="text-body-sm text-muted-foreground">
								React components, patterns, and tokens for products built with AI agents.
							</p>
						</Stack>
						<nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
							{footerGroups.map((group) => (
								<div key={group.title}>
									<h2 className="text-label-md text-muted-foreground">{group.title}</h2>
									<ul className="mt-3 flex flex-col gap-1">
										{group.links.map((link) => (
											<li key={link.label}>
												<a
													href={link.href}
													className="flex min-h-9 items-center text-body-sm motion-interactive hover:text-muted-foreground"
												>
													{link.label}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>
					</div>
					<div className="mt-12 border-t border-border pt-6">
						<p className="text-caption text-muted-foreground">© 2026 Sable. Released under the MIT license.</p>
					</div>
				</Region>
			</footer>
		</div>
	)
}
```
