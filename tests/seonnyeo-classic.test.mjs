import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';

const { project, assets, stages } = JSON.parse(execFileSync(process.execPath, [
  '--disable-warning=ExperimentalWarning', '--experimental-strip-types',
  '--experimental-loader=./tests/node-types-loader.mjs', '--input-type=module', '-e', `
  import { SEONNYEO_CLASSIC_READING as project } from './app/story-classic-seonnyeo.ts';
  import { STORY_ASSETS as assets } from './app/story-assets.ts';
  import { resolveStoryStage } from './app/story-stage-view.ts';
  console.log(JSON.stringify({project, assets, stages:project.lines.map(line=>resolveStoryStage(project.chapters.find(c=>c.id===line.chapterId),line))}));
`], { encoding: 'utf8' }));

test('선녀 원작은 첨부한 6장·83컷과 화자·문장·순서를 보존한다', () => {
  assert.equal(project.id, 'classic-seonnyeo-tale');
  assert.deepEqual(project.chapters.map(c => project.lines.filter(l => l.chapterId === c.id).length), [12,12,11,12,13,23]);
  const prose = project.lines.map(({ chapterId, order, speakerName, text }) => [chapterId, order, speakerName, text]);
  // 사용자 첨부에서 추출. '사슴의 말' 표기만 '사슴'으로 정규화.
  assert.equal(createHash('sha256').update(JSON.stringify(prose)).digest('hex'), 'd28867f78b76005df9595e7e3090327a2cd466923847346e0f4c68881e66d351');
  assert.equal(new Set(project.lines.map(l => l.id)).size, 83);
  assert.equal(project.sheetEditable, false);
  assert.deepEqual(project.creativeMemos, []);
  for (const line of project.lines) {
    assert.notEqual(line.type, 'choice');
    assert.ok(!line.choices?.length);
    assert.ok(project.chapters.some(c => c.id === line.chapterId));
    if (line.type === 'dialogue') assert.ok(project.speakerNames.includes(line.speakerName));
  }
});

test('원작의 모든 배경·인물은 로컬 자산이고 빈 인물은 장 기본값을 상속하지 않는다', () => {
  const byId = new Map(assets.map(a => [a.id, a]));
  for (const [i, line] of project.lines.entries()) {
    const stage = stages[i];
    assert.ok(stage.background.src);
    assert.equal(stage.background.meaningful, false);
    for (const key of ['backgroundId', 'leftAssetId', 'rightAssetId']) {
      if (!line[key]) continue;
      const asset = byId.get(line[key]);
      assert.ok(asset, line[key]);
      assert.ok(existsSync(`public${asset.src}`), asset.src);
    }
    assert.equal(stage.left.id, line.leftAssetId);
    assert.equal(stage.right.id, line.rightAssetId);
  }
  assert.equal(project.lines.find(l => l.id === 'classic-seonnyeo-4-line-04').rightAssetId, '');
  assert.equal(project.lines.at(-1).leftAssetId, '');
});

test('원작의 새 인물·소품 18종은 투명 캔버스·발선·안전 여백을 만족한다', async () => {
  const { default: sharp } = await import('sharp');
  const newActors = assets.filter(a => a.id.startsWith('seonnyeo.character.classic-'));
  assert.equal(newActors.length, 18);
  for (const asset of newActors) {
    const file = `public${asset.src}`;
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, 800, asset.id);
    assert.equal(metadata.height, 1200, asset.id);
    assert.ok(metadata.hasAlpha, asset.id);
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let top = info.height, bottom = -1, left = info.width, right = -1, transparent = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha === 0) transparent++;
      if (alpha >= 26) {
        top = Math.min(top, y); bottom = Math.max(bottom, y);
        left = Math.min(left, x); right = Math.max(right, x);
      }
    }
    assert.ok(transparent > 800 * 1200 * .3, asset.id);
    assert.ok(Math.abs(bottom - 1149) <= 3, `${asset.id}: ${bottom}`);
    assert.ok(top >= 120 && left >= 30 && right <= 770, `${asset.id}: margins`);
    assert.ok(project.lines.some(line => [line.leftAssetId, line.rightAssetId].includes(asset.id)), `${asset.id}: must be used`);
  }
});

test('아이와 사슴은 성인보다 작게 표시하고 사냥꾼 앞에는 숨은 사슴을 보여 주지 않는다', () => {
  const children = stages.flatMap(s => [s.left, s.right]).filter(a => a.id === 'seonnyeo.character.classic-children');
  const deer = stages.flatMap(s => [s.left, s.right]).filter(a => a.id === 'seonnyeo.character.classic-deer');
  assert.ok(children.length && children.every(a => a.scale === .62));
  assert.ok(deer.length && deer.every(a => a.scale === .72));
  for (const order of [5, 6, 7]) {
    const line = project.lines.find(l => l.chapterId === 'classic-seonnyeo-1' && l.order === order);
    assert.equal(line.rightAssetId, 'seonnyeo.character.classic-hunter');
    assert.ok(!line.leftAssetId.endsWith('classic-deer'));
  }
});

test('주요 사건은 전용 동작으로 표시하고 떠난 인물을 중복 배치하지 않는다', () => {
  const stage = (chapter, order) => stages[project.lines.findIndex(l => l.chapterId === `classic-seonnyeo-${chapter}` && l.order === order)];
  const id = name => `seonnyeo.character.classic-${name}`;
  assert.equal(stage(2,4).right.id, id('wing-robe'));
  assert.equal(stage(3,2).right.id, id('fairy-holding-first-baby'));
  assert.equal(stage(3,8).left.id, id('woodcutter-holding-robe'));
  assert.equal(stage(4,1).right.id, id('fairy-carrying-children'));
  assert.equal(stage(4,1).left.id, '');
  assert.equal(stage(5,2).right.id, id('heavenly-bucket'));
  assert.equal(stage(5,3).left.id, id('woodcutter-in-bucket'));
  for (let order=1;order<=12;order++) assert.equal(stage(6,order).left.id, id('woodcutter-riding-horse'));
  assert.equal(stage(6,11).right.id, id('mother-offering-porridge'));
  assert.equal(stage(6,13).left.id, id('horse-startled-by-porridge'));
  assert.equal(stage(6,15).left.id, id('woodcutter-fallen'));
  assert.equal(stage(6,16).right.id, id('celestial-horse-departing'));
  assert.equal(stage(6,17).right.id, '');
  assert.equal(stage(6,19).left.id, id('woodcutter-aged'));
  assert.equal(stage(6,23).right.id, id('rooster-calling-sky'));
  assert.equal(stage(6,23).right.scale, .48);
  assert.equal(stage(6,3).left.mirrored, false);
  assert.equal(stage(6,3).right.mirrored, false);
  assert.equal(stage(6,1).left.sharedActor, true);
  assert.equal(stage(6,3).left.scale, 1.4);
  assert.equal(stage(3,2).right.placement, 'framing-full');
  assert.equal(stage(4,1).right.placement, 'framing-full');
});
