import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { launchBrowser } from './support/runtime.mjs';
import { selectLocalBook } from './support/library-entry.mjs';
const output = process.env.QA_OUTPUT || 'outputs/image-layout-safety';
const url = process.env.QA_URL || 'http://localhost:3003';
const sizes = [[320,740],[360,800],[390,844],[720,450],[844,390],[768,1024],[820,1180],[1024,768],[1280,720],[1365,900],[1440,900],[1920,1080],[667,375],[932,430]];
const assets = JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`import {STORY_ASSETS} from './app/story-assets.ts';import {DEFAULT_PROJECT} from './app/story-data.ts';import {createStoryDocument} from './app/story-project-document.ts';console.log(JSON.stringify({all:STORY_ASSETS,doc:createStoryDocument({project:DEFAULT_PROJECT,savedAt:new Date().toISOString(),appVersion:'qa'})}));`],{encoding:'utf8'}));
const browser = await launchBrowser(output);
const results = [];
async function settle(page) {
  await page.locator('.player-shell .story-stage-actor').first().waitFor();
  await page.locator('.player-shell img').evaluateAll(images=>Promise.all(images.map(i=>i.decode().catch(()=>{}))));
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.player-shell img.story-stage-actor')).every(i=>i.dataset.layoutReady==='true'));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function measure(page) {
  return page.evaluate(()=>{
    const rect = el => el.getBoundingClientRect().toJSON();
    const stage = document.querySelector('.player-shell .story-stage-canvas');
    const bg = stage.querySelector('.story-stage-background');
    const image = bg?.querySelector('img');
    const ratio = image ? (bg.clientWidth/bg.clientHeight)/(image.naturalWidth/image.naturalHeight) : 1;
    return {stage:rect(stage),dialogue:rect(document.querySelector('.dialogue-box')),
      heading:rect(document.querySelector('.reader-top-actions')),overflow:document.documentElement.scrollWidth>innerWidth,
      fit:image ? getComputedStyle(image).objectFit : null,retained:Math.min(ratio,1/ratio),
      actors:Array.from(stage.querySelectorAll('img.story-stage-actor')).map(i=>({box:rect(i),ratio:i.naturalWidth/i.naturalHeight,
        scale:Number(getComputedStyle(i).getPropertyValue('--actor-scale')),foot:rect(i).top+rect(i).height*Number(i.dataset.footAnchor),className:i.className}))};
  });
}
function safe(m,label) {
  assert.ok(!m.overflow,`${label}: horizontal overflow`);
  assert.ok(m.stage.top>=m.heading.bottom-1,`${label}: stage clear of heading`);
  assert.ok(m.fit==='contain'||m.retained>=.6,`${label}: excessive background crop`);
  for(const a of m.actors) {
    const b=a.box,s=m.stage;
    assert.ok(b.top>=s.top-1 && b.left>=s.left-1 && b.right<=s.right+1 && b.bottom<=s.bottom+1,`${label}: actor outside stage ${JSON.stringify({b,s})}`);
    assert.ok(m.dialogue.top>=b.top+b.height*.65-2,`${label}: upper body behind dock`);
    assert.ok(Math.abs(b.width/b.height-a.ratio)<.003,`${label}: aspect distortion`);
  }
}
async function preferences(page,dialoguePercent,percent) {
  await page.evaluate(({dialoguePercent,percent})=>{
    const characterScales=Object.fromEntries(Array.from(document.querySelectorAll('.story-stage-actor')).map(i=>[i.dataset.scaleGroup,percent]));
    const key='storygame:display-settings:v1';localStorage.setItem(key,JSON.stringify({version:1,dialoguePercent,characterScales}));
    window.dispatchEvent(new StorageEvent('storage',{key}));
  },{dialoguePercent,percent});
  await settle(page);
}
try {
  for(const [width,height] of sizes) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await page.goto(url);await page.locator('.nolstory-poster-img').evaluate(i=>i.decode());
    for(const theme of ['onggojib','rabbit']) {
      if(theme==='rabbit') {
        await page.getByRole('button',{name:'서재 입장',exact:true}).click();
        await page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true}).click();
        await page.getByRole('button',{name:'돌아가기',exact:true}).click();
        await page.getByRole('button',{name:'놀스토리 소개',exact:true}).click();
        await page.locator('.nolstory-poster-img').evaluate(i=>i.decode());
      }
      const poster=await page.locator('.nolstory-poster-img').evaluate(i=>({fit:getComputedStyle(i).objectFit,transform:getComputedStyle(i).transform,loaded:i.naturalWidth>0,overflow:document.documentElement.scrollWidth>innerWidth}));
      assert.deepEqual(poster,{fit:'cover',transform:'none',loaded:true,overflow:false});
      if([390,844,1440].includes(width)) await page.screenshot({path:`${output}/start-${theme}-${width}x${height}.png`,fullPage:true});
    }
    await page.getByRole('button',{name:'이야기 읽기',exact:true}).click();
    await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-shell').waitFor();await settle(page);
    const navigation=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('storygame:navigation:v1')));
    // Exercise real assets in both slots, including groups, upper-body and a different native canvas.
    for(const framing of ['전신','상반신','여러 인물']) {
      const candidates=assets.all.filter(a=>a.type==='character'&&a.framing===(framing==='상반신'?'전신':framing));
      const first=framing==='전신'?assets.all.find(a=>a.id==='onggojib.character.real-angry-pixel'):candidates[0];
      const second=framing==='전신'?assets.all.find(a=>a.id==='rabbit-turtle.character.turtle-unified-720x900'):candidates.at(-1);
      const snapshot=structuredClone(navigation);
      snapshot.player.project.lines.forEach(line=>{line.leftAssetId=first.id;line.rightAssetId=second.id;line.backgroundId=framing==='전신'?'rabbit-turtle.background.rabbit-palace-reveal':assets.all.find(a=>a.type==='background'&&a.backgroundRole==='scenery').id;});
      await page.evaluate(snapshot=>sessionStorage.setItem('storygame:navigation:v1',JSON.stringify(snapshot)),snapshot);
      await page.reload();await page.locator('.player-shell').waitFor();await settle(page);
      // No current asset is tagged upper-body. Exercise that common policy with a DOM framing fixture.
      if(framing==='상반신') await page.locator('.player-shell .story-stage-actor').evaluateAll(images=>{images.forEach(i=>{i.classList.remove('framing-full');i.classList.add('framing-upper');});window.dispatchEvent(new Event('resize'));});
      const baselines=new Map();
      for(const dock of [35,20,45,60]) {
        for(const scale of [40,100,120,140]) {
          await preferences(page,dock,scale);
          const m=await measure(page);const label=`${width}x${height}/${framing}/${dock}/${scale}`;
          safe(m,label);
          assert.ok(Math.abs(m.dialogue.height-height*dock/100)<2,`${label}: dock height`);
          if(dock===35) baselines.set(scale,m);
          else m.actors.forEach((a,i)=>{
            const original=baselines.get(scale).actors[i];
            assert.ok(Math.abs(a.box.width-original.box.width)<1 && Math.abs(a.box.height-original.box.height)<1,`${label}: dock resized actor`);
          });
          if(scale!==40) m.actors.forEach((a,i)=>{
            const small=baselines.get(40);
            assert.ok(Math.abs(a.box.height/small.actors[i].box.height-scale/40)<.005,`${label}: actual scale`);
            assert.ok(Math.abs((m.stage.bottom-a.foot)-(small.stage.bottom-small.actors[i].foot))<1,`${label}: foot anchor drift`);
          });
          if(framing==='전신' && [390,844,1365].includes(width) && ((dock===35&&scale===100)||(dock===60&&scale===140)))
            await page.screenshot({path:`${output}/player-${width}x${height}-${dock}-${scale}.png`,fullPage:true});
          results.push({width,height,framing,dock,scale,fit:m.fit,stageHeight:m.stage.height});
        }
      }
    }
    await page.close();console.log(`image safety ${width}x${height}: 48 combinations passed`);
  }
  // Use the actual cover editor controls for all layouts, positions and framing classes.
  for(const [width,height] of [[390,844],[844,390],[1365,900]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await page.addInitScript(doc=>{localStorage.setItem('storygame:draft:v1',JSON.stringify(doc));localStorage.setItem('storygame:active:v1',JSON.stringify(doc));},assets.doc);
    await page.goto(url);await selectLocalBook(page);await page.getByRole('button',{name:'이어만들기',exact:true}).click();
    await page.locator('.creator-project-details > summary').click();await page.getByRole('button',{name:'내 책 표지 꾸미기',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'내 책 표지 꾸미기',exact:true});
    await dialog.getByText('표지 그림 고르기',{exact:true}).click();
    for(const layout of ['정통 동화책','그림 중심','큰 제목']) {
      await dialog.getByRole('button',{name:layout,exact:true}).click();
      for(const framing of ['전신','상반신','여러 인물']) {
        await dialog.getByLabel('표지 인물',{exact:true}).selectOption(assets.all.find(a=>a.type==='character'&&a.framing===(framing==='상반신'?'전신':framing)).id);
        for(const position of ['center','left','right']) {
          await dialog.getByLabel('인물 위치',{exact:true}).selectOption(position);
          const image=dialog.locator('.book-art-character');await image.evaluate(i=>i.decode());
          if(framing==='상반신') await image.evaluate(i=>{i.classList.remove('framing-full');i.classList.add('framing-upper');});
          const m=await image.evaluate(i=>{const b=i.getBoundingClientRect(),p=i.parentElement.getBoundingClientRect();return {safe:b.left>=p.left-1&&b.right<=p.right+1&&b.top>=p.top-1&&b.bottom<=p.bottom+1,fit:getComputedStyle(i).objectFit};});
          assert.deepEqual(m,{safe:true,fit:'contain'},`cover ${width}/${layout}/${framing}/${position}`);
          if(width===1365&&layout==='정통 동화책'&&framing==='여러 인물') await dialog.locator('.student-book').screenshot({path:`${output}/cover-${position}.png`});
        }
      }
    }
    await page.keyboard.press('Escape');await page.close();
  }
  await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
  console.log(`${results.length} stage combinations and 81 cover combinations passed`);
} finally {await browser.close();}
