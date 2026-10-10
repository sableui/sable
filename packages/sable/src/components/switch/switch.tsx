import { Switch as Base } from "@base-ui/react/switch"
import type { ComponentProps } from "react"
import { cn } from "../../lib/cn"

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
}

/**
 * Switch — themed wrapper over Base UI's Switch (Root + Thumb). A binary on/off
 * control; the hidden native `<input>`, ARIA, and keyboard handling all come
 * from Base UI. State is read from `data-[checked]` on both Root and Thumb.
 *
 *   <Switch defaultChecked />
 *   <Switch checked={on} onCheckedChange={setOn} />
 *
 * Use it for immediate-effect toggles. For deferred/form-submit choices that
 * need a visible label and validation, reach for a checkbox instead.
 */
export function Switch({ className, ...props }: RootProps) {
	return (
		<Base.Root
			className={cn(
				"inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 motion-interactive",
				"bg-input data-[checked]:bg-primary",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<Base.Thumb className="block h-5 w-5 rounded-full bg-(--switch-thumb) shadow-sm motion-interactive ease-spring data-[checked]:translate-x-4 rtl:data-[checked]:-translate-x-4 data-[checked]:bg-primary-foreground" />
		</Base.Root>
	)
}
Switch.displayName = "Switch"
