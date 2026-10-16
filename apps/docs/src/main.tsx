import { CodeHighlightProvider, MotionProvider } from "@sableui/react"
import { Analytics } from "@vercel/analytics/react"
import { highlight } from "sugar-high"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./app.css"
import { RouteErrorBoundary } from "./components/RouteErrorBoundary"
import { CustomizerProvider } from "./customizer/CustomizerProvider"
import { ignorePasswordManagers } from "./lib/ignore-password-managers"
import { ThemeProvider } from "./theme"

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Missing #root element")

ignorePasswordManagers()

createRoot(rootEl).render(
	<StrictMode>
		<ThemeProvider>
			<CustomizerProvider>
				<MotionProvider>
					{/* One highlighter for every CodeBlock on the site. sugar-high is
					    ~1KB and escapes its input; its token colours are CSS
					    variables mapped to Sable tones in app.css, so code follows
					    the theme and the Customize panel. */}
					<CodeHighlightProvider highlight={(code) => <span dangerouslySetInnerHTML={{ __html: highlight(code) }} />}>
						{/* The last resort: a throw outside any route (the shell itself) shows a message, not a blank page. */}
						<RouteErrorBoundary>
							<App />
						</RouteErrorBoundary>
					</CodeHighlightProvider>
					{/* Vercel Web Analytics: page views, client-side route changes included. */}
					<Analytics />
				</MotionProvider>
			</CustomizerProvider>
		</ThemeProvider>
	</StrictMode>,
)
