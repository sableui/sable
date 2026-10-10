import { CodeHighlightProvider, MotionProvider } from "@sableui/react"
import { highlight } from "sugar-high"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./app.css"
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
						<App />
					</CodeHighlightProvider>
				</MotionProvider>
			</CustomizerProvider>
		</ThemeProvider>
	</StrictMode>,
)
