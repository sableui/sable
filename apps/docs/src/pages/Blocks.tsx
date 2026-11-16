import { Grid, ToastProvider, cn } from "@sableui/react"
import * as blocks from "@sableui/react/blocks"
import type { ComponentType } from "react"
import catalogBlocks from "../generated/catalog-blocks.json"
import { Example, InlineCode, PageHeader, Section } from "../components/docs-ui"
import { MountWhenVisible } from "../components/MountWhenVisible"
import { holdSampleLinks } from "./previews/inert-links"

interface BlockItem {
	name: string
	family: string
	kind: "card" | "section"
	width?: { min: string; max: string }
	summary: string
}

const items = catalogBlocks as BlockItem[]

/**
 * Each block's source, fetched from its own JSON file when a Code tab opens or
 * Copy is pressed (scripts/sync-guides.mjs splits it out): 54 blocks' source
 * was most of this page's payload. One loader per block, made once, so the
 * Code tab's effect does not refetch on every render.
 */
const codeOf = Object.fromEntries(
	items.map((block) => [
		block.name,
		() => import("../generated/catalog-blocks-code.json").then((mod) => (mod.default as Record<string, string>)[block.name] ?? ""),
	]),
)
const components = blocks as unknown as Record<string, ComponentType<Record<string, unknown>>>

/**
 * Media the docs serve and a consumer would not. A block's own constants
 * leave it empty (seeded art), so an app importing the preview never asks for
 * a sableui.com path; here the docs pass their photo in.
 */
const docsProps: Record<string, Record<string, unknown>> = {
	PhotoAdjustBlock: { image: "/media/photos/ridge-first-light.jpg" },
}

/**
 * A block takes the full row when it is a section or a card designed wider
 * than half the row holds (the 20rem cards pair up; the 42rem ones do not).
 */
function isWide(block: BlockItem) {
	return block.kind === "section" || Number.parseFloat(block.width?.max ?? "0") > 24
}

/**
 * Families in the order a product is built, not A–Z: the front door
 * (marketing, sign-in), the app itself (dashboards, money, settings), the
 * people and agents in it, then the utilities every app needs one of. A–Z put
 * "AI & agents" first, so the page opened on its most specialised block. A
 * family missing here sorts to the end, A–Z, rather than disappearing.
 *
 * Within one, the pairable cards come first and the full-row blocks after, so
 * the two-up rows fill instead of leaving a half row before each wide block.
 */
const FAMILY_ORDER = [
	"Marketing",
	"Auth",
	"Dashboard",
	"Commerce",
	"Settings & team",
	"Social & messaging",
	"AI & agents",
	"Media & files",
	"Navigation",
	"System",
]
const rank = (family: string) => {
	const index = FAMILY_ORDER.indexOf(family)
	return index === -1 ? FAMILY_ORDER.length : index
}
const families = [...new Set(items.map((b) => b.family))]
	.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
	.map((family) => ({
	family,
	blocks: items.filter((b) => b.family === family).sort((a, b) => Number(isWide(a)) - Number(isWide(b))),
}))

/** "SignInBlock" → "Sign in" */
function titleOf(name: string) {
	const words = name.replace(/Block$/, "").split(/(?=[A-Z])/).map((w) => w.toLowerCase())
	const title = words.join(" ")
	return title.charAt(0).toUpperCase() + title.slice(1)
}

/** The summary's opening clause: "A sign-in card: email and…" → "A sign-in card" */
function captionOf(summary: string) {
	return summary.split(/: | — /)[0].replace(/\.$/, "")
}

export function BlocksPage() {
	return (
		// Blocks that end in a toast (Storage, Share) need a provider, mounted
		// once here as the canvas does.
		<ToastProvider position="bottom-center">
			<PageHeader
				eyebrow="Components"
				title="Blocks"
				lede="Ready-made pieces of a page, built from Sable components. They are starting points, not requirements: use one when its layout fits your product, change it freely, or compose your own from the same parts."
			/>

			<p className="mb-12 max-w-(--measure-prose) text-body-md text-muted-foreground text-pretty">
				Each block fills its container up to the width it was designed for. Size it from the layout around it or
				with <InlineCode>className</InlineCode>. Blocks built on a card take <InlineCode>framed={"{false}"}</InlineCode> to
				drop the card when a sheet or dialog already frames them. Agents can fetch any block with{" "}
				<InlineCode>sable block &lt;Name&gt; --code</InlineCode>.
			</p>

			{families.map(({ family, blocks: list }) => (
				<Section key={family} title={family}>
					<Grid cols={{ base: 1, xl: 2 }} gap={[5, 3]}>
						{list.map((block) => {
							const Block = components[block.name]
							return (
								// Equal rows: the figure stretches to its row, the frame takes the
								// space above the caption, and the stage fills the frame, so two
								// blocks side by side share one height and their captions align.
								<figure
									key={block.name}
									className={cn(
										"m-0 grid min-w-0 grid-rows-[1fr_auto] gap-3",
										"[&_[data-docs-example]]:flex [&_[data-docs-example]]:flex-col [&_[data-docs-example]>[role=tabpanel]]:flex-1 [&_[data-docs-example]>[role=tabpanel]>*]:h-full",
										isWide(block) && "xl:col-span-2",
									)}
								>
									<Example code={codeOf[block.name]} className="md:p-6">
										{/* Mounted about a screen before it scrolls in, holding roughly
										    its median height until then (cards ~270px, full-row ~360px
										    at desktop), so the page does not jump. */}
										<MountWhenVisible minHeight={isWide(block) ? "24rem" : "18rem"}>
											{/* Sample links are routes in the copying app, not pages here. */}
											<div className="contents" onClickCapture={holdSampleLinks}>
												<Block {...docsProps[block.name]} />
											</div>
										</MountWhenVisible>
									</Example>
									<figcaption className="grid gap-0.5">
										<span className="text-title-sm">{titleOf(block.name)}</span>
										<span className="text-body-sm text-muted-foreground">{captionOf(block.summary)}</span>
									</figcaption>
								</figure>
							)
						})}
					</Grid>
				</Section>
			))}
		</ToastProvider>
	)
}
