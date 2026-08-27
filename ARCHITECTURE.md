# FreakUI Plugin Architecture

Status: contract-1 client package  
Contract authority: `../FreakUIGenerationContract.md`

## Purpose

This repository packages three provider-neutral FreakUI workflows for Codex and Claude Code. Both clients load the same skills and the same authenticated remote MCP server. Ecosystem-specific files contain distribution metadata only.

## Structure

```text
.agents/plugins/marketplace.json          Codex marketplace catalog
.claude-plugin/marketplace.json           Claude Code marketplace catalog
plugins/freakui/
├── .codex-plugin/plugin.json              Codex manifest
├── .claude-plugin/plugin.json             Claude Code manifest
├── .mcp.json                              Shared authenticated HTTP MCP
├── assets/                                 Shared FreakUI brand assets
└── skills/
    ├── create-app/                         One-prompt project generation workflow
    ├── build-dashboard/                    Existing-project dashboard workflow
    └── add-component/                      Existing-project component workflow
```

The plugin is self-contained because both ecosystems install or cache plugin contents independently. There is no second copy of the workflow to synchronize.

## Execution boundary

The public plugin owns conversational request intake, local project inspection, component and dashboard implementation, confirmation, local font inspection, destination safety, verified materialization, the optional local example-content pass, exact FreakUI Core resolution, local compilation, and truthful result reporting.

The hosted FreakUI Generation Service is used only by `create-app` and owns WorkOS authentication, entitlement enforcement, the versioned generation contract, private recipes, master foundations, and blueprint generation. `build-dashboard` and `add-component` work locally against the open-source FreakUI package. The public package never contains provider secrets, entitlement data, private templates, or generator logic.

The service receives normalized request metadata only. Repositories, broader workspaces, original prompt history, local font paths and bytes, generated source, build output, tokens, and credentials stay local.

## Release boundary

Version `0.1.12` targets `https://www.freakui.com/mcp` and accepts generation recipe `1.1.1`. It keeps the corrected dependency hub, required AppContext environment injection, `Views/<Name>View` source layout, warning-free typed-navigation foundation, product-level intake, independent density and corner language, quiet execution, and the local example-content pass. It also fails closed before filesystem work when the authenticated generation tool is unavailable, explicitly prohibiting substitution from local foundations or the dashboard and component workflows. Its shared dashboard guidance defines compact iPhone `FDashboardCell` scale so primary and supporting labels keep an intentional hierarchy. The create-app workflow recognizes Settings as a built-in surface and keeps it out of app-specific `topLevelScreens`, matching the generator's reserved-name validation.

Manifest versions for both ecosystems and the marketplace package version move together. Contract, recipe, and FreakUI Core compatibility remain explicit inside the shared skill and local verifier.

## Verification

- Codex manifest validation through the bundled Codex plugin validator.
- Claude manifest and marketplace validation through `claude plugin validate`.
- Skill validation through the bundled Agent Skills validator.
- Node syntax checks and focused tests for envelope integrity, path safety, staged writes, local asset checksums, project metadata, and exact package resolution.
- Final acceptance requires installing and exercising the same plugin in Codex first and Claude Code second, followed by Valentine's selected-platform Xcode compilation.
