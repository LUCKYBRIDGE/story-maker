import { execFileSync } from "node:child_process";
import test from "node:test";

function verify(script) {
  execFileSync(process.execPath, ["--disable-warning=ExperimentalWarning", "--experimental-strip-types", "--experimental-loader=./tests/node-types-loader.mjs", "--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import {readFileSync} from 'node:fs';
    import {STORY_ASSETS} from './app/story-assets.ts';
    import {ASSET_REGISTRY, createAssetRegistry} from './app/assets/asset-registry.ts';
    import {normalizeLegacyStoryAsset} from './app/assets/adapters/legacy-story-asset-adapter.ts';
    import {STORY_CHARACTERS} from './app/assets/manifests/characters.ts';
    import {STORY_PACKS, findStoryPackByTitle} from './app/assets/manifests/story-packs.ts';
    ${script}
  `], {encoding: "utf8"});
}

test("248개 기존 ID와 URL·태그·슬롯을 보존한다", () => verify(`
  const ids = JSON.parse(readFileSync('./tests/fixtures/asset-library-v1-ids.json', 'utf8'));
  assert.equal(ids.length, 248);
  assert.deepEqual(ASSET_REGISTRY.assets.map(a=>a.assetId).sort(), ids);
  for (const asset of STORY_ASSETS) {
    const normalized = ASSET_REGISTRY.resolve(asset.id);
    assert.deepEqual(normalized.legacy, asset);
    assert.equal(normalized.src, asset.src);
    assert.notEqual(normalized.legacy.tags, asset.tags);
  }
  assert.equal(ASSET_REGISTRY.resolve('missing'), undefined);
`));

test("작품 등록부는 네 작품과 구형 별칭을 포함한다", () => verify(`
  assert.equal(STORY_PACKS.length, 4);
  assert.equal(findStoryPackByTitle('토끼와 자라').id, 'rabbit-turtle');
  assert.equal(findStoryPackByTitle('흥부와 놀부').id, 'heungbu-nolbu');
  const counts = {};
  for (const asset of ASSET_REGISTRY.assets) {
    assert.equal(asset.storyPackIds.length, 1);
    counts[asset.storyPackIds[0]] = (counts[asset.storyPackIds[0]] || 0) + 1;
  }
  assert.deepEqual(counts, {'rabbit-turtle':52, onggojib:91, seonnyeo:63, 'heungbu-nolbu':42});
`));

test("포스터는 숨겨도 기존 작품에서 조회되고 사건과 장소는 구분된다", () => verify(`
  const poster = ASSET_REGISTRY.resolve('heungbu.poster.art');
  assert.equal(poster.kind, 'poster');
  assert.equal(poster.placementRole, 'none');
  assert.equal(poster.pickerVisibility, 'hidden');
  assert.equal(poster.legacy.type, 'background');
  const scene = ASSET_REGISTRY.resolve('heungbu.scene.nolbu-goblin-chaos');
  assert.equal(scene.kind, 'scene-illustration');
  assert.equal(scene.placementRole, 'background-slot');
  const background = ASSET_REGISTRY.resolve('heungbu.background.poor-house-winter');
  assert.equal(background.legacy.backgroundRole, 'scene');
  assert.equal(background.kind, 'background');
  assert.equal(background.qualityStatus, 'legacy');
  assert.equal(background.background.season, '겨울');
`));

test("대표 캐릭터·추천 참조는 존재하고 자기 캐릭터를 포함한다", () => verify(`
  assert.equal(new Set(STORY_CHARACTERS.map(c=>c.id)).size, STORY_CHARACTERS.length);
  for (const character of STORY_CHARACTERS) {
    const asset = ASSET_REGISTRY.resolve(character.representativeAssetId);
    assert.ok(asset.characterIds.includes(character.id));
    assert.notEqual(asset.pickerVisibility, 'hidden');
    assert.ok(!['rejected', 'replace'].includes(asset.qualityStatus));
    for (const id of character.storyPackIds) assert.ok(STORY_PACKS.some(p=>p.id===id));
  }
  for (const pack of STORY_PACKS) for (const id of pack.recommendedCharacterIds) {
    assert.ok(STORY_CHARACTERS.some(c=>c.id===id && c.storyPackIds.includes(pack.id)));
  }
`));

test("다인물·소품을 표현하며 override와 원본을 변경하지 않는다", () => verify(`
  const original = structuredClone(STORY_ASSETS[0]);
  const override = {kind:'prop', placementRole:'prop-layer', characterIds:['a.one', 'a.two'], expressions:['생각'], background:{season:'겨울'}};
  const copy = structuredClone(override);
  const asset = normalizeLegacyStoryAsset(original, override);
  assert.equal(asset.kind, 'prop');
  assert.equal(asset.placementRole, 'prop-layer');
  assert.deepEqual(asset.characterIds, ['a.one','a.two']);
  asset.characterIds.push('another');
  asset.background.season = '봄';
  asset.legacy.tags.push('changed');
  assert.deepEqual(override, copy);
  assert.deepEqual(original, STORY_ASSETS[0]);
`));

test("중복 ID와 고아 override를 조용히 덮어쓰지 않는다", () => verify(`
  assert.throws(()=>createAssetRegistry([STORY_ASSETS[0], STORY_ASSETS[0]]), /Duplicate/);
  assert.throws(()=>createAssetRegistry(STORY_ASSETS, {missing:{kind:'poster'}}), /Unknown/);
`));
