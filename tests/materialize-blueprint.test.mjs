import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  MaterializationError,
  canonicalJson,
  materializeEnvelope,
} from "../plugins/freakui/skills/create-app/scripts/materialize-blueprint.mjs";

const workRoot = path.resolve("tests");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fileEntry(filePath, content) {
  return {
    path: filePath,
    content,
    encoding: "utf8",
    sha256: sha256(Buffer.from(content, "utf8")),
  };
}

function envelope({ files, assets = [] }) {
  const blueprint = {
    contractVersion: 1,
    recipeVersion: "1.1.1",
    freakUICoreVersion: "0.5.0-beta",
    requestSha256: sha256("normalized request"),
    rootDirectoryName: "ExampleApp",
    files,
    requiredLocalAssets: assets,
  };
  return {
    requestId: "test-request-1",
    resultSha256: sha256(canonicalJson(blueprint)),
    blueprint,
  };
}

async function makeWorkspace(t) {
  await mkdir(workRoot, { recursive: true });
  const workspace = await mkdtemp(path.join(workRoot, ".work-materializer-"));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  return workspace;
}

test("materializes a verified envelope into an absent destination", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "ExampleApp");
  const result = await materializeEnvelope(
    envelope({
      files: [
        fileEntry("README.md", "# Example\n"),
        fileEntry("Sources/ExampleApp/App.swift", "import SwiftUI\n"),
      ],
    }),
    { destination },
  );

  assert.equal(result.generatedFileCount, 2);
  assert.equal(result.localAssetCount, 0);
  assert.equal(await readFile(path.join(destination, "README.md"), "utf8"), "# Example\n");
  assert.equal(
    await readFile(path.join(destination, "Sources/ExampleApp/App.swift"), "utf8"),
    "import SwiftUI\n",
  );
});

test("refuses and preserves a nonempty destination", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "ExistingApp");
  await mkdir(destination);
  await writeFile(path.join(destination, "keep.txt"), "customer data\n");

  await assert.rejects(
    materializeEnvelope(envelope({ files: [fileEntry("README.md", "generated\n")] }), {
      destination,
    }),
    (error) => error instanceof MaterializationError && error.code === "DESTINATION_NOT_EMPTY",
  );
  assert.equal(await readFile(path.join(destination, "keep.txt"), "utf8"), "customer data\n");
});

test("rejects unsafe output paths before writing", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "UnsafeApp");
  const unsafe = envelope({ files: [fileEntry("README.md", "generated\n")] });
  unsafe.blueprint.files[0].path = "../outside.txt";
  unsafe.resultSha256 = sha256(canonicalJson(unsafe.blueprint));

  await assert.rejects(
    materializeEnvelope(unsafe, { destination }),
    (error) => error instanceof MaterializationError && error.code === "UNSAFE_PATH",
  );
});

test("rejects a file checksum mismatch", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "TamperedApp");
  const tampered = envelope({ files: [fileEntry("README.md", "original\n")] });
  tampered.blueprint.files[0].content = "tampered\n";
  tampered.resultSha256 = sha256(canonicalJson(tampered.blueprint));

  await assert.rejects(
    materializeEnvelope(tampered, { destination }),
    (error) =>
      error instanceof MaterializationError && error.code === "BLUEPRINT_CHECKSUM_MISMATCH",
  );
});

test("rejects an envelope checksum mismatch", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "WrongEnvelopeHash");
  const wrongHash = envelope({ files: [fileEntry("README.md", "original\n")] });
  wrongHash.resultSha256 = "0".repeat(64);

  await assert.rejects(
    materializeEnvelope(wrongHash, { destination }),
    (error) => error instanceof MaterializationError && error.code === "RESULT_CHECKSUM_MISMATCH",
  );
});

test("rejects an older generator recipe", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "OldRecipeApp");
  const oldRecipe = envelope({ files: [fileEntry("README.md", "old recipe\n")] });
  oldRecipe.blueprint.recipeVersion = "1.1.0";
  oldRecipe.resultSha256 = sha256(canonicalJson(oldRecipe.blueprint));

  await assert.rejects(
    materializeEnvelope(oldRecipe, { destination }),
    (error) => error instanceof MaterializationError && error.code === "UNSUPPORTED_RECIPE",
  );
});

test("verifies and copies an approved local font", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "FontApp");
  const assetsDirectory = path.join(workspace, "assets");
  const fontBytes = Buffer.from("test font bytes");
  await mkdir(assetsDirectory);
  await writeFile(path.join(assetsDirectory, "Example-Regular.otf"), fontBytes);

  const result = await materializeEnvelope(
    envelope({
      files: [fileEntry("README.md", "# Font App\n")],
      assets: [
        {
          kind: "font",
          fileName: "Example-Regular.otf",
          targetPath: "Resources/Fonts/Example-Regular.otf",
          sha256: sha256(fontBytes),
        },
      ],
    }),
    { destination, assets: assetsDirectory },
  );

  assert.equal(result.localAssetCount, 1);
  assert.deepEqual(
    await readFile(path.join(destination, "Resources/Fonts/Example-Regular.otf")),
    fontBytes,
  );
});

test("preserves an approved empty destination after a staged failure", async (t) => {
  const workspace = await makeWorkspace(t);
  const destination = path.join(workspace, "RecoverableApp");
  await mkdir(destination);
  const fontBytes = Buffer.from("expected font bytes");
  const fontEnvelope = envelope({
    files: [fileEntry("README.md", "# Recoverable App\n")],
    assets: [
      {
        kind: "font",
        fileName: "Missing-Regular.otf",
        targetPath: "Resources/Fonts/Missing-Regular.otf",
        sha256: sha256(fontBytes),
      },
    ],
  });

  await assert.rejects(
    materializeEnvelope(fontEnvelope, { destination }),
    (error) => error instanceof MaterializationError && error.code === "MISSING_LOCAL_ASSET",
  );

  assert.equal((await stat(destination)).isDirectory(), true);
  assert.deepEqual(await readdir(destination), []);
  assert.equal(
    (await readdir(workspace)).some((entry) => entry.startsWith(".RecoverableApp.freakui-stage-")),
    false,
  );
});
