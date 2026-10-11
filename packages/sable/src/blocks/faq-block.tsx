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
	{ q: "Is there a free plan?", a: "Yes. Starter is free forever for three live editions, with no fees on your first $1,000 in sales." },
	{ q: "Can I change plans later?", a: "Any time. Upgrades apply immediately and are prorated; downgrades take effect at the end of the billing period." },
	{ q: "Who owns the work I sell?", a: "You do. Collectors own the editions they buy, and you keep the rights to the work itself." },
	{ q: "How do payouts work?", a: "Sales clear after seven days and are paid out every Friday to the account you connect in settings." },
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
