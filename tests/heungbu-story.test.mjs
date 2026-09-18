import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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
      import { getHeungbuProject } from './app/story-heungbu.ts';
      import { STORY_ASSETS as assets } from './app/story-assets.ts';
      import { resolveStoryStage } from './app/story-stage-view.ts';
      const project = getHeungbuProject();
      console.log(JSON.stringify({
        project,
        assets,
        stages: project.lines.map(line =>
          resolveStoryStage(project.chapters.find(c => c.id === line.chapterId), line)
        )
      }));
      `,
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  )
);

test("흥부와 놀부 9종 캐릭터 자산은 800x1200 규격, 투명도, 바닥선 y=1149를 만족한다", async () => {
  const { default: sharp } = await import("sharp");
  const heungbuAssets = assets.filter((a) => a.story === "흥부와 놀부" && a.type === "character");
  assert.equal(heungbuAssets.length, 9);

  for (const asset of heungbuAssets) {
    const filePath = `public${asset.src}`;
    assert.ok(existsSync(filePath), `자산 파일 존재 확인: ${filePath}`);

    const metadata = await sharp(filePath).metadata();
    assert.equal(metadata.width, 800, `${asset.id} 너비 800px`);
    assert.equal(metadata.height, 1200, `${asset.id} 높이 1200px`);
    assert.ok(metadata.hasAlpha, `${asset.id} 알파 채널 존재`);

    const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let top = info.height;
    let bottom = -1;
    let left = info.width;
    let right = -1;
    let transparent = 0;

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alpha = data[(y * info.width + x) * 4 + 3];
        if (alpha === 0) transparent++;
        if (alpha >= 26) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
      }
    }

    assert.ok(transparent > 800 * 1200 * 0.3, `${asset.id} 투명 배경 비율 30% 초과`);
    assert.ok(Math.abs(bottom - 1149) <= 3, `${asset.id} 바닥선 접지 오차 3px 이내 (actual: ${bottom})`);
    assert.ok(top >= 120 && left >= 30 && right <= 770, `${asset.id} 안전 여백 준수`);
  }
});

test("흥부와 놀부 프로젝트는 14장 277컷과 2회 분기 구조를 완벽히 유지한다", () => {
  assert.equal(project.id, "heungbu-nolbu-nolstory");
  assert.equal(project.chapters.length, 14);
  assert.equal(project.lines.length, 277);

  // 분기 컷 검증
  const branch1 = project.lines.find((l) => l.id === "scene-4-23");
  assert.ok(branch1?.flow);
  assert.equal(branch1.flow.options.length, 2);
  assert.equal(branch1.flow.options[0].targetLineId, "scene-5a-1");
  assert.equal(branch1.flow.options[1].targetLineId, "scene-5b-1");

  const branch2 = project.lines.find((l) => l.id === "scene-11-28");
  assert.ok(branch2?.flow);
  assert.equal(branch2.flow.options.length, 2);
  assert.equal(branch2.flow.options[0].targetLineId, "scene-12a-1");
  assert.equal(branch2.flow.options[1].targetLineId, "scene-12b-1");
});

test("원작의 모든 배경과 인물은 유효한 로컬 자산에 매핑된다", () => {
  const byId = new Map(assets.map((a) => [a.id, a]));

  for (const [i, line] of project.lines.entries()) {
    const stage = stages[i];
    assert.ok(stage.background.src, `Line ${line.id} 배경 src 존재`);

    for (const key of ["backgroundId", "leftAssetId", "rightAssetId"]) {
      const assetId = line[key];
      if (!assetId) continue;
      const asset = byId.get(assetId);
      assert.ok(asset, `Line ${line.id}의 ${key} (${assetId}) 자산이 카탈로그에 등록되어 있어야 함`);
      assert.ok(existsSync(`public${asset.src}`), `파일이 public에 실존해야 함: ${asset.src}`);
    }

    assert.equal(stage.left.id, line.leftAssetId);
    assert.equal(stage.right.id, line.rightAssetId);
  }
});

test("1장은 어린 시절 전용 자산, 이후 본편은 성인 및 아내 자산이 적절히 배치된다", () => {
  const ch1Lines = project.lines.filter((l) => l.chapterId === "chapter-1");
  assert.ok(ch1Lines.some((l) => l.leftAssetId === "heungbu.character.heungbu-young"));
  assert.ok(ch1Lines.some((l) => l.rightAssetId === "heungbu.character.nolbu-young"));
  assert.ok(!ch1Lines.some((l) => l.leftAssetId === "heungbu.character.heungbu-default"));

  const ch8Lines = project.lines.filter((l) => l.chapterId === "chapter-8");
  assert.ok(ch8Lines.every((l) => l.leftAssetId === "heungbu.character.nolbu-default"));
  assert.ok(ch8Lines.every((l) => l.rightAssetId === "heungbu.character.wife-nolbu"));

  const ch6Lines = project.lines.filter((l) => l.chapterId === "chapter-6");
  assert.ok(ch6Lines.every((l) => l.leftAssetId === "heungbu.character.heungbu-default"));
  assert.ok(ch6Lines.every((l) => l.rightAssetId === "heungbu.character.wife-heungbu"));

  // 감정·상황 변형 자산 3종(간절함, 기쁨, 호통) 실사용 검증
  const pleadingLines = project.lines.filter((l) => l.leftAssetId === "heungbu.character.heungbu-pleading");
  assert.ok(pleadingLines.length >= 10, "간절한 흥부 자산 10회 이상 실사용");

  const happyLines = project.lines.filter((l) => l.leftAssetId === "heungbu.character.heungbu-happy");
  assert.ok(happyLines.length >= 10, "기쁜 흥부 자산 10회 이상 실사용");

  const angryLines = project.lines.filter(
    (l) => l.leftAssetId === "heungbu.character.nolbu-angry" || l.rightAssetId === "heungbu.character.nolbu-angry"
  );
  assert.ok(angryLines.length >= 10, "호통치는 놀부 자산 10회 이상 실사용");
});

test("흥부와 놀부 프로젝트는 문서(JSON) 직렬화 및 역직렬화가 완벽히 동작한다", () => {
  const result = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--disable-warning=ExperimentalWarning",
        "--experimental-strip-types",
        "--experimental-loader=./tests/node-types-loader.mjs",
        "--input-type=module",
        "-e",
        `
        import { getHeungbuProject } from './app/story-heungbu.ts';
        import { createStoryDocument, parseStoryDocument } from './app/story-project-document.ts';
        const project = getHeungbuProject();
        const doc = createStoryDocument({
          project,
          savedAt: '2026-09-18T00:00:00.000Z',
          appVersion: 'test',
        });
        const parsed = parseStoryDocument(doc);
        console.log(JSON.stringify({ ok: parsed.ok, lineCount: parsed.ok ? parsed.document.project.lines.length : 0 }));
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" }
    )
  );
  assert.ok(result.ok);
  assert.equal(result.lineCount, 277);
});

test("흥부와 놀부 프로젝트는 엑셀 워크북 생성 및 가져오기(Roundtrip) 시 손실이 없다", () => {
  const result = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--disable-warning=ExperimentalWarning",
        "--experimental-strip-types",
        "--experimental-loader=./tests/node-types-loader.mjs",
        "--input-type=module",
        "-e",
        `
        import { getHeungbuProject } from './app/story-heungbu.ts';
        import { STORY_ASSETS } from './app/story-assets.ts';
        import { createStoryWorkbook, readStoryWorkbook } from './app/story-workbook.ts';
        import { importStoryProject } from './app/story-sheet.ts';
        const project = getHeungbuProject();
        const wb = createStoryWorkbook(project, STORY_ASSETS);
        const buffer = await wb.xlsx.writeBuffer();
        const snapshot = await readStoryWorkbook(new File([buffer], 'heungbu-test.xlsx'));
        const imported = importStoryProject(snapshot, '');
        console.log(JSON.stringify({
          ok: imported.ok,
          title: imported.ok ? imported.project.title : '',
          lineCount: imported.ok ? imported.project.lines.length : 0,
          chapterCount: imported.ok ? imported.project.chapters.length : 0,
        }));
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" }
    )
  );
  assert.ok(result.ok);
  assert.equal(result.title, project.title);
  assert.equal(result.lineCount, 277);
  assert.equal(result.chapterCount, 14);
});


