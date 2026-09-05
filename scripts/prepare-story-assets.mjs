import { execFile } from "node:child_process";
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceCandidates = [
  path.resolve(projectRoot, "../pinky-ne-site"),
  path.resolve(projectRoot, "../pinky-ne-site-publish"),
];
const outputRoot = path.join(projectRoot, "public/story-assets");
const manifestText = await readFile(
  path.join(projectRoot, "app/story-assets.ts"),
  "utf8",
);
const sourceCommit =
  manifestText.match(/STORY_ASSET_SOURCE_COMMIT = "([^"]+)"/)?.[1] ?? "";
const declaration = manifestText.indexOf("export const STORY_ASSETS");
const jsonStart = manifestText.indexOf("= [", declaration) + 2;
const jsonEnd = manifestText.lastIndexOf("];");
const assets = JSON.parse(manifestText.slice(jsonStart, jsonEnd + 1));
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "storygame-assets-"));

if (!sourceCommit || assets.length === 0) {
  throw new Error("이미지 목록 또는 원본 버전을 읽지 못했습니다.");
}

async function findSourceRoot() {
  for (const candidate of sourceCandidates) {
    try {
      await run("git", ["-C", candidate, "cat-file", "-e", `${sourceCommit}^{commit}`]);
      return candidate;
    } catch {
      // 다음 후보 저장소를 확인한다.
    }
  }
  throw new Error(
    `원본 커밋 ${sourceCommit}을 포함한 pinky-ne-site 저장소를 찾지 못했습니다.`,
  );
}

async function isCanonicalCharacterAsset(outputPath) {
  try {
    await access(outputPath);
    const { stdout } = await run("magick", [
      "identify",
      "-format",
      "%wx%h %[channels]",
      outputPath,
    ]);
    return stdout.startsWith("800x1200 ") && stdout.includes("a");
  } catch {
    return false;
  }
}

const sourceRoot = await findSourceRoot();

await mkdir(outputRoot, { recursive: true });

let cursor = 0;
async function worker() {
  while (cursor < assets.length) {
    const index = cursor;
    cursor += 1;
    const asset = assets[index];
    const inputPath = path.join(tempRoot, `${index}.png`);
    const outputPath = path.join(outputRoot, `${asset.id}.webp`);
    if (
      asset.type === "character" &&
      (await isCanonicalCharacterAsset(outputPath))
    ) {
      continue;
    }
    const { stdout } = await run(
      "git",
      ["-C", sourceRoot, "show", `${sourceCommit}:${asset.sourcePath}`],
      {
        encoding: "buffer",
        maxBuffer: 40 * 1024 * 1024,
      },
    );
    await writeFile(inputPath, stdout);
    if (asset.type === "character") {
      // 모든 인물은 800×1200 투명 캔버스에 맞춘다. 발끝은 하단에서
      // 50px 위(y=1150)에 놓고, 일반적인 세로 포즈는 머리 위에 약
      // 120px 여백이 남도록 최대 높이를 1030px로 제한한다.
      const targetBox = "780x1030";
      await run("magick", [
        inputPath,
        "-auto-orient",
        "-strip",
        "-trim",
        "+repage",
        "-resize",
        targetBox,
        "-gravity",
        "south",
        "-background",
        "none",
        "-extent",
        "800x1150",
        "-gravity",
        "north",
        "-extent",
        "800x1200",
        "-quality",
        "92",
        "-define",
        "webp:method=6",
        "-define",
        "webp:alpha-quality=100",
        outputPath,
      ]);
    } else {
      await run("magick", [
        inputPath,
        "-auto-orient",
        "-strip",
        "-resize",
        "1600x900>",
        "-quality",
        "82",
        "-define",
        "webp:method=6",
        outputPath,
      ]);
    }
    await rm(inputPath, { force: true });
  }
}

const results = await Promise.allSettled(
  Array.from({ length: 1 }, () => worker()),
);
await rm(tempRoot, { recursive: true, force: true });
const failed = results.find((result) => result.status === "rejected");
if (failed?.status === "rejected") throw failed.reason;

console.log(`Prepared ${assets.length} local WebP assets in ${outputRoot}.`);
