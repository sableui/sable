import type { ComponentMeta } from "../../lib/meta"

export const skeletonMeta: ComponentMeta = {
	name: "Skeleton",
	summary:
		"Loading placeholder — a muted, shimmering block (rounded-md bg-muted motion-shimmer). Shape it with utility classes; rounded-full for circles.",
	status: "stable",
	keywords: [
		"skeleton",
		"loading",
		"placeholder",
		"pending",
	],
	usage: {
		description: "Use Skeleton to reserve space and hint at the shape of content while data is loading.",
		bestPractices: [
			{
				guidance: "do",
				description: "Match the approximate size and rhythm of the eventual content.",
			},
			{
				guidance: "do",
				description: "Use it for content regions where layout stability matters during loading.",
			},
			{
				guidance: "dont",
				description: "Do not leave Skeleton visible after an error or empty state; switch to EmptyState (tone='destructive' for an error).",
			},
			{
				guidance: "dont",
				description: "Do not use a skeleton whose shape differs from the content that replaces it. A mismatched placeholder causes a visible jump, which is worse than a brief spinner.",
			},
		],
	},
	related: {
		components: [
			"Spinner",
			"PageLoader",
		],
	},
	props: [
		{
			name: "...props",
			type: 'ComponentPropsWithRef<"div">',
			description:
				"All native div props plus className. Size and shape the placeholder with utilities (h-*, w-*, size-*, rounded-full).",
		},
	],
	tokensUsed: ["muted"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "A skeleton stands in for content that has not arrived; fading the placeholder in adds a wait before the wait.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Root",
			why: "Nothing here is interactive. A skeleton that reacted to the pointer would invite a click on a thing that cannot be clicked.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Root",
			why: "The skeleton has one state. Swapping it for real content is the parent's job, and the parent decides whether that swap is animated.",
		},
		{
			slot: "activity",
			recipe: "motion-shimmer",
			part: "Root",
			why: "The sweep is the entire point of the component: it is what separates 'still loading' from 'loaded, and empty'. A static grey block is indistinguishable from a broken layout, which is why users reload the page.",
		},
	],
	a11y: [
		"Purely presentational; the shimmer sweep is decorative, and it stops under reduced motion because motion-shimmer follows --motion-scale.",
		"Mark the loading region with aria-busy=\"true\" on a parent, and swap in real content (with the same layout) once loaded to avoid shift.",
	],
	examples: [
		{
			label: "Shapes",
			code: '<Skeleton className="h-4 w-40" /><Skeleton className="size-10 rounded-full" /><Skeleton className="h-40 w-full" />',
		},
		{
			label: "Post-card composition",
			code: '<div className="flex items-center gap-3"><Skeleton className="size-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div></div>',
		},
	],
}
