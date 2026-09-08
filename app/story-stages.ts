import type { Chapter, StoryPlanning } from "./story-data";

export type StoryStageKey =
  | "opening"
  | "middle"
  | "crisis"
  | "climax"
  | "ending";

export type StoryArcKey = StoryStageKey;

export type StoryStructureMode = StoryPlanning["structureMode"];

export const STORY_STAGE_ORDER: readonly StoryStageKey[] = [
  "opening",
  "middle",
  "crisis",
  "climax",
  "ending",
] as const;

export interface StoryStructureStep {
  label: string;
  guide: string;
  key: StoryStageKey;
}

export interface StoryStructureOption {
  mode: StoryStructureMode;
  title: string;
  shortTitle: string;
  steps: StoryStructureStep[];
}

export const STORY_STRUCTURE_OPTIONS: StoryStructureOption[] = [
  {
    mode: "three",
    title: "처음 → 중간 → 끝",
    shortTitle: "3단계",
    steps: [
      {
        label: "처음",
        guide: "누가 어디에 있고, 어떤 일이 시작되나요?",
        key: "opening",
      },
      {
        label: "중간",
        guide: "어떤 문제가 생기고, 인물은 무엇을 하나요?",
        key: "middle",
      },
      {
        label: "끝",
        guide: "문제는 어떻게 마무리되고, 무엇이 달라지나요?",
        key: "ending",
      },
    ],
  },
  {
    mode: "four",
    title: "발단 → 전개 → 절정 → 결말",
    shortTitle: "4단계",
    steps: [
      {
        label: "발단",
        guide: "인물과 배경을 보여 주고, 어떤 사건이 시작되나요?",
        key: "opening",
      },
      {
        label: "전개",
        guide: "주인공이 목표를 향해 움직이며 갈등이 어떻게 커지나요?",
        key: "middle",
      },
      {
        label: "절정",
        guide: "갈등이 가장 커지고, 주인공이 가장 중요한 선택이나 행동을 하나요?",
        key: "climax",
      },
      {
        label: "결말",
        guide: "선택의 결과는 무엇이고, 인물이나 상황이 어떻게 달라지나요?",
        key: "ending",
      },
    ],
  },
  {
    mode: "five",
    title: "발단 → 전개 → 위기 → 절정 → 결말",
    shortTitle: "5단계",
    steps: [
      {
        label: "발단",
        guide: "인물과 배경을 보여 주고, 어떤 사건이 시작되나요?",
        key: "opening",
      },
      {
        label: "전개",
        guide: "주인공이 목표를 향해 움직이며 갈등이 어떻게 커지나요?",
        key: "middle",
      },
      {
        label: "위기",
        guide: "가장 큰 어려움이 닥치고, 어떤 선택 앞에 서나요?",
        key: "crisis",
      },
      {
        label: "절정",
        guide: "갈등을 풀기 위해 주인공이 하는 가장 중요한 행동은?",
        key: "climax",
      },
      {
        label: "결말",
        guide: "행동의 결과는 무엇이고, 인물이나 상황이 어떻게 달라지나요?",
        key: "ending",
      },
    ],
  },
];

export const STAGE_NAME_TO_KEY: Record<string, StoryStageKey> = {
  // Korean 5-stage names
  발단: "opening",
  전개: "middle",
  위기: "crisis",
  절정: "climax",
  결말: "ending",

  // Korean 3-stage names
  처음: "opening",
  중간: "middle",
  끝: "ending",

  // Korean 4-stage classical names
  기: "opening",
  승: "middle",
  전: "climax",
  결: "ending",

  // English keys
  opening: "opening",
  middle: "middle",
  crisis: "crisis",
  climax: "climax",
  ending: "ending",
};

export function parseStoryStageKey(raw: string): StoryStageKey | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed in STAGE_NAME_TO_KEY) {
    return STAGE_NAME_TO_KEY[trimmed];
  }
  const lower = trimmed.toLowerCase();
  if (lower in STAGE_NAME_TO_KEY) {
    return STAGE_NAME_TO_KEY[lower];
  }
  return null;
}

export function parseStoryStageKeysText(text: string): {
  keys: StoryStageKey[];
  unknownTokens: string[];
} {
  if (!text || !text.trim()) {
    return { keys: [], unknownTokens: [] };
  }
  const tokens = text
    .split(/[,，·・•\n\r\/;；]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const keys: StoryStageKey[] = [];
  const unknownTokens: string[] = [];

  for (const token of tokens) {
    const key = parseStoryStageKey(token);
    if (key) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    } else {
      unknownTokens.push(token);
    }
  }

  return {
    keys: canonicalizeStoryStageKeys(keys),
    unknownTokens,
  };
}

export function isStoryStageKey(value: unknown): value is StoryStageKey {
  return (
    typeof value === "string" &&
    (STORY_STAGE_ORDER as readonly string[]).includes(value)
  );
}

export function canonicalizeStoryStageKeys(keys: unknown): StoryStageKey[] {
  if (!Array.isArray(keys)) return [];
  const set = new Set(keys.filter(isStoryStageKey));
  return STORY_STAGE_ORDER.filter((key) => set.has(key));
}

export function getStructureOption(mode: StoryStructureMode = "five"): StoryStructureOption {
  return (
    STORY_STRUCTURE_OPTIONS.find((option) => option.mode === mode) ??
    STORY_STRUCTURE_OPTIONS[0]
  );
}

export function getStructureSteps(mode: StoryStructureMode = "five"): StoryStructureStep[] {
  return getStructureOption(mode).steps;
}

export function mapStageToStructureLabel(
  key: StoryStageKey,
  mode: StoryStructureMode = "five",
): string {
  const steps = getStructureSteps(mode);
  const matched = steps.find((step) => step.key === key);
  if (matched) return matched.label;

  // Fallback defaults if key is outside the current mode's standard steps
  switch (key) {
    case "opening":
      return mode === "three" ? "처음" : "발단";
    case "middle":
      return mode === "three" ? "중간" : "전개";
    case "crisis":
      return "위기";
    case "climax":
      return "절정";
    case "ending":
      return mode === "three" ? "끝" : "결말";
    default:
      return key;
  }
}

export function formatStoryStageLabels(
  keys: unknown,
  mode: StoryStructureMode = "five",
  fallback = "",
): string {
  const canonical = canonicalizeStoryStageKeys(keys);
  if (canonical.length === 0) return fallback;
  return canonical.map((key) => mapStageToStructureLabel(key, mode)).join("·");
}

export function recommendChapterStageKeys(
  chapterIndex: number,
  chapterCount: number,
  mode: StoryStructureMode = "five",
): StoryStageKey[] {
  if (chapterCount <= 0 || chapterIndex < 0 || chapterIndex >= chapterCount) {
    return [];
  }

  const steps = getStructureSteps(mode);
  const stepKeys = steps.map((s) => s.key);

  if (chapterCount === 1) {
    return [...stepKeys];
  }

  if (chapterCount === stepKeys.length) {
    return [stepKeys[chapterIndex]];
  }

  // 5단계 모드 특화 분배
  if (mode === "five") {
    if (chapterCount === 3) {
      if (chapterIndex === 0) return ["opening"];
      if (chapterIndex === 1) return ["middle", "crisis", "climax"];
      return ["ending"];
    }
    if (chapterCount === 2) {
      if (chapterIndex === 0) return ["opening", "middle"];
      return ["crisis", "climax", "ending"];
    }
    if (chapterCount === 4) {
      if (chapterIndex === 0) return ["opening"];
      if (chapterIndex === 1) return ["middle"];
      if (chapterIndex === 2) return ["crisis", "climax"];
      return ["ending"];
    }
  }

  // 4단계 모드 특화 분배
  if (mode === "four") {
    if (chapterCount === 2) {
      if (chapterIndex === 0) return ["opening", "middle"];
      return ["climax", "ending"];
    }
    if (chapterCount === 3) {
      if (chapterIndex === 0) return ["opening"];
      if (chapterIndex === 1) return ["middle", "climax"];
      return ["ending"];
    }
  }

  // 3단계 모드 특화 분배
  if (mode === "three") {
    if (chapterCount === 2) {
      if (chapterIndex === 0) return ["opening", "middle"];
      return ["ending"];
    }
  }

  // 일반 N개 장 분배: 장 수가 단계 수보다 많은 경우 (한 단계에 여러 장 순서대로 추천)
  if (chapterCount > stepKeys.length) {
    const stepIdx = Math.min(
      stepKeys.length - 1,
      Math.round((chapterIndex * (stepKeys.length - 1)) / (chapterCount - 1)),
    );
    return [stepKeys[stepIdx]];
  }

  // 일반 N개 장 분배: 장 수가 단계 수보다 적은 경우 (슬라이스 분할)
  const start = Math.floor((chapterIndex * stepKeys.length) / chapterCount);
  const end = Math.floor(((chapterIndex + 1) * stepKeys.length) / chapterCount);
  const slice = stepKeys.slice(start, Math.max(start + 1, end));
  return slice.length > 0 ? slice : [stepKeys[Math.min(chapterIndex, stepKeys.length - 1)]];
}

export function getStageToChaptersMap(
  chapters: Chapter[],
): Record<StoryStageKey, Chapter[]> {
  const map: Record<StoryStageKey, Chapter[]> = {
    opening: [],
    middle: [],
    crisis: [],
    climax: [],
    ending: [],
  };

  for (const chapter of chapters) {
    const keys = canonicalizeStoryStageKeys(chapter.storyStageKeys);
    for (const key of keys) {
      map[key].push(chapter);
    }
  }

  return map;
}

export function getUnlinkedStagesAndChapters(
  chapters: Chapter[],
  mode: StoryStructureMode = "five",
): {
  unlinkedChapters: Chapter[];
  unlinkedStages: StoryStageKey[];
} {
  const steps = getStructureSteps(mode);
  const stageMap = getStageToChaptersMap(chapters);

  const unlinkedChapters = chapters.filter(
    (chapter) => canonicalizeStoryStageKeys(chapter.storyStageKeys).length === 0,
  );

  const unlinkedStages = steps
    .filter((step) => stageMap[step.key].length === 0)
    .map((step) => step.key);

  return {
    unlinkedChapters,
    unlinkedStages,
  };
}

export function chapterArcLabel(
  chapterIndex: number,
  chapterCount: number,
  steps: Array<{ label: string }>,
) {
  if (steps.length === 0) return "이야기";
  if (chapterCount <= 1) return steps[0].label;
  const stepIndex = Math.round(
    (chapterIndex * (steps.length - 1)) / (chapterCount - 1),
  );
  return steps[Math.min(stepIndex, steps.length - 1)].label;
}

export function formatStoryStageKeysForExport(keys: StoryStageKey[]): string {
  const canonical = canonicalizeStoryStageKeys(keys);
  return canonical
    .map((k) => mapStageToStructureLabel(k, "five"))
    .join(", ");
}

export type StageWarningType =
  | "mixed_vocabulary"
  | "mode_mismatch"
  | "incomplete_ending"
  | "order_disorder";

export interface StageSuggestion {
  label: string;
  description: string;
  targetMode: StoryStructureMode;
  chapterStageKeys: Record<string, StoryStageKey[]>;
}

export interface StageConsistencyWarning {
  type: StageWarningType;
  signature: string;
  title: string;
  message: string;
  detectedPattern: string;
  suggestions: StageSuggestion[];
}

function buildStageSuggestions(
  chapters: Chapter[],
  preferredModes: StoryStructureMode[],
): StageSuggestion[] {
  const suggestions: StageSuggestion[] = [];

  for (const targetMode of preferredModes) {
    const chapterStageKeys: Record<string, StoryStageKey[]> = {};
    const count = chapters.length;

    chapters.forEach((chapter, index) => {
      chapterStageKeys[chapter.id] = recommendChapterStageKeys(
        index,
        count,
        targetMode,
      );
    });

    if (targetMode === "three") {
      suggestions.push({
        label: "3단계(처음 · 중간 · 끝)로 맞추기",
        description: "모든 장을 처음·중간·끝 3단계 흐름으로 깔끔하게 통일해요.",
        targetMode: "three",
        chapterStageKeys,
      });
    } else if (targetMode === "four") {
      suggestions.push({
        label: "4단계(발단 · 전개 · 절정 · 결말)로 맞추기",
        description: "기승전결에 맞게 4단계(발단·전개·절정·결말) 흐름으로 정리해요.",
        targetMode: "four",
        chapterStageKeys,
      });
    } else if (targetMode === "five") {
      suggestions.push({
        label: "5단계(발단 · 전개 · 위기 · 절정 · 결말)로 맞추기",
        description: "위기를 포함해 5단계(발단·전개·위기·절정·결말)로 세밀하게 펼쳐요.",
        targetMode: "five",
        chapterStageKeys,
      });
    }
  }

  return suggestions;
}

export type StageEvaluatedChapter = Chapter & {
  storyStageRaw?: string;
};

export function detectStageConsistencyIssues(
  chapters: StageEvaluatedChapter[],
  mode: StoryStructureMode = "five",
  rawStageMap?: Record<string, string>,
): StageConsistencyWarning | null {
  if (!chapters || chapters.length === 0) return null;

  const getChapterRaw = (c: StageEvaluatedChapter): string => {
    const raw = rawStageMap?.[c.id] ?? c.storyStageRaw;
    return typeof raw === "string" ? raw.trim() : "";
  };

  const signature = `${mode}:${chapters
    .map(
      (c) =>
        `${c.id}:${canonicalizeStoryStageKeys(c.storyStageKeys).join(",")}:${getChapterRaw(c)}`,
    )
    .join(";")}`;

  const hasAnyKeys = chapters.some(
    (c) =>
      canonicalizeStoryStageKeys(c.storyStageKeys).length > 0 ||
      Boolean(getChapterRaw(c)),
  );
  if (!hasAnyKeys) return null;

  // 1. Raw vocabulary extraction
  const THREE_STAGE_WORDS = new Set(["처음", "중간", "끝"]);
  const FOUR_FIVE_STAGE_WORDS = new Set([
    "발단",
    "전개",
    "위기",
    "절정",
    "결말",
  ]);
  const CLASSICAL_WORDS = new Set(["기", "승", "전", "결"]);

  const usedThreeWords = new Set<string>();
  const usedFourFiveWords = new Set<string>();
  const usedClassicalWords = new Set<string>();

  for (const chapter of chapters) {
    const rawText = getChapterRaw(chapter);
    if (rawText) {
      const tokens = rawText
        .split(/[,，·・•\s\/;；]+/)
        .map((t: string) => t.trim())
        .filter(Boolean);
      for (const token of tokens) {
        if (THREE_STAGE_WORDS.has(token)) usedThreeWords.add(token);
        if (FOUR_FIVE_STAGE_WORDS.has(token)) usedFourFiveWords.add(token);
        if (CLASSICAL_WORDS.has(token)) usedClassicalWords.add(token);
      }
    }
  }

  const detectedPattern = chapters
    .map((chapter) => {
      const rawText = getChapterRaw(chapter);
      if (rawText) {
        return `${chapter.order}장(${rawText})`;
      }
      const keys = canonicalizeStoryStageKeys(chapter.storyStageKeys);
      if (keys.length === 0) return `${chapter.order}장(미설정)`;
      return `${chapter.order}장(${formatStoryStageLabels(keys, mode)})`;
    })
    .join(" → ");

  // Case A: Mixed raw vocabulary (e.g. 처음-중간-결말, 처음-전개-위기, 발단-중간-결말)
  if (usedThreeWords.size > 0 && usedFourFiveWords.size > 0) {
    const threeList = Array.from(usedThreeWords).join("·");
    const fourFiveList = Array.from(usedFourFiveWords).join("·");

    let message = `‘${threeList}’(3단계)과 ‘${fourFiveList}’(4·5단계)처럼 서로 다른 체계의 용어가 섞여 있어요. 3단계나 4단계 중 하나로 통일하면 이야기 흐름이 더 자연스러워져요.`;
    const preferredModes: StoryStructureMode[] =
      usedFourFiveWords.has("위기") ? ["five", "three"] : ["three", "four"];

    if (
      usedThreeWords.has("처음") &&
      usedThreeWords.has("중간") &&
      usedFourFiveWords.has("결말")
    ) {
      message =
        "‘처음 · 중간’(3단계)과 ‘결말’(4·5단계)이 섞여 있어요. 3단계(처음·중간·끝)로 맞추거나, 4단계(발단·전개·절정·결말)로 통일해 보세요.";
    } else if (
      usedThreeWords.has("처음") &&
      usedFourFiveWords.has("전개") &&
      usedFourFiveWords.has("위기")
    ) {
      message =
        "‘처음’(3단계), ‘전개’(4·5단계), ‘위기’(5단계)가 섞여 있고 결말이 비어 있어요. 3단계나 5단계로 맞추면 이야기 완결성이 높아져요.";
    }

    return {
      type: "mixed_vocabulary",
      signature,
      title: "이야기 단계 용어가 섞여 있어요",
      message,
      detectedPattern,
      suggestions: buildStageSuggestions(chapters, preferredModes),
    };
  }

  if (
    usedClassicalWords.size > 0 &&
    (usedThreeWords.size > 0 || usedFourFiveWords.size > 0)
  ) {
    return {
      type: "mixed_vocabulary",
      signature,
      title: "이야기 단계 용어가 섞여 있어요",
      message:
        "‘기·승·전·결’ 고전 용어와 현대 이야기 단계 용어가 섞여 있어요. 하나의 방식으로 정리해 보세요.",
      detectedPattern,
      suggestions: buildStageSuggestions(chapters, ["four", "three"]),
    };
  }

  // Case B: Mode mismatch
  // 1) Mode is 3-stage ("three"), but any chapter has "crisis" or "climax"
  if (mode === "three") {
    const hasCrisis = chapters.some((c) =>
      canonicalizeStoryStageKeys(c.storyStageKeys).includes("crisis"),
    );
    const hasClimax = chapters.some((c) =>
      canonicalizeStoryStageKeys(c.storyStageKeys).includes("climax"),
    );

    if (hasCrisis || hasClimax) {
      const extraTerms = [hasCrisis ? "‘위기’" : "", hasClimax ? "‘절정’" : ""]
        .filter(Boolean)
        .join("와 ");
      return {
        type: "mode_mismatch",
        signature,
        title: "3단계 구성에 다른 단계가 포함되어 있어요",
        message: `3단계(처음·중간·끝) 구성에는 ${extraTerms}가 없어요. ‘중간’에 갈등을 담거나 4단계/5단계로 방식을 변경해 보세요.`,
        detectedPattern,
        suggestions: buildStageSuggestions(
          chapters,
          hasCrisis ? ["three", "five"] : ["three", "four"],
        ),
      };
    }
  }

  // 2) Mode is 4-stage ("four"), but any chapter has "crisis"
  if (mode === "four") {
    const hasCrisis = chapters.some((c) =>
      canonicalizeStoryStageKeys(c.storyStageKeys).includes("crisis"),
    );
    if (hasCrisis) {
      return {
        type: "mode_mismatch",
        signature,
        title: "4단계 구성에 ‘위기’ 단계가 들어있어요",
        message:
          "4단계(발단·전개·절정·결말)에는 ‘위기’ 대신 바로 ‘절정’으로 이어져요. 5단계로 바꾸거나 ‘전개·절정’으로 정리해 보세요.",
        detectedPattern,
        suggestions: buildStageSuggestions(chapters, ["four", "five"]),
      };
    }
  }

  // Case C: Order disorder (ending comes before opening)
  let firstEndingIndex = -1;
  let lastOpeningIndex = -1;
  chapters.forEach((chapter, index) => {
    const keys = canonicalizeStoryStageKeys(chapter.storyStageKeys);
    if (keys.includes("ending") && firstEndingIndex === -1) {
      firstEndingIndex = index;
    }
    if (keys.includes("opening")) {
      lastOpeningIndex = index;
    }
  });

  if (
    firstEndingIndex !== -1 &&
    lastOpeningIndex !== -1 &&
    firstEndingIndex < lastOpeningIndex
  ) {
    return {
      type: "order_disorder",
      signature,
      title: "이야기 단계 순서가 바뀌어 있어요",
      message:
        "‘끝(결말)’이 ‘처음(발단)’보다 앞에 나와 있어요. 이야기 흐름에 맞게 순서를 정렬해 보세요.",
      detectedPattern,
      suggestions: buildStageSuggestions(chapters, [
        mode,
        mode === "three" ? "four" : "three",
      ]),
    };
  }

  // Case D: Incomplete ending (2+ chapters, has stages, but no ending anywhere and ends on crisis/opening/middle)
  if (chapters.length >= 2) {
    const hasAnyEnding = chapters.some((c) =>
      canonicalizeStoryStageKeys(c.storyStageKeys).includes("ending"),
    );
    const lastChapterKeys = canonicalizeStoryStageKeys(
      chapters[chapters.length - 1].storyStageKeys,
    );

    if (
      !hasAnyEnding &&
      lastChapterKeys.length > 0 &&
      (lastChapterKeys.includes("crisis") ||
        lastChapterKeys.includes("middle") ||
        lastChapterKeys.includes("opening"))
    ) {
      return {
        type: "incomplete_ending",
        signature,
        title: "이야기 마무리가 아직 비어 있어요",
        message:
          "이야기의 마지막 장에 ‘끝’ 또는 ‘결말’ 단계가 없어요. 사건이 어떻게 마무리되는지 끝 단계를 연결해 보세요.",
        detectedPattern,
        suggestions: buildStageSuggestions(
          chapters,
          mode === "three" ? ["three", "four"] : ["four", "five"],
        ),
      };
    }
  }

  return null;
}

export function applyStageSuggestion(
  chapters: Chapter[],
  suggestion: StageSuggestion,
): {
  chapters: Chapter[];
  structureMode: StoryStructureMode;
} {
  const updatedChapters = chapters.map((chapter) => {
    const nextKeys = suggestion.chapterStageKeys[chapter.id];
    if (nextKeys) {
      return {
        ...chapter,
        storyStageKeys: canonicalizeStoryStageKeys(nextKeys),
        storyStageRaw: undefined,
      };
    }
    return chapter;
  });

  return {
    chapters: updatedChapters,
    structureMode: suggestion.targetMode,
  };
}
