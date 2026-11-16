import { CodeBlock, useSableTheme } from "@sableui/react"
import { useLayoutEffect, useRef, useState } from "react"
import { Example, InlineCode, PageHeader, Section } from "../components/docs-ui"
import { useCustomizer } from "../customizer/CustomizerProvider"

interface Spec {
	name: string
	cls: string
	sample: string
	/** What the number cannot say: tabular figures, caps. */
	note?: string
}

/**
 * The tier as this page renders it: size / line height · weight, read from the
 * sample itself after layout. Hard-coded numbers were the default theme's and
 * went wrong the moment the theme picker, the customizer or --type-base moved
 * (Verdant's heading-1 is 40px at 700, not 36 at 600).
 */
function useRenderedType<T extends HTMLElement>() {
	const ref = useRef<T>(null)
	const { css } = useCustomizer()
	const { themeId, mode } = useSableTheme()
	const [meta, setMeta] = useState<string | null>(null)
	useLayoutEffect(() => {
		const frame = requestAnimationFrame(() => {
			const el = ref.current
			if (!el) return
			const style = getComputedStyle(el)
			const px = (value: string) => Math.round(Number.parseFloat(value) * 10) / 10
			setMeta(`${px(style.fontSize)}/${px(style.lineHeight)} · ${style.fontWeight}`)
		})
		return () => cancelAnimationFrame(frame)
	}, [css, themeId, mode])
	return [ref, meta] as const
}

function SpecRow({ spec }: { spec: Spec }) {
	const [ref, meta] = useRenderedType<HTMLDivElement>()
	return (
		<div className="grid grid-cols-1 items-baseline gap-2 border-b border-border py-5 last:border-0 md:grid-cols-12 md:gap-4">
			<div className="md:col-span-3">
				<p className="text-title-sm">{spec.name}</p>
				<code className="text-mono-sm text-muted-foreground">{spec.cls}</code>
			</div>
			<div ref={ref} className={`min-w-0 break-words md:col-span-6 ${spec.cls}`}>
				{spec.sample}
			</div>
			<div className="text-mono-sm text-muted-foreground md:col-span-3">
				{meta ?? "—"}
				{spec.note ? ` · ${spec.note}` : null}
			</div>
		</div>
	)
}

const display: Spec[] = [
	{ name: "Display 4XL", cls: "text-display-4xl", sample: "Art." },
	{ name: "Display 3XL", cls: "text-display-3xl", sample: "Permanent." },
	{ name: "Display 2XL", cls: "text-display-2xl", sample: "Permanent art." },
	{ name: "Display XL", cls: "text-display-xl", sample: "Keep the work." },
	{ name: "Display LG", cls: "text-display-lg", sample: "Preserve the work." },
]
const heading: Spec[] = [
	{ name: "Heading 1", cls: "text-heading-1", sample: "Discover new work" },
	{ name: "Heading 2", cls: "text-heading-2", sample: "Recently viewed" },
	{ name: "Heading 3", cls: "text-heading-3", sample: "Pricing & billing" },
	{ name: "Heading 4", cls: "text-heading-4", sample: "Notification preferences" },
]
const title: Spec[] = [
	{ name: "Title LG", cls: "text-title-lg", sample: "Untitled (gold rush)" },
	{ name: "Title SM", cls: "text-title-sm", sample: "Invoice INV-0042" },
]
const body: Spec[] = [
	{
		name: "Body LG",
		cls: "text-body-lg",
		sample: "Choose clear, readable type that helps people understand the page and complete their task.",
	},
	{ name: "Body MD", cls: "text-body-md", sample: "Save your work, share it with your team, and come back when you're ready." },
	{ name: "Body SM", cls: "text-body-sm", sample: "You can change this later from privacy settings." },
	{ name: "Body XS", cls: "text-body-xs", sample: "Queued 3 of 12 · retrying on rate limit · last run 14:02:36." },
]
const label: Spec[] = [
	{ name: "Label LG", cls: "text-label-lg", sample: "Upgrade plan" },
	{ name: "Label MD", cls: "text-label-md", sample: "12 members" },
	{ name: "Label SM", cls: "text-label-sm", sample: "Updated today" },
	{ name: "Label XS", cls: "text-label-xs", sample: "Trending now", note: "sentence case" },
	{ name: "Caption", cls: "text-caption", sample: "Posted 2 hours ago" },
]
const overline: Spec[] = [{ name: "Overline", cls: "text-overline", sample: "New in 0.25", note: "caps, tracked" }]
const mono: Spec[] = [
	{ name: "Mono XL", cls: "text-mono-xl", sample: "$48,210", note: "tabular" },
	{ name: "Mono LG", cls: "text-mono-lg", sample: "1,204 runs", note: "tabular" },
	{ name: "Mono MD", cls: "text-mono-md", sample: "5J7s…8xQp · ab12cd34", note: "tabular" },
	{ name: "Mono Caption", cls: "text-mono-caption", sample: "b4c1…9f2e · 341 ms · $0.0021", note: "tabular" },
	{ name: "Mono SM", cls: "text-mono-sm", sample: "req_5J7s8xQp", note: "tabular" },
]
const workspace: Spec[] = [
	{ name: "UI Title", cls: "text-ui-title", sample: "Layer properties" },
	{ name: "UI Section", cls: "text-ui-section", sample: "Appearance" },
	{ name: "UI MD", cls: "text-ui-md", sample: "Opacity" },
	{ name: "UI Body", cls: "text-ui-body", sample: "Applies to every selected layer." },
	{ name: "UI SM", cls: "text-ui-sm", sample: "Blend mode" },
	{ name: "UI Micro", cls: "text-ui-micro", sample: "Auto-saved" },
	{ name: "UI Num", cls: "text-ui-num", sample: "1,280 × 720", note: "tabular" },
]

export function TypographyPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Typography"
				lede="A small, fixed set of type styles, each picked by the job the text does rather than its size."
			/>

			<Section
				title="Read live"
				description="Every number on this page is measured from the sample beside it, so it follows the theme picker, the customizer and the type base. This site sets --type-base: 14 on wide screens, so its sizes read smaller than a default app's."
			>
				<p className="text-body-sm text-muted-foreground">
					Size / line height · weight, in px. Change the base with one number on <InlineCode>:root</InlineCode>, a theme scope or a
					preset; never by retuning tiers one by one, and never with <InlineCode>html {"{ font-size }"}</InlineCode>, which also
					resizes every rem the app wrote and overrides the reader's browser text size.
				</p>
				<CodeBlock code={`:root {\n  --type-base: 14; /* unitless px; 16 is the default */\n}`} />
			</Section>

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
			<Section title="Label" description="Short, scannable UI text in sentence case: buttons, fields, badges, timestamps.">
				{label.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section
				title="Overline"
				description="The eyebrow: an uppercase, letter-spaced kicker above a marketing heading, at most one per view. <Label eyebrow> renders it. Never product chrome: nav groups, table headers and form sections are sentence-case caption or label-md."
			>
				{overline.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section title="Mono" description="Code, IDs and numbers that need to line up. XL and LG are for a metric that is the content.">
				{mono.map((s) => (
					<SpecRow key={s.name} spec={s} />
				))}
			</Section>
			<Section
				title="Workspace tiers"
				description={`Tool chrome runs smaller and in absolute px, so it does not scale with the type base. Inside a Workspace (or any data-density="compact" scope) the page tiers above compress onto these on their own.`}
			>
				{workspace.map((s) => (
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
