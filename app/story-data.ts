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
  id: string;
  title: string;
  description: string;
  continuation?: {
    chapterId: string;
    lineId: string;
    label: string;
  };
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
    structureMode: "five",
    material: "옛이야기 속 토끼와 자라가 다시 만나 새로운 모험을 선택한다.",
    theme: "정직하게 말하기와 서로 믿는 마음",
    mainCharacter: "토끼와 자라",
    mainGoal: "서로를 다시 믿고 함께 새로운 이야기를 만들고 싶다.",
    centralProblem: "예전에 서로를 속였던 기억 때문에 쉽게 믿기 어렵다.",
    stakes: "다시 믿지 못하면 두 친구는 함께 이야기를 만들 기회를 잃는다.",
    endingChange: "두 친구가 자기 생각을 솔직히 말하고 함께 결말을 정한다.",
    opening: "들판에서 지친 자라가 토끼를 찾아옵니다.",
    middle: "자라는 용궁의 이야기 잔치를 소개하고 토끼는 초대를 의심합니다.",
    crisis: "토끼는 예전에 속았던 기억 때문에 함께 갈지 결정하지 못합니다.",
    climax: "토끼가 원하는 조건을 솔직히 말하고, 자라는 그 조건을 받아들입니다.",
    ending: "두 친구는 용궁에서 자신들이 정한 새로운 이야기를 시작합니다.",
    characterNotes: "토끼는 영리하고 조심스럽습니다. 자라는 미안한 마음을 솔직하게 말하려 합니다.",
    worldNotes: "들판은 편안하고 익숙한 공간, 용궁은 낯설지만 새로운 이야기를 만들 수 있는 공간입니다.",
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

export const RABBIT_TURTLE_CONTINUATION_TEMPLATE: StoryProject = {
  id: "template-rabbit-turtle-land-meeting",
  title: "토끼와 자라: 땅에서 만난 뒤",
  description: "자라가 토끼를 용궁으로 데려갈 방법을 이어 쓰는 이야기",
  continuation: {
    chapterId: "continuation-chapter-2",
    lineId: "continuation-line-6",
    label: "자라의 첫 설득",
  },
  planning: {
    premise: "땅에서 만난 자라는 토끼를 용궁으로 데려가려고 합니다. 그다음 이야기는 어떻게 이어질까요?",
    structureMode: "three",
    material: "용왕의 병을 고치기 위해 토끼를 찾아 땅으로 올라온 자라가 마침내 토끼를 만난다.",
    theme: "",
    mainCharacter: "자라와 토끼",
    mainGoal: "자라는 토끼를 용궁으로 데려가려 한다.",
    centralProblem: "토끼는 용궁에 갈 이유가 없고, 자라는 진짜 목적을 쉽게 말하지 못한다.",
    stakes: "자라가 토끼를 데려가지 못하면 용왕을 도울 다른 방법을 찾아야 한다.",
    endingChange: "",
    opening: "용왕의 병을 고칠 토끼의 간을 구하기 위해 땅으로 나온 자라가 토끼를 만난다.",
    middle: "",
    crisis: "",
    climax: "",
    ending: "",
    characterNotes: "자라는 용왕을 돕고 싶지만 토끼에게 무슨 말을 해야 할지 고민합니다.\n토끼의 성격과 자라를 대하는 태도는 자유롭게 정해 보세요.",
    worldNotes: "이야기는 토끼가 사는 땅 위 들판에서 시작합니다. 이후 장소는 자유롭게 바꿀 수 있습니다.",
    mood: "궁금함 · 긴장",
    openQuestions: "자라는 어떤 말이나 행동으로 토끼의 마음을 움직일까?\n토끼는 왜 따라가거나 거절할까?\n두 인물은 마지막에 어떤 선택을 할까?",
    freeNotes: "자라는 솔직히 말할 수도, 꾀를 낼 수도, 전혀 새로운 방법을 찾을 수도 있습니다.",
  },
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: ["토끼", "자라"],
  updatedAt: "템플릿 시작",
  chapters: [
    {
      id: "continuation-chapter-1",
      order: 1,
      title: "땅에서 만난 토끼와 자라",
      summary: "토끼를 찾아 땅으로 나온 자라가 마침내 토끼를 만납니다.",
      purpose: "학생이 이어 쓰기 전에 알아야 할 시작 상황",
      mood: "궁금함 · 조심스러움",
      keyEvents: "자라가 토끼를 찾는다.\n토끼와 자라가 인사를 나눈다.",
      nextChapterIdea: "자라는 토끼를 용궁으로 데려갈 방법을 생각한다.",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.rabbit-suspicious",
        "rabbit-turtle.character.rabbit-thinking",
        "rabbit-turtle.character.turtle-unified-720x900",
        "rabbit-turtle.character.turtle-resolve",
        "rabbit-turtle.character.turtle-offer",
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
      id: "continuation-chapter-2",
      order: 2,
      title: "여기서부터 이어 쓰기",
      summary: "자라는 토끼에게 무엇이라고 말할까요?",
      purpose: "학생이 자라의 첫 말부터 자유롭게 이어 쓰는 부분",
      mood: "",
      keyEvents: "자라가 토끼에게 말을 건다.\n토끼가 자라의 말에 반응한다.",
      nextChapterIdea: "",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.rabbit-suspicious",
        "rabbit-turtle.character.rabbit-thinking",
        "rabbit-turtle.character.turtle-unified-720x900",
        "rabbit-turtle.character.turtle-resolve",
        "rabbit-turtle.character.turtle-offer",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-grassland",
        "rabbit-turtle.background.rabbit-turtle-bg-shore",
      ],
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      leftAssetId: "rabbit-turtle.character.rabbit-suspicious",
      rightAssetId: "rabbit-turtle.character.turtle-offer",
    },
  ],
  lines: [
    {
      id: "continuation-line-1",
      chapterId: "continuation-chapter-1",
      order: 1,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "용왕의 병을 고치려면 토끼의 간이 필요하다는 말을 들은 자라는 토끼를 찾아 땅으로 올라왔습니다.",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "자라가 토끼를 찾는 까닭을 알려 줍니다.",
      emotionNote: "자라: 걱정 · 다급함",
      directionNote: "들판 배경으로 시작합니다.",
    },
    {
      id: "continuation-line-2",
      chapterId: "continuation-chapter-1",
      order: 2,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "오랫동안 찾아다닌 끝에 자라는 들판에서 토끼를 발견했습니다.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId: "rabbit-turtle.character.turtle-resolve",
      backgroundId: "",
      purposeNote: "두 인물이 만나는 장면을 보여 줍니다.",
      emotionNote: "자라: 반가움 · 토끼: 궁금함",
      directionNote: "",
    },
    {
      id: "continuation-line-3",
      chapterId: "continuation-chapter-1",
      order: 3,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "안녕, 토끼야! 너를 꼭 만나고 싶었어.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "자라가 먼저 토끼에게 말을 겁니다.",
      emotionNote: "자라: 반가움 속 긴장",
      directionNote: "",
    },
    {
      id: "continuation-line-4",
      chapterId: "continuation-chapter-1",
      order: 4,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "나를? 무슨 일인데?",
      leftAssetId: "rabbit-turtle.character.rabbit-suspicious",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "학생이 자라의 대답을 이어 쓰도록 질문으로 끝냅니다.",
      emotionNote: "토끼: 궁금함 · 약간의 경계",
      directionNote: "",
    },
    {
      id: "continuation-line-5",
      chapterId: "continuation-chapter-1",
      order: 5,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "자라는 토끼를 용궁으로 데려갈 방법을 생각했습니다.",
      leftAssetId: "rabbit-turtle.character.rabbit-thinking",
      rightAssetId: "rabbit-turtle.character.turtle-resolve",
      backgroundId: "",
      purposeNote: "학생이 결정해야 할 문제를 분명하게 보여 줍니다.",
      emotionNote: "자라: 고민 · 토끼: 기다림",
      directionNote: "다음 챕터의 빈 대사로 이어집니다.",
    },
    {
      id: "continuation-line-6",
      chapterId: "continuation-chapter-2",
      order: 1,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "",
      leftAssetId: "rabbit-turtle.character.rabbit-suspicious",
      rightAssetId: "rabbit-turtle.character.turtle-offer",
      backgroundId: "",
      purposeNote: "자라가 토끼를 설득하는 첫 말을 직접 써 보세요.",
      emotionNote: "",
      directionNote: "",
    },
  ],
};

export const RABBIT_TURTLE_CONTINUATION_TEMPLATE_2: StoryProject = {
  id: "template-rabbit-turtle-palace-capture",
  title: "토끼와 자라: 용궁에 묶인 토끼",
  description: "용궁에서 결박된 토끼가 위기를 벗어나는 방법을 이어 쓰는 이야기",
  continuation: {
    chapterId: "palace-continuation-chapter-2",
    lineId: "palace-continuation-line-7",
    label: "토끼의 첫 대응",
  },
  planning: {
    premise: "용궁에 도착한 토끼는 자신이 속았다는 사실을 깨닫습니다. 결박된 토끼는 어떻게 위기를 벗어날까요?",
    structureMode: "four",
    material: "자라를 따라 용궁에 온 토끼가 붙잡혀 자신의 간이 필요하다는 말을 듣는다.",
    theme: "",
    mainCharacter: "토끼",
    mainGoal: "토끼는 목숨을 지키고 용궁의 위기에서 벗어나려 한다.",
    centralProblem: "토끼는 결박되어 있고, 용왕과 신하들은 병을 고치려면 토끼의 간이 필요하다고 믿는다.",
    stakes: "방법을 찾지 못하면 토끼는 목숨을 잃을 수 있다.",
    endingChange: "",
    opening: "용왕의 병을 고치기 위해 토끼를 찾아 땅으로 간 자라가 토끼를 만난다.",
    middle: "자라는 토끼를 설득해 등에 태우고 용궁으로 데려온다.",
    crisis: "용궁에 도착한 토끼는 결박되고, 자신의 간이 필요하다는 말을 듣는다.",
    climax: "",
    ending: "",
    characterNotes: "토끼는 갑작스러운 위기에서도 살아남을 방법을 찾아야 합니다.\n자라는 토끼를 속인 일을 후회할 수도, 용왕의 명령을 따를 수도 있습니다.\n용왕이 토끼의 말을 들을지는 학생이 정합니다.",
    worldNotes: "용궁의 환영 연회장에서 시작해 토끼가 붙잡힌 위기 장면으로 이어집니다. 이후 장소는 자유롭게 바꿀 수 있습니다.",
    mood: "놀라움 · 위기 · 긴장",
    openQuestions: "결박된 토끼는 가장 먼저 무슨 말을 할까?\n자라는 토끼를 도울까, 용왕의 명령을 따를까?\n용왕의 병을 고칠 다른 방법이 있을까?\n토끼는 용궁을 빠져나갈 수 있을까?",
    freeNotes: "토끼는 꾀를 내거나, 진실을 말하거나, 다른 치료법을 제안하거나, 자라와 힘을 합칠 수 있습니다.",
  },
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: ["토끼", "자라", "용왕", "의관"],
  updatedAt: "템플릿 시작",
  chapters: [
    {
      id: "palace-continuation-chapter-1",
      order: 1,
      title: "용궁에 도착한 토끼",
      summary: "용궁에 도착한 토끼가 붙잡혀 자신이 위험하다는 사실을 알게 됩니다.",
      purpose: "학생이 이어 쓰기 전에 알아야 할 위기 상황",
      mood: "기대에서 놀라움과 두려움으로",
      keyEvents: "토끼가 용궁에 도착한다.\n토끼가 붙잡혀 결박된다.\n용왕이 토끼의 간이 필요하다고 말한다.",
      nextChapterIdea: "토끼가 살아남기 위해 첫 말을 꺼낸다.",
      chapterSpeakerNames: ["토끼", "자라", "용왕", "의관"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-white-unified-720x900",
        "rabbit-turtle.character.rabbit-shocked",
        "rabbit-turtle.character.rabbit-thinking",
        "rabbit-turtle.character.rabbit-speaking-truth",
        "rabbit-turtle.character.rabbit-guilty-escape",
        "rabbit-turtle.character.turtle-unified-720x900",
        "rabbit-turtle.character.turtle-ashamed",
        "rabbit-turtle.character.dragonking-command",
        "rabbit-turtle.character.dragonking-sick-elder-attached",
        "rabbit-turtle.character.dragonking-unified-720x900",
        "rabbit-turtle.character.palace-physician-worried",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
        "rabbit-turtle.background.rabbit-turtle-bg-palace",
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
      ],
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-welcome",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
    },
    {
      id: "palace-continuation-chapter-2",
      order: 2,
      title: "여기서부터 이어 쓰기",
      summary: "결박된 토끼는 위기를 벗어나기 위해 무엇이라고 말할까요?",
      purpose: "학생이 토끼의 첫 말부터 자유롭게 이어 쓰는 부분",
      mood: "",
      keyEvents: "토끼가 살아남기 위한 첫 말을 한다.\n용왕이나 자라가 토끼의 말에 반응한다.",
      nextChapterIdea: "",
      chapterSpeakerNames: ["토끼", "자라", "용왕", "의관"],
      characterAssetIds: [
        "rabbit-turtle.character.rabbit-shocked",
        "rabbit-turtle.character.rabbit-thinking",
        "rabbit-turtle.character.rabbit-speaking-truth",
        "rabbit-turtle.character.rabbit-guilty-escape",
        "rabbit-turtle.character.rabbit-herb-bundle",
        "rabbit-turtle.character.turtle-ashamed",
        "rabbit-turtle.character.turtle-resolve",
        "rabbit-turtle.character.dragonking-command",
        "rabbit-turtle.character.dragonking-sick-elder-attached",
        "rabbit-turtle.character.dragonking-recovered-unified-720x900",
        "rabbit-turtle.character.palace-physician-worried",
      ],
      backgroundAssetIds: [
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
        "rabbit-turtle.background.rabbit-turtle-bg-palace-confession",
        "rabbit-turtle.background.rabbit-turtle-bg-palace",
        "rabbit-turtle.background.rabbit-turtle-bg-shore-escape",
        "rabbit-turtle.background.rabbit-turtle-bg-shore-herb",
      ],
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
      leftAssetId: "rabbit-turtle.character.rabbit-shocked",
      rightAssetId: "rabbit-turtle.character.dragonking-command",
    },
  ],
  lines: [
    {
      id: "palace-continuation-line-1",
      chapterId: "palace-continuation-chapter-1",
      order: 1,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "자라의 등을 타고 바닷속을 건넌 토끼는 마침내 용궁에 도착했습니다.",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼와 자라가 용궁에 도착했음을 보여 줍니다.",
      emotionNote: "토끼: 기대 · 자라: 긴장",
      directionNote: "환영 연회장 배경으로 시작합니다.",
    },
    {
      id: "palace-continuation-line-2",
      chapterId: "palace-continuation-chapter-1",
      order: 2,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "와, 이곳이 용궁이구나! 그런데 잔치는 어디에서 열려?",
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "토끼가 아직 자라의 속임수를 모른다는 점을 보여 줍니다.",
      emotionNote: "토끼: 기대 · 자라: 불안",
      directionNote: "",
    },
    {
      id: "palace-continuation-line-3",
      chapterId: "palace-continuation-chapter-1",
      order: 3,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "그때 용궁의 문이 닫히고, 병사들이 토끼를 붙잡아 단단히 결박했습니다.",
      leftAssetId: "rabbit-turtle.character.rabbit-shocked",
      rightAssetId: "rabbit-turtle.character.turtle-ashamed",
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
      purposeNote: "토끼가 갑자기 위기에 빠집니다.",
      emotionNote: "토끼: 놀람 · 자라: 죄책감",
      directionNote: "용궁 위기 장면으로 바꿉니다.",
    },
    {
      id: "palace-continuation-line-4",
      chapterId: "palace-continuation-chapter-1",
      order: 4,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "자라야! 이게 무슨 일이야?",
      leftAssetId: "rabbit-turtle.character.rabbit-shocked",
      rightAssetId: "rabbit-turtle.character.turtle-ashamed",
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
      purposeNote: "토끼가 자라에게 설명을 요구합니다.",
      emotionNote: "토끼: 당황 · 배신감",
      directionNote: "",
    },
    {
      id: "palace-continuation-line-5",
      chapterId: "palace-continuation-chapter-1",
      order: 5,
      type: "dialogue",
      speaker: "right",
      speakerName: "용왕",
      text: "내 병을 고치려면 네 간이 필요하다고 하구나.",
      leftAssetId: "rabbit-turtle.character.rabbit-shocked",
      rightAssetId: "rabbit-turtle.character.dragonking-command",
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
      purposeNote: "토끼가 붙잡힌 이유를 밝힙니다.",
      emotionNote: "토끼: 두려움 · 용왕: 다급함",
      directionNote: "",
    },
    {
      id: "palace-continuation-line-6",
      chapterId: "palace-continuation-chapter-1",
      order: 6,
      type: "narration",
      speaker: "narration",
      speakerName: "해설",
      text: "그제야 토끼는 자신이 속았다는 사실을 알았습니다. 묶인 토끼는 살아남을 방법을 생각했습니다.",
      leftAssetId: "rabbit-turtle.character.rabbit-thinking",
      rightAssetId: "rabbit-turtle.character.dragonking-command",
      backgroundId:
        "rabbit-turtle.background.rabbit-turtle-bg-palace-trap",
      purposeNote: "학생이 토끼의 다음 행동을 이어 쓰도록 위기에서 멈춥니다.",
      emotionNote: "토끼: 두려움 속 침착함",
      directionNote: "다음 챕터의 빈 대사로 이어집니다.",
    },
    {
      id: "palace-continuation-line-7",
      chapterId: "palace-continuation-chapter-2",
      order: 1,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "",
      leftAssetId: "rabbit-turtle.character.rabbit-thinking",
      rightAssetId: "rabbit-turtle.character.dragonking-command",
      backgroundId: "",
      purposeNote: "결박된 토끼가 살아남기 위해 하는 첫 말을 직접 써 보세요.",
      emotionNote: "",
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
