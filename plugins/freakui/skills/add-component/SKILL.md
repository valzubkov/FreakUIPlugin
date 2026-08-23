---
name: add-component
description: Add or replace a focused SwiftUI control, content block, row, chart, feedback state, layout, or navigation surface with FreakUI. Use in an existing FreakUI project; use build-dashboard for a whole dashboard and create-app for a new project.
---

# Add a FreakUI component

Make one focused interface improvement with the current FreakUI public API. This skill works locally and does not call the FreakUI generation service.

Read [component-map.md](references/component-map.md) to choose the component family, then inspect the exact API in the project's installed FreakUI version before editing.

## Workflow

1. Read the active workspace instructions and inspect the target view, its state and actions, the current theme, supported platforms, and the project's FreakUI dependency version.
2. Confirm the intended behavior and visual role when they are not already clear. Preserve existing product logic; a component replacement must not silently change validation, persistence, navigation, or destructive-action behavior.
3. Choose the narrowest FreakUI component or utility that satisfies the intent. Prefer composition of existing public types over a new wrapper that duplicates FreakUI behavior.
4. Inspect the installed source, Swift interface, or Xcode Quick Help for the exact initializer and supporting types. Do not guess an API from a component name or from another FreakUI version.
5. Implement with the project's existing data flow and use FreakUI theme tokens, component sizes, sizing modes, surface appearances, interactions, and formatters where they fit.
6. Check all supported platforms affected by the edit. Preserve accessibility labels, Dynamic Type, focus, keyboard input, loading, empty, error, and disabled states that apply to the component.
7. Run only verification authorized by the active workspace and report skipped build checks truthfully.

## Boundaries

- Do not add unrelated screens, models, services, or dependencies.
- Do not restyle the entire app when the user asked for one component.
- Do not replace a native SwiftUI primitive when FreakUI does not provide a better semantic fit.
- Do not copy product-specific implementation from another app; use public FreakUI contracts and the target project's own models.

## Handoff

Report the component selected, the user-visible improvement, exact files changed, and verification performed. Keep internal API exploration and command output out of the final response unless it explains a blocker.
