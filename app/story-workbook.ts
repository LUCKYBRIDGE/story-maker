import ExcelJS, { type CellValue, type Worksheet } from "exceljs";
import type { StoryAsset } from "./story-assets";
import type { StoryProject } from "./story-data";

export type StorySheetSnapshot = {
  project: string;
  speakers: string;
  chapters: string;
  lines: string;
};

function cellText(value: CellValue) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return String(value);
  if ("result" in value && value.result !== undefined) {
    return String(value.result);
  }
  if ("richText" in value) {
    return value.richText.map((part) => part.text).join("");
  }
  if ("text" in value) return String(value.text);
  if ("hyperlink" in value) return String(value.hyperlink);
  return String(value);
}

function csvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function worksheetToCsv(worksheet: Worksheet | undefined) {
  if (!worksheet) return "";
  const rows: string[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const values: string[] = [];
    for (let column = 1; column <= row.cellCount; column += 1) {
      values.push(csvCell(cellText(row.getCell(column).value).trim()));
    }
    rows.push(values.join(","));
  });
  return rows.join("\n");
}

export async function readStoryWorkbook(file: File): Promise<StorySheetSnapshot> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const linesSheet =
    workbook.getWorksheet("장면") ?? workbook.getWorksheet("대사");

  if (
    !workbook.getWorksheet("작품") ||
    !workbook.getWorksheet("챕터") ||
    !linesSheet
  ) {
    throw new Error("Excel에 ‘작품’, ‘챕터’, ‘장면’ 탭이 모두 있어야 해요.");
  }

  return {
    project: worksheetToCsv(workbook.getWorksheet("작품")),
    speakers: worksheetToCsv(workbook.getWorksheet("화자")),
    chapters: worksheetToCsv(workbook.getWorksheet("챕터")),
    lines: worksheetToCsv(linesSheet),
  };
}

function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  rows: Array<Array<string | number>>,
  widths: number[],
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  rows.forEach((row) => sheet.addRow(row));
  sheet.columns = widths.map((width) => ({ width }));
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF245D51" },
  };
  header.alignment = { vertical: "middle", horizontal: "center" };
  sheet.eachRow((row) => {
    row.alignment = { ...row.alignment, vertical: "top", wrapText: true };
  });
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: rows[0]?.length ?? 1 },
  };
  return sheet;
}

function safeFileName(title: string) {
  return (
    title
      .trim()
      .replace(/[\\/:*?"<>|]/g, "_")
      .slice(0, 60) || "놀퀴즈_스토리"
  );
}

export async function downloadStoryWorkbook(
  project: StoryProject,
  assets: StoryAsset[],
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "놀퀴즈 스토리 스튜디오";
  workbook.created = new Date();

  addSheet(
    workbook,
    "시작하기",
    [
      ["순서", "안내"],
      [1, "웹 또는 이 Excel에서 이야기 제목, 화자, 챕터, 장면을 편집하세요."],
      [2, "Excel을 고친 뒤 웹에서 ‘Excel 파일 열기’를 눌러 다시 불러오세요."],
      [3, "웹에서 고친 내용은 ‘Excel로 저장’을 눌러 새 파일로 보관하세요."],
      [4, "화자 이름과 캐릭터 이미지 이름은 서로 다른 값입니다."],
      [5, "대사에서 속마음·표정·행동은 학생이 직접 괄호 안에 쓰세요."],
      [6, "해설에는 괄호를 쓰지 말고 시간·장소·상황을 적으세요."],
      [7, "학생 이름, 학교명, 연락처 같은 개인정보는 입력하지 마세요."],
      [8, "기본 제공 이미지 © 놀퀴즈 · 이 스토리게임 작품 제작에 사용 가능"],
    ],
    [10, 78],
  );

  addSheet(
    workbook,
    "작품",
    [
      [
        "이야기 제목",
        "작품 소개",
        "한 줄 이야기",
        "구성 방식",
        "이야기 소재",
        "이야기 주제",
        "핵심 인물",
        "주인공이 바라는 것",
        "주요 갈등",
        "실패하면 생기는 일",
        "마지막에 달라지는 점",
        "발단",
        "전개",
        "위기",
        "절정",
        "결말",
        "인물 설정",
        "배경·세계 설정",
        "전체 분위기",
        "아직 정하지 못한 것",
        "자유 창작 메모",
      ],
      [
        project.title,
        project.description,
        project.planning.premise,
        project.planning.structureMode === "five"
          ? "5단계"
          : project.planning.structureMode === "four"
            ? "4단계"
            : "3단계",
        project.planning.material,
        project.planning.theme,
        project.planning.mainCharacter,
        project.planning.mainGoal,
        project.planning.centralProblem,
        project.planning.stakes,
        project.planning.endingChange,
        project.planning.opening,
        project.planning.middle,
        project.planning.crisis,
        project.planning.climax,
        project.planning.ending,
        project.planning.characterNotes,
        project.planning.worldNotes,
        project.planning.mood,
        project.planning.openQuestions,
        project.planning.freeNotes,
      ],
    ],
    [30, 46, 52, 18, 38, 28, 32, 48, 48, 48, 48, 52, 52, 52, 52, 52, 52, 52, 28, 52, 52],
  );

  addSheet(
    workbook,
    "화자",
    [
      ["화자 이름"],
      ...project.speakerNames.map((name) => [name]),
    ],
    [28],
  );

  const assetName = (id: string) =>
    assets.find((asset) => asset.id === id)?.displayName ?? "";

  addSheet(
    workbook,
    "챕터",
    [
      [
        "챕터 ID",
        "순서",
        "챕터 제목",
        "한 줄 줄거리",
        "배경 이미지",
        "왼쪽 기본 이미지",
        "오른쪽 기본 이미지",
        "챕터 역할",
        "분위기",
        "꼭 들어갈 사건",
        "다음 챕터 아이디어",
        "이 챕터 화자",
        "캐릭터 이미지 목록",
        "장소·배경 목록",
      ],
      ...project.chapters
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((chapter) => [
          chapter.id,
          chapter.order,
          chapter.title,
          chapter.summary,
          assetName(chapter.backgroundId),
          assetName(chapter.leftAssetId),
          assetName(chapter.rightAssetId),
          chapter.purpose,
          chapter.mood,
          chapter.keyEvents,
          chapter.nextChapterIdea,
          chapter.chapterSpeakerNames.join(", "),
          chapter.characterAssetIds.map(assetName).filter(Boolean).join(", "),
          chapter.backgroundAssetIds.map(assetName).filter(Boolean).join(", "),
        ]),
    ],
    [22, 9, 28, 44, 34, 34, 34, 44, 28, 52, 44, 36, 64, 64],
  );

  addSheet(
    workbook,
    "장면",
    [
      [
        "장면 ID",
        "챕터 ID",
        "순서",
        "종류",
        "화자 위치",
        "화자 이름",
        "내용",
        "왼쪽 이미지",
        "오른쪽 이미지",
        "장면 배경",
        "장면 역할",
        "감정 메모",
        "연출 메모",
      ],
      ...project.lines
        .slice()
        .sort((a, b) =>
          a.chapterId === b.chapterId
            ? a.order - b.order
            : project.chapters.findIndex(
                (chapter) => chapter.id === a.chapterId,
              ) -
              project.chapters.findIndex(
                (chapter) => chapter.id === b.chapterId,
              ),
        )
        .map((line) => [
          line.id,
          line.chapterId,
          line.order,
          line.type === "narration" ? "해설" : "대사",
          line.type === "narration"
            ? "해설"
            : line.speaker === "right"
              ? "오른쪽"
              : "왼쪽",
          line.type === "narration" ? "해설" : line.speakerName,
          line.text,
          assetName(line.leftAssetId),
          assetName(line.rightAssetId),
          assetName(line.backgroundId),
          line.purposeNote,
          line.emotionNote,
          line.directionNote,
        ]),
    ],
    [22, 22, 9, 11, 13, 22, 68, 34, 34, 34, 48, 42, 48],
  );

  addSheet(
    workbook,
    "리소스",
    [
      [
        "이미지 ID",
        "이미지 이름",
        "작품",
        "종류",
        "캐릭터·장소",
        "표정·장면",
        "태그",
        "저작권",
      ],
      ...assets.map((asset) => [
        asset.id,
        asset.displayName,
        asset.story,
        asset.type === "character" ? "캐릭터" : "배경",
        asset.group,
        asset.pose,
        asset.tags.join(", "),
        `© ${asset.copyright}`,
      ]),
    ],
    [46, 34, 18, 12, 24, 30, 48, 18],
  );

  const data = await workbook.xlsx.writeBuffer();
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName(project.title)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
