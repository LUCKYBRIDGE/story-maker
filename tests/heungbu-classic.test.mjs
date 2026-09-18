import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import test from "node:test";

const { project, assets, stages } = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
      import { HEUNGBU_CLASSIC_READING as project, getClassicReading } from './app/story-classic-readings.ts';
      import { STORY_ASSETS as assets } from './app/story-assets.ts';
      import { resolveStoryStage } from './app/story-stage-view.ts';
      const resolvedProject = getClassicReading('heungbu');
      console.log(JSON.stringify({
        project: resolvedProject,
        assets,
        stages: resolvedProject.lines.map(line =>
          resolveStoryStage(resolvedProject.chapters.find(c => c.id === line.chapterId), line)
        )
      }));
      `,
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  )
);

test("흥부 원작은 7개 장·125컷과 화자·문장·순서를 보존한다", () => {
  assert.equal(project.id, "classic-heungbu-tale");
  assert.equal(project.title, "흥부전");
  assert.deepEqual(
    project.chapters.map((c) => project.lines.filter((l) => l.chapterId === c.id).length),
    [14, 16, 17, 18, 19, 22, 19]
  );
  assert.equal(project.lines.length, 125);

  const prose = project.lines.map(({ chapterId, order, speakerName, text }) => [
    chapterId,
    order,
    speakerName,
    text,
  ]);
  const hash = createHash("sha256").update(JSON.stringify(prose)).digest("hex");
  // Frozen prose hash from canonical user manuscript
  assert.equal(hash, "0bb023b434b1ed861dc792d59064bdf80220c7208d21258fc6595ac22bb58117");

  assert.equal(new Set(project.lines.map((l) => l.id)).size, 125);
  assert.equal(project.sheetEditable, false);
  assert.deepEqual(project.creativeMemos, []);

  for (const line of project.lines) {
    assert.notEqual(line.type, "choice");
    assert.ok(!line.choices?.length);
    assert.ok(project.chapters.some((c) => c.id === line.chapterId));
    if (line.type === "dialogue") {
      assert.ok(project.speakerNames.includes(line.speakerName), `알 수 없는 화자: ${line.speakerName}`);
    }
  }
});

test("흥부 원작의 모든 배경·인물은 로컬 자산에 존재하고 스테이지가 정상 구성된다", () => {
  const byId = new Map(assets.map((a) => [a.id, a]));

  for (const [i, line] of project.lines.entries()) {
    const stage = stages[i];
    assert.ok(stage.background.src, `cut ${i + 1}: background src`);
    assert.equal(stage.background.meaningful, false);

    for (const key of ["backgroundId", "leftAssetId", "rightAssetId"]) {
      const assetId = line[key];
      if (!assetId) continue;
      const asset = byId.get(assetId);
      assert.ok(asset, `cut ${i + 1} 자산 카탈로그 미발견: ${assetId}`);
      assert.ok(existsSync(`public${asset.src}`), `cut ${i + 1} 자산 파일 누락: ${asset.src}`);
    }

    assert.equal(stage.left.id, line.leftAssetId);
    assert.equal(stage.right.id, line.rightAssetId);
  }
});

test("흥부 기획 메타데이터와 표지 설정이 올바르게 반영되었다", () => {
  assert.equal(project.cover.author, "전래 이야기");
  assert.equal(project.cover.subtitle, "흥부와 놀부로 널리 알려진 이야기");
  assert.ok(project.cover.authorNote.includes("현대어로 재구성"));
  assert.equal(project.planning.mainCharacter, "흥부와 놀부");
  assert.equal(project.planning.structureMode, "five");
  assert.ok(project.planning.premise.includes("다친 제비"));
  assert.ok(project.planning.freeNotes.includes("원작 읽기는 분기 없이 선형으로"));
});
