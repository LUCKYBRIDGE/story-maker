import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateAsset,
  measureAlphaMask,
  renderAuditJson,
  renderAuditMarkdown,
  resolveAuditTargets,
} from "../scripts/character-asset-audit-lib.mjs";

const canvas = {
  width: 800,
  height: 1200,
  alphaThreshold: 26,
  groundY: 1149,
  groundPassPx: 3,
  groundReviewPx: 6,
  centerPassPx: 12,
  centerReviewPx: 20,
  eyePassPx: 12,
  eyeReviewPx: 24,
  scalePassPercent: 3,
  scaleReviewPercent: 5,
};

function createMask(rectangles) {
  const alpha = new Uint8Array(canvas.width * canvas.height);
  for (const rectangle of rectangles) {
    for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += 1) {
      for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += 1) {
        alpha[y * canvas.width + x] = 255;
      }
    }
  }
  return alpha;
}

function makeTarget({ id, rectangles, landmarks, coreRowMinPixels = 100 }) {
  return {
    id,
    legacy: false,
    landmarks,
    metrics: {
      width: canvas.width,
      height: canvas.height,
      channels: "srgba",
      hasAlpha: true,
      sha256: id,
      alpha: measureAlphaMask({
        width: canvas.width,
        height: canvas.height,
        alpha: createMask(rectangles),
        alphaThreshold: canvas.alphaThreshold,
        coreRowMinPixels,
      }),
    },
  };
}

const normalLandmarks = {
  eyeY: 320,
  shoulderY: 410,
  headTopY: 220,
  headBottomY: 390,
  bodyTopY: 220,
  bodyBottomY: 1149,
  bodyCenterX: 400,
};

test("정상 fixture는 기준본과 같은 앵커일 때 KEEP이다", () => {
  const rectangles = [{ x: 300, y: 200, width: 200, height: 950 }];
  const reference = makeTarget({ id: "reference", rectangles, landmarks: normalLandmarks });
  const target = makeTarget({ id: "normal", rectangles, landmarks: normalLandmarks });

  const result = evaluateAsset({ target, reference, canvas });

  assert.equal(result.decision, "KEEP");
  assert.equal(result.comparison.groundDelta, 0);
  assert.equal(result.comparison.bodyCenterDelta, 0);
  assert.equal(result.comparison.coreHeightPercent, 0);
  assert.equal(result.comparison.headBodyRatioPercent, 0);
});

test("발선과 몸 중심 오류는 비율 변경 없이 평행이동 후보로 잡는다", () => {
  const reference = makeTarget({
    id: "reference",
    rectangles: [{ x: 300, y: 200, width: 200, height: 950 }],
    landmarks: normalLandmarks,
  });
  const target = makeTarget({
    id: "translated",
    rectangles: [{ x: 350, y: 190, width: 200, height: 950 }],
    landmarks: { ...normalLandmarks, eyeY: 310, shoulderY: 400, bodyCenterX: 450 },
  });

  const result = evaluateAsset({ target, reference, canvas });

  assert.equal(result.decision, "NORMALIZE-TRANSLATE");
  assert.equal(result.comparison.groundDelta, -10);
  assert.equal(result.comparison.bodyCenterDelta, 50);
});

test("머리/몸 비율이 다른 fixture는 균일 보정 대신 재생성 검토다", () => {
  const rectangles = [{ x: 300, y: 200, width: 200, height: 950 }];
  const reference = makeTarget({ id: "reference", rectangles, landmarks: normalLandmarks });
  const target = makeTarget({
    id: "large-head",
    rectangles,
    landmarks: { ...normalLandmarks, headTopY: 150, headBottomY: 410 },
  });

  const result = evaluateAsset({ target, reference, canvas });

  assert.equal(result.decision, "REFERENCE-REMAKE");
  assert.ok(result.reasons.some((reason) => reason.code === "head-body-fail"));
});

test("캔버스 가장자리에 닿은 fixture는 잘림 오류로 거부한다", () => {
  const reference = makeTarget({
    id: "reference",
    rectangles: [{ x: 300, y: 200, width: 200, height: 950 }],
    landmarks: normalLandmarks,
  });
  const target = makeTarget({
    id: "clipped",
    rectangles: [{ x: 0, y: 200, width: 200, height: 950 }],
    landmarks: { ...normalLandmarks, bodyCenterX: 100 },
  });

  const result = evaluateAsset({ target, reference, canvas });

  assert.equal(result.decision, "REJECT");
  assert.ok(result.reasons.some((reason) => reason.code === "edge-clipping"));
});

test("토끼 귀와 새우 더듬이처럼 가는 동적 외곽은 중심 신체 높이에 포함하지 않는다", () => {
  const body = { x: 300, y: 300, width: 200, height: 850 };
  const reference = makeTarget({
    id: "reference",
    rectangles: [body, { x: 340, y: 120, width: 20, height: 180 }],
    landmarks: normalLandmarks,
    coreRowMinPixels: 100,
  });
  const target = makeTarget({
    id: "long-antenna",
    rectangles: [body, { x: 180, y: 20, width: 15, height: 280 }],
    landmarks: normalLandmarks,
    coreRowMinPixels: 100,
  });

  assert.notEqual(reference.metrics.alpha.bbox.height, target.metrics.alpha.bbox.height);
  assert.equal(reference.metrics.alpha.coreHeight, target.metrics.alpha.coreHeight);
  assert.equal(evaluateAsset({ target, reference, canvas }).decision, "KEEP");
});

test("등록 캐릭터가 앵커 설정에서 빠지면 Audit을 시작하지 않는다", () => {
  const config = {
    groups: [
      {
        id: "known",
        label: "알려진 인물",
        referenceId: "known-asset",
        selectors: [{ story: "토끼와 자라", groups: ["토끼"], framing: "전신" }],
      },
    ],
  };
  const assets = [
    { id: "known-asset", story: "토끼와 자라", group: "토끼", framing: "전신", type: "character", src: "/known.webp" },
    { id: "new-asset", story: "토끼와 자라", group: "새 인물", framing: "전신", type: "character", src: "/new.webp" },
  ];

  assert.throws(
    () => resolveAuditTargets({ projectRoot: "/tmp", config, assets }),
    /앵커 설정에 없는 등록 캐릭터 자산: new-asset/,
  );
});

test("JSON과 Markdown 보고서는 실행 시각 없이 결정적으로 렌더링된다", () => {
  const report = {
    inputDigest: "abc",
    standard: canvas,
    summary: {
      total: 0,
      registered: 0,
      candidates: 0,
      counts: {
        KEEP: 0,
        "NORMALIZE-TRANSLATE": 0,
        "NORMALIZE-UNIFORM-SCALE": 0,
        "MANUAL-REVIEW": 0,
        "REFERENCE-REMAKE": 0,
        REJECT: 0,
        LEGACY: 0,
      },
    },
    results: [],
  };

  assert.equal(renderAuditJson(report), renderAuditJson(report));
  assert.equal(renderAuditMarkdown(report), renderAuditMarkdown(report));
  assert.doesNotMatch(renderAuditJson(report), /generatedAt|2026-/);
});
