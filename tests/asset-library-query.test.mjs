import { execFileSync } from 'node:child_process';
import test from 'node:test';
const verify = script => execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
  import assert from 'node:assert/strict';
  import {ASSET_REGISTRY as registry} from './app/assets/asset-registry.ts';
  import {filterAssets, matchesAssetSearch} from './app/assets/asset-query.ts';
  import {rankAssets} from './app/assets/asset-ranking.ts';
  import {STORY_CHARACTERS} from './app/assets/manifests/characters.ts';
  import {STORY_PACKS} from './app/assets/manifests/story-packs.ts';
  import {auditAssetMetadata} from './app/assets/audits/asset-metadata-audit.ts';
  const assets=registry.assets;
  const context={favoriteIds:[],recentIds:[]};
  ${script}
`], {encoding:'utf8'});

test('전체 metadata 참조와 vocabulary·종류/슬롯 무결성', () => verify(`
  assert.deepEqual(auditAssetMetadata(assets,STORY_CHARACTERS,STORY_PACKS).errors,[]);
  const pack=assets.filter(a=>a.storyPackIds.includes('heungbu-nolbu'));
  assert.equal(pack.length,42);
  for(const [kind,count] of Object.entries({character:25,background:12,'scene-illustration':4,poster:1})) assert.equal(pack.filter(a=>a.kind===kind).length,count);
  for(const id of ['heungbu.heungbu','heungbu.nolbu']) assert.equal(pack.filter(a=>a.characterIds?.includes(id)).length,9);
  const malformed=structuredClone(assets);malformed[0].placementRole='prop-layer';malformed[0].expressions=['잘못된값'];
  assert.ok(auditAssetMetadata(malformed,STORY_CHARACTERS,STORY_PACKS).errors.length>=2);
`));
test('같은 조건 OR·다른 조건 AND와 검색어 결합', () => verify(`
  const q={storyPackIds:['heungbu-nolbu','seonnyeo'],expressions:['걱정','생각'],framings:['full']};
  const found=filterAssets(assets,q);
  assert.ok(found.some(a=>a.storyPackIds.includes('heungbu-nolbu')));
  assert.ok(found.some(a=>a.storyPackIds.includes('seonnyeo')));
  assert.ok(found.every(a=>a.expressions.some(e=>['걱정','생각'].includes(e)) && a.framing==='full'));
  const work=filterAssets(assets,{characterIds:['heungbu.heungbu'],actions:['일하기']});
  assert.deepEqual(work.map(a=>a.assetId),['heungbu.character.heungbu-working']);
  assert.deepEqual(filterAssets(assets,{...q,search:'흥부'}).map(a=>a.assetId).sort(), ['heungbu.character.heungbu-thinking','heungbu.character.nolbu-thinking','heungbu.character.wife-heungbu-worried'].sort());
  assert.ok(matchesAssetSearch(registry.resolve('heungbu.character.nolbu-angry'),'성난 놀부'));
  assert.ok(filterAssets(assets,{kinds:['background'],seasons:['겨울'],search:'집'}).some(a=>a.assetId==='heungbu.background.poor-house-winter'));
`));
test('다인물 그림은 양쪽 캐릭터로 조회, 어린 시절은 같은 인물', () => verify(`
  for(const id of ['rabbit-turtle.rabbit','rabbit-turtle.turtle']) assert.ok(filterAssets(assets,{characterIds:[id]}).some(a=>a.assetId==='rabbit-turtle.character.classic-riding'));
  assert.ok(filterAssets(assets,{characterIds:['heungbu.heungbu'],variants:['어린 시절']}).some(a=>a.assetId==='heungbu.character.heungbu-young'));
`));
test('노출과 슬롯은 강제하고 소품은 조회만 지원한다', () => verify(`
  assert.equal(filterAssets(assets,{storyPackIds:[]}).length,246);
  assert.ok(filterAssets(assets,{}, {}, context,{includeSecondary:false}).every(a=>a.pickerVisibility==='primary'));
  assert.ok(!filterAssets(assets).some(a=>a.kind==='poster'));
  assert.ok(registry.resolve('heungbu.poster.art'));
  assert.ok(filterAssets(assets,{kinds:['prop']}).length===2);
  assert.equal(filterAssets(assets,{kinds:['prop']},{placementRoles:['character-slot']}).length,0);
  assert.ok(filterAssets(assets,{}, {placementRoles:['background-slot']}).some(a=>a.kind==='scene-illustration'));
  assert.equal(filterAssets(assets,{favoriteOnly:true},{},{...context,favoriteIds:['heungbu.poster.art']}).length,0);
`));
test('추천은 결과 집합을 바꾸지 않고 캐릭터·장·작품 순으로 정렬한다', () => verify(`
  const found=filterAssets(assets,{}, {placementRoles:['character-slot']});
  const ranked=rankAssets(found,{...context,currentCharacterIds:['heungbu.heungbu'],currentChapterAssetIds:['seonnyeo.character.M02-neutral'],currentStoryPackId:'heungbu-nolbu'});
  assert.deepEqual(ranked.map(a=>a.assetId).sort(),found.map(a=>a.assetId).sort());
  assert.ok(ranked.slice(0,9).every(a=>a.characterIds.includes('heungbu.heungbu')));
  assert.equal(ranked[9].assetId,'seonnyeo.character.M02-neutral');
  const ids=['heungbu.character.nolbu-angry','heungbu.character.heungbu-working'];
  assert.deepEqual(rankAssets(filterAssets(assets,{recentOnly:true},{},{...context,recentIds:ids}),{...context,recentIds:ids},true).map(a=>a.assetId),ids);
`));
