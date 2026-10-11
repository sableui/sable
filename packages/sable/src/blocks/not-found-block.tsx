import { Button } from "../components/button"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { Region, Row, Stack } from "../layout"

// ---block-code---
const notFound = {
	code: "404",
	title: "This page isn't here",
	body: "It may have moved, or the link may be mistyped. Check the address, or head back to somewhere you know.",
	home: { label: "Go home", href: "/" },
	help: { label: "Search the docs", href: "/docs" },
}

export interface NotFoundBlockProps {
	className?: string
}

export function NotFoundBlock({ className }: NotFoundBlockProps) {
	return (
		<Region as="section" max="form" className={cn("w-full py-16 sm:py-24", className)}>
			<Stack gap={4} align="center" className="text-center">
				<p className="text-mono-md text-muted-foreground">{notFound.code}</p>
				<h1 className="text-balance text-heading-1">{notFound.title}</h1>
				<p className="text-pretty text-body-md text-muted-foreground">{notFound.body}</p>
				<Row gap={2} justify="center" wrap className="pt-2">
					<Button iconStart={<Icon name="home" />} render={<a href={notFound.home.href} />}>
						{notFound.home.label}
					</Button>
					<Button variant="outline" iconStart={<Icon name="search" />} render={<a href={notFound.help.href} />}>
						{notFound.help.label}
					</Button>
				</Row>
			</Stack>
		</Region>
	)
}
