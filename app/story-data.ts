export type Chapter = {
  id: string;
  order: number;
  title: string;
  summary: string;
  purpose: string;
  mood: string;
  keyEvents: string;
  nextChapterIdea: string;
  chapterSpeakerNames: string[];
  characterAssetIds: string[];
  backgroundAssetIds: string[];
  backgroundId: string;
  leftAssetId: string;
  rightAssetId: string;
};

export type StoryLine = {
  id: string;
  chapterId: string;
  order: number;
  type: "dialogue" | "narration";
  speaker: "left" | "right" | "narration";
  speakerName: string;
  text: string;
  leftAssetId: string;
  rightAssetId: string;
  backgroundId: string;
  purposeNote: string;
  emotionNote: string;
  directionNote: string;
};

export type StoryPlanning = {
  premise: string;
  theme: string;
  mainCharacter: string;
  mainGoal: string;
  centralProblem: string;
  endingChange: string;
  opening: string;
  middle: string;
  ending: string;
  characterNotes: string;
  mood: string;
  openQuestions: string;
  freeNotes: string;
};

export type StoryProject = {
  id: string;
  title: string;
  description: string;
  planning: StoryPlanning;
  sheetUrl: string;
  sheetEditable: boolean;
  speakerNames: string[];
  chapters: Chapter[];
  lines: StoryLine[];
  updatedAt: string;
};

export const DEFAULT_PROJECT: StoryProject = {
  id: "rabbit-turtle-remix",
  title: "토끼와 자라, 다시 만난 날",
  description: "놀퀴즈 이미지로 시작하는 첫 번째 이야기",
  planning: {
    premise: "토끼와 자라가 서로 솔직하게 이야기하며 새로운 모험을 시작합니다.",
    theme: "정직하게 말하기와 서로 믿는 마음",
    mainCharacter: "토끼와 자라",
    mainGoal: "서로를 다시 믿고 함께 새로운 이야기를 만들고 싶다.",
    centralProblem: "예전에 서로를 속였던 기억 때문에 쉽게 믿기 어렵다.",
    endingChange: "두 친구가 자기 생각을 솔직히 말하고 함께 결말을 정한다.",
    opening: "들판에서 지친 자라가 토끼를 찾아옵니다.",
    middle: "자라는 토끼에게 용궁의 이야기 잔치에 함께 가자고 제안합니다.",
    ending: "두 친구는 용궁에서 자신들이 정한 새로운 이야기를 시작합니다.",
    characterNotes: "토끼는 영리하고 조심스럽습니다. 자라는 미안한 마음을 솔직하게 말하려 합니다.",
    mood: "모험 · 긴장 · 우정",
    openQuestions: "토끼는 언제 자라를 다시 믿게 될까?\n용궁의 이야기 잔치에서는 무슨 일이 생길까?",
    freeNotes: "처음에는 서로 거리를 두고, 마지막에는 같은 방향을 바라보게 연출한다.",
  },
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: ["토끼", "자라"],
  updatedAt: "아직 업데이트 전",
  chapters: [
    {
      id: "chapter-1",
      order: 1,
      title: "평화로운 들판",
      summary: "토끼 앞에 지친 자라가 나타납니다.",
      purpose: "두 인물이 다시 만나고 자라의 부탁을 듣는 시작 부분",
      mood: "평화로움에서 궁금함으로",
      keyEvents: "자라가 토끼를 찾아온다.\n토끼가 자라의 말을 들어 보기로 한다.",
      nextChapterIdea: "자라가 용궁의 이야기 잔치를 소개한다.",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.rabbit-suspicious",
        "rabbit-turtle.character.turtle-unified-720x900",
        "rabbit-turtle.character.turtle-tired",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      ],
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
    },
    {
      id: "chapter-2",
      order: 2,
      title: "수상한 초대",
      summary: "자라는 토끼에게 용궁 이야기를 꺼냅니다.",
      purpose: "두 친구가 새로운 모험을 선택하는 전개 부분",
      mood: "의심 · 기대",
      keyEvents: "자라가 이야기 잔치를 소개한다.\n토끼가 결말을 직접 정할 수 있는지 묻는다.",
      nextChapterIdea: "두 친구가 용궁에 도착한다.",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-suspicious",
        "rabbit-turtle.character.rabbit-thinking",
        "rabbit-turtle.character.rabbit-speaking-truth",
        "rabbit-turtle.character.turtle-offer",
        "rabbit-turtle.character.turtle-ashamed",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-shore",
      ],
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-shore",
      leftAssetId: "rabbit-turtle.character.rabbit-suspicious",
      rightAssetId: "rabbit-turtle.character.turtle-offer",
    },
    {
      id: "chapter-3",
      order: 3,
      title: "새로운 용궁",
      summary: "두 친구가 새로운 이야기를 시작합니다.",
      purpose: "두 인물이 함께 새로운 결말을 만드는 마무리 부분",
      mood: "놀라움 · 설렘",
      keyEvents: "두 친구가 용궁에 도착한다.\n토끼가 새로운 이야기를 시작하자고 말한다.",
      nextChapterIdea: "",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-shocked",
        "rabbit-turtle.character.turtle-unified-720x900",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
      ],
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
      leftAssetId: "rabbit-turtle.character.rabbit-shocked",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
    },
  ],
  lines: [
    {
      id: "line-1",
      chapterId: "chapter-1",
      order: 1,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "따뜻한 햇살이 비치는 들판에서 토끼가 풀잎을 바라보고 있었습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "이야기가 시작되는 들판의 분위기를 보여 줍니다.",
      emotionNote: "토끼: 평온함",
      directionNote: "따뜻한 들판 배경을 유지합니다.",
    },
    {
      id: "line-2",
      chapterId: "chapter-1",
      order: 2,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "토끼야, 오랜만이야. 이번에는 너를 속이러 온 게 아니야.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId: "rabbit-turtle.character.turtle-tired",
      backgroundId: "",
      purposeNote: "자라가 다시 나타난 이유를 궁금하게 만듭니다.",
      emotionNote: "자라: 조심스러움 · 토끼: 경계",
      directionNote: "",
    },
    {
      id: "line-3",
      chapterId: "chapter-1",
      order: 3,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "그래? 그렇다면 무슨 일인지 먼저 들어 볼게.",
      leftAssetId: "rabbit-turtle.character.rabbit-suspicious",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 대화를 받아들이며 다음 장면으로 이어집니다.",
      emotionNote: "토끼: 의심하지만 차분함",
      directionNote: "",
    },
    {
      id: "line-4",
      chapterId: "chapter-2",
      order: 1,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "용궁에서 모두가 함께 만드는 큰 이야기 잔치를 연대.",
      leftAssetId: "rabbit-turtle.character.rabbit-thinking",
      rightAssetId: "rabbit-turtle.character.turtle-offer",
      backgroundId: "",
      purposeNote: "용궁으로 갈 이유를 제시합니다.",
      emotionNote: "자라: 기대 · 토끼: 고민",
      directionNote: "",
    },
    {
      id: "line-5",
      chapterId: "chapter-2",
      order: 2,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "이번에는 내가 결말을 정해도 되는 거지?",
      leftAssetId: "rabbit-turtle.character.rabbit-speaking-truth",
      rightAssetId: "rabbit-turtle.character.turtle-ashamed",
      backgroundId: "",
      purposeNote: "토끼가 자신의 조건을 분명하게 말합니다.",
      emotionNote: "토끼: 단호함 · 자라: 미안함",
      directionNote: "",
    },
    {
      id: "line-6",
      chapterId: "chapter-3",
      order: 1,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "두 친구는 환한 용궁 연회장에 도착했습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "새로운 장소로 전환합니다.",
      emotionNote: "두 친구: 놀라움",
      directionNote: "환한 연회장 배경을 강조합니다.",
    },
    {
      id: "line-7",
      chapterId: "chapter-3",
      order: 2,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "와! 이제부터는 우리가 새로운 이야기를 만드는 거야.",
      leftAssetId: "rabbit-turtle.character.rabbit-shocked",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "두 친구가 함께 이야기를 만들겠다고 선언합니다.",
      emotionNote: "토끼: 설렘 · 자라: 기쁨",
      directionNote: "",
    },
  ],
};

export function createBlankProject(): StoryProject {
  return {
    id: `story-${Date.now()}`,
    title: "",
    description: "",
    planning: {
      premise: "",
      theme: "",
      mainCharacter: "",
      mainGoal: "",
      centralProblem: "",
      endingChange: "",
      opening: "",
      middle: "",
      ending: "",
      characterNotes: "",
      mood: "",
      openQuestions: "",
      freeNotes: "",
    },
    sheetUrl: "",
    sheetEditable: false,
    speakerNames: [],
    updatedAt: "아직 업데이트 전",
    chapters: [],
    lines: [],
  };
}

export function cloneProject(project: StoryProject): StoryProject {
  const cloned = JSON.parse(JSON.stringify(project)) as StoryProject;
  cloned.planning = {
    premise: cloned.planning?.premise ?? "",
    theme: cloned.planning?.theme ?? "",
    mainCharacter: cloned.planning?.mainCharacter ?? "",
    mainGoal: cloned.planning?.mainGoal ?? "",
    centralProblem: cloned.planning?.centralProblem ?? "",
    endingChange: cloned.planning?.endingChange ?? "",
    opening: cloned.planning?.opening ?? "",
    middle: cloned.planning?.middle ?? "",
    ending: cloned.planning?.ending ?? "",
    characterNotes: cloned.planning?.characterNotes ?? "",
    mood: cloned.planning?.mood ?? "",
    openQuestions: cloned.planning?.openQuestions ?? "",
    freeNotes: cloned.planning?.freeNotes ?? "",
  };
  const namesFromLines = cloned.lines
    .filter((line) => line.type === "dialogue")
    .map((line) => line.speakerName.trim())
    .filter(Boolean);
  cloned.speakerNames = Array.from(
    new Set([...(cloned.speakerNames ?? []), ...namesFromLines]),
  );
  cloned.lines = (cloned.lines ?? []).map((line) => ({
    ...line,
    purposeNote: line.purposeNote ?? "",
    emotionNote: line.emotionNote ?? "",
    directionNote: line.directionNote ?? "",
  }));
  cloned.chapters = (cloned.chapters ?? []).map((chapter) => {
    const chapterLines = cloned.lines.filter(
      (line) => line.chapterId === chapter.id,
    );
    const usedCharacterIds = chapterLines.flatMap((line) => [
      line.leftAssetId,
      line.rightAssetId,
    ]);
    const usedBackgroundIds = chapterLines.map((line) => line.backgroundId);
    return {
      ...chapter,
      purpose: chapter.purpose ?? "",
      mood: chapter.mood ?? "",
      keyEvents: chapter.keyEvents ?? "",
      nextChapterIdea: chapter.nextChapterIdea ?? "",
      chapterSpeakerNames: Array.from(
        new Set([
          ...(chapter.chapterSpeakerNames ?? []),
          ...chapterLines
            .filter((line) => line.type === "dialogue")
            .map((line) => line.speakerName)
            .filter(Boolean),
        ]),
      ),
      characterAssetIds: Array.from(
        new Set(
          [
            ...(chapter.characterAssetIds ?? []),
            chapter.leftAssetId,
            chapter.rightAssetId,
            ...usedCharacterIds,
          ].filter(Boolean),
        ),
      ),
      backgroundAssetIds: Array.from(
        new Set(
          [
            ...(chapter.backgroundAssetIds ?? []),
            chapter.backgroundId,
            ...usedBackgroundIds,
          ].filter(Boolean),
        ),
      ),
    };
  });
  return cloned;
}
