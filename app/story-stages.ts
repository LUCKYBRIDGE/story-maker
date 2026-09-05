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
  {
    mode: "four",
    title: "발단 → 전개 → 위기 → 결말",
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
        label: "위기",
        guide: "가장 큰 어려움이 닥치고, 주인공은 무엇을 선택하나요?",
        key: "crisis",
      },
      {
        label: "결말",
        guide: "선택의 결과는 무엇이고, 인물이나 상황이 어떻게 달라지나요?",
        key: "ending",
      },
    ],
  },
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
      return ["crisis", "ending"];
    }
    if (chapterCount === 3) {
      if (chapterIndex === 0) return ["opening"];
      if (chapterIndex === 1) return ["middle", "crisis"];
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
