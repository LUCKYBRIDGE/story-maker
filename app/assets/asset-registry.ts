import { STORY_ASSETS, type StoryAsset } from "../story-assets";
import { normalizeLegacyStoryAsset } from "./adapters/legacy-story-asset-adapter";
import type { StoryAssetV2Override } from "./asset-types";
import { ASSET_METADATA_V2 } from "./manifests/asset-metadata-v2";

export function createAssetRegistry(
  assets: readonly StoryAsset[],
  overrides: Readonly<Record<string, StoryAssetV2Override>> = {},
) {
  const byId = new Map(assets.map((asset) => [asset.id, normalizeLegacyStoryAsset(asset, overrides[asset.id])]));
  if (byId.size !== assets.length) throw new Error("Duplicate asset ID");
  for (const id of Object.keys(overrides)) {
    if (!byId.has(id)) throw new Error(`Unknown metadata asset ID: ${id}`);
  }
  return {
    assets: [...byId.values()],
    // Visibility is deliberately not applied here: old projects must still resolve.
    resolve: (id: string) => byId.get(id),
  };
}

export const ASSET_REGISTRY = createAssetRegistry(STORY_ASSETS, ASSET_METADATA_V2);
