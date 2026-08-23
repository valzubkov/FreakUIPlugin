---
name: build-dashboard
description: Design and implement a distinctive, adaptive SwiftUI dashboard with FreakUI charts and data-display components. Use for overview, metrics, progress, balance, nutrition, finance, or workout dashboards in an existing FreakUI project.
---

# Build a FreakUI dashboard

Turn real product data and actions into one clear dashboard hierarchy. This skill works locally in an existing project and does not call the FreakUI generation service.

Read [dashboard-system.md](references/dashboard-system.md) before proposing or implementing the dashboard.

## Workflow

1. Read the active workspace instructions, then inspect the project's architecture, current dashboard or destination screen, data model, state flow, navigation, theme, supported platforms, and installed FreakUI version.
2. Determine whether the user wants a layout proposal or implementation. For a proposal, provide the hierarchy and component choices without editing. For implementation, preserve the project's existing architecture and authorization boundaries.
3. Identify the smallest useful information hierarchy: summary, progress, trend, breakdown, recent activity, and primary action. Include only sections supported by real data or explicitly requested placeholders.
4. Map each section to the narrowest FreakUI component in the reference. Inspect the exact public API in the installed FreakUI source or Xcode interface before coding; do not guess initializers or copy product-specific code from another app.
5. Build one semantic dashboard that adapts across the project's supported platforms. Prefer shared data and section composition with deliberate layout adaptation over duplicated product logic.
6. Keep formatting, aggregation, loading, empty, and error behavior explicit. Preserve accessibility labels, Dynamic Type, keyboard behavior, and the project's existing interaction model.
7. Run only verification authorized by the active workspace. Never claim a platform build succeeded when it was skipped or failed.

## Quality bar

- Establish one dominant summary before secondary metrics.
- Use charts only when they reveal a comparison, distribution, progress, or trend more clearly than text.
- Use FreakUI theme colors, typography, spacing, radius, component sizes, and surface appearances instead of recreating a parallel design system.
- Avoid a uniform card grid. Vary hierarchy through component role, size, span, and composition while keeping a coherent rhythm.
- Keep business rules and data mutations outside presentation views.

## Handoff

Report the dashboard structure, exact files changed, supported platform behavior, and verification performed. Keep technical output concise and name one concrete remaining action when verification is incomplete.
