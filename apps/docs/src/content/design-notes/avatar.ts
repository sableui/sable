import type { DesignNotes } from "."

export default {
	intro: "A small round picture for a person, team or account. Initials stand in when there's no photo.",
	do: [
		"Always give initials or a glyph, so a missing photo still says who.",
		"Keep one size within a group.",
		"Save the large size for profile headers.",
		"Stack a few people with AvatarGroup and let it fold the rest into a +N count. Set it to fit, and it shows as many as the space allows.",
		"Match the group's ring to its surface: set surface=\"card\" inside a card.",
	],
	dont: [
		"Use avatars as decoration with no name nearby.",
		"Put large avatars in a dense table.",
		"Fake the overflow with a \"+4\" Avatar. Screen readers hear it without context.",
	],
} satisfies DesignNotes
