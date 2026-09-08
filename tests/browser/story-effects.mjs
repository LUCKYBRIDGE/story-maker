// Run against npm run dev. PLAYWRIGHT_MODULE may point to an existing external installation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.QA_OUTPUT || '/tmp/story-effects-qa';
await mkdir(output,{recursive:true});
const doc=execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
  import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
  import {createStoryDocument} from './app/story-project-document.ts';
  const p=cloneProject(DEFAULT_PROJECT);p.title='Cinematic QA';p.chapters=p.chapters.slice(0,1);
  p.lines=Array.from({length:7},(_,i)=>({...p.lines[0],id:'qa-'+i,chapterId:p.chapters[0].id,order:i+1,text:'연출을 확인하는 장면 '+(i+1)}));
  console.log(JSON.stringify(createStoryDocument({project:p,savedAt:new Date().toISOString(),appVersion:'test'})));
`],{encoding:'utf8'}).trim();
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
for (const viewport of [{width:1365,height:900},{width:390,height:844}]) {
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.QA_URL || 'http://localhost:3001');
  await page.evaluate(doc=>{localStorage.clear();localStorage.setItem('storygame:draft:v1',doc);localStorage.setItem('storygame:active:v1',doc);},doc);
  await page.reload();
  await page.getByText('터치하여 책 펼치기').click();
  await page.getByRole('tab',{name:/이어만들기/}).click();
  await page.getByText('이 기기에서 이어만들기 ➔').click();
  const effects=['화면 흔들림','붉은 빛','암전','화면 갈라짐','집중 조명','화면 흔들림'];
  for(let i=0;i<effects.length;i++) {
    const card=page.locator(`.script-scene-card[data-line-id="qa-${i}"]`);
    await card.locator('textarea').focus();
    assert.ok((await card.getByRole('button',{name:/✨ 연출 효과/}).boundingBox()).height>=44);
    await card.getByRole('button',{name:/✨ 연출 효과/}).click();
    const dialog=page.getByRole('dialog');
    await dialog.getByRole('button',{name:new RegExp(effects[i])}).click();
    await dialog.getByLabel(/^강도/).selectOption('strong');
    await dialog.getByLabel('언제 시작할까요?').selectOption(i===5?'after-delay':i===1?'with-dialogue':'scene-enter');
    if(i===5) await dialog.getByLabel('기다리는 시간 (초)').fill('1.5');
    await dialog.getByRole('button',{name:'▶ 미리보기'}).click();
    await page.waitForTimeout(i===5?1600:170);
    assert.ok(await dialog.locator('.story-scene-frame').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).length)>0);
    if(i===3) {
      await dialog.locator('.story-scene-frame').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).forEach(a=>{a.pause();a.currentTime=700;}));
      const bounds=await dialog.boundingBox();
      assert.ok(bounds.y>=0 && bounds.y+bounds.height<=viewport.height);
      await page.screenshot({path:path.join(output,`editor-${viewport.width}.png`)});
      const dimensions=await dialog.evaluate(el=>({width:el.scrollWidth,client:el.clientWidth,targets:[...el.querySelectorAll('button,select,input')].map(e=>e.getBoundingClientRect().height)}));
      assert.ok(dimensions.width<=dimensions.client+1);
      assert.ok(dimensions.targets.every(h=>h>=44));
      // Escape cancels and restores the trigger's focus.
      await page.keyboard.press('Escape');
      assert.ok(await card.getByRole('button',{name:/✨ 연출 효과/}).evaluate(el=>el===document.activeElement));
      await card.getByRole('button',{name:/✨ 연출 효과/}).click();
      await page.getByRole('dialog').getByRole('button',{name:/화면 갈라짐/}).click();
    }
    await page.getByRole('dialog').getByRole('button',{name:'이 컷에 적용'}).click();
  }
  // Cut editor shares settings and cancel leaves the saved effect unchanged.
  await page.getByRole('button',{name:'이 컷 꾸미기',exact:true}).click();
  await page.getByRole('button',{name:/✨ 연출 효과/}).click();
  await page.getByRole('dialog').getByRole('button',{name:/○ 없음/}).click();
  await page.getByRole('dialog').getByRole('button',{name:'취소',exact:true}).click();
  await page.screenshot({path:path.join(output,`cut-${viewport.width}.png`)});
  await page.getByRole('button',{name:'플레이에 적용',exact:true}).click();
  await page.getByText(/플레이 적용 완료/).waitFor();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('storygame:active:v1')).project);
  assert.equal(saved.lines[5].effect.delayMs,1500);
  assert.equal(saved.lines[6].effect,undefined);
  await page.locator('.creator-primary-nav button').nth(2).click();
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  const frame=page.locator('.player-shell .story-scene-frame');
  await frame.waitFor();
  const next=page.getByRole('button',{name:'다음 컷',exact:true});
  const previous=page.getByRole('button',{name:'이전',exact:true});
  // Player opens at selected cut; jump to the beginning of this chapter.
  await page.getByRole('combobox').selectOption(saved.chapters[0].id);
  for(let i=0;i<5;i++) {
    if(i>0) await next.click();
    await page.waitForTimeout(70);
    assert.ok(await frame.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).length)>0,`player effect ${i}`);
    if(i===2 || i===3) {
      await frame.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).forEach(a=>{a.pause();a.currentTime=700;}));
      await page.screenshot({path:path.join(output,`player-${i}-${viewport.width}.png`)});
    }
  }
  await next.click();
  const timing=await frame.evaluate(async el=>{
    const a=el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay'))[0];
    assertAnimation(a);
    function assertAnimation(a){if(!a)throw new Error('missing delayed animation');}
    const before=performance.now();
    while(a.currentTime<1500) await new Promise(requestAnimationFrame);
    return {delay:a.effect.getTiming().delay,observedStartMs:performance.now()-before};
  });
  assert.equal(timing.delay,1500);
  await next.click();
  assert.equal(await frame.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).length),0);
  // Leaving a delayed cut cancels the old Animation objects, including pending starts.
  for(let i=0;i<12;i++) {
    await previous.click();
    await frame.evaluate(el=>{window.qaOldAnimations=el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay'));});
    await next.click();
    assert.ok(await page.evaluate(()=>window.qaOldAnimations.every(a=>a.playState==='idle')));
  }
  assert.equal(await frame.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).length),0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await previous.click();
  assert.equal(await frame.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay')).length),0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await next.click();
  // Sample rAF while cycling all effects, also under 4x CPU throttling.
  const cdp=await context.newCDPSession(page);
  const performanceSamples=[];
  for(const cpuRate of [1,4]) {
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});
    await page.getByRole('combobox').selectOption(saved.chapters[0].id);
    const sample=await frame.evaluate(async el=>{
      const intervals=[];let last=performance.now();const begin=last;
      let cut=0;
      while(performance.now()-begin<3200) {
        await new Promise(requestAnimationFrame);
        const now=performance.now();intervals.push(now-last);last=now;
        if(now-begin>(cut+1)*500 && cut<4){el.querySelector('.player-controls .primary-button').click();cut++;}
      }
      const sorted=intervals.slice(1).sort((a,b)=>a-b);
      return {frames:sorted.length,meanMs:sorted.reduce((a,b)=>a+b,0)/sorted.length,p95Ms:sorted[Math.floor(sorted.length*.95)],over33ms:sorted.filter(n=>n>33.4).length};
    });
    performanceSamples.push({cpuRate,...sample});
  }
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await frame.evaluate(el=>{window.qaOldAnimations=el.getAnimations({subtree:true}).filter(a=>a.effect.target.matches('.story-stage-background, .story-stage-canvas, .scene-effect-overlay'));});
  await page.getByRole('button',{name:'편집으로 돌아가기',exact:true}).click();
  assert.ok(await page.evaluate(()=>window.qaOldAnimations.every(a=>a.playState==='idle')));
  // A real reload exercises the repository parser; editing None does not mutate the active version.
  await page.reload();
  await page.getByText('터치하여 책 펼치기').click();
  await page.getByRole('tab',{name:/이어만들기/}).click();
  await page.getByText('이 기기에서 이어만들기 ➔').click();
  await page.getByRole('button',{name:/✨ 연출 효과/}).first().click();
  const dialog=page.getByRole('dialog');
  assert.equal(await dialog.getByRole('button',{name:/화면 흔들림/}).getAttribute('aria-pressed'),'true');
  await dialog.getByRole('button',{name:/○ 없음/}).click();
  await dialog.getByRole('button',{name:'이 컷에 적용'}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('storygame:draft:v1')).project.lines.some((l,i)=>i<6&&!l.effect));
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('storygame:active:v1')).project.lines.filter(l=>l.effect).length),6);
  assert.deepEqual(errors,[]);
  results.push({viewport,timing,rapidTransitions:24,remainingAnimations:0,reducedMotion:true,minDialogTargetPx:44,performanceSamples,errors});
  console.log(JSON.stringify(results.at(-1)));
  await context.close();
}
await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));
} finally { await browser.close(); }
