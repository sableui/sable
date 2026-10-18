import type { DesignNotes } from "."

export default {
	intro: "The outer frame of an app: banners, header, sidebar, content and bottom nav in one place.",
	do: [
		"Use one shell around the whole app.",
		"Put app-wide status messages in the banner area above the frame.",
		"Give every screen its own content width, loading and error states included.",
		"Use the inset frame for dense, multi-pane product apps, with the sidebar on its rail surface.",
	],
	dont: [
		"Put a shell inside a card or panel. It is page chrome.",
		"Mix up the desktop sidebar and the mobile header or tab bar.",
		"Give a page its own scroll box inside the inset frame. The panel already scrolls.",
		"Run a full-width header bar above the rail of an inset frame.",
	],
} satisfies DesignNotes
