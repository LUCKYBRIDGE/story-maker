import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const { project } = JSON.parse(
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
      const project = getHeungbuProject();
      console.log(JSON.stringify({ project }));
      `,
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  )
);

const SPEAKER_ACTOR_MAP = {
  "흥부": ["heungbu-default", "heungbu-young", "heungbu-pleading", "heungbu-happy"],
  "놀부": ["nolbu-default", "nolbu-young", "nolbu-angry", "nolbu-remorse"],
  "흥부 아내": ["wife-heungbu", "wife-heungbu-worried"],
  "놀부 아내": ["wife-nolbu", "wife-nolbu-shocked"],
  "아이": ["children"],
  "아이들": ["children"],
  "아이 1": ["children"],
  "아이 2": ["children"],
  "막내": ["children"],
  "첫째": ["children"],
  "둘째": ["children"],
  "제비": ["swallow"],
  "이웃": ["neighbor"],
  // 전용 캐릭터 자산이 없는 인물
  "아버지": [],
  "어머니": [],
};

function getShortAssetId(assetId) {
  if (!assetId) return "";
  return assetId.replace("heungbu.character.", "");
}

function getCharacterBaseName(assetId) {
  if (!assetId) return "";
  const s = getShortAssetId(assetId);
  if (s.startsWith("heungbu")) return "흥부";
  if (s.startsWith("nolbu")) return "놀부";
  if (s.startsWith("wife-heungbu")) return "흥부아내";
  if (s.startsWith("wife-nolbu")) return "놀부아내";
  if (s === "children") return "아이들";
  if (s === "swallow") return "제비";
  if (s === "neighbor") return "이웃";
  return s;
}

test("검증 A: 대사(dialogue) 컷의 화자는 화면에 반드시 배치되어야 한다 (부모 대사는 예외 처리)", () => {
  const missing = [];

  for (const line of project.lines) {
    if (line.type !== "dialogue") continue;

    // 부모 캐릭터는 전용 자산이 없어 해설 처리 대상임
    if (line.speakerName === "아버지" || line.speakerName === "어머니") {
      assert.equal(
        line.speaker,
        "narration",
        `부모 대사 ${line.id}(${line.speakerName})는 놀부나 흥부가 말하는 것으로 오인되지 않도록 speaker: 'narration'이어야 함`
      );
      continue;
    }

    const shortLeft = getShortAssetId(line.leftAssetId);
    const shortRight = getShortAssetId(line.rightAssetId);
    const allowed = SPEAKER_ACTOR_MAP[line.speakerName] || [];

    const leftMatch = allowed.some((key) => shortLeft.includes(key));
    const rightMatch = allowed.some((key) => shortRight.includes(key));

    if (!leftMatch && !rightMatch) {
      missing.push({
        id: line.id,
        speakerName: line.speakerName,
        left: shortLeft,
        right: shortRight,
        text: line.text.slice(0, 30),
      });
    }
  }

  assert.deepEqual(missing, [], `화자 자산이 누락된 dialogue 컷이 없어야 함: ${JSON.stringify(missing)}`);
});

test("검증 B: 화자의 좌우 위치와 line.speaker(left/right) 방향이 완벽히 일치해야 한다", () => {
  const mismatches = [];

  for (const line of project.lines) {
    if (line.type !== "dialogue") continue;
    if (line.speakerName === "아버지" || line.speakerName === "어머니") continue;

    const shortLeft = getShortAssetId(line.leftAssetId);
    const shortRight = getShortAssetId(line.rightAssetId);
    const allowed = SPEAKER_ACTOR_MAP[line.speakerName] || [];

    const leftMatch = allowed.some((key) => shortLeft.includes(key));
    const rightMatch = allowed.some((key) => shortRight.includes(key));

    if (line.speaker === "left" && !leftMatch && rightMatch) {
      mismatches.push({
        id: line.id,
        speakerName: line.speakerName,
        currentSpeaker: line.speaker,
        expectedSpeaker: "right",
        left: shortLeft,
        right: shortRight,
      });
    } else if (line.speaker === "right" && !rightMatch && leftMatch) {
      mismatches.push({
        id: line.id,
        speakerName: line.speakerName,
        currentSpeaker: line.speaker,
        expectedSpeaker: "left",
        left: shortLeft,
        right: shortRight,
      });
    }
  }

  assert.deepEqual(mismatches, [], `화자 방향과 캐릭터 위치가 불일치하는 컷이 없어야 함: ${JSON.stringify(mismatches)}`);
});

test("검증 C: 3컷 이내의 불필요한 동일 인물 좌우 순간이동(L->R->L 또는 R->L->R)이 없어야 한다", () => {
  const bounces = [];

  for (const chapter of project.chapters) {
    const lines = project.lines.filter((l) => l.chapterId === chapter.id);

    for (let i = 0; i < lines.length - 2; i++) {
      for (const target of ["흥부", "놀부", "흥부아내", "놀부아내", "아이들", "제비", "이웃"]) {
        const p0 = getCharacterBaseName(lines[i].leftAssetId) === target ? "L"
          : getCharacterBaseName(lines[i].rightAssetId) === target ? "R" : "-";
        const p1 = getCharacterBaseName(lines[i + 1].leftAssetId) === target ? "L"
          : getCharacterBaseName(lines[i + 1].rightAssetId) === target ? "R" : "-";
        const p2 = getCharacterBaseName(lines[i + 2].leftAssetId) === target ? "L"
          : getCharacterBaseName(lines[i + 2].rightAssetId) === target ? "R" : "-";

        if ((p0 === "L" && p1 === "R" && p2 === "L") || (p0 === "R" && p1 === "L" && p2 === "R")) {
          bounces.push({
            chapterId: chapter.id,
            cuts: [lines[i].order, lines[i + 1].order, lines[i + 2].order],
            char: target,
            pattern: `${p0} -> ${p1} -> ${p2}`,
          });
        }
      }
    }
  }

  assert.deepEqual(bounces, [], `3컷 이내에 좌우로 왕복하는 인물이 없어야 함: ${JSON.stringify(bounces)}`);
});

test("검증 D: 연속 컷에서 인물들의 좌우 위치가 단순 반전(A|B -> B|A)되는 의심스러운 배치가 없어야 한다", () => {
  const swaps = [];

  for (const chapter of project.chapters) {
    const lines = project.lines.filter((l) => l.chapterId === chapter.id);

    for (let i = 1; i < lines.length; i++) {
      const prevLeft = getCharacterBaseName(lines[i - 1].leftAssetId);
      const prevRight = getCharacterBaseName(lines[i - 1].rightAssetId);
      const currLeft = getCharacterBaseName(lines[i].leftAssetId);
      const currRight = getCharacterBaseName(lines[i].rightAssetId);

      if (prevLeft && prevRight && currLeft && currRight) {
        if (prevLeft === currRight && prevRight === currLeft && prevLeft !== prevRight) {
          swaps.push({
            chapterId: chapter.id,
            cut: lines[i].order,
            prev: `${prevLeft} | ${prevRight}`,
            curr: `${currLeft} | ${currRight}`,
          });
        }
      }
    }
  }

  assert.deepEqual(swaps, [], `연속 컷에서 좌우 단순 반전이 발생하지 않아야 함: ${JSON.stringify(swaps)}`);
});

test("무대 공간 연속성: 10장 19컷의 서사적 1인 단독 연출을 제외하고 불필요한 단발성 빈 슬롯이 없어야 한다", () => {
  const solitaryCuts = [];

  for (const line of project.lines) {
    // 10장 19컷: 놀부가 마당에서 홀로 제비를 떠올리는 의도된 1인 연출
    if (line.id === "scene-10-19") {
      assert.ok(line.leftAssetId && !line.rightAssetId, "10장 19컷은 의도된 놀부 단독 컷");
      continue;
    }

    if (!line.leftAssetId || !line.rightAssetId) {
      solitaryCuts.push({
        id: line.id,
        left: line.leftAssetId,
        right: line.rightAssetId,
        type: line.type,
      });
    }
  }

  assert.deepEqual(solitaryCuts, [], `의도되지 않은 단발성 빈 슬롯이 없어야 함: ${JSON.stringify(solitaryCuts)}`);
});
