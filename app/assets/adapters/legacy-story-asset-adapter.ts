import type { StoryAsset } from "../../story-assets";
import type { NormalizedAsset, StoryAssetV2Override } from "../asset-types";
import { findStoryPackByTitle } from "../manifests/story-packs";

export function normalizeLegacyStoryAsset(asset: StoryAsset, override?: StoryAssetV2Override): NormalizedAsset {
  const pack = findStoryPackByTitle(asset.story);
  const framing = asset.framing === "전신" ? "full" : asset.framing === "상반신" ? "upper" : asset.framing === "여러 인물" ? "group" : undefined;
  // backgroundRole describes rendering, never semantic kind. No regex guesses for facets.
  return structuredClone({
    kind: asset.type,
    placementRole: asset.type === "character" ? "character-slot" : "background-slot",
    storyPackIds: pack ? [pack.id] : [],
    qualityStatus: "legacy",
    pickerVisibility: asset.selectionTier === "기본 추천" ? "primary" : "secondary",
    framing,
    ...override,
    assetId: asset.id,
    src: asset.src,
    displayName: asset.displayName,
    label: asset.label,
    legacy: asset,
    metadataSource: override ? "override" : "legacy",
  });
}
