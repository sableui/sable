"use client"

import { useEffect, useState } from "react"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Field } from "../components/form"
import { NumberTicker } from "../components/number-ticker"
import { Switch } from "../components/switch"
import { TextSwap } from "../components/text-swap"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
const invoice = {
	number: "Invoice 1042",
	customer: "Mara Okafor · Brand direction",
	lines: [
		{ label: "Design review", amount: 480 },
		{ label: "Project assets", amount: 120 },
	],
	discount: 0.1,
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

type SendState = "draft" | "sending" | "sent"

const action: Record<SendState, string> = { draft: "Send invoice", sending: "Sending…", sent: "Sent" }

export interface InvoicePreviewBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
	/** Called when the invoice is sent. Here the send is a one-second stand-in. */
	onSend?: (amount: number) => void
}

export function InvoicePreviewBlock({ className, framed = true, onSend }: InvoicePreviewBlockProps) {
	const [discounted, setDiscounted] = useState(false)
	const [state, setState] = useState<SendState>("draft")
	const subtotal = invoice.lines.reduce((total, line) => total + line.amount, 0)
	const deduction = discounted ? subtotal * invoice.discount : 0
	const amount = subtotal - deduction
	// One label, swapped in place in every state, and announced as it changes.
	const label = <TextSwap text={action[state]} aria-live="polite" />
	useEffect(() => {
		if (state !== "sending") return
		const timer = setTimeout(() => setState("sent"), 1000)
		return () => clearTimeout(timer)
	}, [state])
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>{invoice.number}</CardTitle>
				<CardDescription>{invoice.customer}</CardDescription>
				<CardAction>
					<Badge tone={state === "sent" ? "success" : "neutral"} size="sm">
						{state === "sent" ? "Sent" : "Draft"}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-5">
				<div className="flex flex-col gap-1">
					<span className="text-body-sm text-muted-foreground">Amount due</span>
					<NumberTicker value={amount} format={{ style: "currency", currency: "USD" }} className="text-heading-2" />
				</div>
				<dl className="flex flex-col gap-2 text-body-sm">
					{invoice.lines.map((line) => (
						<div key={line.label} className="flex justify-between gap-3">
							<dt>{line.label}</dt>
							<dd>{money.format(line.amount)}</dd>
						</div>
					))}
				</dl>
				<Field
					label="10% discount"
					orientation="horizontal"
					disabled={state === "sending"}
					trailing={discounted ? <span className="text-body-sm text-muted-foreground">−{money.format(deduction)}</span> : undefined}
				>
					<Switch
						checked={discounted}
						onCheckedChange={(on: boolean) => {
							setDiscounted(on)
							setState("draft")
						}}
					/>
				</Field>
				<Button
					className="w-full"
					aria-label={action[state]}
					loading={state === "sending"}
					loadingLabel={label}
					iconStart={state === "sent" ? <Icon name="check" /> : undefined}
					onClick={() => {
						if (state === "sending") return
						setState("sending")
						onSend?.(amount)
					}}
				>
					{label}
				</Button>
			</CardContent>
		</Card>
	)
}
