import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceRoot = path.resolve(projectRoot, "../pinky-ne-site");
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

await mkdir(outputRoot, { recursive: true });

let cursor = 0;
async function worker() {
  while (cursor < assets.length) {
    const index = cursor;
    cursor += 1;
    const asset = assets[index];
    const inputPath = path.join(tempRoot, `${index}.png`);
    const outputPath = path.join(outputRoot, `${asset.id}.webp`);
    const { stdout } = await run(
      "git",
      ["-C", sourceRoot, "show", `${sourceCommit}:${asset.sourcePath}`],
      {
        encoding: "buffer",
        maxBuffer: 40 * 1024 * 1024,
      },
    );
    await writeFile(inputPath, stdout);
    const isRabbitTurtleCharacter =
      asset.type === "character" && asset.story === "토끼와 자라";
    const isUnifiedFullBody =
      isRabbitTurtleCharacter && asset.sourcePath.includes("_unified_720x900");

    if (isRabbitTurtleCharacter && !isUnifiedFullBody) {
      // 표정·동작 자료는 상반신 크기와 투명 여백이 서로 다르다.
      // 실제 그림을 같은 500px 영역 안에 맞추고 시작 높이를 통일한 뒤
      // 720×900 캔버스에 놓아, 편집·미리보기·플레이에서 갑작스러운
      // 클로즈업과 인물마다 달라지는 머리 위치를 줄인다.
      await run("magick", [
        inputPath,
        "-auto-orient",
        "-strip",
        "-trim",
        "+repage",
        "-resize",
        "500x500",
        "-gravity",
        "north",
        "-background",
        "none",
        "-extent",
        "720x600",
        "-gravity",
        "south",
        "-extent",
        "720x900",
        "-quality",
        "86",
        "-define",
        "webp:method=6",
        outputPath,
      ]);
    } else {
      await run("magick", [
        inputPath,
        "-auto-orient",
        "-strip",
        "-resize",
        asset.type === "character" ? "720x900>" : "1600x900>",
        "-quality",
        asset.type === "character" ? "86" : "82",
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
