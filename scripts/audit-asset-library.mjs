import { ASSET_REGISTRY } from '../app/assets/asset-registry.ts';
import { STORY_CHARACTERS } from '../app/assets/manifests/characters.ts';
import { STORY_PACKS } from '../app/assets/manifests/story-packs.ts';
import { auditAssetMetadata } from '../app/assets/audits/asset-metadata-audit.ts';
const result = auditAssetMetadata(ASSET_REGISTRY.assets, STORY_CHARACTERS, STORY_PACKS);
console.log(JSON.stringify({assets: ASSET_REGISTRY.assets.length, characters: STORY_CHARACTERS.length, errors: result.errors, missingFramingPairs: result.unpaired.length}, null, 2));
if (result.errors.length) process.exitCode = 1;
