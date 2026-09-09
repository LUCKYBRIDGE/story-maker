import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { launchBrowser } from './support/runtime.mjs';
import { analyzeExample } from '../helpers/example-graph.mjs';
const { projects } = JSON.parse(await readFile(new URL('../../app/story-examples.generated.json', import.meta.url), 'utf8'));
const output = process.env.QA_OUTPUT || '/tmp/pinky-examples-qa';
await mkdir(output, { recursive: true });
const student = execFileSync(process.execPath, ['--experimental-strip-types', '--experimental-loader=./tests/node-types-loader.mjs', '--input-type=module', '-e', `
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
const p=cloneProject(DEFAULT_PROJECT);p.title='학생이 보관한 작품';
p.lines[0].text='예시를 읽어도 남아 있어야 하는 학생 문장';
console.log(JSON.stringify(createStoryDocument({project:p,savedAt:'2026-09-09T00:00:00.000Z',appVersion:'qa'})));`], { encoding: 'utf8' }).trim();
const storage = {
 'storygame:draft:v1': student, 'storygame:active:v1': student,
 'storygame:backup:v1': student, 'storygame:checkpoints:v1': '[]',
};
const browser = await launchBrowser(output), results = [];
async function textVisible(page, text) {
 await page.waitForFunction(text => document.querySelector('.dialogue-box')?.textContent?.includes(text), text);
}
try {
 for (const [index, project] of projects.entries()) {
  const graph = analyzeExample(project);
  for (const [routeIndex, route] of graph.endingRoutes.entries()) {
   const [width, height] = routeIndex % 2 === 0 ? [1365, 900] : [390, 844];
   const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
   const errors = []; page.on('pageerror', error => errors.push(error.message));
   await page.goto(process.env.QA_URL || 'http://localhost:3002');
   await page.evaluate(storage => { for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value); }, storage);
   await page.reload();
   await page.locator('.entry-template-options[open]').waitFor({ state: 'attached' });
   const snapshot = () => page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(storage));
   assert.deepEqual(await snapshot(), storage);
   if (index === 0) await page.getByRole('button', { name: /이야기 변경/ }).click();
   await page.getByRole('button', { name: '놀스토리 작품 읽기', exact: true }).click();
   await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
   await page.locator('.player-shell').waitFor();
   let choices = 0;
   for (const step of route) {
    const line = graph.byId.get(step.lineId);
    await textVisible(page, line.text);
    if (line.flow?.type === 'choice') {
     choices++;
     assert.equal(await page.locator('.player-choices button').count(), line.flow.options.length);
     for (const option of line.flow.options) assert.ok(await page.getByRole('button', { name: option.label, exact: true }).isVisible());
     const option = line.flow.options[step.optionIndex];
     await page.getByRole('button', { name: option.label, exact: true }).click();
     await textVisible(page, graph.byId.get(step.target).text);
     await page.getByRole('button', { name: '이전', exact: true }).click();
     await textVisible(page, line.text);
     await page.getByRole('button', { name: option.label, exact: true }).click();
    } else if (step.target !== null) await page.getByRole('button', { name: '다음 컷', exact: true }).click();
   }
   assert.ok(await page.getByRole('button', { name: '공연 마치기', exact: true }).isVisible());
   assert.ok(await page.getByRole('button', { name: '다음 컷', exact: true }).isDisabled());
   await page.screenshot({ path: `${output}/example-${index}-ending-${routeIndex}.png`, fullPage: true });
   assert.deepEqual(await snapshot(), storage);
   await page.getByRole('button', { name: '공연 마치기', exact: true }).click();
   await page.getByRole('button', { name: '앞표지로', exact: true }).waitFor();
   assert.deepEqual(await snapshot(), storage);
   assert.deepEqual(errors, []);
   results.push({ title: project.title, ending: route.at(-1).lineId, cuts: route.length,
    choices, width, height, previousReselect: true, storageUntouched: true,
    graphPaths: graph.routes.length, graphEdges: graph.reachableEdges, sourceUnreachable: graph.unreachable.length });
   await page.close();
  }
 }
 await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2)); console.log(results);
} finally { await browser.close(); }
