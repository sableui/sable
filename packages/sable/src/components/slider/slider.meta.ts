import type { ComponentMeta } from "../../lib/meta"

export const sliderMeta: ComponentMeta = {
	name: "Slider",
	summary:
		"Slider over Base UI Slider — pointer + keyboard control, ARIA slider wiring, and range support via multiple thumbs. The default export composes Root + Control + Track + Indicator + Thumb; pass an array value for a range.",
	status: "stable",
	keywords: [
		"slider",
		"range",
		"value",
		"input",
	],
	usage: {
		description: "Use Slider for bounded numeric choices where approximate adjustment is faster than typing.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use visible labels, min/max context, and value output when precision matters.",
			},
			{
				guidance: "do",
				description: "Choose steps that match the real granularity of the setting.",
			},
			{
				guidance: "dont",
				description: "Do not use Slider when users must enter an exact arbitrary number; use NumberField.",
			},
			{
				guidance: "dont",
				description: "Do not use it without showing the value. A slider with no numeric readout makes any precise choice guesswork — pair it with a ScrubField or a NumberField.",
			},
			{
				guidance: "dont",
				description: "Do not resize the thumb's box on hover, focus, or drag. The thumb is a fixed-size hit target wrapping a decorative dot; only the dot scales. A target that grows under the cursor is a target nobody can learn, and WCAG 2.5.8 measures target size at rest. Restyle the dot, not the box.",
			},
		],
		anatomy: [
			{
				name: "SliderRoot",
				required: true,
				description: "The controlled slider wrapper.",
			},
			{
				name: "SliderControl",
				required: true,
				description: "The interactive slider control region.",
			},
			{
				name: "SliderTrack",
				required: true,
				description: "The visible value range.",
			},
			{
				name: "SliderIndicator",
				required: false,
				description: "The filled portion of the track.",
			},
			{
				name: "SliderThumb",
				required: true,
				description: "The draggable handle.",
			},
			{
				name: "SliderValue",
				required: false,
				description: "A readable value display.",
			},
		],
	},
	related: {
		components: [
			"NumberField",
			"Progress",
		],
	},
	props: [
		{
			name: "value",
			type: "number | number[]",
			default: "—",
			description:
				"Controlled value. An array renders a range slider with one thumb per entry.",
		},
		{
			name: "defaultValue",
			type: "number | number[]",
			default: "—",
			description:
				"Uncontrolled initial value. An array renders a range slider.",
		},
		{
			name: "onValueChange",
			type: "(value, eventDetails) => void",
			default: "—",
			description:
				"Fires on every value change. value is a number (or number[] for a range).",
		},
		{
			name: "min",
			type: "number",
			default: "0",
			description: "Minimum allowed value.",
		},
		{
			name: "max",
			type: "number",
			default: "100",
			description: "Maximum allowed value.",
		},
		{
			name: "step",
			type: "number",
			default: "1",
			description: "Granularity the slider steps through. Snaps to multiples.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Ignore user interaction and dim the control.",
		},
		{
			name: "orientation",
			type: "'horizontal' | 'vertical'",
			default: "horizontal",
			description: "Axis the slider tracks along. A vertical slider has no intrinsic length — give it a height (h-40, or flex-1 in a column).",
		},
		{
			name: "aria-label",
			type: "string",
			default: "—",
			description:
				"Accessible name, applied to each thumb's input (the element with role=slider). A range also names its group with it.",
		},
		{
			name: "getAriaLabel",
			type: "(index) => string",
			default: "—",
			description: "Per-thumb name for a range (\"Minimum price\" / \"Maximum price\"). Wins over aria-label on the thumbs.",
		},
		{
			name: "getAriaValueText",
			type: "(formattedValue, value, index) => string",
			default: "—",
			description:
				"What a screen reader announces for the value when the number alone is wrong — a seek bar's \"1:23 of 3:45\". For units or percent, `format` (Intl.NumberFormatOptions) is enough.",
		},
	],
	subcomponents: [
		{
			name: "SliderRoot",
			type: "Base UI Slider.Root props",
			description:
				"The unstyled Base UI Root for custom composition — owns the value state and forwards value / defaultValue / onValueChange / min / max / step. Drag state surfaces via data-[dragging]. The default Slider export wires all the parts for you.",
		},
		{
			name: "SliderControl",
			type: "Base UI Control props + className",
			description:
				"The interactive track lane — the positioning context the indicator and thumbs sit in; dims when disabled.",
		},
		{
			name: "SliderTrack",
			type: "Base UI Track props + className",
			description: "The full-range rail beneath the indicator.",
		},
		{
			name: "SliderIndicator",
			type: "Base UI Indicator props + className",
			description:
				"The filled portion from min (or the lower thumb) to the current value.",
		},
		{
			name: "SliderThumb",
			type: "Base UI Thumb props + className",
			description:
				"A draggable handle: a fixed-size hit target wrapping a decorative dot. The dot rests small and scales to full size on hover, keyboard focus, and drag; the box never changes, so row metrics and the tap target hold. Range sliders render one per value; pass index for SSR. Interaction state surfaces via data-[dragging].",
		},
		{
			name: "SliderValue",
			type: "Base UI Value props",
			description:
				"Formatted value readout for custom compositions (e.g. a live number beside the control).",
		},
	],
	tokensUsed: ["secondary", "primary", "background", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives with the form or panel it sits in.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Thumb",
			why: "The thumb's dot grows from 12px to full size on hover and keyboard focus, and a little past it while dragging, on a spring. Only the paint resizes, never the hit target, so the growth says the thumb is live without moving where you have to aim.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Thumb",
			why: "The thumb and the filled range follow the pointer one-to-one, and keyboard steps land at once. An eased position would trail the drag and show a value the user has already moved past.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A slider commits as it moves; there is nothing to wait for.",
		},
	],
	a11y: [
		"Base UI provides role=slider, aria-valuemin/max/now, and arrow-key / Page Up-Down / Home-End control.",
		"Each thumb is a focusable input[type=range] nested in the thumb element; keyboard focus raises a 2px ring on the thumb via has-[:focus-visible] (a bare focus-visible: on the thumb never fires, since the div itself is not focusable).",
		"The thumb's hit area is a fixed 16px box at every state. Only the decorative inner dot resizes — rest 12px, full 16px on hover, keyboard focus, and drag — so the target a pointer or finger must land on never moves or changes size. Keyboard users, who never hover, get the enlarged dot from focus-visible.",
		"The rest-to-full transition uses the motion duration/easing tokens, so it collapses to an instant state change under prefers-reduced-motion or MotionProvider off. The size change itself still happens: it reports interaction state, it is not decoration.",
		"Range sliders get one thumb per value with minStepsBetweenValues honored.",
		"Pass aria-label (or getAriaLabel for a range) so each handle has an accessible name. On Slider it reaches the thumb inputs; on a bare SliderRoot it only names the role=group — when composing, put aria-label / getAriaLabel on each SliderThumb, or label the Root with aria-labelledby or a Field, which Base UI does carry to the thumbs.",
		"getAriaValueText sets aria-valuetext for values a number misreads (time, named steps).",
	],
	examples: [
		{
			label: "Single value",
			code: "<Slider defaultValue={50} aria-label=\"Volume\" />",
		},
		{
			label: "Range",
			code: "const [range, setRange] = useState([20, 60])\n<Slider value={range} onValueChange={setRange} aria-label=\"Price range\" getAriaLabel={(i) => (i ? \"Maximum price\" : \"Minimum price\")} />",
		},
		{
			label: "Seek bar with spoken time",
			code: "<Slider value={position} max={duration} onValueChange={seek} aria-label=\"Seek\" getAriaValueText={(_, v) => `${formatTime(v)} of ${formatTime(duration)}`} />",
		},
		{
			label: "Stepped",
			code: "<Slider defaultValue={40} min={0} max={100} step={10} />",
		},
		{
			label: "Vertical",
			code: '<div className="h-40"><Slider orientation="vertical" defaultValue={40} aria-label="Level" /></div>',
		},
		{
			label: "Composed with a value readout",
			code: '<Field label="Volume"><SliderRoot defaultValue={40} className="flex items-center gap-3"><SliderControl><SliderTrack><SliderIndicator /><SliderThumb /></SliderTrack></SliderControl><SliderValue className="text-mono-sm" /></SliderRoot></Field>',
		},
	],
}
