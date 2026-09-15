import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const {p,stages}=JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`const {RABBIT_CLASSIC_READING:p}=await import('./app/story-classic-readings.ts');const {resolveStoryStage}=await import('./app/story-stage-view.ts');console.log(JSON.stringify({p,stages:p.lines.map(l=>resolveStoryStage(p.chapters.find(c=>c.id===l.chapterId),l))}));`],{encoding:'utf8'}));
const cut=(chapter,line)=>stages.find((_,i)=>p.lines[i].id===`classic-rabbit-${chapter}-line-${String(line).padStart(2,'0')}`);

test('토끼전 승인된 5장 56컷의 대본·화자·순서·ID 보존',()=>{
 assert.deepEqual(p.chapters.map(c=>p.lines.filter(l=>l.chapterId===c.id).length),[11,12,11,12,10]);
 const frozen=p.lines.map(({id,chapterId,order,type,speaker,speakerName,text})=>({id,chapterId,order,type,speaker,speakerName,text}));
 assert.equal(createHash('sha256').update(JSON.stringify(frozen)).digest('hex'),'19a7f314f32cd4d1197a8599071f2b0944484eddaf640ce2b08d089e6fa3de03');
});

test('56컷의 모든 자산은 존재하며, 빈 슬롯과 등장 시점을 지킨다',async()=>{
 for(const [i,s]of stages.entries()){
  assert.ok(s.background.id);
  for(const part of ['background','left','right']){
   assert.equal(s[part].missing,false,`${i+1} ${part}`);
   if(s[part].id)await access('public'+s[part].src);
  }
  for(const side of ['left','right'])assert.equal(s[side].id,p.lines[i][side+'AssetId']);
 }
 for(let i=1;i<=4;i++)assert.equal(cut(2,i).left.id,'','토끼는 발견 전 미등장');
 assert.equal(cut(5,10).left.id,'','떠난 토끼는 마지막에 미등장');
 assert.ok(cut(5,10).right.id.includes('turtle-tired'));
});

test('이동은 수면·수중·용궁으로 이어지고, 탈출도 분리 자산으로 연출한다',()=>{
 assert.match(cut(3,3).background.id,/classic-sea$/);
 assert.match(cut(3,7).background.id,/classic-underwater$/);
 assert.match(cut(3,8).background.id,/classic-palace-vista$/);
 for(const [ch,from,to]of [[3,3,8],[5,3,6]])for(let i=from;i<=to;i++){
  assert.match(cut(ch,i).left.id,/classic-riding$/);assert.equal(cut(ch,i).right.id,'');
 }
 for(const s of stages){assert.ok(!/flashback|palace-trap|classic-escape|classic-shore-reveal/.test(s.background.id));}
 assert.match(cut(5,7).left.id,/classic-rabbit-leap$/);
 for(const i of [8,9]){assert.match(cut(5,i).left.id,/classic-rabbit-rock$/);assert.match(cut(5,i).right.id,/classic-turtle-water$/);}
 for(const [ch,from,to]of [[3,9,11],[4,1,12],[5,1,2]])for(let i=from;i<=to;i++)assert.match(cut(ch,i).right.id,/dragonking-sick-elder-attached$/);
});

test('신규 인물은 실제 투명 배경과 안전한 경계를 가진다',async()=>{
 const {default:sharp}=await import('sharp');
 const assets=JSON.parse(await readFile('public/story-assets/rabbit-classic-manifest.json','utf8'));
 const framings=Object.fromEntries(assets.filter(a=>a.type==='character').map(a=>[a.id.split('.').at(-1),a.framing]));
 assert.deepEqual(framings,{'classic-turtle-portrait':'전신','classic-riding':'여러 인물','classic-rabbit-laugh':'전신','classic-rabbit-leap':'전신','classic-rabbit-rock':'전신','classic-turtle-water':'상반신'});
 for(const a of assets.filter(a=>a.type==='character')){
  const {data,info}=await sharp('public'+a.src).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let transparent=0,top=info.height,left=info.width,right=-1,bottom=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const alpha=data[(y*info.width+x)*4+3];if(alpha===0)transparent++;
   if(alpha>=26){top=Math.min(top,y);bottom=Math.max(bottom,y);left=Math.min(left,x);right=Math.max(right,x);}
  }
  assert.ok(transparent>info.width*info.height*.3,a.id+' true alpha');
  assert.ok(top>=30&&left>=20&&right<info.width-20&&bottom<info.height-20,a.id+' safe margins');
  if(['classic-turtle-portrait','classic-rabbit-laugh'].some(s=>a.id.endsWith(s))){
   assert.equal(info.width,800);assert.equal(info.height,1200);assert.ok(Math.abs(bottom-1149)<=3,a.id+' foot baseline');
  }
 }
});
