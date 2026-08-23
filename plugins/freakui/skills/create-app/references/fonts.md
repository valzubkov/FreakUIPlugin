# Local font handling

Use this only when the user chooses custom text or number fonts.

Ask for one local folder containing the desktop/app `.ttf` or `.otf` files plus any license or README supplied with them. Web fonts such as `.woff` and `.woff2` are unsupported. Files remain local.

For a complete family, require unambiguous Regular, Medium, Semibold, and Bold faces. Run the bundled inspector from this skill directory:

```bash
xcrun swift scripts/inspect-fonts.swift \
  /absolute/path/to/font-folder/ExampleSans-Regular.otf \
  /absolute/path/to/font-folder/ExampleSans-Medium.otf \
  /absolute/path/to/font-folder/ExampleSans-Semibold.otf \
  /absolute/path/to/font-folder/ExampleSans-Bold.otf
```

Pass explicit paths that actually exist. The inspector returns each file's family name, style name, PostScript name, and lowercase SHA-256 checksum.

Map the four weights from the inspected metadata. Ask the user to resolve missing, variable-only, duplicate, or ambiguous faces. Never infer a PostScript name from a filename and never silently substitute one weight for another.

The normalized custom family has this shape:

```json
{
  "kind": "custom",
  "familyName": "Example Sans",
  "faces": {
    "regular": {
      "fileName": "ExampleSans-Regular.otf",
      "postScriptName": "ExampleSans-Regular",
      "sha256": "<lowercase 64-character checksum>"
    },
    "medium": {
      "fileName": "ExampleSans-Medium.otf",
      "postScriptName": "ExampleSans-Medium",
      "sha256": "<lowercase 64-character checksum>"
    },
    "semibold": {
      "fileName": "ExampleSans-Semibold.otf",
      "postScriptName": "ExampleSans-Semibold",
      "sha256": "<lowercase 64-character checksum>"
    },
    "bold": {
      "fileName": "ExampleSans-Bold.otf",
      "postScriptName": "ExampleSans-Bold",
      "sha256": "<lowercase 64-character checksum>"
    }
  }
}
```

Send only this metadata to the service. Pass the local folder to the materializer so it can verify and copy the exact files requested by the returned blueprint. Include supplied license or attribution text in `thirdPartyNotices` when applicable. The user remains responsible for embedding and distribution rights.
