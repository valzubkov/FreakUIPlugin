import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  VerificationError,
  verifyGeneratedProject,
} from "../plugins/freakui/skills/create-app/scripts/verify-generated-project.mjs";

const workRoot = path.resolve("tests");
const swiftIdentifier = "ExampleApp";

async function makeWorkspace(t) {
  await mkdir(workRoot, { recursive: true });
  const destination = await mkdtemp(path.join(workRoot, ".work-verifier-"));
  t.after(() => rm(destination, { recursive: true, force: true }));
  return destination;
}

async function writeGeneratedProject(
  destination,
  { version = "0.5.0-beta", recipeVersion = "1.1.1", resolved = false } = {},
) {
  const manifestDirectory = path.join(destination, ".freakui");
  const projectDirectory = path.join(destination, `${swiftIdentifier}.xcodeproj`);
  const sourceRoot = path.join(destination, swiftIdentifier);
  await mkdir(manifestDirectory, { recursive: true });
  await mkdir(projectDirectory, { recursive: true });
  await mkdir(path.join(sourceRoot, "App"), { recursive: true });
  await mkdir(path.join(sourceRoot, "Dependencies"), { recursive: true });
  await mkdir(path.join(sourceRoot, "Navigation"), { recursive: true });
  await mkdir(path.join(sourceRoot, "Views"), { recursive: true });
  await writeFile(
    path.join(manifestDirectory, "generation.json"),
    `${JSON.stringify(
      {
        contractVersion: 1,
        recipeVersion,
        freakUICoreVersion: "0.5.0-beta",
        app: { swiftIdentifier },
        platforms: ["iphone", "ipad", "macos"],
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    path.join(projectDirectory, "project.pbxproj"),
    `repositoryURL = "https://github.com/valzubkov/FreakUI";\nrequirement = {\n  kind = exactVersion;\n  version = "0.5.0-beta";\n};\n`,
  );
  const architectureFiles = new Map([
    [
      path.join(sourceRoot, "App", `${swiftIdentifier}App.swift`),
      "@StateObject private var navigationManager: NavigationManager\nlet dependencies = AppDependencies.live\nlet appContext = AppContext(deps: dependencies)\n.environmentObject(appContext)\n",
    ],
    [path.join(sourceRoot, "App", "AppDependencies.swift"), "let modelFactory: ViewModelFactory\n"],
    [path.join(sourceRoot, "App", "AppContext.swift"), "let deps: AppDependencies\n"],
    [
      path.join(sourceRoot, "Dependencies", "ViewModelFactory.swift"),
      "func makeSettingsViewModel(appContext: AppContext) -> SettingsViewModel\n",
    ],
    [
      path.join(sourceRoot, "Dependencies", "ParentViewModel.swift"),
      "var appContext: AppContext { get }\n",
    ],
    [
      path.join(sourceRoot, "Navigation", "MasterDestinations.swift"),
      "appContext.deps.modelFactory\n",
    ],
    [
      path.join(sourceRoot, "Navigation", "NavigationManager+Paths.swift"),
      "@Published var activeSheet: Sheet?\nfunc pathFor(_ destination: MasterDestination)\n",
    ],
    [
      path.join(sourceRoot, "Navigation", "NavigationManager+Sheets.swift"),
      "enum Sheet: String, Identifiable\n",
    ],
    [
      path.join(sourceRoot, "Navigation", "ViewDestinations.swift"),
      "enum ViewDestinations: Hashable {}\nstruct NavigationDestinationContainer<Content: View>: View\n",
    ],
    [path.join(sourceRoot, "Views", "RootView.swift"), "struct RootView: View\n"],
  ]);
  await Promise.all(
    [...architectureFiles].map(([filePath, content]) => writeFile(filePath, content)),
  );
  if (resolved) {
    const resolutionDirectory = path.join(
      projectDirectory,
      "project.xcworkspace",
      "xcshareddata",
      "swiftpm",
    );
    await mkdir(resolutionDirectory, { recursive: true });
    await writeFile(
      path.join(resolutionDirectory, "Package.resolved"),
      `${JSON.stringify(
        {
          version: 3,
          pins: [
            {
              identity: "freakui",
              kind: "remoteSourceControl",
              location: "https://github.com/valzubkov/FreakUI",
              state: { revision: "test", version },
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
  }
}

test("validates generated metadata and reports platform commands", async (t) => {
  const destination = await makeWorkspace(t);
  await writeGeneratedProject(destination);

  const result = await verifyGeneratedProject(destination);

  assert.equal(result.packageResolved, false);
  assert.equal(result.freakUICoreVersion, "0.5.0-beta");
  assert.equal(result.buildCommands.length, 2);
  assert.deepEqual(result.platforms, ["iphone", "ipad", "macos"]);
  assert.equal(result.resolveCommand[0], "xcodebuild");
});

test("requires Package.resolved only when requested", async (t) => {
  const destination = await makeWorkspace(t);
  await writeGeneratedProject(destination);

  await assert.rejects(
    verifyGeneratedProject(destination, { requireResolved: true }),
    (error) => error instanceof VerificationError && error.code === "CORE_NOT_RESOLVED",
  );
});

test("rejects an older generated project recipe", async (t) => {
  const destination = await makeWorkspace(t);
  await writeGeneratedProject(destination, { recipeVersion: "1.1.0" });

  await assert.rejects(
    verifyGeneratedProject(destination),
    (error) => error instanceof VerificationError && error.code === "UNSUPPORTED_RECIPE",
  );
});

test("accepts the exact resolved FreakUI version", async (t) => {
  const destination = await makeWorkspace(t);
  await writeGeneratedProject(destination, { resolved: true });

  const result = await verifyGeneratedProject(destination, { requireResolved: true });

  assert.equal(result.packageResolved, true);
});

test("rejects a different resolved FreakUI version", async (t) => {
  const destination = await makeWorkspace(t);
  await writeGeneratedProject(destination, { resolved: true, version: "0.5.1" });

  await assert.rejects(
    verifyGeneratedProject(destination, { requireResolved: true }),
    (error) =>
      error instanceof VerificationError && error.code === "CORE_RESOLUTION_MISMATCH",
  );
});
