import ExcelJS from "exceljs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetSource = await readFile(
  path.join(projectRoot, "app/story-assets.ts"),
  "utf8",
);
const assetMarker = "export const STORY_ASSETS: StoryAsset[] = ";
const assetStart = assetSource.indexOf(assetMarker);
if (assetStart < 0) throw new Error("story-assets.ts에서 이미지 목록을 찾지 못했습니다.");
const assets = JSON.parse(
  assetSource
    .slice(assetStart + assetMarker.length)
    .replace(/;\s*$/, ""),
);

const workbook = new ExcelJS.Workbook();
workbook.creator = "이야기별 스토리게임 스튜디오";
workbook.created = new Date();

function addSheet(name, rows, widths) {
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
    row.alignment = { vertical: "top", wrapText: true };
  });
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: rows[0].length },
  };
  return sheet;
}

addSheet(
  "시작하기",
  [
    ["순서", "안내"],
    [1, "작품, 화자, 챕터, 장면 탭을 차례로 편집하세요."],
    [2, "웹에서 ‘Excel 파일 열기’를 눌러 이 파일을 불러오세요."],
    [3, "웹에서 고친 내용은 ‘Excel로 저장’을 눌러 새 파일로 보관하세요."],
    [4, "화자 이름과 캐릭터 이미지 이름은 서로 다른 값입니다."],
    [5, "이미지는 리소스 탭의 이미지 이름을 그대로 적으세요."],
    [6, "학생 이름, 학교명, 연락처 같은 개인정보는 입력하지 마세요."],
    [7, "기본 제공 이미지 © 놀퀴즈 · 이 스토리게임 작품 제작에 사용 가능"],
  ],
  [10, 82],
);

addSheet(
  "작품",
  [
    [
      "이야기 제목",
      "작품 소개",
      "한 줄 이야기",
      "이야기 주제",
      "핵심 인물",
      "주인공이 바라는 것",
      "주요 갈등",
      "마지막에 달라지는 점",
      "처음",
      "가운데",
      "끝",
      "인물 설정",
      "배경·세계 설정",
      "전체 분위기",
      "아직 정하지 못한 것",
      "자유 창작 메모",
    ],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ],
  [30, 46, 52, 28, 32, 48, 48, 48, 52, 52, 52, 52, 52, 28, 52, 52],
);

addSheet(
  "화자",
  [
    ["화자 이름"],
    [""],
  ],
  [28],
);

addSheet(
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
    ["chapter-1", 1, "", "", "", "", "", "", "", "", "", "", "", ""],
  ],
  [22, 9, 28, 44, 34, 34, 34, 44, 28, 52, 44, 36, 64, 64],
);

addSheet(
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
    [
      "scene-1",
      "chapter-1",
      1,
      "대사",
      "왼쪽",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  ],
  [22, 22, 9, 11, 13, 22, 68, 34, 34, 34, 48, 42, 48],
);

addSheet(
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

const outputDir = path.join(projectRoot, "public/templates");
await mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "이야기별_구글시트_템플릿.xlsx");
await workbook.xlsx.writeFile(outputPath);
console.log(`Generated ${outputPath} with ${assets.length} resources.`);
