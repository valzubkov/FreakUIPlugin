#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  rmdir,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const CONTRACT_VERSION = 1;
const RECIPE_VERSION = "1.1.1";
const CORE_VERSION = "0.5.0-beta";
const SHA256 = /^[a-f0-9]{64}$/u;

export class MaterializationError extends Error {
  constructor(code, message, suggestion) {
    super(message);
    this.name = "MaterializationError";
    this.code = code;
    this.suggestion = suggestion;
  }
}

function fail(code, message, suggestion) {
  throw new MaterializationError(code, message, suggestion);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortValue(entry)]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail("INVALID_BLUEPRINT", `${label} must be an object.`);
  }
  return value;
}

function requireExactKeys(value, expected, label) {
  const keys = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (keys.length !== allowed.length || keys.some((key, index) => key !== allowed[index])) {
    fail(
      "INVALID_BLUEPRINT",
      `${label} has an unexpected shape. Expected keys: ${allowed.join(", ")}.`,
    );
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    fail("INVALID_BLUEPRINT", `${label} must be a nonempty string.`);
  }
  return value;
}

function requireSha(value, label) {
  if (typeof value !== "string" || !SHA256.test(value)) {
    fail("INVALID_BLUEPRINT", `${label} must be a lowercase SHA-256 checksum.`);
  }
  return value;
}

function validateRelativePath(value, label) {
  const candidate = requireString(value, label);
  if (
    candidate.includes("\\") ||
    path.posix.isAbsolute(candidate) ||
    path.posix.normalize(candidate) !== candidate ||
    candidate === "." ||
    candidate.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    fail("UNSAFE_PATH", `${label} must be a normalized relative POSIX path.`);
  }
  return candidate;
}

function assertInside(root, candidate, label) {
  const relative = path.relative(root, candidate);
  if (relative === "" || relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    fail("UNSAFE_PATH", `${label} escapes the staging directory.`);
  }
}

export function validateEnvelope(rawEnvelope) {
  const envelope = requireObject(rawEnvelope, "structuredContent");
  requireExactKeys(envelope, ["requestId", "resultSha256", "blueprint"], "structuredContent");
  requireString(envelope.requestId, "requestId");
  requireSha(envelope.resultSha256, "resultSha256");

  const blueprint = requireObject(envelope.blueprint, "blueprint");
  requireExactKeys(
    blueprint,
    [
      "contractVersion",
      "recipeVersion",
      "freakUICoreVersion",
      "requestSha256",
      "rootDirectoryName",
      "files",
      "requiredLocalAssets",
    ],
    "blueprint",
  );

  if (blueprint.contractVersion !== CONTRACT_VERSION) {
    fail("UNSUPPORTED_CONTRACT", `Expected contract ${CONTRACT_VERSION}.`);
  }
  if (blueprint.recipeVersion !== RECIPE_VERSION) {
    fail("UNSUPPORTED_RECIPE", `Expected recipe ${RECIPE_VERSION}.`);
  }
  if (blueprint.freakUICoreVersion !== CORE_VERSION) {
    fail("UNSUPPORTED_CORE", `Expected FreakUI Core ${CORE_VERSION}.`);
  }
  requireSha(blueprint.requestSha256, "blueprint.requestSha256");
  requireString(blueprint.rootDirectoryName, "blueprint.rootDirectoryName");

  if (!Array.isArray(blueprint.files) || blueprint.files.length === 0) {
    fail("INVALID_BLUEPRINT", "blueprint.files must be a nonempty array.");
  }
  if (!Array.isArray(blueprint.requiredLocalAssets)) {
    fail("INVALID_BLUEPRINT", "blueprint.requiredLocalAssets must be an array.");
  }

  const outputPaths = new Set();
  for (const [index, rawFile] of blueprint.files.entries()) {
    const file = requireObject(rawFile, `blueprint.files[${index}]`);
    requireExactKeys(file, ["path", "content", "encoding", "sha256"], `blueprint.files[${index}]`);
    const filePath = validateRelativePath(file.path, `blueprint.files[${index}].path`);
    if (outputPaths.has(filePath)) {
      fail("DUPLICATE_PATH", `Blueprint path “${filePath}” appears more than once.`);
    }
    outputPaths.add(filePath);
    if (file.encoding !== "utf8") {
      fail("INVALID_BLUEPRINT", `Blueprint file “${filePath}” must use UTF-8 encoding.`);
    }
    if (typeof file.content !== "string") {
      fail("INVALID_BLUEPRINT", `Blueprint file “${filePath}” must contain text.`);
    }
    const expected = requireSha(file.sha256, `blueprint.files[${index}].sha256`);
    if (sha256(Buffer.from(file.content, "utf8")) !== expected) {
      fail("BLUEPRINT_CHECKSUM_MISMATCH", `Blueprint file “${filePath}” failed its checksum.`);
    }
  }

  for (const [index, rawAsset] of blueprint.requiredLocalAssets.entries()) {
    const asset = requireObject(rawAsset, `blueprint.requiredLocalAssets[${index}]`);
    requireExactKeys(
      asset,
      ["kind", "fileName", "targetPath", "sha256"],
      `blueprint.requiredLocalAssets[${index}]`,
    );
    if (asset.kind !== "font") {
      fail("INVALID_BLUEPRINT", `Local asset ${index} must be a font.`);
    }
    const fileName = requireString(asset.fileName, `blueprint.requiredLocalAssets[${index}].fileName`);
    if (path.basename(fileName) !== fileName || !/\.(?:otf|ttf)$/iu.test(fileName)) {
      fail("UNSAFE_PATH", `Local font “${fileName}” must be a .otf or .ttf filename without a path.`);
    }
    const targetPath = validateRelativePath(
      asset.targetPath,
      `blueprint.requiredLocalAssets[${index}].targetPath`,
    );
    if (outputPaths.has(targetPath)) {
      fail("DUPLICATE_PATH", `Blueprint output path “${targetPath}” is duplicated.`);
    }
    outputPaths.add(targetPath);
    requireSha(asset.sha256, `blueprint.requiredLocalAssets[${index}].sha256`);
  }

  if (sha256(canonicalJson(blueprint)) !== envelope.resultSha256) {
    fail("RESULT_CHECKSUM_MISMATCH", "The blueprint envelope does not match resultSha256.");
  }

  return envelope;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function assertDestinationAvailable(destination) {
  if (!(await exists(destination))) {
    return false;
  }
  const destinationStat = await stat(destination);
  if (!destinationStat.isDirectory() || (await readdir(destination)).length > 0) {
    fail(
      "DESTINATION_NOT_EMPTY",
      `Destination “${destination}” already exists and is not an empty directory.`,
      "Choose an absent or empty destination. FreakUI never overwrites or merges projects.",
    );
  }
  return true;
}

export async function materializeEnvelope(rawEnvelope, options) {
  const envelope = validateEnvelope(rawEnvelope);
  if (typeof options?.destination !== "string" || !path.isAbsolute(options.destination)) {
    fail("UNSAFE_PATH", "The destination must be an absolute path.");
  }

  const destination = path.normalize(options.destination);
  if (destination === path.parse(destination).root || destination === path.normalize(os.homedir())) {
    fail("UNSAFE_PATH", "The destination cannot be a filesystem root or the user home directory.");
  }
  if (options.assets !== undefined && !path.isAbsolute(options.assets)) {
    fail("UNSAFE_PATH", "The local asset directory must be an absolute path.");
  }

  const destinationParent = path.dirname(destination);
  await mkdir(destinationParent, { recursive: true });
  const destinationExisted = await assertDestinationAvailable(destination);
  const stage = path.join(
    destinationParent,
    `.${path.basename(destination)}.freakui-stage-${randomUUID()}`,
  );
  await mkdir(stage, { recursive: false });
  let removedEmptyDestination = false;

  try {
    for (const file of envelope.blueprint.files) {
      const output = path.join(stage, ...file.path.split("/"));
      assertInside(stage, output, `Blueprint file “${file.path}”`);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, file.content, { encoding: "utf8", flag: "wx" });
    }

    for (const asset of envelope.blueprint.requiredLocalAssets) {
      if (!options.assets) {
        fail(
          "MISSING_LOCAL_ASSET",
          `Generation requires local font file “${asset.fileName}”.`,
          "Pass --assets with the folder containing the verified local font files.",
        );
      }
      const source = path.join(options.assets, asset.fileName);
      if (!(await exists(source))) {
        fail("MISSING_LOCAL_ASSET", `Local font “${source}” was not found.`);
      }
      const bytes = await readFile(source);
      if (sha256(bytes) !== asset.sha256) {
        fail(
          "ASSET_CHECKSUM_MISMATCH",
          `Local font “${asset.fileName}” does not match its approved checksum.`,
        );
      }
      const output = path.join(stage, ...asset.targetPath.split("/"));
      assertInside(stage, output, `Local font target “${asset.targetPath}”`);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, bytes, { flag: "wx" });
    }

    for (const file of envelope.blueprint.files) {
      const written = await readFile(path.join(stage, ...file.path.split("/")));
      if (sha256(written) !== file.sha256) {
        fail("WRITE_VERIFICATION_FAILED", `Written file “${file.path}” failed verification.`);
      }
    }

    if (destinationExisted) {
      await rmdir(destination);
      removedEmptyDestination = true;
    }
    await rename(stage, destination);
    removedEmptyDestination = false;

    return {
      requestId: envelope.requestId,
      resultSha256: envelope.resultSha256,
      contractVersion: envelope.blueprint.contractVersion,
      recipeVersion: envelope.blueprint.recipeVersion,
      freakUICoreVersion: envelope.blueprint.freakUICoreVersion,
      destination,
      generatedFileCount: envelope.blueprint.files.length,
      localAssetCount: envelope.blueprint.requiredLocalAssets.length,
    };
  } catch (error) {
    await rm(stage, { recursive: true, force: true });
    if (removedEmptyDestination && !(await exists(destination))) {
      await mkdir(destination, { recursive: false });
    }
    throw error;
  }
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--input" || argument === "--destination" || argument === "--assets") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        fail("INVALID_ARGUMENT", `${argument} requires a value.`);
      }
      options[argument.slice(2)] = value;
      index += 1;
    } else {
      fail("INVALID_ARGUMENT", `Unknown argument: ${argument}`);
    }
  }
  if (!options.input || !options.destination) {
    fail(
      "INVALID_ARGUMENT",
      "Usage: materialize-blueprint.mjs --input <blueprint.json> --destination <absolute-path> [--assets <absolute-path>]",
    );
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const raw = await readFile(options.input, "utf8");
  const envelope = JSON.parse(raw);
  const result = await materializeEnvelope(envelope, options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    if (error instanceof SyntaxError) {
      process.stderr.write("INVALID_JSON: The blueprint input is not valid JSON.\n");
    } else if (error instanceof MaterializationError) {
      process.stderr.write(`${error.code}: ${error.message}\n`);
      if (error.suggestion) {
        process.stderr.write(`Next step: ${error.suggestion}\n`);
      }
    } else {
      process.stderr.write(`LOCAL_WRITE_FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
    }
    process.exitCode = 1;
  });
}
