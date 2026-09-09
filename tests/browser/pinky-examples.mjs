import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {projects}=JSON.parse(await readFile(new URL('../../app/story-examples.generated.json',import.meta.url),'utf8'));
const output='/tmp/pinky-examples-qa';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try {for(const [theme,index,width,height] of [['onggojib',1,1365,900],['rabbit',0,390,844]]){
 const project=projects[index];const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.QA_URL||'http://localhost:3002');await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
 const before=await page.evaluate(()=>localStorage.getItem('storygame:draft:v1'));
 if(theme==='rabbit')await page.getByRole('button',{name:/이야기 변경/}).click();
 await page.getByRole('button',{name:'놀스토리 작품 읽기',exact:true}).click();await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
 await page.locator('.player-shell').waitFor();await page.screenshot({path:`${output}/${theme}-opening.png`,fullPage:true});
 let line=project.lines[0],count=0,choices=0;const visited=new Set();
 while(line && count<600){
  assert.ok(!visited.has(line.id));visited.add(line.id);count++;
  await page.waitForFunction(text=>document.querySelector('.dialogue-box')?.textContent?.includes(text),line.text,{timeout:10000});
  if(line.flow?.type==='choice'){
   choices++;if(choices===1)await page.screenshot({path:`${output}/${theme}-choice.png`,fullPage:true});
   const option=line.flow.options[0];await page.getByRole('button',{name:option.label,exact:true}).click();line=project.lines.find(l=>l.id===option.targetLineId);
  }else if(line.flow?.type==='goto' && line.flow.targetLineId===null){assert.ok(await page.getByRole('button',{name:'공연 마치기',exact:true}).isVisible());break;}
  else{const target=line.flow?.type==='goto'?line.flow.targetLineId:project.lines[project.lines.indexOf(line)+1]?.id;await page.getByRole('button',{name:'다음 컷',exact:true}).click();line=project.lines.find(l=>l.id===target);}
 }
 assert.ok(count>20 && choices>0);assert.equal(await page.evaluate(()=>localStorage.getItem('storygame:draft:v1')),before);assert.deepEqual(errors,[]);results.push({theme,width,height,cuts:count,choices,ending:true,draftUntouched:true});await page.close();
}await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));console.log(results);}finally{await browser.close();}
