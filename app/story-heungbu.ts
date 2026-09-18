import seed from "./story-heungbu.seed.json" with { type: "json" };
import type { StoryProject } from "./story-data";
import { DEFAULT_COVER } from "./story-cover";
import { HEUNGBU_ACTORS } from "./story-heungbu-art";

// The supplied seed owns the script, IDs, planning and branches. This adapter
// only dresses the reading edition; it never rewrites the source manuscript.
const cottage = "seonnyeo.background.BG04-cottage-day";
const autumn = "seonnyeo.background.BG06-cottage-autumn";
const snow = "seonnyeo.background.BG05-cottage-snow";
const room = "seonnyeo.background.BG09-room-day";
const night = "seonnyeo.background.BG-room-night";
const chapterBackgrounds: Record<string, string> = {
  "chapter-1": cottage, "chapter-2": cottage, "chapter-3": room,
  "chapter-4": snow, "chapter-5a": cottage, "chapter-5b": snow,
  "chapter-6": cottage, "chapter-7": autumn, "chapter-8": cottage,
  "chapter-9": cottage, "chapter-10": autumn, "chapter-11": snow,
  "chapter-12a": room, "chapter-12b": cottage,
};

export function getHeungbuProject(): StoryProject {
  const project = structuredClone(seed) as StoryProject;
  project.updatedAt = "2026-09-17T00:00:00.000Z";
  project.cover = {
    ...DEFAULT_COVER, theme: "cream", backgroundId: autumn,
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
    if (line.chapterId === "chapter-4" && cut >= 20) background = night;
    if (line.chapterId === "chapter-5a" && cut <= 4) background = room;
    if (line.chapterId === "chapter-7" && cut >= 12 && cut <= 15) background = night;
    if (line.chapterId === "chapter-11" && cut >= 3 && cut <= 13) background = night;
    if (line.chapterId === "chapter-12a" && cut >= 23) background = cut >= 29 ? autumn : cottage;
    if (line.chapterId === "chapter-12b" && cut >= 29 && cut <= 31) background = night;
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

