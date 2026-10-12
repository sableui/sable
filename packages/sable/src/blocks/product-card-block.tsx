import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { GradientArt } from "../components/gradient-art"
import { cn } from "../lib/cn"

// ---block-code---
const product = { title: "Untitled (gold rush)", maker: "Mara Okafor", edition: "12 of 50", price: "0.42 SOL" }


export interface ProductCardBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** The buy action. */
	onCollect?: () => void
}

export function ProductCardBlock({ className, framed = true, onCollect }: ProductCardBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			{/* Placeholder art painted from the theme, so it follows every look. Replace with the product image. */}
			<GradientArt aria-hidden seed={product.title} className="aspect-[4/3]" />
			<CardHeader>
				<CardTitle>{product.title}</CardTitle>
				<CardDescription>{product.maker}</CardDescription>
				<CardAction>
					<Badge tone="edition">{product.edition}</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="justify-between pt-4">
				<span className="text-mono-lg">{product.price}</span>
				<Button onClick={onCollect}>Collect</Button>
			</CardFooter>
		</Card>
	)
}
