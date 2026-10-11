import {
	ChatComposer,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	SettingsMenu,
	SettingsRow,
	settingsMenuMeta,
} from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const MODELS = [
	{ id: "sol", name: "5.6 Sol" },
	{ id: "lite", name: "5.6 Lite" },
	{ id: "sol-mini", name: "5.6 Sol mini" },
]

const EFFORTS = ["Low", "Standard", "High"]
const SPEEDS = ["Standard", "Priority"]

/** The composer case: a model switcher that states where you are. */
function ModelSwitcher() {
	const [modelId, setModelId] = useState("sol")
	const [effort, setEffort] = useState("High")
	const [speed, setSpeed] = useState("Standard")
	const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0]

	return (
		<div className="flex w-full flex-col gap-3">
			<ChatComposer
				placeholder="Ask anything…"
				onAttach={() => undefined}
				actions={
					<SettingsMenu
						variant="subtle"
						size="xs"
						label="Change model and effort"
						summary={
							<>
								<span className="text-foreground">{model.name}</span>{" "}
								<span className="text-muted-foreground">{effort}</span>
							</>
						}
					>
						<SettingsRow label="Model" value={model.name}>
							<MenuRadioGroup value={modelId} onValueChange={setModelId}>
								{MODELS.map((m) => (
									<MenuRadioItem key={m.id} value={m.id}>
										{m.name}
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</SettingsRow>
						<SettingsRow label="Effort" value={effort}>
							<MenuRadioGroup value={effort} onValueChange={setEffort}>
								{EFFORTS.map((e) => (
									<MenuRadioItem key={e} value={e}>
										{e}
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</SettingsRow>
						<SettingsRow label="Speed" value={speed}>
							<MenuRadioGroup value={speed} onValueChange={setSpeed}>
								{SPEEDS.map((s) => (
									<MenuRadioItem key={s} value={s}>
										{s}
									</MenuRadioItem>
								))}
							</MenuRadioGroup>
						</SettingsRow>
						<MenuSeparator />
						<SettingsRow label="Plan" value="Team" />
					</SettingsMenu>
				}
			/>
			<p className="text-mono-caption text-muted-foreground">
				{model.name} · {effort} · {speed}
			</p>
		</div>
	)
}

/** The same shape with nothing to do with chat. */
function ExportOptions() {
	const [format, setFormat] = useState("PNG")
	const [quality, setQuality] = useState("Final")

	return (
		<SettingsMenu
			side="bottom"
			align="start"
			variant="subtle"
			summary={`${format} · ${quality}`}
			label="Change export options"
		>
			<SettingsRow label="Format" value={format}>
				<MenuRadioGroup value={format} onValueChange={setFormat}>
					{["PNG", "SVG", "PDF"].map((f) => (
						<MenuRadioItem key={f} value={f}>
							{f}
						</MenuRadioItem>
					))}
				</MenuRadioGroup>
			</SettingsRow>
			<SettingsRow label="Quality" value={quality}>
				<MenuRadioGroup value={quality} onValueChange={setQuality}>
					{["Draft", "Final"].map((q) => (
						<MenuRadioItem key={q} value={q}>
							{q}
						</MenuRadioItem>
					))}
				</MenuRadioGroup>
			</SettingsRow>
		</SettingsMenu>
	)
}

/** Both resting treatments, each stating its own live value. */
function Treatments() {
	const [ghostMode, setGhostMode] = useState("Standard")
	const [subtleMode, setSubtleMode] = useState("Standard")
	return (
		<div className="flex flex-wrap items-center gap-6">
			<SettingsMenu summary={`Ghost · ${ghostMode}`} side="bottom" label="Change mode">
				<SettingsRow label="Mode" value={ghostMode}>
					<MenuRadioGroup value={ghostMode} onValueChange={setGhostMode}>
						<MenuRadioItem value="Standard">Standard</MenuRadioItem>
						<MenuRadioItem value="Draft">Draft</MenuRadioItem>
					</MenuRadioGroup>
				</SettingsRow>
			</SettingsMenu>
			<SettingsMenu variant="subtle" summary={`Subtle · ${subtleMode}`} side="bottom" label="Change mode">
				<SettingsRow label="Mode" value={subtleMode}>
					<MenuRadioGroup value={subtleMode} onValueChange={setSubtleMode}>
						<MenuRadioItem value="Standard">Standard</MenuRadioItem>
						<MenuRadioItem value="Draft">Draft</MenuRadioItem>
					</MenuRadioGroup>
				</SettingsRow>
			</SettingsMenu>
		</div>
	)
}

export function SettingsMenuPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Settings Menu"
				lede={ledeFor(settingsMenuMeta)}
			/>

			<ComponentPlayground meta={settingsMenuMeta} />

			<Section
				title="A model switcher"
				description="Shows the active model and effort, and opens to change them."
			>
				<Example>
					<ModelSwitcher />
				</Example>
			</Section>

			<Section
				title="Export options"
				description="The same shape works for any group of related settings."
			>
				<Example>
					<ExportOptions />
				</Example>
			</Section>

			<Section
				title="Two treatments"
				description="Ghost blends into a toolbar. Subtle adds a fill so it doesn't float."
			>
				<Example>
					<Treatments />
				</Example>
			</Section>

			<MetaFooter meta={settingsMenuMeta} />
		</>
	)
}
