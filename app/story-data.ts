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
      title: "수상한 초대",
      summary: "자라는 토끼에게 용궁 이야기를 꺼냅니다.",
      purpose: "두 친구가 새로운 모험을 선택하는 전개 부분",
      mood: "의심 · 기대",
      keyEvents: "자라가 이야기 잔치를 소개한다.\n토끼가 결말을 직접 정할 수 있는지 묻는다.",
      nextChapterIdea: "두 친구가 용궁에 도착한다.",
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
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
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
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
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
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
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
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
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
      leftAssetId:
        "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId:
        "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "",
      purposeNote: "두 친구가 함께 이야기를 만들겠다고 선언합니다.",
      emotionNote: "토끼: 설렘 · 자라: 기쁨",
      directionNote: "",
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
  purposeNote = "pinky-ne-site 원작의 장면을 이어갑니다.",
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

const ORIGINAL_PALACE_OPENING: TemplateScene[] = [
  originalScene({
    id: "original-palace-welcome-1",
    text: "어두워진 용궁 대청에 조개등 불빛이 켜졌다. 나는 약사발을 들고 누워 계신 용왕님께 다가갔다. 첫날에 올린 해초 삶은 물도, 둘째 날에 올린 조개가루 약도 효과가 없었다. 용왕님의 얼굴은 이틀 전보다 훨씬 어둡고 파리했다.",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    purposeNote: "병든 용왕과 자라의 관계를 보여 줍니다.",
    emotionNote: "용왕: 위독함 · 자라: 걱정",
    directionNote: "원작의 어두운 용궁 대청 장면입니다.",
  }),
  originalScene({
    id: "original-palace-welcome-2",
    type: "dialogue",
    speaker: "left",
    speakerName: "용왕",
    text: "자라야, 숨이 차서 길게 말하기가 힘들구나. 이제 일반적인 약재로는 내 병을 고칠 수가 없다. 어의가 의학 책에서 찾아낸 마지막 처방뿐이다.",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    emotionNote: "용왕: 고통 · 자라: 긴장",
  }),
  originalScene({
    id: "original-palace-welcome-3",
    text: "나는 어릴 때 큰비에 휩쓸려 낯선 바다로 떠내려왔다. 짠물이 목을 조여 등껍질 속에 웅크리고 있을 때, 젊은 용왕님이 호위들을 물리고 내 앞에 무릎을 낮추셨다. 전하께서는 차가운 내 앞발을 감싸 쥐고, 자신의 비늘로 만든 '바다의 숨결'이라는 용궁 패를 내 목에 걸어 주셨다.",
    leftAssetId: RT.character.youngDragonKing,
    rightAssetId: RT.character.childTurtle,
    backgroundId: RT.background.flashback,
    purposeNote: "용왕이 어린 자라를 구해 준 과거를 보여 줍니다.",
    emotionNote: "어린 자라: 두려움 · 젊은 용왕: 다정함",
    directionNote: "원작처럼 구출 회상 배경과 어린 인물을 사용합니다.",
  }),
  originalScene({
    id: "original-palace-welcome-3-response",
    type: "dialogue",
    speaker: "right",
    speakerName: "어린 자라",
    text: "(떨리는 숨을 고르며) 저는 민물에서 왔습니다. 바다가 무섭습니다. 그래도 전하께서 잡아 주시니 조금 숨이 쉬어집니다.",
    leftAssetId: RT.character.youngDragonKing,
    rightAssetId: RT.character.childTurtle,
    backgroundId: RT.background.flashback,
    purposeNote: "구해진 어린 자라가 처음으로 용왕에게 마음을 엽니다.",
    emotionNote: "어린 자라: 두려움에서 안도로",
  }),
  originalScene({
    id: "original-palace-welcome-4",
    type: "dialogue",
    speaker: "left",
    speakerName: "용왕",
    text: "그럼 이곳에서는 서두르지 않아도 된다. 네가 본 것을 천천히, 있는 그대로 말해 다오. 잘 보이려고 꾸미지 않아도 좋다. 작은 목소리라도 내가 끝까지 듣겠다.",
    leftAssetId: RT.character.youngDragonKing,
    rightAssetId: RT.character.childTurtle,
    backgroundId: RT.background.flashback,
    emotionNote: "젊은 용왕: 따뜻함 · 어린 자라: 안도",
  }),
  originalScene({
    id: "original-palace-welcome-4-thought",
    type: "dialogue",
    speaker: "right",
    speakerName: "자라",
    text: "(그날 이후 용왕님은 내가 더듬거리면 기다려 주셨고, 작은 사실 하나를 말해도 고개를 끄덕여 주셨다. 그래서 나는 전하 앞에서는 숨거나 꾸미지 않아도 된다고 믿게 되었다.)",
    leftAssetId: RT.character.youngDragonKing,
    rightAssetId: RT.character.childTurtle,
    backgroundId: RT.background.flashback,
    purposeNote: "자라가 정직을 중요하게 여기게 된 까닭을 보여 줍니다.",
    emotionNote: "자라의 속생각: 신뢰 · 다짐",
  }),
  originalScene({
    id: "original-palace-welcome-5",
    text: "어의가 바닥에 무거운 처방책을 넓게 펼쳤다. 처방책의 오래된 종이 위에는 '토끼의 간'이라는 글자가 붉게 적혀 있었다.",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    purposeNote: "회상에서 현재로 돌아와 위험한 처방을 밝힙니다.",
    emotionNote: "자라: 놀람 · 용왕: 고통",
    directionNote: "현재의 용궁 대청으로 돌아옵니다.",
  }),
  originalScene({
    id: "original-palace-welcome-5-dialogue",
    type: "dialogue",
    speaker: "left",
    speakerName: "의관",
    text: "전하, 오래된 처방책에 따르면 육지 토끼의 간만이 전하의 병을 고칠 유일한 처방입니다. 오늘 밤 안에 간을 구해 쓰지 못하면, 전하의 심장이 멈추고 온몸의 피가 굳어 생명을 보존하기 어렵습니다.",
    leftAssetId: RT.character.physician,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    emotionNote: "의관: 다급함 · 자라: 충격",
  }),
  originalScene({
    id: "original-palace-welcome-6",
    type: "dialogue",
    speaker: "left",
    speakerName: "용왕",
    text: "자라야, 네게 참으로 어려운 일을 맡긴다. 육지로 올라가 토끼를 찾아 데려오너라. 다만, 내 병이나 간이 필요하다는 사실은 절대 말하지 마라. 그가 겁을 먹고 도망칠 것이다. 용궁에서 큰 잔치가 열리며, 이 용궁 패를 가지면 물밑에서도 숨을 쉴 수 있다고만 전해라. 그래야 그가 의심 없이 너를 따라올 것이다.",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    purposeNote: "용왕이 자라에게 토끼를 데려오라는 명령을 내립니다.",
    emotionNote: "용왕: 절박함 · 자라: 갈등",
  }),
  originalScene({
    id: "original-palace-welcome-7",
    type: "dialogue",
    speaker: "right",
    speakerName: "자라",
    text: "용왕님, 제게 항상 두려워하지 말고 사실 그대로만 말하라고 가르치셨습니다. 그런데 지금은 토끼에게 목적을 속여서 데려오라 하십니다. 토끼는 자신이 죽을 줄도 모르고 저를 따라올 것입니다. 이 방법 외에 정말 다른 치료제는 없습니까?",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    purposeNote: "정직과 명령 사이에서 흔들리는 자라의 갈등을 보여 줍니다.",
    emotionNote: "자라: 충격 · 망설임",
  }),
  originalScene({
    id: "original-palace-welcome-8",
    type: "dialogue",
    speaker: "left",
    speakerName: "용왕",
    text: "다른 방법이 있었다면 내가 너에게 거짓말을 시켜 무고한 생명을 데려오게 했겠느냐. 내 병세가 깊어 이 나라를 다스릴 힘이 다해간다. 내가 죽으면 수중 세계 전체가 무너질 것이다. 너에게 이런 짐을 지워 미안하지만, 지금 나를 살릴 길은 오직 이것뿐이다.",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    emotionNote: "용왕: 슬픔 · 절박함",
  }),
  originalScene({
    id: "original-palace-welcome-9",
    type: "dialogue",
    speaker: "right",
    speakerName: "자라",
    text: "(용왕님은 내 목숨을 구하고, 있는 그대로 말하라고 가르쳐 주셨다. 그런데 그 은혜를 갚으려면 죄 없는 토끼를 속여야 한다. 나는 무거워진 용궁 패를 움켜쥐고 물문을 향해 돌아섰다.)",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.palace,
    purposeNote: "자라가 갈등을 안은 채 육지로 떠납니다.",
    emotionNote: "자라의 속생각: 은혜 · 죄책감 · 결심",
  }),
];

const ORIGINAL_LAND_MEETING: TemplateScene[] = [
  originalScene({
    id: "original-rabbit-encounter-1",
    text: "나는 용궁 패를 목에 걸고 물문을 넘었다. 갈대밭 너머 황량한 언덕에 이르자, 마른 풀을 뜯던 토끼가 고개를 들었다. 겨울바람이 지나가자 토끼의 긴 귀가 가볍게 떨렸다.",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    purposeNote: "자라가 마침내 육지에서 토끼를 만납니다.",
    emotionNote: "토끼: 경계 · 자라: 긴장",
    directionNote: "원작의 황량한 육지 언덕 배경으로 전환합니다.",
  }),
  originalScene({
    id: "original-first-choice-prompt",
    text: "토끼가 나를 물끄러미 바라보았다. 나는 숨을 고르고 첫마디를 골랐다.",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    purposeNote: "원작의 선택지는 보이지 않고, 학생이 첫마디부터 이어 씁니다.",
    emotionNote: "토끼: 궁금함 · 자라: 망설임",
    directionNote: "다음 장면의 빈 자라 대사로 이어집니다.",
  }),
];

const ORIGINAL_OBEY_ROUTE: TemplateScene[] = [
  originalScene({
    id: "original-obey-1",
    type: "dialogue",
    speaker: "right",
    speakerName: "자라",
    text: "토끼 선생, 용궁에서 작은 잔치가 열리오. 귀한 육지 손님을 모시고 싶어 내가 직접 찾아왔소. 따뜻한 처소와 먹을 것도 준비되어 있으니 함께 가지 않겠소?",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    purposeNote: "원작 첫 선택에서 ‘용궁 잔치로 초대한다’를 고른 흐름입니다.",
    emotionNote: "자라: 억지 미소 · 토끼: 호기심",
  }),
  originalScene({
    id: "original-obey-2",
    type: "dialogue",
    speaker: "left",
    speakerName: "토끼",
    text: "용궁 잔치라니 듣기만 해도 낯설고 신기하구려. 다만 나는 물속에서 숨을 쉴 수 없소. 바닷속까지 어떻게 간단 말이오?",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    emotionNote: "토끼: 호기심 · 걱정",
  }),
  originalScene({
    id: "original-obey-3",
    type: "dialogue",
    speaker: "right",
    speakerName: "자라",
    text: "염려 마시오. 이 용궁 패를 나와 함께 쥐면 물속에서도 숨을 쉴 수 있소. 내가 천천히 안내할 테니 걱정하지 않아도 되오.",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    emotionNote: "자라: 설득 · 숨긴 죄책감",
  }),
  originalScene({
    id: "original-obey-4",
    type: "dialogue",
    speaker: "left",
    speakerName: "토끼",
    text: "그렇다면 가보겠소. 이 추운 언덕을 벗어나 용궁의 손님이 된다니, 나쁘지 않은 이야기구려.",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    emotionNote: "토끼: 기대 · 자라: 불안",
  }),
  originalScene({
    id: "original-obey-5",
    type: "dialogue",
    speaker: "right",
    speakerName: "자라",
    text: "(토끼가 내 등껍질 위로 올라탔다. 그의 가벼운 무게가 등에 닿자, 내가 끝내 말하지 않은 사실이 더 무겁게 느껴졌다.)",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.grassland,
    purposeNote: "토끼가 자라를 따라 용궁으로 떠납니다.",
    emotionNote: "자라의 속생각: 죄책감",
  }),
];

const ORIGINAL_PALACE_TRAP: TemplateScene[] = [
  originalScene({
    id: "original-palace-trap-1",
    text: "용궁 대청에 도착하자 조개등 불빛 아래 텅 빈 방석 하나만 놓여 있었다. 토끼가 기대한 환대도, 도움을 청하는 사람도 보이지 않았다. 토끼가 어리둥절해하며 방석에 앉자마자, 어둠 속에 숨어 있던 무장한 호위들이 밧줄과 그물을 들고 나타나 토끼를 둘러쌌다.",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.trap,
    purposeNote: "초대가 함정이었다는 사실이 드러납니다.",
    emotionNote: "토끼: 충격 · 자라: 죄책감",
    directionNote: "원작의 용궁 위기 장면 배경으로 전환합니다.",
  }),
  originalScene({
    id: "original-palace-trap-2",
    type: "dialogue",
    speaker: "left",
    speakerName: "의관",
    text: "전하, 자라가 약속대로 육지에서 토끼를 데려왔습니다. 하지만 전하의 맥박이 약해지고 있으니 지체할 시간이 없습니다. 어서 토끼를 묶고 간을 꺼내어 처방을 시작해야 합니다.",
    leftAssetId: RT.character.physician,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.trap,
    emotionNote: "의관: 다급함 · 자라: 얼어붙음",
  }),
  originalScene({
    id: "original-palace-trap-3",
    type: "dialogue",
    speaker: "left",
    speakerName: "용왕",
    text: "(깊은 신음을 내쉬며) 어쩔 수 없구나. 토끼 선생, 미안하다. 호위들은 저 토끼를 당장 묶어라. 나를 살릴 처방을 어서 시작하라.",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.trap,
    emotionNote: "용왕: 깊은 고통 · 자라: 갈등",
  }),
  originalScene({
    id: "original-palace-trap-4",
    type: "dialogue",
    speaker: "left",
    speakerName: "토끼",
    text: "(사색이 되어 주변을 둘러보며) 자라 선생, 이게 어떻게 된 일이오? 분명 나를 귀한 손님으로 대접한다고 하지 않았소! 나를 묶어 간을 빼앗으려고 일부러 바다로 속여 데려온 것이오?",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.trap,
    emotionNote: "토끼: 충격 · 배신감",
  }),
  originalScene({
    id: "original-palace-trap-5",
    type: "dialogue",
    speaker: "left",
    speakerName: "용왕",
    text: "자라야, 무엇 하느냐? 호위들을 도와 토끼를 묶어라!",
    leftAssetId: RT.character.dragonKing,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.trap,
    purposeNote: "용왕의 명령 뒤부터 학생이 토끼의 대응을 이어 씁니다.",
    emotionNote: "용왕: 명령 · 자라: 갈등 · 토끼: 공포",
    directionNote: "다음 장면의 빈 토끼 대사로 이어집니다.",
  }),
  originalScene({
    id: "original-palace-trap-6",
    text: "호위들이 토끼의 앞발을 묶었다. 토끼는 벗어나려 몸을 비틀었지만 밧줄은 더 단단히 조여 왔다. 자라는 굳은 채 토끼와 눈을 마주치지 못했다.",
    leftAssetId: RT.character.rabbit,
    rightAssetId: RT.character.turtle,
    backgroundId: RT.background.trap,
    purposeNote: "토끼가 실제로 결박된 순간에서 학생의 창작으로 넘깁니다.",
    emotionNote: "토끼: 공포와 배신감 · 자라: 죄책감",
    directionNote: "다음 빈 장면은 결박된 토끼의 첫 대응입니다.",
  }),
];

const ORIGINAL_CHARACTER_ASSET_IDS = [
  RT.character.turtle,
  RT.character.childTurtle,
  RT.character.rabbit,
  RT.character.dragonKing,
  RT.character.youngDragonKing,
  RT.character.physician,
];

const ORIGINAL_BACKGROUND_ASSET_IDS = [
  RT.background.palace,
  RT.background.flashback,
  RT.background.grassland,
  RT.background.trap,
];

export const RABBIT_TURTLE_CONTINUATION_TEMPLATE: StoryProject = {
  id: "template-rabbit-turtle-land-meeting",
  title: "토끼와 자라: 땅에서 만난 뒤",
  description: "원작의 용궁 장면을 읽고 자라의 첫 설득부터 이어 쓰는 이야기",
  continuation: {
    chapterId: "continuation-chapter-2",
    lineId: "continuation-line-6",
    label: "자라의 첫 설득",
  },
  planning: {
    premise:
      "병든 용왕을 살리기 위해 토끼를 찾아온 자라는 정직과 명령 사이에서 흔들립니다. 토끼에게 어떤 첫마디를 건넬까요?",
    structureMode: "three",
    material:
      "pinky-ne-site의 토끼와 자라 원작에서 용왕의 명령을 받은 자라가 육지에서 토끼를 만나는 부분",
    theme: "은혜를 갚는 일과 정직을 지키는 일이 충돌할 때 무엇을 선택해야 할까?",
    mainCharacter: "자라와 토끼",
    mainGoal: "자라는 토끼에게 첫마디를 건네고 다음 일을 선택한다.",
    centralProblem:
      "용왕은 진짜 목적을 숨기라고 명령했지만, 자라는 평생 정직을 지키며 살아왔다.",
    stakes:
      "자라의 말에 따라 용왕과 토끼의 운명, 그리고 자라가 지켜 온 신뢰가 달라진다.",
    endingChange:
      "마지막에는 자라와 토끼 사이의 신뢰가 어떻게 달라졌는지 드러나게 한다.",
    opening:
      "병든 용왕은 자신을 살릴 토끼의 간을 구하기 위해 자라에게 토끼를 속여 데려오라고 명령한다.",
    middle: "",
    crisis: "",
    climax: "",
    ending: "",
    characterNotes:
      "자라는 어린 시절 자신을 구해 준 용왕에게 은혜를 갚고 싶지만, 무고한 토끼를 속이는 일을 괴로워합니다.\n토끼는 겨울 언덕에서 처음 만난 자라를 조심스럽게 바라봅니다.",
    worldNotes:
      "원작의 용궁 대청과 구출 회상, 황량한 육지 언덕을 차례로 지나갑니다. 준비된 장면도 자유롭게 고칠 수 있습니다.",
    mood: "은혜 · 갈등 · 긴장",
    openQuestions:
      "자라는 진짜 목적을 말할까?\n토끼가 자라를 믿게 하려면 무엇이 필요할까?\n다른 치료법이나 새로운 해결책을 찾을 수 있을까?",
    freeNotes:
      "원작의 선택지는 제거되어 있습니다. 자라의 첫마디부터 새로운 갈래를 직접 만드세요.",
  },
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: ["토끼", "자라", "어린 자라", "용왕", "의관"],
  updatedAt: "pinky-ne-site 최신 원작 반영",
  chapters: [
    {
      id: "continuation-origin-palace",
      order: 1,
      title: "용궁에서 받은 명령",
      summary:
        "자라는 자신을 구해 준 병든 용왕에게 토끼를 데려오라는 명령을 받습니다.",
      purpose: "자라가 토끼를 찾는 까닭과 마음속 갈등을 이해하는 원작 부분",
      mood: "은혜 · 절박함 · 갈등",
      keyEvents:
        "용왕의 병이 깊어진다.\n자라는 어린 시절의 은혜를 떠올린다.\n용왕은 토끼에게 진짜 목적을 숨기라고 명령한다.",
      nextChapterIdea: "자라가 육지에서 토끼를 만난다.",
      chapterSpeakerNames: ["자라", "어린 자라", "용왕", "의관"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ORIGINAL_BACKGROUND_ASSET_IDS,
      backgroundId: RT.background.palace,
      leftAssetId: RT.character.dragonKing,
      rightAssetId: RT.character.turtle,
    },
    {
      id: "continuation-origin-land",
      order: 2,
      title: "육지에서 만난 토끼",
      summary: "황량한 언덕에서 토끼와 자라가 서로를 마주 봅니다.",
      purpose: "학생이 이어 쓸 원작의 정확한 시작 지점",
      mood: "조용한 긴장 · 망설임",
      keyEvents:
        "자라가 용궁 패를 목에 걸고 육지로 나온다.\n토끼가 자라의 첫마디를 기다린다.",
      nextChapterIdea: "자라는 토끼에게 첫마디를 건넨다.",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ORIGINAL_BACKGROUND_ASSET_IDS,
      backgroundId: RT.background.grassland,
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
    },
    {
      id: "continuation-chapter-2",
      order: 3,
      title: "여기서부터 이어 쓰기",
      summary: "자라는 토끼에게 무엇이라고 말할까요?",
      purpose: "학생이 자라의 첫 말부터 자유롭게 이어 쓰는 부분",
      mood: "",
      keyEvents:
        "자라가 토끼에게 첫마디를 건넨다.\n토끼가 자라의 말에 반응한다.",
      nextChapterIdea: "",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: [
        ...ORIGINAL_BACKGROUND_ASSET_IDS,
        "rabbit-turtle.background.rabbit-turtle-bg-shore",
      ],
      backgroundId: RT.background.grassland,
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
    },
  ],
  lines: [
    ...templateLines("continuation-origin-palace", ORIGINAL_PALACE_OPENING),
    ...templateLines("continuation-origin-land", ORIGINAL_LAND_MEETING),
    {
      id: "continuation-line-6",
      chapterId: "continuation-chapter-2",
      order: 1,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "",
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
      backgroundId: RT.background.grassland,
      purposeNote: "자라가 토끼에게 건네는 첫 말을 직접 써 보세요.",
      emotionNote: "",
      directionNote: "원작과 같은 좌우 인물·들판 배치에서 시작합니다.",
    },
  ],
};

export const RABBIT_TURTLE_CONTINUATION_TEMPLATE_2: StoryProject = {
  id: "template-rabbit-turtle-palace-capture",
  title: "토끼와 자라: 용궁에 묶인 토끼",
  description:
    "원작에서 잔치 초대 갈래를 따라 용궁에 온 토끼의 대응을 이어 쓰는 이야기",
  continuation: {
    chapterId: "palace-continuation-chapter-2",
    lineId: "palace-continuation-line-7",
    label: "토끼의 첫 대응",
  },
  planning: {
    premise:
      "용궁 잔치에 초대받았다고 믿은 토끼는 용궁에서 결박됩니다. 토끼는 어떻게 위기를 벗어날까요?",
    structureMode: "four",
    material:
      "pinky-ne-site의 토끼와 자라 원작에서 ‘용궁 잔치로 초대한다’ 갈래를 고정한 뒤 토끼가 결박되는 부분",
    theme: "목숨이 위태로운 순간, 지혜와 신뢰는 어떤 선택을 만들 수 있을까?",
    mainCharacter: "토끼",
    mainGoal: "토끼는 목숨을 지키고 용궁의 함정에서 벗어난다.",
    centralProblem:
      "토끼는 자라의 말을 믿고 용궁에 왔지만, 용왕과 의관은 토끼의 간이 필요하다고 믿는다.",
    stakes:
      "토끼가 방법을 찾지 못하면 목숨을 잃고, 자라는 정직과 은혜를 모두 잃을 수 있다.",
    endingChange:
      "토끼가 위기를 벗어나는 것뿐 아니라 자라와 용왕의 태도도 어떻게 달라지는지 보여 준다.",
    opening:
      "병든 용왕은 자라에게 토끼를 속여 데려오라고 명령하고, 자라는 용궁 잔치의 손님으로 초대한다.",
    middle:
      "토끼는 용궁 패를 믿고 자라를 따라가지만, 용궁에 도착하자 호위들에게 포위된다.",
    crisis:
      "용왕이 토끼를 묶고 간을 꺼내라고 명령한다.",
    climax: "",
    ending: "",
    characterNotes:
      "토끼는 자라의 초대를 믿었지만 배신당했다고 느낍니다.\n자라는 어린 시절 자신을 구해 준 용왕의 은혜와 토끼의 생명 사이에서 흔들립니다.\n용왕은 자신의 죽음이 수중 세계의 붕괴로 이어질까 두려워합니다.",
    worldNotes:
      "원작의 용궁 대청, 구출 회상, 육지 언덕, 용궁 위기 장면을 차례로 지나갑니다. 준비된 장면도 자유롭게 고칠 수 있습니다.",
    mood: "은혜 · 속임수 · 배신감 · 위기",
    openQuestions:
      "결박된 토끼는 가장 먼저 무슨 말을 할까?\n자라는 토끼를 도울까, 용왕의 명령을 따를까?\n용왕의 병을 고칠 다른 방법이 있을까?",
    freeNotes:
      "첫 선택은 원작의 ‘용궁 잔치로 초대한다’로 고정했습니다. 결박된 토끼의 첫 대응부터 새로운 갈래를 만드세요.",
  },
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: ["토끼", "자라", "어린 자라", "용왕", "의관"],
  updatedAt: "pinky-ne-site 최신 원작 반영",
  chapters: [
    {
      id: "palace-origin-opening",
      order: 1,
      title: "용궁에서 받은 명령",
      summary:
        "자라는 자신을 구해 준 병든 용왕에게 토끼를 데려오라는 명령을 받습니다.",
      purpose: "자라의 사명과 갈등을 이해하는 원작 부분",
      mood: "은혜 · 절박함 · 갈등",
      keyEvents:
        "용왕의 병이 깊어진다.\n자라는 어린 시절의 은혜를 떠올린다.\n토끼의 간이 필요하다는 처방이 밝혀진다.",
      nextChapterIdea: "자라가 육지에서 토끼를 만난다.",
      chapterSpeakerNames: ["자라", "어린 자라", "용왕", "의관"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ORIGINAL_BACKGROUND_ASSET_IDS,
      backgroundId: RT.background.palace,
      leftAssetId: RT.character.dragonKing,
      rightAssetId: RT.character.turtle,
    },
    {
      id: "palace-origin-invitation",
      order: 2,
      title: "용궁 잔치로 초대하다",
      summary:
        "자라는 육지에서 만난 토끼를 용궁 잔치의 손님으로 초대합니다.",
      purpose: "원작 첫 선택에서 잔치 초대를 고른 고정 갈래",
      mood: "호기심 · 설득 · 죄책감",
      keyEvents:
        "토끼와 자라가 만난다.\n자라는 용궁 잔치로 토끼를 초대한다.\n토끼가 자라의 등에 올라탄다.",
      nextChapterIdea: "토끼와 자라가 용궁에 도착한다.",
      chapterSpeakerNames: ["토끼", "자라"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ORIGINAL_BACKGROUND_ASSET_IDS,
      backgroundId: RT.background.grassland,
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
    },
    {
      id: "palace-continuation-chapter-1",
      order: 3,
      title: "초대가 함정이 된 순간",
      summary:
        "용궁에 도착한 토끼가 포위되고, 용왕은 토끼를 묶으라고 명령합니다.",
      purpose: "학생이 이어 쓰기 전에 알아야 할 원작의 위기 상황",
      mood: "기대에서 충격과 배신감으로",
      keyEvents:
        "토끼와 자라가 용궁에 도착한다.\n의관이 토끼의 간이 필요하다고 밝힌다.\n용왕이 토끼를 묶으라고 명령한다.",
      nextChapterIdea: "결박된 토끼가 살아남기 위한 첫 말을 꺼낸다.",
      chapterSpeakerNames: ["토끼", "자라", "용왕", "의관"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ORIGINAL_BACKGROUND_ASSET_IDS,
      backgroundId: RT.background.trap,
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
    },
    {
      id: "palace-continuation-chapter-2",
      order: 4,
      title: "여기서부터 이어 쓰기",
      summary:
        "결박된 토끼는 위기를 벗어나기 위해 무엇이라고 말할까요?",
      purpose: "학생이 토끼의 첫 말부터 자유롭게 이어 쓰는 부분",
      mood: "",
      keyEvents:
        "토끼가 살아남기 위한 첫 말을 한다.\n용왕이나 자라가 토끼의 말에 반응한다.",
      nextChapterIdea: "",
      chapterSpeakerNames: ["토끼", "자라", "용왕", "의관"],
      characterAssetIds: ORIGINAL_CHARACTER_ASSET_IDS,
      backgroundAssetIds: [
        ...ORIGINAL_BACKGROUND_ASSET_IDS,
        "rabbit-turtle.background.rabbit-turtle-bg-palace-confession",
        "rabbit-turtle.background.rabbit-turtle-bg-shore-escape",
        "rabbit-turtle.background.rabbit-turtle-bg-shore-herb",
      ],
      backgroundId: RT.background.trap,
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
    },
  ],
  lines: [
    ...templateLines("palace-origin-opening", ORIGINAL_PALACE_OPENING),
    ...templateLines("palace-origin-invitation", [
      ...ORIGINAL_LAND_MEETING,
      ...ORIGINAL_OBEY_ROUTE,
    ]),
    ...templateLines(
      "palace-continuation-chapter-1",
      ORIGINAL_PALACE_TRAP,
    ),
    {
      id: "palace-continuation-line-7",
      chapterId: "palace-continuation-chapter-2",
      order: 1,
      type: "dialogue",
      speaker: "left",
      speakerName: "토끼",
      text: "",
      leftAssetId: RT.character.rabbit,
      rightAssetId: RT.character.turtle,
      backgroundId: RT.background.trap,
      purposeNote:
        "결박된 토끼가 살아남기 위해 하는 첫 말을 직접 써 보세요.",
      emotionNote: "",
      directionNote:
        "원작과 같은 토끼 왼쪽·자라 오른쪽·용궁 위기 배치에서 시작합니다.",
    },
  ],
};

const ONGGOJIB_TEMPLATE_ASSETS = {
  background: {
    court: "onggojib.background.magistrate-yard-pixel",
    snowRoad: "onggojib.background.snow-road-pixel",
    snowVillage: "onggojib.background.snow-village-road-pixel",
    springCourtyard: "onggojib.background.spring-courtyard-pixel",
    springRoom: "onggojib.background.spring-room-pixel",
    winterCourtyard: "onggojib.background.winter-courtyard-pixel",
    warmRoom: "onggojib.background.warm-room-pixel",
  },
  character: {
    realAngry: "onggojib.character.real-angry-pixel",
    realExiled: "onggojib.character.real-exiled-consistent-pixel",
    realRemorse: "onggojib.character.real-remorse-consistent-pixel",
    realResolve: "onggojib.character.real-resolve-consistent-pixel",
    fakeGentle:
      "onggojib.character.double-blue-gentle-consistent-pixel",
    fakeFirm: "onggojib.character.double-blue-firm-consistent-pixel",
    wifeResolved: "onggojib.character.wife-resolved-pixel",
    wifeConcerned: "onggojib.character.wife-concerned-pixel",
    magistrate: "onggojib.character.magistrate-command-pixel",
    posol: "onggojib.character.posol-pixel",
    youngestChild: "onggojib.character.youngest-child-cautious-pixel",
    secondChild: "onggojib.character.second-child-hesitant-pixel",
    servant: "onggojib.character.servant-household-pixel",
  },
} as const;

const OG = ONGGOJIB_TEMPLATE_ASSETS;

const ONGGOJIB_CHARACTER_ASSET_IDS = [
  OG.character.realAngry,
  OG.character.realExiled,
  OG.character.realRemorse,
  OG.character.realResolve,
  OG.character.fakeGentle,
  OG.character.fakeFirm,
  OG.character.wifeResolved,
  OG.character.wifeConcerned,
  OG.character.magistrate,
  OG.character.posol,
  OG.character.youngestChild,
  OG.character.secondChild,
  OG.character.servant,
];

const ONGGOJIB_BACKGROUND_ASSET_IDS = [
  OG.background.court,
  OG.background.snowRoad,
  OG.background.snowVillage,
  OG.background.springCourtyard,
  OG.background.springRoom,
  OG.background.winterCourtyard,
  OG.background.warmRoom,
];

const ORIGINAL_ONGGOJIB_HOME_CHANGE: TemplateScene[] = [
  originalScene({
    id: "onggojib-home-0",
    text: "겨울 저녁, 옹고집네 안방에 밥상이 놓였다. 아이들은 옹고집의 눈치를 보며 말없이 밥을 먹었다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.youngestChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "가족이 진짜 옹고집 앞에서 어떤 모습이었는지 먼저 보여 줍니다.",
    emotionNote: "아이들: 긴장 · 옹고집: 무심함",
  }),
  originalScene({
    id: "onggojib-home-0a",
    text: "막내가 밥을 뜨다 밥알 몇 톨을 상 위에 떨어뜨렸다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.youngestChild,
    backgroundId: OG.background.warmRoom,
    emotionNote: "막내: 순간의 실수와 두려움",
  }),
  originalScene({
    id: "onggojib-home-0b",
    type: "dialogue",
    speaker: "left",
    speakerName: "분노한 옹고집",
    text: "그 몇 톨도 네가 벌어 온 것이냐. 상 위에 떨어진 밥알까지 다 주워라.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.youngestChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "옹고집의 인색함과 아이들이 두려워하는 까닭을 직접 보여 줍니다.",
    emotionNote: "진짜 옹고집: 꾸짖음 · 막내: 얼어붙음",
  }),
  originalScene({
    id: "onggojib-home-0c",
    type: "dialogue",
    speaker: "right",
    speakerName: "부인",
    text: "서방님, 아이가 놀랐습니다. 제가 치우겠습니다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.wifeConcerned,
    backgroundId: OG.background.warmRoom,
    emotionNote: "부인: 아이를 보호하려는 마음",
  }),
  originalScene({
    id: "onggojib-home-0d",
    type: "dialogue",
    speaker: "left",
    speakerName: "분노한 옹고집",
    text: "감싸니 저 모양이지. 내 집 밥을 먹으면 밥 귀한 줄부터 알아야 하오.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.wifeConcerned,
    backgroundId: OG.background.warmRoom,
    emotionNote: "진짜 옹고집: 완고함 · 부인: 답답함",
  }),
  originalScene({
    id: "onggojib-home-1",
    text: "다음 날, 옹고집은 장사길에 오른다며 집을 나섰다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.wifeConcerned,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "진짜 옹고집이 집을 비우며 사건이 시작됩니다.",
    emotionNote: "부인: 익숙한 걱정 · 옹고집: 무심함",
    directionNote: "pinky-ne-site 최신 원작의 귀가 전 흐름을 따릅니다.",
  }),
  originalScene({
    id: "onggojib-home-2",
    text: "며칠 뒤, 대문 밖에서 남편의 목소리가 들렸다. 부인이 문을 열자 옹고집과 똑같이 생긴 사내가 서 있었다.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.wifeConcerned,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "가짜 옹고집이 집에 들어오는 순간입니다.",
    emotionNote: "부인: 놀람과 의심 · 가짜 옹고집: 침착함",
  }),
  originalScene({
    id: "onggojib-home-3",
    type: "dialogue",
    speaker: "left",
    speakerName: "가짜 옹고집",
    text: "밖이 춥소. 아이들은 안으로 들이시오. 부인도 오래 서 있지 마시오.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.wifeConcerned,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "진짜 옹고집과 다른 태도를 첫 대사로 보여 줍니다.",
    emotionNote: "가짜 옹고집: 다정함 · 부인: 낯선 느낌",
  }),
  originalScene({
    id: "onggojib-home-4",
    type: "dialogue",
    speaker: "right",
    speakerName: "부인",
    text: "서방님… 오늘은 어찌 그런 말씀을 하십니까?",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.wifeConcerned,
    backgroundId: OG.background.winterCourtyard,
    emotionNote: "부인: 반가움보다 먼저 드는 의문",
  }),
  originalScene({
    id: "onggojib-home-5",
    text: "따뜻한 방에 들어온 그가 작은 엿 꾸러미를 상 위에 놓았다. 아이들은 옹고집의 얼굴을 살피며 선뜻 손을 내밀지 못했다.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.youngestChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "아이들이 아버지 앞에서 늘 눈치를 봤음을 행동으로 보여 줍니다.",
    emotionNote: "아이들: 경계 · 가짜 옹고집: 기다림",
  }),
  originalScene({
    id: "onggojib-home-6",
    type: "dialogue",
    speaker: "left",
    speakerName: "가짜 옹고집",
    text: "먹어도 된다. 서로 나누어 먹거라.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.youngestChild,
    backgroundId: OG.background.warmRoom,
    emotionNote: "가짜 옹고집: 재촉하지 않는 다정함",
  }),
  originalScene({
    id: "onggojib-home-7",
    text: "막내가 조심스럽게 엿 하나를 집었다. 둘째도 따라 손을 내밀었다.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.youngestChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "아이들이 조금씩 마음을 놓기 시작합니다.",
    emotionNote: "막내와 둘째: 조심스러운 안도",
  }),
  originalScene({
    id: "onggojib-home-8",
    text: "다음 저녁, 둘째가 낮에 본 일을 말하려다 옹고집의 얼굴을 살폈다.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.secondChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "아이들이 말을 꺼내기 어려워했던 집안 분위기를 보여 줍니다.",
    emotionNote: "둘째: 망설임 · 가짜 옹고집: 기다림",
  }),
  originalScene({
    id: "onggojib-home-9",
    type: "dialogue",
    speaker: "right",
    speakerName: "둘째",
    text: "오늘 마당에 까치가……",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.secondChild,
    backgroundId: OG.background.warmRoom,
    emotionNote: "둘째: 혼날까 봐 말을 흐림",
  }),
  originalScene({
    id: "onggojib-home-10",
    type: "dialogue",
    speaker: "left",
    speakerName: "가짜 옹고집",
    text: "그래서 어떻게 되었느냐.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.secondChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "설명하지 않고, 아이의 말을 기다리는 태도로 변화를 보여 줍니다.",
    emotionNote: "가짜 옹고집: 관심 · 둘째: 놀람",
  }),
  originalScene({
    id: "onggojib-home-11",
    text: "둘째는 낮에 본 까치 이야기를 끝까지 말했다. 막내도 옆에서 따라 웃었다. 며칠이 지나자 아이들은 그가 밥상에 앉아도 먼저 말을 꺼냈다.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.secondChild,
    backgroundId: OG.background.warmRoom,
    purposeNote: "가족이 편안해졌음을 짧은 사건 하나로 보여 줍니다.",
    emotionNote: "아이들: 안도 · 부인: 복잡한 마음",
  }),
  originalScene({
    id: "onggojib-home-12",
    text: "일주일 뒤, 대문이 거칠게 열리고 눈발을 뒤집어쓴 진짜 옹고집이 뛰어 들어왔다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "평온해진 집에 진짜 옹고집이 돌아오며 갈등이 폭발합니다.",
    emotionNote: "진짜 옹고집: 격분 · 가족: 놀람",
  }),
  originalScene({
    id: "onggojib-home-13",
    type: "dialogue",
    speaker: "left",
    speakerName: "분노한 옹고집",
    text: "어느 괘씸한 놈이 내 행세를 하며 내 집을 차지했느냐.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.winterCourtyard,
    emotionNote: "진짜 옹고집: 분노 · 가짜 옹고집: 침착함",
  }),
  originalScene({
    id: "onggojib-home-14",
    type: "dialogue",
    speaker: "right",
    speakerName: "가짜 옹고집",
    text: "아이들이 놀랍니다. 부인, 아이들을 데리고 뒤로 물러서시오.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "가짜 옹고집이 말보다 행동으로 가족을 보호합니다.",
    emotionNote: "가짜 옹고집: 단호함 · 아이들: 두려움",
  }),
  originalScene({
    id: "onggojib-home-15",
    text: "분노한 옹고집이 한 걸음 다가오자 아이들이 뒤로 물러섰다. 또 다른 옹고집은 아이들 앞에 서서 그를 막았다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "훗날 막내가 누구 뒤로 숨는지 이해할 근거를 만듭니다.",
    emotionNote: "아이들: 공포 · 가짜 옹고집: 보호 · 진짜 옹고집: 분노",
  }),
  originalScene({
    id: "onggojib-home-16",
    text: "고함이 대문 밖까지 번졌다. 이웃들이 관아에 알렸고, 포졸들은 두 사람과 가족을 관아로 데려갔다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.winterCourtyard,
    purposeNote: "집안의 충돌을 관아 장면으로 자연스럽게 연결합니다.",
    emotionNote: "가족: 불안 · 두 옹고집: 팽팽한 대립",
    directionNote: "다음 챕터에서 관아 마당으로 전환합니다.",
  }),
];

const ORIGINAL_ONGGOJIB_FIRST_COURT: TemplateScene[] = [
  originalScene({
    id: "onggojib-court-1",
    text: "관아 마당에 두 옹고집이 나란히 섰다. 포졸들도 두 사람을 구별하지 못했다.",
    leftAssetId: OG.character.magistrate,
    rightAssetId: OG.character.posol,
    backgroundId: OG.background.court,
    purposeNote: "두 옹고집을 가려내기 위한 첫 관아 장면입니다.",
    emotionNote: "사또: 신중함 · 포졸: 혼란",
    directionNote:
      "pinky-ne-site 원작의 관아 마당과 사또·포졸 배치를 따릅니다.",
  }),
  originalScene({
    id: "onggojib-court-2",
    text: "사또가 집안 살림과 오래된 일을 차례로 물었지만 두 사람의 대답은 똑같았다.",
    leftAssetId: OG.character.magistrate,
    rightAssetId: OG.character.posol,
    backgroundId: OG.background.court,
    purposeNote: "겉모습과 기억만으로는 두 사람을 가릴 수 없음을 보여 줍니다.",
    emotionNote: "사또: 고민 · 관아 사람들: 혼란",
  }),
  originalScene({
    id: "onggojib-court-3",
    type: "dialogue",
    speaker: "left",
    speakerName: "분노한 옹고집",
    text: "더 물을 것도 없습니다! 저놈을 당장 끌어내십시오. 내가 이 집 주인이오.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.court,
    emotionNote: "진짜 옹고집: 분노 · 가짜 옹고집: 침착함",
  }),
  originalScene({
    id: "onggojib-court-4",
    type: "dialogue",
    speaker: "left",
    speakerName: "사또",
    text: "관아 마당에서 소리부터 높이지 마라. 한 걸음 물러서라.",
    leftAssetId: OG.character.magistrate,
    rightAssetId: OG.character.wifeResolved,
    backgroundId: OG.background.court,
    emotionNote: "사또: 단호함 · 부인: 긴장",
  }),
  originalScene({
    id: "onggojib-court-5",
    text: "포졸들이 분노한 옹고집을 뒤로 물리자, 막내는 조용한 옹고집 뒤로 숨었다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.court,
    purposeNote: "아이가 두 사람 앞에서 느끼는 감정의 차이를 보여 줍니다.",
    emotionNote: "막내: 두려움 · 가짜 옹고집: 보호하려는 마음",
  }),
  originalScene({
    id: "onggojib-court-6",
    type: "dialogue",
    speaker: "left",
    speakerName: "분노한 옹고집",
    text: "내 자식이 저놈에게 붙다니. 이리 오지 못하느냐.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.court,
    emotionNote: "진짜 옹고집: 분노 · 막내: 두려움",
  }),
  originalScene({
    id: "onggojib-court-7",
    type: "dialogue",
    speaker: "right",
    speakerName: "조용한 옹고집",
    text: "아이에게 소리치지 마시오. 화가 나거든 나에게 하시오.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.fakeGentle,
    backgroundId: OG.background.court,
    emotionNote: "가짜 옹고집: 단호한 보호 · 진짜 옹고집: 분노",
  }),
  originalScene({
    id: "onggojib-court-8",
    type: "dialogue",
    speaker: "left",
    speakerName: "사또",
    text: "누가 진짜 옹고집인지 가릴 길이 없구나. 부인, 누구와 집으로 돌아가겠느냐.",
    leftAssetId: OG.character.magistrate,
    rightAssetId: OG.character.wifeResolved,
    backgroundId: OG.background.court,
    purposeNote: "사또가 부인에게 마지막 결정을 맡깁니다.",
    emotionNote: "사또: 고민 · 부인: 갈등",
  }),
  originalScene({
    id: "onggojib-court-9",
    text: "부인은 소리친 남편과 막내 앞을 막아 선 사람을 번갈아 보았다.",
    leftAssetId: OG.character.realAngry,
    rightAssetId: OG.character.wifeResolved,
    backgroundId: OG.background.court,
    purposeNote: "부인이 선택하기 직전의 갈등을 보여 줍니다.",
    emotionNote: "부인: 갈등 · 진짜 옹고집: 초조함",
    directionNote: "다음 장면에서 원작의 가짜 옹고집 선택으로 이어집니다.",
  }),
];

const ORIGINAL_ONGGOJIB_WIFE_CHOICE: TemplateScene[] = [
  originalScene({
    id: "onggojib-wife-choice-1",
    type: "dialogue",
    speaker: "right",
    speakerName: "부인",
    text: "아이들을 지켜 준 저 사람과 돌아가겠습니다.",
    leftAssetId: OG.character.fakeGentle,
    rightAssetId: OG.character.wifeResolved,
    backgroundId: OG.background.court,
    purposeNote:
      "pinky-ne-site 원작에서 부인이 가짜 옹고집을 선택하는 고정 장면입니다.",
    emotionNote: "부인: 결심 · 가짜 옹고집: 침착함",
    directionNote: "이 선택의 결과부터 학생이 새롭게 이어 씁니다.",
  }),
];

export const ONGGOJIB_CONTINUATION_TEMPLATE: StoryProject = {
  id: "template-onggojib-wife-choice",
  title: "옹고집전: 아내의 선택 이후",
  description:
    "가짜 옹고집이 가족의 마음을 얻은 과정을 읽고, 아내의 선택 뒤부터 이어 쓰는 이야기",
  continuation: {
    chapterId: "onggojib-continuation",
    lineId: "onggojib-continuation-line-1",
    label: "선택 뒤 첫 장면",
  },
  planning: {
    premise:
      "똑같이 생긴 두 옹고집 앞에서 아내는 오래 함께 산 남편이 아니라 아이들이 안심하고 말을 꺼낼 수 있게 해 준 사람을 선택합니다. 이 선택 뒤에는 어떤 일이 벌어질까요?",
    structureMode: "four",
    material:
      "pinky-ne-site 옹고집전의 첫 관아 장면에서 ‘아이를 감싸 준 옹고집과 돌아간다’를 고른 갈래",
    theme:
      "한 사람을 그 사람답게 만드는 것은 얼굴과 이름일까, 다른 사람을 대하는 태도일까?",
    mainCharacter: "진짜 옹고집과 아내",
    mainGoal:
      "인물들은 아내가 내린 선택의 결과를 마주하고 앞으로 어떻게 살아갈지 정한다.",
    centralProblem:
      "아내는 가족을 지키기 위해 가짜 옹고집을 선택했지만, 진짜 옹고집은 이름과 집을 잃을 위기에 놓였습니다.",
    stakes:
      "이후의 행동에 따라 진짜 옹고집, 아내와 아이들, 가짜 옹고집의 관계와 삶이 달라집니다.",
    endingChange:
      "마지막에는 진짜 옹고집과 가족의 관계가 처음과 어떻게 달라졌는지 보여 준다.",
    opening:
      "옹고집이 집을 비운 사이 똑같이 생긴 사람이 찾아오고, 아이들은 자신들의 말을 기다려 주는 그 앞에서 조금씩 마음을 놓는다.",
    middle:
      "진짜 옹고집이 돌아와 화를 내자 아이들은 물러서고, 가짜 옹고집은 아이들 앞을 막아선다. 두 사람은 결국 관아로 간다.",
    crisis:
      "아내는 아이들을 지켜 준 가짜 옹고집과 돌아가겠다고 선택한다.",
    climax: "",
    ending: "",
    characterNotes:
      "진짜 옹고집은 자신의 이름과 집을 빼앗길까 분노하지만, 아이들이 왜 자신을 두려워하는지는 아직 보지 못합니다.\n가짜 옹고집은 엿을 건네는 것보다 아이의 서툰 이야기를 끝까지 기다려 주는 태도로 가족의 마음을 얻습니다.\n아내는 진짜 남편이 누구인지 알면서도 아이들이 다시 눈치만 보며 살게 할 수 없다고 생각합니다.\n사또는 얼굴과 기억으로 두 사람을 구별하지 못해 아내에게 결정을 맡깁니다.",
    worldNotes:
      "겨울의 옹고집 집에서 가족의 변화를 본 뒤 첫 관아 마당으로 이동합니다. 이후에는 눈길, 따뜻한 방, 다시 찾은 관아와 봄날 마당 등 원작 이미지를 자유롭게 사용할 수 있습니다.",
    mood: "혼란 · 분노 · 보호 · 선택의 무게",
    openQuestions:
      "진짜 옹고집은 아내의 선택을 듣고 무엇을 할까?\n사또는 어떤 판결을 내릴까?\n가짜 옹고집은 가족과 함께 집으로 돌아갈까?\n진짜 옹고집은 자신의 잘못을 깨닫게 될까?",
    freeNotes:
      "첫 선택은 원작의 ‘아이를 감싸 준 옹고집과 돌아간다’로 고정했습니다. 그 직후 관아에서 벌어지는 일부터 새롭게 만드세요.",
  },
  sheetUrl: "",
  sheetEditable: false,
  speakerNames: [
    "진짜 옹고집",
    "가짜 옹고집",
    "부인",
    "사또",
    "포졸",
    "막내",
    "둘째",
  ],
  updatedAt: "pinky-ne-site 최신 원작 반영",
  chapters: [
    {
      id: "onggojib-origin-home-change",
      order: 1,
      title: "같은 얼굴, 다른 태도",
      summary:
        "진짜 옹고집 앞에서 말없이 지내던 아이들이, 똑같이 생겼지만 자신들의 말을 기다려 주는 사람 앞에서 조금씩 마음을 놓습니다.",
      purpose:
        "아내와 아이들이 가짜 옹고집을 믿게 된 이유를 설명하지 않고 행동으로 보여 주는 원작 부분",
      mood: "낯섦 · 조심스러운 안도 · 다시 찾아온 긴장",
      keyEvents:
        "진짜 옹고집이 밥알을 흘린 막내를 몰아세운다.\n가짜 옹고집이 추운 밖에 선 가족을 먼저 걱정한다.\n아이들이 엿을 나누고 까치 이야기를 끝까지 한다.\n진짜 옹고집이 돌아오자 아이들이 물러선다.\n두 옹고집과 가족이 관아로 향한다.",
      nextChapterIdea: "사또가 두 옹고집을 가려내려 한다.",
      chapterSpeakerNames: [
        "진짜 옹고집",
        "가짜 옹고집",
        "부인",
        "둘째",
        "막내",
      ],
      characterAssetIds: ONGGOJIB_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ONGGOJIB_BACKGROUND_ASSET_IDS,
      backgroundId: OG.background.winterCourtyard,
      leftAssetId: OG.character.fakeGentle,
      rightAssetId: OG.character.wifeConcerned,
    },
    {
      id: "onggojib-origin-court",
      order: 2,
      title: "두 옹고집의 첫 관아",
      summary:
        "똑같이 생긴 두 옹고집을 두고 사또와 가족이 누구를 믿을지 고민합니다.",
      purpose: "아내가 선택하게 된 까닭을 이해하는 원작 부분",
      mood: "혼란 · 분노 · 두려움",
      keyEvents:
        "두 옹고집의 대답이 모두 같다.\n진짜 옹고집이 소리친다.\n막내가 가짜 옹고집 뒤로 숨는다.",
      nextChapterIdea: "사또가 아내에게 함께 돌아갈 사람을 고르게 한다.",
      chapterSpeakerNames: [
        "진짜 옹고집",
        "가짜 옹고집",
        "부인",
        "사또",
        "포졸",
        "막내",
        "둘째",
      ],
      characterAssetIds: ONGGOJIB_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ONGGOJIB_BACKGROUND_ASSET_IDS,
      backgroundId: OG.background.court,
      leftAssetId: OG.character.realAngry,
      rightAssetId: OG.character.fakeGentle,
    },
    {
      id: "onggojib-origin-choice",
      order: 3,
      title: "아내가 선택한 사람",
      summary:
        "아내는 아이들을 지켜 준 가짜 옹고집과 돌아가겠다고 말합니다.",
      purpose: "학생이 이어 쓰기 전에 고정해 둔 원작의 선택",
      mood: "결심 · 긴장 · 선택의 무게",
      keyEvents: "아내가 가짜 옹고집을 선택한다.",
      nextChapterIdea: "선택을 들은 사람들과 사또가 반응한다.",
      chapterSpeakerNames: ["진짜 옹고집", "가짜 옹고집", "부인", "사또"],
      characterAssetIds: ONGGOJIB_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ONGGOJIB_BACKGROUND_ASSET_IDS,
      backgroundId: OG.background.court,
      leftAssetId: OG.character.fakeGentle,
      rightAssetId: OG.character.wifeResolved,
    },
    {
      id: "onggojib-continuation",
      order: 4,
      title: "여기서부터 이어 쓰기",
      summary:
        "아내의 선택을 들은 뒤, 관아에서는 어떤 일이 벌어질까요?",
      purpose: "학생이 선택 직후의 첫 반응부터 자유롭게 이어 쓰는 부분",
      mood: "",
      keyEvents:
        "아내의 선택을 들은 인물이 반응한다.\n사또가 판결하거나 새로운 사건이 시작된다.",
      nextChapterIdea: "",
      chapterSpeakerNames: [
        "진짜 옹고집",
        "가짜 옹고집",
        "부인",
        "사또",
        "포졸",
        "막내",
        "둘째",
      ],
      characterAssetIds: ONGGOJIB_CHARACTER_ASSET_IDS,
      backgroundAssetIds: ONGGOJIB_BACKGROUND_ASSET_IDS,
      backgroundId: OG.background.court,
      leftAssetId: OG.character.realAngry,
      rightAssetId: OG.character.wifeResolved,
    },
  ],
  lines: [
    ...templateLines(
      "onggojib-origin-home-change",
      ORIGINAL_ONGGOJIB_HOME_CHANGE,
    ),
    ...templateLines("onggojib-origin-court", ORIGINAL_ONGGOJIB_FIRST_COURT),
    ...templateLines("onggojib-origin-choice", ORIGINAL_ONGGOJIB_WIFE_CHOICE),
    {
      id: "onggojib-continuation-line-1",
      chapterId: "onggojib-continuation",
      order: 1,
      type: "dialogue",
      speaker: "left",
      speakerName: "진짜 옹고집",
      text: "",
      leftAssetId: OG.character.realAngry,
      rightAssetId: OG.character.wifeResolved,
      backgroundId: OG.background.court,
      purposeNote:
        "아내의 선택을 들은 진짜 옹고집 또는 다른 인물의 첫 반응을 써 보세요.",
      emotionNote: "",
      directionNote:
        "원작의 진짜 옹고집 왼쪽·부인 오른쪽·관아 마당 배치에서 시작합니다.",
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
