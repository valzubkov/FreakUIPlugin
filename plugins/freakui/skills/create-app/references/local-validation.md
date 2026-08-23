# Local materialization and validation

The MCP result's `structuredContent` is the blueprint envelope. Keep it local.

## Materialize safely

1. Re-check that the absolute destination is absent or empty.
2. Save only `structuredContent` to a task-owned JSON file in the destination's parent directory. Do not mix tool logs, authentication output, or the text summary into this file.
3. Resolve the materializer path relative to this skill's `SKILL.md`, then run:

```bash
node scripts/materialize-blueprint.mjs \
  --input /absolute/path/to/blueprint-envelope.json \
  --destination /absolute/path/to/new-project
```

For custom fonts, add:

```bash
  --assets /absolute/path/to/verified-font-folder
```

The helper verifies the envelope hash, contract and recipe versions, every relative path, every UTF-8 file checksum, and every local font checksum. It writes into a unique staging directory beside the destination and moves the completed stage into place only after verification. It cleans up only the stage it created. Delete the task-owned envelope only after successful materialization and only if this workflow created it.

## Verify the generated project

Run the read-only verifier before package resolution:

```bash
node scripts/verify-generated-project.mjs \
  --destination /absolute/path/to/new-project
```

It verifies `.freakui/generation.json`, contract `1`, recipe `1.1.1`, exact FreakUI Core `0.5.0-beta`, the generated Xcode project, and the exact package requirement. Its JSON output includes argument arrays for the package-resolution and selected-platform build commands.

Run the reported package-resolution command. Then require the resolved package pin:

```bash
node scripts/verify-generated-project.mjs \
  --destination /absolute/path/to/new-project \
  --require-resolved
```

The FreakUI pin must resolve to version `0.5.0-beta` from `https://github.com/valzubkov/FreakUI`.

When confirmed example content is included, perform the local starter-content pass only after package resolution so the installed FreakUI API can be inspected. Then run the verifier again with `--require-resolved`. This rechecks the generated architectural boundaries and exact package pin after local edits.

Run each build command reported by the final verifier. iPhone and iPad share one generic iOS Simulator build; macOS has a separate native macOS build. These checks compile but do not launch a simulator, sign, archive, deploy, or publish the app.

## User-facing result states

- **Ready**: generation, materialization, the confirmed starter-content pass when included, exact package resolution, and every selected platform-family build succeeded.
- **Created — verification incomplete**: the project was created, but a specific environmental limitation prevented resolution or compilation. Report the limitation and one exact next action.
- **Could not complete**: generation, materialization, package resolution, or compilation produced a real failure. Say whether the project exists, name the failing stage and platform, and provide one next action.

If resolution or compilation fails, do not erase the project and do not call generation again. Separate environment failures (missing compatible Xcode, unavailable network/package host, unavailable SDK) from source or project failures. Never represent a failed or skipped build as **Ready**.
