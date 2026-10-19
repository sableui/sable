import { Scroller, SectionRail, sectionRailMeta } from "@sableui/react"
import { useRef } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const CHAPTERS = [
	{
		id: "rail-overview",
		label: "Overview",
		body: "A reading app for long-form research, rebuilt so a forty-page report reads like an article rather than a PDF.",
	},
	{
		id: "rail-problem",
		label: "The problem",
		body: "Readers lost their place. Reports had no visible structure past the first screen, and the only way back to a chart was scrolling and hoping.",
	},
	{
		id: "rail-research",
		label: "Research",
		body: "Twelve interviews and a week of session recordings. Most readers skimmed the headings first, then went back to two or three sections in depth.",
	},
	{
		id: "rail-process",
		label: "Process",
		body: "We tried a sticky contents list, a progress bar and a chapter menu. The quietest one tested best: a rail that stays out of the text until it is needed.",
	},
	{
		id: "rail-outcome",
		label: "Outcome",
		body: "Time to find a section halved, and readers returned to reports twice as often in the month after launch.",
	},
	{
		id: "rail-next",
		label: "What's next",
		body: "Shared highlights, so a team can see which sections their colleagues spent time in.",
	},
]

function ScrollingDemo({ side = "left" }: { side?: "left" | "right" }) {
	const scroller = useRef<HTMLDivElement>(null)
	return (
		<div className="relative w-full">
			<Scroller ref={scroller} label="Case study" smoothWheel={false} className="h-96 w-full">
				<div className={side === "left" ? "py-10 ps-24 pe-10" : "py-10 ps-10 pe-24"}>
					{CHAPTERS.map((chapter) => (
						<section key={chapter.id} id={`${chapter.id}-${side}`} className="max-w-prose pb-24 last:pb-10">
							<h3 className="text-title-lg text-foreground">{chapter.label}</h3>
							<p className="mt-2 text-body-md text-muted-foreground">{chapter.body}</p>
						</section>
					))}
				</div>
			</Scroller>
			<SectionRail
				root={scroller}
				side={side}
				aria-label="Case study sections"
				sections={CHAPTERS.map((chapter) => ({ id: `${chapter.id}-${side}`, label: chapter.label }))}
				className={
					side === "left"
						? "absolute top-1/2 left-6 -translate-y-1/2"
						: "absolute top-1/2 right-6 -translate-y-1/2"
				}
			/>
		</div>
	)
}

export function SectionRailPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Section Rail" lede={ledeFor(sectionRailMeta)} />

			<Section
				title="Beside a long read"
				description="Scroll the text: the bar follows the section you are reading. Hover or focus a dot for its name, and pick one to jump there."
			>
				<Example
					flush
					code={`<SectionRail
  aria-label="Case study sections"
  sections={[
    { id: "overview", label: "Overview" },
    { id: "problem", label: "The problem" },
    { id: "research", label: "Research" },
    { id: "process", label: "Process" },
    { id: "outcome", label: "Outcome" },
    { id: "next", label: "What's next" },
  ]}
  className="fixed top-1/2 left-6 z-(--z-nav) -translate-y-1/2 max-lg:hidden"
/>`}
				>
					<ScrollingDemo />
				</Example>
			</Section>

			<Section
				title="On the right edge, inside a scroller"
				description={'With side="right" the labels open to the left, toward the text. When the content scrolls inside an element rather than the window, pass that element as root.'}
			>
				<Example
					flush
					code={`const scroller = useRef<HTMLDivElement>(null)

<div className="relative">
  <Scroller ref={scroller} label="Case study" className="h-96">
    {/* the sections, each with its id */}
  </Scroller>
  <SectionRail
    root={scroller}
    side="right"
    sections={sections}
    className="absolute top-1/2 right-6 -translate-y-1/2"
  />
</div>`}
				>
					<ScrollingDemo side="right" />
				</Example>
			</Section>

			<MetaFooter meta={sectionRailMeta} />
		</>
	)
}
