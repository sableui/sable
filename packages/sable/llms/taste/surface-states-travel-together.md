# Surface states travel together

A recorded build defect placed an outline button on a dark band and
overrode its resting foreground. The inherited hover foreground still belonged to
a light surface. The button was legible in screenshots and lost its label on hover.

Prefer a coherent semantic surface scope. If an override is required, inspect
the component's full variant contract and verify fill, text, border, hover,
focus-visible, disabled, and selected states as appropriate. Use a matching
foreground token with each surface token. Do not assume one resting override
replaces every state-specific class.

Check the rendered control with pointer and keyboard, in each supported color
mode. Moving a control onto media also requires checking the least legible part
of the image, including after crop changes. A local state test is stronger evidence
than a claim that the palette has passed a token contrast test elsewhere.

Provenance: a dark-band button hover failure documented in the Sable reference
build workflow. This packaged distillation preserves the failure mechanism without
requiring access to private reference artifacts.
