import { execFileSync } from 'node:child_process';
export const { doc, tabs, title } = JSON.parse(execFileSync(process.execPath, [
 '--experimental-strip-types', '--experimental-loader=./tests/node-types-loader.mjs', '--input-type=module', '-e', `
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
import {createStoryWorkbook,readStoryWorkbook} from './app/story-workbook.ts';
import {STORY_ASSETS} from './app/story-assets.ts';
const p=cloneProject(DEFAULT_PROJECT);p.title='학생 원본';p.chapters=p.chapters.slice(0,1);
p.lines=[{...p.lines[0],text:'학생이 직접 쓴 문장'}];p.creativeMemos=[];
const doc=JSON.stringify(createStoryDocument({project:p,savedAt:'2026-09-09T00:00:00.000Z',appVersion:'qa'}));
p.title='교실 시트 검증 작품';p.lines[0].text='시트에서 가져온 문장';
const workbook=createStoryWorkbook(p,STORY_ASSETS);
const snapshot=await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'fixture.xlsx'));
const tabs=Object.fromEntries(Object.values(snapshot).filter(t=>t&&typeof t==='object'&&'csv' in t).map(t=>[t.name,t.csv]));
console.log(JSON.stringify({doc,tabs,title:p.title}));
`], { encoding: 'utf8' }));

export async function seed(page) {
 await page.goto(process.env.QA_URL || 'http://localhost:3002');
 await page.evaluate(doc => { localStorage.setItem('storygame:draft:v1', doc); localStorage.setItem('storygame:active:v1', doc); }, doc);
 await page.reload();
 await page.locator('.entry-template-options[open]').waitFor({ state: 'attached' });
}
export async function openResume(page) {
 await page.getByRole('button', { name: '나만의 이야기 창작 공작소 열기' }).click();
 await page.getByRole('tab', { name: /이어만들기/ }).click();
}
