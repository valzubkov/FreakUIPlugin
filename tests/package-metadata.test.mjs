import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const repository = path.resolve(".");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repository, relativePath), "utf8"));
}

test("Codex and Claude Code load the same plugin identity, skill, and MCP config", async () => {
  const [packageManifest, codex, claude, mcp] = await Promise.all([
    readJson("package.json"),
    readJson("plugins/freakui/.codex-plugin/plugin.json"),
    readJson("plugins/freakui/.claude-plugin/plugin.json"),
    readJson("plugins/freakui/.mcp.json"),
  ]);

  assert.equal(codex.name, "freakui");
  assert.equal(claude.name, codex.name);
  assert.equal(codex.version, packageManifest.version);
  assert.equal(claude.version, codex.version);
  assert.equal(claude.description, codex.description);
  assert.equal(claude.skills, codex.skills);
  assert.equal(claude.mcpServers, codex.mcpServers);
  assert.equal(codex.interface.category, "Developer Tools");
  assert.equal(codex.interface.logo, "./assets/freakui-icon.svg");
  assert.equal(codex.interface.composerIcon, codex.interface.logo);
  await access(path.join(repository, "plugins/freakui/assets/freakui-icon.svg"));
  assert.deepEqual(mcp, {
    mcpServers: {
      FreakUI: {
        type: "http",
        url: "https://www.freakui.com/mcp",
      },
    },
  });
});

test("both local marketplaces expose the same self-contained plugin", async () => {
  const [codexMarketplace, claudeMarketplace] = await Promise.all([
    readJson(".agents/plugins/marketplace.json"),
    readJson(".claude-plugin/marketplace.json"),
  ]);

  assert.equal(codexMarketplace.name, "freak-company");
  assert.equal(claudeMarketplace.name, codexMarketplace.name);
  assert.equal(codexMarketplace.plugins.length, 1);
  assert.equal(claudeMarketplace.plugins.length, 1);
  assert.equal(codexMarketplace.plugins[0].name, "freakui");
  assert.equal(claudeMarketplace.plugins[0].name, "freakui");
  assert.equal(codexMarketplace.plugins[0].source.path, "./plugins/freakui");
  assert.equal(claudeMarketplace.plugins[0].source, "./plugins/freakui");
  assert.equal(codexMarketplace.plugins[0].category, "Developer Tools");
  assert.equal(claudeMarketplace.plugins[0].category, "development");
});

test("both clients receive the same three shared FreakUI skills", async () => {
  const skillNames = ["add-component", "build-dashboard", "create-app"];
  const officialIcon = await readFile("plugins/freakui/assets/freakui-icon.svg");

  await Promise.all(
    skillNames.flatMap((skillName) => [
      access(
        path.join(
          repository,
          "plugins/freakui/skills",
          skillName,
          "SKILL.md",
        ),
      ),
      access(
        path.join(
          repository,
          "plugins/freakui/skills",
          skillName,
          "agents/openai.yaml",
        ),
      ),
      readFile(
        path.join(
          repository,
          "plugins/freakui/skills",
          skillName,
          "assets/freakui-icon.svg",
        ),
      ).then((skillIcon) => assert.deepEqual(skillIcon, officialIcon)),
    ]),
  );
});

test("create-app keeps default example content in the local workflow", async () => {
  const [skill, contract, starterContent] = await Promise.all([
    readFile("plugins/freakui/skills/create-app/SKILL.md", "utf8"),
    readFile("plugins/freakui/skills/create-app/references/contract-1.md", "utf8"),
    readFile("plugins/freakui/skills/create-app/references/starter-content.md", "utf8"),
  ]);

  assert.match(skill, /Example content is included unless the user opts out\./u);
  assert.match(skill, /Never send the destination, example-content choice/u);
  assert.match(contract, /Example content, included by default unless the user opts out\./u);
  assert.match(starterContent, /Never send them to the FreakUI service\./u);
});
