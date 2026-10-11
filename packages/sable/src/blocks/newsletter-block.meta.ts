import type { BlockMeta } from "../lib/meta"

export const newsletterBlockMeta: BlockMeta = {
	name: "NewsletterBlock",
	family: "Marketing",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "A newsletter sign-up card: the list's name, what it sends and how often, and an email field with Subscribe.",
	intent:
		"Reach for this in a footer, at the end of an article, or beside a changelog. Creating an account is SignUpBlock; inviting a teammate is InviteTeamBlock.",
	notes: [
		"Copied from the BrandLandingPage page shell's footer.",
		"The description says how often mail arrives — the one thing people want to know before they subscribe.",
		"The field and button sit side by side from sm up and stack on a phone, where the button goes full width.",
	],
	a11y: [
		"The input has a real (visually hidden) <label>, not just a placeholder.",
		"The CardTitle renders an h2, so the sign-up is reachable by heading in a footer.",
	],
}
