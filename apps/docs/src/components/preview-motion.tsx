import {
	Button,
	Icon,
	Menu,
	MenuContent,
	MenuGroup,
	MenuGroupLabel,
	MenuRadioGroup,
	MenuRadioItem,
	MenuTrigger,
	type MotionLevel,
	MotionScope,
	SimpleTooltip,
} from "@sableui/react"
import { Fragment, type ReactNode, useState } from "react"

/*
 * Motion for ONE preview: the level it plays at and a way to watch it again.
 *
 * Every component page frames its examples the same way (docs-ui's Example and
 * the Playground), so these controls live in one place and every frame gets
 * them. The level is a <MotionScope> around the preview — the same tool an app
 * uses for one dense region — so what the reader sees under "Subtle" is
 * exactly what `<MotionScope level="subtle">` or a component's `motion` prop
 * ships. It can only turn motion down: under the site's Off (or the reader's
 * reduce-motion setting) a preview at Full holds still too.
 */

export const PREVIEW_LEVELS: readonly { value: MotionLevel; label: string; hint: string }[] = [
	{ value: "full", label: "Full", hint: "everything plays" },
	{ value: "subtle", label: "Subtle", hint: "essential only" },
	{ value: "off", label: "Off", hint: "nothing moves" },
]

const LEVEL_LABEL = Object.fromEntries(PREVIEW_LEVELS.map((level) => [level.value, level.label])) as Record<MotionLevel, string>

/**
 * A preview's level and replay count. `replayKey` re-keys the preview, so a
 * replay is a fresh mount: charts rise again, reveals fade up again, arrival
 * choreography starts from its first frame.
 */
export function usePreviewMotion() {
	const [level, setLevel] = useState<MotionLevel>("full")
	const [replayKey, setReplayKey] = useState(0)
	return { level, setLevel, replayKey, replay: () => setReplayKey((current) => current + 1) }
}

/**
 * The preview at its level. Full is no scope at all (inherit the site), so a
 * frame left at Full renders exactly what it did before these controls.
 * Switching level swaps the wrapper, which remounts the preview — the reader
 * sees its arrival at the new level, not a half-played state.
 */
export function PreviewMotionScope({ level, replayKey = 0, children }: { level: MotionLevel; replayKey?: number; children: ReactNode }) {
	const content = <Fragment key={replayKey}>{children}</Fragment>
	return level === "full" ? content : <MotionScope level={level}>{content}</MotionScope>
}

/**
 * The level picker: a quiet icon button that names the level once it is not
 * Full, so a damped preview never passes for the component's real motion.
 */
export function PreviewMotionMenu({ level, onLevelChange }: { level: MotionLevel; onLevelChange: (level: MotionLevel) => void }) {
	const scoped = level !== "full"
	return (
		<Menu>
			<SimpleTooltip content="Motion in this preview">
				<MenuTrigger
					render={
						<Button
							variant="ghost"
							size={scoped ? "xs" : "icon-sm"}
							iconStart={scoped ? <Icon name="motion" /> : undefined}
							aria-label={`Motion in this preview: ${LEVEL_LABEL[level]}`}
							className="text-muted-foreground"
						/>
					}
				>
					{scoped ? LEVEL_LABEL[level] : <Icon name="motion" />}
				</MenuTrigger>
			</SimpleTooltip>
			<MenuContent align="end" className="w-56">
				<MenuGroup>
					<MenuGroupLabel>Motion in this preview</MenuGroupLabel>
					<MenuRadioGroup value={level} onValueChange={(next) => onLevelChange(next as MotionLevel)}>
						{PREVIEW_LEVELS.map((option) => (
							<MenuRadioItem key={option.value} value={option.value} closeOnClick>
								{option.label} <span className="text-muted-foreground">· {option.hint}</span>
							</MenuRadioItem>
						))}
					</MenuRadioGroup>
				</MenuGroup>
			</MenuContent>
		</Menu>
	)
}

/**
 * Watch the preview again from its first frame. The one Replay on the site:
 * the Playground's header, a code frame's header and a code-less frame's
 * corner all render this, so it reads the same wherever it is.
 *
 * Offered only where a preview plays something on its own — a chart drawing
 * on, a reply streaming in. A demo that moves only when the reader acts (a
 * press, a hover, a toggle) has nothing to replay: the reader replays it by
 * acting again, so the button would only reset it.
 */
export function PreviewReplayButton({ onReplay }: { onReplay: () => void }) {
	return (
		<Button variant="ghost" size="xs" iconStart={<Icon name="replay" />} onClick={onReplay} className="text-muted-foreground">
			Replay
		</Button>
	)
}
