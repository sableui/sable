import { Example, PageHeader, Section } from "../components/docs-ui"

interface Spec {
	name: string
	cls: string
	meta: string
	sample: string
}

function SpecRow({ spec }: { spec: Spec }) {
	return (
		<div className="grid grid-cols-1 items-baseline gap-2 border-b border-border py-5 last:border-0 md:grid-cols-12 md:gap-4">
			<div className="md:col-span-3">
				<p className="text-title-sm">{spec.name}</p>
				<code className="text-mono-sm text-muted-foreground">{spec.cls}</code>
			</div>
			<div className={`md:col-span-6 ${spec.cls}`}>{spec.sample}</div>
			<div className="text-mono-sm text-muted-foreground md:col-span-3">
				{spec.meta}
			</div>
		</div>
	)
}

const display: Spec[] = [
	{ name: "Display 2XL", cls: "text-display-2xl", meta: "72 · 700", sample: "Permanent art." },
	{ name: "Display LG", cls: "text-display-lg", meta: "48 · 700", sample: "Preserve the work." },
]
const heading: Spec[] = [
	{ name: "Heading 1", cls: "text-heading-1", meta: "36 · 600", sample: "Discover new work" },
	{ name: "Heading 2", cls: "text-heading-2", meta: "28 · 600", sample: "Recently viewed" },
	{ name: "Heading 3", cls: "text-heading-3", meta: "22 · 600", sample: "Pricing & billing" },
	{ name: "Heading 4", cls: "text-heading-4", meta: "18 · 600", sample: "Notification preferences" },
]
const title: Spec[] = [
	{ name: "Title LG", cls: "text-title-lg", meta: "16 · 600", sample: "Untitled (gold rush)" },
	{ name: "Title SM", cls: "text-title-sm", meta: "14 · 600", sample: "Invoice INV-0042" },
]
const body: Spec[] = [
	{
		name: "Body LG",
		cls: "text-body-lg",
		meta: "17 · 400",
		sample:
			"Choose clear, readable type that helps people understand the page and complete their task.",
	},
	{
		name: "Body MD",
		cls: "text-body-md",
		meta: "15 · 400",
		sample: "Save your work, share it with your team, and come back when you're ready.",
	},
	{
		name: "Body SM",
		cls: "text-body-sm",
		meta: "13 · 400",
		sample: "You can change this later from privacy settings.",
	},
	{
		name: "Body XS",
		cls: "text-body-xs",
		meta: "12 · 400",
		sample: "Queued 3 of 12 · retrying on rate limit · last run 14:02:36.",
	},
]
const label: Spec[] = [
	{ name: "Label LG", cls: "text-label-lg", meta: "14 · 600", sample: "Upgrade plan" },
	{ name: "Label MD", cls: "text-label-md", meta: "12 · 600", sample: "12 members" },
	{ name: "Label XS", cls: "text-label-xs", meta: "11 · 600", sample: "Trending now" },
	{ name: "Caption", cls: "text-caption", meta: "12 · 400", sample: "Posted 2 hours ago" },
]
const mono: Spec[] = [
	{ name: "Mono MD", cls: "text-mono-md", meta: "13 · 400 · tabular", sample: "5J7s…8xQp · ab12cd34" },
	{ name: "Mono Caption", cls: "text-mono-caption", meta: "12 · 400 · tabular", sample: "b4c1…9f2e · 341 ms · $0.0021" },
	{ name: "Mono SM", cls: "text-mono-sm", meta: "11 · 500 · tabular", sample: "req_5J7s8xQp" },
]

export function TypographyPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Typography"
				lede="A small, fixed set of type styles, each picked by the job the text does rather than its size."
			/>

			<Section title="Display" description="Type as image, for heroes and campaign moments. One per view, never in app chrome.">
				{display.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section title="Heading" description="The page outline, from the page title down to a card group.">
				{heading.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section title="Title" description="Names a card, dialog, sheet or list row.">
				{title.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section title="Body" description="Reading text, from the lede down to dense metadata.">
				{body.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section title="Label" description="Short, scannable UI text: buttons, fields, badges, timestamps.">
				{label.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section title="Mono" description="Code, IDs and numbers that need to line up.">
				{mono.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section
				title="Lists"
				description="Lists are type with structure, so they are styled here, on the native element. Put the class on a <ul>, <ol> or <dl> and keep its semantics."
			>
				<Example
					code={`<ul className="sable-list">
  <li>Drafts sync across devices</li>
  <li>Offline edits merge when you reconnect</li>
  <li>Version history keeps 30 days</li>
</ul>`}
				>
					<ul className="sable-list max-w-md">
						<li>Drafts sync across devices</li>
						<li>Offline edits merge when you reconnect</li>
						<li>Version history keeps 30 days</li>
					</ul>
				</Example>
				<Example
					code={`<ol className="sable-list-numbered">
  <li>Install @sableui/react</li>
  <li>Import the styles after Tailwind</li>
  <li>Wrap the app in IconProvider</li>
</ol>`}
				>
					<ol className="sable-list-numbered max-w-md">
						<li>Install @sableui/react</li>
						<li>Import the styles after Tailwind</li>
						<li>Wrap the app in IconProvider</li>
					</ol>
				</Example>
				<Example
					code={`<dl className="sable-list-dl">
  <dt>Order</dt>
  <dd className="text-mono-md">SB-2048</dd>
  <dt>Status</dt>
  <dd className="text-success">Shipped</dd>
  <dt>Ship to</dt>
  <dd>Mara Okafor, 14 Rue des Lilas, 75011 Paris</dd>
  <dt>Total</dt>
  <dd>$184.00</dd>
</dl>`}
				>
					<dl className="sable-list-dl w-full max-w-sm">
						<dt>Order</dt>
						<dd className="text-mono-md">SB-2048</dd>
						<dt>Status</dt>
						<dd className="text-success">Shipped</dd>
						<dt>Ship to</dt>
						<dd>Mara Okafor, 14 Rue des Lilas, 75011 Paris</dd>
						<dt>Total</dt>
						<dd>$184.00</dd>
					</dl>
				</Example>
				<Example
					code={`<div className="@container">
  <dl className="sable-list-dl sable-list-dl-2">
    <dt>Posts</dt><dd>128</dd>
    <dt>Followers</dt><dd>4.2k</dd>
    <dt>Projects</dt><dd>12</dd>
    <dt>Joined</dt><dd>March 2024</dd>
  </dl>
</div>`}
				>
					<div className="@container w-full max-w-lg">
						<dl className="sable-list-dl sable-list-dl-2">
							<dt>Posts</dt>
							<dd>128</dd>
							<dt>Followers</dt>
							<dd>4.2k</dd>
							<dt>Projects</dt>
							<dd>12</dd>
							<dt>Joined</dt>
							<dd>March 2024</dd>
						</dl>
					</div>
				</Example>
			</Section>
		</>
	)
}
