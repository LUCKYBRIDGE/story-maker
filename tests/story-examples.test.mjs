import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const source=JSON.parse(readFileSync(new URL('../app/story-examples.generated.json',import.meta.url)));
for(const project of source.projects)test(`pinky example ${project.title}: all links resolve and all reachable routes terminate`,()=>{
 const r=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`import {readFileSync} from 'node:fs';import {findStoryFlowIssues} from './app/story-flow.ts';import {normalizeAndValidateStoryProject} from './app/story-project-validation.ts';const p=JSON.parse(readFileSync(0,'utf8'));console.log(JSON.stringify({flow:findStoryFlowIssues(p),shape:normalizeAndValidateStoryProject(p).issues}));`],{input:JSON.stringify(project),encoding:'utf8'}));
 assert.deepEqual(r,{flow:[],shape:[]});assert.ok(project.lines.length>130);
 const first=project.lines[0],byId=new Map(project.lines.map(l=>[l.id,l]));const visited=new Set(),queue=[first.id];let choices=0,ends=0;
 while(queue.length){const id=queue.pop();if(visited.has(id))continue;visited.add(id);const line=byId.get(id);assert.ok(line);if(line.flow?.type==='choice'){choices++;queue.push(...line.flow.options.map(o=>o.targetLineId));}else if(line.flow?.type==='goto'){if(line.flow.targetLineId===null)ends++;else queue.push(line.flow.targetLineId);}else{queue.push(project.lines[project.lines.indexOf(line)+1].id);}}
 assert.ok(choices>=3);assert.ok(ends>=2);
 assert.equal(project.creativeMemos.length,0);
});
test('source provenance and original openings are pinned',()=>{
 assert.match(source.sourceCommit,/^[a-f0-9]{40}$/);
 assert.match(source.projects[0].lines[0].text,/용궁 대청/);
 assert.equal(source.projects[0].lines.filter(l=>l.flow?.type==='choice').length,3);
 assert.equal(source.projects[1].lines.filter(l=>l.flow?.type==='choice').length,8);
});

// Source snapshot df00a622 retains five disconnected old routes in Onggojib.
// Keep every original sentence; any different disconnected cut fails this baseline.
import { analyzeExample } from './helpers/example-graph.mjs';
for (const [index, project] of source.projects.entries()) test(`example graph coverage: ${project.title}`, () => {
 const graph = analyzeExample(project);
 const oldRoutes = index === 0 ? [] : [['real-route',9],['real-loop-testimony',18],['fake-first-verdict',7],['fake-repeat-verdict',8],['fake-route',66]];
 const expected = oldRoutes.flatMap(([route, count]) => Array.from({length:count}, (_,i) => `review-main-003:${route}:${i}`));
 assert.deepEqual([...graph.unreachable].sort(), expected.sort(), 'new unreachable content requires source review');
 assert.equal(graph.routes.length, index === 0 ? 6 : 16);
 assert.equal(graph.endingRoutes.length, index === 0 ? 3 : 2);
 assert.equal(graph.reachableCuts, index === 0 ? 136 : 345);
 assert.ok(graph.joins.length > 0);
});
test('example graph oracle rejects broken links, cycles and duplicate IDs', () => {
 const p={chapters:[{id:'c',order:1}],lines:[{id:'a',chapterId:'c',order:1,flow:{type:'goto',targetLineId:null}}]};
 assert.throws(()=>analyzeExample({...p,lines:[{...p.lines[0],flow:{type:'goto',targetLineId:'missing'}}]}),/broken target/);
 assert.throws(()=>analyzeExample({...p,lines:[{...p.lines[0],flow:{type:'goto',targetLineId:'a'}}]}),/cycle/);
 assert.throws(()=>analyzeExample({...p,lines:[p.lines[0],p.lines[0]]}),/duplicate cut/);
});
