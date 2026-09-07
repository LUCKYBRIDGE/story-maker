import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const NORMALIZATION_SHIFTS = [
  {
    path: "work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-happy.webp",
    shiftX: 21,
    shiftY: 0,
    label: "토끼 기쁨 (중심 맞춤 +21px)",
  },
  {
    path: "work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-serious-report.webp",
    shiftX: 24,
    shiftY: 0,
    label: "새우문관 진지한 보고 (중심 맞춤 +24px)",
  },
  {
    path: "work/story-assets/candidates/character-emotion-additions/turtle/turtle-default.webp",
    shiftX: 17,
    shiftY: 0,
    label: "자라 기본 후보 (중심 맞춤 +17px)",
  },
  {
    path: "work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-worried.webp",
    shiftX: -19,
    shiftY: 0,
    label: "토끼 걱정 후보 (중심 맞춤 -19px)",
  },
];

export async function normalizeCandidates() {
  for (const item of NORMALIZATION_SHIFTS) {
    const fullPath = path.join(projectRoot, item.path);
    const buffer = await readFile(fullPath);
    const shifted = await sharp({
      create: {
        width: 800,
        height: 1200,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: buffer, left: item.shiftX, top: item.shiftY }])
      .webp({ lossless: true })
      .toBuffer();

    await writeFile(fullPath, shifted);
    console.log(`Normalized: ${item.label} (${item.path})`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await normalizeCandidates();
  console.log("Candidate normalization complete.");
}
