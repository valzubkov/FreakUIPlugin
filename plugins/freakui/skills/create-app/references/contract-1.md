# Generation contract 1

Use this reference to gather and normalize one supported request.

## Required app choices

- App name: 1–80 characters.
- Bundle identifier: at least two dot-separated components using letters, numbers, and hyphens.
- Platforms: one or more of `iphone`, `ipad`, and `macos`, without duplicates.
- Product description: 1–500 characters. Describe the product honestly; do not invent features.
- Top-level screens: an ordered list of two to five title/icon pairs. Order becomes tab and sidebar order.
- Visual direction: 1–500 characters. Capture overall mood, interface density, and corner character independently in natural language, such as `Calm and warm-neutral, with compact spacing and soft rounded corners.`
- Accent color: one opaque six-digit hex value such as `#4D63FF`.
- Text font: Apple System or a verified local custom family.
- Number font: Apple System Monospaced or a verified local custom family.
- Third-party notices: zero to ten title/body entries.
- Absolute destination directory: local-only; never include it in the service request.

Use Apple System text and Apple System Monospaced numbers when the user has no font preference. Use an empty notices array unless the user supplies or requests external fonts, assets, or licensed material.

## Local-only choices

- Destination directory.
- Example content, included by default unless the user opts out.

These choices are confirmed with the user but never added to the normalized service request. Example content is created only after the verified foundation has been materialized locally.

Supported screen icons:

`archivebox`, `bell`, `bolt`, `book`, `bookmark`, `books.vertical`, `calendar`, `chart.bar`, `chart.line.uptrend.xyaxis`, `checkmark.circle`, `clock`, `doc.text`, `figure.run`, `figure.strengthtraining.traditional`, `flag`, `folder`, `gearshape`, `globe`, `heart`, `house`, `leaf`, `lightbulb`, `list.bullet`, `map`, `message`, `person`, `photo`, `rectangle.grid.1x2`, `square.grid.2x2`, `star`, `tag`, `tray`, `wand.and.stars`.

If the requested icon is unsupported, propose the closest supported icon and confirm it. Do not pass an unapproved substitution.

## Normalized request

```json
{
  "contractVersion": 1,
  "appName": "Example App",
  "bundleIdentifier": "com.example.exampleapp",
  "platforms": ["iphone", "ipad"],
  "productDescription": "A concise, truthful product description.",
  "topLevelScreens": [
    { "title": "Home", "icon": "house" },
    { "title": "Library", "icon": "books.vertical" }
  ],
  "visualDirection": "Calm, direct, warm-neutral, and spacious.",
  "accentColor": "#4D63FF",
  "textFont": { "kind": "system" },
  "numberFont": { "kind": "systemMonospaced" },
  "thirdPartyNotices": []
}
```

The service request contains normalized product intent only. It never contains the destination, repository, workspace, original prompt history, local font paths or bytes, account identity, payment data, or credentials.

## Fixed compatibility

- Generation contract: `1`
- Generator recipe: `1.1.1`
- FreakUI Core: exact `0.5.0-beta`
- Swift language mode: `6`
- Swift tools baseline: `6.2`
- iPhone/iPad minimum: iOS/iPadOS 17
- macOS minimum: macOS 14
- One Xcode multiplatform application target

## Not supported

Contract 1 does not integrate into an existing Xcode project and does not generate backend services, persistence, authentication, billing, analytics, domain models, CRUD, onboarding, paywalls, notification settings, app icons, logos, launch artwork, signing, archives, deployment, or App Store configuration. After materialization, the local starter-content pass may add clearly temporary in-memory example data and the minimum app-specific display types. That local work does not expand the hosted generation contract.
