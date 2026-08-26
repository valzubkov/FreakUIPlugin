# FreakUI plugin for Codex and Claude Code

Build a single-target, multi-platform native Swift application for iPhone, iPad, and macOS from one prompt. FreakUI establishes a robust clean architecture foundation with dependency injection, programmatic navigation, MVVM, and platform-specific root views. Its custom theme initialization, precision-focused components, utilities, and extensions give the interface a distinct and consistent identity. Beyond project creation, dedicated FreakUI skills help shape interface sections, add components, and evolve the interface as the app grows.

This repository contains three shared skills with separate Codex and Claude Code manifests. It does not contain the private generator, project foundations, service secrets, or account-access logic.

## What it does

- **Create a FreakUI app** — turn one confirmed brief into a single-target project for iPhone, iPad, macOS, or all three, with MVVM, dependency injection, typed navigation, platform-specific root views, a custom theme, and local example content already in place.
- **Build a FreakUI dashboard** — compose metrics, progress, charts, breakdowns, and activity into one adaptive product screen.
- **Add a FreakUI component** — replace generic SwiftUI with a focused FreakUI control, row, chart, feedback state, layout, or navigation surface.

App generation requires a FreakUI account with generation access. Dashboard and component work run locally against the open-source FreakUI package. The plugin may explain that generation is unavailable, but it never shows plans, starts checkout, manages a subscription, or recommends a purchase.

## Local installation

Version `0.1.10` connects to the production MCP resource at `https://www.freakui.com/mcp`.

For Codex, run:

```bash
codex plugin marketplace add /absolute/path/to/freakui-plugins
codex plugin add freakui@freak-company
```

Start a new Codex task after installation so the skill and MCP server are loaded.

For Claude Code, install the same checkout at local scope:

```bash
claude plugin marketplace add --scope local /absolute/path/to/freakui-plugins
claude plugin install --scope local freakui@freak-company
```

Then start Claude Code from the directory that contains this checkout and run:

```text
/reload-plugins
```

Claude Code exposes `/freakui:create-app`, `/freakui:build-dashboard`, and `/freakui:add-component`. Natural requests activate the same shared skills in either client.

## Output

The normal result is deliberately short:

- **Ready** when the project was created and every selected platform was verified.
- **Created — verification incomplete** when the project exists but the local environment stopped verification.
- **Could not complete** when generation, materialization, or verification failed.

Technical IDs, checksums, contract versions, and file counts are omitted unless they are requested or needed for retry, support, or diagnosis.

## Development checks

```bash
npm run check
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/freakui/skills/create-app
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/freakui/skills/build-dashboard
python3 /path/to/skill-creator/scripts/quick_validate.py plugins/freakui/skills/add-component
python3 /path/to/plugin-creator/scripts/validate_plugin.py plugins/freakui
claude plugin validate . --strict
```

Xcode package resolution and compilation are acceptance tests, not repository development checks. They run against a generated project after the user confirms generation.

## Boundaries

- The generator creates a new project only; it never merges into an existing project.
- Dashboard and component skills make focused local changes only when the user asks for implementation.
- Supports generation contract 1 and exact FreakUI Core `0.5.0-beta`.
- Keeps repositories, local fonts, generated source, and build output on the user's Mac.
- Requires sign-in with generation access only for the `create-app` workflow.
- Does not launch, sign, archive, deploy, publish, or configure App Store delivery.

See `ARCHITECTURE.md` for the public/private execution boundary.
