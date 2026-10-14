import { useId } from "react"
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "../components/accordion"
import { cn } from "../lib/cn"
import { Region, Stack } from "../layout"

// ---block-code---
const intro = {
	title: "Questions, answered",
	lede: "Can't find what you need?",
	contact: { label: "Write to us", href: "/contact" },
}

const questions = [
	{ q: "Is there a free plan?", a: "Yes. Starter is free forever for three active projects, with no card needed to sign up." },
	{ q: "Can I change plans later?", a: "Any time. Upgrades apply immediately and are prorated; downgrades take effect at the end of the billing period." },
	{ q: "Who owns the data I add?", a: "You do. You can export everything in your workspace at any time, and we never sell it." },
	{ q: "How does billing work?", a: "Plans are billed per seat at the start of each period, to the card or account you add in settings." },
]

export interface FaqBlockProps {
	className?: string
}

export function FaqBlock({ className }: FaqBlockProps) {
	const titleId = useId()
	return (
		<Region as="section" aria-labelledby={titleId} max="content" className={cn("w-full py-16", className)}>
			<div className="grid gap-10 md:grid-cols-[1fr_2fr]">
				<Stack gap={2}>
					<h2 id={titleId} className="text-balance text-heading-2">
						{intro.title}
					</h2>
					<p className="text-body-md text-muted-foreground">
						{intro.lede}{" "}
						<a href={intro.contact.href} className="text-foreground underline underline-offset-4 motion-interactive hover:text-muted-foreground">
							{intro.contact.label}
						</a>
						.
					</p>
				</Stack>
				<Accordion>
					{questions.map((item) => (
						<AccordionItem key={item.q} value={item.q}>
							<AccordionTrigger>{item.q}</AccordionTrigger>
							<AccordionPanel>{item.a}</AccordionPanel>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</Region>
	)
}
