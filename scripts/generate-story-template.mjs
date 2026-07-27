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
workbook.creator = "놀퀴즈 스토리 스튜디오";
workbook.created = new Date();

function addSheet(name, rows, widths) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  rows.forEach((row) =>
    sheet.addRow(row.map((value) => (value === "" ? null : value))),
  );
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
    [1, "‘이야기 구성’에서 작품의 주제, 인물, 갈등과 전체 줄거리를 구상하세요."],
    [2, "‘챕터 흐름’에서 각 챕터의 줄거리와 앞뒤 연결을 정하세요."],
    [3, "‘챕터 자료’에서 그 챕터에 쓸 화자, 캐릭터, 배경을 정하세요."],
    [4, "‘화자’와 ‘장면’에서 실제 플레이에 나올 이름, 대사와 해설을 쓰세요."],
    [5, "웹에서 ‘Excel 파일 열기’를 눌러 이 파일을 불러오세요."],
    [6, "웹에서 고친 내용은 ‘Excel로 저장’을 눌러 새 파일로 보관하세요."],
    [7, "화자 이름과 캐릭터 이미지 이름은 서로 다른 값입니다."],
    [8, "대사에서 속마음·표정·행동은 학생이 직접 괄호 안에 쓰세요."],
    [9, "해설에는 괄호를 쓰지 말고 시간·장소·상황을 적으세요."],
    [10, "이미지는 ‘리소스’ 탭의 이미지 이름을 그대로 적으세요."],
    [11, "학생 이름, 학교명, 연락처 같은 개인정보는 입력하지 마세요."],
    [12, "기본 제공 이미지 © 놀퀴즈 · 이 스토리게임 작품 제작에 사용 가능"],
  ],
  [10, 82],
);

const planningSheet = addSheet(
  "이야기 구성",
  [
    ["항목", "내용", "작성 도움"],
    ["이야기 제목", "", "플레이 화면에 보일 작품 이름"],
    ["작품 소개", "", "이 이야기를 처음 보는 사람에게 소개하는 짧은 문장"],
    ["한 줄 이야기", "", "주인공, 목표, 어려움이 드러나는 한 문장"],
    ["구성 방식", "5단계", "5단계(발단-전개-위기-절정-결말), 4단계, 3단계 중 선택"],
    ["이야기 소재", "", "이야기의 출발점이 되는 사건, 경험 또는 상상"],
    ["이야기 주제", "", "이야기를 통해 전하고 싶은 생각"],
    ["핵심 인물", "", "이야기의 중심이 되는 인물"],
    ["주인공이 바라는 것", "", "주인공이 이루려는 목표"],
    ["주요 갈등", "", "목표를 막는 사건, 관계 또는 두려움"],
    ["실패하면 생기는 일", "", "목표를 이루지 못했을 때 잃게 되는 것"],
    ["마지막에 달라지는 점", "", "결말에서 달라지는 인물, 관계 또는 상황"],
    ["발단", "", "인물과 상황을 소개하고 사건이 시작되는 부분"],
    ["전개", "", "갈등이 커지고 인물이 행동하는 부분"],
    ["위기", "", "주인공이 가장 큰 어려움에 부딪히는 부분"],
    ["절정", "", "가장 중요한 선택이나 대결이 일어나는 부분"],
    ["결말", "", "사건이 마무리되고 변화가 드러나는 부분"],
    ["인물 설정", "", "인물의 성격, 목표, 관계와 변화"],
    ["배경·세계 설정", "", "시간, 장소와 이야기 속 규칙"],
    ["전체 분위기", "", "이야기 전체의 느낌과 감정 흐름"],
    ["아직 정하지 못한 것", "", "나중에 결정할 질문이나 빈칸"],
    ["자유 창작 메모", "", "떠오른 대사, 장소와 연출 아이디어"],
  ],
  [26, 76, 56],
);
planningSheet.getColumn(1).font = { bold: true, color: { argb: "FF183D36" } };
planningSheet.getColumn(3).font = { color: { argb: "FF60736E" } };
planningSheet.getCell("B5").dataValidation = {
  type: "list",
  allowBlank: false,
  formulae: ['"5단계,4단계,3단계"'],
};

const chapterFlowSheet = addSheet(
  "챕터 흐름",
  [
    [
      "챕터 ID",
      "순서",
      "챕터 제목",
      "한 줄 줄거리",
      "챕터 역할",
      "분위기",
      "꼭 들어갈 사건",
      "다음 챕터 아이디어",
    ],
    ["chapter-1", 1, "", "", "", "", "", ""],
  ],
  [22, 9, 28, 48, 48, 28, 56, 48],
);
for (let row = 2; row <= 200; row += 1) {
  chapterFlowSheet.getCell(row, 2).dataValidation = {
    type: "whole",
    operator: "greaterThan",
    allowBlank: false,
    formulae: [0],
  };
}

addSheet(
  "챕터 자료",
  [
    [
      "챕터 ID",
      "배경 이미지",
      "왼쪽 기본 이미지",
      "오른쪽 기본 이미지",
      "이 챕터 화자",
      "캐릭터 이미지 목록",
      "장소·배경 목록",
    ],
    ["chapter-1", "", "", "", "", "", ""],
  ],
  [22, 36, 36, 36, 36, 68, 68],
);

addSheet(
  "화자",
  [
    ["화자 이름"],
    [""],
  ],
  [28],
);

const scenesSheet = addSheet(
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
for (let row = 2; row <= 500; row += 1) {
  scenesSheet.getCell(row, 4).dataValidation = {
    type: "list",
    allowBlank: false,
    formulae: ['"대사,해설"'],
  };
  scenesSheet.getCell(row, 5).dataValidation = {
    type: "list",
    allowBlank: false,
    formulae: ['"왼쪽,오른쪽,해설"'],
  };
}

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
const outputPath = path.join(outputDir, "놀퀴즈_스토리_템플릿.xlsx");
await workbook.xlsx.writeFile(outputPath);

const verifiedWorkbook = new ExcelJS.Workbook();
await verifiedWorkbook.xlsx.readFile(outputPath);
const expectedSheetNames = [
  "시작하기",
  "이야기 구성",
  "챕터 흐름",
  "챕터 자료",
  "화자",
  "장면",
  "리소스",
];
const actualSheetNames = verifiedWorkbook.worksheets.map((sheet) => sheet.name);
if (actualSheetNames.join("|") !== expectedSheetNames.join("|")) {
  throw new Error(`공식 양식 탭 순서가 달라요: ${actualSheetNames.join(", ")}`);
}
if (
  verifiedWorkbook.getWorksheet("이야기 구성")?.getCell("B2").value !== null ||
  verifiedWorkbook.getWorksheet("이야기 구성")?.getCell("B5").value !== "5단계"
) {
  throw new Error("‘이야기 구성’의 빈칸 또는 구성 방식 기본값이 올바르지 않아요.");
}
if (
  verifiedWorkbook.getWorksheet("챕터 흐름")?.getCell("A2").value !==
    "chapter-1" ||
  verifiedWorkbook.getWorksheet("챕터 자료")?.getCell("A2").value !==
    "chapter-1"
) {
  throw new Error("‘챕터 흐름’과 ‘챕터 자료’의 챕터 ID가 연결되지 않았어요.");
}
if (verifiedWorkbook.getWorksheet("리소스")?.rowCount !== assets.length + 1) {
  throw new Error("‘리소스’ 탭의 이미지 수가 앱 이미지 목록과 달라요.");
}

console.log(
  `Generated and verified ${outputPath} with ${assets.length} resources.`,
);
