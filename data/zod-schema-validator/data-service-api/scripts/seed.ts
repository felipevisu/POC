import { readFileSync } from "node:fs";
import { join } from "node:path";

const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:8080";
const API = `${REGISTRY_URL}/apis/registry/v3`;
const SEEDS_DIR = new URL("./seeds", import.meta.url).pathname;

interface SeedVersion {
  version: string;
  file: string;
}

interface SeedArtifact {
  groupId: string;
  artifactId: string;
  name: string;
  labels: Record<string, string>;
  versions: SeedVersion[];
}

const SEED_ARTIFACTS: SeedArtifact[] = [
  {
    groupId: "sales",
    artifactId: "order-created",
    name: "Order Created",
    labels: {
      "pipeline.actions": "kafka,database",
      "pipeline.kafka.topic": "sales.order-created",
      "pipeline.database.table": "orders",
    },
    versions: [
      { version: "1", file: "order-created.json" },
      { version: "2", file: "order-created-v2.json" },
    ],
  },
  {
    groupId: "customers",
    artifactId: "customer-registered",
    name: "Customer Registered",
    labels: {
      "pipeline.actions": "kafka,database",
      "pipeline.kafka.topic": "customers.registered",
      "pipeline.database.table": "customers",
    },
    versions: [{ version: "1", file: "customer-registered.json" }],
  },
  {
    groupId: "payments",
    artifactId: "payment-processed",
    name: "Payment Processed",
    labels: {
      "pipeline.actions": "kafka",
      "pipeline.kafka.topic": "payments.processed",
    },
    versions: [{ version: "1", file: "payment-processed.json" }],
  },
];

async function waitForRegistry(retries = 15, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${API}/system/info`);
      if (res.ok) return;
    } catch {}
    console.log(
      `Waiting for registry at ${REGISTRY_URL}... (${i + 1}/${retries})`,
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(
    `Registry not reachable at ${REGISTRY_URL} after ${retries} attempts`,
  );
}

async function ensureGroup(groupId: string) {
  const res = await fetch(`${API}/groups/${groupId}`);
  if (res.ok) return;

  const create = await fetch(`${API}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId }),
  });

  if (!create.ok && create.status !== 409) {
    throw new Error(`Failed to create group ${groupId}: ${create.status}`);
  }
}

async function registerArtifact(artifact: SeedArtifact) {
  await ensureGroup(artifact.groupId);

  const [first, ...rest] = artifact.versions;
  const content = readFileSync(join(SEEDS_DIR, first.file), "utf-8");
  const check = await fetch(
    `${API}/groups/${artifact.groupId}/artifacts/${artifact.artifactId}`,
  );

  if (!check.ok) {
    const res = await fetch(`${API}/groups/${artifact.groupId}/artifacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifactId: artifact.artifactId,
        artifactType: "JSON",
        name: artifact.name,
        labels: artifact.labels,
        firstVersion: {
          version: first.version,
          content: { content, contentType: "application/json" },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Failed to register ${artifact.groupId}/${artifact.artifactId}: ${res.status} ${body}`,
      );
    }
    console.log(
      `${artifact.groupId}/${artifact.artifactId} v${first.version} (created)`,
    );
  } else {
    console.log(
      `${artifact.groupId}/${artifact.artifactId} v${first.version} (already exists)`,
    );
  }

  for (const ver of rest) {
    const verCheck = await fetch(
      `${API}/groups/${artifact.groupId}/artifacts/${artifact.artifactId}/versions/${ver.version}`,
    );
    if (verCheck.ok) {
      console.log(
        `${artifact.groupId}/${artifact.artifactId} v${ver.version} (already exists)`,
      );
      continue;
    }

    const verContent = readFileSync(join(SEEDS_DIR, ver.file), "utf-8");
    const res = await fetch(
      `${API}/groups/${artifact.groupId}/artifacts/${artifact.artifactId}/versions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: ver.version,
          content: { content: verContent, contentType: "application/json" },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Failed to register ${artifact.groupId}/${artifact.artifactId} v${ver.version}: ${res.status} ${body}`,
      );
    }
    console.log(
      `${artifact.groupId}/${artifact.artifactId} v${ver.version} (created)`,
    );
  }
}

async function main() {
  console.log("Seeding Apicurio Schema Registry...\n");
  await waitForRegistry();

  let totalVersions = 0;
  for (const artifact of SEED_ARTIFACTS) {
    await registerArtifact(artifact);
    totalVersions += artifact.versions.length;
  }

  console.log(
    `\nDone — ${SEED_ARTIFACTS.length} artifact(s), ${totalVersions} version(s) seeded.`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
