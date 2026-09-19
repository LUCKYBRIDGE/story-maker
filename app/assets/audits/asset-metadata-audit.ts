import type { NormalizedAsset, StoryCharacter, StoryPack } from "../asset-types";
import { ASSET_ACTIONS, ASSET_EXPRESSIONS } from "../manifests/vocabulary";

export function auditAssetMetadata(assets: readonly NormalizedAsset[], characters: readonly StoryCharacter[], packs: readonly StoryPack[]) {
  const errors: string[] = [];
  const byId = new Map(assets.map(a => [a.assetId, a]));
  const charIds = new Set(characters.map(c => c.id));
  const packIds = new Set(packs.map(p => p.id));
  if (byId.size !== assets.length) errors.push("duplicate asset ID");
  if (charIds.size !== characters.length) errors.push("duplicate character ID");
  if (packIds.size !== packs.length) errors.push("duplicate story pack ID");
  const roles: Record<string, string> = {character:"character-slot", background:"background-slot", "scene-illustration":"background-slot", prop:"prop-layer", poster:"none", cover:"none", thumbnail:"none", reference:"none"};
  for (const a of assets) {
    const fail = (message: string) => errors.push(`${a.assetId}: ${message}`);
    if (roles[a.kind] !== a.placementRole) fail("invalid kind/placement");
    if (!["approved", "secondary", "review", "replace", "rejected", "legacy"].includes(a.qualityStatus)) fail("invalid quality");
    if (!["primary", "secondary", "hidden"].includes(a.pickerVisibility)) fail("invalid visibility");
    if (a.placementRole === "none" && a.pickerVisibility !== "hidden") fail("non-stage media must be hidden");
    if (!a.storyPackIds.length || a.storyPackIds.some(id => !packIds.has(id))) fail("invalid story pack");
    if (a.kind === "character" && !a.characterIds?.length) fail("missing characters");
    if ([...(a.characterIds ?? []), ...(a.containedCharacterIds ?? [])].some(id => !charIds.has(id))) fail("invalid character");
    if (a.primaryCharacterId && !a.characterIds?.includes(a.primaryCharacterId)) fail("invalid primary character");
    if (a.expressions?.some(e => !ASSET_EXPRESSIONS.includes(e))) fail("invalid expression");
    if (a.actions?.some(e => !ASSET_ACTIONS.includes(e))) fail("invalid action");
    if (a.framing && !["full", "upper", "group"].includes(a.framing)) fail("invalid framing");
    if (a.kind === "scene-illustration" && !a.eventId) fail("missing event");
    if (a.kind === "prop" && !a.propId) fail("missing prop ID");
  }
  for (const c of characters) {
    const a = byId.get(c.representativeAssetId);
    if (!a?.characterIds?.includes(c.id) || a.pickerVisibility === "hidden" || ["rejected", "replace"].includes(a.qualityStatus)) errors.push(`${c.id}: invalid representative`);
    if (c.storyPackIds.some(id => !packIds.has(id))) errors.push(`${c.id}: invalid story pack`);
  }
  for (const p of packs) {
    for (const id of p.recommendedCharacterIds) if (!charIds.has(id)) errors.push(`${p.id}: unknown recommended character`);
    for (const id of p.recommendedAssetIds ?? []) {
      const a = byId.get(id);
      if (!a || a.pickerVisibility === "hidden") errors.push(`${p.id}: invalid recommended asset`);
    }
    if (p.representativeAssetId && !byId.has(p.representativeAssetId)) errors.push(`${p.id}: invalid representative`);
  }
  return {errors, unpaired: assets.filter(a => a.pairingStatus === "missing-full" || a.pairingStatus === "missing-upper").map(a => a.assetId)};
}
