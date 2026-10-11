# NotFoundBlock

A not-found page body: the status code in mono, a plain-language h1, what probably happened, and two ways on — home and search.

**Intent:** Reach for this as the body of a 404 route. An empty list or a search with no results inside a working page is EmptyState, not this.

**Block:** System · section

## Notes

- The heading says what happened in words; the code is a small mono label for people who look for it.
- Two ways on, one primary. Never a dead end with only the browser's back button.
- Capped at the `form` region width, so the short message stays a tight, centred column.

## Accessibility

- It renders the page's h1 — use it as the route's main content, inside <main>.
- Both actions are links styled as Buttons, because they navigate.

## Source

```tsx
import { Button, cn, Icon, Region, Row, Stack } from "@sableui/react"

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
```
