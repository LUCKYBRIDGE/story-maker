import test from 'node:test';
import {execFileSync} from 'node:child_process';
function run(body){execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {rabbitShortStory} from './app/shortstory/shortstory-presets.ts';
import {parseShortStory} from './app/shortstory/shortstory-data.ts';
import {encodeShortStory,decodeShortStory} from './app/shortstory/shortstory-file.ts';
import {saveShortStory,readShortStories,SHORTSTORY_KEY} from './app/shortstory/shortstory-repository.ts';
import {shortStoryPayload,knolStoryPayload} from './app/share/share-payload.ts';
import {createShareHtml} from './app/share/share-html-export.ts';
const p=rabbitShortStory();
${body}`],{stdio:'pipe'});}
test('shortstory work file round-trip and invalid file rejection retain every page',()=>run(`
assert.deepEqual(decodeShortStory(encodeShortStory(p)),p);
for(const mutate of [v=>v.manifest.version=99,v=>v.project.pages[0].backgroundId='https://evil',v=>v.project.pages[0].text=null,v=>v.project.pages[1].id=v.project.pages[0].id,v=>v.project.pages=[]]){const v=JSON.parse(encodeShortStory(p));mutate(v);assert.throws(()=>decodeShortStory(JSON.stringify(v)));}
assert.throws(()=>decodeShortStory('{broken'));assert.throws(()=>decodeShortStory('x'.repeat(10*1024*1024+1)));
`));
test('separate repository rejects collisions, stale writes, corrupt storage and quota failures without data loss',()=>run(`
const map=new Map([['storygame:projects:v1','KEEP']]);let reject=false;
const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(reject)throw Error('quota');map.set(k,v);}};
saveShortStory(storage,p);const before=map.get(SHORTSTORY_KEY);
assert.throws(()=>saveShortStory(storage,{...p,title:'collision'}));assert.equal(map.get(SHORTSTORY_KEY),before);
const second={...p,id:'new'};saveShortStory(storage,second);const beforeQuota=map.get(SHORTSTORY_KEY);reject=true;assert.throws(()=>saveShortStory(storage,{...p,title:'unsaved'},JSON.stringify(p)));assert.equal(map.get(SHORTSTORY_KEY),beforeQuota);reject=false;
const changed={...p,title:'newer'};saveShortStory(storage,changed,JSON.stringify(p));assert.throws(()=>saveShortStory(storage,p,JSON.stringify(p)));assert.equal(readShortStories(storage).length,2);assert.equal(map.get('storygame:projects:v1'),'KEEP');
map.set(SHORTSTORY_KEY,'{broken');assert.throws(()=>saveShortStory(storage,second));assert.equal(map.get(SHORTSTORY_KEY),'{broken');
`));
test('shortstory Excel round-trip keeps text, cover, source and images; malformed rows fail',()=>run(`
import {createShortWorkbook,readShortWorkbook} from './app/shortstory/shortstory-workbook.ts';
p.pages[0].text='여러 줄\\n따옴표 "와" 쉼표, =1+1';const workbook=createShortWorkbook(p);assert.deepEqual(workbook.worksheets.map(s=>s.name),['시작하기','이야기 정보','장면','리소스']);
const result=await readShortWorkbook(await workbook.xlsx.writeBuffer());assert.equal(result.title,p.title);assert.deepEqual(result.cover,p.cover);assert.deepEqual(result.source,p.source);assert.deepEqual(result.pages.map(({id,...p})=>p),p.pages.map(({id,...p})=>p));
workbook.getWorksheet('장면').getCell('A3').value=1;await assert.rejects(()=>readShortWorkbookBuffer(workbook));
async function readShortWorkbookBuffer(w){return readShortWorkbook(await w.xlsx.writeBuffer());}
`));
test('HTML payload includes only reading fields and safely escapes script delimiters',()=>run(`
import {cloneProject,DEFAULT_PROJECT} from './app/story-data.ts';
const n=cloneProject(DEFAULT_PROJECT);n.planning.freeNotes='PRIVATE_NOTE';n.sheetUrl='PRIVATE_URL';n.lines[0].purposeNote='PRIVATE_DIRECTION';
const share=knolStoryPayload(n),encoded=JSON.stringify(share);assert.ok(!encoded.includes('PRIVATE_'));assert.equal(share.pages.length,n.lines.length);
p.title='</script><script>alert(1)</script>';const html=createShareHtml(shortStoryPayload(p));assert.ok(!html.includes(p.title));assert.ok(html.includes('\\\\u003c/script>'));assert.ok(!html.includes('localhost'));assert.ok(html.includes('runtimeVersion'));assert.ok(html.includes('https://luckybridge.github.io/story-maker/story-assets/'));
`));
test('other classic presets are independent valid books with existing artwork',()=>run(`
import {classicShortStory} from './app/shortstory/shortstory-classic-presets.ts';
for(const theme of ['onggojib','seonnyeo']){const project=classicShortStory(theme);assert.equal(parseShortStory(project).pages.length,6);assert.deepEqual(decodeShortStory(encodeShortStory(project)),project);}
`));
test('public sheet CSV preserves quoted multiline text and has the same shortstory schema',()=>run(`
import {parseShortCsv,fetchShortSheet} from './app/shortstory/shortstory-sheet.ts';
assert.deepEqual(parseShortCsv('a,b\\r\\n"hello, world","first\\nsecond"'),[['a','b'],['hello, world','first\\nsecond']]);
await assert.rejects(()=>fetchShortSheet('https://evil.example/spreadsheets/d/123'));
`));
