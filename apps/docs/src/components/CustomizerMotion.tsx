import { MotionProvider, type MotionPolicy } from "@sableui/react"
import { useState, type ReactNode } from "react"
import { useCustomizer } from "../customizer/CustomizerProvider"

/** Keep JS motion in the same policy as the customizer's CSS speed setting. */
export function CustomizerMotion({ children }: { children: ReactNode }) {
	const { look } = useCustomizer()
	const [policy, setPolicy] = useState<MotionPolicy>("system")
	return <MotionProvider policy={look.motion === "off" || look.motionBase === 0 ? "off" : policy} onPolicyChange={setPolicy}>{children}</MotionProvider>
}
