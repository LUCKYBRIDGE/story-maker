import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { launchBrowser } from './support/runtime.mjs';
import { doc, tabs, title, seed, openResume } from './support/classroom-fixture.mjs';
const output = process.env.QA_OUTPUT || '/tmp/sheet-import-qa';
const browser = await launchBrowser(output), results = [];
try {
 for (const scenario of ['normal', 'missing-optional', 'denied', 'login']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await seed(page); await openResume(page);
  const requested = [];
  await page.route('https://docs.google.com/spreadsheets/**', route => {
   const name = new URL(route.request().url()).searchParams.get('sheet'); requested.push(name);
   if (scenario === 'denied') return route.fulfill({ status: 403, body: 'Permission denied' });
   if (scenario === 'login') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html>Sign in</html>' });
   const body = scenario === 'missing-optional' && name === '창작 메모' ? undefined : tabs[name];
   return route.fulfill({ status: body === undefined ? 404 : 200, contentType: 'text/csv', body: body ?? '' });
  });
  await page.getByLabel('공개 Google 시트 주소', { exact: true }).fill('https://docs.google.com/spreadsheets/d/classroom_fixture_20260909/edit');
  await page.getByRole('button', { name: '시트에서 이어만들기', exact: true }).click();
  if (['normal', 'missing-optional'].includes(scenario)) {
   const confirm = page.getByRole('button', { name: '편집본으로 열기', exact: true });
   await confirm.waitFor();
   assert.equal(await page.evaluate(() => localStorage.getItem('storygame:draft:v1')), doc, 'preview must not overwrite');
   await confirm.click();
   await page.waitForFunction(title => { const c = JSON.parse(localStorage.getItem('storygame:projects:v1')); return c.projects.find(e => e.draft.project.id === c.selectedProjectId)?.draft.project.title === title; }, title);
   const collection = await page.evaluate(() => JSON.parse(localStorage.getItem('storygame:projects:v1')));
   const saved = collection.projects.find(e => e.draft.project.id === collection.selectedProjectId).draft.project;
   assert.equal(saved.lines[0].text, '시트에서 가져온 문장');
   assert.equal(saved.creativeMemos.length, 0);
   assert.equal(collection.projects.length,2);
   assert.equal(collection.projects[0].draft.project.lines[0].text,'학생이 직접 쓴 문장','different-ID import preserves the original project');
   if (scenario === 'normal') {
    await page.getByRole('button',{name:'창작 관리',exact:true}).click();
    await page.getByLabel('공개 Google 시트 주소',{exact:true}).fill('https://docs.google.com/spreadsheets/d/classroom_fixture_20260909/edit');
    await page.getByRole('button',{name:'시트에서 이어만들기',exact:true}).click();
    page.once('dialog',dialog => dialog.accept());
    await page.getByRole('button',{name:'편집본으로 열기',exact:true}).click();
    await page.locator('.creator-shell').waitFor();
    const updated = await page.evaluate(() => JSON.parse(localStorage.getItem('storygame:projects:v1')));
    assert.equal(updated.projects.length,2,'same-ID import uses the existing slot');
    assert.deepEqual(updated.projects[0].draft.project,collection.projects[0].draft.project);
    const checkpoints = await page.evaluate(() => JSON.parse(localStorage.getItem('storygame:checkpoints:v1')));
    assert.ok(checkpoints.some(item => item.reason === 'before-import' && item.document.project.id === saved.id),'same-ID replacement backs up that work');
   }
   assert.ok(requested.includes('창작 메모'));
  } else {
   await page.getByRole('dialog', { name: '가져오기 검사 결과' }).waitFor();
   await page.getByRole('button', { name: '확인하고 닫기', exact: true }).click();
   for (const key of ['storygame:draft:v1', 'storygame:active:v1'])
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), doc);
  }
  await page.screenshot({ path: `${output}/${scenario}.png`, fullPage: true });
  results.push({ scenario, requested, passed: true, transport: 'intercepted fixture, not Google server' });
  await page.close();
 }
 await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2)); console.log(results);
} finally { await browser.close(); }
