import type { ComponentMeta } from "../../lib/meta"

export const browserMeta: ComponentMeta = {
	name: "Browser",
	summary:
		"A generic, current browser window: one compact toolbar (window controls, back/forward/reload, a centered address field) around page content.",
	status: "stable",
	keywords: [
		"browser",
		"mockup",
		"preview",
		"website",
	],
	usage: {
		description: "Use Browser to frame a website or product surface preview when the browser chrome is part of the story.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for documentation, product examples, and visual previews where the page context matters.",
			},
			{
				guidance: "do",
				description: "Keep the framed content simple enough to remain legible at the rendered size.",
			},
			{
				guidance: "dont",
				description: "Do not use Browser for real navigation, real forms, or arbitrary card decoration.",
			},
			{
				guidance: "dont",
				description: "Do not put a real, working URL in the address pill. It reads as a link, is not one, and invites a click that does nothing.",
			},
		],
	},
	related: {
		components: [
			"Phone",
			"Card",
		],
	},
	props: [
		{
			name: "url",
			type: "string",
			description:
				"Address shown in the centered address pill. Omit for a blank pill.",
		},
		{
			name: "children",
			type: "ReactNode",
			description: "Page content rendered inside the content region.",
		},
	],
	tokensUsed: ["card", "background", "border", "muted", "muted-foreground"],
	a11y: [
		"Purely presentational chrome; the framed content carries its own semantics.",
		"The toolbar is drawn, not interactive, and hidden from assistive technology; the address is decorative text.",
	],
	examples: [
		{
			label: "Framing a page",
			code: '<Browser url="studio.example/explore"><div className="p-8"><PageHeader title="Explore" description="Trending posts from every chain." /></div></Browser>',
		},
		{
			label: "Mockup, not chrome",
			code: `// Browser is DECORATIVE framing for a screenshot or a demo — it belongs on a
// marketing page, never around your actual app.

<Region max="wide">
  <Browser url="studio.example">
    <img src="/screenshots/editor.png" alt="The editor" />
  </Browser>
</Region>

// ✗ Wrapping live UI in it. The frame implies "this is a picture of software";
//   putting real controls inside makes users hunt for a browser that isn't there.
// ✗ Using it to fake a URL bar for credibility. Show the real product.`,
		},
	],
}
