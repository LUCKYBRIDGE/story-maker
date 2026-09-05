import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const LANDMARK_KEYS = [
  "eyeY",
  "shoulderY",
  "headTopY",
  "headBottomY",
  "bodyTopY",
  "bodyBottomY",
  "bodyCenterX",
];

const DECISION_WEIGHT = {
  KEEP: 0,
  "NORMALIZE-TRANSLATE": 1,
  "NORMALIZE-UNIFORM-SCALE": 2,
  "MANUAL-REVIEW": 3,
  "REFERENCE-REMAKE": 4,
  REJECT: 5,
  LEGACY: 6,
};

function round(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function percentDifference(value, reference) {
  if (!Number.isFinite(value) || !Number.isFinite(reference) || reference === 0) {
    return null;
  }
  return round(((value - reference) / reference) * 100);
}

function chooseDecision(current, next) {
  return DECISION_WEIGHT[next] > DECISION_WEIGHT[current] ? next : current;
}

function addReason(reasons, code, level, message) {
  reasons.push({ code, level, message });
}

export function measureAlphaMask({
  width,
  height,
  alpha,
  alphaThreshold,
  coreRowMinPixels,
}) {
  if (alpha.length !== width * height) {
    throw new Error(
      `알파 데이터 길이가 캔버스와 다릅니다: ${alpha.length} != ${width * height}`,
    );
  }

  const rowCounts = new Uint32Array(height);
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  let visiblePixels = 0;
  let edgePixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[y * width + x] < alphaThreshold) continue;
      visiblePixels += 1;
      rowCounts[y] += 1;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        edgePixels += 1;
      }
    }
  }

  if (visiblePixels === 0) {
    return {
      visiblePixels: 0,
      bbox: null,
      groundY: null,
      edgePixels: 0,
      coreTopY: null,
      coreHeight: null,
      bodyCenterX: null,
    };
  }

  let coreTopY = minY;
  for (let y = minY; y <= maxY; y += 1) {
    if (rowCounts[y] >= coreRowMinPixels) {
      coreTopY = y;
      break;
    }
  }

  let corePixels = 0;
  let coreXSum = 0;
  for (let y = coreTopY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (alpha[y * width + x] < alphaThreshold) continue;
      corePixels += 1;
      coreXSum += x;
    }
  }

  return {
    visiblePixels,
    bbox: {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
    groundY: maxY,
    edgePixels,
    coreTopY,
    coreHeight: maxY - coreTopY + 1,
    bodyCenterX: round(coreXSum / corePixels),
  };
}

export function calculateLandmarkMetrics(landmarks) {
  if (!landmarks || LANDMARK_KEYS.some((key) => !Number.isFinite(landmarks[key]))) {
    return null;
  }
  const headHeight = landmarks.headBottomY - landmarks.headTopY;
  const bodyHeight = landmarks.bodyBottomY - landmarks.bodyTopY;
  if (headHeight <= 0 || bodyHeight <= 0) return null;
  return {
    eyeY: landmarks.eyeY,
    shoulderY: landmarks.shoulderY,
    bodyCenterX: landmarks.bodyCenterX,
    bodyHeight,
    headBodyRatio: round(headHeight / bodyHeight, 4),
  };
}

function canTranslateWithinCanvas(metrics, shiftX, shiftY, canvas) {
  if (!metrics.bbox) return false;
  const left = metrics.bbox.x + shiftX;
  const right = metrics.bbox.x + metrics.bbox.width - 1 + shiftX;
  const top = metrics.bbox.y + shiftY;
  const bottom = metrics.bbox.y + metrics.bbox.height - 1 + shiftY;
  return left > 0 && right < canvas.width - 1 && top > 0 && bottom < canvas.height - 1;
}

export function evaluateAsset({ target, reference, canvas, manualOnly = false }) {
  const reasons = [];
  let decision = "KEEP";
  const metrics = target.metrics;
  const referenceMetrics = reference.metrics;
  const landmarkMetrics = calculateLandmarkMetrics(target.landmarks);
  const referenceLandmarks = calculateLandmarkMetrics(reference.landmarks);

  if (target.legacy) {
    addReason(reasons, "legacy", "info", "사용하지 않는 이전 자산으로 보관합니다.");
    return {
      decision: "LEGACY",
      reasons,
      comparison: emptyComparison(),
    };
  }

  if (metrics.width !== canvas.width || metrics.height !== canvas.height) {
    decision = chooseDecision(decision, "REJECT");
    addReason(
      reasons,
      "canvas-size",
      "error",
      `캔버스가 ${metrics.width}×${metrics.height}이며 기준 ${canvas.width}×${canvas.height}와 다릅니다.`,
    );
  }
  if (!metrics.hasAlpha) {
    decision = chooseDecision(decision, "REJECT");
    addReason(reasons, "missing-alpha", "error", "투명 알파 채널이 없습니다.");
  }
  if (!metrics.alpha.visiblePixels) {
    decision = chooseDecision(decision, "REJECT");
    addReason(reasons, "empty-alpha", "error", "보이는 캐릭터 픽셀이 없습니다.");
  }
  if (metrics.alpha.edgePixels > 0) {
    decision = chooseDecision(decision, "REJECT");
    addReason(
      reasons,
      "edge-clipping",
      "error",
      `캔버스 가장자리에 알파 픽셀 ${metrics.alpha.edgePixels}개가 닿아 잘림 가능성이 있습니다.`,
    );
  }

  const groundDelta =
    metrics.alpha.groundY === null ? null : metrics.alpha.groundY - canvas.groundY;
  if (groundDelta !== null && Math.abs(groundDelta) > canvas.groundPassPx) {
    if (Math.abs(groundDelta) <= canvas.groundReviewPx) {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "ground-review",
        "review",
        `발선이 기준에서 ${groundDelta}px 차이 나 수동 확인이 필요합니다.`,
      );
    } else if (
      canTranslateWithinCanvas(metrics.alpha, 0, -groundDelta, canvas)
    ) {
      decision = chooseDecision(decision, "NORMALIZE-TRANSLATE");
      addReason(
        reasons,
        "ground-translate",
        "normalize",
        `발선을 ${-groundDelta}px 평행이동하면 기준에 맞출 수 있습니다.`,
      );
    } else {
      decision = chooseDecision(decision, "REJECT");
      addReason(
        reasons,
        "ground-clipped",
        "error",
        `발선이 ${groundDelta}px 벗어났고 평행이동 시 가장자리 잘림이 생깁니다.`,
      );
    }
  }

  const bodyCenterDelta =
    metrics.alpha.bodyCenterX === null || referenceMetrics.alpha.bodyCenterX === null
      ? null
      : round(metrics.alpha.bodyCenterX - referenceMetrics.alpha.bodyCenterX);
  if (bodyCenterDelta !== null && Math.abs(bodyCenterDelta) > canvas.centerPassPx) {
    if (Math.abs(bodyCenterDelta) <= canvas.centerReviewPx) {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "body-center-review",
        "review",
        `동적 외곽을 줄인 몸 중심이 기준본과 ${bodyCenterDelta}px 차이 납니다.`,
      );
    } else if (canTranslateWithinCanvas(metrics.alpha, -bodyCenterDelta, 0, canvas)) {
      decision = chooseDecision(decision, "NORMALIZE-TRANSLATE");
      addReason(
        reasons,
        "body-center-translate",
        "normalize",
        `몸 중심을 ${-bodyCenterDelta}px 평행이동하는 보정 후보입니다.`,
      );
    } else {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "body-center-unresolved",
        "review",
        `몸 중심 차이 ${bodyCenterDelta}px를 평행이동만으로 안전하게 해결할 수 없습니다.`,
      );
    }
  }

  const coreHeightPercent = percentDifference(
    metrics.alpha.coreHeight,
    referenceMetrics.alpha.coreHeight,
  );
  if (coreHeightPercent !== null && Math.abs(coreHeightPercent) > canvas.scalePassPercent) {
    if (Math.abs(coreHeightPercent) <= canvas.scaleReviewPercent) {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "core-height-review",
        "review",
        `동적 외곽을 줄인 중심 신체 높이가 기준본과 ${coreHeightPercent}% 차이 납니다.`,
      );
    } else if (landmarkMetrics && referenceLandmarks) {
      const headRatioPercent = percentDifference(
        landmarkMetrics.headBodyRatio,
        referenceLandmarks.headBodyRatio,
      );
      if (headRatioPercent !== null && Math.abs(headRatioPercent) <= canvas.scalePassPercent) {
        decision = chooseDecision(decision, "NORMALIZE-UNIFORM-SCALE");
        addReason(
          reasons,
          "uniform-scale",
          "normalize",
          `머리/몸 비율은 유지되며 전체 크기만 ${coreHeightPercent}% 차이 납니다.`,
        );
      } else {
        decision = chooseDecision(decision, "REFERENCE-REMAKE");
        addReason(
          reasons,
          "proportion-mismatch",
          "error",
          `중심 신체 높이와 머리/몸 비율이 함께 달라 균일 보정으로 해결할 수 없습니다.`,
        );
      }
    } else {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "scale-landmark-required",
        "review",
        `중심 신체 높이가 ${coreHeightPercent}% 달라 눈·머리 기준점 확인이 필요합니다.`,
      );
    }
  }

  const eyeDelta =
    landmarkMetrics && referenceLandmarks
      ? round(landmarkMetrics.eyeY - referenceLandmarks.eyeY)
      : null;
  const shoulderDelta =
    landmarkMetrics && referenceLandmarks
      ? round(landmarkMetrics.shoulderY - referenceLandmarks.shoulderY)
      : null;
  const landmarkBodyHeightPercent =
    landmarkMetrics && referenceLandmarks
      ? percentDifference(landmarkMetrics.bodyHeight, referenceLandmarks.bodyHeight)
      : null;
  const headBodyRatioPercent =
    landmarkMetrics && referenceLandmarks
      ? percentDifference(
          landmarkMetrics.headBodyRatio,
          referenceLandmarks.headBodyRatio,
        )
      : null;

  if (eyeDelta !== null && Math.abs(eyeDelta) > canvas.eyePassPx) {
    if (Math.abs(eyeDelta) <= canvas.eyeReviewPx) {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(reasons, "eye-level-review", "review", `눈높이가 기준본과 ${eyeDelta}px 차이 납니다.`);
    } else {
      decision = chooseDecision(decision, "REFERENCE-REMAKE");
      addReason(reasons, "eye-level-fail", "error", `눈높이가 기준본과 ${eyeDelta}px 차이 납니다.`);
    }
  }

  if (shoulderDelta !== null && Math.abs(shoulderDelta) > canvas.eyePassPx) {
    if (Math.abs(shoulderDelta) <= canvas.eyeReviewPx) {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "shoulder-level-review",
        "review",
        `어깨·가슴선이 기준본과 ${shoulderDelta}px 차이 납니다.`,
      );
    } else {
      decision = chooseDecision(decision, "REFERENCE-REMAKE");
      addReason(
        reasons,
        "shoulder-level-fail",
        "error",
        `어깨·가슴선이 기준본과 ${shoulderDelta}px 차이 납니다.`,
      );
    }
  }

  if (headBodyRatioPercent !== null && Math.abs(headBodyRatioPercent) > canvas.scalePassPercent) {
    if (Math.abs(headBodyRatioPercent) <= canvas.scaleReviewPercent) {
      decision = chooseDecision(decision, "MANUAL-REVIEW");
      addReason(
        reasons,
        "head-body-review",
        "review",
        `머리/몸 비율이 기준본과 ${headBodyRatioPercent}% 차이 납니다.`,
      );
    } else {
      decision = chooseDecision(decision, "REFERENCE-REMAKE");
      addReason(
        reasons,
        "head-body-fail",
        "error",
        `머리/몸 비율이 기준본과 ${headBodyRatioPercent}% 달라 부분 변형 없이 해결할 수 없습니다.`,
      );
    }
  }

  if (target.id !== reference.id && (!landmarkMetrics || !referenceLandmarks)) {
    decision = chooseDecision(decision, "MANUAL-REVIEW");
    addReason(
      reasons,
      "manual-landmarks-required",
      "review",
      "카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다.",
    );
  }
  if (manualOnly) {
    decision = chooseDecision(decision, "MANUAL-REVIEW");
    addReason(
      reasons,
      "manual-only-group",
      "review",
      "여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다.",
    );
  }
  if (reasons.length === 0) {
    addReason(reasons, "within-tolerance", "pass", "자동 측정 항목이 허용 범위 안에 있습니다.");
  }

  return {
    decision,
    reasons,
    comparison: {
      groundDelta,
      bodyCenterDelta,
      coreHeightPercent,
      eyeDelta,
      shoulderDelta,
      landmarkBodyHeightPercent,
      headBodyRatioPercent,
    },
  };
}

function emptyComparison() {
  return {
    groundDelta: null,
    bodyCenterDelta: null,
    coreHeightPercent: null,
    eyeDelta: null,
    shoulderDelta: null,
    landmarkBodyHeightPercent: null,
    headBodyRatioPercent: null,
  };
}

function selectorMatches(asset, selector) {
  return (
    asset.story === selector.story &&
    selector.groups.includes(asset.group) &&
    asset.framing === selector.framing
  );
}

export function resolveAuditTargets({ projectRoot, config, assets }) {
  const catalogCharacters = assets.filter((asset) => asset.type === "character");
  const assigned = new Map();
  const groups = config.groups.map((group) => {
    const targets = [];
    for (const asset of catalogCharacters) {
      if (!(group.selectors ?? []).some((selector) => selectorMatches(asset, selector))) {
        continue;
      }
      if (assigned.has(asset.id)) {
        throw new Error(
          `자산 ${asset.id}가 ${assigned.get(asset.id)}와 ${group.id}에 중복 지정되었습니다.`,
        );
      }
      assigned.set(asset.id, group.id);
      targets.push({
        id: asset.id,
        path: path.join(projectRoot, "public", asset.src),
        relativePath: path.posix.join("public", asset.src),
        source: "registered",
        story: asset.story,
        character: asset.group,
        pose: asset.pose,
        framing: asset.framing,
        legacy: (group.legacyIds ?? []).includes(asset.id),
        landmarks: config.landmarks?.[asset.id] ?? null,
      });
    }
    for (const candidate of group.candidateFiles ?? []) {
      targets.push({
        id: candidate.id,
        path: path.join(projectRoot, candidate.path),
        relativePath: candidate.path,
        source: "candidate",
        story: group.id.startsWith("rabbit-turtle") ? "토끼와 자라" : "옹고집전",
        character: group.label,
        pose: candidate.pose,
        framing: "전신",
        legacy: false,
        landmarks: config.landmarks?.[candidate.id] ?? null,
      });
    }
    targets.sort((left, right) => left.id.localeCompare(right.id, "en"));
    return { ...group, targets };
  });

  const unassigned = catalogCharacters
    .filter((asset) => !assigned.has(asset.id))
    .map((asset) => asset.id)
    .sort();
  if (unassigned.length > 0) {
    throw new Error(`앵커 설정에 없는 등록 캐릭터 자산: ${unassigned.join(", ")}`);
  }

  return groups;
}

export async function readStoryAssets(manifestPath) {
  const manifestText = await readFile(manifestPath, "utf8");
  const declaration = manifestText.indexOf("export const STORY_ASSETS");
  const jsonStart = manifestText.indexOf("= [", declaration) + 2;
  const jsonEnd = manifestText.lastIndexOf("];");
  if (declaration < 0 || jsonStart < 2 || jsonEnd < jsonStart) {
    throw new Error("app/story-assets.ts에서 STORY_ASSETS를 읽지 못했습니다.");
  }
  return JSON.parse(manifestText.slice(jsonStart, jsonEnd + 1));
}

export async function inspectImage(filePath, settings) {
  const [{ stdout: identifyOutput }, { stdout: alpha }] = await Promise.all([
    run("magick", [
      "identify",
      "-format",
      "%w %h %[channels]",
      filePath,
    ]),
    run(
      "magick",
      [filePath, "-alpha", "extract", "-depth", "8", "gray:-"],
      { encoding: "buffer", maxBuffer: 4 * 1024 * 1024 },
    ),
  ]);
  const [widthText, heightText, ...channelParts] = identifyOutput.trim().split(/\s+/);
  const width = Number(widthText);
  const height = Number(heightText);
  const channels = channelParts.join(" ");
  const mask = measureAlphaMask({
    width,
    height,
    alpha,
    alphaThreshold: settings.alphaThreshold,
    coreRowMinPixels: settings.coreRowMinPixels,
  });
  const bytes = await readFile(filePath);
  return {
    width,
    height,
    channels,
    hasAlpha: /(?:rgba|graya|cmyka|alpha)/i.test(channels),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    alpha: mask,
  };
}

export async function auditCharacterAssets({ projectRoot, config, assets }) {
  const groups = resolveAuditTargets({ projectRoot, config, assets });
  const results = [];

  for (const group of groups) {
    const measuredTargets = [];
    for (const target of group.targets) {
      const metrics = await inspectImage(target.path, {
        ...config.canvas,
        coreRowMinPixels: group.coreRowMinPixels,
      });
      measuredTargets.push({ ...target, metrics });
    }
    const reference = measuredTargets.find((target) => target.id === group.referenceId);
    if (!reference) {
      throw new Error(`${group.id}의 기준본 ${group.referenceId}를 찾지 못했습니다.`);
    }
    for (const target of measuredTargets) {
      const evaluation = evaluateAsset({
        target,
        reference,
        canvas: config.canvas,
        manualOnly: group.manualOnly,
      });
      results.push({
        id: target.id,
        file: target.relativePath,
        source: target.source,
        story: target.story,
        character: target.character,
        pose: target.pose,
        framing: target.framing,
        positionGroup: group.id,
        positionGroupLabel: group.label,
        referenceId: group.referenceId,
        dynamicOuterParts: group.dynamicOuterParts,
        metrics: target.metrics,
        ...evaluation,
      });
    }
  }

  const counts = Object.fromEntries(Object.keys(DECISION_WEIGHT).map((key) => [key, 0]));
  for (const result of results) counts[result.decision] += 1;
  const digest = createHash("sha256")
    .update(JSON.stringify(config))
    .update("\n")
    .update(
      results
        .map((result) => `${result.id}:${result.metrics.sha256}`)
        .sort()
        .join("\n"),
    )
    .digest("hex");

  return {
    schemaVersion: 1,
    auditVersion: "character-anchor-audit-v1",
    inputDigest: digest,
    standard: config.canvas,
    summary: {
      total: results.length,
      registered: results.filter((result) => result.source === "registered").length,
      candidates: results.filter((result) => result.source === "candidate").length,
      counts,
    },
    results,
  };
}

function markdownCell(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function signed(value, suffix = "") {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

export function renderAuditJson(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderAuditMarkdown(report) {
  const lines = [
    "# 캐릭터 기준본·앵커 Audit",
    "",
    "- 명령: `npm run assets:audit`",
    `- 입력 지문: \`${report.inputDigest}\``,
    `- 검사 대상: 등록 자산 ${report.summary.registered}개 + 후보 ${report.summary.candidates}개 = ${report.summary.total}개`,
    `- 기준: ${report.standard.width}×${report.standard.height}, 알파 ${report.standard.alphaThreshold}/255 이상, groundY=${report.standard.groundY}`,
    "- 원칙: 이 보고서는 이미지를 읽기만 하며 자동 보정·덮어쓰기를 하지 않습니다.",
    "",
    "## 자동 허용 범위",
    "",
    "| 항목 | 자동 통과 | 수동 검토 | 범위 초과 시 |",
    "|---|---:|---:|---|",
    `| 발 바닥선 | ±${report.standard.groundPassPx}px | ${report.standard.groundPassPx + 1}~${report.standard.groundReviewPx}px | 평행이동 가능 여부 확인 |`,
    `| 몸통 중심 | ±${report.standard.centerPassPx}px | ${report.standard.centerPassPx + 1}~${report.standard.centerReviewPx}px | 평행이동 가능 여부 확인 |`,
    `| 눈높이·어깨선 | ±${report.standard.eyePassPx}px | ${report.standard.eyePassPx + 1}~${report.standard.eyeReviewPx}px | 기준본 재생성 검토 |`,
    `| 중심 신체 높이 | ±${report.standard.scalePassPercent}% | ${report.standard.scalePassPercent}~${report.standard.scaleReviewPercent}% | 머리/몸 기준점 확인 |`,
    `| 머리/몸 비율 | ±${report.standard.scalePassPercent}% | ${report.standard.scalePassPercent}~${report.standard.scaleReviewPercent}% | 기준본 재생성 검토 |`,
    "",
    "## 판정 요약",
    "",
    "| 판정 | 수 |",
    "|---|---:|",
  ];
  for (const [decision, count] of Object.entries(report.summary.counts)) {
    lines.push(`| ${decision} | ${count} |`);
  }
  lines.push(
    "",
    "`MANUAL-REVIEW`는 실패가 아니라 안전장치입니다. 카툰의 눈·어깨·머리 경계는 자동 인식으로 확정하지 않고 사람이 기준점을 승인해야 합니다.",
    "",
    "## 우선 검토 신호",
    "",
  );
  const priorityResults = report.results.filter((result) =>
    result.reasons.some((reason) =>
      [
        "ground-review",
        "ground-translate",
        "ground-clipped",
        "body-center-review",
        "body-center-translate",
        "body-center-unresolved",
        "core-height-review",
        "scale-landmark-required",
        "uniform-scale",
        "proportion-mismatch",
        "eye-level-review",
        "eye-level-fail",
        "shoulder-level-review",
        "shoulder-level-fail",
        "head-body-review",
        "head-body-fail",
        "edge-clipping",
      ].includes(reason.code),
    ),
  );
  if (priorityResults.length === 0) {
    lines.push("- 자동 측정에서 허용 범위를 벗어난 우선 검토 신호가 없습니다.");
  } else {
    for (const result of priorityResults) {
      const signals = result.reasons
        .filter((reason) => reason.code !== "manual-landmarks-required")
        .map((reason) => reason.message)
        .join(" / ");
      lines.push(`- \`${result.file}\`: ${signals}`);
    }
  }
  lines.push(
    "",
    "## 기준본·전체 Pose 비교",
    "",
    "| 판정 | 출처 | 위치 묶음 | 파일·Pose | 발선 Δ | 몸 중심 Δ | 중심 신체 높이 Δ | 눈높이 Δ | 머리/몸 Δ | 판정 이유 |",
    "|---|---|---|---|---:|---:|---:|---:|---:|---|",
  );
  for (const result of report.results) {
    const reasons = result.reasons.map((reason) => reason.message).join(" / ");
    lines.push(
      `| ${markdownCell(result.decision)} | ${result.source === "registered" ? "등록" : "후보"} | ${markdownCell(result.positionGroupLabel)} | \`${markdownCell(result.file)}\` · ${markdownCell(result.pose)} | ${signed(result.comparison.groundDelta, "px")} | ${signed(result.comparison.bodyCenterDelta, "px")} | ${signed(result.comparison.coreHeightPercent, "%")} | ${signed(result.comparison.eyeDelta, "px")} | ${signed(result.comparison.headBodyRatioPercent, "%")} | ${markdownCell(reasons)} |`,
    );
  }
  lines.push(
    "",
    "## 해석과 다음 작업 경계",
    "",
    "- `NORMALIZE-TRANSLATE`: 비율을 바꾸지 않고 평행이동으로 발선 또는 중심을 맞출 수 있는 후보입니다.",
    "- `NORMALIZE-UNIFORM-SCALE`: 수동 머리/몸 기준점이 같은 비율임을 확인한 경우에만 균일 확대·축소합니다.",
    "- `REFERENCE-REMAKE`: 머리/몸 비율 또는 눈높이 차이로 부분 변형 없이 해결하기 어려운 후보입니다.",
    "- `LEGACY`: 삭제하지 않고 보관하지만 신규 기본·감정 세트에는 사용하지 않습니다.",
    "- 귀·더듬이·뿔·관모·펼친 손·소품은 행별 알파 폭 임곗값으로 중심 신체 시작점에서 줄였으며, 이 외곽만으로 전체 크기를 판정하지 않습니다.",
    "- A1-02에서는 수동 기준점을 승인한 뒤 Audit을 다시 실행하고, 통과한 후보만 등록하거나 1:1 교체합니다.",
    "",
  );
  return lines.join("\n");
}
