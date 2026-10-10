import type { ComponentMeta } from "../../lib/meta"

export const switchMeta: ComponentMeta = {
	name: "Switch",
	summary:
		"Binary on/off toggle for immediate-effect settings. Track fills with the primary tone when checked; the thumb slides on a spring-eased transform (mirrored in RTL).",
	status: "stable",
	keywords: [
		"switch",
		"toggle setting",
		"on off",
		"form control",
	],
	usage: {
		description: "Use Switch for immediate on/off settings that take effect as a persistent preference or mode.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for binary settings where the label describes the enabled state.",
			},
			{
				guidance: "do",
				description: "Make the current state obvious through both position and accessible text.",
			},
			{
				guidance: "dont",
				description: "Do not phrase the label as a negative, such as \"Don't send read receipts\". Turning off a negative is a double negative, and the user has to solve it before they can act.",
			},
			{
				guidance: "dont",
				description: "Do not use Switch for one-time agreement, multi-select choices, or submit-only booleans.",
			},
			{
				guidance: "dont",
				description: "Do not use a Switch whose effect is not immediately visible somewhere. A toggle flipped with no observable consequence gives no confirmation it worked, so the user flips it again to check.",
			},
		],
	},
	related: {
		components: [
			"Checkbox",
			"Toggle",
			"ThemeSwitcher",
		],
	},
	props: [
		{
			name: "checked",
			type: "boolean",
			description:
				"Controlled on/off state. Pair with onCheckedChange. Omit for an uncontrolled switch.",
		},
		{
			name: "defaultChecked",
			type: "boolean",
			default: "false",
			description: "Initial state for an uncontrolled switch.",
		},
		{
			name: "onCheckedChange",
			type: "(checked: boolean, eventDetails) => void",
			description:
				"Fired when the switch is toggled. Note: Base UI passes a second eventDetails arg — not the common (checked) => void, so a single-arg handler must widen its signature.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the control and ignores user interaction.",
		},
		{
			name: "readOnly",
			type: "boolean",
			default: "false",
			description: "Prevents toggling while keeping the control fully visible.",
		},
		{
			name: "required",
			type: "boolean",
			default: "false",
			description: "Marks the switch as required when inside a form.",
		},
		{
			name: "name",
			type: "string",
			description: "Identifies the field when the enclosing form is submitted.",
		},
	],
	tokensUsed: ["input", "primary", "primary-foreground", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "Switches arrive as part of a settings list. Animating each one in turns a form into a title sequence.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Root",
			why: "The track is small and its hover change is subtle; without the ease the colour shift reads as a rendering glitch rather than a reaction.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Thumb",
			why: "The thumb sliding IS the affordance — it shows the control has two ends and which one you are now at. Teleporting the thumb makes on and off two unrelated pictures, and users re-read the label to work out which they are looking at. motion-interactive is the right recipe because it declares `translate`, so the thumb transform and the track colour ease on one timeline instead of two.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A switch commits instantly. If the write is slow enough to need a pending state, the surrounding form owns that, not the control.",
		},
	],
	a11y: [
		"Renders Base UI's Switch with a hidden native <input> — role, ARIA, and keyboard (Space/Enter) toggling come for free.",
		"Focus-visible draws a 2px ring in the --ring token.",
		"Disabled state sets cursor-not-allowed and 50% opacity; readOnly keeps full contrast but blocks changes.",
		"Give it an accessible name: wrap it in <Field label=… orientation=\"horizontal\">, which wires the label for you.",
	],
	examples: [
		{ label: "Default (uncontrolled)", code: "<Switch defaultChecked />" },
		{
			label: "Controlled",
			code: "<Switch checked={on} onCheckedChange={setOn} />",
		},
		{ label: "Disabled", code: "<Switch disabled defaultChecked />" },
		{
			label: "With a label",
			code: '<Field label="Reduce motion" orientation="horizontal"><Switch defaultChecked /></Field>',
		},
	],
}
