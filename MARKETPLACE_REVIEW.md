# FreakUI Marketplace Review Package

Status: prepared for public distribution and directory review  
Plugin version: `0.1.10`  
Production MCP resource: `https://www.freakui.com/mcp`

## Product boundary

FreakUI is one provider-neutral plugin package for Codex and Claude Code. It
contains three shared skills and one authenticated remote MCP server. The
plugin never starts checkout, displays pricing, manages subscriptions, or
recommends a purchase. Account creation, generation access, billing, and
subscription management stay on `www.freakui.com`.

The public package contains no service secrets, entitlement records, private
generator recipes, master project foundations, user repositories, generated
source, local fonts, or build output.

## Reviewer setup

Provide one reviewer account with active FreakUI generation access. Deliver its
credentials only through the marketplace reviewer's approved private channel;
never store them in this repository or Linear.

Use a temporary empty destination for each successful app-generation case.
Dashboard and component cases use a disposable local SwiftUI project that
already resolves FreakUI Core `0.5.0-beta`.

## Five successful cases

1. **Create an iPhone app.** Request a two-screen iPhone app with a custom
   theme and example content. Confirm intake, one explicit confirmation,
   generation, materialization, and a concise completion result.
2. **Create an Apple multi-platform app.** Request one single-target project
   for iPhone, iPad, and macOS. Confirm platform-specific roots and the exact
   FreakUI Core dependency.
3. **Create with a local font.** Supply an eligible local font file during
   intake. Confirm that only the selected font is copied locally and no font
   bytes or local path are sent to the service.
4. **Build a dashboard.** Ask FreakUI to shape existing model data into an
   adaptive dashboard. Confirm a focused local change using FreakUI data and
   chart components.
5. **Add a component.** Ask FreakUI to replace one generic SwiftUI surface.
   Confirm a focused local change that preserves the surrounding architecture.

## Three unsuccessful cases

1. **Unsupported request.** Ask project generation to include a platform or
   deliverable outside the supported contract. Confirm that the plugin explains
   the supported boundary and does not call generation.
2. **Non-empty destination.** Select a destination that already contains
   files. Confirm that materialization stops without overwriting or merging.
3. **Invalid service contract.** Send an unsupported contract version during a
   controlled service review. Confirm a complete, actionable service error and
   no local blueprint materialization.

## Expected output hygiene

- Successful output is `Ready` plus the destination and verified platforms.
- Partial verification is reported as `Created, verification incomplete` with
  the local reason.
- Failure is reported as `Could not complete` with the actionable cause.
- Request IDs, checksums, contract versions, recipe versions, and file counts
  appear only when requested or required for retry, support, or diagnosis.
- An access denial remains neutral and directs the user to their FreakUI
  account. It does not display plans or initiate a purchase.

## Distribution gates

- [ ] Make `valzubkov/FreakUIPlugin` public.
- [ ] Install into a clean Codex environment from the GitHub marketplace.
- [ ] Install into a clean Claude Code environment from the same repository.
- [ ] Confirm authentication against `https://www.freakui.com/mcp`.
- [ ] Open the FreakUI owner listing in OpenAI and use the publisher workflow
  available to the account; record the exact route because OpenAI's public
  documentation currently describes the Plugin Directory but not a universal
  third-party submission form.
- [ ] Submit to Anthropic's `claude-community` marketplace through
  `https://platform.claude.com/plugins/submit`.
- [ ] Record submission IDs and reviewer communication on A-43.

Anthropic's official marketplace is curated separately and has no application
process. The community submission must not be described as an application to
`claude-plugins-official`.

Owner-led production acceptance is complete. Independent pilot testing was
waived, A-41 was canceled, and no directory submission should claim otherwise.
