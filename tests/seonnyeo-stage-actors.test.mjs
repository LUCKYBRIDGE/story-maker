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
      import { SEONNYEO_CLASSIC_READING as project } from './app/story-classic-seonnyeo.ts';
      console.log(JSON.stringify({ project }));
      `,
    ],
    { cwd: process.cwd(), encoding: "utf8" }
  )
);

const SPEAKER_ACTOR_MAP = {
  "나무꾼": [
    "M02-neutral",
    "M02-axe",
    "M02-surprised",
    "M02-sad",
    "M02-honest",
    "M02-dry-smile",
    "classic-woodcutter-holding-robe",
    "classic-woodcutter-in-bucket",
    "classic-woodcutter-riding-horse",
    "classic-horse-startled-by-porridge",
    "classic-woodcutter-fallen",
    "classic-woodcutter-aged",
  ],
  "선녀": [
    "M01-base",
    "M01-base-guarded",
    "M01-celestial",
    "M01-celestial-resolve",
    "M01-celestial-warm",
    "classic-fairy-carrying-children",
    "classic-fairy-holding-first-baby",
  ],
  "사슴": ["classic-deer"],
  "사냥꾼": ["classic-hunter"],
  "어머니": ["classic-mother", "classic-mother-offering-porridge"],
};

function getShortAssetId(assetId) {
  if (!assetId) return "";
  return assetId.replace("seonnyeo.character.", "");
}

function getCharacterBaseName(assetId) {
  if (!assetId) return "";
  const s = getShortAssetId(assetId);
  if (s.startsWith("M02") || s.includes("woodcutter") || s === "classic-horse-startled-by-porridge") return "나무꾼";
  if (s.startsWith("M01") || s.includes("fairy")) return "선녀";
  if (s.includes("deer")) return "사슴";
  if (s.includes("hunter")) return "사냥꾼";
  if (s.includes("mother")) return "어머니";
  if (s.includes("children")) return "아이들";
  if (s.includes("celestial-horse")) return "용마";
  if (s.includes("robe")) return "날개옷";
  if (s.includes("bucket")) return "두레박";
  if (s.includes("rooster")) return "수탉";
  return s;
}

test("검증 A: 대사(dialogue) 컷의 화자는 화면에 반드시 배치되어야 한다", () => {
  const missing = [];

  for (const line of project.lines) {
    if (line.type !== "dialogue") continue;

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
      for (const target of ["나무꾼", "선녀", "사슴", "사냥꾼", "어머니", "아이들", "용마", "수탉"]) {
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

test("검증 E: 5장 10~13컷 대화 상대 정합성 — 선녀의 당부 대사 청자는 용마가 아닌 나무꾼이어야 한다", () => {
  const ch5Lines = project.lines.filter((l) => l.chapterId === "classic-seonnyeo-5");

  // 10컷: 선녀가 용마를 마련함 (용마 소개 컷 유지)
  const cut10 = ch5Lines.find((l) => l.order === 10);
  assert.equal(getShortAssetId(cut10.leftAssetId), "classic-celestial-horse", "10컷은 용마 소개 컷");
  assert.equal(getShortAssetId(cut10.rightAssetId), "M01-celestial", "10컷 오른쪽은 선녀");

  // 11컷: 선녀의 첫 번째 당부 (대화 상대는 나무꾼이어야 함)
  const cut11 = ch5Lines.find((l) => l.order === 11);
  assert.equal(cut11.type, "dialogue");
  assert.equal(cut11.speaker, "right");
  assert.equal(cut11.speakerName, "선녀");
  assert.equal(getShortAssetId(cut11.leftAssetId), "M02-honest", "11컷 왼쪽 청자는 나무꾼(M02-honest)이어야 함");
  assert.equal(getShortAssetId(cut11.rightAssetId), "M01-celestial", "11컷 오른쪽 화자는 선녀");

  // 12컷: 선녀의 두 번째 당부 (대화 상대는 나무꾼이어야 함)
  const cut12 = ch5Lines.find((l) => l.order === 12);
  assert.equal(cut12.type, "dialogue");
  assert.equal(cut12.speaker, "right");
  assert.equal(cut12.speakerName, "선녀");
  assert.equal(getShortAssetId(cut12.leftAssetId), "M02-honest", "12컷 왼쪽 청자는 나무꾼(M02-honest)이어야 함");
  assert.equal(getShortAssetId(cut12.rightAssetId), "M01-celestial", "12컷 오른쪽 화자는 선녀");

  // 13컷: 나무꾼의 응답 (나무꾼이 선녀에게 대답)
  const cut13 = ch5Lines.find((l) => l.order === 13);
  assert.equal(cut13.type, "dialogue");
  assert.equal(cut13.speaker, "left");
  assert.equal(cut13.speakerName, "나무꾼");
  assert.equal(getShortAssetId(cut13.leftAssetId), "M02-honest", "13컷 왼쪽 화자는 나무꾼(M02-honest)");
  assert.equal(getShortAssetId(cut13.rightAssetId), "M01-celestial", "13컷 오른쪽 청자는 선녀");
});

test("검증 F: 의도적인 단독/독백/회상/서사 연출 컷이 과잉 검증으로 깨지지 않고 보존되어야 한다", () => {
  const findLine = (chapterNum, order) =>
    project.lines.find((l) => l.chapterId === `classic-seonnyeo-${chapterNum}` && l.order === order);

  // 1장 10컷: 사슴이 연못의 비밀을 처음 설명하는 단독 발화 강조 연출
  const ch1Cut10 = findLine(1, 10);
  assert.equal(ch1Cut10.leftAssetId, "", "1장 10컷은 사슴 단독 강조 연출 (왼쪽 비움)");
  assert.equal(getShortAssetId(ch1Cut10.rightAssetId), "classic-deer");

  // 2장 9컷: 날개옷을 잃은 선녀의 당황한 독백 연출
  const ch2Cut9 = findLine(2, 9);
  assert.equal(ch2Cut9.leftAssetId, "", "2장 9컷은 선녀 독백 연출 (왼쪽 비움)");
  assert.equal(getShortAssetId(ch2Cut9.rightAssetId), "M01-base-guarded");

  // 3장 6컷: 사슴의 금기 경고 회상 연출
  const ch3Cut6 = findLine(3, 6);
  assert.equal(ch3Cut6.leftAssetId, "", "3장 6컷은 사슴 회상 연출 (왼쪽 비움)");
  assert.equal(getShortAssetId(ch3Cut6.rightAssetId), "classic-deer");

  // 4장 11컷: 사슴이 두레박 해결책을 처음 설명하는 단독 강조 연출
  const ch4Cut11 = findLine(4, 11);
  assert.equal(ch4Cut11.leftAssetId, "", "4장 11컷은 사슴 단독 두레박 설명 연출 (왼쪽 비움)");
  assert.equal(getShortAssetId(ch4Cut11.rightAssetId), "classic-deer");

  // 5장 7컷: 하늘나라 가족 생활 몽타주 컷
  const ch5Cut7 = findLine(5, 7);
  assert.equal(getShortAssetId(ch5Cut7.leftAssetId), "classic-children", "5장 7컷은 아이들과 선녀 가족 몽타주");
  assert.equal(getShortAssetId(ch5Cut7.rightAssetId), "M01-celestial-warm");

  // 6장 21~23컷: 시간적/서사적 단절 후 마지막 수탉 유래담 단독 연출
  for (const order of [21, 22, 23]) {
    const cut = findLine(6, order);
    assert.equal(cut.leftAssetId, "", `6장 ${order}컷은 수탉 단독 연출 (왼쪽 비움)`);
    assert.equal(getShortAssetId(cut.rightAssetId), "classic-rooster-calling-sky", `6장 ${order}컷 오른쪽은 수탉`);
  }
});
