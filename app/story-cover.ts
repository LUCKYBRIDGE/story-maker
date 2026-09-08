import type { StoryProject } from "./story-data";

export const COVER_THEMES = {
  forest: { label: "숲의 이야기", paper: "#173d35", ink: "#fff4d8", accent: "#d7bb79" },
  night: { label: "별빛 모험", paper: "#202e50", ink: "#f5eddd", accent: "#dfbe77" },
  rose: { label: "따뜻한 동화", paper: "#743e4e", ink: "#fff1dc", accent: "#efc193" },
  cream: { label: "종이책", paper: "#eee1c6", ink: "#342b26", accent: "#866b40" },
} as const;
export type StoryCover = {
  author: string;
  subtitle: string;
  authorNote: string;
  layout: "classic" | "picture" | "bold";
  theme: keyof typeof COVER_THEMES;
  font: "serif" | "sans";
  titlePosition: "top" | "middle" | "bottom";
  authorPosition: "under-title" | "bottom";
  align: "left" | "center";
  titleSize: number;
  titleColor: string;
  backgroundId: string;
  characterId: string;
  characterPosition: "left" | "center" | "right";
};
export const DEFAULT_COVER: StoryCover = {
  author: "", subtitle: "", authorNote: "", layout: "classic", theme: "forest",
  font: "serif", titlePosition: "top", authorPosition: "bottom", align: "center",
  titleSize: 36, titleColor: "", backgroundId: "", characterId: "", characterPosition: "center",
};
export const COVER_FIELDS = [
  ["author", "표지 지은이"], ["subtitle", "표지 소개 문장"], ["authorNote", "작가의 말"],
  ["layout", "표지 배치"], ["theme", "표지 색감"], ["font", "표지 글꼴"],
  ["titlePosition", "표지 제목 위치"], ["authorPosition", "표지 지은이 위치"],
  ["align", "표지 글 정렬"], ["titleSize", "표지 제목 크기"], ["titleColor", "표지 제목 색"],
  ["backgroundId", "표지 배경 ID"], ["characterId", "표지 인물 ID"], ["characterPosition", "표지 인물 위치"],
] as const;
export function isStoryCover(value: unknown): value is StoryCover {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const oneOf = (key: string, values: string[]) => typeof v[key] === "string" && values.includes(v[key] as string);
  return ["author", "subtitle", "authorNote", "backgroundId", "characterId"].every(key => typeof v[key] === "string") &&
    oneOf("layout", ["classic", "picture", "bold"]) && oneOf("theme", Object.keys(COVER_THEMES)) &&
    oneOf("font", ["serif", "sans"]) && oneOf("titlePosition", ["top", "middle", "bottom"]) &&
    oneOf("authorPosition", ["under-title", "bottom"]) && oneOf("align", ["left", "center"]) &&
    oneOf("characterPosition", ["left", "center", "right"]) &&
    typeof v.titleSize === "number" && Number.isFinite(v.titleSize) && v.titleSize >= 24 && v.titleSize <= 52 &&
    typeof v.titleColor === "string" && (v.titleColor === "" || /^#[\da-f]{6}$/i.test(v.titleColor));
}
export function resolveStoryCover(project: Pick<StoryProject, "cover" | "chapters" | "lines">): StoryCover {
  if (isStoryCover(project.cover)) return { ...project.cover };
  const chapter = project.chapters.slice().sort((a,b) => a.order-b.order)[0];
  const line = project.lines.filter(l => l.chapterId === chapter?.id).sort((a,b) => a.order-b.order)[0];
  return { ...DEFAULT_COVER, backgroundId: line?.backgroundId || chapter?.backgroundId || "",
    characterId: line?.leftAssetId || chapter?.leftAssetId || "" };
}
export function coverPreset(layout: StoryCover["layout"]): Partial<StoryCover> {
  return layout === "classic" ? { layout, titlePosition: "top", align: "center", titleSize: 36, font: "serif", authorPosition: "bottom" }
    : layout === "picture" ? { layout, titlePosition: "bottom", align: "left", titleSize: 32, font: "sans", authorPosition: "under-title" }
      : { layout, titlePosition: "middle", align: "center", titleSize: 44, font: "sans", authorPosition: "bottom" };
}
/** Pick the higher-contrast solid title panel, including for custom text colors. */
export function coverTextPanel(color: string) {
  const rgb = color.slice(1).match(/../g)?.map(n => parseInt(n,16)/255) ?? [1,1,1];
  const [r,g,b] = rgb.map(n => n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4);
  const luminance = .2126*r + .7152*g + .0722*b;
  return luminance > .179 ? "#111111" : "#ffffff";
}

/** The chosen size is a ceiling; longer titles shrink together, without truncation. */
export function coverTitleSize(title: string, chosenSize: number) {
  return Math.min(chosenSize, Math.max(14, 135 / Math.sqrt(Math.max(1, Array.from(title).length))));
}
