# FreakUI component map

Use this map for selection, then inspect the installed FreakUI version for exact signatures.

| Intent | Public components and utilities |
| --- | --- |
| Primary or secondary action | `FButton`, `FMenu` |
| Text and numeric input | `FInput`, `FTextEditor`, `FCounter`, `FSlider` |
| Choice and settings | `FPicker`, `FSelector`, `FToggle` |
| Compact content | `FBadge`, `FCategory`, `FDateTimeCaption`, `FIndicator`, `FStep`, `FTag`, `FTitle`, `FTitleGroup` |
| Metrics and records | `FDashboardCell`, `FDataCell`, `FDataLabel`, `FDataRow`, `FTable`, `FTransactionRow`, `FValueType` |
| Progress and distribution | `FProgress`, `FGoalProgress`, `FProportionBar`, `FPieChart` |
| Cartesian chart behavior | Swift Charts with `.fCartesianChart(...)` |
| Feedback | `FAlert`, `FCallout`, `FEmptyView`, `FToast` |
| Structure and surfaces | `FBottomOverlay`, `FContainer`, `FDisclosureGroup`, `FList`, `FSection` |
| Cross-platform navigation | `FNavigationBar`, `FViewLayout` |
| Consistent behavior | FreakUI typography, semantic colors, formatters, haptics, toolbar items, view utilities, size tokens, sizing modes, and `FSurfaceAppearance` |

## Selection rules

- Choose by semantic role, not by visual resemblance alone.
- Prefer a data-display component over a generic container for values and labels.
- Prefer a feedback component for empty, blocked, warning, and transient states.
- Use `FContainer` when the content is genuinely custom and needs a FreakUI-owned surface.
- Use the project's configured theme and semantic tokens before adding literal colors, spacing, radius, or typography.
- Preserve platform-native behavior when FreakUI intentionally delegates to SwiftUI.
