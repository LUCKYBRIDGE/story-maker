import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditCharacterAssets,
  readStoryAssets,
  renderAuditJson,
  renderAuditMarkdown,
} from "./character-asset-audit-lib.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(projectRoot, "scripts/character-asset-anchors.json");
const jsonReportPath = path.join(projectRoot, "docs/qa/character-asset-audit.json");
const markdownReportPath = path.join(projectRoot, "docs/qa/character-asset-audit.md");

try {
  await access(configPath);
  const [configText, assets] = await Promise.all([
    readFile(configPath, "utf8"),
    readStoryAssets(path.join(projectRoot, "app/story-assets.ts")),
  ]);
  const config = JSON.parse(configText);
  const report = await auditCharacterAssets({ projectRoot, config, assets });
  await mkdir(path.dirname(jsonReportPath), { recursive: true });
  await Promise.all([
    writeFile(jsonReportPath, renderAuditJson(report), "utf8"),
    writeFile(markdownReportPath, renderAuditMarkdown(report), "utf8"),
  ]);
  console.log(
    `Character asset audit: ${report.summary.total} files, ` +
      `${report.summary.counts.KEEP} KEEP, ` +
      `${report.summary.counts["MANUAL-REVIEW"]} MANUAL-REVIEW, ` +
      `${report.summary.counts.REJECT} REJECT.`,
  );
  console.log(path.relative(projectRoot, markdownReportPath));
  console.log(path.relative(projectRoot, jsonReportPath));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Character asset audit failed: ${message}`);
  process.exitCode = 1;
}
