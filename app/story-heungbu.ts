import seed from "./story-heungbu.seed.json" with { type: "json" };
import type { StoryProject } from "./story-data";
import { DEFAULT_COVER } from "./story-cover";
import { HEUNGBU_ACTORS } from "./story-heungbu-art";

// The supplied seed owns the script, IDs, planning and branches. This adapter
// only dresses the reading edition; it never rewrites the source manuscript.
const villageRoadChildhood = "heungbu.background.village-road-childhood";
const familyStorehouseYard = "heungbu.background.family-storehouse-yard";
const familyRoom = "heungbu.background.family-room";
const poorHouseWinter = "heungbu.background.poor-house-winter";
const springField = "heungbu.background.spring-field";
const heungbuSwallowEaves = "heungbu.background.heungbu-swallow-eaves";
const nolbuSwallowEaves = "heungbu.background.nolbu-swallow-eaves";
const nolbuMansion = "heungbu.background.nolbu-mansion";
const nolbuRuinedYard = "heungbu.background.nolbu-ruined-yard";
const twoHousesPath = "heungbu.background.two-houses-path";
const familyDinnerNight = "heungbu.background.family-dinner-night";
const heungbuGourdRoof = "heungbu.background.heungbu-gourd-roof";

// 사건 삽화 (Scene Illustrations)
const gourdTreasureBurst = "heungbu.scene.gourd-treasure-burst";
const brokenGoods = "heungbu.scene.nolbu-broken-goods";
const goblinChaos = "heungbu.scene.nolbu-goblin-chaos";
const stormCollapse = "heungbu.scene.nolbu-storm-collapse";

const chapterBackgrounds: Record<string, string> = {
  "chapter-1": villageRoadChildhood,
  "chapter-2": familyStorehouseYard,
  "chapter-3": familyRoom,
  "chapter-4": poorHouseWinter,
  "chapter-5a": springField,
  "chapter-5b": poorHouseWinter,
  "chapter-6": heungbuSwallowEaves,
  "chapter-7": heungbuGourdRoof,
  "chapter-8": nolbuMansion,
  "chapter-9": nolbuSwallowEaves,
  "chapter-10": nolbuMansion,
  "chapter-11": poorHouseWinter,
  "chapter-12a": familyRoom,
  "chapter-12b": twoHousesPath,
};

export function getHeungbuProject(): StoryProject {
  const project = structuredClone(seed) as StoryProject;
  project.updatedAt = "2026-09-17T00:00:00.000Z";
  project.cover = {
    ...DEFAULT_COVER, theme: "cream", backgroundId: heungbuGourdRoof,
    characterId: "heungbu.character.heungbu-default",
    characterPosition: "center",
    subtitle: "도움과 책임을 생각하는 선택형 이야기", titleSize: 32,
    author: "전래 이야기 「흥부전」 각색",
    authorNote: "흥부와 놀부에게는 저마다 잘하는 일과 서툰 일이 있어요.\n\n내가 고른 방법은 누구에게 어떤 도움이 되었나요? 그 방법에서 어려운 점은 무엇이었나요?\n\n처음과 끝에서 두 형제의 말과 행동이 어떻게 달라졌는지 찾아보세요. 다른 길도 읽으며 내 생각과 비교해 보세요. 두 결말에는 정답이나 등급이 없어요.",
  };
  for (const chapter of project.chapters) {
    chapter.backgroundId = chapterBackgrounds[chapter.id];
    chapter.backgroundAssetIds = [chapter.backgroundId];
  }
  for (const line of project.lines) {
    const cut = Number(line.id.split("-").at(-1));
    let background = "";
    if (line.chapterId === "chapter-4" && cut >= 13 && cut <= 19) background = nolbuMansion;
    if (line.chapterId === "chapter-4" && cut >= 20) background = familyDinnerNight;
    if (line.chapterId === "chapter-5a" && cut <= 4) background = familyRoom;
    if (line.chapterId === "chapter-7" && cut <= 3) background = heungbuSwallowEaves;
    if (line.chapterId === "chapter-7" && cut >= 6 && cut <= 7) background = gourdTreasureBurst;
    if (line.chapterId === "chapter-7" && cut >= 12 && cut <= 15) background = familyDinnerNight;
    if (line.chapterId === "chapter-8" && cut <= 3) background = nolbuSwallowEaves;
    if (line.chapterId === "chapter-10" && cut >= 4 && cut <= 5) background = brokenGoods;
    if (line.chapterId === "chapter-10" && cut >= 9 && cut <= 11) background = goblinChaos;
    if (line.chapterId === "chapter-10" && cut >= 14 && cut <= 15) background = stormCollapse;
    if (line.chapterId === "chapter-10" && cut >= 16) background = nolbuRuinedYard;
    if (line.chapterId === "chapter-11" && cut <= 2) background = nolbuRuinedYard;
    if (line.chapterId === "chapter-11" && cut >= 3 && cut <= 13) background = familyDinnerNight;
    if (line.chapterId === "chapter-11" && cut >= 14) background = nolbuRuinedYard;
    if (line.chapterId === "chapter-12a" && cut >= 23) background = springField;
    if (line.chapterId === "chapter-12b" && cut <= 14) background = poorHouseWinter;
    if (line.chapterId === "chapter-12b" && cut >= 15 && cut <= 22) background = springField;
    if (line.chapterId === "chapter-12b" && cut >= 23 && cut <= 28) background = twoHousesPath;
    if (line.chapterId === "chapter-12b" && cut >= 29 && cut <= 31) background = familyDinnerNight;
    if (line.chapterId === "chapter-12b" && cut >= 32) background = twoHousesPath;
    line.backgroundId = background;
    if (background) {
      const chapter = project.chapters.find(chapter => chapter.id === line.chapterId)!;
      if (!chapter.backgroundAssetIds.includes(background)) chapter.backgroundAssetIds.push(background);
    }

    const actors = HEUNGBU_ACTORS[line.chapterId]?.[line.order - 1];
    if (actors) {
      const [left, right] = actors;
      line.leftAssetId = left;
      line.rightAssetId = right;
    }
  }

  for (const chapter of project.chapters) {
    const chapterLines = project.lines.filter(line => line.chapterId === chapter.id);
    chapter.characterAssetIds = [...new Set(chapterLines.flatMap(l => [l.leftAssetId, l.rightAssetId]).filter(Boolean))];
  }

  return project;
}
