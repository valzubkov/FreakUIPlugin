#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const CONTRACT_VERSION = 1;
const RECIPE_VERSION = "1.1.1";
const CORE_VERSION = "0.5.0-beta";
const CORE_REPOSITORY = "https://github.com/valzubkov/FreakUI";

export class VerificationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "VerificationError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new VerificationError(code, message);
}

async function readJson(filePath, label) {
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    fail("MISSING_PROJECT_FILE", `${label} was not found at “${filePath}”.`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    fail("INVALID_PROJECT_FILE", `${label} is not valid JSON.`);
  }
}

async function readRequiredFile(filePath, label) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    fail("MISSING_PROJECT_FILE", `${label} was not found at “${filePath}”.`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    fail("INVALID_PROJECT_FILE", `${label} must be a nonempty string.`);
  }
  return value;
}

function packageResolvedPath(destination, swiftIdentifier) {
  return path.join(
    destination,
    `${swiftIdentifier}.xcodeproj`,
    "project.xcworkspace",
    "xcshareddata",
    "swiftpm",
    "Package.resolved",
  );
}

function findFreakUiPin(resolved) {
  if (!resolved || !Array.isArray(resolved.pins)) {
    fail("INVALID_PACKAGE_RESOLUTION", "Package.resolved does not contain a pins array.");
  }
  return resolved.pins.find((pin) => {
    const identity = typeof pin?.identity === "string" ? pin.identity.toLowerCase() : "";
    const location = typeof pin?.location === "string" ? pin.location.replace(/\.git$/u, "") : "";
    return identity === "freakui" || location === CORE_REPOSITORY;
  });
}

export async function verifyGeneratedProject(rawDestination, options = {}) {
  if (typeof rawDestination !== "string" || !path.isAbsolute(rawDestination)) {
    fail("UNSAFE_PATH", "The destination must be an absolute path.");
  }
  const destination = path.normalize(rawDestination);
  const manifestPath = path.join(destination, ".freakui", "generation.json");
  const manifest = await readJson(manifestPath, "Generation manifest");

  if (manifest.contractVersion !== CONTRACT_VERSION) {
    fail("UNSUPPORTED_CONTRACT", `Expected contract ${CONTRACT_VERSION}.`);
  }
  if (manifest.recipeVersion !== RECIPE_VERSION) {
    fail("UNSUPPORTED_RECIPE", `Expected recipe ${RECIPE_VERSION}.`);
  }
  if (manifest.freakUICoreVersion !== CORE_VERSION) {
    fail("UNSUPPORTED_CORE", `Expected FreakUI Core ${CORE_VERSION}.`);
  }

  const swiftIdentifier = requireString(manifest.app?.swiftIdentifier, "manifest.app.swiftIdentifier");
  if (!Array.isArray(manifest.platforms) || manifest.platforms.length === 0) {
    fail("INVALID_PROJECT_FILE", "manifest.platforms must be a nonempty array.");
  }
  const validPlatforms = new Set(["iphone", "ipad", "macos"]);
  if (manifest.platforms.some((platform) => !validPlatforms.has(platform))) {
    fail("INVALID_PROJECT_FILE", "manifest.platforms contains an unsupported platform.");
  }

  const projectPath = path.join(destination, `${swiftIdentifier}.xcodeproj`);
  const pbxPath = path.join(projectPath, "project.pbxproj");
  let pbx;
  try {
    pbx = await readFile(pbxPath, "utf8");
  } catch {
    fail("MISSING_PROJECT_FILE", `Xcode project was not found at “${pbxPath}”.`);
  }
  const repositoryReference =
    /repositoryURL = "?https:\/\/github\.com\/valzubkov\/FreakUI"?;/u;
  if (!repositoryReference.test(pbx)) {
    fail("CORE_REQUIREMENT_MISMATCH", "The Xcode project does not use the approved FreakUI repository.");
  }
  const exactRequirement = /requirement = \{\s*kind = exactVersion;\s*version = "0\.5\.0-beta";\s*\};/u;
  if (!exactRequirement.test(pbx)) {
    fail("CORE_REQUIREMENT_MISMATCH", `The Xcode project does not require exact FreakUI Core ${CORE_VERSION}.`);
  }

  const sourceRoot = path.join(destination, swiftIdentifier);
  const [appEntry, dependencies, appContext, factory, parentViewModel, masterDestinations, navigationPaths, navigationSheets, viewDestinations, rootView] =
    await Promise.all([
      readRequiredFile(path.join(sourceRoot, "App", `${swiftIdentifier}App.swift`), "App entry point"),
      readRequiredFile(path.join(sourceRoot, "App", "AppDependencies.swift"), "App dependencies"),
      readRequiredFile(path.join(sourceRoot, "App", "AppContext.swift"), "App context"),
      readRequiredFile(path.join(sourceRoot, "Dependencies", "ViewModelFactory.swift"), "ViewModel factory"),
      readRequiredFile(path.join(sourceRoot, "Dependencies", "ParentViewModel.swift"), "Parent ViewModel protocol"),
      readRequiredFile(path.join(sourceRoot, "Navigation", "MasterDestinations.swift"), "Master destinations"),
      readRequiredFile(path.join(sourceRoot, "Navigation", "NavigationManager+Paths.swift"), "Navigation paths"),
      readRequiredFile(path.join(sourceRoot, "Navigation", "NavigationManager+Sheets.swift"), "Navigation sheets"),
      readRequiredFile(path.join(sourceRoot, "Navigation", "ViewDestinations.swift"), "View destinations"),
      readRequiredFile(path.join(sourceRoot, "Views", "RootView.swift"), "Root view"),
    ]);

  if (
    !appEntry.includes("let dependencies = AppDependencies.live") ||
    !appEntry.includes("let appContext = AppContext(deps: dependencies)") ||
    !appEntry.includes("@StateObject private var navigationManager: NavigationManager") ||
    !appEntry.includes(".environmentObject(appContext)") ||
    !dependencies.includes("let modelFactory: ViewModelFactory") ||
    !appContext.includes("let deps: AppDependencies") ||
    /\b(?:appName|productDescription|navigation|viewModelFactory|startingMessage)\b/u.test(appContext) ||
    /private\s+(?:unowned\s+)?let\s+appContext/u.test(factory) ||
    !parentViewModel.includes("var appContext: AppContext { get }") ||
    !masterDestinations.includes("appContext.deps.modelFactory") ||
    !navigationPaths.includes("func pathFor(_ destination: MasterDestination)") ||
    navigationPaths.includes("func navigate(to destination: ViewDestinations") ||
    !navigationPaths.includes("@Published var activeSheet: Sheet?") ||
    !navigationSheets.includes("enum Sheet: String, Identifiable") ||
    !viewDestinations.includes("enum ViewDestinations: Hashable {}") ||
    !viewDestinations.includes("struct NavigationDestinationContainer") ||
    !rootView.includes("struct RootView: View") ||
    rootView.includes("appContext != nil")
  ) {
    fail(
      "FOUNDATION_MISMATCH",
      "The generated dependency, ViewModel, or typed-navigation foundation does not match recipe 1.1.1.",
    );
  }

  const resolvedPath = packageResolvedPath(destination, swiftIdentifier);
  let packageResolved = false;
  try {
    const resolved = await readJson(resolvedPath, "Package resolution");
    const pin = findFreakUiPin(resolved);
    if (!pin) {
      fail("CORE_NOT_RESOLVED", "Package.resolved does not contain FreakUI.");
    }
    if (pin.state?.version !== CORE_VERSION) {
      fail(
        "CORE_RESOLUTION_MISMATCH",
        `Package.resolved pins FreakUI to “${pin.state?.version ?? "no version"}”, expected “${CORE_VERSION}”.`,
      );
    }
    packageResolved = true;
  } catch (error) {
    if (error instanceof VerificationError && error.code !== "MISSING_PROJECT_FILE") {
      throw error;
    }
    if (options.requireResolved) {
      fail("CORE_NOT_RESOLVED", `FreakUI has not produced a verified Package.resolved at “${resolvedPath}”.`);
    }
  }

  const resolveCommand = [
    "xcodebuild",
    "-resolvePackageDependencies",
    "-project",
    projectPath,
    "-scheme",
    swiftIdentifier,
  ];
  const buildCommands = [];
  if (manifest.platforms.includes("iphone") || manifest.platforms.includes("ipad")) {
    buildCommands.push([
      "xcodebuild",
      "-project",
      projectPath,
      "-scheme",
      swiftIdentifier,
      "-configuration",
      "Debug",
      "-destination",
      "generic/platform=iOS Simulator",
      "CODE_SIGNING_ALLOWED=NO",
      "build",
    ]);
  }
  if (manifest.platforms.includes("macos")) {
    buildCommands.push([
      "xcodebuild",
      "-project",
      projectPath,
      "-scheme",
      swiftIdentifier,
      "-configuration",
      "Debug",
      "-destination",
      "platform=macOS",
      "CODE_SIGNING_ALLOWED=NO",
      "build",
    ]);
  }

  return {
    destination,
    manifestPath,
    projectPath,
    scheme: swiftIdentifier,
    contractVersion: CONTRACT_VERSION,
    recipeVersion: RECIPE_VERSION,
    freakUICoreVersion: CORE_VERSION,
    platforms: manifest.platforms,
    packageResolved,
    packageResolvedPath: resolvedPath,
    resolveCommand,
    buildCommands,
  };
}

function parseArguments(argv) {
  const options = { requireResolved: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--destination") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        fail("INVALID_ARGUMENT", "--destination requires a value.");
      }
      options.destination = value;
      index += 1;
    } else if (argument === "--require-resolved") {
      options.requireResolved = true;
    } else {
      fail("INVALID_ARGUMENT", `Unknown argument: ${argument}`);
    }
  }
  if (!options.destination) {
    fail(
      "INVALID_ARGUMENT",
      "Usage: verify-generated-project.mjs --destination <absolute-path> [--require-resolved]",
    );
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const result = await verifyGeneratedProject(options.destination, options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    if (error instanceof VerificationError) {
      process.stderr.write(`${error.code}: ${error.message}\n`);
    } else {
      process.stderr.write(`PROJECT_VERIFICATION_FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    process.exitCode = 1;
  });
}
