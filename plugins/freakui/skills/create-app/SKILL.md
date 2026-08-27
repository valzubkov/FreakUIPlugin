---
name: create-app
description: Create a clean, single-target native app for iPhone, iPad, Mac, or all three with FreakUI. Use for a new FreakUI project; do not use to modify an existing project or continue general app development.
---

# Create a FreakUI app

Create one new Xcode project and leave it useful on its first run. FreakUI returns a verified foundation blueprint. Destination inspection, font-file handling, source writing, optional example content, package resolution, and compilation stay on the user's Mac.

Use plain product language with the user: say **app**, **project**, **generation access**, and **verification**. Reserve **contract**, **blueprint envelope**, **recipe**, and schema field names for tool calls and diagnostics.

Read [contract-1.md](references/contract-1.md) before gathering the request. Read [fonts.md](references/fonts.md) only when the user supplies font files. Read [local-validation.md](references/local-validation.md) before writing or validating the returned blueprint.

## Required generation boundary

`FreakUI.create_app_blueprint` is the only authorized source of a new FreakUI project foundation. Before intake, destination inspection, or any filesystem change, confirm that this tool is exposed in the current task. If it is unavailable, stop without creating or modifying files and report: **Could not complete: the FreakUI generation connection is unavailable in this task. Reconnect FreakUI and start a new task.**

Never synthesize or copy a replacement foundation from a local FreakUI checkout, another app, a cached blueprint, examples, templates, or prior generated source. Never substitute the `build-dashboard` or `add-component` workflow for `create-app`. Tool unavailability is a blocking failure, not permission to approximate generation locally.

## Conversation

- Start with the product, not a configuration inventory. Ask what the app does, which Apple devices it should support, its main sections, and how it should feel. If the user asks what choices are available, say: “Tell me what the app does, which Apple devices it should support, and its main sections. If you have a visual preference, describe the mood, how compact or spacious it should feel, and whether corners should be sharp or rounded. I can propose sensible defaults for everything else.”
- Describe interface density naturally as compact, balanced, or spacious. Describe corners naturally as sharp, subtly rounded, or soft and rounded. Keep density, corner character, and overall mood as independent choices.
- Infer safe defaults when the user has no preference. Use Apple System for text, Apple System Monospaced for numbers, and include realistic example content so the first run is not a collection of empty screens.
- Do not ask about third-party notices unless the user supplies or requests external fonts, assets, or licensed material. Use no notices otherwise.
- Gather missing information in one grouped question when practical. Translate the answer into the supported request and propose close supported screen icons without exposing the symbol catalog.
- Show one concise confirmation with the app name, bundle identifier, devices, ordered sections, appearance, accent color, example-content choice, and destination. Show fonts only when they are custom and notices only when they exist. Confirmation authorizes creating the project, adding the agreed example content locally, resolving packages, and compiling the selected platform families. Do not generate until the user confirms.
- If the user changes a choice, acknowledge the change and confirm the revised brief without restarting the intake or presenting the full technical schema.

A normal confirmation uses short product labels and includes `Example content: Included`. Do not repeat internal defaults or compatibility versions.

## Workflow

1. Enforce the required generation boundary above. If `FreakUI.create_app_blueprint` is not exposed, stop before intake or filesystem access.
2. Resolve an absolute destination. It must be absent or an empty directory. Reject an existing nonempty path; do not offer to merge, overwrite, empty, or delete it.
3. Complete the product-level intake and receive one explicit confirmation as described above. Example content is included unless the user opts out.
4. Create an opaque, non-personal retry key for the schema's `requestId`, such as `freakui-<UUID>`. Keep it within 128 characters and use only letters, numbers, periods, underscores, colons, or hyphens. Do not include a name, email address, destination, or timestamp. Reuse it only when retrying the identical normalized request.
5. Call `FreakUI.create_app_blueprint` once with `{ requestId, request }`. The MCP connection handles sign-in and generation access. Never send the destination, example-content choice, repository, wider workspace, original prompt history, local font paths, font bytes, tokens, or credentials.
6. On success, materialize the returned `structuredContent` with the bundled local helper as described in [local-validation.md](references/local-validation.md). Do not treat the text summary as the blueprint.
7. Verify the generated foundation and exact Core requirement, then resolve package dependencies.
8. When example content is included, read [starter-content.md](references/starter-content.md) and perform the local starter-content pass. This is a local edit to the generated project, not a second generation request.
9. Re-run structural verification after local edits and compile every selected platform family. Compilation is covered by the confirmation; follow any stricter authority rules in the active workspace.
10. Report exactly one result state: **Ready**, **Created — verification incomplete**, or **Could not complete**. State the destination, what was verified or where work stopped, and one next action when needed.

## User-facing output

- Use only four conversational checkpoints: the confirmation, a sign-in instruction when authentication appears, a genuine blocker that needs attention, and the final result. If long local work needs an update, describe only the user-relevant outcome being verified.
- When sign-in starts, say: “A FreakUI sign-in window is opening. Complete sign-in there and I’ll continue automatically.” Do not narrate connection discovery or authentication internals.
- Do not narrate skill loading, MCP discovery, endpoint checks, request normalization, blueprint envelopes, hashes, package pinning, temporary files, or individual shell commands.
- Keep the normal result concise. Do not expose raw `structuredContent`, generated source, authentication output, or internal service state.
- Omit request IDs, checksums, contract and recipe versions, FreakUI Core versions, and file counts unless the user explicitly asks for them or a specific value is needed for retry, support, or diagnosis.
- Translate service failures into a plain reason and next step. Preserve exact error codes in tool context; show them to the user only when requested or diagnostically useful.
- Do not show or link prices, plans, checkout, or subscription-management flows, and do not suggest an upgrade or purchase.
- When generation access is unavailable, say: “FreakUI generation is not available for this account. Use an account with generation access, or contact FreakUI support.” Do not infer or describe the account's plan.

## Failure boundaries

- If `FreakUI.create_app_blueprint` is absent from the current task, stop before reading or writing a destination. Do not fall back to local implementation, even when FreakUI Core or other FreakUI projects are available on the Mac.
- Follow the service error's `retryable` value and suggestion. A retryable service failure uses the same request ID and unchanged request. Do not retry a non-retryable sign-in, access, contract, or validation error.
- A local materialization failure does not require another service call. Fix the local cause and reuse the same verified blueprint envelope.
- Never delete a generated project because package resolution or compilation failed. Preserve it for diagnosis and report the failing platform and stage.
- Do not report **Ready** from blueprint generation alone. **Ready** requires the confirmed local starter-content pass, when included, and successful compilation for every selected platform family.
- Do not add production authentication, billing, analytics, persistence, networking, app icons, or unconfirmed product features. The local starter pass may add only clearly temporary in-memory data and the minimum app-specific types required to present the confirmed screens.
