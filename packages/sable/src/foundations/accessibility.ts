import type { Foundation } from "./types"

const accessibility: Foundation = {
	slug: "accessibility",
	title: "Accessibility",
	summary:
		"Sable's components ship accessible behavior from Base UI. These rules cover what an app composing them still has to get right.",
	headline: "WCAG AA · 44px targets · visible focus · reduced motion · logical properties",
	vocabularies: [
		{
			title: "Floors",
			terms: [
				{ name: "Contrast", value: "4.5:1 text · 3:1 UI and large text", use: "Every semantic text/surface pair is checked per theme by contrast.test.ts." },
				{ name: "Hit area", value: "44×44px", use: "hit-target keeps a small control at the floor without moving layout." },
				{ name: "Focus", value: "ring-2 ring-ring, full opacity", use: "Visible on every interactive element, in light, dark and forced-colors." },
				{ name: "Mobile input text", value: "≥ 16px", use: "iOS Safari zooms the page on focus below it." },
				{ name: "Reduced motion", value: "--motion-scale: 0", use: "Transitions resolve instantly; loaders hold their first frame." },
			],
		},
	],
	rules: [
		{
			rule: "Use the component, not a div with a click handler.",
			why: "Base UI supplies roles, keyboard handling and focus management. A clickable div has none of them.",
		},
		{
			rule: "Every control has an accessible name.",
			why: "Icon-only buttons take aria-label. Fields take a <Label> through <Field>, which also wires aria-describedby and aria-invalid.",
		},
		{
			rule: "A live region exists before it has anything to say.",
			why: "Render role=\"status\" empty from the start and swap its text. A region inserted together with its content is announced inconsistently.",
		},
		{
			rule: "On client-side navigation, update document.title and move focus to the new view's h1.",
			why: "Route changes are silent to assistive technology unless the app announces them. AppShell supplies the skip link and landmarks; the app does the rest.",
		},
		{
			rule: "Keep submit enabled; validate on submit and focus the first invalid field.",
			why: "A disabled submit hides why it is disabled. Focus is the only way a screen-reader user finds the error.",
		},
		{
			rule: "Use logical properties: ms-/me-/ps-/pe-/text-start/inset-inline-*.",
			why: "Flex and grid mirror for free under dir=\"rtl\"; hand-positioned elements do not.",
			enforcedBy: "design-lint: physical-direction (ratchet)",
		},
		{
			rule: "Decorative layers over content take pointer-events-none and aria-hidden.",
			why: "Scrims, glows and fades otherwise swallow clicks on the controls beneath.",
		},
		{
			rule: "Check focus and disabled states under forced-colors: active.",
			why: "Windows High Contrast overrides ring colors and erases opacity-based disabled styling.",
		},
	],
	noGos: [
		{
			never: "Color as the only signal (a red border with no message).",
			instead: "Color plus text or an icon.",
			why: "Roughly 1 in 12 men cannot tell red from green.",
		},
		{
			never: "Opacity on the focus ring.",
			instead: "ring-ring at full opacity; tune the token in the theme.",
			why: "A faded ring loses the contrast the theme tested.",
			enforcedBy: "sable-lint: faded-focus-ring",
		},
		{
			never: "Blocking paste, or type=\"number\" for codes and card numbers.",
			instead: "type=\"text\" inputMode=\"numeric\" with the right autocomplete.",
			why: "Blocking paste breaks password managers; number inputs scroll-change identifiers.",
		},
		{
			never: "forced-color-adjust: none to 'fix' high-contrast mode.",
			instead: "Let the system colors apply; verify the result.",
			why: "It removes the user's chosen colors exactly where they need them.",
		},
		{
			never: "outline: none without a replacement.",
			instead: "focus-visible:ring-2 ring-ring.",
			why: "Keyboard users lose their place.",
		},
	],
	details: [
		{
			title: "An icon-only button",
			before: '<Button size="icon"><Icon name="xmark" /></Button>',
			after: '<Button size="icon" aria-label="Close"><Icon name="xmark" /></Button>',
			why: "Without a name, a screen reader announces only 'button'.",
		},
		{
			title: "A status that announces",
			before: '{saved && <p role="status">Saved</p>}',
			after: '<p role="status">{saved ? "Saved" : ""}</p>',
			why: "The region is in the accessibility tree before its text changes, so the change is announced.",
		},
	],
	related: ["typography", "motion", "sable component <Name> --a11y"],
}

export default accessibility
