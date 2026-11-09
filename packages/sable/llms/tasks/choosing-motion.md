# Choose motion for the interaction

Start with the user's action and the change they must understand. Search by that
need, then read the component's motion declarations and examples. The installed
version is authoritative. A CSS recipe does not supply focus, state or lifecycle.

| Need | Current Sable API |
| --- | --- |
| A formatted quantity changes | NumberTicker; plain text for updates too frequent to settle |
| A short label changes | TextSwap; StreamingText for appended prose |
| Content changes intrinsic size | useAutoSize with motion-size; Collapsible for disclosure |
| Pending work becomes an outcome | Button loading, InlineStatus, or ToolCall according to context |
| Loading content arrives | Skeleton and Presence; preserve focus and useful content |
| A selection travels | Tabs or GlidingHighlight |
| A person deliberately celebrates | LikeButton or Burst, at full motion |
| A small collection opens | CardStack, with its visible expansion control |

Name the purpose: response, orientation, continuity, or activity. Repetition matters:
an effect that helps once can obstruct a task repeated hundreds of times. Do not
animate every row on mount, fabricate progress, or delay access until animation
ends. Preserve deliberate immediate changes.

Choose duration for distance, surface size, input and frequency. Use the existing
tokens and --motion-scale rather than importing another site's numeric scale.
Feedback should remain connected to input. A large surface may need more time to
settle than a glyph. The faster pop/slide exit is a recipe decision, not a rule for
every transition: consider the content it reveals.

Deceleration suits an entrance settling in place; standard easing suits a small
state change; emphasized easing suits substantial travel. Keep overshoot bounded
by the object's size. A cubic-bezier overshoot is not a velocity-preserving spring.
CSS transitions can retarget ordinary changes. Keyframes suit bounded effects
that can restart. Presence uses WAAPI for removal. Pointer tracking follows the
latest input without entrance easing. Velocity springs, inertia and shared layout
belong in an optional adapter, not a new core dependency for a label replacement.

Full inherits the surrounding policy. Subtle retains essential responses and drops
expressive changes. Off and reduced motion retain every state and action without
movement. Components and MotionScope only turn motion down. JS uses useMotionLevel:
enabled for essential work, expressive for flourishes. CSS uses --motion-expressive
as well as --motion-scale.

Test normal speed, rapid reversal, repetition and full/subtle/off settings. Read
[motion interruption](./motion-interruption.md) and
[motion performance](./motion-performance.md) before claiming continuity or speed.

Reference: [Emil Kowalski's animation guidance](https://github.com/emilkowalski/skills/tree/main/skills/animate),
reviewed as MIT-licensed material, never installed or invoked. See
[third-party notices](../../THIRD_PARTY_NOTICES.md).
