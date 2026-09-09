import type { StoryCover } from "./story-cover";
export type { StoryCover } from "./story-cover";
import type { StorySceneEffect } from "./story-scene-effect";
export type { StorySceneEffect } from "./story-scene-effect";
import type { CreativeMemo } from "./creative-memos";
import {
  canonicalizeStoryStageKeys,
  type StoryStageKey,
} from "./story-stages";

export type { StoryStageKey };

export type Chapter = {
  id: string;
  order: number;
  title: string;
  summary: string;
  purpose: string;
  mood: string;
  keyEvents: string;
  nextChapterIdea: string;
  storyStageKeys: StoryStageKey[];
  chapterSpeakerNames: string[];
  characterAssetIds: string[];
  backgroundAssetIds: string[];
  backgroundId: string;
  leftAssetId: string;
  rightAssetId: string;
};

export type StoryLine = {
  flow?: import("./story-flow").StoryFlow;
  effect?: StorySceneEffect;
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
  structureMode: "five" | "four" | "three";
  material: string;
  theme: string;
  mainCharacter: string;
  mainGoal: string;
  centralProblem: string;
  stakes: string;
  endingChange: string;
  opening: string;
  middle: string;
  crisis: string;
  climax: string;
  ending: string;
  characterNotes: string;
  worldNotes: string;
  mood: string;
  openQuestions: string;
  freeNotes: string;
};

export type StoryProject = {
  cover?: StoryCover;
  id: string;
  title: string;
  description: string;
  continuation?: {
    chapterId: string;
    lineId: string;
    label: string;
  };
  planning: StoryPlanning;
  creativeMemos: CreativeMemo[];
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
  description: "말보다 행동으로 믿음을 다시 쌓아 가는 토끼와 자라의 이야기",
  planning: {
    premise:
      "자라에게 다시 용궁으로 가자는 부탁을 받은 토끼는 지난 속임수를 떠올리지만, 약속을 확인하며 함께 새 이야기를 시작합니다.",
    structureMode: "five",
    material:
      "지난 모험 뒤 다시 만난 토끼와 자라가 용궁 이야기 잔치에 함께 갈지 정한다.",
    theme: "깨진 믿음은 솔직한 말과 지키는 행동으로 다시 쌓을 수 있다.",
    mainCharacter: "토끼",
    mainGoal:
      "자라가 정말 달라졌는지 확인하고, 안심할 수 있는 방법으로 용궁에 가고 싶다.",
    centralProblem:
      "자라는 진심으로 사과하지만, 토끼는 지난번에 좋은 말만 믿었다가 목숨을 잃을 뻔했다.",
    stakes:
      "무조건 거절하면 두 친구의 관계는 끊어지고, 확인하지 않고 따라가면 토끼가 다시 위험해질 수 있다.",
    endingChange:
      "토끼는 의심만 하던 태도에서 약속을 확인하고 선택하는 태도로, 자라는 말로 설득하던 태도에서 행동으로 믿음을 보이는 태도로 달라진다.",
    opening:
      "자라는 들판의 토끼를 찾아와 지난 일을 사과하고 용궁 이야기 잔치에 함께 가자고 부탁한다.",
    middle:
      "자라는 초대의 목적과 자신의 두려움을 숨김없이 말하지만, 토끼는 지난 속임수를 떠올리며 쉽게 믿지 못한다.",
    crisis:
      "토끼는 좋은 말만으로는 다시 따라갈 수 없다며 초대를 거절하려 한다.",
    climax:
      "토끼가 안전하게 다녀오기 위한 세 가지 조건을 말하고, 자라는 용궁 패를 먼저 건네며 모두 지키겠다고 약속한다.",
    ending:
      "자라는 토끼가 고른 길을 따라가고, 두 친구는 용궁에서 첫 문장을 함께 쓰며 새로운 관계를 시작한다.",
    characterNotes:
      "토끼: 영리하지만 지난 상처 때문에 조심스럽다. 막연히 믿거나 거절하지 않고 확인할 방법을 찾는다.\n자라: 미안함과 실패할까 봐 두려운 마음을 숨기지 않는다. 마지막에는 토끼가 정한 조건을 행동으로 지킨다.",
    worldNotes:
      "들판에서는 두 인물이 거리를 두고 마주 봅니다. 바닷가에서는 토끼가 앞장서며 관계가 달라졌음을 보여 줍니다. 용궁에서는 두 인물이 같은 방향을 바라봅니다.",
    mood: "조심스러움 → 솔직함 → 긴장 → 안도 → 설렘",
    openQuestions:
      "용궁에서 두 친구는 어떤 이야기를 만들까?\n용왕은 달라진 두 친구를 보고 무엇이라고 말할까?",
    freeNotes:
      "각 장은 앞 장의 말이나 행동 때문에 다음 일이 생기도록 구성합니다. 처음에는 서로 떨어져 서고, 마지막에는 같은 방향을 바라보게 연출합니다.",
  },
  creativeMemos: [],
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: ["토끼", "자라"],
  updatedAt: "기본 예시 이야기",
  chapters: [
    {
      id: "chapter-1",
      order: 1,
      title: "뜻밖의 재회",
      summary:
        "자라는 부탁보다 사과를 먼저 건네고, 토끼는 경계하면서도 이야기를 들어 보기로 합니다.",
      purpose: "지난 사건으로 멀어진 두 인물과 아직 남은 불신을 보여 주는 발단",
      mood: "평온함 → 경계 → 조심스러운 궁금함",
      keyEvents:
        "자라가 초대장을 들고 토끼를 찾아온다.\n자라가 지난 일을 먼저 사과한다.\n토끼가 이야기를 끝까지 들어 보기로 한다.",
      nextChapterIdea: "자라가 찾아온 진짜 목적과 숨기고 싶었던 마음을 밝힌다.",
      storyStageKeys: ["opening"],
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.turtle-unified-720x900",
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
      title: "숨기지 않은 부탁",
      summary:
        "자라는 용궁 잔치에 토끼가 필요한 까닭과 혼자서는 실패할까 두려웠던 마음까지 털어놓습니다.",
      purpose: "주인공이 선택해야 할 목표를 제시하고 자라의 달라진 태도를 보여 주는 전개",
      mood: "기대 → 의심 → 솔직함",
      keyEvents:
        "자라가 함께 이야기를 완성해 달라고 부탁한다.\n토끼가 왜 자신을 찾아왔는지 묻는다.\n자라가 목적과 두려움을 숨김없이 말한다.",
      nextChapterIdea: "토끼가 지난 속임수를 떠올리며 이번 말도 믿을 수 있는지 묻는다.",
      storyStageKeys: ["middle"],
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.turtle-unified-720x900",
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
      id: "chapter-3",
      order: 3,
      title: "다시 믿기 어려운 까닭",
      summary:
        "토끼는 사과를 들었어도 지난 위험을 잊을 수 없다며 초대를 거절하려 합니다.",
      purpose: "주인공의 상처와 두려움이 가장 크게 드러나는 위기",
      mood: "솔직함 → 서운함 → 팽팽한 긴장",
      keyEvents:
        "토끼가 지난 속임수로 목숨을 잃을 뻔한 일을 말한다.\n자라는 서둘러 설득하지 않고 토끼의 대답을 기다린다.\n토끼는 말이 아니라 확인할 방법이 필요하다고 말한다.",
      nextChapterIdea: "토끼가 함께 가기 위해 꼭 지켜야 할 조건을 제시한다.",
      storyStageKeys: ["crisis"],
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.turtle-unified-720x900",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      ],
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
    },
    {
      id: "chapter-4",
      order: 4,
      title: "믿음을 확인하는 약속",
      summary:
        "토끼는 세 가지 조건을 말하고, 자라는 용궁 패를 먼저 건네며 행동으로 약속을 보여 줍니다.",
      purpose: "주인공이 문제를 피하지 않고 안전한 선택을 만들어 내는 절정",
      mood: "긴장 → 결심 → 조심스러운 안도",
      keyEvents:
        "토끼가 길·진실·귀환에 관한 세 가지 조건을 말한다.\n자라가 조건을 받아들이고 용궁 패를 먼저 건넨다.\n자라는 토끼가 고른 길을 따라간다.",
      nextChapterIdea: "두 친구가 지킨 첫 약속을 바탕으로 용궁에서 함께 이야기를 시작한다.",
      storyStageKeys: ["climax"],
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.turtle-unified-720x900",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-shore",
      ],
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-shore",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
    },
    {
      id: "chapter-5",
      order: 5,
      title: "함께 쓴 첫 문장",
      summary:
        "용궁에 도착한 토끼와 자라는 어느 한쪽이 아닌 두 사람의 이야기로 첫 문장을 완성합니다.",
      purpose: "인물의 행동과 관계가 처음과 어떻게 달라졌는지 보여 주는 결말",
      mood: "안도 → 설렘 → 함께하는 기쁨",
      keyEvents:
        "자라가 토끼의 선택을 끝까지 존중한다.\n두 친구가 용궁의 빈 이야기책 앞에 선다.\n첫 문장을 함께 정한다.",
      nextChapterIdea: "",
      storyStageKeys: ["ending"],
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.turtle-unified-720x900",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
      ],
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
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
      text: "따뜻한 들판에서 풀잎을 고르던 토끼 앞에, 두루마리 하나를 꼭 쥔 자라가 숨을 헐떡이며 나타났습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "평온한 일상에 자라가 나타나며 이야기를 시작합니다.",
      emotionNote: "토끼: 평온함에서 경계로 · 자라: 긴장",
      directionNote: "두 인물이 거리를 둔 채 마주 보게 합니다.",
    },
    {
      id: "line-2",
      chapterId: "chapter-1",
      order: 2,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "(숨을 고르며) 토끼야, 지난 일은 정말 미안해. 부탁을 꺼내기 전에 그 말부터 하고 싶었어.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "자라가 부탁보다 사과를 먼저 하며 달라진 태도를 보여 줍니다.",
      emotionNote: "자라: 미안함 · 토끼: 경계",
      directionNote: "",
    },
    {
      id: "line-3",
      chapterId: "chapter-1",
      order: 3,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "부탁부터 꺼내지 않은 건 처음이네. 믿겠다는 뜻은 아니지만, 무슨 일인지는 끝까지 들어 볼게.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 경계를 풀지는 않되 대화할 기회를 줍니다.",
      emotionNote: "토끼: 경계 · 차분함",
      directionNote: "",
    },
    {
      id: "line-4",
      chapterId: "chapter-2",
      order: 1,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "용궁에서 서로 다른 이야기를 모아 큰 잔치를 연대. 그런데 마지막 이야기가 아직 비어 있어. 네 지혜를 빌려 함께 완성하고 싶어.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "자라가 초대의 목적과 토끼에게 바라는 일을 구체적으로 밝힙니다.",
      emotionNote: "자라: 기대 · 토끼: 의심",
      directionNote: "",
    },
    {
      id: "line-5",
      chapterId: "chapter-2",
      order: 2,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "용궁에도 글 잘 쓰는 이가 많을 텐데 왜 하필 나야? 듣기 좋은 말로 나를 데려가려는 건 아니지?",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 초대를 바로 받아들이지 않고 목적을 확인합니다.",
      emotionNote: "토끼: 의심 · 자라: 망설임",
      directionNote: "",
    },
    {
      id: "line-6",
      chapterId: "chapter-2",
      order: 3,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "(고개를 숙이며) 혼자 이야기를 맡았다가 잔치를 망칠까 두려웠어. 그래서 가장 지혜로운 너를 떠올렸어. 이번에는 가는 까닭도, 돌아올 때도 숨기지 않을게.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "자라가 초대의 목적뿐 아니라 자신의 두려움까지 솔직하게 말합니다.",
      emotionNote: "자라: 부끄러움 · 진심 · 토끼: 흔들림",
      directionNote: "",
    },
    {
      id: "line-7",
      chapterId: "chapter-3",
      order: 1,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "미안하다는 말은 들었어. 하지만 좋은 말만 믿고 따라갔다가 목숨을 잃을 뻔한 일도 잊을 수 없어.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 쉽게 믿지 못하는 까닭을 분명하게 말합니다.",
      emotionNote: "토끼: 두려움 · 단호함 · 자라: 죄책감",
      directionNote: "",
    },
    {
      id: "line-8",
      chapterId: "chapter-3",
      order: 2,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "자라는 서둘러 변명하지 않았습니다. 토끼가 낡은 초대장의 글자를 하나씩 확인하는 동안, 그 자리에 가만히 서서 기다렸습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "자라가 말로 재촉하지 않고 기다리는 행동으로 변화를 보여 줍니다.",
      emotionNote: "토끼: 신중함 · 자라: 기다림",
      directionNote: "두 인물 사이의 조용한 긴장을 유지합니다.",
    },
    {
      id: "line-9",
      chapterId: "chapter-3",
      order: 3,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "글은 확인할 수 있지만 네 마음까지 확인할 수는 없어. 다시 함께 가려면 말이 아니라 지킬 수 있는 약속이 필요해.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 단순한 거절 대신 문제를 해결할 기준을 찾아냅니다.",
      emotionNote: "토끼: 결심 · 자라: 긴장",
      directionNote: "다음 장의 조건 제시로 바로 이어집니다.",
    },
    {
      id: "line-10",
      chapterId: "chapter-4",
      order: 1,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "첫째, 가는 길은 내가 고를 것. 둘째, 무슨 일이든 숨기지 않을 것. 셋째, 내가 돌아오겠다고 하면 바로 데려다줄 것. 이 세 가지를 약속할 수 있어?",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 두려움을 구체적인 해결 조건으로 바꿉니다.",
      emotionNote: "토끼: 단호함 · 자라: 집중",
      directionNote: "바닷가에서 토끼가 주도권을 잡은 모습으로 전환합니다.",
    },
    {
      id: "line-11",
      chapterId: "chapter-4",
      order: 2,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "모두 약속할게. 그리고 이 용궁 패를 네가 먼저 가지고 있어. 네가 내 말을 확인한 뒤에 출발하자.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "자라가 중요한 물건을 먼저 건네며 약속을 행동으로 확인시킵니다.",
      emotionNote: "자라: 결심 · 토끼: 놀람",
      directionNote: "",
    },
    {
      id: "line-12",
      chapterId: "chapter-4",
      order: 3,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "토끼는 초대장의 길과 용궁 패의 무늬를 차례로 살폈습니다. 자라는 앞서가지 않고 토끼가 고른 바닷길 입구 옆에서 기다렸습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "두 인물이 약속을 실제 행동으로 옮기는 첫 순간을 보여 줍니다.",
      emotionNote: "토끼: 신중함에서 안도로 · 자라: 기다림",
      directionNote: "토끼가 먼저 움직이고 자라가 뒤따르게 합니다.",
    },
    {
      id: "line-13",
      chapterId: "chapter-4",
      order: 4,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "좋아. 이번에는 내가 고른 길로 가 보자. 약속을 지키는지는 가는 동안에도 계속 확인할 거야.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 스스로 판단한 뒤 새로운 모험을 선택합니다.",
      emotionNote: "토끼: 조심스러운 믿음 · 자라: 안도",
      directionNote: "",
    },
    {
      id: "line-14",
      chapterId: "chapter-5",
      order: 1,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "용궁에 도착할 때까지 자라는 길과 시간을 빠짐없이 알려 주었습니다. 환한 연회장 가운데에는 아직 아무 글도 적히지 않은 큰 이야기책이 놓여 있었습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "자라가 약속을 지켰음을 보여 주고 마지막 공동 과제를 제시합니다.",
      emotionNote: "토끼: 안도 · 두 친구: 설렘",
      directionNote: "두 인물이 같은 방향에서 빈 이야기책을 바라보게 합니다.",
    },
    {
      id: "line-15",
      chapterId: "chapter-5",
      order: 2,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "첫 문장은 네가 정해 줘. 나는 네가 고른 이야기를 끝까지 따라갈게.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "자라가 토끼의 선택을 존중하는 태도를 마지막까지 이어 갑니다.",
      emotionNote: "자라: 믿음 · 토끼: 기쁨",
      directionNote: "",
    },
    {
      id: "line-16",
      chapterId: "chapter-5",
      order: 3,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "아니, 첫 문장은 함께 쓰자. ‘두 친구는 서로의 말을 확인하며 새로운 길을 골랐습니다.’ 어때?",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 관계의 변화를 한 문장으로 보여 주며 이야기를 마칩니다.",
      emotionNote: "토끼와 자라: 기쁨 · 새로운 믿음",
      directionNote: "마지막에는 두 인물이 같은 크기와 거리로 보이게 합니다.",
    },
  ],
};

const RABBIT_TURTLE_TEMPLATE_ASSETS = {
  background: {
    palace:
      "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
    flashback:
      "rabbit-turtle.background.rabbit-turtle-bg-flashback-rescue",
    grassland: "rabbit-turtle.background.rabbit-turtle-bg-grassland",
    trap: "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
  },
  character: {
    turtle: "rabbit-turtle.character.turtle-unified-720x900",
    childTurtle: "rabbit-turtle.character.turtle-child-unified-720x900",
    rabbit: "rabbit-turtle.character.rabbit-white-unified-720x900",
    dragonKing: "rabbit-turtle.character.dragonking-unified-720x900",
    youngDragonKing:
      "rabbit-turtle.character.dragonking-young-unified-720x900",
    physician: "rabbit-turtle.character.physician-unified-720x900",
  },
} as const;

type TemplateScene = Omit<StoryLine, "chapterId" | "order">;

function templateLines(
  chapterId: string,
  scenes: TemplateScene[],
): StoryLine[] {
  return scenes.map((scene, index) => ({
    ...scene,
    chapterId,
    order: index + 1,
  }));
}

function originalScene({
  id,
  type = "narration",
  speaker = "narration",
  speakerName = "해설",
  text,
  leftAssetId,
  rightAssetId,
  backgroundId,
  purposeNote = "준비된 앞 컷을 이어갑니다.",
  emotionNote = "",
  directionNote = "",
}: Partial<TemplateScene> &
  Pick<
    TemplateScene,
    "id" | "text" | "leftAssetId" | "rightAssetId" | "backgroundId"
  >): TemplateScene {
  return {
    id,
    type,
    speaker,
    speakerName,
    text,
    leftAssetId,
    rightAssetId,
    backgroundId,
    purposeNote,
    emotionNote,
    directionNote,
  };
}

const RT = RABBIT_TURTLE_TEMPLATE_ASSETS;

// 앞이야기는 전래 줄거리의 위기까지 새 문장으로 구성한다.
// 출전·각색 범위: docs/storygame-detailed-design.md §6.1.
// 기존 학생 작품은 자체 데이터를 저장하므로 이 상수 변경으로 교체하지 않는다.
const OG = {
  background: {
    court: "onggojib.background.magistrate-yard-pixel",
    home: "onggojib.background.winter-courtyard-pixel",
  },
  character: {
    real: "onggojib.character.real-angry-pixel",
    double: "onggojib.character.double-blue-gentle-consistent-pixel",
    wife: "onggojib.character.wife-concerned-pixel",
    magistrate: "onggojib.character.magistrate-command-pixel",
    posol: "onggojib.character.posol-pixel",
  },
} as const;

function templateChapter(
  chapter: Pick<Chapter, "id" | "order" | "title" | "summary" | "storyStageKeys" |
    "backgroundId" | "leftAssetId" | "rightAssetId">,
  speakerNames: string[],
  characterAssetIds: string[],
  backgroundAssetIds: string[],
): Chapter {
  return {
    purpose: "",
    mood: "",
    keyEvents: "",
    nextChapterIdea: "",
    chapterSpeakerNames: [...speakerNames],
    characterAssetIds: [...characterAssetIds],
    backgroundAssetIds: [...backgroundAssetIds],
    ...chapter,
  };
}

const rabbitSpeakers = ["토끼", "자라", "용왕", "의관"];
const rabbitCharacters = [RT.character.rabbit, RT.character.turtle, RT.character.dragonKing, RT.character.physician];
const rabbitBackgrounds = [RT.background.palace, RT.background.grassland, RT.background.trap];
const rabbitPalaceStage = { backgroundId: RT.background.palace, leftAssetId: RT.character.dragonKing, rightAssetId: RT.character.turtle };
const rabbitLandStage = { backgroundId: RT.background.grassland, leftAssetId: RT.character.rabbit, rightAssetId: RT.character.turtle };
const rabbitCrisisStage = { ...rabbitLandStage, backgroundId: RT.background.trap };

export const RABBIT_TURTLE_CONTINUATION_TEMPLATE: StoryProject = {
  ...createBlankProject(),
  // 이미 저장한 용궁 템플릿의 ID/이어쓰기 위치와 호환된다.
  id: "template-rabbit-turtle-palace-capture",
  title: "토끼와 자라: 용궁에서 위기에 처하다",
  description: "용궁에 온 토끼가 간을 내놓으라는 말을 들었어요. 여기서부터 이야기를 바꿔 써요.",
  continuation: {
    chapterId: "palace-continuation-chapter-2",
    lineId: "palace-continuation-line-7",
    label: "위기에 처한 토끼의 다음 말",
  },
  planning: {
    ...createBlankProject().planning,
    premise: "자라를 따라 용궁에 온 토끼가 목숨을 잃을 위기에 놓였다.",
    material: "전래동화 토끼와 자라의 앞이야기를 이어쓰기용으로 다시 쓴 글",
    mainCharacter: "토끼",
    centralProblem: "용왕의 병을 고친다며 토끼의 간을 요구한다.",
    opening: "병든 용왕은 토끼의 간이 약이 된다는 말을 듣고 자라를 육지로 보낸다.",
    middle: "자라는 용궁의 좋은 점을 이야기하고, 토끼는 자라의 등에 올라 용궁으로 간다.",
    crisis: "용궁에서 토끼는 초대의 진짜 이유를 알게 되고 붙잡힌다.",
    openQuestions: "이 말을 들은 토끼는 무엇을 말하거나 행동할까?",
  },
  speakerNames: rabbitSpeakers,
  updatedAt: "준비된 이어쓰기 템플릿",
  chapters: [
    templateChapter({
      id: "palace-origin-dilemma", order: 1, title: "병든 용왕의 부탁",
      summary: "용왕의 병을 고칠 약을 구하러 자라가 육지로 떠납니다.",
      storyStageKeys: ["opening"], ...rabbitPalaceStage,
    }, rabbitSpeakers, rabbitCharacters, rabbitBackgrounds),
    templateChapter({
      id: "palace-origin-invitation", order: 2, title: "자라를 따라 바닷속으로",
      summary: "토끼는 자라가 들려주는 용궁 이야기에 마음이 끌립니다.",
      storyStageKeys: ["middle"], ...rabbitLandStage,
    }, rabbitSpeakers, rabbitCharacters, rabbitBackgrounds),
    templateChapter({
      id: "palace-continuation-chapter-1", order: 3, title: "용궁에서 드러난 속셈",
      summary: "토끼는 용왕 앞에서 자신을 데려온 까닭을 알게 됩니다.",
      storyStageKeys: ["crisis"], ...rabbitCrisisStage,
    }, rabbitSpeakers, rabbitCharacters, rabbitBackgrounds),
    templateChapter({
      id: "palace-continuation-chapter-2", order: 4, title: "여기서부터 이어 쓰기",
      summary: "", storyStageKeys: [], ...rabbitCrisisStage,
    }, rabbitSpeakers, rabbitCharacters, rabbitBackgrounds),
  ],
  lines: [
    ...templateLines("palace-origin-dilemma", [
      originalScene({ id: "rabbit-prefix-1", ...rabbitPalaceStage,
        text: "깊은 바닷속 용궁에 병든 용왕이 누워 있었다. 여러 약을 써 보아도 병은 좀처럼 낫지 않았다." }),
      originalScene({ id: "rabbit-prefix-2", ...rabbitPalaceStage,
        text: "토끼의 간이 약이 된다는 말을 듣자, 용왕은 신하들에게 육지로 가서 토끼를 데려오라고 했다." }),
      originalScene({ id: "rabbit-prefix-3", ...rabbitPalaceStage,
        type: "dialogue", speaker: "right", speakerName: "자라",
        text: "제가 육지에 다녀오겠습니다." }),
    ]),
    ...templateLines("palace-origin-invitation", [
      originalScene({ id: "rabbit-prefix-4", ...rabbitLandStage,
        text: "육지에 오른 자라는 풀밭에서 토끼를 만났다. 간이 필요하다는 말은 꺼내지 않은 채 용궁 이야기를 들려주었다." }),
      originalScene({ id: "rabbit-prefix-5", ...rabbitLandStage,
        type: "dialogue", speaker: "right", speakerName: "자라",
        text: "바닷속에는 눈부신 궁궐이 있소. 맛있는 음식도 가득하지요. 나와 함께 구경 가지 않겠소?" }),
      originalScene({ id: "rabbit-prefix-6", ...rabbitLandStage,
        type: "dialogue", speaker: "left", speakerName: "토끼",
        text: "바닷속 궁궐이라고? 가 보고 싶지만 나는 헤엄을 칠 줄 모르는데." }),
      originalScene({ id: "rabbit-prefix-7", ...rabbitLandStage,
        text: "자라는 자기 등에 타면 된다고 했다. 토끼는 자라의 등에 올라 바닷속 용궁으로 향했다." }),
    ]),
    ...templateLines("palace-continuation-chapter-1", [
      originalScene({ id: "rabbit-prefix-8", ...rabbitCrisisStage,
        text: "용궁에 도착하자 토끼는 용왕 앞으로 안내되었다. 그런데 구경을 시켜 준다던 자라의 말과 달리, 호위들이 토끼의 둘레를 에워쌌다." }),
      originalScene({ id: "rabbit-prefix-9", ...rabbitCrisisStage,
        rightAssetId: RT.character.dragonKing,
        type: "dialogue", speaker: "right", speakerName: "용왕",
        text: "내 병을 고치려면 네 간이 필요하다. 어서 토끼를 붙잡아라!" }),
      originalScene({ id: "rabbit-prefix-10", ...rabbitCrisisStage,
        text: "호위들이 토끼를 붙잡았다. 토끼는 그제야 자신이 왜 용궁에 왔는지 알았다. 모두가 토끼를 바라보았다." }),
    ]),
    ...templateLines("palace-continuation-chapter-2", [
      originalScene({ id: "palace-continuation-line-7", ...rabbitCrisisStage,
        type: "dialogue", speaker: "left", speakerName: "토끼", text: "",
        purposeNote: "위기에 처한 토끼의 다음 말이나 행동부터 이어 써 보세요. 화자를 바꾸거나 해설로 시작해도 괜찮아요. (팁: 선택지가 없어도 하나의 완결된 멋진 이야기를 만들 수 있어요.)" }),
    ]),
  ],
};

const onggojibSpeakers = ["진짜 옹고집", "가짜 옹고집", "부인", "사또", "포졸"];
const onggojibCharacters = Object.values(OG.character);
const onggojibBackgrounds = Object.values(OG.background);
const onggojibHomeStage = { backgroundId: OG.background.home, leftAssetId: OG.character.real, rightAssetId: OG.character.wife };
const onggojibConflictStage = { ...onggojibHomeStage, rightAssetId: OG.character.double };
const onggojibCourtStage = { ...onggojibConflictStage, backgroundId: OG.background.court };

export const ONGGOJIB_CONTINUATION_TEMPLATE: StoryProject = {
  ...createBlankProject(),
  // 저장 포맷이나 이전 작품의 식별자는 변경하지 않는다.
  id: "template-onggojib-wife-choice",
  title: "옹고집전: 처음 재판장에 끌려오다",
  description: "두 옹고집이 처음 관아에 끌려왔어요. 아직 시작되지 않은 재판을 내 이야기로 써요.",
  continuation: {
    chapterId: "onggojib-continuation",
    lineId: "onggojib-continuation-line-1",
    label: "첫 재판장에 선 옹고집의 다음 말",
  },
  planning: {
    ...createBlankProject().planning,
    premise: "똑같이 생긴 두 옹고집이 서로 진짜라고 다투다 처음 재판장에 끌려왔다.",
    material: "전래동화 옹고집전의 앞이야기를 이어쓰기용으로 다시 쓴 글",
    mainCharacter: "진짜 옹고집",
    centralProblem: "집안사람들도 두 옹고집 가운데 누가 진짜인지 가려내지 못한다.",
    opening: "인색한 옹고집은 어려운 사람을 돕지 않고 찾아온 스님도 쫓아낸다.",
    middle: "도승이 만든 가짜 옹고집이 집에 나타나 서로 주인이라고 다툰다.",
    crisis: "다툼을 해결하지 못한 두 옹고집이 처음 관아에 끌려온다.",
    openQuestions: "재판장에 선 옹고집은 무엇을 말하거나 행동할까?",
  },
  speakerNames: onggojibSpeakers,
  updatedAt: "준비된 이어쓰기 템플릿",
  chapters: [
    templateChapter({
      id: "onggojib-origin-home", order: 1, title: "인색한 옹고집",
      summary: "옹고집은 넉넉하게 살면서도 어려운 이웃과 찾아온 스님을 박대합니다.",
      storyStageKeys: ["opening"], ...onggojibHomeStage,
    }, onggojibSpeakers, onggojibCharacters, onggojibBackgrounds),
    templateChapter({
      id: "onggojib-origin-home-conflict", order: 2, title: "똑같은 사람이 나타나다",
      summary: "가짜 옹고집이 찾아와 서로 집주인이라고 다툽니다.",
      storyStageKeys: ["middle"], ...onggojibConflictStage,
    }, onggojibSpeakers, onggojibCharacters, onggojibBackgrounds),
    templateChapter({
      id: "onggojib-origin-court", order: 3, title: "처음 재판장에 끌려오다",
      summary: "두 옹고집이 사또 앞에 섭니다. 아직 문답도 판결도 시작되지 않았습니다.",
      storyStageKeys: ["crisis"], ...onggojibCourtStage,
    }, onggojibSpeakers, onggojibCharacters, onggojibBackgrounds),
    templateChapter({
      id: "onggojib-continuation", order: 4, title: "여기서부터 이어 쓰기",
      summary: "", storyStageKeys: [], ...onggojibCourtStage,
    }, onggojibSpeakers, onggojibCharacters, onggojibBackgrounds),
  ],
  lines: [
    ...templateLines("onggojib-origin-home", [
      originalScene({ id: "onggojib-prefix-1", ...onggojibHomeStage,
        text: "옛날 한 마을에 옹고집이라는 부자가 살았다. 곳간에는 곡식이 가득했지만, 어려운 이웃에게는 한 줌도 나누어 주려 하지 않았다." }),
      originalScene({ id: "onggojib-prefix-2", ...onggojibHomeStage,
        text: "어느 날 스님이 찾아왔다. 옹고집은 스님의 말에 귀를 기울이지 않고 하인들을 불러 문밖으로 쫓아내게 했다." }),
      originalScene({ id: "onggojib-prefix-3", ...onggojibHomeStage,
        leftAssetId: "", rightAssetId: "",
        text: "그 일을 전해 들은 도승은 옹고집을 혼내 주기로 했다. 짚으로 만든 허수아비에 도술을 부리자, 옹고집과 똑같이 생긴 사람이 나타났다." }),
    ]),
    ...templateLines("onggojib-origin-home-conflict", [
      originalScene({ id: "onggojib-prefix-4", ...onggojibConflictStage,
        text: "가짜 옹고집은 옹고집의 집을 찾아가 주인 행세를 했다. 집으로 돌아온 진짜 옹고집은 자신과 똑같이 생긴 사람을 보고 펄쩍 뛰었다." }),
      originalScene({ id: "onggojib-prefix-5", ...onggojibConflictStage,
        type: "dialogue", speaker: "left", speakerName: "진짜 옹고집",
        text: "네가 누구인데 내 집에서 주인 행세를 하느냐!" }),
      originalScene({ id: "onggojib-prefix-6", ...onggojibConflictStage,
        type: "dialogue", speaker: "right", speakerName: "가짜 옹고집",
        text: "무슨 소리냐? 이 집 주인은 바로 나다!" }),
      originalScene({ id: "onggojib-prefix-7", ...onggojibConflictStage,
        text: "두 사람은 한 치도 물러서지 않았다. 부인과 집안사람들도 누구를 믿어야 할지 몰랐다. 결국 이 다툼을 관아에서 가리기로 했다." }),
    ]),
    ...templateLines("onggojib-origin-court", [
      originalScene({ id: "onggojib-court-1", ...onggojibCourtStage,
        text: "포졸들이 두 옹고집을 재판장으로 끌고 왔다. 사또 앞에 나란히 선 두 사람은 서로를 노려보았다. 이제 재판이 시작되려는 참이었다." }),
    ]),
    ...templateLines("onggojib-continuation", [
      originalScene({ id: "onggojib-continuation-line-1", ...onggojibCourtStage,
        type: "dialogue", speaker: "left", speakerName: "진짜 옹고집", text: "",
        purposeNote: "처음 재판장에 끌려온 옹고집의 다음 말이나 행동부터 이어 써 보세요. 사또의 말이나 해설로 시작해도 괜찮아요. (팁: 선택지가 없어도 하나의 완결된 멋진 이야기를 만들 수 있어요.)" }),
    ]),
  ],
};

// 이어쓰기 빈 컷은 편집본에만 둔다. 빠진 컷을 가리키는 메타데이터도
// 플레이 사본에서 제외해야 새로고침 시 유효한 문서로 복원할 수 있다.
export function createContinuationPreview(project: StoryProject): StoryProject {
  const lines = project.lines.filter((line) => line.text.trim());
  return cloneProject({
    ...project,
    continuation: undefined,
    chapters: project.chapters.filter((chapter) =>
      lines.some((line) => line.chapterId === chapter.id),
    ),
    lines,
  });
}

export function createBlankProject(): StoryProject {
  return {
    id: `story-${Date.now()}`,
    title: "",
    description: "",
    planning: {
      premise: "",
      structureMode: "five",
      material: "",
      theme: "",
      mainCharacter: "",
      mainGoal: "",
      centralProblem: "",
      stakes: "",
      endingChange: "",
      opening: "",
      middle: "",
      crisis: "",
      climax: "",
      ending: "",
      characterNotes: "",
      worldNotes: "",
      mood: "",
      openQuestions: "",
      freeNotes: "",
    },
    creativeMemos: [],
    sheetUrl: "",
    sheetEditable: false,
    speakerNames: [],
    updatedAt: "아직 업데이트 전",
    chapters: [],
    lines: [],
  };
}

export function cloneProject(project: StoryProject): StoryProject {
  const serialized = JSON.stringify(project)
    .replaceAll(
      "놀퀴즈 이미지로 시작하는 첫 번째 이야기",
      "준비된 이미지로 시작하는 첫 번째 이야기",
    )
    .replaceAll(
      "pinky-ne-site의 토끼와 자라 원작",
      "토끼와 자라 원작을 각색한 이야기",
    )
    .replaceAll(
      "pinky-ne-site 옹고집전",
      "옹고집전 원작을 각색한 이야기",
    )
    .replaceAll(
      "pinky-ne-site 최신 원작 반영",
      "준비된 이어쓰기 템플릿",
    )
    .replaceAll("pinky-ne-site 최신 원작", "준비된 앞이야기")
    .replaceAll("pinky-ne-site 원작", "준비된 이야기")
    .replaceAll("pinky-ne-site", "준비된 이야기");
  const cloned = JSON.parse(serialized) as StoryProject;
  cloned.planning = {
    premise: cloned.planning?.premise ?? "",
    structureMode: cloned.planning?.structureMode ?? "five",
    material: cloned.planning?.material ?? "",
    theme: cloned.planning?.theme ?? "",
    mainCharacter: cloned.planning?.mainCharacter ?? "",
    mainGoal: cloned.planning?.mainGoal ?? "",
    centralProblem: cloned.planning?.centralProblem ?? "",
    stakes: cloned.planning?.stakes ?? "",
    endingChange: cloned.planning?.endingChange ?? "",
    opening: cloned.planning?.opening ?? "",
    middle: cloned.planning?.middle ?? "",
    crisis: cloned.planning?.crisis ?? "",
    climax: cloned.planning?.climax ?? "",
    ending: cloned.planning?.ending ?? "",
    characterNotes: cloned.planning?.characterNotes ?? "",
    worldNotes: cloned.planning?.worldNotes ?? "",
    mood: cloned.planning?.mood ?? "",
    openQuestions: cloned.planning?.openQuestions ?? "",
    freeNotes: cloned.planning?.freeNotes ?? "",
  };
  cloned.creativeMemos = Array.isArray(cloned.creativeMemos)
    ? cloned.creativeMemos
    : [];
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
      storyStageKeys: canonicalizeStoryStageKeys(chapter.storyStageKeys),
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
