const CURRENT_V1_PROJECT = {
  id: "fixture-story-001",
  title: "고정된 이야기",
  description: "저장 호환성 검사를 위한 작은 작품",
  continuation: {
    chapterId: "chapter-001",
    lineId: "line-002",
    label: "두 번째 장면부터 이어 쓰기",
  },
  planning: {
    premise: "서로 다른 두 친구가 약속을 지키는 방법을 배웁니다.",
    structureMode: "five",
    material: "약속과 편지",
    theme: "약속은 말보다 행동으로 지킨다.",
    mainCharacter: "다온",
    mainGoal: "친구에게 편지를 제때 전하고 싶다.",
    centralProblem: "비가 와서 다리가 끊겼다.",
    stakes: "약속을 지키지 못하면 친구가 혼자 기다린다.",
    endingChange: "다온은 도움을 요청하는 방법을 배운다.",
    opening: "다온은 약속한 편지를 들고 길을 나선다.",
    middle: "비 때문에 다리를 건널 수 없게 된다.",
    crisis: "혼자 해결하려던 다온은 길을 잃는다.",
    climax: "다온은 자라에게 길을 묻고 함께 다리를 고친다.",
    ending: "두 친구는 편지를 전하고 다음 약속을 정한다.",
    characterNotes: "다온은 서두르지만 친구를 아낀다.",
    worldNotes: "비가 내린 들판과 작은 나무다리가 있다.",
    mood: "기대 → 걱정 → 안도",
    openQuestions: "다음 약속에는 누가 함께할까?",
    freeNotes: " 편지 끝 문장은 나중에 고친다.\n",
  },
  creativeMemos: [
    {
      id: "memo-001",
      kind: "event",
      title: "다리가 끊어진 사건",
      linkedChapterId: "chapter-001",
      linkedLineId: "line-002",
      fields: [
        {
          id: "memo-001-field-001",
          label: "무슨 일이 생기는가",
          value: "큰비로 나무다리 한쪽이 끊어진다.",
          order: 1,
          source: "default",
        },
      ],
      order: 1,
      createdAt: "2026-08-24T09:00:00.000Z",
      updatedAt: "2026-08-24T09:00:00.000Z",
    },
  ],
  sheetUrl: "https://docs.google.com/spreadsheets/d/fixed-sheet-id/edit",
  sheetEditable: false,
  speakerNames: ["다온", "자라"],
  chapters: [
    {
      id: "chapter-001",
      order: 1,
      title: "비가 내린 약속",
      summary: "다온은 비가 오기 전에 편지를 전하려 한다.",
      purpose: "주인공의 목표와 문제를 보여 주는 발단",
      mood: "기대 → 걱정",
      keyEvents: "다온이 편지를 받는다.\n비가 세차게 내린다.",
      nextChapterIdea: "자라에게 도움을 청한다.",
      storyStageKeys: ["opening"],
      chapterSpeakerNames: ["다온", "자라"],
      characterAssetIds: ["rabbit-turtle.character.rabbit-white-unified-720x900"],
      backgroundAssetIds: ["rabbit-turtle.background.rabbit-turtle-bg-grassland"],
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      leftAssetId: "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId: "rabbit-turtle.character.turtle-unified-720x900",
    },
  ],
  lines: [
    {
      id: "line-001",
      chapterId: "chapter-001",
      order: 1,
      type: "narration",
      speaker: "narration",
      speakerName: "",
      text: " 첫 문장입니다.\n둘째 문장입니다. ",
      leftAssetId: "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId: "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      purposeNote: "배경과 목표를 보여 준다.",
      emotionNote: "기대",
      directionNote: "다온이 편지를 꼭 쥔다.",
    },
    {
      id: "line-002",
      chapterId: "chapter-001",
      order: 2,
      type: "dialogue",
      speaker: "right",
      speakerName: "자라",
      text: "함께 다리를 고쳐 보자.",
      leftAssetId: "rabbit-turtle.character.rabbit-white-unified-720x900",
      rightAssetId: "rabbit-turtle.character.turtle-unified-720x900",
      backgroundId: "rabbit-turtle.background.rabbit-turtle-bg-grassland",
      purposeNote: "도움의 방법을 제안한다.",
      emotionNote: "차분함",
      directionNote: "자라가 다리를 가리킨다.",
    },
  ],
  updatedAt: "2026-08-24 오전 9:00",
};

export const FIXTURE_IDS = {
  project: "fixture-story-001",
  chapter: "chapter-001",
  firstLine: "line-001",
  secondLine: "line-002",
  memo: "memo-001",
  missingChapter: "chapter-missing",
};

export const MALFORMED_STORY_PROJECT_JSON =
  '{"id":"fixture-story-001","title":"닫히지 않은 JSON"';

export function createCurrentV1ProjectFixture() {
  return structuredClone(CURRENT_V1_PROJECT);
}

export function createLegacyProjectWithoutCreativeMemosFixture() {
  const project = createCurrentV1ProjectFixture();
  delete project.creativeMemos;
  return project;
}

export function createDuplicateLineIdProjectFixture() {
  const project = createCurrentV1ProjectFixture();
  project.lines[1].id = project.lines[0].id;
  return project;
}

export function createMissingChapterReferenceProjectFixture() {
  const project = createCurrentV1ProjectFixture();
  project.lines[1].chapterId = FIXTURE_IDS.missingChapter;
  return project;
}
