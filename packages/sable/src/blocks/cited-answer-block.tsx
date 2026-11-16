"use client"

import { AgentAvatar } from "../components/agent-avatar"
import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardList, CardListLabel, CardTitle } from "../components/card"
import { ContextCard, ContextCardContent, ContextCardTrigger } from "../components/context-card"
import { Entity } from "../components/entity"
import { cn } from "../lib/cn"

// ---block-code---
const question = "How long do refunds take?"

// `n` is the number the answer cites a source by.
const sources = [
	{ id: "policy", n: 1, title: "Refund policy", site: "help.atlas.example", url: "https://help.atlas.example/refunds", excerpt: "Approved refunds go back to the original payment method within 5 business days." },
	{ id: "cards", n: 2, title: "When will I see my refund?", site: "help.atlas.example", url: "https://help.atlas.example/refunds/cards", excerpt: "Card issuers can take up to 10 days to post a refund to a statement." },
	{ id: "store", n: 3, title: "Store credit and gift cards", site: "atlas.example", url: "https://atlas.example/store-credit", excerpt: "Refunds to store credit are instant and never expire." },
]

// The answer as runs of text, each ending in the sources it rests on. A run
// keeps its closing punctuation, so a citation follows the comma or the stop.
const answer = [
	{ text: "Approved refunds go back to the original payment method within five business days,", cites: ["policy"] },
	{ text: " though some card issuers take up to ten days to show them on a statement.", cites: ["cards"] },
	{ text: " If you chose store credit instead, it arrives at once.", cites: ["store"] },
]

const byId = Object.fromEntries(sources.map((source) => [source.id, source]))

export interface CitedAnswerBlockProps {
	className?: string
	/** false drops the card's surface and border — for an assistant panel that already frames it. */
	framed?: boolean
	/** Called with the source's id when a citation or a source is opened. */
	onOpen?: (sourceId: string) => void
}

export function CitedAnswerBlock({ className, framed = true, onOpen }: CitedAnswerBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-md", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>{question}</CardTitle>
				<CardDescription>
					Answered from {sources.length === 1 ? "1 source" : `${sources.length} sources`}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex gap-3">
				<AgentAvatar size="sm" />
				{/* Each claim carries its citation where it is made, not in a list at
				    the end: the reader checks the sentence they doubt. A citation is a
				    link to its source, and hovering or focusing it previews the passage. */}
				<p className="min-w-0 flex-1 text-body-md">
					{answer.map((run) => (
						<span key={run.text}>
							{run.text}
							{run.cites.map((id) => {
								const source = byId[id]
								return (
									<ContextCard key={id}>
										{/* A no-break space, so a citation never starts a line apart from its claim. */}
										{" "}
										<ContextCardTrigger
											render={
												// The number is the chip the source wears in the list
												// below, so the eye matches the two without reading.
												<a
													href={source.url}
													aria-label={`Source ${source.n}: ${source.title}`}
													onClick={() => onOpen?.(source.id)}
													className="inline-flex rounded-full align-[0.1em] outline-none motion-interactive focus-visible:ring-2 focus-visible:ring-ring"
												/>
											}
										>
											<Badge size="sm" className="tabular-nums">
												{source.n}
											</Badge>
										</ContextCardTrigger>
										<ContextCardContent>
											<p className="text-label-md">{source.title}</p>
											<p className="text-caption text-muted-foreground">{source.site}</p>
											<p className="mt-2 text-body-sm">{source.excerpt}</p>
										</ContextCardContent>
									</ContextCard>
								)
							})}
						</span>
					))}
				</p>
			</CardContent>
			{/* The same sources as a list, numbered as the answer cites them. */}
			<CardList divided={false}>
				<CardListLabel render={<h3 />}>Sources</CardListLabel>
				{sources.map((source) => (
					<Entity
						key={source.id}
						interactive
						render={<a href={source.url} />}
						onSelect={() => onOpen?.(source.id)}
						leading={<Avatar shape="square" size="sm" fallback={String(source.n)} alt="" aria-hidden />}
						title={source.title}
						subtitle={source.site}
					/>
				))}
			</CardList>
		</Card>
	)
}
