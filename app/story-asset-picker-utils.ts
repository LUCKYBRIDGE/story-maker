import type { StoryAsset } from "./story-assets";

const RABBIT_TURTLE_CHARACTER_ORDER = [
  "토끼",
  "자라",
  "용왕",
  "의관",
  "어린 자라",
  "젊은 용왕",
];
const ONGGOJIB_CHARACTER_ORDER = [
  "진짜 옹고집",
  "가짜 옹고집",
  "옹고집의 아내",
  "막내 아이",
  "둘째 아이",
  "사또",
  "포졸",
  "옹고집의 하인",
  "일꾼",
];

export function normalizeAssetSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("ko")
    .replace(/\.png$/i, "")
    .replace(/[·_\-\s]/g, "");
}

function assetGroupLabel(asset: StoryAsset, type: StoryAsset["type"]) {
  return type === "character"
    ? `${asset.selectionTier} · ${asset.framing ?? "구도 미분류"}`
    : asset.selectionTier;
}

function assetGroupRank(asset: StoryAsset, type: StoryAsset["type"]) {
  const selectionRank = asset.selectionTier === "기본 추천" ? 0 : 20;
  const usageRank = asset.usage === "원작 사용" ? 0 : 10;
  if (type !== "character") return selectionRank + usageRank;
  const framingRank =
    asset.framing === "전신"
      ? 0
      : asset.framing === "상반신"
        ? 1
        : asset.framing === "여러 인물"
          ? 2
          : 3;
  return selectionRank + usageRank + framingRank;
}

export function sortStoryAssets(
  assets: StoryAsset[],
  type: StoryAsset["type"],
): StoryAsset[] {
  return assets.slice().sort((a, b) => {
    const groupDifference =
      assetGroupRank(a, type) - assetGroupRank(b, type);
    if (groupDifference !== 0) return groupDifference;
    const storyDifference =
      (a.story === "토끼와 자라" ? 0 : 1) -
      (b.story === "토끼와 자라" ? 0 : 1);
    if (storyDifference !== 0) return storyDifference;
    if (type === "character" && a.story === "토끼와 자라") {
      const characterDifference =
        (RABBIT_TURTLE_CHARACTER_ORDER.indexOf(a.group) + 1 || 99) -
        (RABBIT_TURTLE_CHARACTER_ORDER.indexOf(b.group) + 1 || 99);
      if (characterDifference !== 0) return characterDifference;
      const poseDifference =
        (a.pose === "기본" || a.pose === "전신" ? 0 : 1) -
        (b.pose === "기본" || b.pose === "전신" ? 0 : 1);
      if (poseDifference !== 0) return poseDifference;
    }
    if (type === "character" && a.story === "옹고집전") {
      const characterDifference =
        (ONGGOJIB_CHARACTER_ORDER.indexOf(a.group) + 1 || 99) -
        (ONGGOJIB_CHARACTER_ORDER.indexOf(b.group) + 1 || 99);
      if (characterDifference !== 0) return characterDifference;
    }
    const characterDifference = a.group.localeCompare(b.group, "ko");
    return characterDifference || a.pose.localeCompare(b.pose, "ko");
  });
}

export function groupStoryAssets(
  assets: StoryAsset[],
  type: StoryAsset["type"],
  preserveOrder = false,
): Array<{ label: string; assets: StoryAsset[] }> {
  const groups = new Map<string, StoryAsset[]>();
  for (const asset of preserveOrder ? assets : sortStoryAssets(assets, type)) {
    const label = assetGroupLabel(asset, type);
    groups.set(label, [...(groups.get(label) ?? []), asset]);
  }
  return Array.from(groups, ([label, groupedAssets]) => ({
    label,
    assets: groupedAssets,
  }));
}
