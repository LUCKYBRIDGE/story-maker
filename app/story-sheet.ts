import { STORY_ASSETS, type StoryAsset } from "./story-assets";
import {
  cloneProject,
  type Chapter,
  type StoryLine,
  type StoryProject,
} from "./story-data";
import type { StorySheetSnapshot } from "./story-workbook";

type CsvRow = Record<string, string>;

const SHEET_ID_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
const ASSET_BY_ID = new Map(STORY_ASSETS.map((asset) => [asset.id, asset]));

function normalizeAssetName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("ko")
    .replace(/\.png$/i, "")
    .replace(/[·_\-\s]/g, "");
}

function findAsset(value: string, type: StoryAsset["type"]) {
  if (!value.trim()) return undefined;
  const direct = ASSET_BY_ID.get(value.trim());
  if (direct?.type === type) return direct;
  const normalized = normalizeAssetName(value);
  return STORY_ASSETS.find(
    (asset) =>
      asset.type === type &&
      [asset.displayName, asset.label, asset.id].some(
        (candidate) => normalizeAssetName(candidate) === normalized,
      ),
  );
}

function splitList(value: string) {
  return value
    .split(/[,，;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() ?? ""]),
    ),
  );
}

function getValue(row: CsvRow, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key].trim();
  }
  return "";
}

function isEnabled(row: CsvRow) {
  const value = getValue(row, "사용", "enabled", "활성").toLowerCase();
  return !["false", "no", "아니요", "0", "사용 안 함"].includes(value);
}

export function extractSheetId(url: string) {
  return url.match(SHEET_ID_PATTERN)?.[1] ?? "";
}

function sheetCsvUrl(sheetId: string, tabName: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

async function fetchSheetTab(
  sheetId: string,
  tabName: string,
  signal: AbortSignal,
) {
  const response = await fetch(sheetCsvUrl(sheetId, tabName), {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`‘${tabName}’ 탭을 읽지 못했어요.`);
  return response.text();
}

export async function fetchSheetSnapshot(
  sheetId: string,
  signal: AbortSignal,
): Promise<StorySheetSnapshot> {
  const [project, chapters] = await Promise.all(
    ["작품", "챕터"].map((tab) => fetchSheetTab(sheetId, tab, signal)),
  );
  let speakers = "";
  try {
    speakers = await fetchSheetTab(sheetId, "화자", signal);
  } catch {
    // 이전 형식은 장면에 쓰인 화자 이름으로 목록을 복원합니다.
  }
  let lines = "";
  try {
    lines = await fetchSheetTab(sheetId, "장면", signal);
  } catch {
    lines = await fetchSheetTab(sheetId, "대사", signal);
  }
  return { project, speakers, chapters, lines };
}

export function buildProjectFromSheet(
  snapshot: StorySheetSnapshot,
  sheetUrl: string,
) {
  const projectRows = parseCsv(snapshot.project);
  const speakerRows = parseCsv(snapshot.speakers ?? "").filter(isEnabled);
  const chapterRows = parseCsv(snapshot.chapters).filter(isEnabled);
  const lineRows = parseCsv(snapshot.lines).filter(isEnabled);
  const projectRow = projectRows[0] ?? {};
  const problems: string[] = [];

  const chapters: Chapter[] = chapterRows
    .filter((row) =>
      getValue(row, "챕터 ID", "chapter_id", "chapter_key", "챕터"),
    )
    .map((row, index) => {
      const id =
        getValue(row, "챕터 ID", "chapter_id", "chapter_key", "챕터") ||
        `chapter-${index + 1}`;
      const backgroundText = getValue(
        row,
        "배경 이미지",
        "background",
        "background_asset",
      );
      const leftText = getValue(
        row,
        "왼쪽 기본 이미지",
        "left_image",
        "left_asset",
      );
      const rightText = getValue(
        row,
        "오른쪽 기본 이미지",
        "right_image",
        "right_asset",
      );
      const background = findAsset(backgroundText, "background");
      const left = findAsset(leftText, "character");
      const right = findAsset(rightText, "character");
      const characterAssetIds = splitList(
        getValue(
          row,
          "캐릭터 이미지 목록",
          "character_assets",
          "캐릭터 자료",
        ),
      ).flatMap((name) => {
        const asset = findAsset(name, "character");
        if (!asset) problems.push(`${id}: 캐릭터 자료 ‘${name}’`);
        return asset ? [asset.id] : [];
      });
      const backgroundAssetIds = splitList(
        getValue(
          row,
          "장소·배경 목록",
          "background_assets",
          "배경 자료",
        ),
      ).flatMap((name) => {
        const asset = findAsset(name, "background");
        if (!asset) problems.push(`${id}: 배경 자료 ‘${name}’`);
        return asset ? [asset.id] : [];
      });
      if (backgroundText && !background) {
        problems.push(`${id}: 배경 ‘${backgroundText}’`);
      }
      if (leftText && !left) problems.push(`${id}: 왼쪽 ‘${leftText}’`);
      if (rightText && !right) problems.push(`${id}: 오른쪽 ‘${rightText}’`);

      return {
        id,
        order: Number(getValue(row, "순서", "order")) || index + 1,
        title:
          getValue(row, "챕터 제목", "title", "제목") || `챕터 ${index + 1}`,
        summary: getValue(row, "한 줄 줄거리", "summary", "줄거리"),
        purpose: getValue(row, "챕터 역할", "purpose", "목적"),
        mood: getValue(row, "분위기", "mood"),
        keyEvents: getValue(row, "꼭 들어갈 사건", "key_events", "주요 사건"),
        nextChapterIdea: getValue(
          row,
          "다음 챕터 아이디어",
          "next_chapter_idea",
          "다음 내용",
        ),
        chapterSpeakerNames: getValue(
          row,
          "이 챕터 화자",
          "chapter_speakers",
        )
          .split(/[,，]/)
          .map((name) => name.trim())
          .filter(Boolean),
        characterAssetIds,
        backgroundAssetIds,
        backgroundId: background?.id ?? "",
        leftAssetId: left?.id ?? "",
        rightAssetId: right?.id ?? "",
      };
    })
    .sort((a, b) => a.order - b.order);

  const chapterIds = new Set(chapters.map((chapter) => chapter.id));
  const lines: StoryLine[] = lineRows
    .filter((row) =>
      getValue(
        row,
        "장면 ID",
        "대사 ID",
        "line_id",
        "line_key",
        "장면",
        "대사",
      ),
    )
    .map((row, index) => {
      const chapterId = getValue(
        row,
        "챕터 ID",
        "chapter_id",
        "chapter_key",
        "챕터",
      );
      const lineId =
        getValue(
          row,
          "장면 ID",
          "대사 ID",
          "line_id",
          "line_key",
          "장면",
          "대사",
        ) || `scene-${index + 1}`;
      const typeText = getValue(row, "종류", "type").toLowerCase();
      const type: StoryLine["type"] =
        typeText === "해설" || typeText === "narration"
          ? "narration"
          : "dialogue";
      const speakerText = getValue(row, "화자 위치", "speaker", "화자");
      const speaker: StoryLine["speaker"] =
        type === "narration"
          ? "narration"
          : speakerText === "오른쪽" || speakerText.toLowerCase() === "right"
            ? "right"
            : "left";
      const leftText = getValue(row, "왼쪽 이미지", "left_image", "left_asset");
      const rightText = getValue(
        row,
        "오른쪽 이미지",
        "right_image",
        "right_asset",
      );
      const backgroundText = getValue(
        row,
        "장면 배경",
        "background",
        "background_override",
      );
      const left = leftText ? findAsset(leftText, "character") : undefined;
      const right = rightText ? findAsset(rightText, "character") : undefined;
      const background = backgroundText
        ? findAsset(backgroundText, "background")
        : undefined;
      if (!chapterIds.has(chapterId)) {
        problems.push(`${lineId}: 없는 챕터 ‘${chapterId}’`);
      }
      if (leftText && !left) problems.push(`${lineId}: 왼쪽 ‘${leftText}’`);
      if (rightText && !right) problems.push(`${lineId}: 오른쪽 ‘${rightText}’`);
      if (backgroundText && !background) {
        problems.push(`${lineId}: 배경 ‘${backgroundText}’`);
      }

      return {
        id: lineId,
        chapterId,
        order: Number(getValue(row, "순서", "order")) || index + 1,
        type,
        speaker,
        speakerName:
          getValue(row, "화자 이름", "speaker_name", "이름") ||
          (type === "narration"
            ? "해설"
            : speaker === "left"
              ? "왼쪽 인물"
              : "오른쪽 인물"),
        text: getValue(row, "내용", "text", "대사 내용"),
        leftAssetId: left?.id ?? "",
        rightAssetId: right?.id ?? "",
        backgroundId: background?.id ?? "",
        purposeNote: getValue(row, "장면 역할", "purpose_note", "장면 메모"),
        emotionNote: getValue(row, "감정 메모", "emotion_note"),
        directionNote: getValue(row, "연출 메모", "direction_note"),
      };
    })
    .sort((a, b) =>
      a.chapterId === b.chapterId
        ? a.order - b.order
        : chapters.findIndex((chapter) => chapter.id === a.chapterId) -
          chapters.findIndex((chapter) => chapter.id === b.chapterId),
    );

  if (chapters.length === 0) problems.push("사용할 챕터가 없어요.");
  if (problems.length > 0) {
    throw new Error(
      `시트에서 ${problems.length}곳을 확인해 주세요: ${problems
        .slice(0, 3)
        .join(" / ")}${problems.length > 3 ? " 외" : ""}`,
    );
  }

  const speakerNames = Array.from(
    new Set([
      ...speakerRows.map((row) =>
        getValue(row, "화자 이름", "speaker_name", "이름"),
      ),
      ...lines
        .filter((line) => line.type === "dialogue")
        .map((line) => line.speakerName),
    ]),
  ).filter(Boolean);

  return cloneProject({
    id: extractSheetId(sheetUrl)
      ? `sheet-${extractSheetId(sheetUrl)}`
      : `excel-${Date.now()}`,
    title: getValue(projectRow, "작품 제목", "title") || "이름 없는 이야기",
    description:
      getValue(projectRow, "작품 소개", "description") || "불러온 이야기",
    planning: {
      premise: getValue(projectRow, "한 줄 이야기", "premise"),
      theme: getValue(projectRow, "주제", "theme"),
      mainCharacter: getValue(
        projectRow,
        "이야기의 주인공",
        "main_character",
      ),
      mainGoal: getValue(projectRow, "주인공이 바라는 것", "main_goal"),
      centralProblem: getValue(
        projectRow,
        "이야기의 중심 문제",
        "central_problem",
      ),
      endingChange: getValue(
        projectRow,
        "마지막에 달라지는 점",
        "ending_change",
      ),
      opening: getValue(projectRow, "처음", "opening"),
      middle: getValue(projectRow, "가운데", "middle"),
      ending: getValue(projectRow, "끝", "ending"),
      characterNotes: getValue(
        projectRow,
        "등장인물 구상",
        "character_notes",
      ),
      mood: getValue(projectRow, "전체 분위기", "mood"),
      openQuestions: getValue(
        projectRow,
        "아직 정하지 못한 것",
        "open_questions",
      ),
      freeNotes: getValue(projectRow, "자유 창작 메모", "free_notes"),
    },
    sheetUrl,
    sheetEditable: false,
    speakerNames,
    chapters,
    lines,
    updatedAt: new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  } satisfies StoryProject);
}
