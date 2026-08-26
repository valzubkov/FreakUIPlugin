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

### Dashboard cell scale

- On compact iPhone layouts, default a full-width primary `FDashboardCell` to `.medium` and grid or supporting cells to `.small`.
- Reserve `.large` for a deliberately oversized hero treatment after inspecting the rendered hierarchy. The size scales the external label, value, captions, gaps, surface padding, and radius together; it is not a value-only emphasis control.
- `labelUppercased: false` changes the label's case, not its scale. Use it only when title case better fits the interface, not as compensation for an oversized component.
- When the design genuinely needs a large value with a quieter label, compose that hierarchy explicitly with narrower FreakUI primitives or app-owned content instead of overriding FreakUI typography inside `FDashboardCell`.

## Data integrity

- Never invent totals, deltas, categories, chart series, or time ranges.
- Keep aggregation and formatting in the project's model or presentation layer.
- Provide loading, empty, error, and stale-data behavior when those states exist in the product.
