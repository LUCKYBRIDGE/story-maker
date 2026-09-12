import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
test('browser landing preference is versioned, optional and isolated from student storage', () => {
  const result = JSON.parse(execFileSync(process.execPath, [
    '--disable-warning=ExperimentalWarning', '--experimental-strip-types', '--input-type=module', '-e', `
    import {loadLandingVisit,markLandingVisited,LANDING_VISIT_KEY,LANDING_VERSION} from './app/story-landing-visit.ts';
    const data = new Map([['storygame:projects:v1','student-original']]);
    const storage = () => ({getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)});
    const first = loadLandingVisit(storage);
    markLandingVisited(storage);
    const repeat = loadLandingVisit(storage);
    const saved = JSON.parse(data.get(LANDING_VISIT_KEY));
    data.set(LANDING_VISIT_KEY,JSON.stringify({...saved,landingVersion:LANDING_VERSION-1}));
    const old = loadLandingVisit(storage);
    data.set(LANDING_VISIT_KEY,'{broken');
    const broken = loadLandingVisit(storage);
    const denied = () => { throw new Error('storage denied'); };
    markLandingVisited(denied);
    console.log(JSON.stringify({first,repeat,saved,old,broken,denied:loadLandingVisit(denied),original:data.get('storygame:projects:v1')}));
  `], {encoding:'utf8'}));
  assert.deepEqual(result,{first:false,repeat:true,saved:{visited:true,landingVersion:1},old:false,broken:false,denied:false,original:'student-original'});
});
