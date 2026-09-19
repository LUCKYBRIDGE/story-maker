import type { StoryAsset } from "../story-assets";
import type { AssetAction, AssetExpression } from "./manifests/vocabulary";

export type PickerAssetKind = "character" | "background" | "prop" | "scene-illustration";
export type AssetKind = PickerAssetKind | "poster" | "cover" | "thumbnail" | "reference";
export type AssetPlacementRole = "character-slot" | "background-slot" | "prop-layer" | "none";
export type QualityStatus = "approved" | "secondary" | "review" | "replace" | "rejected" | "legacy";
export type PickerVisibility = "primary" | "secondary" | "hidden";

export interface StoryCharacter {
  id: string;
  name: string;
  aliases: string[];
  storyPackIds: string[];
  representativeAssetId: string;
  artFamily?: string;
  order?: number;
}

export interface StoryPack {
  id: string;
  title: string;
  aliases: string[];
  representativeAssetId?: string;
  recommendedCharacterIds: string[];
  recommendedAssetIds?: string[];
  order?: number;
}

export interface StoryAssetV2Metadata {
  assetId: string;
  kind: AssetKind;
  placementRole: AssetPlacementRole;
  storyPackIds: string[];
  characterIds?: string[];
  primaryCharacterId?: string;
  designVersionId?: string;
  variantId?: string;
  poseSetId?: string;
  pairingStatus?: "complete" | "missing-full" | "missing-upper" | "exception" | "legacy";
  expressions?: AssetExpression[];
  actions?: AssetAction[];
  subjects?: string[];
  framing?: "full" | "upper" | "group";
  background?: {
    location?: string;
    space?: "indoor" | "outdoor";
    time?: string;
    season?: string;
    weather?: string;
    mood?: string;
    state?: string;
  };
  propId?: string;
  propState?: string;
  eventId?: string;
  containsCharacters?: boolean;
  containedCharacterIds?: string[];
  artFamily?: string;
  qualityStatus: QualityStatus;
  pickerVisibility: PickerVisibility;
  aliases?: string[];
  searchTerms?: string[];
}

export type StoryAssetV2Override = Partial<Omit<StoryAssetV2Metadata, "assetId">>;
export interface NormalizedAsset extends StoryAssetV2Metadata {
  // Keep compatibility data separate: metadata must never change saved IDs or slots.
  legacy: StoryAsset;
  src: string;
  displayName: string;
  label: string;
  metadataSource: "legacy" | "override";
}

export interface AssetBrowserConstraints {
  placementRoles?: AssetPlacementRole[];
  kinds?: AssetKind[];
}
export interface AssetQuery {
  search?: string;
  kinds?: PickerAssetKind[];
  storyPackIds?: string[];
  characterIds?: string[];
  expressions?: AssetExpression[];
  actions?: AssetAction[];
  variants?: string[];
  framings?: string[];
  locations?: string[];
  spaces?: ("indoor" | "outdoor")[];
  times?: string[];
  seasons?: string[];
  weather?: string[];
  moods?: string[];
  states?: string[];
  tags?: string[];
  favoriteOnly?: boolean;
  recentOnly?: boolean;
}
export interface AssetRankingContext {
  currentStoryPackId?: string;
  currentChapterAssetIds?: string[];
  currentAssetId?: string;
  currentCharacterIds?: string[];
  favoriteIds: string[];
  recentIds: string[];
  preferredArtFamily?: string;
}
