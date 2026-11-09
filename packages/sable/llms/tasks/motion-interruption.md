# Review motion interruption

The final state must reflect the latest user intent. Start a change, reverse it
before completion, repeat it and resize during it. Test while content is loading,
when a response arrives late, and when motion turns off during a transition.
Canceled work must not remove current content or report success.

Prefer one clear cause and response over unrelated effects starting together.
Overlap old and new visual labels when readable; expose only the current
accessible string. Keep the focused control mounted. Do not make animationend or
transitionend the sole path to a terminal state: zero duration, cancellation and
unmount can remove those events.

When reversing WAAPI, sample the displayed state before canceling. Detach obsolete
finish/cancel handlers before retargeting. Continue from that displayed state
instead of a fixed entrance pose. This preserves position, not necessarily
velocity; inspect the result at normal speed. Clear fill effects and handlers on
unmount.

Separate tracking, release and cancellation. Tracking follows input; release
chooses a bounded destination. A canceled pointer or lost capture must not commit
an action. Scope touch-action to the gesture surface and preserve compatible
browser scrolling and pinch zoom. Keep a visible keyboard/touch control for every
essential gesture action.

Retain fixtures for long/localized labels, empty/one/maximum collections, covered
card focusability, rapid day changes with different heights, stale loading
responses, and full/subtle/off motion in both color modes. Reuse Tabs, Collapsible,
Presence, CardStack and ToolCall by role. Hover cannot replace a control; a narrow
screenshot does not establish touch behavior.

References: [Emil Kowalski's choreography guidance](https://github.com/emilkowalski/skills/tree/main/skills/choreograph),
[gestures](https://github.com/emilkowalski/skills/tree/main/skills/gestures),
[MDN transitionend](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event).
Adapted as reference material; see [third-party notices](../../THIRD_PARTY_NOTICES.md).
