import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { MediaImage } from "../components/media-image"
import { AspectBox } from "../layout/AspectBox"
import { cn } from "../lib/cn"

// ---block-code---
// `image` is the product shot URL; left empty, it paints art seeded by the title.
const product = { title: "Linen throw blanket", maker: "Northfield Home", image: "", badge: "New", price: "$64.00" }


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
			<AspectBox ratio={4 / 3}>
				<MediaImage src={product.image} seed={product.title} />
			</AspectBox>
			<CardHeader>
				<CardTitle>{product.title}</CardTitle>
				<CardDescription>{product.maker}</CardDescription>
				<CardAction>
					<Badge tone="1">{product.badge}</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="justify-between pt-4">
				<span className="text-mono-lg">{product.price}</span>
				<Button onClick={onCollect}>Add to cart</Button>
			</CardFooter>
		</Card>
	)
}
