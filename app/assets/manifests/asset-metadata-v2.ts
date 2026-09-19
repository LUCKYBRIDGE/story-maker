import type { StoryAssetV2Override } from "../asset-types";
import metadata from "./metadata.json" with { type: "json" };

// Canonical authored metadata; the catalog generator validates coverage without rewriting it.
// Runtime audit validates JSON enum values and references before publishing the catalog.
export const ASSET_METADATA_V2 = metadata as Readonly<Record<string, StoryAssetV2Override>>;
