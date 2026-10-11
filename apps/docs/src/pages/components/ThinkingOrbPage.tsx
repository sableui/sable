import { InlineStatus, ThinkingOrb, thinkingOrbMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ThinkingOrbPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Thinking Orb"
				lede={ledeFor(thinkingOrbMeta)}
			/>

			<ComponentPlayground meta={thinkingOrbMeta} />

			<Section
				title="Basic"
				description="A drifting cloud of dots that says an agent is working."
			>
				<Example>
					<ThinkingOrb />
				</Example>
			</Section>

			<Section
				title="Modes"
				description="Orbit for thinking, globe for searching, mesh for connecting sources."
			>
				<Example
					code={`<ThinkingOrb mode="orbit" size="lg" />
<ThinkingOrb mode="globe" size="lg" label="Searching" />
<ThinkingOrb mode="mesh" size="lg" label="Connecting" />`}
				>
					<ThinkingOrb mode="orbit" size="lg" />
					<ThinkingOrb mode="globe" size="lg" label="Searching" />
					<ThinkingOrb mode="mesh" size="lg" label="Connecting" />
				</Example>
			</Section>

			<Section
				title="Size"
				description="Each size is tuned on its own, so the small one stays legible."
			>
				<Example
					code={`<ThinkingOrb size="sm" />
<ThinkingOrb size="md" />
<ThinkingOrb size="lg" />`}
				>
					<ThinkingOrb size="sm" />
					<ThinkingOrb size="md" />
					<ThinkingOrb size="lg" />
				</Example>
			</Section>

			<Section
				title="Color"
				description="The dots take the surrounding text color."
			>
				<Example
					code={`<ThinkingOrb size="lg" className="text-foreground" />
<ThinkingOrb size="lg" className="text-muted-foreground" />
<ThinkingOrb size="lg" className="text-primary" />`}
				>
					<ThinkingOrb size="lg" className="text-foreground" />
					<ThinkingOrb size="lg" className="text-muted-foreground" />
					<ThinkingOrb size="lg" className="text-primary" />
				</Example>
			</Section>

			<Section
				title="In a status line"
				description="A small orb as the icon of an InlineStatus, beside text that says what the agent is doing."
			>
				<Example
					code={`<InlineStatus icon={<ThinkingOrb size="sm" />}>Thinking…</InlineStatus>
<InlineStatus icon={<ThinkingOrb mode="globe" size="sm" label="Searching" />}>
	Searching your workspace…
</InlineStatus>
<InlineStatus icon={<ThinkingOrb mode="mesh" size="sm" label="Connecting" />}>
	Reading 4 sources…
</InlineStatus>`}
				>
					<div className="flex flex-col gap-3">
						<InlineStatus icon={<ThinkingOrb size="sm" />}>Thinking…</InlineStatus>
						<InlineStatus icon={<ThinkingOrb mode="globe" size="sm" label="Searching" />}>
							Searching your workspace…
						</InlineStatus>
						<InlineStatus icon={<ThinkingOrb mode="mesh" size="sm" label="Connecting" />}>
							Reading 4 sources…
						</InlineStatus>
					</div>
				</Example>
			</Section>

			<Section
				title="Speed and pause"
				description="Slower, default and faster, then paused on a still frame."
			>
				<Example
					code={`<ThinkingOrb size="lg" speed={0.5} />
<ThinkingOrb size="lg" />
<ThinkingOrb size="lg" speed={2} />
<ThinkingOrb size="lg" paused />`}
				>
					<ThinkingOrb size="lg" speed={0.5} />
					<ThinkingOrb size="lg" />
					<ThinkingOrb size="lg" speed={2} />
					<ThinkingOrb size="lg" paused />
				</Example>
			</Section>

			<MetaFooter meta={thinkingOrbMeta} />
		</>
	)
}
