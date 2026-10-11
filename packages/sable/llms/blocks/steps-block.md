# StepsBlock

A how-it-works section: the heading, lede and a guide link on the left; three numbered steps on the right, each under a strong rule.

**Intent:** Reach for this when the pitch is a sequence — onboarding, a workflow, a setup. Parallel benefits with no order are FeatureGridBlock; progress through a live process is a Stepper.

**Block:** Marketing · section

## Notes

- Copied from the BrandLandingPage page shell's how-it-works section.
- The steps are an <ol>, so the order is semantic and the 01 / 02 / 03 numbers are its visual echo, set in the mono tier.
- Three steps fit the 1 : 2 split on desktop; on a phone everything stacks with the intro first.

## Accessibility

- Each step has an h3 under the section's h2.
- The guide link is an <a> styled as an outline Button, because it navigates.

## Source

```tsx
import { useId } from "react"
import { Button, cn, Icon, Region, Stack } from "@sableui/react"

const intro = {
	eyebrow: "How it works",
	title: "From request to sealed record.",
	lede: "Teams are usually live within a week. Cove adapts to the routes you already run instead of asking you to start over.",
	link: { label: "Read the rollout guide", href: "/guides/rollout" },
}

const steps = [
	{ title: "Connect your spaces", body: "Bring teams, vendors, and record stores into one workspace, with roles that mirror how you already work." },
	{ title: "Route every approval", body: "Requests follow the path you define, with reviewers, deadlines, and escalation built in from the start." },
	{ title: "Seal the record", body: "Approved work is archived with its full context and is ready for review the moment it closes." },
]

export interface StepsBlockProps {
	className?: string
}

export function StepsBlock({ className }: StepsBlockProps) {
	const titleId = useId()
	return (
		<Region as="section" aria-labelledby={titleId} max="wide" className={cn("w-full py-16 sm:py-24", className)}>
			<div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
				<Stack gap={2} className="max-w-md">
					<p className="text-overline text-muted-foreground">{intro.eyebrow}</p>
					<h2 id={titleId} className="text-balance text-heading-1">
						{intro.title}
					</h2>
					<p className="text-body-md text-muted-foreground">{intro.lede}</p>
					<div className="pt-3">
						<Button variant="outline" iconEnd={<Icon name="arrow-right" />} render={<a href={intro.link.href} />}>
							{intro.link.label}
						</Button>
					</div>
				</Stack>
				<ol className="grid gap-10 sm:grid-cols-3 sm:gap-6">
					{steps.map((step, index) => (
						<li key={step.title} className="flex flex-col gap-2 border-t border-border-strong pt-6">
							<span className="text-mono-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
							<h3 className="mt-3 text-title-lg sm:mt-6">{step.title}</h3>
							<p className="text-body-sm text-muted-foreground">{step.body}</p>
						</li>
					))}
				</ol>
			</div>
		</Region>
	)
}
```
