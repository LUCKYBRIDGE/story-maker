import type { AssetRankingContext, NormalizedAsset } from "./asset-types";

export function rankAssets(assets: readonly NormalizedAsset[], context: AssetRankingContext, recentFirst = false) {
  const score = (asset: NormalizedAsset) =>
    (asset.assetId === context.currentAssetId ? 10000 : 0) +
    (asset.characterIds?.some(id => context.currentCharacterIds?.includes(id)) ? 4000 : 0) +
    (context.currentChapterAssetIds?.includes(asset.assetId) ? 2000 : 0) +
    (context.currentStoryPackId && asset.storyPackIds.includes(context.currentStoryPackId) ? 1000 : 0) +
    (asset.pickerVisibility === "primary" ? 300 : 0) +
    (context.favoriteIds.includes(asset.assetId) ? 200 : 0) +
    (context.recentIds.includes(asset.assetId) ? 100 / (context.recentIds.indexOf(asset.assetId) + 1) : 0) +
    (context.preferredArtFamily && asset.artFamily === context.preferredArtFamily ? 50 : 0);
  return assets.slice().sort((a, b) => {
    if (recentFirst) {
      const index = (id: string) => context.recentIds.includes(id) ? context.recentIds.indexOf(id) : Infinity;
      const difference = index(a.assetId) - index(b.assetId);
      if (difference) return difference;
    }
    return score(b) - score(a) || a.assetId.localeCompare(b.assetId);
  });
}
