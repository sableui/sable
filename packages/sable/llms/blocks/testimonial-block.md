# TestimonialBlock

A customer story: one large blockquote with the person's avatar, name and role, beside three outcome figures separated by rules.

**Intent:** Reach for this for one strong, attributable quote backed by numbers. A wall of short quotes is a different section; a logo row is Marquee.

**Block:** Marketing · section

## Notes

- Copied from the BrandLandingPage page shell's customer story.
- The quote and the outcomes share one Card as a <figure>; the outcomes move under the quote below lg.
- Outcome values use display sizes because they are the proof; their labels say what each number counts.

## Accessibility

- <figure> + <blockquote> + <figcaption> tie the quote to the person who said it.
- The section is labelled "Customer story" so it is reachable as a landmark.

## Source

```tsx
import { Avatar, Card, CardContent, cn, Region, Separator, Stack } from "@sableui/react"

const story = {
	quote: "We used to chase approvals across four tools. Now every request has an owner, a deadline, and a record, and our auditors stopped asking for screenshots.",
	name: "Maya Okafor",
	initials: "MO",
	role: "Head of operations, Fielddesk",
}

const outcomes = [
	{ value: "3.2×", label: "faster approvals in the first quarter" },
	{ value: "68%", label: "fewer follow-ups on handoffs" },
	{ value: "1 day", label: "to prepare a quarterly audit" },
]

export interface TestimonialBlockProps {
	className?: string
}

export function TestimonialBlock({ className }: TestimonialBlockProps) {
	return (
		<Region as="section" aria-label="Customer story" max="wide" className={cn("w-full py-16", className)}>
			<Card render={<figure />}>
				<div className="grid lg:grid-cols-[1.5fr_1fr]">
					<CardContent className="flex flex-col justify-between gap-10 sm:p-10">
						<Stack gap={3}>
							<p className="text-overline text-muted-foreground">Customer story</p>
							<blockquote className="text-balance text-heading-3 sm:text-heading-2">“{story.quote}”</blockquote>
						</Stack>
						<figcaption className="flex items-center gap-3">
							<Avatar variant="art" size="lg" fallback={story.initials} alt={story.name} />
							<div>
								<p className="text-title-sm">{story.name}</p>
								<p className="text-body-sm text-muted-foreground">{story.role}</p>
							</div>
						</figcaption>
					</CardContent>
					<div className="border-border max-lg:border-t lg:border-s">
						<CardContent className="flex h-full flex-col justify-center gap-6 sm:p-10">
							{outcomes.map((outcome, index) => (
								<Stack key={outcome.label} gap={3}>
									{index > 0 && <Separator />}
									<div>
										<p className="text-heading-1 sm:text-display-lg">{outcome.value}</p>
										<p className="mt-1 text-body-sm text-muted-foreground">{outcome.label}</p>
									</div>
								</Stack>
							))}
						</CardContent>
					</div>
				</div>
			</Card>
		</Region>
	)
}
```
