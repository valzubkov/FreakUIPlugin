# FreakUI dashboard system

Use the installed FreakUI public API as the source of truth. This map reflects the `0.5.0-beta` component families and helps choose a composition before inspecting exact signatures.

## Composition map

| Dashboard role | Prefer | Use for |
| --- | --- | --- |
| Screen frame | `FViewLayout` | Cross-platform root layout, title, and navigation role |
| Section hierarchy | `FSection` | Titled groups with optional supporting context |
| Custom surface | `FContainer` | Bespoke content that still uses FreakUI surface behavior |
| Primary metrics | `FDashboardCell` | High-salience value, label, delta, and caption combinations |
| Secondary metrics | `FDataCell`, `FDataLabel` | Compact values and supporting facts |
| Goal state | `FProgress`, `FGoalProgress`, `FProportionBar` | Completion, targets, and part-to-whole progress |
| Trend | Swift Charts with `.fCartesianChart(...)` | Time series and comparable categories |
| Distribution | `FPieChart` | Part-to-whole data when sectors remain legible |
| Breakdown and activity | `FDataRow`, `FTransactionRow`, `FList` | Ranked items, history, and recent activity |
| Empty or blocked state | `FEmptyView`, `FCallout` | Honest missing-data and action guidance |

## Composition sequence

1. Lead with the question the dashboard answers.
2. Put the most important current value or state first.
3. Add the comparison or target that gives the value meaning.
4. Add one trend or distribution only when the data supports it.
5. End with detail, activity, or the next useful action.

## Adaptation

- Keep the information order stable across iPhone, iPad, and Mac.
- Change columns, spans, density, and navigation presentation for available width rather than creating unrelated screens.
- Use `FComponentSize` for visual hierarchy and sizing modes for parent-space behavior.
- Use semantic spacing and radius tokens; fixed geometry is for deliberate chart or platform constraints only.

## Data integrity

- Never invent totals, deltas, categories, chart series, or time ranges.
- Keep aggregation and formatting in the project's model or presentation layer.
- Provide loading, empty, error, and stale-data behavior when those states exist in the product.
