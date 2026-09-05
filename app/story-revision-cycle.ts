export type StoryStructureMode = "five" | "four" | "three";
export type StoryRevisionResponse = "checked" | "later";

export type StoryRevisionPrompt = {
  id: string;
  title: string;
  question: string;
};

export type StoryRevisionResponses = Record<string, StoryRevisionResponse>;

const SHAPE_PROMPTS: Record<StoryStructureMode, StoryRevisionPrompt> = {
  five: {
    id: "story-shape",
    title: "위기와 결말",
    question:
      "위기에서 가장 어려운 일이 생긴 뒤, 결말에서 인물·관계·상황이 어떻게 달라지는지 찾아보세요.",
  },
  four: {
    id: "story-shape",
    title: "위기와 결말",
    question:
      "위기가 커진 뒤, 결말에서 인물·관계·상황이 어떻게 달라지는지 찾아보세요.",
  },
  three: {
    id: "story-shape",
    title: "중간과 끝",
    question:
      "중간에 생긴 문제가 끝에서 어떻게 달라졌는지 찾아보세요.",
  },
};

const COMMON_PROMPTS: StoryRevisionPrompt[] = [
  {
    id: "character-goal",
    title: "인물이 바라는 것",
    question:
      "주인공이 바라는 것이 말이나 행동에 드러나는 컷을 하나 찾아보세요.",
  },
  {
    id: "scene-cause",
    title: "컷이 이어지는 까닭",
    question:
      "한 컷에서 일어난 일이 다음 컷에 어떤 영향을 주는지 한 연결을 찾아보세요.",
  },
  {
    id: "dialogue-and-narration",
    title: "대사와 해설",
    question:
      "대사와 해설이 같은 내용을 반복하지 않고, 서로 다른 일을 하고 있는지 읽어 보세요.",
  },
];

export function storyRevisionPrompts(
  structureMode: StoryStructureMode,
): StoryRevisionPrompt[] {
  return [...COMMON_PROMPTS, SHAPE_PROMPTS[structureMode]];
}

export function storyRevisionResponseKey({
  projectId,
  structureMode,
  promptId,
}: {
  projectId: string;
  structureMode: StoryStructureMode;
  promptId: string;
}) {
  return `${projectId}:${structureMode}:${promptId}`;
}

export function setStoryRevisionResponse({
  responses,
  key,
  response,
}: {
  responses: StoryRevisionResponses;
  key: string;
  response: StoryRevisionResponse;
}): StoryRevisionResponses {
  if (responses[key] === response) return responses;
  return { ...responses, [key]: response };
}

export function normalizeStoryRevisionResponses(
  value: unknown,
): StoryRevisionResponses {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, response]) =>
        typeof key === "string" &&
        (response === "checked" || response === "later"),
    ),
  );
}

export function storyRevisionResponseLabel(
  response: StoryRevisionResponse | undefined,
) {
  if (response === "checked") return "확인함";
  if (response === "later") return "나중에 볼래요";
  return "아직 고르지 않았어요";
}
