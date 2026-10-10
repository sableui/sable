import { Button, Glass, Navbar, NavbarBackLink, Page, Tabbar, TabbarLink } from "konsta/react"
import type { ComponentProps } from "react"

/*
 * The iOS system chrome, and nothing else. Konsta draws what Sable has no
 * equivalent for: the screen, the navigation bar (large title, back), the tab
 * bar and its glass. Everything on a screen is a Sable component, and apps
 * import this set rather than Konsta (sable-lint: native-ui-import).
 */

/** A screen: the scrolling page under the navigation bar. Its content is Sable. */
export function IosPage(props: ComponentProps<typeof Page>) {
	return <Page {...props} />
}

/** The navigation bar's back control. */
export function IosBackLink({ component = "button", ...props }: ComponentProps<typeof NavbarBackLink>) {
	return <NavbarBackLink component={component} {...props} />
}

/** One tab bar destination. Pass a Sable `<Icon>` as `icon`. */
export function IosTab({ component = "button", active, ...props }: ComponentProps<typeof TabbarLink>) {
	return <TabbarLink component={component} active={active} aria-current={active ? "page" : undefined} {...props} />
}

/** Brand typography on native navigation, including its expanding large title. */
export function IosNavbar({ titleClassName = "", titleLargeFontSizeIos = "text-[34px]", ...props }: ComponentProps<typeof Navbar>) {
	return (
		<Navbar
			{...props}
			titleClassName={`ios-navigation-title ${titleClassName}`}
			titleLargeFontSizeIos={`ios-navigation-title ${titleLargeFontSizeIos}`}
		/>
	)
}

/** The tab bar: shared glass material and home-area fade; children are IosTabs. */
export function IosTabbar({ children, className = "", colors, ...props }: ComponentProps<typeof Tabbar>) {
	return (
		<Tabbar labels icons component="nav" {...props} className={`native-tabbar ${className}`} colors={{ bgIos: "native-tab-scrim", ...colors }}>
			<Glass className="native-tab-glass">{children}</Glass>
		</Tabbar>
	)
}

/** Keep icon actions square inside the native circular glass container. */
export function IosIconButton({ className = "", ...props }: ComponentProps<typeof Button>) {
	return <Button inline rounded clear {...props} className={`ios-icon-action ${className}`} />
}
