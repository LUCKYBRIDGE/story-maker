import { STORY_ASSETS, type StoryAsset } from "./story-assets";
import {
  cloneProject,
  type Chapter,
  type StoryLine,
  type StoryProject,
} from "./story-data";
import {
  createStoryImportSnapshot,
  storyImportCell,
  StoryImportError,
  type StoryImportIssue,
  type StoryImportSnapshot,
} from "./story-import";
import {
  creativeMemoKindFromLabel,
  creativeMemoSourceFromLabel,
  normalizeCreativeMemos,
  type CreativeMemo,
} from "./creative-memos";
import { parseStoryStageKeysText } from "./story-stages";

type CsvRow = Record<string, string> & {
  readonly __sheetName?: string;
  readonly __rowNumber?: number;
};

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

function parseCsv(
  csv: string,
  sheetName: string,
  source: StoryImportSnapshot["source"],
) {
  const rows: Array<{ values: string[]; rowNumber: number }> = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let rowNumber = 1;

  function finishRow() {
    const values = [...row, cell];
    if (values.some((value) => value.trim())) {
      rows.push({ values, rowNumber });
    }
    row = [];
    cell = "";
    rowNumber += 1;
  }

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
      finishRow();
    } else {
      cell += char;
    }
  }

  if (quoted) {
    throw new StoryImportError([
      {
        severity: "error",
        source,
        sheet: sheetName,
        row: rowNumber,
        column: "알 수 없음",
        value: cell,
        message: "닫히지 않은 큰따옴표가 있어 CSV 한 칸의 끝을 알 수 없어요.",
        fix: "셀 안의 큰따옴표는 두 번(\"\") 쓰고, 열어 둔 큰따옴표는 닫아 주세요.",
      },
    ]);
  }
  if (row.length > 0 || cell.length > 0) finishRow();
  if (rows.length === 0) return [];
  const headers = rows[0].values.map((header) => header.trim());
  return rows.slice(1).map(({ values, rowNumber }) => {
    const row = Object.fromEntries(
      headers.map((header, column) => [header, values[column] ?? ""]),
    ) as CsvRow;
    Object.defineProperties(row, {
      __sheetName: { value: sheetName, enumerable: false },
      __rowNumber: { value: rowNumber, enumerable: false },
    });
    return row;
  });
}

function parseProjectCsv(
  csv: string,
  sheetName: string,
  source: StoryImportSnapshot["source"],
) {
  const rows = parseCsv(csv, sheetName, source);
  if (!rows.some((row) => "항목" in row && "내용" in row)) return rows;
  return [
    Object.fromEntries(
      rows
        .map((row) => [getValue(row, "항목"), getRawValue(row, "내용")])
        .filter(([key]) => key),
    ),
  ];
}

function getValue(row: CsvRow, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined) return storyImportCell(row[key]).normalized;
  }
  return "";
}

function getRawValue(row: CsvRow, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined) return storyImportCell(row[key]).raw;
  }
  return "";
}

function issueAt(
  source: StoryImportSnapshot["source"],
  row: CsvRow | undefined,
  keys: string[],
  value: string,
  message: string,
  fix: string,
): StoryImportIssue {
  const column = keys.find((key) => row?.[key] !== undefined) ?? keys[0];
  return {
    severity: "error",
    source,
    sheet: row?.__sheetName ?? "가져오기",
    row: row?.__rowNumber ?? 1,
    column,
    value,
    message,
    fix,
  };
}

function addDuplicateIdIssues({
  source,
  rows,
  keys,
  label,
  fix,
  issues,
}: {
  source: StoryImportSnapshot["source"];
  rows: CsvRow[];
  keys: string[];
  label: string;
  fix: string;
  issues: StoryImportIssue[];
}) {
  const firstRowsById = new Map<string, CsvRow>();
  for (const row of rows) {
    const id = getValue(row, ...keys);
    if (!id) continue;
    const firstRow = firstRowsById.get(id);
    if (!firstRow) {
      firstRowsById.set(id, row);
      continue;
    }
    issues.push(
      issueAt(
        source,
        row,
        keys,
        getRawValue(row, ...keys),
        `${label} ‘${id}’이(가) ${firstRow.__rowNumber ?? 1}행에 이미 있어요.`,
        fix,
      ),
    );
  }
}

function parseStructureMode(value: string): StoryProject["planning"]["structureMode"] {
  const normalized = value.trim().toLowerCase();
  if (["4단계", "four", "4"].includes(normalized)) return "four";
  if (["3단계", "three", "3", "처음-중간-끝"].includes(normalized)) {
    return "three";
  }
  return "five";
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

async function fetchFirstAvailableTab(
  sheetId: string,
  tabNames: string[],
  signal: AbortSignal,
) {
  for (const tabName of tabNames) {
    try {
      return { name: tabName, csv: await fetchSheetTab(sheetId, tabName, signal) };
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  throw new StoryImportError([
    {
      severity: "error",
      source: "sheet",
      sheet: tabNames.join(" 또는 "),
      row: 1,
      column: "공개 설정",
      value: sheetId,
      message: `‘${tabNames.join("’ 또는 ‘")}’ 탭을 읽지 못했어요.`,
      fix: "Google 시트를 ‘링크가 있는 모든 사용자에게 공개’로 설정하고 탭 이름을 확인해 주세요. 계속 안 되면 Excel로 저장해 불러와 주세요.",
    },
  ]);
}

export async function fetchSheetSnapshot(
  sheetId: string,
  signal: AbortSignal,
): Promise<StoryImportSnapshot> {
  const [project, chapters] = await Promise.all([
    fetchFirstAvailableTab(sheetId, ["이야기 구성", "작품"], signal),
    fetchFirstAvailableTab(sheetId, ["장의 흐름", "챕터 흐름", "챕터"], signal),
  ]);
  let chapterResources = { name: "장의 자료", csv: "" };
  try {
    chapterResources = await fetchFirstAvailableTab(
      sheetId,
      ["장의 자료", "챕터 자료"],
      signal,
    );
  } catch {
    // 이전 형식은 장/챕터 탭 안에 이미지와 화자 자료가 함께 있습니다.
  }
  let speakers = { name: "화자", csv: "" };
  try {
    speakers = {
      name: "화자",
      csv: await fetchSheetTab(sheetId, "화자", signal),
    };
  } catch {
    // 이전 형식은 컷에 쓰인 화자 이름으로 목록을 복원합니다.
  }
  const lines = await fetchFirstAvailableTab(
    sheetId,
    ["컷 대본", "대본과 컷", "장면", "대사"],
    signal,
  );
  let creativeMemos = { name: "창작 메모", csv: "" };
  try {
    creativeMemos = {
      name: "창작 메모",
      csv: await fetchSheetTab(sheetId, "창작 메모", signal),
    };
  } catch {
    // 이전 양식에는 창작 메모 탭이 없습니다.
  }
  return createStoryImportSnapshot({
    source: "sheet",
    names: {
      project: project.name,
      speakers: speakers.name,
      chapters: chapters.name,
      chapterResources: chapterResources.name,
      lines: lines.name,
      creativeMemos: creativeMemos.name,
    },
    project: project.csv,
    speakers: speakers.csv,
    chapters: chapters.csv,
    chapterResources: chapterResources.csv,
    lines: lines.csv,
    creativeMemos: creativeMemos.csv,
  });
}

export function buildProjectFromSheet(
  snapshot: StoryImportSnapshot,
  sheetUrl: string,
) {
  const projectRows = parseProjectCsv(
    snapshot.project.csv,
    snapshot.project.name,
    snapshot.source,
  );
  const speakerRows = parseCsv(
    snapshot.speakers.csv,
    snapshot.speakers.name,
    snapshot.source,
  ).filter(isEnabled);
  const chapterRows = parseCsv(
    snapshot.chapters.csv,
    snapshot.chapters.name,
    snapshot.source,
  ).filter(isEnabled);
  const chapterResourceRows = parseCsv(
    snapshot.chapterResources.csv,
    snapshot.chapterResources.name,
    snapshot.source,
  ).filter(isEnabled);
  const lineRows = parseCsv(
    snapshot.lines.csv,
    snapshot.lines.name,
    snapshot.source,
  ).filter(isEnabled);
  const creativeMemoRows = parseCsv(
    snapshot.creativeMemos.csv,
    snapshot.creativeMemos.name,
    snapshot.source,
  ).filter(
    isEnabled,
  );
  const projectRow = projectRows[0] ?? {};
  const issues: StoryImportIssue[] = [];
  const chapterIdKeys = [
    "장 ID",
    "챕터 ID",
    "chapter_id",
    "chapter_key",
    "장",
    "챕터",
  ];
  const lineIdKeys = [
    "컷 ID",
    "장면 ID",
    "대사 ID",
    "line_id",
    "line_key",
    "컷",
    "장면",
    "대사",
  ];
  const lineTypeKeys = ["종류", "type"];
  const speakerKeys = ["화자 위치", "speaker", "화자"];
  addDuplicateIdIssues({
    source: snapshot.source,
    rows: chapterRows,
    keys: chapterIdKeys,
    label: "장 ID",
    fix: "장의 흐름 탭에서 각 장에 서로 다른 장 ID를 입력해 주세요.",
    issues,
  });
  addDuplicateIdIssues({
    source: snapshot.source,
    rows: lineRows,
    keys: lineIdKeys,
    label: "컷 ID",
    fix: "컷 대본 탭에서 각 컷에 서로 다른 컷 ID를 입력해 주세요.",
    issues,
  });
  const chapterResourcesById = new Map(
    chapterResourceRows.map((row) => [
      getValue(row, "장 ID", "챕터 ID", "chapter_id", "chapter_key", "장", "챕터"),
      row,
    ]),
  );

  const chapters: Chapter[] = chapterRows
    .filter((row) =>
      getValue(row, "장 ID", "챕터 ID", "chapter_id", "chapter_key", "장", "챕터"),
    )
    .map((flowRow, index) => {
      const id =
        getValue(
          flowRow,
          "장 ID",
          "챕터 ID",
          "chapter_id",
          "chapter_key",
          "장",
          "챕터",
        ) ||
        `chapter-${index + 1}`;
      const row = {
        ...(chapterResourcesById.get(id) ?? {}),
        ...flowRow,
      };
      Object.defineProperties(row, {
        __sheetName: { value: flowRow.__sheetName, enumerable: false },
        __rowNumber: { value: flowRow.__rowNumber, enumerable: false },
      });
      const backgroundText = getValue(
        row,
        "배경 이미지",
        "장의 기본 배경",
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
        if (!asset) {
          issues.push(
            issueAt(
              snapshot.source,
              row,
              ["캐릭터 이미지 목록", "character_assets", "캐릭터 자료"],
              name,
              `캐릭터 자료 ‘${name}’을 찾을 수 없어요.`,
              "리소스 탭의 캐릭터 이미지 이름을 그대로 입력해 주세요.",
            ),
          );
        }
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
        if (!asset) {
          issues.push(
            issueAt(
              snapshot.source,
              row,
              ["장소·배경 목록", "background_assets", "배경 자료"],
              name,
              `장소·배경 자료 ‘${name}’을 찾을 수 없어요.`,
              "리소스 탭의 배경 이미지 이름을 그대로 입력해 주세요.",
            ),
          );
        }
        return asset ? [asset.id] : [];
      });
      if (backgroundText && !background) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["배경 이미지", "장의 기본 배경", "background", "background_asset"],
            getRawValue(row, "배경 이미지", "장의 기본 배경", "background", "background_asset"),
            `배경 ‘${backgroundText}’을 찾을 수 없어요.`,
            "리소스 탭의 배경 이미지 이름을 그대로 입력해 주세요.",
          ),
        );
      }
      if (leftText && !left) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["왼쪽 기본 이미지", "left_image", "left_asset"],
            getRawValue(row, "왼쪽 기본 이미지", "left_image", "left_asset"),
            `왼쪽 이미지 ‘${leftText}’을 찾을 수 없어요.`,
            "리소스 탭의 캐릭터 이미지 이름을 그대로 입력해 주세요.",
          ),
        );
      }
      if (rightText && !right) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["오른쪽 기본 이미지", "right_image", "right_asset"],
            getRawValue(row, "오른쪽 기본 이미지", "right_image", "right_asset"),
            `오른쪽 이미지 ‘${rightText}’을 찾을 수 없어요.`,
            "리소스 탭의 캐릭터 이미지 이름을 그대로 입력해 주세요.",
          ),
        );
      }

      const stageText = getValue(
        row,
        "이야기 단계",
        "단계",
        "story_stages",
        "story_stage",
        "stage",
      );
      const stageRaw = getRawValue(
        row,
        "이야기 단계",
        "단계",
        "story_stages",
        "story_stage",
        "stage",
      );
      const parsedStages = parseStoryStageKeysText(stageText);
      if (parsedStages.unknownTokens.length > 0) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["이야기 단계", "단계", "story_stages", "story_stage", "stage"],
            stageRaw,
            `이야기 단계 ‘${parsedStages.unknownTokens.join(", ")}’를 알 수 없어요.`,
            "이야기 단계에는 발단(처음), 전개(중간), 위기, 절정, 결말(끝)을 쉼표(,)나 가운뎃점(·)으로 구분해 입력해 주세요.",
          ),
        );
      }

      return {
        id,
        order: Number(getValue(row, "순서", "order")) || index + 1,
        title: getValue(row, "장 제목", "챕터 제목", "title", "제목")
          ? getRawValue(row, "장 제목", "챕터 제목", "title", "제목")
          : `${index + 1}장`,
        summary: getRawValue(row, "한 줄 사건", "한 줄 줄거리", "summary", "줄거리", "사건"),
        purpose: getRawValue(row, "장의 역할", "챕터 역할", "purpose", "목적", "역할"),
        mood: getRawValue(row, "분위기", "mood"),
        keyEvents: getRawValue(row, "꼭 들어갈 사건", "key_events", "주요 사건", "사건 목록"),
        nextChapterIdea: getRawValue(
          row,
          "다음 장 아이디어",
          "다음 챕터 아이디어",
          "next_chapter_idea",
          "다음 내용",
        ),
        storyStageKeys: parsedStages.keys,
        chapterSpeakerNames: getValue(
          row,
          "이 장의 화자",
          "이 챕터 화자",
          "chapter_speakers",
          "화자 목록",
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
        "컷 ID",
        "장면 ID",
        "대사 ID",
        "line_id",
        "line_key",
        "컷",
        "장면",
        "대사",
      ),
    )
    .map((row, index) => {
      const chapterId = getValue(
        row,
        "장 ID",
        "챕터 ID",
        "chapter_id",
        "chapter_key",
        "장",
        "챕터",
      );
      const lineId =
        getValue(
          row,
          "컷 ID",
          "장면 ID",
          "대사 ID",
          "line_id",
          "line_key",
          "컷",
          "장면",
          "대사",
        ) || `scene-${index + 1}`;
      const typeText = getValue(row, ...lineTypeKeys).toLowerCase();
      const type: StoryLine["type"] =
        typeText === "해설" || typeText === "narration"
          ? "narration"
          : "dialogue";
      if (
        typeText &&
        !["대사", "dialogue", "해설", "narration"].includes(typeText)
      ) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            lineTypeKeys,
            getRawValue(row, ...lineTypeKeys),
            `컷 종류 ‘${typeText}’를 알 수 없어요.`,
            "종류에는 ‘대사’ 또는 ‘해설’을 입력해 주세요.",
          ),
        );
      }
      const speakerText = getValue(row, ...speakerKeys);
      const normalizedSpeaker = speakerText.toLowerCase();
      const speaker: StoryLine["speaker"] =
        type === "narration"
          ? "narration"
          : speakerText === "오른쪽" || normalizedSpeaker === "right"
            ? "right"
            : "left";
      const validSpeaker =
        type === "narration"
          ? !speakerText || ["해설", "narration"].includes(normalizedSpeaker)
          :
            !speakerText ||
            ["왼쪽", "오른쪽", "left", "right"].includes(
              normalizedSpeaker,
            );
      if (!validSpeaker) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            speakerKeys,
            getRawValue(row, ...speakerKeys),
            type === "narration"
              ? `해설 컷의 화자 위치 ‘${speakerText}’를 알 수 없어요.`
              : `대사 컷의 화자 위치 ‘${speakerText}’를 알 수 없어요.`,
            type === "narration"
              ? "해설 컷의 화자 위치에는 ‘해설’을 입력해 주세요."
              : "대사 컷의 화자 위치에는 ‘왼쪽’ 또는 ‘오른쪽’을 입력해 주세요.",
          ),
        );
      }
      const leftText = getValue(row, "왼쪽 이미지", "left_image", "left_asset");
      const rightText = getValue(
        row,
        "오른쪽 이미지",
        "right_image",
        "right_asset",
      );
      const backgroundText = getValue(
        row,
        "컷 배경",
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
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["장 ID", "챕터 ID", "chapter_id", "chapter_key", "장", "챕터"],
            getRawValue(row, "장 ID", "챕터 ID", "chapter_id", "chapter_key", "장", "챕터"),
            `장 ID ‘${chapterId}’에 해당하는 장(場)이 없어요.`,
            "장의 흐름 탭에 같은 장 ID를 만들거나 컷의 장 ID를 고쳐 주세요.",
          ),
        );
      }
      if (leftText && !left) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["왼쪽 이미지", "left_image", "left_asset"],
            getRawValue(row, "왼쪽 이미지", "left_image", "left_asset"),
            `왼쪽 이미지 ‘${leftText}’을 찾을 수 없어요.`,
            "리소스 탭의 캐릭터 이미지 이름을 그대로 입력해 주세요.",
          ),
        );
      }
      if (rightText && !right) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["오른쪽 이미지", "right_image", "right_asset"],
            getRawValue(row, "오른쪽 이미지", "right_image", "right_asset"),
            `오른쪽 이미지 ‘${rightText}’을 찾을 수 없어요.`,
            "리소스 탭의 캐릭터 이미지 이름을 그대로 입력해 주세요.",
          ),
        );
      }
      if (backgroundText && !background) {
        issues.push(
          issueAt(
            snapshot.source,
            row,
            ["컷 배경", "장면 배경", "background", "background_override"],
            getRawValue(row, "컷 배경", "장면 배경", "background", "background_override"),
            `컷 배경 ‘${backgroundText}’을 찾을 수 없어요.`,
            "리소스 탭의 배경 이미지 이름을 그대로 입력해 주세요.",
          ),
        );
      }

      return {
        id: lineId,
        chapterId,
        order: Number(getValue(row, "순서", "order")) || index + 1,
        type,
        speaker,
        speakerName:
          getValue(row, "화자 이름", "speaker_name", "이름")
            ? getRawValue(row, "화자 이름", "speaker_name", "이름")
            :
          (type === "narration"
            ? "해설"
            : speaker === "left"
              ? "왼쪽 인물"
              : "오른쪽 인물"),
        text: getRawValue(row, "내용", "text", "대사 내용"),
        leftAssetId: left?.id ?? "",
        rightAssetId: right?.id ?? "",
        backgroundId: background?.id ?? "",
        purposeNote: getRawValue(row, "컷 역할", "장면 역할", "purpose_note", "장면 메모", "컷 메모"),
        emotionNote: getRawValue(row, "감정 메모", "emotion_note"),
        directionNote: getRawValue(row, "연출 메모", "direction_note"),
      };
    })
    .sort((a, b) =>
      a.chapterId === b.chapterId
        ? a.order - b.order
        : chapters.findIndex((chapter) => chapter.id === a.chapterId) -
          chapters.findIndex((chapter) => chapter.id === b.chapterId),
    );

  if (chapters.length === 0) {
    issues.push({
      severity: "error",
      source: snapshot.source,
      sheet: snapshot.chapters.name,
      row: 1,
      column: "장 ID",
      value: "",
      message: "사용할 장(場)이 없어요.",
      fix: "장의 흐름 탭에 장 ID가 있는 장을 한 개 이상 입력해 주세요.",
    });
  }
  if (issues.length > 0) {
    throw new StoryImportError(issues);
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

  const creativeMemoGroups = new Map<string, CreativeMemo>();
  creativeMemoRows.forEach((row, index) => {
    const memoId = getValue(row, "메모 ID", "memo_id") || `memo-${index + 1}`;
    const memoOrder = Number(getValue(row, "메모 순서", "memo_order"));
    const fieldOrder = Number(getValue(row, "항목 순서", "field_order"));
    const existing = creativeMemoGroups.get(memoId);
    const now = new Date().toISOString();
    const memo =
      existing ??
      ({
        id: memoId,
        kind: creativeMemoKindFromLabel(
          getValue(row, "메모 종류", "memo_kind"),
        ),
        title: getRawValue(row, "메모 제목", "memo_title"),
        linkedChapterId:
          getValue(row, "연결 장 ID", "연결 챕터 ID", "linked_chapter_id") || undefined,
        linkedLineId:
          getValue(row, "연결 컷 ID", "연결 장면 ID", "linked_line_id") || undefined,
        fields: [],
        order: memoOrder || creativeMemoGroups.size + 1,
        createdAt: now,
        updatedAt: now,
      } satisfies CreativeMemo);
    memo.fields.push({
      id:
        getValue(row, "항목 ID", "field_id") ||
        `${memoId}-field-${memo.fields.length + 1}`,
      label: getRawValue(row, "항목 이름", "field_label"),
      value: getRawValue(row, "내용", "value"),
      source: creativeMemoSourceFromLabel(
        getValue(row, "항목 종류", "field_source"),
      ),
      order: fieldOrder || memo.fields.length + 1,
    });
    creativeMemoGroups.set(memoId, memo);
  });
  const creativeMemos = normalizeCreativeMemos(
    Array.from(creativeMemoGroups.values()),
  );

  return cloneProject({
    id: extractSheetId(sheetUrl)
      ? `sheet-${extractSheetId(sheetUrl)}`
      : `excel-${Date.now()}`,
    title: getValue(projectRow, "이야기 제목", "작품 제목", "title")
      ? getRawValue(projectRow, "이야기 제목", "작품 제목", "title")
      : "이름 없는 이야기",
    description: getValue(projectRow, "작품 소개", "description")
      ? getRawValue(projectRow, "작품 소개", "description")
      : "불러온 이야기",
    planning: {
      premise: getRawValue(projectRow, "한 줄 이야기", "premise"),
      structureMode: parseStructureMode(
        getValue(projectRow, "구성 방식", "structure_mode"),
      ),
      material: getRawValue(projectRow, "이야기 소재", "소재", "material"),
      theme: getRawValue(projectRow, "이야기 주제", "주제", "theme"),
      mainCharacter: getRawValue(
        projectRow,
        "핵심 인물",
        "이야기의 주인공",
        "main_character",
      ),
      mainGoal: getRawValue(projectRow, "주인공이 바라는 것", "main_goal"),
      centralProblem: getRawValue(
        projectRow,
        "주요 갈등",
        "이야기의 중심 문제",
        "central_problem",
      ),
      stakes: getRawValue(
        projectRow,
        "실패하면 생기는 일",
        "위험",
        "stakes",
      ),
      endingChange: getRawValue(
        projectRow,
        "마지막에 달라지는 점",
        "ending_change",
      ),
      opening: getRawValue(projectRow, "발단", "처음", "opening"),
      middle: getRawValue(projectRow, "전개", "가운데", "middle"),
      crisis: getRawValue(projectRow, "위기", "crisis"),
      climax: getRawValue(projectRow, "절정", "climax"),
      ending: getRawValue(projectRow, "결말", "끝", "ending"),
      characterNotes: getRawValue(
        projectRow,
        "인물 설정",
        "등장인물 구상",
        "character_notes",
      ),
      worldNotes: getRawValue(
        projectRow,
        "배경·세계 설정",
        "세계관 설정",
        "world_notes",
      ),
      mood: getRawValue(projectRow, "전체 분위기", "mood"),
      openQuestions: getRawValue(
        projectRow,
        "아직 정하지 못한 것",
        "open_questions",
      ),
      freeNotes: getRawValue(projectRow, "자유 창작 메모", "free_notes"),
    },
    creativeMemos,
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

export type StoryProjectImportResult =
  | { ok: true; project: StoryProject }
  | { ok: false; issues: StoryImportIssue[] };

export function importStoryProject(
  snapshot: StoryImportSnapshot,
  sheetUrl: string,
): StoryProjectImportResult {
  try {
    return { ok: true, project: buildProjectFromSheet(snapshot, sheetUrl) };
  } catch (error) {
    if (error instanceof StoryImportError) {
      return { ok: false, issues: error.issues };
    }
    throw error;
  }
}
