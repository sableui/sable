import type { ComponentMeta } from "../../lib/meta"

export const sparklineMeta: ComponentMeta = {
	name: "Sparkline",
	summary: "A word-sized trend with no axes — a line, a line over a soft fill, or columns — sized by its container, for stat cards, table cells and sentences. Draws on as it scrolls into view.",
	keywords: [
		"sparkline",
		"trend",
		"mini chart",
		"inline chart",
		"micro chart",
		"kpi",
		"stat"
	],
	usage: {
		description: "Use Sparkline next to a number to show where it has been — a KPI's last 30 days in a stat card, a row's trend in a table. It has no axes, tooltip or values to read off; when the reader needs those, use AreaChart or LineChart.",
		bestPractices: [
			{
				guidance: "do",
				description: "Pair it with the current value and its change in text; the sparkline shows only the shape."
			},
			{
				guidance: "do",
				description: "Give it a label that names the measure and the period — the spoken summary adds the range and latest value."
			},
			{
				guidance: "dont",
				description: "Put two sparklines on one shared axis to compare them — each scales to its own data; use LineChart."
			},
			{
				guidance: "dont",
				description: "Use it as the only place a number appears; a shape without a value cannot be read off."
			}
		]
	},
	related: {
		components: [
			"AreaChart",
			"LineChart",
			"Card",
			"Table"
		]
	},
	status: "beta",
	props: [
		{
			name: "data",
			type: "number[]",
			description: "The values, oldest first."
		},
		{
			name: "label",
			type: "string",
			description: "What the line tracks (\"Revenue, last 30 days\"). The spoken summary adds the first and last values, low and high."
		},
		{
			name: "variant",
			type: "\"line\" | \"area\" | \"bar\"",
			default: "\"line\"",
			description: "A line, a line over a soft fill, or columns."
		},
		{
			name: "tone",
			type: "\"edition\" | \"collectible\" | \"standard\" | \"info\" | \"warning\" | \"primary\" | \"neutral\" | \"success\" | \"destructive\"",
			default: "\"primary\"",
			description: "Colour by role."
		},
		{
			name: "className",
			type: "string",
			default: "\"h-8 w-24\"",
			description: "Sizes it; the drawing stretches to fit."
		},
		{
			name: "animate",
			type: "boolean",
			default: "true",
			description: "Draw on (or rise) when it scrolls into view."
		},
		{
			name: "locale",
			type: "string",
			default: "runtime locale",
			description: "BCP 47 locale for default number and date formatting."
		}
	],
	variants: {
		variant: [
			"line",
			"area",
			"bar"
		]
	},
	tokensUsed: [
		"primary",
		"tone-edition",
		"tone-collectible",
		"tone-standard",
		"tone-info",
		"tone-warning",
		"muted-foreground",
		"success",
		"destructive"
	],
	motion: [
		{
			slot: "arrival",
			recipe: "custom",
			part: "Line / bars",
			why: "Once on screen the line draws on (or the bars rise, in sequence). On the motion tokens; reduced motion shows the finished drawing."
		},
		{
			slot: "response",
			recipe: "none",
			part: "Sparkline",
			why: "Not interactive: it has no tooltip or focus."
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Sparkline",
			why: "New data redraws in place; a word-sized chart animating on every update would distract from the number beside it."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Sparkline",
			why: "No indeterminate state."
		}
	],
	a11y: [
		"Rendered role=img with an aria-label built from `label` and the data: \"Revenue, last 30 days: from 120 to 184, low 96, high 190\".",
		"It is not focusable and has no tooltip, so the number it accompanies must be in text beside it."
	],
	examples: [
		{
			label: "In a stat card",
			code: "<Card>\n\t<CardHeader>\n\t\t<CardDescription>Revenue</CardDescription>\n\t\t<CardTitle className=\"text-mono-xl\">$18,240</CardTitle>\n\t\t<CardAction>\n\t\t\t<Sparkline label=\"Revenue, last 12 weeks\" data={[12, 14, 13, 17, 16, 19, 18, 21, 20, 24, 23, 26]} variant=\"area\" tone=\"success\" />\n\t\t</CardAction>\n\t</CardHeader>\n</Card>"
		},
		{
			label: "Columns in a table cell",
			code: "<Sparkline label=\"Daily signups, last 14 days\" data={[4, 6, 3, 8, 7, 9, 5, 6, 10, 8, 7, 11, 9, 12]} variant=\"bar\" className=\"h-6 w-20\" />"
		}
	]
}
