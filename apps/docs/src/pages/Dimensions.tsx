import { Button, Icon, Stack } from "@sableui/react"
import { PageHeader, Section } from "../components/docs-ui"

const SPACE: [string, string][] = [
	["1", "4px"],
	["2", "8px"],
	["3", "12px"],
	["4", "16px"],
	["6", "24px"],
	["8", "32px"],
	["12", "48px"],
	["16", "64px"],
	["24", "96px"],
]

const CONTROLS: [string, string][] = [
	["xs", "28"],
	["sm", "32"],
	["md", "40"],
	["cta", "44"],
	["lg", "48"],
]

const ICONS: [string, string, string][] = [
	["xs", "text-sm", "14"],
	["sm", "text-base", "16"],
	["md", "text-xl", "20"],
	["lg", "text-2xl", "24"],
	["xl", "text-[2rem]", "32"],
]

export function DimensionsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Foundations"
				title="Dimensions"
				lede="One 4px scale sets every gap, padding and size, so everything lands on the same grid."
			/>

			<Section
				title="Spacing scale"
				description="A 4px base with an 8px rhythm. Related things sit closer than unrelated ones."
			>
				<Stack gap={2}>
					{SPACE.map(([step, px]) => (
						<div key={step} className="flex items-center gap-4">
							<code className="text-mono-sm text-muted-foreground w-14 shrink-0">
								{step}
							</code>
							<div
								className="h-4 rounded-xs bg-tone-1"
								style={{ width: px }}
							/>
							<span className="text-body-sm text-muted-foreground">{px}</span>
						</div>
					))}
				</Stack>
			</Section>

			<Section
				title="Control sizes"
				description="md is the default for buttons, inputs and selects."
			>
				<div className="flex flex-wrap items-end gap-4">
					{CONTROLS.map(([name, px]) => (
						<div key={name} className="text-center">
							<div
								className="flex items-center justify-center rounded-sm border border-border bg-card px-5"
								style={{ height: `var(--control-${name})` }}
							>
								<span className="text-label-md">{name}</span>
							</div>
							<p className="text-mono-sm text-muted-foreground mt-2">{px}px</p>
						</div>
					))}
				</div>
			</Section>

			<Section
				title="Icon sizes"
				description="Icons scale with text and take its color. md is the default."
			>
				<div className="flex flex-wrap items-end gap-8">
					{ICONS.map(([name, size, px]) => (
						<div key={name} className="text-center">
							<Icon name="gear" className={size} />
							<p className="text-body-sm text-muted-foreground mt-2">
								{name} · {px}px
							</p>
						</div>
					))}
				</div>
			</Section>

			<Section
				title="Touch targets"
				description="Anything tappable gets at least a 44px hit area, even when it looks smaller."
			>
				<div className="flex items-center gap-4">
					<div className="grid size-11 place-items-center rounded-full border border-dashed border-ring/60">
						<Button variant="secondary" size="icon-sm" aria-label="Settings">
							<Icon name="gear" />
						</Button>
					</div>
					<p className="text-body-sm text-muted-foreground">
						A 44px hit area around a 32px control.
					</p>
				</div>
			</Section>
		</>
	)
}
