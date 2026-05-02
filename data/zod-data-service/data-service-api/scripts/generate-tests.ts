import { writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

interface PipelineConfig {
  actions: { type: string; [key: string]: string }[];
}

interface JsonSchemaEntry {
  groupId: string;
  artifactId: string;
  version: string;
  jsonSchema: Record<string, unknown>;
  pipeline: PipelineConfig;
}

const ROOT = new URL("..", import.meta.url).pathname;
const SCHEMAS_FILE = join(ROOT, "src/generated/json-schemas.json");
const OUT_DIR = join(ROOT, "tests/generated");

function safeName(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function relativeRunnerPath(depth: number): string {
  return `${"../".repeat(depth)}contract-runner.js`;
}

function testFileFor(entry: JsonSchemaEntry, runnerImport: string): string {
  return `// AUTO-GENERATED — do not edit. Regenerate via: npm run generate:tests
import { runContractTests } from "${runnerImport}";

const entry = ${JSON.stringify(entry, null, 2)};

runContractTests(entry);
`;
}

function main() {
  if (!existsSync(SCHEMAS_FILE)) {
    throw new Error(
      `${SCHEMAS_FILE} not found. Run \`npm run generate\` first.`,
    );
  }

  const entries: JsonSchemaEntry[] = JSON.parse(
    readFileSync(SCHEMAS_FILE, "utf-8"),
  );

  if (existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;
  for (const entry of entries) {
    const groupDir = join(OUT_DIR, safeName(entry.groupId));
    const artifactDir = join(groupDir, safeName(entry.artifactId));
    mkdirSync(artifactDir, { recursive: true });

    const fileName = `v${safeName(entry.version)}.test.ts`;
    const filePath = join(artifactDir, fileName);

    // tests/generated/<group>/<artifact>/v<n>.test.ts → 3 levels deep from tests/
    const runnerImport = relativeRunnerPath(3);

    writeFileSync(filePath, testFileFor(entry, runnerImport));
    count++;
  }

  console.log(`Generated ${count} test file(s) under tests/generated/`);
}

main();
