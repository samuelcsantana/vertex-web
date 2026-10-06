import { spawnSync } from "node:child_process";

const ALLOWLIST = new Map([
  [
    "GHSA-vfj7-8cjw-p6xm",
    "braces <= 3.0.3 (CVE-2026-93687): stack exhaustion on deeply nested " +
      "brace patterns, no patched release as of 2026-10-05. Reached only " +
      "through dev tooling (the shadcn CLI and eslint-config-next, via " +
      "fast-glob and micromatch), which expands glob patterns written in this " +
      "repo's own config and commands. `npm audit --omit=dev` does not report it.",
  ],
]);

const BLOCKING_SEVERITIES = new Set(["high", "critical"]);

const result = spawnSync("npm audit --json", { encoding: "utf8", shell: true });

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error(result.stderr || result.stdout || "npm audit produced no output");
  process.exit(1);
}

if (report.error) {
  console.error(`npm audit failed: ${report.error.summary ?? JSON.stringify(report.error)}`);
  process.exit(1);
}

const advisories = new Map();
for (const [name, vulnerability] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via) {
    if (typeof via !== "object" || !BLOCKING_SEVERITIES.has(via.severity)) continue;

    const id = via.url?.split("/").pop() ?? String(via.source);
    const entry = advisories.get(id) ?? { title: via.title, severity: via.severity, packages: new Set() };
    entry.packages.add(name);
    advisories.set(id, entry);
  }
}

const blocking = [];
for (const [id, advisory] of advisories) {
  const packages = [...advisory.packages].join(", ");
  if (ALLOWLIST.has(id)) {
    console.log(`allowed ${advisory.severity} ${id} (${packages}): ${ALLOWLIST.get(id)}`);
  } else {
    blocking.push(`${advisory.severity} ${id} (${packages}): ${advisory.title}`);
  }
}

for (const id of ALLOWLIST.keys()) {
  if (!advisories.has(id)) {
    console.log(`::notice::${id} is no longer reported by npm audit; remove it from scripts/audit.mjs.`);
  }
}

if (blocking.length > 0) {
  console.error(`${blocking.length} high/critical advisor${blocking.length === 1 ? "y" : "ies"} not allowlisted:`);
  for (const line of blocking) console.error(`  ${line}`);
  process.exit(1);
}

console.log("No high or critical advisories outside the allowlist.");
