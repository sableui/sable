import { cn } from "@sableui/react"
import * as blocks from "@sableui/react/blocks"
import type { ComponentType } from "react"
import catalogBlocks from "../generated/catalog-blocks.json"
import { Example, InlineCode, PageHeader, Section } from "../components/docs-ui"

interface BlockItem {
	name: string
	family: string
	kind: "card" | "section"
	width?: { min: string; max: string }
	summary: string
	imports: string
	code: string
}

const items = catalogBlocks as BlockItem[]
const components = blocks as unknown as Record<string, ComponentType>

/**
 * A block takes the full row when it is a section or a card designed wider
 * than half the row holds (the 20rem cards pair up; the 42rem ones do not).
 */
function isWide(block: BlockItem) {
	return block.kind === "section" || Number.parseFloat(block.width?.max ?? "0") > 24
}

/**
 * Families A–Z. Within one, the pairable cards come first and the full-row
 * blocks after, so the two-up rows fill instead of leaving a half row before
 * each wide block.
 */
const families = [...new Set(items.map((b) => b.family))].sort().map((family) => ({
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
		<>
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
					<div className="grid gap-x-6 gap-y-10 xl:grid-cols-2">
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
									<Example code={`${block.imports}\n\n${block.code}`} className="md:p-6">
										<Block />
									</Example>
									<figcaption className="grid gap-0.5">
										<span className="text-title-sm">{titleOf(block.name)}</span>
										<span className="text-body-sm text-muted-foreground">{captionOf(block.summary)}</span>
									</figcaption>
								</figure>
							)
						})}
					</div>
				</Section>
			))}
		</>
	)
}
