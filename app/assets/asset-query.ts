import type { AssetBrowserConstraints, AssetQuery, AssetRankingContext, NormalizedAsset } from "./asset-types";
import { STORY_CHARACTERS } from "./manifests/characters";
import { STORY_PACKS } from "./manifests/story-packs";
import { normalizeAssetSearch } from "../story-asset-picker-utils";

export const KIND_LABELS = { character: "캐릭터", background: "배경", prop: "소품", "scene-illustration": "장면 그림", poster: "포스터", cover: "표지", thumbnail: "썸네일", reference: "참고 그림" };
export const FRAMING_LABELS = { full: "전신", upper: "상반신", group: "여러 인물" };
export type FacetKey = Exclude<keyof AssetQuery, "search" | "favoriteOnly" | "recentOnly">;
export const FACETS: { key: FacetKey; label: string; basic?: boolean }[] = [
  { key: "storyPackIds", label: "작품", basic: true }, { key: "characterIds", label: "캐릭터", basic: true },
  { key: "kinds", label: "종류", basic: true }, { key: "expressions", label: "감정·상태" },
  { key: "actions", label: "행동" }, { key: "variants", label: "모습" }, { key: "framings", label: "구도" },
  { key: "locations", label: "장소" }, { key: "spaces", label: "실내·실외" }, { key: "times", label: "시간" },
  { key: "seasons", label: "계절" }, { key: "weather", label: "날씨" }, { key: "moods", label: "분위기" },
  { key: "states", label: "장소 상태" }, { key: "tags", label: "기존 태그" },
];
export function facetValues(asset: NormalizedAsset, key: FacetKey): string[] {
  const b = asset.background;
  const values: Record<FacetKey, (string | undefined)[] | undefined> = {
    kinds: [asset.kind], storyPackIds: asset.storyPackIds, characterIds: asset.characterIds,
    expressions: asset.expressions, actions: asset.actions, variants: [asset.variantId], framings: [asset.framing],
    locations: [b?.location], spaces: [b?.space], times: [b?.time], seasons: [b?.season], weather: [b?.weather],
    moods: [b?.mood], states: [b?.state], tags: asset.legacy.tags,
  };
  return (values[key] ?? []).filter((value): value is string => Boolean(value));
}
export function facetLabel(key: FacetKey, value: string) {
  if (key === "storyPackIds") return STORY_PACKS.find(pack => pack.id === value)?.title ?? value;
  if (key === "characterIds") return STORY_CHARACTERS.find(character => character.id === value)?.name ?? value;
  if (key === "kinds") return KIND_LABELS[value as keyof typeof KIND_LABELS] ?? value;
  if (key === "framings") return FRAMING_LABELS[value as keyof typeof FRAMING_LABELS] ?? value;
  if (key === "spaces") return value === "indoor" ? "실내" : "실외";
  return value;
}
const SEARCH_ALIASES: Record<string, string[]> = {
  화남: ["화난", "성난", "화를 내는"], 슬픔: ["슬픈", "우는"], 생각: ["고민하는", "생각하는"],
  기쁨: ["기쁜", "웃는", "행복한"], 걱정: ["걱정하는", "불안한"], 일하기: ["일하는", "노동"],
  치료하기: ["치료", "제비 치료", "돌보는"], 나누기: ["나누는", "나눔"],
};
export function matchesAssetSearch(asset: NormalizedAsset, search = "") {
  const characterNames = STORY_CHARACTERS.filter(c => asset.characterIds?.includes(c.id)).flatMap(c => [c.name, ...c.aliases]);
  const packNames = STORY_PACKS.filter(p => asset.storyPackIds.includes(p.id)).flatMap(p => [p.title, ...p.aliases]);
  const values = FACETS.filter(f => f.key !== "tags").flatMap(f => facetValues(asset, f.key).map(v => facetLabel(f.key, v)));
  const text = normalizeAssetSearch([asset.displayName, asset.label, ...values, ...characterNames, ...packNames,
    ...values.flatMap(v => SEARCH_ALIASES[v] ?? []), ...asset.legacy.tags, ...(asset.aliases ?? []), ...(asset.searchTerms ?? []), ...(asset.subjects ?? [])].join(" "));
  return search.trim().split(/\s+/).filter(Boolean).every(term => text.includes(normalizeAssetSearch(term)));
}
export function filterAssets(
  assets: readonly NormalizedAsset[], query: AssetQuery = {}, constraints: AssetBrowserConstraints = {},
  context: Pick<AssetRankingContext, "favoriteIds" | "recentIds"> = { favoriteIds: [], recentIds: [] },
  options: { includeSecondary?: boolean } = { includeSecondary: true },
) {
  return assets.filter(asset => {
    if (asset.pickerVisibility === "hidden" || asset.qualityStatus === "rejected" || asset.qualityStatus === "replace") return false;
    if (options.includeSecondary === false && asset.pickerVisibility === "secondary") return false;
    if (constraints.placementRoles?.length && !constraints.placementRoles.includes(asset.placementRole)) return false;
    if (constraints.kinds?.length && !constraints.kinds.includes(asset.kind)) return false;
    if (query.favoriteOnly && !context.favoriteIds.includes(asset.assetId)) return false;
    if (query.recentOnly && !context.recentIds.includes(asset.assetId)) return false;
    return FACETS.every(({ key }) => !query[key]?.length || query[key]!.some(value => facetValues(asset, key).includes(value)))
      && matchesAssetSearch(asset, query.search);
  });
}
