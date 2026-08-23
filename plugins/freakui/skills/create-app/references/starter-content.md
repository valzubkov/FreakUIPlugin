# Local starter content

Use this pass to make the confirmed screens useful on first run. It is not a claim that product functionality, persistence, or a backend has been implemented.

## Implementation

1. Inspect the generated architecture and the exact installed FreakUI source or Swift interface before editing. Do not guess component APIs.
2. Preserve the generated app entry, `AppContext`, dependency injection, ViewModel factory, typed navigation, platform roots, theme, and confirmed screen order.
3. Add a small, clearly temporary in-memory sample-data service through the existing dependency boundary. Use app-specific example values and names such as `SampleDataService`; never imply that the values are live or persisted.
4. Give every confirmed screen enough example content to communicate its purpose. Prefer a clear hierarchy with one primary summary or focal area, supporting content, and an appropriate empty, progress, activity, chart, list, or control state. Do not turn the pass into full product development.
5. Use the custom FreakUI theme and installed FreakUI components where they materially improve the screen. For a dashboard-style screen, follow the sibling `build-dashboard` skill. For a focused control or content block, follow the sibling `add-component` skill.
6. Keep sample values deterministic and suitable for all selected platforms. Use neutral, obviously fictional values for health, finance, or other sensitive domains, and do not invent professional claims or advice.
7. Do not add network calls, local persistence, authentication, billing, analytics, notifications, production data models, or features outside the confirmed screens.

Generated source and the local example-content changes stay on the user's Mac. Never send them to the FreakUI service.
