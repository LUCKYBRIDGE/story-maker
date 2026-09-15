import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import test from 'node:test';

const project = JSON.parse(execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', '--experimental-strip-types', '--experimental-loader=./tests/node-types-loader.mjs', '--input-type=module', '-e', `const {ONGGOJIB_CLASSIC_READING:p}=await import('./app/story-classic-onggojib.ts');const {resolveStoryStage}=await import('./app/story-stage-view.ts');console.log(JSON.stringify({p,stages:p.lines.map(l=>resolveStoryStage(p.chapters.find(c=>c.id===l.chapterId),l))}));`], {encoding:'utf8'}));

test('옹고집 원작 71컷의 문장·화자·순서·ID는 승인된 main과 동일하다', () => {
  assert.equal(project.p.lines.length,71);
  const frozen=project.p.lines.map(({id,chapterId,order,type,speaker,speakerName,text})=>({id,chapterId,order,type,speaker,speakerName,text}));
  assert.equal(createHash('sha256').update(JSON.stringify(frozen)).digest('hex'),'cce1316d90718bd7f4a16fd73b64952ac631f3b2feb182f904f7d13ab07d6a6d');
});

test('모든 컷은 존재하는 배경과 독립 캐릭터를 사용하고 빈 인물을 상속하지 않는다', () => {
  for(const [i,stage] of project.stages.entries()) {
    assert.ok(stage.background.src,`cut ${i+1}: background`);
    assert.equal(stage.background.meaningful,false,`cut ${i+1}: no scene CG`);
    assert.ok(stage.left.id || stage.right.id);
    for(const side of ['left','right']) {
      assert.equal(stage[side].id,project.p.lines[i][`${side}AssetId`]);
      if(stage[side].id) assert.ok(stage[side].src,stage[side].id);
    }
  }
});

test('새 캐릭터는 실제 투명 픽셀과 규격·발선·잘림 여백을 가진다', async () => {
  const {default:sharp}=await import('sharp');
  const {readFile}=await import('node:fs/promises');
  const assets=JSON.parse(await readFile('public/story-assets/onggojib-classic-manifest.json','utf8'));
  for(const asset of assets.filter(a=>a.type==='character')) {
    const file='public'+asset.src;
    const meta=await sharp(file).metadata();
    assert.equal(meta.width,800,asset.id);assert.equal(meta.height,1200,asset.id);assert.ok(meta.hasAlpha,asset.id);
    const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
    let bottom=-1,top=1200,left=800,right=-1,transparent=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++) {
      const alpha=data[(y*info.width+x)*4+3];if(alpha===0)transparent++;
      if(alpha>=26){bottom=Math.max(bottom,y);top=Math.min(top,y);left=Math.min(left,x);right=Math.max(right,x);}
    }
    assert.ok(transparent>800*1200*.3,asset.id);
    assert.ok(Math.abs(bottom-1149)<=3,`${asset.id}: ground ${bottom}`);
    assert.ok(top>=120&&left>=30&&right<=770,`${asset.id}: safe margins`);
  }
});
