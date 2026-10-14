import { Entity, Pill, Scroller, scrollerMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const ITEMS = Array.from({ length: 24 }, (_, i) => `Project ${i + 1}`)
const TAGS = [
	"Photography",
	"Generative",
	"Music",
	"Writing",
	"Illustration",
	"Animation",
	"3D",
	"Pixel art",
	"Collage",
	"Typography",
]

export function ScrollerPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Scroller"
				lede={ledeFor(scrollerMeta)}
			/>

			<Section
				title="Vertical"
				description="The edges fade only where there is more to scroll."
			>
				<Example
					code={`<Scroller label="Projects" className="h-64 w-full max-w-sm rounded-lg border border-border">
  <div className="divide-y divide-border">
    {items.map((item) => <Entity key={item} title={item} />)}
  </div>
</Scroller>`}
				>
					<Scroller label="Projects" className="h-64 w-full max-w-sm rounded-lg border border-border">
						<div className="divide-y divide-border">
							{ITEMS.map((item) => <Entity key={item} title={item} />)}
						</div>
					</Scroller>
				</Example>
			</Section>

			<Section
				title="Capped, not fixed"
				description="The box hugs a short list and only scrolls once content passes the cap."
			>
				<Example
					code={`<Scroller label="All projects" className="max-h-64 w-full max-w-xs rounded-lg border border-border">
  <div className="divide-y divide-border">
    {items.map((item) => <Entity key={item} title={item} />)}
  </div>
</Scroller>
<Scroller label="Recent projects" className="max-h-64 w-full max-w-xs rounded-lg border border-border">
  <div className="divide-y divide-border">
    {items.slice(0, 3).map((item) => <Entity key={item} title={item} />)}
  </div>
</Scroller>`}
				>
					<div className="flex w-full flex-col items-start gap-4 sm:flex-row">
						<Scroller label="All projects" className="max-h-64 w-full max-w-xs rounded-lg border border-border">
							<div className="divide-y divide-border">
								{ITEMS.map((item) => <Entity key={item} title={item} />)}
							</div>
						</Scroller>
						<Scroller label="Recent projects" className="max-h-64 w-full max-w-xs rounded-lg border border-border">
							<div className="divide-y divide-border">
								{ITEMS.slice(0, 3).map((item) => <Entity key={item} title={item} />)}
							</div>
						</Scroller>
					</div>
				</Example>
			</Section>

			<Section
				title="Horizontal"
				description="Scrolls sideways, with the left and right edges fading."
			>
				<Example
					code={`<Scroller orientation="horizontal" label="Tags" className="w-full max-w-md rounded-lg border border-border">
  <div className="flex gap-3 p-3">
    {tags.map((tag) => <Pill key={tag}>{tag}</Pill>)}
  </div>
</Scroller>`}
				>
					<Scroller
						orientation="horizontal"
						label="Tags"
						className="w-full max-w-md rounded-lg border border-border"
					>
						<div className="flex gap-3 p-3">
							{TAGS.map((tag) => <Pill key={tag}>{tag}</Pill>)}
						</div>
					</Scroller>
				</Example>
			</Section>

			<MetaFooter meta={scrollerMeta} />
		</>
	)
}
