import { Banner, Button } from "@sableui/react"
import { useCustomizerActions } from "./CustomizerProvider"

/**
 * Shown after a share link replaced the reader's own look or preset: the
 * shared design is on screen, and theirs is one click away. Keeping the shared
 * one (dismiss) forgets the old one. Until they choose, it survives a reload.
 */
export function SharedLookNotice({ className }: { className?: string }) {
	const { sharedLook } = useCustomizerActions()
	if (!sharedLook) return null
	return (
		<Banner
			tone="info"
			live="polite"
			className={className}
			dismissible
			dismissLabel="Keep the shared look"
			onDismiss={sharedLook.keep}
			action={
				<Button size="sm" variant="secondary" onClick={sharedLook.restore}>
					Restore mine
				</Button>
			}
		>
			You're viewing a shared look. Your own look is saved.
		</Banner>
	)
}
