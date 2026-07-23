export type Chapter = {
  id: string;
  order: number;
  title: string;
  summary: string;
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
};

export type StoryProject = {
  id: string;
  title: string;
  description: string;
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
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-shore",
      leftAssetId: "rabbit-turtle.character.rabbit-suspicious",
      rightAssetId: "rabbit-turtle.character.turtle-offer",
    },
    {
      id: "chapter-3",
      order: 3,
      title: "새로운 용궁",
      summary: "두 친구가 새로운 이야기를 시작합니다.",
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
    },
  ],
};

export function createBlankProject(): StoryProject {
  return {
    id: `story-${Date.now()}`,
    title: "",
    description: "",
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
  const namesFromLines = cloned.lines
    .filter((line) => line.type === "dialogue")
    .map((line) => line.speakerName.trim())
    .filter(Boolean);
  cloned.speakerNames = Array.from(
    new Set([...(cloned.speakerNames ?? []), ...namesFromLines]),
  );
  return cloned;
}
