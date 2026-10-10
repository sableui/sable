/**
 * The docs have no real login, only demos of one: the canvas's sign-in scene,
 * the Input and Form examples, the auth page shells. Password managers see an
 * email field next to a password field and offer to fill or save it. This marks
 * every field on the site as not-a-login, once, here, so no demo has to carry
 * vendor attributes in its source (or in the code it shows).
 */
const IGNORE: Record<string, string> = {
	"data-1p-ignore": "", // 1Password
	"data-lpignore": "true", // LastPass
	"data-bwignore": "", // Bitwarden
	"data-form-type": "other", // Dashlane
}

const FIELDS = "input, textarea"

function mark(root: ParentNode) {
	for (const field of root.querySelectorAll<HTMLElement>(FIELDS)) {
		if (field.hasAttribute("data-1p-ignore")) continue
		for (const [name, value] of Object.entries(IGNORE)) field.setAttribute(name, value)
	}
}

export function ignorePasswordManagers(root: HTMLElement = document.body) {
	mark(root)
	// Fields mount with routes, dialogs and lazy pages; catch each as it arrives.
	new MutationObserver((records) => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (!(node instanceof HTMLElement)) continue
				if (node.matches(FIELDS)) mark(node.parentElement ?? node)
				else mark(node)
			}
		}
	}).observe(root, { childList: true, subtree: true })
}
